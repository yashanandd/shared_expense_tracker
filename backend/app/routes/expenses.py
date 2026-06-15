from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.expense import (
    ExpenseCreate,
    ExpenseResponse
)

from app.services.expense_service import (
    create_expense
)
from app.models.expenses import Expense

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post(
    "/",
    response_model=ExpenseResponse
)
def create_expense_route(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db)
):

    return create_expense(
        db,
        expense_data
    )

@router.get("")
def get_expenses(
    db: Session = Depends(get_db)
):
    return db.query(Expense).all()