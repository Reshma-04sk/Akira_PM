from pydantic import BaseModel

from src.schemas.audit_log import AuditLogResponse
from src.schemas.task import TaskResponse


class DashboardOverviewResponse(BaseModel):
    projects_count: int
    tasks_count: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    tasks_by_priority: dict[str, int]
    tasks_by_status: dict[str, int]


class DashboardProjectOverviewResponse(BaseModel):
    tasks_count: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    tasks_by_priority: dict[str, int]
    tasks_by_status: dict[str, int]


class DashboardActivityResponse(BaseModel):
    activities: list[AuditLogResponse]


class DashboardMyTasksResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    page_size: int
