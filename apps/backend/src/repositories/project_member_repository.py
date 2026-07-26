from typing import Any
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.project_member import ProjectMember, ProjectRole
from src.repositories.base import BaseRepository


class ProjectMemberRepository(BaseRepository[ProjectMember]):
    def __init__(self, session: AsyncSession):
        super().__init__(ProjectMember, session)

    async def get_by_id(self, id_val: UUID) -> ProjectMember | None:
        statement = select(ProjectMember).where(ProjectMember.id == id_val)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_membership(
        self, project_id: UUID, user_id: UUID
    ) -> ProjectMember | None:
        statement = select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def create(self, attributes: dict[str, Any]) -> ProjectMember:
        return await super().create(attributes)

    async def update(
        self, db_obj: ProjectMember, attributes: dict[str, Any]
    ) -> ProjectMember:
        return await super().update(db_obj, attributes)

    async def delete(self, db_obj: ProjectMember) -> None:
        await super().delete(db_obj)

    async def exists(self, project_id: UUID, user_id: UUID) -> bool:
        statement = select(ProjectMember.id).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none() is not None

    async def count_project_owners(self, project_id: UUID) -> int:
        statement = (
            select(func.count())
            .select_from(ProjectMember)
            .where(
                ProjectMember.project_id == project_id,
                ProjectMember.role == ProjectRole.OWNER,
            )
        )
        result = await self.session.execute(statement)
        return result.scalar_one()

    async def list_members(
        self,
        *,
        project_id: UUID | None = None,
        role: ProjectRole | None = None,
        user_id: UUID | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[ProjectMember], int]:
        query = select(ProjectMember)
        count_query = select(func.count()).select_from(ProjectMember)

        # Filters
        if project_id:
            query = query.where(ProjectMember.project_id == project_id)
            count_query = count_query.where(
                ProjectMember.project_id == project_id
            )

        if role:
            query = query.where(ProjectMember.role == role)
            count_query = count_query.where(ProjectMember.role == role)

        if user_id:
            query = query.where(ProjectMember.user_id == user_id)
            count_query = count_query.where(ProjectMember.user_id == user_id)

        # Count total
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()

        # Pagination and ordering
        offset = (page - 1) * page_size
        query = (
            query.order_by(desc(ProjectMember.created_at))
            .offset(offset)
            .limit(page_size)
        )

        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total
