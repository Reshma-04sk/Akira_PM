import logging
from uuid import UUID

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
    ValidationException,
)
from src.core.redis import invalidate_dashboard_cache
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.project_repository import ProjectRepository
from src.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)

logger = logging.getLogger("saas_backend")


class ProjectService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        audit_log_repository: AuditLogRepository | None = None,
    ):
        self.project_repository = project_repository
        self.audit_log_repository = audit_log_repository

    async def create_project(
        self, data: ProjectCreate, owner_id: UUID
    ) -> ProjectResponse:
        from src.dependencies.permissions import WorkspaceRole
        from src.services.workspace_service import get_user_workspace_context

        # Resolve active/default workspace context
        workspace, ws_role = await get_user_workspace_context(
            owner_id, self.project_repository.session
        )

        # Only Owner, Admin, and Manager roles can create projects
        if ws_role in (WorkspaceRole.DEVELOPER, WorkspaceRole.VIEWER):
            raise ForbiddenException(
                "You do not have permission to create projects in this workspace"
            )

        # Check duplicate name for this workspace/owner
        if await self.project_repository.exists_by_name_for_owner(data.name, owner_id):
            raise ValidationException(
                f"An active project named '{data.name}' already exists for this user"
            )

        project_attributes = {
            "name": data.name.strip(),
            "description": data.description,
            "owner_id": owner_id,
            "workspace_id": workspace.id,
            "is_archived": False,
        }
        project = await self.project_repository.create(project_attributes)
        logger.info("New project created successfully: %s", project.id)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": owner_id,
                    "action": "project_create",
                    "entity_type": "project",
                    "entity_id": str(project.id),
                    "details": {
                        "name": project.name,
                        "workspace_id": str(workspace.id),
                    },
                }
            )

        await invalidate_dashboard_cache(user_ids=[owner_id])
        return ProjectResponse.model_validate(project)

    async def get_project(self, project_id: UUID, user_id: UUID) -> ProjectResponse:
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project not found")

        # Verify access using RBAC permissions
        from src.dependencies.permissions import check_project_read_permission

        await check_project_read_permission(
            project, user_id, self.project_repository.session
        )

        return ProjectResponse.model_validate(project)

    async def list_projects(
        self,
        *,
        owner_id: UUID,
        workspace_id: UUID | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> ProjectListResponse:
        # If no workspace_id was passed, resolve default workspace for owner_id
        if not workspace_id:
            from src.services.workspace_service import get_user_workspace_context

            workspace, role = await get_user_workspace_context(
                owner_id, self.project_repository.session
            )
            workspace_id = workspace.id

        # Get projects list and count for the workspace
        items, total = await self.project_repository.list_projects(
            owner_id=owner_id,
            workspace_id=workspace_id,
            search=search,
            page=page,
            page_size=page_size,
        )

        return ProjectListResponse(
            items=[ProjectResponse.model_validate(proj) for proj in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def update_project(
        self, project_id: UUID, data: ProjectUpdate, user_id: UUID
    ) -> ProjectResponse:
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project not found")

        # Verify write permissions using RBAC helper
        from src.dependencies.permissions import check_project_write_permission

        await check_project_write_permission(
            project, user_id, self.project_repository.session
        )

        update_attrs = {}
        # If name is updated, check for duplicate name
        if data.name is not None:
            new_name = data.name.strip()
            if new_name != project.name:
                if await self.project_repository.exists_by_name_for_owner(
                    new_name, user_id
                ):
                    raise ValidationException(
                        f"An active project named '{new_name}' "
                        "already exists for this user"
                    )
                update_attrs["name"] = new_name

        if data.description is not None:
            update_attrs["description"] = data.description

        if data.is_archived is not None:
            update_attrs["is_archived"] = data.is_archived

        # Perform update
        if update_attrs:
            project = await self.project_repository.update(project, update_attrs)
            logger.info("Project updated successfully: %s", project.id)

            if self.audit_log_repository:
                await self.audit_log_repository.create(
                    {
                        "user_id": user_id,
                        "action": "project_update",
                        "entity_type": "project",
                        "entity_id": str(project.id),
                        "details": update_attrs,
                    }
                )

        await invalidate_dashboard_cache(user_ids=[user_id], project_ids=[project_id])
        return ProjectResponse.model_validate(project)

    async def delete_project(self, project_id: UUID, user_id: UUID) -> None:
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project not found")

        # Verify delete permissions using RBAC helper
        from src.dependencies.permissions import check_project_write_permission

        await check_project_write_permission(
            project, user_id, self.project_repository.session
        )

        # Perform soft delete
        await self.project_repository.soft_delete(project)
        logger.info("Project soft-deleted successfully: %s", project.id)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": user_id,
                    "action": "project_delete",
                    "entity_type": "project",
                    "entity_id": str(project.id),
                    "details": {"is_archived": True},
                }
            )
        await invalidate_dashboard_cache(user_ids=[user_id], project_ids=[project_id])
