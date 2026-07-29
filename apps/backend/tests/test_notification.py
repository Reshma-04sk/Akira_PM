from uuid import UUID

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.notification import NotificationType
from src.models.project_member import ProjectRole
from src.models.user import UserRole
from src.repositories.notification_repository import NotificationRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.repositories.user_repository import UserRepository
from src.schemas.project_member import ProjectMemberCreate, ProjectMemberUpdate
from src.schemas.task import TaskCreate
from src.services.notification_service import NotificationService
from src.services.project_member_service import ProjectMemberService
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
async def test_notification_triggers_and_api(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    member_repo = ProjectMemberRepository(db_session)
    task_repo = TaskRepository(db_session)
    notification_repo = NotificationRepository(db_session)

    # Instantiate services
    task_service = TaskService(task_repo, project_repo, user_repo)
    member_service = ProjectMemberService(member_repo, project_repo, user_repo)
    notification_service = NotificationService(notification_repo)

    # Test API endpoints login
    headers = await get_auth_headers(client, "assignee_notif@example.com", "Assignee")
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assignee_id = UUID(me_res.json()["data"]["id"])

    # 1. Setup owner and project
    owner = await user_repo.create(
        {
            "email": "owner_notif@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Notif Proj", "owner_id": owner.id})

    # 2. Trigger PROJECT_INVITE notification
    await member_service.add_member(
        project.id,
        ProjectMemberCreate(user_id=assignee_id, role=ProjectRole.DEVELOPER),
        owner.id,
    )

    # Check notification exists for assignee
    notifs = await notification_service.list_notifications(user_id=assignee_id)
    assert notifs.total == 1
    assert notifs.items[0].type == NotificationType.PROJECT_INVITE

    # 3. Trigger TASK_ASSIGNED notification
    await task_service.create_task(
        TaskCreate(
            title="Assigned task",
            project_id=project.id,
            assignee_id=assignee_id,
        ),
        owner.id,
    )
    notifs = await notification_service.list_notifications(user_id=assignee_id)
    assert notifs.total == 2
    assert notifs.items[0].type == NotificationType.TASK_ASSIGNED

    # 4. Trigger ROLE_CHANGED notification
    await member_service.update_member_role(
        project.id,
        assignee_id,
        ProjectMemberUpdate(role=ProjectRole.MANAGER),
        owner.id,
    )
    notifs = await notification_service.list_notifications(user_id=assignee_id)
    assert notifs.total == 3
    assert notifs.items[0].type == NotificationType.ROLE_CHANGED

    # GET /notifications
    res = await client.get("/api/v1/notifications", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["total"] == 3
    notif_id = data["items"][0]["id"]

    # PATCH /notifications/{id}/read
    res = await client.patch(f"/api/v1/notifications/{notif_id}/read", headers=headers)
    assert res.status_code == 200
    assert res.json()["data"]["is_read"] is True

    # PATCH /notifications/read-all
    res = await client.patch("/api/v1/notifications/read-all", headers=headers)
    assert res.status_code == 200

    # DELETE /notifications/{id}
    res = await client.delete(f"/api/v1/notifications/{notif_id}", headers=headers)
    assert res.status_code == 204
