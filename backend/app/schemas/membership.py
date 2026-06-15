from pydantic import BaseModel
from datetime import date


class MembershipCreate(BaseModel):

    group_id: int

    user_id: int

    joined_at: date

class MembershipLeave(BaseModel):

    left_at: date

class MembershipResponse(BaseModel):

    id: int

    group_id: int

    user_id: int

    joined_at: date

    left_at: date | None

    model_config = {
        "from_attributes": True
    }