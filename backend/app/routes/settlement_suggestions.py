from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.services.settlement_suggestion_service import (
    get_settlement_suggestions
)

router = APIRouter(
    prefix="/settlement-suggestions",
    tags=["Settlement Suggestions"]
)


@router.get("/{group_id}")
def settlement_suggestions(
    group_id: int,
    db: Session = Depends(get_db)
):

    return get_settlement_suggestions(
        db,
        group_id
    )