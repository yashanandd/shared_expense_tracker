from app.calculations.balance_service import (
    get_group_summary
)

from app.models.users import User


def get_settlement_suggestions(
    db,
    group_id
):

    summary = get_group_summary(
        db,
        group_id
    )

    balances = summary["balances"]

    creditors = []
    debtors = []

    for user_id, balance in balances.items():

        if balance > 0:

            creditors.append(
                {
                    "user_id": user_id,
                    "amount": round(balance, 2)
                }
            )

        elif balance < 0:

            debtors.append(
                {
                    "user_id": user_id,
                    "amount": round(
                        abs(balance),
                        2
                    )
                }
            )

    suggestions = []

    i = 0
    j = 0

    while i < len(debtors) and j < len(creditors):

        debtor = debtors[i]
        creditor = creditors[j]

        amount = min(
            debtor["amount"],
            creditor["amount"]
        )

        from_user = db.query(User).filter(
            User.id == debtor["user_id"]
        ).first()

        to_user = db.query(User).filter(
            User.id == creditor["user_id"]
        ).first()

        suggestions.append(
            {
                "from": from_user.name,
                "to": to_user.name,
                "amount": round(
                    amount,
                    2
                )
            }
        )

        debtor["amount"] -= amount
        creditor["amount"] -= amount

        if debtor["amount"] == 0:
            i += 1

        if creditor["amount"] == 0:
            j += 1

    return suggestions