from pydantic import BaseModel
from datetime import date

class SplitData(BaseModel):

    user_id: int

    value: float

class ExpenseCreate(BaseModel):

    group_id: int

    title: str

    amount: float

    currency: str

    paid_by: int

    expense_date: date

    split_type: str

    splits: list[SplitData]

class ExpenseResponse(BaseModel):

    id: int

    group_id: int

    title: str

    amount: float

    currency: str

    paid_by: int

    expense_date: date

    split_type: str

    model_config = {
        "from_attributes": True
    }