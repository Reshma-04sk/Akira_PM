from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.user import User
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.schemas.dashboard import (
    DashboardActivityResponse,
    DashboardMyTasksResponse,
    DashboardOverviewResponse,
    DashboardProjectOverviewResponse,
)
from src.schemas.response import APIResponse
from src.services.dashboard_service import DashboardService

router = APIRouter()


def get_dashboard_service(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> DashboardService:
    project_repo = ProjectRepository(db)
    task_repo = TaskRepository(db)
    member_repo = ProjectMemberRepository(db)
    audit_repo = AuditLogRepository(db)
    return DashboardService(project_repo, task_repo, member_repo, audit_repo)


@router.get("/overview", response_model=APIResponse[DashboardOverviewResponse])
async def get_overview(
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: DashboardService = Depends(get_dashboard_service),  # noqa: B008
) -> APIResponse[DashboardOverviewResponse]:
    """
    Retrieves global overview statistics for the user dashboard.
    """
    overview = await service.get_overview(current_user.id)
    return APIResponse(data=overview)


@router.get("/activity", response_model=APIResponse[DashboardActivityResponse])
async def get_activity(
    limit: int = Query(default=10, ge=1, le=100),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: DashboardService = Depends(get_dashboard_service),  # noqa: B008
) -> APIResponse[DashboardActivityResponse]:
    """
    Retrieves recent activity logs for the dashboard.
    """
    activity = await service.get_activity(current_user.id, limit)
    return APIResponse(data=activity)


@router.get("/my-tasks", response_model=APIResponse[DashboardMyTasksResponse])
async def get_my_tasks(
    page: int = Query(default=1, ge=1),  # noqa: B008
    page_size: int = Query(default=20, ge=1, le=100),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: DashboardService = Depends(get_dashboard_service),  # noqa: B008
) -> APIResponse[DashboardMyTasksResponse]:
    """
    Retrieves tasks assigned to the current active user.
    """
    tasks = await service.get_my_tasks(current_user.id, page, page_size)
    return APIResponse(data=tasks)


@router.get(
    "/project/{project_id}",
    response_model=APIResponse[DashboardProjectOverviewResponse],
)
async def get_project_dashboard(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: DashboardService = Depends(get_dashboard_service),  # noqa: B008
) -> APIResponse[DashboardProjectOverviewResponse]:
    """
    Retrieves dashboard statistics for a specific project.
    """
    project_overview = await service.get_project_dashboard(project_id, current_user.id)
    return APIResponse(data=project_overview)
