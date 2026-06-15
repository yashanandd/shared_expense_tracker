from fastapi import HTTPException

from app.models.anomalies import Anomaly

def resolve_anomaly(
    db,
    anomaly_id
):

    anomaly = db.query(
        Anomaly
    ).filter(
        Anomaly.id == anomaly_id
    ).first()

    if not anomaly:
        raise HTTPException(
            status_code=404,
            detail="Anomaly not found"
        )

    anomaly.resolved = True

    db.commit()

    db.refresh(anomaly)

    return anomaly