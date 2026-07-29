import logging
from uuid import UUID

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
)
from src.models.notification import NotificationType
from src.repositories.notification_repository import NotificationRepository
from src.schemas.notification import (
    NotificationListResponse,
    NotificationResponse,
)

logger = logging.getLogger("saas_backend")


class NotificationService:
    def __init__(self, notification_repository: NotificationRepository):
        self.notification_repository = notification_repository

    async def create_notification(
        self,
        user_id: UUID,
        notification_type: NotificationType,
        title: str,
        message: str,
    ) -> NotificationResponse:
        attrs = {
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "is_read": False,
        }
        notification = await self.notification_repository.create(attrs)
        logger.info(
            "Notification created: %s of type %s for user %s",
            notification.id,
            type,
            user_id,
        )
        return NotificationResponse.model_validate(notification)

    async def list_notifications(
        self,
        user_id: UUID,
        is_read: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> NotificationListResponse:
        items, total = await self.notification_repository.list_notifications(
            user_id=user_id,
            is_read=is_read,
            page=page,
            page_size=page_size,
        )
        return NotificationListResponse(
            items=[NotificationResponse.model_validate(n) for n in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def mark_as_read(
        self, notification_id: UUID, user_id: UUID
    ) -> NotificationResponse:
        notification = await self.notification_repository.get_by_id(notification_id)
        if not notification:
            raise NotFoundException("Notification not found")

        if notification.user_id != user_id:
            raise ForbiddenException("You cannot modify this notification")

        notification = await self.notification_repository.update(
            notification, {"is_read": True}
        )
        return NotificationResponse.model_validate(notification)

    async def mark_all_read(self, user_id: UUID) -> None:
        await self.notification_repository.mark_all_read(user_id)

    async def delete_notification(self, notification_id: UUID, user_id: UUID) -> None:
        notification = await self.notification_repository.get_by_id(notification_id)
        if not notification:
            raise NotFoundException("Notification not found")

        if notification.user_id != user_id:
            raise ForbiddenException("You cannot delete this notification")

        await self.notification_repository.delete(notification)
