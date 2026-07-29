from uuid import UUID

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
)
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.schemas.audit_log import AuditLogResponse
from src.schemas.dashboard import (
    DashboardActivityResponse,
    DashboardMyTasksResponse,
    DashboardOverviewResponse,
    DashboardProjectOverviewResponse,
)
from src.schemas.task import TaskResponse


class DashboardService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        task_repository: TaskRepository,
        project_member_repository: ProjectMemberRepository,
        audit_log_repository: AuditLogRepository,
    ):
        self.project_repository = project_repository
        self.task_repository = task_repository
        self.project_member_repository = project_member_repository
        self.audit_log_repository = audit_log_repository

    async def _verify_project_membership(self, project_id: UUID, user_id: UUID) -> None:
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project not found")

        if project.owner_id == user_id:
            return

        is_member = await self.project_member_repository.exists(project_id, user_id)
        if not is_member:
            raise ForbiddenException("You do not have access to this project")

    async def get_overview(self, user_id: UUID) -> DashboardOverviewResponse:
        project_ids = await self.project_repository.get_user_involved_project_ids(
            user_id
        )
        stats = await self.task_repository.get_dashboard_stats(project_ids)

        return DashboardOverviewResponse(
            projects_count=len(project_ids),
            tasks_count=stats["total_tasks"],
            completed_tasks=stats["completed_tasks"],
            pending_tasks=stats["pending_tasks"],
            overdue_tasks=stats["overdue_tasks"],
            tasks_by_priority=stats["by_priority"],
            tasks_by_status=stats["by_status"],
        )

    async def get_activity(
        self, user_id: UUID, limit: int = 10
    ) -> DashboardActivityResponse:
        activities = await self.audit_log_repository.get_recent_activity(user_id, limit)
        return DashboardActivityResponse(
            activities=[AuditLogResponse.model_validate(act) for act in activities]
        )

    async def get_my_tasks(
        self, user_id: UUID, page: int = 1, page_size: int = 20
    ) -> DashboardMyTasksResponse:
        items, total = await self.task_repository.list_tasks(
            assignee_id=user_id,
            page=page,
            page_size=page_size,
        )
        return DashboardMyTasksResponse(
            items=[TaskResponse.model_validate(t) for t in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_project_dashboard(
        self, project_id: UUID, user_id: UUID
    ) -> DashboardProjectOverviewResponse:
        await self._verify_project_membership(project_id, user_id)
        stats = await self.task_repository.get_dashboard_stats([project_id])

        return DashboardProjectOverviewResponse(
            tasks_count=stats["total_tasks"],
            completed_tasks=stats["completed_tasks"],
            pending_tasks=stats["pending_tasks"],
            overdue_tasks=stats["overdue_tasks"],
            tasks_by_priority=stats["by_priority"],
            tasks_by_status=stats["by_status"],
        )
