from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.settlement import (
    SettlementCreate,
    SettlementResponse
)

from app.services.settlement_service import (
    create_settlement
)

router = APIRouter(
    prefix="/settlements",
    tags=["Settlements"]
)


@router.post(
    "/",
    response_model=SettlementResponse
)
def create_settlement_route(
    settlement_data: SettlementCreate,
    db: Session = Depends(get_db)
):

    return create_settlement(
        db,
        settlement_data
    )

from app.models.settlements import Settlement

@router.get("")
def get_settlements(
    group_id: int | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Settlement)
    if group_id is not None:
        query = query.filter(Settlement.group_id == group_id)
    return query.all()