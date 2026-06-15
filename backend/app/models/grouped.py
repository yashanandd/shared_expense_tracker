from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Group(Base):
    __tablename__ = "grouped"

    id = Column(Integer, primary_key=True)

    name = Column(String(100), nullable=False)

    description = Column(Text)

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    memberships = relationship(
    "Membership",
    back_populates="group"
    )

    expenses = relationship(
        "Expense",
        back_populates="group"
    )

    settlements = relationship(
        "Settlement",
        back_populates="group"
    )