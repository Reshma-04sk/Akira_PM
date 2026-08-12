import logging
from typing import Any
from uuid import UUID

from sqlalchemy import case, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models.project import Project
from src.models.task import Task, TaskPriority, TaskStatus
from src.repositories.base import BaseRepository

logger = logging.getLogger("saas_backend")


class TaskRepository(BaseRepository[Task]):
    def __init__(self, session: AsyncSession):
        super().__init__(Task, session)

    async def get_by_id(self, task_id: UUID) -> Task | None:
        statement = (
            select(Task)
            .options(
                joinedload(Task.project).joinedload(Project.owner),
                joinedload(Task.assignee),
            )
            .where(Task.id == task_id)
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def exists_by_title_for_project(self, title: str, project_id: UUID) -> bool:
        """Check if an active (non-DONE) task with the same title exists in the project."""
        stmt = (
            select(func.count())
            .select_from(Task)
            .where(
                Task.project_id == project_id,
                func.lower(Task.title) == title.lower(),
                Task.status != TaskStatus.DONE,
            )
        )
        result = await self.session.execute(stmt)
        return (result.scalar() or 0) > 0

    async def create(self, attributes: dict[str, Any]) -> Task:
        task = await super().create(attributes)
        await self.session.commit()
        return await self.get_by_id(task.id)  # type: ignore

    async def update(self, db_obj: Task, attributes: dict[str, Any]) -> Task:
        task = await super().update(db_obj, attributes)
        await self.session.commit()
        return await self.get_by_id(task.id)  # type: ignore

    async def soft_delete(self, task: Task) -> None:
        """Performs a hard delete as Task doesn't have an archived flag."""
        await self.session.delete(task)
        await self.session.commit()

    async def list_tasks(
        self,
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

        counts_stmt = select(
            func.count(Task.id).label("total"),
            func.sum(case((Task.status == TaskStatus.DONE, 1), else_=0)).label(
                "completed"
            ),
            func.sum(case((Task.status != TaskStatus.DONE, 1), else_=0)).label(
                "pending"
            ),
            func.sum(
                case(
                    ((Task.status != TaskStatus.DONE) & (Task.due_date < now), 1),
                    else_=0,
                )
            ).label("overdue"),
        ).where(Task.project_id.in_(project_ids))

        counts_res = (await self.session.execute(counts_stmt)).one()
        total_tasks = counts_res.total or 0
        completed_tasks = int(counts_res.completed or 0)
        pending_tasks = int(counts_res.pending or 0)
        overdue_tasks = int(counts_res.overdue or 0)

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

    async def get_analytics_data(self, project_ids: list[UUID]) -> dict[str, Any]:
        if not project_ids:
            return {
                "velocity_history": [],
                "avg_cycle_time_days": None,
                "completion_rate_percent": 0.0,
            }

        stmt = select(Task).where(Task.project_id.in_(project_ids))
        result = await self.session.execute(stmt)
        tasks = list(result.scalars().all())

        if not tasks:
            return {
                "velocity_history": [],
                "avg_cycle_time_days": None,
                "completion_rate_percent": 0.0,
            }

        total_count = len(tasks)
        completed_tasks = [t for t in tasks if t.status == TaskStatus.DONE]
        completion_rate = (
            (len(completed_tasks) / total_count * 100.0) if total_count > 0 else 0.0
        )

        cycle_times = []
        for t in completed_tasks:
            if t.created_at and t.updated_at:
                delta_days = (t.updated_at - t.created_at).total_seconds() / 86400.0
                cycle_times.append(max(0.1, round(delta_days, 1)))

        avg_cycle_time = (
            round(sum(cycle_times) / len(cycle_times), 1) if cycle_times else None
        )

        from datetime import UTC, datetime, timedelta

        now = datetime.now(UTC)
        buckets = []
        for i in range(3, -1, -1):
            period_start = now - timedelta(days=(i + 1) * 7)
            period_end = now - timedelta(days=i * 7)

            # Format honest date label (e.g. "Jul 21 - Jul 27" or "This Week")
            if i == 0:
                period_label = "This Week"
            elif i == 1:
                period_label = "1w ago"
            else:
                period_label = f"{i}w ago"

            period_tasks = [
                t
                for t in tasks
                if t.created_at and period_start <= t.created_at <= period_end
            ]
            shipped = [t for t in period_tasks if t.status == TaskStatus.DONE]
            buckets.append(
                {
                    "label": period_label,
                    "tasks_shipped": len(shipped),
                    "total_tasks": len(period_tasks),
                }
            )

        return {
            "velocity_history": buckets,
            "avg_cycle_time_days": avg_cycle_time,
            "completion_rate_percent": round(completion_rate, 1),
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
