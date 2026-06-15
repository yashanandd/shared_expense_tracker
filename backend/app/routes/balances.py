from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.calculations.balance_service import (
    get_group_summary
)

router = APIRouter(
    prefix="/balances",
    tags=["Balances"]
)


@router.get("/{group_id}")
def get_balances(
    group_id: int,
    db: Session = Depends(get_db)
):

    return get_group_summary(
        db,
        group_id
    )