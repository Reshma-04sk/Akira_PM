import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from src.models.task import TaskPriority, TaskStatus


class TaskBase(BaseModel):
    title: str = Field(
        ..., min_length=1, max_length=255, description="Title of the task"
    )
    description: str | None = Field(
        default=None, description="Detailed description of the task"
    )
    status: TaskStatus = Field(
        default=TaskStatus.TODO, description="Current status of the task"
    )
    priority: TaskPriority = Field(
        default=TaskPriority.MEDIUM, description="Priority level of the task"
    )
    due_date: datetime | None = Field(
        default=None, description="Due date of the task"
    )
    assignee_id: uuid.UUID | None = Field(
        default=None, description="ID of the user assigned to this task"
    )


class TaskCreate(TaskBase):
    project_id: uuid.UUID = Field(
        ..., description="ID of the project this task belongs to"
    )


class TaskUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="Title of the task",
    )
    description: str | None = Field(
        default=None, description="Detailed description of the task"
    )
    status: TaskStatus | None = Field(
        default=None, description="Current status of the task"
    )
    priority: TaskPriority | None = Field(
        default=None, description="Priority level of the task"
    )
    due_date: datetime | None = Field(
        default=None, description="Due date of the task"
    )
    assignee_id: uuid.UUID | None = Field(
        default=None, description="ID of the user assigned to this task"
    )


class TaskResponse(TaskBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    page_size: int
