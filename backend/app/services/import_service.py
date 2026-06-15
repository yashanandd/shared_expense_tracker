import csv
import io
from app.models.users import User
from app.models.expenses import Expense
from app.models.anomalies import Anomaly
from app.models.grouped import Group
from app.models.memberships import Membership
from datetime import datetime, date
from types import SimpleNamespace
from app.models.import_batches import ImportBatch
from app.services.expense_service import create_expense
from app.services.settlement_service import create_settlement
from fastapi import HTTPException

def import_csv(
    db,
    file,
    current_user=None
):
    content = file.file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    rows = list(reader)

    # Dynamically resolve user_id for imported_by, avoiding FK violation
    user_id = current_user.id if current_user else None
    if not user_id:
        first_user = db.query(User).first()
        user_id = first_user.id if first_user else None

    batch = ImportBatch(
        filename=file.filename,
        imported_by=user_id,
        status="processing",
        total_rows=len(rows),
        imported_rows=0
    )

    db.add(batch)
    db.commit()
    db.refresh(batch)

    imported_count = 0
    for row_number, row in enumerate(rows, start=2):
        try:
            result = process_row(
                db,
                row,
                batch.id,
                row_number
            )
            if result:
                imported_count += 1
        except Exception as e:
            db.rollback()  # Rollback transaction on individual row failure
            log_anomaly(
                db,
                batch.id,
                row_number,
                "import_error",
                "error",
                row,
                str(e)
            )

    batch.imported_rows = imported_count
    batch.status = "completed"
    db.commit()

    anomalies = db.query(Anomaly).filter(Anomaly.import_batch_id == batch.id).all()

    return {
        "batch_id": batch.id,
        "filename": file.filename,
        "total_rows": len(rows),
        "imported_rows": imported_count,
        "failed_rows": len(rows) - imported_count,
        "status": "completed",
        "anomalies": anomalies
    }

def normalize_row(row):
    amount = str(row.get("amount", "0")).replace(",", "").strip()
    raw_date = str(row.get("date", "")).strip()

    parsed_date = None
    date_formats = ["%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"]
    for date_format in date_formats:
        try:
            parsed_date = datetime.strptime(raw_date, date_format).date()
            break
        except ValueError:
            continue

    if not parsed_date:
        parsed_date = datetime.now().date()

    # Map different split types to standard ones supported by the backend
    st = str(row.get("split_type", "equal")).strip().lower()
    if st in ["share", "weight", "weighted"]:
        st = "weighted"
    elif st not in ["equal", "exact", "percentage", "weighted"]:
        st = "equal"

    return {
        "date": parsed_date,
        "description": str(row.get("description", "")).strip(),
        "paid_by": str(row.get("paid_by", "")).strip().title(),
        "amount": round(float(amount or 0), 2),
        "currency": str(row.get("currency", "USD")).strip().upper(),
        "split_type": st,
        "split_with": str(row.get("split_with", "")).strip(),
        "split_details": str(row.get("split_details", "")).strip(),
        "notes": str(row.get("notes", "")).strip()
    }

def is_settlement(row):
    keywords = ["settlement", "transfer", "paid back"]
    text = row.get("description", "").lower()
    return any(keyword in text for keyword in keywords)

def get_user_id(db, name):
    if not name:
        return None
    aliases = {
        "aisha": "aisha",
        "ai sha": "aisha",
        "priya": "priya",
        "priya s": "priya",
        "rohan": "rohan",
        "meera": "meera",
        "sam": "sam",
        "dev": "dev"
    }
    normalized_name = aliases.get(name.lower(), name.lower()).strip()
    if not normalized_name:
        return None

    user = db.query(User).filter(User.name.ilike(normalized_name)).first()
    if not user:
        # Auto-register missing user
        from app.services.auth_service import hash_password
        user = User(
            name=name.strip(),
            email=f"{normalized_name.replace(' ', '_')}@example.com",
            password_hash=hash_password("default123")
        )
        db.add(user)
        db.flush()
    return user.id

def log_anomaly(db, batch_id, row_number, anomaly_type, severity, original_data, action):
    # Ensure original_data is JSON-serializable
    if isinstance(original_data, dict):
        cleaned_data = {}
        for k, v in original_data.items():
            if hasattr(v, "isoformat"):
                cleaned_data[k] = v.isoformat()
            else:
                cleaned_data[k] = str(v)
        original_data = cleaned_data
    elif not isinstance(original_data, (list, dict)):
        original_data = {"raw": str(original_data)}

    anomaly = Anomaly(
        import_batch_id=batch_id,
        csv_row_number=row_number,
        anomaly_type=anomaly_type,
        severity=severity,
        original_data=original_data,
        action_taken=action
    )
    db.add(anomaly)
    db.commit()

def is_duplicate(db, title, amount):
    existing = db.query(Expense).filter(
        Expense.title == title,
        Expense.amount == amount
    ).first()
    return existing is not None

def build_splits(db, split_type, split_with, split_details):
    splits = []
    if not split_with:
        return splits

    # Split participants by semicolon first, then fallback to comma
    if ";" in split_with:
        names = [n.strip() for n in split_with.split(";")]
    else:
        names = [n.strip() for n in split_with.split(",")]

    # Parse details if present (e.g. Aisha 1; Rohan 2; Priya 1; Dev 2)
    details = {}
    if split_details:
        import re
        parts = split_details.split(";") if ";" in split_details else split_details.split(",")
        for part in parts:
            part = part.strip()
            if not part:
                continue
            # Match name and number (e.g. "Aisha 1" or "Aisha: 1" or "Aisha = 1")
            match = re.match(r"^(.*?)\s*[:=\s]\s*([0-9]+(?:\.[0-9]+)?)$", part)
            if match:
                name = match.group(1).strip().lower()
                val = float(match.group(2))
                details[name] = val
            else:
                # Fallback: space separated
                tokens = part.split()
                if len(tokens) >= 2:
                    try:
                        val = float(tokens[-1])
                        name = " ".join(tokens[:-1]).strip().lower()
                        details[name] = val
                    except ValueError:
                        pass

    for name in names:
        if not name:
            continue
        user_id = get_user_id(db, name)
        if user_id:
            # Match value from parsed details
            val = details.get(name.lower(), None)
            if val is None:
                # Try partial matching/alias resolution
                for k, v in details.items():
                    if k in name.lower() or name.lower() in k:
                        val = v
                        break
            if val is None:
                # Default values for different split types
                if split_type == "weighted":
                    val = 1.0
                elif split_type == "percentage":
                    val = 100.0 / len(names)
                elif split_type == "exact":
                    val = 0.0
                else:
                    val = 0.0
            
            splits.append(
                SimpleNamespace(
                    user_id=user_id,
                    value=val
                )
            )
    return splits

def process_row(db, raw_row, batch_id, row_number):
    row = normalize_row(raw_row)

    if is_duplicate(db, row["description"], row["amount"]):
        log_anomaly(db, batch_id, row_number, "duplicate_expense", "warning", raw_row, "skipped")
        return False

    payer_id = get_user_id(db, row["paid_by"])
    if not payer_id:
        log_anomaly(db, batch_id, row_number, "unknown_payer", "error", raw_row, "skipped")
        return False

    splits = build_splits(db, row["split_type"], row["split_with"], row["split_details"])

    # Resolve group dynamically instead of hardcoding 3
    first_group = db.query(Group).first()
    if not first_group:
        from app.services.group_service import create_group
        from app.schemas.group import GroupCreate
        default_group_data = GroupCreate(name="Imported Expenses", description="Default group for imported expenses")
        first_group = create_group(db, default_group_data, payer_id)
    group_id = first_group.id

    # Auto-create group memberships for payer and split participants if they don't exist yet
    payer_membership = db.query(Membership).filter(
        Membership.group_id == group_id,
        Membership.user_id == payer_id
    ).first()
    if not payer_membership:
        payer_membership = Membership(
            group_id=group_id,
            user_id=payer_id,
            joined_at=row["date"]
        )
        db.add(payer_membership)
        db.flush()

    for split in splits:
        split_membership = db.query(Membership).filter(
            Membership.group_id == group_id,
            Membership.user_id == split.user_id
        ).first()
        if not split_membership:
            split_membership = Membership(
                group_id=group_id,
                user_id=split.user_id,
                joined_at=row["date"]
            )
            db.add(split_membership)
            db.flush()

    expense_data = SimpleNamespace(
        group_id=group_id,
        title=row["description"],
        amount=row["amount"],
        currency=row["currency"],
        paid_by=payer_id,
        expense_date=row["date"],
        split_type=row["split_type"],
        splits=splits
    )

    create_expense(db, expense_data)
    return True

def get_import_batches(db):
    batches = db.query(ImportBatch).all()
    results = []
    for b in batches:
        anomaly_count = db.query(Anomaly).filter(Anomaly.import_batch_id == b.id).count()
        results.append({
            "id": b.id,
            "filename": b.filename,
            "imported_by": b.imported_by,
            "status": b.status,
            "total_rows": b.total_rows,
            "imported_rows": b.imported_rows,
            "created_at": b.created_at,
            "anomaly_count": anomaly_count
        })
    return results

def get_batch_details(db, batch_id):
    batch = db.query(ImportBatch).filter(ImportBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    anomalies = db.query(Anomaly).filter(Anomaly.import_batch_id == batch_id).all()
    return {
        "batch": batch,
        "anomalies": anomalies
    }