import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.repositories.workspace_repository import WorkspaceRepository


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
async def test_rbac_rules(client: AsyncClient, db_session: AsyncSession) -> None:
    # 1. Register users: owner, manager, developer, viewer
    owner_headers = await get_auth_headers(client, "owner@example.com", "Owner User")
    manager_headers = await get_auth_headers(
        client, "manager@example.com", "Manager User"
    )
    dev_headers = await get_auth_headers(client, "dev@example.com", "Dev User")
    viewer_headers = await get_auth_headers(client, "viewer@example.com", "Viewer User")

    # Fetch User IDs
    WorkspaceRepository(db_session)
    ProjectRepository(db_session)
    TaskRepository(db_session)
    ProjectMemberRepository(db_session)

    # Initialize owner workspace
    ws_list_res = await client.get("/api/v1/workspaces", headers=owner_headers)
    workspace = ws_list_res.json()["data"]["items"][0]
    workspace_id = workspace["id"]

    # Map X-Workspace-ID headers
    owner_headers["X-Workspace-ID"] = workspace_id
    manager_headers["X-Workspace-ID"] = workspace_id
    dev_headers["X-Workspace-ID"] = workspace_id
    viewer_headers["X-Workspace-ID"] = workspace_id

    # Invite manager, dev, viewer to workspace
    await client.post(
        f"/api/v1/workspaces/{workspace_id}/members/invite",
        json={"email": "manager@example.com", "role": "manager"},
        headers=owner_headers,
    )
    dev_invite = await client.post(
        f"/api/v1/workspaces/{workspace_id}/members/invite",
        json={"email": "dev@example.com", "role": "developer"},
        headers=owner_headers,
    )
    dev_user_id = dev_invite.json()["data"]["user_id"]

    await client.post(
        f"/api/v1/workspaces/{workspace_id}/members/invite",
        json={"email": "viewer@example.com", "role": "viewer"},
        headers=owner_headers,
    )

    # 2. Test Project Creation
    # Developer tries to create a project - should fail (403)
    dev_proj_res = await client.post(
        "/api/v1/projects",
        json={"name": "Dev Project", "description": "Should fail"},
        headers=dev_headers,
    )
    assert dev_proj_res.status_code == 403

    # Viewer tries to create a project - should fail (403)
    viewer_proj_res = await client.post(
        "/api/v1/projects",
        json={"name": "Viewer Project", "description": "Should fail"},
        headers=viewer_headers,
    )
    assert viewer_proj_res.status_code == 403

    # Manager creates a project - should succeed (201)
    mgr_proj_res = await client.post(
        "/api/v1/projects",
        json={"name": "Manager Project", "description": "Should succeed"},
        headers=manager_headers,
    )
    assert mgr_proj_res.status_code == 201
    project_id = mgr_proj_res.json()["data"]["id"]

    # 3. Test Task Creation
    # Developer tries to create a task - should fail (403)
    dev_task_res = await client.post(
        "/api/v1/tasks",
        json={
            "title": "Dev Task",
            "project_id": project_id,
            "status": "todo",
            "priority": "medium",
        },
        headers=dev_headers,
    )
    assert dev_task_res.status_code == 403

    # Manager creates a task - should succeed (201)
    mgr_task_res = await client.post(
        "/api/v1/tasks",
        json={
            "title": "Manager Task",
            "project_id": project_id,
            "status": "todo",
            "priority": "medium",
        },
        headers=manager_headers,
    )
    assert mgr_task_res.status_code == 201
    task_id = mgr_task_res.json()["data"]["id"]

    # 4. Test Task Updates
    # Developer tries to update a task assigned to no one - should fail (403)
    dev_update_res = await client.patch(
        f"/api/v1/tasks/{task_id}",
        json={"title": "Updated by dev"},
        headers=dev_headers,
    )
    assert dev_update_res.status_code == 403

    # Assign task to Developer (we need Developer to be a project member first)
    pm_res = await client.post(
        f"/api/v1/project-members?project_id={project_id}",
        json={"user_id": dev_user_id, "role": "developer"},
        headers=manager_headers,
    )
    assert pm_res.status_code == 201

    # Assign task to Developer
    assign_res = await client.patch(
        f"/api/v1/tasks/{task_id}",
        json={"assignee_id": dev_user_id},
        headers=manager_headers,
    )
    assert assign_res.status_code == 200

    # Developer updates assigned task - should succeed (200)
    dev_update_res2 = await client.patch(
        f"/api/v1/tasks/{task_id}",
        json={"status": "in_progress"},
        headers=dev_headers,
    )
    assert dev_update_res2.status_code == 200

    # 5. Test Comment Actions
    # Viewer tries to comment - should fail (403)
    viewer_comment_res = await client.post(
        "/api/v1/comments",
        json={"task_id": task_id, "content": "Should fail"},
        headers=viewer_headers,
    )
    assert viewer_comment_res.status_code == 403

    # Developer comments on task - should succeed (201)
    dev_comment_res = await client.post(
        "/api/v1/comments",
        json={"task_id": task_id, "content": "Hello team!"},
        headers=dev_headers,
    )
    assert dev_comment_res.status_code == 201
