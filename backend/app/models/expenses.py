from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import Date
from sqlalchemy import DECIMAL
from sqlalchemy.orm import relationship
from app.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True)

    group_id = Column(
        Integer,
        ForeignKey("grouped.id"),
        nullable=False
    )

    title = Column(String(255), nullable=False)

    amount = Column(
        DECIMAL(12, 2),
        nullable=False
    )

    currency = Column(
        String(10),
        nullable=False
    )

    paid_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    expense_date = Column(
        Date,
        nullable=False
    )

    split_type = Column(
        String(50),
        nullable=False
    )

    group = relationship(
    "Group",
    back_populates="expenses"
    )

    payer = relationship(
        "User",
        back_populates="expenses_paid"
    )

    splits = relationship(
        "ExpenseSplit",
        back_populates="expense"
    )