from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy import DECIMAL
from sqlalchemy.orm import relationship
from app.database import Base


class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(Integer, primary_key=True)

    expense_id = Column(
        Integer,
        ForeignKey("expenses.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    share_amount = Column(
        "amount",
        DECIMAL(12, 2),
        nullable=False
    )

    percentage = Column(
        DECIMAL(5, 2),
        nullable=True
    )

    expense = relationship(
    "Expense",
    back_populates="splits"
    )

    user = relationship(
        "User",
        back_populates="expense_splits"
    )