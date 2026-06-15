from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.membership import (
    MembershipCreate,
    MembershipLeave,
    MembershipResponse
)

from app.services.membership_service import (
    add_member,
    leave_group
)

router = APIRouter(
    prefix="/memberships",
    tags=["Memberships"]
)

@router.post(
    "/",
    response_model=MembershipResponse
)
def create_membership(
    membership_data: MembershipCreate,
    db: Session = Depends(get_db)
):

    return add_member(
        db,
        membership_data
    )

@router.patch(
    "/{membership_id}/leave",
    response_model=MembershipResponse
)
def leave_membership(
    membership_id: int,
    leave_data: MembershipLeave,
    db: Session = Depends(get_db)
):

    return leave_group(
        db,
        membership_id,
        leave_data.left_at
    )