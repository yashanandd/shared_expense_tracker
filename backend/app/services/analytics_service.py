from sqlalchemy import func

from app.models.expenses import Expense
from app.models.users import User


def get_analytics(
    db,
    group_id
):

    expenses = db.query(
        Expense
    ).filter(
        Expense.group_id == group_id
    ).all()

    total_amount = sum(
        expense.amount
        for expense in expenses
    )

    total_expenses = len(
        expenses
    )

    spending = {}

    for expense in expenses:

        user = db.query(
            User
        ).filter(
            User.id == expense.paid_by
        ).first()

        if not user:
            continue

        if user.name not in spending:
            spending[user.name] = 0

        spending[user.name] += expense.amount

    top_spender = ""

    highest = 0

    for name, amount in spending.items():

        if amount > highest:

            highest = amount

            top_spender = name

    user_spending = []

    for name, amount in spending.items():

        user_spending.append(
            {
                "name": name,
                "amount": amount
            }
        )

    return {
        "top_spender": top_spender,
        "amount": total_amount,
        "total_expenses": total_expenses,
        "user_spending": user_spending
    }