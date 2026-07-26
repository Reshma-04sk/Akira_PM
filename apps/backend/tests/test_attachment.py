from uuid import UUID

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.attachment_repository import AttachmentRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.repositories.user_repository import UserRepository
from src.schemas.task import TaskCreate
from src.services.task_service import TaskService


async def get_auth_headers(
    client: AsyncClient, email: str, name: str
) -> dict[str, str]:
    reg_payload = {
        "email": email,
        "password": "Password123!",
        "full_name": name,
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {"email": email, "password": "Password123!"}
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    access_token = login_res.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {access_token}"}


@pytest.mark.asyncio
async def test_attachment_service_and_api(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    ProjectMemberRepository(db_session)
    task_repo = TaskRepository(db_session)
    AttachmentRepository(db_session)

    # Services
    task_service = TaskService(task_repo, project_repo, user_repo)

    # 1. Setup users
    headers = await get_auth_headers(
        client, "attach_user@example.com", "Attach User"
    )
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_id = UUID(me_res.json()["data"]["id"])

    other_headers = await get_auth_headers(
        client, "attach_other@example.com", "Other User"
    )

    # 2. Setup project & task
    project = await project_repo.create(
        {"name": "Attach Proj", "owner_id": user_id}
    )
    task = await task_service.create_task(
        TaskCreate(
            title="Attach Task",
            project_id=project.id,
            assignee_id=user_id,
        ),
        user_id,
    )

    # 3. Test API upload
    file_content = b"Hello, this is a test attachment file content."
    file_data = {"file": ("test.txt", file_content, "text/plain")}
    form_data = {"task_id": str(task.id)}

    res = await client.post(
        "/api/v1/attachments",
        headers=headers,
        data=form_data,
        files=file_data,
    )
    assert res.status_code == 200
    data = res.json()["data"]
    attachment_id = data["id"]
    assert data["filename"] == "test.txt"

    # 4. Test API upload (Unauthorized)
    res = await client.post(
        "/api/v1/attachments",
        headers=other_headers,
        data=form_data,
        files=file_data,
    )
    assert res.status_code == 403

    # 5. Test API list
    res = await client.get(
        f"/api/v1/attachments?task_id={task.id}", headers=headers
    )
    assert res.status_code == 200
    assert len(res.json()["data"]) == 1

    # 6. Test API list (Unauthorized)
    res = await client.get(
        f"/api/v1/attachments?task_id={task.id}", headers=other_headers
    )
    assert res.status_code == 403

    # 7. Test API download
    res = await client.get(
        f"/api/v1/attachments/{attachment_id}", headers=headers
    )
    assert res.status_code == 200
    assert res.content == file_content

    # 8. Test API download (Unauthorized)
    res = await client.get(
        f"/api/v1/attachments/{attachment_id}", headers=other_headers
    )
    assert res.status_code == 403

    # 9. Test API delete (Unauthorized)
    res = await client.delete(
        f"/api/v1/attachments/{attachment_id}", headers=other_headers
    )
    assert res.status_code == 403

    # 10. Test API delete
    res = await client.delete(
        f"/api/v1/attachments/{attachment_id}", headers=headers
    )
    assert res.status_code == 204

    # Verify deleted
    res = await client.get(
        f"/api/v1/attachments?task_id={task.id}", headers=headers
    )
    assert len(res.json()["data"]) == 0
