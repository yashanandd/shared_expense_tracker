from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.users import UserCreate
from app.schemas.users import UserResponse
from app.schemas.users import UserLogin
from app.schemas.users import Token
from app.services.auth_service import create_user
from app.services.auth_service import login_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    return create_user(
        db,
        user
    )

@router.post(
    "/login",
    response_model=Token
)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):

    return login_user(
        db,
        login_data
    )

from app.services.auth_deps import get_current_user
from app.models.users import User

@router.get(
    "/profile",
    response_model=UserResponse
)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.get(
    "/users",
    response_model=list[UserResponse]
)
def get_users(
    db: Session = Depends(get_db)
):
    return db.query(User).all()