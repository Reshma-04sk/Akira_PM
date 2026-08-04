from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None


class WorkspaceResponse(WorkspaceBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkspaceListResponse(BaseModel):
    items: list[WorkspaceResponse]
    total: int
    page: int
    page_size: int


class WorkspaceMemberResponse(BaseModel):
    user_id: UUID
    full_name: str | None = None
    email: str
    role: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkspaceMemberUpdate(BaseModel):
    role: str = Field(..., pattern="^(owner|admin|manager|developer|viewer)$")


class WorkspaceInvite(BaseModel):
    email: EmailStr
    role: str = Field("viewer", pattern="^(owner|admin|manager|developer|viewer)$")
