from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy import Enum

from sqlalchemy.sql import func

from app.database import Base


class ImportBatch(Base):
    __tablename__ = "import_batches"

    id = Column(Integer, primary_key=True)

    filename = Column(
        String(255)
    )

    imported_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    status = Column(
        Enum(
            "processing",
            "completed",
            "failed",
            name="import_status"
        )
    )

    total_rows = Column(Integer, default=0)

    imported_rows = Column(Integer, default=0)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )