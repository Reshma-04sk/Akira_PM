import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator

from src.models.project_member import ProjectRole


class ProjectMemberBase(BaseModel):
    role: ProjectRole = Field(
        default=ProjectRole.DEVELOPER,
        description="The membership role of the user in the project",
    )


class ProjectMemberCreate(ProjectMemberBase):
    user_id: uuid.UUID = Field(..., description="The ID of the user to add as a member")


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
    user_email: str | None = None
    user_name: str | None = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def populate_user_info(cls, data: Any) -> Any:
        if hasattr(data, "user") and data.user:
            data.user_email = data.user.email
            data.user_name = data.user.full_name
        elif isinstance(data, dict):
            user_data = data.get("user")
            if user_data:
                if isinstance(user_data, dict):
                    data["user_email"] = user_data.get("email")
                    data["user_name"] = user_data.get("full_name")
                else:
                    data["user_email"] = getattr(user_data, "email", None)
                    data["user_name"] = getattr(user_data, "full_name", None)
        return data


class ProjectMemberListResponse(BaseModel):
    items: list[ProjectMemberResponse]
    total: int
    page: int
    page_size: int
