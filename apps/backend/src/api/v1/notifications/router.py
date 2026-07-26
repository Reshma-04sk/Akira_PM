from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.user import User
from src.repositories.notification_repository import NotificationRepository
from src.schemas.notification import (
    NotificationListResponse,
    NotificationResponse,
)
from src.schemas.response import APIResponse
from src.services.notification_service import NotificationService

router = APIRouter()


def get_notification_service(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> NotificationService:
    notification_repo = NotificationRepository(db)
    return NotificationService(notification_repo)


@router.get("", response_model=APIResponse[NotificationListResponse])
async def list_notifications(
    is_read: bool | None = Query(  # noqa: B008
        default=None, description="Filter by read status"
    ),
    page: int = Query(default=1, ge=1),  # noqa: B008
    page_size: int = Query(default=20, ge=1, le=100),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: NotificationService = Depends(  # noqa: B008
        get_notification_service
    ),
) -> APIResponse[NotificationListResponse]:
    """
    Retrieves a paginated list of notifications for the authenticated user.
    """
    notification_list_response = await service.list_notifications(
        user_id=current_user.id,
        is_read=is_read,
        page=page,
        page_size=page_size,
    )
    return APIResponse(data=notification_list_response)


@router.patch("/read-all", response_model=APIResponse[None])
async def mark_all_read(
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: NotificationService = Depends(  # noqa: B008
        get_notification_service
    ),
) -> APIResponse[None]:
    """
    Marks all notifications for the current user as read.
    """
    await service.mark_all_read(current_user.id)
    return APIResponse(data=None)


@router.patch(
    "/{notification_id}/read", response_model=APIResponse[NotificationResponse]
)
async def mark_as_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: NotificationService = Depends(  # noqa: B008
        get_notification_service
    ),
) -> APIResponse[NotificationResponse]:
    """
    Marks a specific notification as read.
    """
    notification_response = await service.mark_as_read(
        notification_id, current_user.id
    )
    return APIResponse(data=notification_response)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: NotificationService = Depends(  # noqa: B008
        get_notification_service
    ),
) -> None:
    """
    Deletes a specific notification.
    """
    await service.delete_notification(notification_id, current_user.id)
