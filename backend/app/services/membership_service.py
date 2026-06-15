from fastapi import HTTPException

from app.models.memberships import Membership
from app.models.users import User
from app.models.grouped import Group

def add_member(
    db,
    membership_data
):
    user = db.query(User).filter(
    User.id == membership_data.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    group = db.query(Group).filter(
    Group.id == membership_data.group_id
    ).first()

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    membership = Membership(
        group_id=membership_data.group_id,
        user_id=membership_data.user_id,
        joined_at=membership_data.joined_at
    )

    existing = db.query(
    Membership
    ).filter(
        Membership.group_id ==
        membership_data.group_id,

        Membership.user_id ==
        membership_data.user_id,

        Membership.left_at == None
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="User is already a member of this group"
        )

    db.add(membership)

    db.commit()

    db.refresh(membership)

    return membership

def leave_group(
    db,
    membership_id,
    leave_date
):

    membership = db.query(
        Membership
    ).filter(
        Membership.id == membership_id
    ).first()

    if not membership:
        raise HTTPException(
            status_code=404,
            detail="Membership not found"
        )

    if membership.left_at:
        raise HTTPException(
            status_code=400,
            detail="Member already left group"
        )

    if leave_date < membership.joined_at:
        raise HTTPException(
            status_code=400,
            detail="Leave date cannot be before join date"
        )

    membership.left_at = leave_date

    db.commit()

    db.refresh(membership)

    return membership