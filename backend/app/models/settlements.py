from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy import DECIMAL
from sqlalchemy import Date
from sqlalchemy import Text
from sqlalchemy.orm import relationship
from app.database import Base


class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True)

    group_id = Column(
        Integer,
        ForeignKey("grouped.id"),
        nullable=False
    )

    payer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    amount = Column(
        DECIMAL(12, 2),
        nullable=False
    )

    settlement_date = Column(
        Date,
        nullable=False
    )

    notes = Column(Text)

    group = relationship(
    "Group",
    back_populates="settlements"
    )