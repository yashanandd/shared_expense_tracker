from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Date
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Membership(Base):
    __tablename__ = "memberships"

    id = Column(Integer, primary_key=True)

    group_id = Column(
        Integer,
        ForeignKey("grouped.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    joined_at = Column(Date, nullable=False)

    left_at = Column(Date)

    user = relationship(
    "User",
    back_populates="memberships"
    )

    group = relationship(
        "Group",
        back_populates="memberships"
    )