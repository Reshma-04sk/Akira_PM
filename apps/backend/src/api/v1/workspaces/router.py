from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.user import User
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.user_repository import UserRepository
from src.repositories.workspace_repository import WorkspaceRepository
from src.schemas.response import APIResponse
from src.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceInvite,
    WorkspaceListResponse,
    WorkspaceMemberResponse,
    WorkspaceMemberUpdate,
    WorkspaceResponse,
    WorkspaceUpdate,
)
from src.services.workspace_service import WorkspaceService

router = APIRouter()


def get_workspace_service(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> WorkspaceService:
    workspace_repo = WorkspaceRepository(db)
    user_repo = UserRepository(db)
    audit_repo = AuditLogRepository(db)
    return WorkspaceService(workspace_repo, user_repo, audit_repo)


@router.post(
    "",
    response_model=APIResponse[WorkspaceResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_workspace(
    data: WorkspaceCreate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: WorkspaceService = Depends(get_workspace_service),  # noqa: B008
) -> APIResponse[WorkspaceResponse]:
    workspace_response = await service.create_workspace(data, current_user.id)
    return APIResponse(data=workspace_response)


@router.get("", response_model=APIResponse[WorkspaceListResponse])
async def list_workspaces(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: WorkspaceService = Depends(get_workspace_service),  # noqa: B008
) -> APIResponse[WorkspaceListResponse]:
    items, total = await service.list_workspaces(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
    )
    return APIResponse(
        data=WorkspaceListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
        )
    )


@router.get("/{workspace_id}", response_model=APIResponse[WorkspaceResponse])
async def get_workspace(
    workspace_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: WorkspaceService = Depends(get_workspace_service),  # noqa: B008
) -> APIResponse[WorkspaceResponse]:
    workspace_response = await service.get_workspace(workspace_id, current_user.id)
    return APIResponse(data=workspace_response)


@router.patch("/{workspace_id}", response_model=APIResponse[WorkspaceResponse])
async def update_workspace(
    workspace_id: UUID,
    data: WorkspaceUpdate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: WorkspaceService = Depends(get_workspace_service),  # noqa: B008
) -> APIResponse[WorkspaceResponse]:
    workspace_response = await service.update_workspace(
        workspace_id, data, current_user.id
    )
    return APIResponse(data=workspace_response)


@router.get(
    "/{workspace_id}/members",
    response_model=APIResponse[list[WorkspaceMemberResponse]],
)
async def list_workspace_members(
    workspace_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: WorkspaceService = Depends(get_workspace_service),  # noqa: B008
) -> APIResponse[list[WorkspaceMemberResponse]]:
    members = await service.list_members(workspace_id, current_user.id)
    return APIResponse(data=members)


@router.post(
    "/{workspace_id}/members/invite",
    response_model=APIResponse[WorkspaceMemberResponse],
)
async def invite_workspace_member(
    workspace_id: UUID,
    data: WorkspaceInvite,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: WorkspaceService = Depends(get_workspace_service),  # noqa: B008
) -> APIResponse[WorkspaceMemberResponse]:
    member = await service.invite_member(workspace_id, data, current_user.id)
    return APIResponse(data=member)


@router.patch(
    "/{workspace_id}/members/{user_id}",
    response_model=APIResponse[WorkspaceMemberResponse],
)
async def update_workspace_member_role(
    workspace_id: UUID,
    user_id: UUID,
    data: WorkspaceMemberUpdate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: WorkspaceService = Depends(get_workspace_service),  # noqa: B008
) -> APIResponse[WorkspaceMemberResponse]:
    member = await service.update_member_role(
        workspace_id, user_id, data.role, current_user.id
    )
    return APIResponse(data=member)


@router.delete(
    "/{workspace_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def remove_workspace_member(
    workspace_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: WorkspaceService = Depends(get_workspace_service),  # noqa: B008
) -> None:
    await service.remove_member(workspace_id, user_id, current_user.id)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: WorkspaceService = Depends(get_workspace_service),  # noqa: B008
) -> None:
    await service.delete_workspace(workspace_id, current_user.id)
