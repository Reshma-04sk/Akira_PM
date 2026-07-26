from uuid import UUID

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.repositories.user_repository import UserRepository
from src.schemas.task import TaskCreate
from src.services.dashboard_service import DashboardService
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
async def test_dashboard_service_and_api(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    member_repo = ProjectMemberRepository(db_session)
    task_repo = TaskRepository(db_session)
    audit_repo = AuditLogRepository(db_session)

    # Services
    task_service = TaskService(task_repo, project_repo, user_repo)
    dashboard_service = DashboardService(
        project_repo, task_repo, member_repo, audit_repo
    )

    # 1. Register/Login user via API
    headers = await get_auth_headers(
        client, "dash_user@example.com", "Dash User"
    )
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_id = UUID(me_res.json()["data"]["id"])

    # 2. Register/Login another user (non-member)
    non_member_headers = await get_auth_headers(
        client, "dash_other@example.com", "Other User"
    )

    # 3. Create projects & tasks
    proj1 = await project_repo.create({"name": "Proj 1", "owner_id": user_id})
    await project_repo.create({"name": "Proj 2", "owner_id": user_id})

    # Add audit log entries
    await audit_repo.create(
        {
            "user_id": user_id,
            "action": "project_create",
            "entity_type": "project",
            "entity_id": str(proj1.id),
        }
    )

    # Create tasks
    await task_service.create_task(
        TaskCreate(
            title="Task 1",
            project_id=proj1.id,
            assignee_id=user_id,
        ),
        user_id,
    )

    # 4. Service Tests
    overview = await dashboard_service.get_overview(user_id)
    assert overview.projects_count == 2
    assert overview.tasks_count == 1
    assert overview.pending_tasks == 1

    activity = await dashboard_service.get_activity(user_id)
    assert len(activity.activities) > 0

    my_tasks = await dashboard_service.get_my_tasks(user_id)
    assert my_tasks.total == 1
    assert my_tasks.items[0].title == "Task 1"

    proj_dashboard = await dashboard_service.get_project_dashboard(
        proj1.id, user_id
    )
    assert proj_dashboard.tasks_count == 1

    # 5. API Tests
    # GET /dashboard/overview
    res = await client.get("/api/v1/dashboard/overview", headers=headers)
    assert res.status_code == 200
    assert res.json()["data"]["projects_count"] == 2

    # GET /dashboard/activity
    res = await client.get("/api/v1/dashboard/activity", headers=headers)
    assert res.status_code == 200
    assert len(res.json()["data"]["activities"]) > 0

    # GET /dashboard/my-tasks
    res = await client.get("/api/v1/dashboard/my-tasks", headers=headers)
    assert res.status_code == 200
    assert res.json()["data"]["total"] == 1

    # GET /dashboard/project/{id} (Authorized)
    res = await client.get(
        f"/api/v1/dashboard/project/{proj1.id}", headers=headers
    )
    assert res.status_code == 200
    assert res.json()["data"]["tasks_count"] == 1

    # GET /dashboard/project/{id} (Unauthorized - 403 Forbidden)
    res = await client.get(
        f"/api/v1/dashboard/project/{proj1.id}", headers=non_member_headers
    )
    assert res.status_code == 403
