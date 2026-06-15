from app.models.expenses import Expense
from app.models.memberships import Membership
from app.models.settlements import Settlement


def get_dashboard(
    db,
    group_id
):

    total_expenses = db.query(
        Expense
    ).filter(
        Expense.group_id == group_id
    ).count()

    total_amount = sum(
        expense.amount
        for expense in db.query(
            Expense
        ).filter(
            Expense.group_id == group_id
        ).all()
    )

    active_members = db.query(
        Membership
    ).filter(
        Membership.group_id == group_id,
        Membership.left_at == None
    ).count()

    total_settlements = db.query(
        Settlement
    ).filter(
        Settlement.group_id == group_id
    ).count()

    return {
        "group_id": group_id,
        "total_expenses": total_expenses,
        "total_amount": total_amount,
        "active_members": active_members,
        "settlements": total_settlements
    }