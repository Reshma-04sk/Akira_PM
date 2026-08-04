from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.task import TaskPriority, TaskStatus
from src.models.user import User
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.repositories.user_repository import UserRepository
from src.schemas.response import APIResponse
from src.schemas.task import (
    TaskCreate,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
)
from src.services.task_service import TaskService

router = APIRouter()


def get_task_service(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> TaskService:
    task_repo = TaskRepository(db)
    project_repo = ProjectRepository(db)
    user_repo = UserRepository(db)
    audit_repo = AuditLogRepository(db)
    return TaskService(task_repo, project_repo, user_repo, audit_repo)


@router.post(
    "",
    response_model=APIResponse[TaskResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_task(
    data: TaskCreate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: TaskService = Depends(get_task_service),  # noqa: B008
) -> APIResponse[TaskResponse]:
    """
    Creates a new task within a project.
    """
    task_response = await service.create_task(data, current_user.id)
    return APIResponse(data=task_response)


@router.get("", response_model=APIResponse[TaskListResponse])
async def list_tasks(
    project_id: UUID = Query(..., description="ID of the project"),  # noqa: B008
    assignee_id: UUID | None = Query(  # noqa: B008
        default=None, description="Filter by assignee"
    ),
    status_filter: TaskStatus | None = Query(  # noqa: B008
        default=None, alias="status", description="Filter by status"
    ),
    priority_filter: TaskPriority | None = Query(  # noqa: B008
        default=None, alias="priority", description="Filter by priority"
    ),
    search: str | None = Query(default=None, description="Search by title"),  # noqa: B008
    page: int = Query(default=1, ge=1),  # noqa: B008
    page_size: int = Query(default=20, ge=1, le=100),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: TaskService = Depends(get_task_service),  # noqa: B008
) -> APIResponse[TaskListResponse]:
    """
    Retrieves a paginated list of tasks within a project.
    """
    task_list_response = await service.list_tasks(
        project_id=project_id,
        user_id=current_user.id,
        assignee_id=assignee_id,
        status=status_filter,
        priority=priority_filter,
        search=search,
        page=page,
        page_size=page_size,
    )
    return APIResponse(data=task_list_response)


@router.get("/{task_id}", response_model=APIResponse[TaskResponse])
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: TaskService = Depends(get_task_service),  # noqa: B008
) -> APIResponse[TaskResponse]:
    """
    Retrieves details of a specific task.
    """
    task_response = await service.get_task(task_id, current_user.id)
    return APIResponse(data=task_response)


@router.patch("/{task_id}", response_model=APIResponse[TaskResponse])
async def update_task(
    task_id: UUID,
    data: TaskUpdate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: TaskService = Depends(get_task_service),  # noqa: B008
) -> APIResponse[TaskResponse]:
    """
    Updates details of a specific task.
    """
    task_response = await service.update_task(task_id, data, current_user.id)
    return APIResponse(data=task_response)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: TaskService = Depends(get_task_service),  # noqa: B008
) -> None:
    """
    Soft-deletes a specific task.
    """
    await service.delete_task(task_id, current_user.id)
