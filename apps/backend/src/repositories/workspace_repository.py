from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.workspace import Workspace
from src.models.workspace_member import WorkspaceMember
from src.repositories.base import BaseRepository


class WorkspaceRepository(BaseRepository[Workspace]):
    def __init__(self, session: AsyncSession):
        super().__init__(Workspace, session)

    async def get_by_id(self, id_val: UUID) -> Workspace | None:
        statement = select(Workspace).where(Workspace.id == id_val)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_workspaces_for_user(
        self, user_id: UUID, page: int = 1, page_size: int = 20
    ) -> tuple[list[Workspace], int]:
        # Workspaces where user is a member
        member_stmt = select(WorkspaceMember.workspace_id).where(
            WorkspaceMember.user_id == user_id
        )

        count_stmt = select(func.count(Workspace.id)).where(
            Workspace.id.in_(member_stmt)
        )
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar() or 0

        stmt = (
            select(Workspace)
            .where(Workspace.id.in_(member_stmt))
            .order_by(Workspace.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_member(
        self, workspace_id: UUID, user_id: UUID
    ) -> WorkspaceMember | None:
        statement = (
            select(WorkspaceMember)
            .options(selectinload(WorkspaceMember.user))
            .where(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user_id,
            )
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list_members(self, workspace_id: UUID) -> list[WorkspaceMember]:
        statement = (
            select(WorkspaceMember)
            .options(selectinload(WorkspaceMember.user))
            .where(WorkspaceMember.workspace_id == workspace_id)
            .order_by(WorkspaceMember.created_at.asc())
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def add_member(
        self, workspace_id: UUID, user_id: UUID, role: str
    ) -> WorkspaceMember:
        member = WorkspaceMember(
            workspace_id=workspace_id,
            user_id=user_id,
            role=role,
        )
        self.session.add(member)
        await self.session.flush()
        # Reload with user relationship loaded
        stmt = (
            select(WorkspaceMember)
            .options(selectinload(WorkspaceMember.user))
            .where(WorkspaceMember.id == member.id)
        )
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def update_member_role(
        self, member: WorkspaceMember, role: str
    ) -> WorkspaceMember:
        member.role = role
        await self.session.flush()
        return member

    async def delete_member(self, member: WorkspaceMember) -> None:
        await self.session.delete(member)
        await self.session.flush()
