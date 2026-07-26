import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CommentBase(BaseModel):
    content: str = Field(..., description="Content of the comment")


class CommentCreate(CommentBase):
    task_id: uuid.UUID = Field(
        ..., description="The ID of the task this comment belongs to"
    )


class CommentUpdate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: uuid.UUID
    task_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CommentListResponse(BaseModel):
    items: list[CommentResponse]
    total: int
    page: int
    page_size: int
