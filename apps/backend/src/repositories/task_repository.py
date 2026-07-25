from typing import Any
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.task import Task, TaskPriority, TaskStatus
from src.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    def __init__(self, session: AsyncSession):
        super().__init__(Task, session)

    async def get_by_id(self, id_val: UUID) -> Task | None:
        statement = select(Task).where(Task.id == id_val)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def create(self, attributes: dict[str, Any]) -> Task:
        return await super().create(attributes)

    async def update(self, db_obj: Task, attributes: dict[str, Any]) -> Task:
        return await super().update(db_obj, attributes)

    async def soft_delete(self, task: Task) -> None:
        """
        Performs a hard delete on the task, as the Task model does not
        have a soft-delete/archived flag.
        """
        await self.session.delete(task)
        await self.session.flush()

    async def exists_by_title_for_project(
        self, title: str, project_id: UUID
    ) -> bool:
        statement = select(Task.id).where(
            Task.title == title.strip(),
            Task.project_id == project_id,
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none() is not None

    async def list_tasks(
        self,
        *,
        project_id: UUID | None = None,
        assignee_id: UUID | None = None,
        status: TaskStatus | None = None,
        priority: TaskPriority | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Task], int]:
        query = select(Task)
        count_query = select(func.count()).select_from(Task)

        # Filters
        if project_id:
            query = query.where(Task.project_id == project_id)
            count_query = count_query.where(Task.project_id == project_id)

        if assignee_id:
            query = query.where(Task.assignee_id == assignee_id)
            count_query = count_query.where(Task.assignee_id == assignee_id)

        if status:
            query = query.where(Task.status == status)
            count_query = count_query.where(Task.status == status)

        if priority:
            query = query.where(Task.priority == priority)
            count_query = count_query.where(Task.priority == priority)

        if search:
            search_filter = Task.title.ilike(f"%{search.strip()}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        # Count total
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()

        # Pagination and ordering
        offset = (page - 1) * page_size
        query = (
            query.order_by(desc(Task.created_at))
            .offset(offset)
            .limit(page_size)
        )

        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total
