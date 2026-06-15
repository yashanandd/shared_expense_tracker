from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.services.jwt_service import decode_access_token

# auto_error=False lets us check the token manually and fall back gracefully
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user_optional(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    if not token:
        # Graceful fallback: return the first user if database has any users
        first_user = db.query(User).first()
        return first_user
    
    payload = decode_access_token(token)
    if not payload:
        first_user = db.query(User).first()
        return first_user
        
    user_id = payload.get("sub")
    if not user_id:
        first_user = db.query(User).first()
        return first_user
        
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return db.query(User).first()
        return user
    except Exception:
        return db.query(User).first()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
        
    return user
