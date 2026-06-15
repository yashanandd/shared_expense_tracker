from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy import Boolean
from sqlalchemy import Enum
from sqlalchemy import JSON

from sqlalchemy.sql import func

from app.database import Base


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True)

    import_batch_id = Column(
        Integer,
        ForeignKey("import_batches.id"),
        nullable=False
    )

    csv_row_number = Column(
        Integer,
        nullable=False
    )

    anomaly_type = Column(
        String(100),
        nullable=False
    )

    severity = Column(
        Enum(
            "info",
            "warning",
            "error",
            name="anomaly_severity"
        )
    )

    original_data = Column(JSON)

    action_taken = Column(String(255))

    resolved = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )