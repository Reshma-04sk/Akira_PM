import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.exceptions import UnauthorizedException, ValidationException
from src.repositories.refresh_token_repository import RefreshTokenRepository
from src.repositories.user_repository import UserRepository
from src.schemas.user import UserLogin, UserRegister
from src.services.auth_service import AuthService

@pytest.mark.asyncio
async def test_register_and_authenticate_user(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    refresh_repo = RefreshTokenRepository(db_session)
    service = AuthService(user_repo, refresh_repo)

    register_data = UserRegister(
        email="testuser@example.com",
        password="SecurePassword123!",
        full_name="Test User",
    )
    user_resp = await service.register_user(register_data)
    assert user_resp.email == "testuser@example.com"
    assert user_resp.full_name == "Test User"

    # Authenticate
    token_resp = await service.authenticate_user(
        UserLogin(email="testuser@example.com", password="SecurePassword123!")
    )
    assert token_resp.access_token is not None
    assert token_resp.refresh_token is not None
    assert token_resp.user.email == "testuser@example.com"

@pytest.mark.asyncio
async def test_register_duplicate_email_fails(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    refresh_repo = RefreshTokenRepository(db_session)
    service = AuthService(user_repo, refresh_repo)

    register_data = UserRegister(
        email="dup@example.com",
        password="Password123!",
        full_name="Dup User",
    )
    await service.register_user(register_data)

    with pytest.raises(ValidationException):
        await service.register_user(register_data)

@pytest.mark.asyncio
async def test_refresh_token_rotation(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    refresh_repo = RefreshTokenRepository(db_session)
    service = AuthService(user_repo, refresh_repo)

    await service.register_user(
        UserRegister(email="rotation@example.com", password="Password123!", full_name="Rotation User")
    )
    initial_tokens = await service.authenticate_user(
        UserLogin(email="rotation@example.com", password="Password123!")
    )

    # Perform refresh
    new_tokens = await service.refresh_tokens(initial_tokens.refresh_token)
    assert new_tokens.access_token != initial_tokens.access_token
    assert new_tokens.refresh_token != initial_tokens.refresh_token

    # Attempt reuse of old refresh token (must fail due to revocation)
    with pytest.raises(UnauthorizedException):
        await service.refresh_tokens(initial_tokens.refresh_token)
