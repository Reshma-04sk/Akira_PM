import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
from jose import JWTError, jwt

from src.core.exceptions import UnauthorizedException
from src.core.settings import settings

ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hashed value using bcrypt."""
    try:
        pwd_bytes = plain_password.encode("utf-8")
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash of the plain text password."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Generate a short-lived JWT access token signed with backend secret key.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.BACKEND_ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire, "jti": str(uuid.uuid4()), "type": "access"})
    return jwt.encode(to_encode, settings.BACKEND_SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decodes and validates a JWT access token.
    Raises UnauthorizedException on invalid token or expiration.
    """
    try:
        payload = jwt.decode(token, settings.BACKEND_SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise UnauthorizedException("Invalid token type")
        return payload
    except JWTError as e:
        raise UnauthorizedException("Invalid or expired authentication token") from e


def generate_refresh_token() -> str:
    """
    Generates a secure cryptographically random opaque refresh token string.
    """
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    """
    Computes SHA256 hex hash of a refresh token string for safe db storage and lookup.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
