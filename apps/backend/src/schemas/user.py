import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from src.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None

class UserRegister(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: uuid.UUID
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
