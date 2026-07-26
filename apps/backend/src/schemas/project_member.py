import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from src.models.project_member import ProjectRole


class ProjectMemberBase(BaseModel):
    role: ProjectRole = Field(
        default=ProjectRole.DEVELOPER,
        description="The membership role of the user in the project",
    )


class ProjectMemberCreate(ProjectMemberBase):
    user_id: uuid.UUID = Field(
        ..., description="The ID of the user to add as a member"
    )


class ProjectMemberUpdate(BaseModel):
    role: ProjectRole | None = Field(
        default=None,
        description="The membership role of the user in the project",
    )


class ProjectMemberResponse(ProjectMemberBase):
    id: uuid.UUID
    project_id: uuid.UUID
    user_id: uuid.UUID
    invited_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectMemberListResponse(BaseModel):
    items: list[ProjectMemberResponse]
    total: int
    page: int
    page_size: int
