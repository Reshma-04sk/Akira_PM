import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from src.core.exceptions import UnauthorizedException
from src.core.settings import settings

# Cryptography context for password hashing using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hashed value."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash of the plain text password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Generate a short-lived JWT access token signed with backend secret key.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.BACKEND_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
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
