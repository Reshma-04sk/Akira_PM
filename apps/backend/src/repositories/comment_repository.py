from typing import Any
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.comment import Comment
from src.repositories.base import BaseRepository


class CommentRepository(BaseRepository[Comment]):
    def __init__(self, session: AsyncSession):
        super().__init__(Comment, session)

    async def get_by_id(self, id_val: UUID) -> Comment | None:
        statement = select(Comment).where(Comment.id == id_val)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def create(self, attributes: dict[str, Any]) -> Comment:
        return await super().create(attributes)

    async def update(self, db_obj: Comment, attributes: dict[str, Any]) -> Comment:
        return await super().update(db_obj, attributes)

    async def delete(self, db_obj: Comment) -> None:
        await super().delete(db_obj)

    async def list_comments(
        self,
        task_id: UUID,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Comment], int]:
        query = select(Comment).where(Comment.task_id == task_id)
        count_query = (
            select(func.count()).select_from(Comment).where(Comment.task_id == task_id)
        )

        # Count total
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()

        # Pagination and ordering
        offset = (page - 1) * page_size
        query = query.order_by(desc(Comment.created_at)).offset(offset).limit(page_size)

        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def search_involved_comments(
        self,
        project_ids: list[UUID],
        query_str: str,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Comment]:
        if not project_ids:
            return []
        from src.models.task import Task

        stmt = (
            select(Comment)
            .join(Task, Comment.task_id == Task.id)
            .where(Task.project_id.in_(project_ids))
            .where(Comment.content.ilike(f"%{query_str.strip()}%"))
            .order_by(desc(Comment.created_at))
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
