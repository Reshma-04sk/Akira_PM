from collections.abc import Callable
from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import ForbiddenException, UnauthorizedException
from src.core.security import decode_access_token
from src.dependencies.database import get_db_session
from src.models.user import User, UserRole
from src.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db_session),
) -> User:
    if not token:
        raise UnauthorizedException("Authentication credentials were not provided")

    payload = decode_access_token(token)
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedException("Malformed token claims")

    try:
        user_id = UUID(user_id_str)
    except ValueError as e:
        raise UnauthorizedException("Invalid user identifier in token") from e

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedException("User associated with token no longer exists")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise UnauthorizedException("User account is inactive")
    return current_user


def require_role(required_role: UserRole) -> Callable:
    async def role_checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        if current_user.role != required_role:
            raise ForbiddenException("Operation not permitted for current user role")
        return current_user

    return role_checker
