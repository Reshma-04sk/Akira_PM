import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Enum as SQLEnum, DateTime, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    full_name: Mapped[str | None] = mapped_column(
        String(255), 
        nullable=True
    )
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, native_enum=False), 
        default=UserRole.USER, 
        nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True, 
        nullable=False
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean, 
        default=False, 
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=utc_now, 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=utc_now, 
        onupdate=utc_now, 
        nullable=False
    )

    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
