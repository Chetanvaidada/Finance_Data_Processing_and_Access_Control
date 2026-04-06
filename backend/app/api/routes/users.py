from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.schemas.user import UserCreateByAdmin, UserOut, UserUpdate
from app.services.user_service import create_user_by_admin, get_all_users, update_user

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/", response_model=list[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """List all users. Admin only."""
    return get_all_users(db, skip=skip, limit=limit)


@router.post("/", response_model=UserOut, status_code=201)
def create_user_admin(
    user_data: UserCreateByAdmin,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Create a new user with a specified role. Admin only."""
    return create_user_by_admin(db, user_data)


@router.patch("/{user_id}", response_model=UserOut)
def update_user_admin(
    user_id: str,
    update_data: UserUpdate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Update a user's role, name, or active status. Admin only."""
    return update_user(db, user_id, update_data)
