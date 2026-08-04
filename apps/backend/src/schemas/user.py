import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserRegister(UserBase):
    password: str = Field(
        ..., min_length=8, description="Password must be at least 8 characters"
    )


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: uuid.UUID
    role: UserRole
    is_active: bool
    is_verified: bool
    avatar_url: str | None = None
    notification_preferences: dict | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(None, max_length=255)
    avatar_url: str | None = Field(None, max_length=512)
    notification_preferences: dict | None = None


class UserPasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(
        ..., min_length=8, description="New password must be at least 8 characters"
    )
