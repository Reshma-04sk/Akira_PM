from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.audit_log import AuditLog
from src.repositories.base import BaseRepository


class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self, session: AsyncSession):
        super().__init__(AuditLog, session)

    async def get_paginated_logs(
        self,
        page: int,
        size: int,
        user_id: UUID | None = None,
        action: str | None = None,
    ) -> tuple[list[AuditLog], int]:
        # Build filter query
        query = select(AuditLog)
        count_query = select(func.count()).select_from(AuditLog)

        if user_id:
            query = query.where(AuditLog.user_id == user_id)
            count_query = count_query.where(AuditLog.user_id == user_id)

        if action:
            query = query.where(AuditLog.action == action)
            count_query = count_query.where(AuditLog.action == action)

        # Get total count
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()

        # Order by created_at desc, and paginate
        offset = (page - 1) * size
        query = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(size)

        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_recent_activity(
        self, user_id: UUID, limit: int = 10
    ) -> list[AuditLog]:
        stmt = (
            select(AuditLog)
            .where(AuditLog.user_id == user_id)
            .order_by(desc(AuditLog.created_at))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
