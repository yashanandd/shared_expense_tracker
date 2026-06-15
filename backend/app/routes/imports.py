from fastapi import APIRouter
from fastapi import Depends
from fastapi import UploadFile
from fastapi import File
from sqlalchemy.orm import Session

from app.database import get_db

from app.services.import_service import (
    get_batch_details,
    get_import_batches,
    import_csv
)

router = APIRouter(
    prefix="/imports",
    tags=["Imports"]
)

from app.services.auth_deps import get_current_user_optional
from app.models.users import User

@router.post("/csv")
def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):

    return import_csv(
        db,
        file,
        current_user
    )

@router.get("")
def get_batches(
    db: Session = Depends(get_db)
):

    return get_import_batches(
        db
    )

@router.get("/{batch_id}")
def batch_details(
    batch_id: int,
    db: Session = Depends(get_db)
):

    return get_batch_details(
        db,
        batch_id
    )