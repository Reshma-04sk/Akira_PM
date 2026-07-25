import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=255, description="Name of the project"
    )
    description: str | None = Field(
        default=None, description="Detailed description of the project"
    )


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = Field(
        default=None, min_length=1, max_length=255, description="Name of the project"
    )
    description: str | None = Field(
        default=None, description="Detailed description of the project"
    )
    is_archived: bool | None = Field(
        default=None, description="Whether the project is archived"
    )


class ProjectResponse(ProjectBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    total: int
    page: int
    page_size: int
