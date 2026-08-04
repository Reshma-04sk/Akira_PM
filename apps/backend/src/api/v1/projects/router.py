from uuid import UUID

from fastapi import APIRouter, Depends, Header, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.user import User
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.project_repository import ProjectRepository
from src.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)
from src.schemas.response import APIResponse
from src.services.project_service import ProjectService

router = APIRouter()


def get_project_service(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> ProjectService:
    project_repo = ProjectRepository(db)
    audit_repo = AuditLogRepository(db)
    return ProjectService(project_repo, audit_repo)


@router.post(
    "",
    response_model=APIResponse[ProjectResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: ProjectService = Depends(get_project_service),  # noqa: B008
) -> APIResponse[ProjectResponse]:
    """
    Creates a new project for the authenticated user.
    """
    project_response = await service.create_project(data, current_user.id)
    return APIResponse(data=project_response)


@router.get("", response_model=APIResponse[ProjectListResponse])
async def list_projects(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    workspace_id: UUID | None = Header(None, alias="X-Workspace-ID"),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: ProjectService = Depends(get_project_service),  # noqa: B008
) -> APIResponse[ProjectListResponse]:
    """
    Retrieves a paginated list of projects owned by the authenticated user.
    """
    project_list_response = await service.list_projects(
        owner_id=current_user.id,
        workspace_id=workspace_id,
        search=search,
        page=page,
        page_size=page_size,
    )
    return APIResponse(data=project_list_response)


@router.get("/{project_id}", response_model=APIResponse[ProjectResponse])
async def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: ProjectService = Depends(get_project_service),  # noqa: B008
) -> APIResponse[ProjectResponse]:
    """
    Retrieves details of a specific project owned by the authenticated user.
    """
    project_response = await service.get_project(project_id, current_user.id)
    return APIResponse(data=project_response)


@router.patch("/{project_id}", response_model=APIResponse[ProjectResponse])
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: ProjectService = Depends(get_project_service),  # noqa: B008
) -> APIResponse[ProjectResponse]:
    """
    Updates details of a specific project owned by the authenticated user.
    """
    project_response = await service.update_project(project_id, data, current_user.id)
    return APIResponse(data=project_response)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: ProjectService = Depends(get_project_service),  # noqa: B008
) -> None:
    """
    Soft-deletes a specific project owned by the authenticated user.
    """
    await service.delete_project(project_id, current_user.id)
