from uuid import UUID

from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import ForbiddenException, NotFoundException
from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.project import Project
from src.models.project_member import ProjectMember, ProjectRole
from src.models.task import Task
from src.models.user import User
from src.models.workspace_member import WorkspaceMember
from src.services.workspace_service import get_user_workspace_context


class WorkspaceRole:
    OWNER = "owner"
    ADMIN = "admin"
    MANAGER = "manager"
    DEVELOPER = "developer"
    VIEWER = "viewer"


def check_workspace_role(allowed_roles: list[str]):
    """FastAPI Dependency for workspace-level role checks."""

    async def dependency(
        workspace_id: UUID | None = Header(None, alias="X-Workspace-ID"),
        current_user: User = Depends(get_current_active_user),  # noqa: B008
        db: AsyncSession = Depends(get_db_session),  # noqa: B008
    ) -> str:
        workspace, role = await get_user_workspace_context(
            current_user.id, db, workspace_id
        )
        if role not in allowed_roles:
            raise ForbiddenException(
                "You do not have the required workspace permissions"
            )
        return role

    return dependency


async def get_project_workspace_id(project: Project, db: AsyncSession) -> UUID:
    """Helper to get a project's workspace ID, healing legacy DB state if None."""
    if project.workspace_id:
        return project.workspace_id

    # Resolve project owner's default workspace
    workspace, role = await get_user_workspace_context(project.owner_id, db)
    project.workspace_id = workspace.id
    db.add(project)
    await db.flush()
    return workspace.id


async def get_user_workspace_role_for_project(
    project: Project, user_id: UUID, db: AsyncSession
) -> str | None:
    """Resolves the user's role in the workspace containing the project."""
    ws_id = await get_project_workspace_id(project, db)

    # Check workspace membership
    stmt = select(WorkspaceMember.role).where(
        WorkspaceMember.workspace_id == ws_id,
        WorkspaceMember.user_id == user_id,
    )
    res = await db.execute(stmt)
    ws_role = res.scalar_one_or_none()

    if ws_role is None:
        # Legacy fallback/backward compatibility for project members
        if project.owner_id == user_id:
            return WorkspaceRole.OWNER

        stmt = select(ProjectMember).where(
            ProjectMember.project_id == project.id, ProjectMember.user_id == user_id
        )
        pm_res = await db.execute(stmt)
        pm = pm_res.scalar_one_or_none()
        if pm:
            return (
                WorkspaceRole.DEVELOPER
                if pm.role != ProjectRole.VIEWER
                else WorkspaceRole.VIEWER
            )

    return ws_role


# Project permissions check helpers
async def check_project_read_permission(
    project: Project, user_id: UUID, db: AsyncSession
) -> None:
    ws_role = await get_user_workspace_role_for_project(project, user_id, db)
    if not ws_role:
        raise ForbiddenException("You do not have permission to view this project")


async def check_project_write_permission(
    project: Project, user_id: UUID, db: AsyncSession
) -> None:
    ws_role = await get_user_workspace_role_for_project(project, user_id, db)
    if not ws_role:
        raise ForbiddenException("You do not have permission to access this project")

    # Owners and Admins can write all projects in workspace
    if ws_role in (WorkspaceRole.OWNER, WorkspaceRole.ADMIN):
        return

    # Managers can write if they are project owner or member of this project
    if ws_role == WorkspaceRole.MANAGER:
        if project.owner_id == user_id:
            return
        stmt = select(ProjectMember).where(
            ProjectMember.project_id == project.id, ProjectMember.user_id == user_id
        )
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            return

    # Developers and Viewers cannot write/modify projects
    raise ForbiddenException(
        "You do not have permission to update or delete this project"
    )


# Task permissions check helpers
async def check_task_read_permission(
    task: Task, user_id: UUID, db: AsyncSession
) -> None:
    # Fetch project
    project = await db.get(Project, task.project_id)
    if not project:
        raise NotFoundException("Project not found")
    await check_project_read_permission(project, user_id, db)


async def check_task_create_permission(
    project: Project, user_id: UUID, db: AsyncSession
) -> None:
    ws_role = await get_user_workspace_role_for_project(project, user_id, db)
    if not ws_role:
        raise ForbiddenException(
            "You do not have permission to create tasks for this project"
        )

    # Owners and Admins can create tasks
    if ws_role in (WorkspaceRole.OWNER, WorkspaceRole.ADMIN):
        return

    # Managers can create if they are owner or member
    if ws_role == WorkspaceRole.MANAGER:
        if project.owner_id == user_id:
            return
        stmt = select(ProjectMember).where(
            ProjectMember.project_id == project.id, ProjectMember.user_id == user_id
        )
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            return

    # Developers and Viewers cannot create tasks
    raise ForbiddenException(
        "You do not have permission to create tasks for this project"
    )


async def check_task_write_permission(
    task: Task, user_id: UUID, db: AsyncSession
) -> None:
    project = await db.get(Project, task.project_id)
    if not project:
        raise NotFoundException("Project not found")

    ws_role = await get_user_workspace_role_for_project(project, user_id, db)
    if not ws_role:
        raise ForbiddenException("You do not have permission to edit this task")

    # Owners and Admins can modify any task
    if ws_role in (WorkspaceRole.OWNER, WorkspaceRole.ADMIN):
        return

    # Managers can modify if project owner or member
    if ws_role == WorkspaceRole.MANAGER:
        if project.owner_id == user_id:
            return
        stmt = select(ProjectMember).where(
            ProjectMember.project_id == project.id, ProjectMember.user_id == user_id
        )
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            return

    # Developers can modify task status/priority ONLY if assigned to them
    if ws_role == WorkspaceRole.DEVELOPER and task.assignee_id == user_id:
        return

    raise ForbiddenException("You do not have permission to edit this task")


# Comment / Attachment permission helpers
async def check_comment_attach_permission(
    project_id: UUID, user_id: UUID, db: AsyncSession
) -> None:
    project = await db.get(Project, project_id)
    if not project:
        raise NotFoundException("Project not found")

    ws_role = await get_user_workspace_role_for_project(project, user_id, db)
    if not ws_role:
        raise ForbiddenException("You do not have permission to access this project")

    # Viewer has no comment/attach permissions
    if ws_role == WorkspaceRole.VIEWER:
        raise ForbiddenException("Viewers cannot upload attachments or post comments")

    # Developer, Manager, Admin, Owner can add comment/attachment if they have access to project
    await check_project_read_permission(project, user_id, db)
