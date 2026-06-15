from pydantic import BaseModel
from datetime import date


class SettlementCreate(BaseModel):

    group_id: int

    payer_id: int

    receiver_id: int

    amount: float

    settlement_date: date


class SettlementResponse(BaseModel):

    id: int

    group_id: int

    payer_id: int

    receiver_id: int

    amount: float

    settlement_date: date

    model_config = {
        "from_attributes": True
    }