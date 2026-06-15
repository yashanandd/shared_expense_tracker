from app.models.grouped import Group
from fastapi import APIRouter
from fastapi import Depends, HTTPException

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db

from app.schemas.group import (
    GroupCreate,
    GroupResponse
)

from app.services.group_service import (
    create_group
)

from app.services.auth_deps import get_current_user_optional
from app.models.users import User
from app.models.expenses import Expense
from app.models.settlements import Settlement
from app.models.memberships import Membership
from app.services.settlement_suggestion_service import get_settlement_suggestions

router = APIRouter(
    prefix="/groups",
    tags=["Groups"]
)

@router.post(
    "",
    response_model=GroupResponse
)
def create_new_group(
    group_data: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    # If no authenticated user is found, fall back to default user ID 1
    creator_id = current_user.id if current_user else 1

    return create_group(
        db,
        group_data,
        creator_id
    )

@router.get("")
def get_groups(
    db: Session = Depends(get_db)
):
    return db.query(Group).all()

@router.get("/{group_id}")
def get_group_details(
    group_id: int,
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # We want to return the group info, members, expenses, and settlements
    members = []
    for m in group.memberships:
        if not m.user:
            continue
        # Calculate total paid by this member in this group
        total_paid = db.query(func.sum(Expense.amount)).filter(
            Expense.group_id == group_id,
            Expense.paid_by == m.user_id
        ).scalar() or 0
        
        # Calculate count of expenses paid by this member in this group
        expenses_count = db.query(Expense).filter(
            Expense.group_id == group_id,
            Expense.paid_by == m.user_id
        ).count()
        
        members.append({
            "id": m.user.id,
            "name": m.user.name,
            "email": m.user.email,
            "totalPaid": float(total_paid),
            "expensesCount": expenses_count
        })
        
    # Get expenses
    expenses = []
    for e in group.expenses:
        payer_name = e.payer.name if e.payer else "Unknown"
        expenses.append({
            "id": e.id,
            "description": e.title,
            "amount": float(e.amount),
            "currency": e.currency,
            "paidBy": payer_name,
            "date": e.expense_date.isoformat() if e.expense_date else None,
            "category": "housing" if "rent" in e.title.lower() else "utilities" if "bill" in e.title.lower() else "food" if "grocery" in e.title.lower() or "dining" in e.title.lower() or "lunch" in e.title.lower() or "food" in e.title.lower() else "travel" if "trip" in e.title.lower() or "gas" in e.title.lower() or "hotel" in e.title.lower() else "utilities" if "water" in e.title.lower() or "electric" in e.title.lower() else "shopping" if "gift" in e.title.lower() or "supplies" in e.title.lower() else "other",
            "split": e.split_type
        })
        
    # Get settlements (both completed and pending/suggestions)
    settlements = []
    db_settlements = db.query(Settlement).filter(Settlement.group_id == group_id).all()
    for s in db_settlements:
        payer = db.query(User).filter(User.id == s.payer_id).first()
        receiver = db.query(User).filter(User.id == s.receiver_id).first()
        settlements.append({
            "from": payer.name if payer else "Unknown",
            "to": receiver.name if receiver else "Unknown",
            "amount": float(s.amount),
            "status": "settled"
        })
        
    # Get settlement suggestions (pending)
    try:
        suggestions = get_settlement_suggestions(db, group_id)
        for sug in suggestions:
            settlements.append({
                "from": sug["from"],
                "to": sug["to"],
                "amount": float(sug["amount"]),
                "status": "pending"
            })
    except Exception:
        # Fall back gracefully if suggestions logic has an issue
        pass
        
    # Calculate total expenses amount
    total_expenses_sum = sum(e["amount"] for e in expenses)
    
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "category": "housing" if "room" in group.name.lower() else "travel" if "trip" in group.name.lower() or "getaway" in group.name.lower() else "food" if "lunch" in group.name.lower() or "dining" in group.name.lower() else "utilities" if "utilities" in group.name.lower() else "shopping" if "gift" in group.name.lower() else "other",
        "memberCount": len(members),
        "totalExpenses": total_expenses_sum,
        "createdAt": group.created_at.date().isoformat() if group.created_at else None,
        "members": members,
        "expenses": expenses,
        "settlements": settlements
    }

@router.put("/{group_id}")
def update_group_route(
    group_id: int,
    group_data: GroupCreate,
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    group.name = group_data.name
    group.description = group_data.description
    db.commit()
    db.refresh(group)
    return group

@router.delete("/{group_id}")
def delete_group_route(
    group_id: int,
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    # Also delete associated memberships/expenses to prevent foreign key errors
    db.query(Membership).filter(Membership.group_id == group_id).delete()
    db.query(Expense).filter(Expense.group_id == group_id).delete()
    db.query(Settlement).filter(Settlement.group_id == group_id).delete()
    db.delete(group)
    db.commit()
    return {"message": "Group deleted", "id": group_id}
