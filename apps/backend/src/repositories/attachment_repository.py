from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.attachment import Attachment
from src.repositories.base import BaseRepository


class AttachmentRepository(BaseRepository[Attachment]):
    def __init__(self, session: AsyncSession):
        super().__init__(Attachment, session)

    async def get_by_id(self, id_val: UUID) -> Attachment | None:
        statement = select(Attachment).where(Attachment.id == id_val)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def create(self, attributes: dict[str, Any]) -> Attachment:
        return await super().create(attributes)

    async def delete(self, db_obj: Attachment) -> None:
        await super().delete(db_obj)

    async def list_attachments(self, task_id: UUID) -> list[Attachment]:
        statement = select(Attachment).where(Attachment.task_id == task_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())
