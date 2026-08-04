from typing import Any
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.project import Project
from src.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, session: AsyncSession):
        super().__init__(Project, session)

    async def get_by_id(
        self, id_val: UUID, include_archived: bool = False
    ) -> Project | None:
        statement = select(Project).where(Project.id == id_val)
        if not include_archived:
            statement = statement.where(Project.is_archived.is_(False))
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def create(self, attributes: dict[str, Any]) -> Project:
        return await super().create(attributes)

    async def update(self, db_obj: Project, attributes: dict[str, Any]) -> Project:
        return await super().update(db_obj, attributes)

    async def soft_delete(self, project: Project) -> Project:
        project.is_archived = True
        self.session.add(project)
        await self.session.flush()
        return project

    async def exists_by_name_for_owner(self, name: str, owner_id: UUID) -> bool:
        statement = select(Project.id).where(
            Project.name == name.strip(),
            Project.owner_id == owner_id,
            Project.is_archived.is_(False),
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none() is not None

    async def list_projects(
        self,
        *,
        owner_id: UUID | None = None,
        workspace_id: UUID | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
        include_archived: bool = False,
    ) -> tuple[list[Project], int]:
        query = select(Project)
        count_query = select(func.count()).select_from(Project)

        # Filters
        if not include_archived:
            query = query.where(Project.is_archived.is_(False))
            count_query = count_query.where(Project.is_archived.is_(False))

        if workspace_id:
            query = query.where(Project.workspace_id == workspace_id)
            count_query = count_query.where(Project.workspace_id == workspace_id)
        elif owner_id:
            query = query.where(Project.owner_id == owner_id)
            count_query = count_query.where(Project.owner_id == owner_id)

        if search:
            search_filter = Project.name.ilike(f"%{search.strip()}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        # Count total
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()

        # Pagination and ordering
        offset = (page - 1) * page_size
        query = query.order_by(desc(Project.created_at)).offset(offset).limit(page_size)

        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_user_involved_project_ids(self, user_id: UUID) -> list[UUID]:
        from src.models.project_member import ProjectMember

        stmt = (
            select(Project.id)
            .where(
                (Project.owner_id == user_id)
                | (
                    Project.id.in_(
                        select(ProjectMember.project_id).where(
                            ProjectMember.user_id == user_id
                        )
                    )
                )
            )
            .where(Project.is_archived.is_(False))
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_user_involved_projects(
        self, user_id: UUID, limit: int = 5
    ) -> list[Project]:
        from src.models.project_member import ProjectMember

        stmt = (
            select(Project)
            .where(
                (Project.owner_id == user_id)
                | (
                    Project.id.in_(
                        select(ProjectMember.project_id).where(
                            ProjectMember.user_id == user_id
                        )
                    )
                )
            )
            .where(Project.is_archived.is_(False))
            .order_by(desc(Project.updated_at))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_involved_projects(
        self, user_id: UUID, query_str: str, limit: int = 20, offset: int = 0
    ) -> list[Project]:
        from src.models.project_member import ProjectMember

        stmt = (
            select(Project)
            .where(
                (Project.owner_id == user_id)
                | (
                    Project.id.in_(
                        select(ProjectMember.project_id).where(
                            ProjectMember.user_id == user_id
                        )
                    )
                )
            )
            .where(Project.is_archived.is_(False))
            .where(
                Project.name.ilike(f"%{query_str.strip()}%")
                | Project.description.ilike(f"%{query_str.strip()}%")
            )
            .order_by(desc(Project.created_at))
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
