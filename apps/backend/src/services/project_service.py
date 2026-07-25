import logging
from uuid import UUID

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
    ValidationException,
)
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
        # Check duplicate name for this owner
        if await self.project_repository.exists_by_name_for_owner(
            data.name, owner_id
        ):
            raise ValidationException(
                f"An active project named '{data.name}' "
                "already exists for this user"
            )

        project_attributes = {
            "name": data.name.strip(),
            "description": data.description,
            "owner_id": owner_id,
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
                    "details": {"name": project.name},
                }
            )

        return ProjectResponse.model_validate(project)

    async def get_project(
        self, project_id: UUID, user_id: UUID
    ) -> ProjectResponse:
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project not found")

        # Verify access: only the project owner can access the project details
        if project.owner_id != user_id:
            raise ForbiddenException(
                "You do not have permission to access this project"
            )

        return ProjectResponse.model_validate(project)

    async def list_projects(
        self,
        *,
        owner_id: UUID,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> ProjectListResponse:
        # Get projects list and count for the owner
        items, total = await self.project_repository.list_projects(
            owner_id=owner_id,
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

        # Business Rule: Only the project owner can update
        if project.owner_id != user_id:
            raise ForbiddenException(
                "You do not have permission to update this project"
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
            project = await self.project_repository.update(
                project, update_attrs
            )
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

        return ProjectResponse.model_validate(project)

    async def delete_project(self, project_id: UUID, user_id: UUID) -> None:
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project not found")

        # Business Rule: Only the project owner can delete
        if project.owner_id != user_id:
            raise ForbiddenException(
                "You do not have permission to delete this project"
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
