from pydantic import BaseModel
from typing import Optional


class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class GroupResponse(BaseModel):

    id: int

    name: str

    description: str | None = None

    created_by: int

    model_config = {
        "from_attributes": True
    }