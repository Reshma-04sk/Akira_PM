from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.user import User
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.refresh_token_repository import RefreshTokenRepository
from src.repositories.user_repository import UserRepository
from src.schemas.auth import RefreshTokenRequest, TokenResponse
from src.schemas.response import APIResponse
from src.schemas.user import UserLogin, UserRegister, UserResponse
from src.services.auth_service import AuthService

router = APIRouter()


def get_auth_service(db: AsyncSession = Depends(get_db_session)) -> AuthService:
    user_repo = UserRepository(db)
    refresh_repo = RefreshTokenRepository(db)
    audit_repo = AuditLogRepository(db)
    return AuthService(user_repo, refresh_repo, audit_repo)


@router.post(
    "/register",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
)
async def register(
    data: UserRegister,
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse[UserResponse]:
    """
    Registers a new user account with unique email validation and password hashing.
    """
    user_response = await auth_service.register_user(data)
    return APIResponse(data=user_response)


@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(
    data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse[TokenResponse]:
    """
    Authenticates user credentials and issues JWT access token and opaque refresh token.
    """
    token_response = await auth_service.authenticate_user(data)
    return APIResponse(data=token_response)


@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh(
    data: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse[TokenResponse]:
    """
    Performs refresh token rotation: revokes current token and issues new access/refresh pair.
    """
    token_response = await auth_service.refresh_tokens(data.refresh_token)
    return APIResponse(data=token_response)


@router.post("/logout", response_model=APIResponse[dict[str, str]])
async def logout(
    data: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse[dict[str, str]]:
    """
    Revokes active refresh token to invalidate current session.
    """
    await auth_service.logout_user(data.refresh_token)
    return APIResponse(data={"message": "Logged out successfully"})


@router.get("/me", response_model=APIResponse[UserResponse])
async def me(
    current_user: User = Depends(get_current_active_user),
) -> APIResponse[UserResponse]:
    """
    Returns profile information for the currently authenticated user.
    """
    user_response = UserResponse.model_validate(current_user)
    return APIResponse(data=user_response)
