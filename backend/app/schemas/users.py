from pydantic import BaseModel
from datetime import datetime
from pydantic import EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    model_config = {
        "from_attributes": True
    }