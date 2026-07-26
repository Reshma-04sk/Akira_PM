from typing import Any
from uuid import UUID

from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.notification import Notification
from src.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, session: AsyncSession):
        super().__init__(Notification, session)

    async def get_by_id(self, id_val: UUID) -> Notification | None:
        statement = select(Notification).where(Notification.id == id_val)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def create(self, attributes: dict[str, Any]) -> Notification:
        return await super().create(attributes)

    async def update(
        self, db_obj: Notification, attributes: dict[str, Any]
    ) -> Notification:
        return await super().update(db_obj, attributes)

    async def delete(self, db_obj: Notification) -> None:
        await super().delete(db_obj)

    async def list_notifications(
        self,
        user_id: UUID,
        is_read: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Notification], int]:
        query = select(Notification).where(Notification.user_id == user_id)
        count_query = (
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id)
        )

        if is_read is not None:
            query = query.where(Notification.is_read == is_read)
            count_query = count_query.where(Notification.is_read == is_read)

        # Count total
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()

        # Pagination & sorting
        offset = (page - 1) * page_size
        query = (
            query.order_by(desc(Notification.created_at))
            .offset(offset)
            .limit(page_size)
        )

        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def mark_all_read(self, user_id: UUID) -> None:
        statement = (
            update(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
            .values(is_read=True)
        )
        await self.session.execute(statement)
