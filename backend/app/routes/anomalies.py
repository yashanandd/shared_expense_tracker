from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.services.anomaly_service import (
    resolve_anomaly
)

router = APIRouter(
    prefix="/anomalies",
    tags=["Anomalies"]
)


@router.patch("/{anomaly_id}/resolve")
def resolve_anomaly_route(
    anomaly_id: int,
    db: Session = Depends(get_db)
):

    return resolve_anomaly(
        db,
        anomaly_id
    )