import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
    ValidationException,
)
from src.models.user import User
from src.models.workspace import Workspace
from src.models.workspace_member import WorkspaceMember
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.user_repository import UserRepository
from src.repositories.workspace_repository import WorkspaceRepository
from src.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceInvite,
    WorkspaceMemberResponse,
    WorkspaceResponse,
    WorkspaceUpdate,
)

logger = logging.getLogger("saas_backend")


async def get_user_workspace_context(
    user_id: UUID,
    db: AsyncSession,
    header_workspace_id: UUID | None = None,
) -> tuple[Workspace, str]:
    """
    Self-healing context helper that resolves the active workspace and role.
    If header_workspace_id is provided and the user is a member, uses it.
    Else, falls back to the user's first joined workspace.
    If the user has zero workspaces, generates a default personal workspace.
    """
    # 1. Check header workspace id
    if header_workspace_id:
        stmt = select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == header_workspace_id,
            WorkspaceMember.user_id == user_id,
        )
        res = await db.execute(stmt)
        member = res.scalar_one_or_none()
        if member:
            workspace = await db.get(Workspace, header_workspace_id)
            if workspace:
                return workspace, member.role

    # 2. Check any workspace membership
    stmt = select(WorkspaceMember).where(WorkspaceMember.user_id == user_id)
    res = await db.execute(stmt)
    member = res.scalars().first()
    if member:
        workspace = await db.get(Workspace, member.workspace_id)
        if workspace:
            return workspace, member.role

    # 3. Create default self-healing workspace
    user_stmt = select(User).where(User.id == user_id)
    user_res = await db.execute(user_stmt)
    user = user_res.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")

    name = f"{user.full_name or user.email.split('@')[0]}'s Workspace"
    workspace = Workspace(
        name=name,
        description="Default collaborative workspace",
        owner_id=user_id,
    )
    db.add(workspace)
    await db.flush()

    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=user_id,
        role="owner",
    )
    db.add(member)
    await db.flush()

    logger.info(
        "Generated default self-healing workspace '%s' for user %s", name, user_id
    )
    return workspace, "owner"


class WorkspaceService:
    def __init__(
        self,
        workspace_repository: WorkspaceRepository,
        user_repository: UserRepository,
        audit_log_repository: AuditLogRepository | None = None,
    ):
        self.workspace_repository = workspace_repository
        self.user_repository = user_repository
        self.audit_log_repository = audit_log_repository

    async def create_workspace(
        self, data: WorkspaceCreate, owner_id: UUID
    ) -> WorkspaceResponse:
        workspace = await self.workspace_repository.create(
            {
                "name": data.name.strip(),
                "description": data.description,
                "owner_id": owner_id,
            }
        )
        # Register owner membership
        await self.workspace_repository.add_member(
            workspace_id=workspace.id,
            user_id=owner_id,
            role="owner",
        )
        logger.info(
            "Workspace '%s' created successfully by owner %s", workspace.name, owner_id
        )

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": owner_id,
                    "action": "workspace_create",
                    "entity_type": "workspace",
                    "entity_id": str(workspace.id),
                    "details": {"name": workspace.name},
                }
            )

        return WorkspaceResponse.model_validate(workspace)

    async def get_workspace(
        self, workspace_id: UUID, user_id: UUID
    ) -> WorkspaceResponse:
        workspace = await self.workspace_repository.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

        # Verify membership
        member = await self.workspace_repository.get_member(workspace_id, user_id)
        if not member:
            raise ForbiddenException("You are not a member of this workspace")

        return WorkspaceResponse.model_validate(workspace)

    async def update_workspace(
        self, workspace_id: UUID, data: WorkspaceUpdate, user_id: UUID
    ) -> WorkspaceResponse:
        workspace = await self.workspace_repository.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

        # Only Owner/Admin can update settings
        member = await self.workspace_repository.get_member(workspace_id, user_id)
        if not member or member.role not in ("owner", "admin"):
            raise ForbiddenException("You do not have permission to update settings")

        update_attrs = {}
        if data.name is not None:
            update_attrs["name"] = data.name.strip()
        if data.description is not None:
            update_attrs["description"] = data.description

        if update_attrs:
            workspace = await self.workspace_repository.update(workspace, update_attrs)
            logger.info("Workspace settings updated for %s", workspace_id)

            if self.audit_log_repository:
                await self.audit_log_repository.create(
                    {
                        "user_id": user_id,
                        "action": "workspace_update",
                        "entity_type": "workspace",
                        "entity_id": str(workspace_id),
                        "details": update_attrs,
                    }
                )

        return WorkspaceResponse.model_validate(workspace)

    async def list_workspaces(
        self, user_id: UUID, page: int = 1, page_size: int = 20
    ) -> tuple[list[WorkspaceResponse], int]:
        items, total = await self.workspace_repository.list_workspaces_for_user(
            user_id, page, page_size
        )
        if total == 0:
            await get_user_workspace_context(user_id, self.workspace_repository.session)
            items, total = await self.workspace_repository.list_workspaces_for_user(
                user_id, page, page_size
            )
        return [WorkspaceResponse.model_validate(w) for w in items], total

    async def list_members(
        self, workspace_id: UUID, user_id: UUID
    ) -> list[WorkspaceMemberResponse]:
        # Check requester is a member
        member = await self.workspace_repository.get_member(workspace_id, user_id)
        if not member:
            raise ForbiddenException("You are not a member of this workspace")

        members = await self.workspace_repository.list_members(workspace_id)
        return [
            WorkspaceMemberResponse(
                user_id=m.user_id,
                full_name=m.user.full_name,
                email=m.user.email,
                role=m.role,
                joined_at=m.created_at,
            )
            for m in members
        ]

    async def invite_member(
        self, workspace_id: UUID, data: WorkspaceInvite, actor_id: UUID
    ) -> WorkspaceMemberResponse:
        # Check permissions: Owner/Admin only
        actor = await self.workspace_repository.get_member(workspace_id, actor_id)
        if not actor or actor.role not in ("owner", "admin"):
            raise ForbiddenException("You do not have permission to invite members")

        # Check invited user exists
        invited_user = await self.user_repository.get_by_email(data.email)
        if not invited_user:
            raise NotFoundException("User with this email does not exist")

        # Prevent duplicate memberships
        existing = await self.workspace_repository.get_member(
            workspace_id, invited_user.id
        )
        if existing:
            raise ValidationException("User is already a member of this workspace")

        # Assign role
        member = await self.workspace_repository.add_member(
            workspace_id=workspace_id,
            user_id=invited_user.id,
            role=data.role,
        )

        logger.info(
            "User %s invited to workspace %s with role %s",
            invited_user.id,
            workspace_id,
            data.role,
        )

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": actor_id,
                    "action": "workspace_member_invite",
                    "entity_type": "workspace_member",
                    "entity_id": str(member.id),
                    "details": {
                        "workspace_id": str(workspace_id),
                        "user_id": str(invited_user.id),
                        "role": data.role,
                    },
                }
            )

        return WorkspaceMemberResponse(
            user_id=member.user_id,
            full_name=member.user.full_name,
            email=member.user.email,
            role=member.role,
            joined_at=member.created_at,
        )

    async def update_member_role(
        self, workspace_id: UUID, target_user_id: UUID, role: str, actor_id: UUID
    ) -> WorkspaceMemberResponse:
        # Check permissions: Owner/Admin only
        actor = await self.workspace_repository.get_member(workspace_id, actor_id)
        if not actor or actor.role not in ("owner", "admin"):
            raise ForbiddenException("You do not have permission to modify roles")

        # Cannot modify own role
        if target_user_id == actor_id:
            raise ValidationException("You cannot modify your own role")

        target_member = await self.workspace_repository.get_member(
            workspace_id, target_user_id
        )
        if not target_member:
            raise NotFoundException("Member not found in workspace")

        # Prevent non-owners from promoting to owner or demoting owners
        if role == "owner" and actor.role != "owner":
            raise ForbiddenException("Only workspace owners can assign the OWNER role")
        if target_member.role == "owner" and actor.role != "owner":
            raise ForbiddenException("Only workspace owners can demote other owners")

        target_member = await self.workspace_repository.update_member_role(
            target_member, role
        )
        logger.info(
            "Updated role of user %s in workspace %s to %s",
            target_user_id,
            workspace_id,
            role,
        )

        return WorkspaceMemberResponse(
            user_id=target_member.user_id,
            full_name=target_member.user.full_name,
            email=target_member.user.email,
            role=target_member.role,
            joined_at=target_member.created_at,
        )

    async def remove_member(
        self, workspace_id: UUID, target_user_id: UUID, actor_id: UUID
    ) -> None:
        # Check permissions: Owner/Admin only
        actor = await self.workspace_repository.get_member(workspace_id, actor_id)
        if not actor or actor.role not in ("owner", "admin"):
            raise ForbiddenException("You do not have permission to remove members")

        if target_user_id == actor_id:
            raise ValidationException("You cannot remove yourself from the workspace")

        target_member = await self.workspace_repository.get_member(
            workspace_id, target_user_id
        )
        if not target_member:
            raise NotFoundException("Member not found in workspace")

        # Non-owners cannot remove owners
        if target_member.role == "owner" and actor.role != "owner":
            raise ForbiddenException("Only workspace owners can remove owners")

        await self.workspace_repository.delete_member(target_member)
        logger.info("Removed member %s from workspace %s", target_user_id, workspace_id)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": actor_id,
                    "action": "workspace_member_remove",
                    "entity_type": "workspace",
                    "entity_id": str(workspace_id),
                    "details": {"removed_user_id": str(target_user_id)},
                }
            )

    async def delete_workspace(self, workspace_id: UUID, actor_id: UUID) -> None:
        workspace = await self.workspace_repository.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

        # Verify permissions: actor must be the workspace owner
        member = await self.workspace_repository.get_member(workspace_id, actor_id)
        if not member or member.role != "owner":
            raise ForbiddenException("Only workspace owners can delete the workspace")

        # Perform deletion
        await self.workspace_repository.delete(workspace)
        logger.info("Workspace %s deleted by owner %s", workspace_id, actor_id)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": actor_id,
                    "action": "workspace_delete",
                    "entity_type": "workspace",
                    "entity_id": str(workspace_id),
                    "details": {"name": workspace.name},
                }
            )
