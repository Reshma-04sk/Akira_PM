from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.user import User
from src.repositories.attachment_repository import AttachmentRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.schemas.attachment import AttachmentResponse
from src.schemas.response import APIResponse
from src.services.attachment_service import AttachmentService

router = APIRouter()


def get_attachment_service(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> AttachmentService:
    attachment_repo = AttachmentRepository(db)
    task_repo = TaskRepository(db)
    project_repo = ProjectRepository(db)
    member_repo = ProjectMemberRepository(db)
    return AttachmentService(attachment_repo, task_repo, project_repo, member_repo)


@router.post("", response_model=APIResponse[AttachmentResponse])
async def upload_attachment(
    task_id: UUID = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: AttachmentService = Depends(get_attachment_service),  # noqa: B008
) -> APIResponse[AttachmentResponse]:
    """
    Uploads a file attachment for a specific task.
    """
    content = await file.read()
    attachment = await service.upload_attachment(
        task_id=task_id,
        user_id=current_user.id,
        filename=file.filename,
        mime_type=file.content_type,
        file_size=len(content),
        content=content,
    )
    return APIResponse(data=attachment)


@router.get("", response_model=APIResponse[list[AttachmentResponse]])
async def list_attachments(
    task_id: UUID = Query(...),
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: AttachmentService = Depends(get_attachment_service),  # noqa: B008
) -> APIResponse[list[AttachmentResponse]]:
    """
    Lists all attachments for a specific task.
    """
    attachments = await service.list_attachments(task_id, current_user.id)
    return APIResponse(data=attachments)


@router.get("/{attachment_id}")
async def download_attachment(
    attachment_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: AttachmentService = Depends(get_attachment_service),  # noqa: B008
) -> FileResponse:
    """
    Downloads a specific attachment file.
    """
    file_path, filename, mime_type = await service.get_attachment_file(
        attachment_id, current_user.id
    )
    return FileResponse(path=file_path, filename=filename, media_type=mime_type)


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    attachment_id: UUID,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: AttachmentService = Depends(get_attachment_service),  # noqa: B008
) -> None:
    """
    Deletes a specific attachment file.
    """
    await service.delete_attachment(attachment_id, current_user.id)
