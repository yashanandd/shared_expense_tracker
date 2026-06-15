from fastapi import HTTPException

from app.models.settlements import Settlement
from app.models.users import User
from app.models.grouped import Group


def create_settlement(
    db,
    data
):

    group = db.query(Group).filter(
        Group.id == data.group_id
    ).first()

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    payer = db.query(User).filter(
        User.id == data.payer_id
    ).first()

    if not payer:
        raise HTTPException(
            status_code=404,
            detail="Payer not found"
        )

    receiver = db.query(User).filter(
        User.id == data.receiver_id
    ).first()

    if not receiver:
        raise HTTPException(
            status_code=404,
            detail="Receiver not found"
        )

    settlement = Settlement(
        group_id=data.group_id,
        payer_id=data.payer_id,
        receiver_id=data.receiver_id,
        amount=data.amount,
        settlement_date=data.settlement_date
    )

    db.add(settlement)

    db.commit()

    db.refresh(settlement)

    return settlement