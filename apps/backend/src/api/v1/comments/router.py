from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.user import User
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.comment_repository import CommentRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.schemas.comment import (
    CommentCreate,
    CommentListResponse,
    CommentResponse,
    CommentUpdate,
)
from src.schemas.response import APIResponse
from src.services.comment_service import CommentService

router = APIRouter()


def get_comment_service(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> CommentService:
    comment_repo = CommentRepository(db)
    task_repo = TaskRepository(db)
    project_repo = ProjectRepository(db)
    member_repo = ProjectMemberRepository(db)
    audit_repo = AuditLogRepository(db)
    return CommentService(
        comment_repo, task_repo, project_repo, member_repo, audit_repo
    )


@router.post(
    "",
    response_model=APIResponse[CommentResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_comment(
    data: CommentCreate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: CommentService = Depends(get_comment_service),  # noqa: B008
) -> APIResponse[CommentResponse]:
    """
    Creates a new comment on a task.
    """
    comment_response = await service.create_comment(data, current_user.id)
    return APIResponse(data=comment_response)


@router.get("", response_model=APIResponse[CommentListResponse])
async def list_comments(
    task_id: UUID = Query(..., description="ID of the task"),  # noqa: B008
    page: int = Query(default=1, ge=1),  # noqa: B008
    page_size: int = Query(default=20, ge=1, le=100),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: CommentService = Depends(get_comment_service),  # noqa: B008
) -> APIResponse[CommentListResponse]:
    """
    Lists paginated comments for a task.
    """
    comment_list_response = await service.list_comments(
        task_id=task_id,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
    )
    return APIResponse(data=comment_list_response)


@router.patch("/{comment_id}", response_model=APIResponse[CommentResponse])
async def update_comment(
    comment_id: UUID,
    data: CommentUpdate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: CommentService = Depends(get_comment_service),  # noqa: B008
) -> APIResponse[CommentResponse]:
    """
    Updates the content of an existing comment.
    """
    comment_response = await service.update_comment(comment_id, data, current_user.id)
    return APIResponse(data=comment_response)


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: CommentService = Depends(get_comment_service),  # noqa: B008
) -> None:
    """
    Deletes an existing comment.
    """
    await service.delete_comment(comment_id, current_user.id)
