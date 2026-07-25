import logging
from datetime import UTC, datetime, timedelta

from src.core.exceptions import UnauthorizedException, ValidationException
from src.core.security import (
    create_access_token,
    generate_refresh_token,
    get_password_hash,
    hash_refresh_token,
    verify_password,
)
from src.models.user import User, UserRole
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.refresh_token_repository import RefreshTokenRepository
from src.repositories.user_repository import UserRepository
from src.schemas.auth import TokenResponse
from src.schemas.user import UserLogin, UserRegister, UserResponse

logger = logging.getLogger("saas_backend")

REFRESH_TOKEN_EXPIRE_DAYS = 7


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
        refresh_token_repository: RefreshTokenRepository,
        audit_log_repository: AuditLogRepository | None = None,
    ):
        self.user_repository = user_repository
        self.refresh_token_repository = refresh_token_repository
        self.audit_log_repository = audit_log_repository

    async def register_user(self, data: UserRegister) -> UserResponse:
        existing_user = await self.user_repository.get_by_email(data.email)
        if existing_user:
            raise ValidationException("User with this email already exists")

        hashed_pwd = get_password_hash(data.password)
        user_attributes = {
            "email": data.email.lower().strip(),
            "hashed_password": hashed_pwd,
            "full_name": data.full_name,
            "role": UserRole.USER,
            "is_active": True,
            "is_verified": True,
        }
        user = await self.user_repository.create(user_attributes)
        logger.info("New user registered successfully: %s", user.email)
        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": user.id,
                    "action": "user_register",
                    "entity_type": "user",
                    "entity_id": str(user.id),
                    "details": {"email": user.email, "full_name": user.full_name},
                }
            )
        return UserResponse.model_validate(user)

    async def authenticate_user(self, data: UserLogin) -> TokenResponse:
        user = await self.user_repository.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password")

        tokens = await self._create_tokens_for_user(user)
        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": user.id,
                    "action": "user_login",
                    "entity_type": "user",
                    "entity_id": str(user.id),
                    "details": {"status": "success"},
                }
            )
        return tokens

    async def refresh_tokens(self, raw_refresh_token: str) -> TokenResponse:
        token_hash = hash_refresh_token(raw_refresh_token)
        stored_token = await self.refresh_token_repository.get_by_token_hash(token_hash)

        if not stored_token or stored_token.revoked:
            logger.warning(
                "Attempted reuse or invalid refresh token hash: %s", token_hash
            )
            raise UnauthorizedException("Invalid or revoked refresh token")

        # Check timezone-aware expiration
        now = datetime.now(UTC)
        expires_at = stored_token.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        if expires_at < now:
            await self.refresh_token_repository.update(stored_token, {"revoked": True})
            raise UnauthorizedException("Expired refresh token")

        # Rotation step: revoke current token
        await self.refresh_token_repository.update(stored_token, {"revoked": True})

        # Fetch associated user
        user = await self.user_repository.get_by_id(stored_token.user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User is inactive or no longer exists")

        # Create new token pair
        return await self._create_tokens_for_user(user)

    async def logout_user(self, raw_refresh_token: str) -> None:
        token_hash = hash_refresh_token(raw_refresh_token)
        stored_token = await self.refresh_token_repository.get_by_token_hash(token_hash)
        if stored_token and not stored_token.revoked:
            await self.refresh_token_repository.update(stored_token, {"revoked": True})
            logger.info("Refresh token revoked for logout: %s", stored_token.id)
            if self.audit_log_repository:
                await self.audit_log_repository.create(
                    {
                        "user_id": stored_token.user_id,
                        "action": "user_logout",
                        "entity_type": "user",
                        "entity_id": str(stored_token.user_id),
                        "details": {"refresh_token_id": str(stored_token.id)},
                    }
                )

    async def _create_tokens_for_user(self, user: User) -> TokenResponse:
        # Generate JWT access token
        jwt_claims = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value
            if isinstance(user.role, UserRole)
            else str(user.role),
        }
        access_token = create_access_token(jwt_claims)

        # Generate Opaque Refresh token and store hash
        raw_refresh_token = generate_refresh_token()
        hashed_token_str = hash_refresh_token(raw_refresh_token)
        expires_at = datetime.now(UTC) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

        await self.refresh_token_repository.create(
            {
                "user_id": user.id,
                "token_hash": hashed_token_str,
                "expires_at": expires_at,
                "revoked": False,
            }
        )

        user_resp = UserResponse.model_validate(user)
        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh_token,
            token_type="bearer",
            user=user_resp,
        )
