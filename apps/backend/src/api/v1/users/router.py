from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import ValidationException
from src.core.security import get_password_hash, verify_password
from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.user import User
from src.repositories.user_repository import UserRepository
from src.schemas.response import APIResponse
from src.schemas.user import UserPasswordChange, UserProfileUpdate, UserResponse

router = APIRouter()


@router.get("", response_model=APIResponse[list[UserResponse]])
async def list_users(
    search: str | None = Query(default=None, description="Search term to filter users"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
) -> APIResponse[list[UserResponse]]:
    user_repo = UserRepository(db)
    if search and search.strip():
        users = await user_repo.search_users(search.strip())
    else:
        # Get all active users
        statement = select(User).where(User.is_active.is_(True))
        result = await db.execute(statement)
        users = result.scalars().all()

    return APIResponse(data=[UserResponse.model_validate(u) for u in users])


@router.get("/me", response_model=APIResponse[UserResponse])
async def get_me(
    current_user: User = Depends(get_current_active_user),
) -> APIResponse[UserResponse]:
    return APIResponse(data=UserResponse.model_validate(current_user))


@router.put("/profile", response_model=APIResponse[UserResponse])
async def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
) -> APIResponse[UserResponse]:
    user_repo = UserRepository(db)
    update_attrs = {}
    if data.full_name is not None:
        update_attrs["full_name"] = data.full_name.strip()
    if data.avatar_url is not None:
        update_attrs["avatar_url"] = data.avatar_url.strip()
    if data.notification_preferences is not None:
        update_attrs["notification_preferences"] = data.notification_preferences

    if update_attrs:
        user = await user_repo.update(current_user, update_attrs)
    else:
        user = current_user

    return APIResponse(data=UserResponse.model_validate(user))


@router.post("/change-password", response_model=APIResponse[dict[str, str]])
async def change_password(
    data: UserPasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
) -> APIResponse[dict[str, str]]:
    if not verify_password(data.old_password, current_user.hashed_password):
        raise ValidationException("Incorrect old password")

    user_repo = UserRepository(db)
    new_hash = get_password_hash(data.new_password)
    await user_repo.update(current_user, {"hashed_password": new_hash})

    return APIResponse(data={"message": "Password changed successfully"})
