from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.expenses import Expense
from app.models.expense_splits import ExpenseSplit
from app.models.grouped import Group
from app.models.users import User
from app.models.memberships import Membership

def create_expense(db: Session, data):

    group = db.query(Group).filter(
        Group.id == data.group_id
    ).first()

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    payer = db.query(User).filter(
        User.id == data.paid_by
    ).first()

    if not payer:
        raise HTTPException(
            status_code=404,
            detail="Payer not found"
        )

    valid_split_types = [
        "equal",
        "exact",
        "percentage",
        "weighted"
    ]

    if data.split_type not in valid_split_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid split type"
        )

    for split in data.splits:

        membership = db.query(
            Membership
        ).filter(
            Membership.group_id == data.group_id,
            Membership.user_id == split.user_id
        ).first()

        if not membership:
            raise HTTPException(
                status_code=400,
                detail=f"User {split.user_id} is not a member of the group"
            )

        if data.expense_date < membership.joined_at:
            raise HTTPException(
                status_code=400,
                detail=f"User {split.user_id} had not joined the group yet"
            )

        if (
            membership.left_at
            and
            data.expense_date > membership.left_at
            ):
                raise HTTPException(
                    status_code=400,
                    detail=f"User {split.user_id} had already left the group"
                )

    expense = Expense(
        group_id=data.group_id,
        title=data.title,
        amount=data.amount,
        currency=data.currency,
        paid_by=data.paid_by,
        expense_date=data.expense_date,
        split_type=data.split_type
    )

    db.add(expense)

    db.flush()

    if data.split_type == "equal":

        participant_count = len(data.splits)

        if participant_count == 0:
            raise HTTPException(
                status_code=400,
                detail="No participants provided"
            )

        base_share = round(
            data.amount / participant_count,
            2
        )

        remaining = data.amount

        for index, split in enumerate(data.splits):

            if index == participant_count - 1:
                share_amount = round(
                    remaining,
                    2
                )
            else:
                share_amount = base_share
                remaining -= share_amount

            expense_split = ExpenseSplit(
                expense_id=expense.id,
                user_id=split.user_id,
                share_amount=share_amount
            )

            db.add(expense_split)

    elif data.split_type == "exact":

        total = round(
            sum(
                split.value
                for split in data.splits
            ),
            2
        )

        if total != round(data.amount, 2):
            raise HTTPException(
                status_code=400,
                detail="Exact split total must equal expense amount"
            )

        for split in data.splits:

            expense_split = ExpenseSplit(
                expense_id=expense.id,
                user_id=split.user_id,
                share_amount=split.value
            )

            db.add(expense_split)

    elif data.split_type == "percentage":

        percentage_total = round(
            sum(
                split.value
                for split in data.splits
            ),
            2
        )

        if percentage_total != 100:
            raise HTTPException(
                status_code=400,
                detail="Percentages must total 100"
            )

        for split in data.splits:

            share_amount = round(
                (
                    data.amount *
                    split.value
                ) / 100,
                2
            )

            expense_split = ExpenseSplit(
                expense_id=expense.id,
                user_id=split.user_id,
                share_amount=share_amount,
                percentage=split.value
            )

            db.add(expense_split)
    elif data.split_type == "weighted":
        total_weight = sum(
            split.value
            for split in data.splits
        )
        if total_weight <= 0:
            raise HTTPException(
                status_code=400,
                detail="Total weight must be greater than zero"
            )
        remaining = data.amount
        for index, split in enumerate(
            data.splits
        ):
            if index == len(data.splits) - 1:
                share_amount = round(remaining,2)
            else:
                share_amount = round((data.amount * split.value) / total_weight,2)

                remaining -= share_amount
            expense_split = ExpenseSplit(
                expense_id=expense.id,
                user_id=split.user_id,
                share_amount=share_amount
            )
            db.add(expense_split)
    db.commit()

    db.refresh(expense)
    return expense
