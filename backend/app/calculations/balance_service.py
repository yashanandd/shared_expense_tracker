from collections import defaultdict

from app.models.expenses import Expense
from app.models.expense_splits import ExpenseSplit
from app.models.settlements import Settlement


def calculate_group_balances(
    db,
    group_id
):

    balances = defaultdict(float)

    expenses = db.query(
        Expense
    ).filter(
        Expense.group_id == group_id
    ).all()

    for expense in expenses:

        balances[
            expense.paid_by
        ] += float(
            expense.amount
        )

        splits = db.query(
            ExpenseSplit
        ).filter(
            ExpenseSplit.expense_id == expense.id
        ).all()

        for split in splits:

            balances[
                split.user_id
            ] -= float(
                split.share_amount
            )

    settlements = db.query(
        Settlement
    ).filter(
        Settlement.group_id == group_id
    ).all()

    for settlement in settlements:

        balances[
            settlement.payer_id
        ] += float(
            settlement.amount
        )

        balances[
            settlement.receiver_id
        ] -= float(
            settlement.amount
        )

    return dict(balances)


def simplify_debts(
    balances
):

    creditors = []

    debtors = []

    for user_id, balance in balances.items():

        balance = round(
            balance,
            2
        )

        if balance > 0:

            creditors.append(
                [user_id, balance]
            )

        elif balance < 0:

            debtors.append(
                [user_id, abs(balance)]
            )

    transactions = []

    i = 0

    j = 0

    while (
        i < len(debtors)
        and
        j < len(creditors)
    ):

        debtor_id, debt = debtors[i]

        creditor_id, credit = creditors[j]

        amount = min(
            debt,
            credit
        )

        transactions.append(
            {
                "from_user_id": debtor_id,
                "to_user_id": creditor_id,
                "amount": round(
                    amount,
                    2
                )
            }
        )

        debt -= amount

        credit -= amount

        if debt == 0:
            i += 1
        else:
            debtors[i][1] = debt

        if credit == 0:
            j += 1
        else:
            creditors[j][1] = credit

    return transactions


def get_group_summary(
    db,
    group_id
):

    balances = calculate_group_balances(
        db,
        group_id
    )

    transactions = simplify_debts(
        balances
    )

    return {
        "balances": balances,
        "settlements": transactions
    }