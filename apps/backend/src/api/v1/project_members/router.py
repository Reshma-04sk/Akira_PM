from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.project_member import ProjectRole
from src.models.user import User
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.user_repository import UserRepository
from src.schemas.project_member import (
    ProjectMemberCreate,
    ProjectMemberListResponse,
    ProjectMemberResponse,
    ProjectMemberUpdate,
)
from src.schemas.response import APIResponse
from src.services.project_member_service import ProjectMemberService

router = APIRouter()


def get_project_member_service(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> ProjectMemberService:
    member_repo = ProjectMemberRepository(db)
    project_repo = ProjectRepository(db)
    user_repo = UserRepository(db)
    audit_repo = AuditLogRepository(db)
    return ProjectMemberService(member_repo, project_repo, user_repo, audit_repo)


@router.post(
    "",
    response_model=APIResponse[ProjectMemberResponse],
    status_code=status.HTTP_201_CREATED,
)
async def add_member(
    data: ProjectMemberCreate,
    project_id: UUID = Query(..., description="ID of the project"),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: ProjectMemberService = Depends(  # noqa: B008
        get_project_member_service
    ),
) -> APIResponse[ProjectMemberResponse]:
    """
    Adds a new member to a project.
    """
    member_response = await service.add_member(project_id, data, current_user.id)
    return APIResponse(data=member_response)


@router.get("", response_model=APIResponse[ProjectMemberListResponse])
async def list_members(
    project_id: UUID = Query(..., description="ID of the project"),  # noqa: B008
    role: ProjectRole | None = Query(  # noqa: B008
        default=None, description="Filter by role"
    ),
    page: int = Query(default=1, ge=1),  # noqa: B008
    page_size: int = Query(default=20, ge=1, le=100),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: ProjectMemberService = Depends(  # noqa: B008
        get_project_member_service
    ),
) -> APIResponse[ProjectMemberListResponse]:
    """
    Retrieves a paginated list of members for a project.
    """
    member_list_response = await service.list_members(
        project_id=project_id,
        actor_id=current_user.id,
        role=role,
        page=page,
        page_size=page_size,
    )
    return APIResponse(data=member_list_response)


@router.get("/{user_id}", response_model=APIResponse[ProjectMemberResponse])
async def get_member(
    user_id: UUID,
    project_id: UUID = Query(..., description="ID of the project"),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: ProjectMemberService = Depends(  # noqa: B008
        get_project_member_service
    ),
) -> APIResponse[ProjectMemberResponse]:
    """
    Retrieves project membership details of a specific user.
    """
    member_response = await service.get_member(project_id, user_id, current_user.id)
    return APIResponse(data=member_response)


@router.patch("/{user_id}", response_model=APIResponse[ProjectMemberResponse])
async def update_member_role(
    user_id: UUID,
    data: ProjectMemberUpdate,
    project_id: UUID = Query(..., description="ID of the project"),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: ProjectMemberService = Depends(  # noqa: B008
        get_project_member_service
    ),
) -> APIResponse[ProjectMemberResponse]:
    """
    Updates the project membership role of a specific user.
    """
    member_response = await service.update_member_role(
        project_id, user_id, data, current_user.id
    )
    return APIResponse(data=member_response)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    user_id: UUID,
    project_id: UUID = Query(..., description="ID of the project"),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: ProjectMemberService = Depends(  # noqa: B008
        get_project_member_service
    ),
) -> None:
    """
    Removes a member from the project.
    """
    await service.remove_member(project_id, user_id, current_user.id)
