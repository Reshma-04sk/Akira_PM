import os
import uuid
from uuid import UUID

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
)
from src.repositories.attachment_repository import AttachmentRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.schemas.attachment import AttachmentResponse

UPLOAD_DIR = "uploads"


class AttachmentService:
    def __init__(
        self,
        attachment_repository: AttachmentRepository,
        task_repository: TaskRepository,
        project_repository: ProjectRepository,
        project_member_repository: ProjectMemberRepository,
    ):
        self.attachment_repository = attachment_repository
        self.task_repository = task_repository
        self.project_repository = project_repository
        self.project_member_repository = project_member_repository

    async def _verify_project_membership(self, project_id: UUID, user_id: UUID) -> None:
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project not found")

        if project.owner_id == user_id:
            return

        is_member = await self.project_member_repository.exists(project_id, user_id)
        if not is_member:
            raise ForbiddenException(
                "You do not have permission to access attachments for this project"
            )

    async def upload_attachment(
        self,
        task_id: UUID,
        user_id: UUID,
        filename: str,
        mime_type: str,
        file_size: int,
        content: bytes,
    ) -> AttachmentResponse:
        task = await self.task_repository.get_by_id(task_id)
        if not task:
            raise NotFoundException("Task not found")

        await self._verify_project_membership(task.project_id, user_id)

        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        # Generate unique local filename
        unique_id = uuid.uuid4()
        local_filename = f"{unique_id}_{filename}"
        file_path = os.path.join(UPLOAD_DIR, local_filename)

        # Save file to disk
        with open(file_path, "wb") as f:
            f.write(content)

        attrs = {
            "id": unique_id,
            "task_id": task_id,
            "uploaded_by": user_id,
            "filename": filename,
            "file_path": file_path,
            "mime_type": mime_type,
            "file_size": file_size,
        }
        attachment = await self.attachment_repository.create(attrs)
        return AttachmentResponse.model_validate(attachment)

    async def get_attachment_file(
        self, attachment_id: UUID, user_id: UUID
    ) -> tuple[str, str, str]:
        """
        Returns (file_path, filename, mime_type) if authorized.
        """
        attachment = await self.attachment_repository.get_by_id(attachment_id)
        if not attachment:
            raise NotFoundException("Attachment not found")

        task = await self.task_repository.get_by_id(attachment.task_id)
        if not task:
            raise NotFoundException("Task not found")

        await self._verify_project_membership(task.project_id, user_id)

        if not os.path.exists(attachment.file_path):
            raise NotFoundException("File not found on disk")

        return attachment.file_path, attachment.filename, attachment.mime_type

    async def delete_attachment(self, attachment_id: UUID, user_id: UUID) -> None:
        attachment = await self.attachment_repository.get_by_id(attachment_id)
        if not attachment:
            raise NotFoundException("Attachment not found")

        task = await self.task_repository.get_by_id(attachment.task_id)
        if not task:
            raise NotFoundException("Task not found")

        project = await self.project_repository.get_by_id(task.project_id)
        if not project:
            raise NotFoundException("Project not found")

        # Get user role in the project
        actor_role = None
        if project.owner_id == user_id:
            actor_role = "OWNER"
        else:
            member = await self.project_member_repository.get_membership(
                project.id, user_id
            )
            if member:
                actor_role = (
                    member.role.value
                    if hasattr(member.role, "value")
                    else str(member.role)
                )

        # Check permissions: only uploader, project owner, or project manager can delete
        is_uploader = attachment.uploaded_by == user_id
        is_owner_or_mgr = actor_role in ("OWNER", "MANAGER")

        if not (is_uploader or is_owner_or_mgr):
            raise ForbiddenException(
                "You do not have permission to delete this attachment"
            )

        # Delete from disk
        if os.path.exists(attachment.file_path):
            try:
                os.remove(attachment.file_path)
            except Exception:
                pass

        # Delete from DB
        await self.attachment_repository.delete(attachment)

    async def list_attachments(
        self, task_id: UUID, user_id: UUID
    ) -> list[AttachmentResponse]:
        task = await self.task_repository.get_by_id(task_id)
        if not task:
            raise NotFoundException("Task not found")

        await self._verify_project_membership(task.project_id, user_id)

        attachments = await self.attachment_repository.list_attachments(task_id)
        return [AttachmentResponse.model_validate(a) for a in attachments]
