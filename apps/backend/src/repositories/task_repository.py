from typing import Any
from uuid import UUID

from sqlalchemy import case, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models.project import Project
from src.models.task import Task, TaskPriority, TaskStatus
from src.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    def __init__(self, session: AsyncSession):
        super().__init__(Task, session)

    async def get_by_id(self, id_val: UUID) -> Task | None:
        statement = (
            select(Task)
            .options(
                joinedload(Task.project).joinedload(Project.owner),
                joinedload(Task.assignee),
            )
            .where(Task.id == id_val)
        )
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

    async def exists_by_title_for_project(self, title: str, project_id: UUID) -> bool:
        statement = select(Task.id).where(
            func.lower(Task.title) == func.lower(title.strip()),
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
        query = select(Task).options(
            joinedload(Task.project).joinedload(Project.owner),
            joinedload(Task.assignee),
        )
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

        if search and search.strip():
            search_filter = Task.title.ilike(f"%{search.strip()}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        # Count total
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()

        # Pagination and ordering
        offset = (page - 1) * page_size
        query = query.order_by(desc(Task.created_at)).offset(offset).limit(page_size)

        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def list_assigned_tasks(self, user_id: UUID, limit: int = 5) -> list[Task]:
        statement = (
            select(Task)
            .options(
                joinedload(Task.project).joinedload(Project.owner),
                joinedload(Task.assignee),
            )
            .where(Task.assignee_id == user_id)
            .order_by(desc(Task.created_at))
            .limit(limit)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_dashboard_stats(self, project_ids: list[UUID]) -> dict[str, Any]:
        if not project_ids:
            return {
                "total_tasks": 0,
                "completed_tasks": 0,
                "pending_tasks": 0,
                "overdue_tasks": 0,
                "by_priority": {},
                "by_status": {},
            }

        from datetime import UTC, datetime

        now = datetime.now(UTC)

        # Consolidated counts query using CASE WHEN
        counts_stmt = select(
            func.count(Task.id).label("total"),
            func.sum(case((Task.status == TaskStatus.DONE, 1), else_=0)).label("completed"),
            func.sum(case((Task.status != TaskStatus.DONE, 1), else_=0)).label("pending"),
            func.sum(case(((Task.status != TaskStatus.DONE) & (Task.due_date < now), 1), else_=0)).label("overdue"),
        ).where(Task.project_id.in_(project_ids))

        counts_res = (await self.session.execute(counts_stmt)).one()
        total_tasks = counts_res.total or 0
        completed_tasks = int(counts_res.completed or 0)
        pending_tasks = int(counts_res.pending or 0)
        overdue_tasks = int(counts_res.overdue or 0)

        # Grouped counts
        priority_stmt = (
            select(Task.priority, func.count(Task.id))
            .where(Task.project_id.in_(project_ids))
            .group_by(Task.priority)
        )
        priority_res = (await self.session.execute(priority_stmt)).all()
        by_priority = {str(row[0]): row[1] for row in priority_res}

        status_stmt = (
            select(Task.status, func.count(Task.id))
            .where(Task.project_id.in_(project_ids))
            .group_by(Task.status)
        )
        status_res = (await self.session.execute(status_stmt)).all()
        by_status = {str(row[0]): row[1] for row in status_res}

        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "overdue_tasks": overdue_tasks,
            "by_priority": by_priority,
            "by_status": by_status,
        }

    async def search_involved_tasks(
        self,
        project_ids: list[UUID],
        query_str: str,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Task]:
        if not project_ids:
            return []
        stmt = (
            select(Task)
            .options(
                joinedload(Task.project).joinedload(Project.owner),
                joinedload(Task.assignee),
            )
            .where(Task.project_id.in_(project_ids))
            .where(
                Task.title.ilike(f"%{query_str.strip()}%")
                | Task.description.ilike(f"%{query_str.strip()}%")
            )
            .order_by(desc(Task.created_at))
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
