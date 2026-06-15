from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.services.dashboard_service import (
    get_dashboard
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/{group_id}")
def dashboard(
    group_id: int,
    db: Session = Depends(get_db)
):

    return get_dashboard(
        db,
        group_id
    )