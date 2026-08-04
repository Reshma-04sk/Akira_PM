import pytest
from httpx import AsyncClient


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
async def test_task_api_auth_required(client: AsyncClient) -> None:
    res = await client.get("/api/v1/tasks")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_task_api_crud_flow(client: AsyncClient) -> None:
    headers_owner = await get_auth_headers(
        client, "owner_task@example.com", "Owner User"
    )

    # Create project first
    proj_res = await client.post(
        "/api/v1/projects", json={"name": "Proj 1"}, headers=headers_owner
    )
    project_id = proj_res.json()["data"]["id"]

    # 1. Create task
    task_payload = {
        "title": "API Task",
        "description": "API Desc",
        "status": "todo",
        "priority": "high",
        "project_id": project_id,
    }
    create_res = await client.post(
        "/api/v1/tasks", json=task_payload, headers=headers_owner
    )
    assert create_res.status_code == 201
    task_data = create_res.json()["data"]
    assert task_data["title"] == "API Task"
    task_id = task_data["id"]

    # 2. Get task details
    get_res = await client.get(f"/api/v1/tasks/{task_id}", headers=headers_owner)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["title"] == "API Task"

    # 3. Update task
    update_res = await client.patch(
        f"/api/v1/tasks/{task_id}",
        json={"title": "Updated API Task", "status": "in_progress"},
        headers=headers_owner,
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["title"] == "Updated API Task"
    assert update_res.json()["data"]["status"] == "in_progress"

    # 4. List tasks
    list_res = await client.get(
        f"/api/v1/tasks?project_id={project_id}", headers=headers_owner
    )
    assert list_res.status_code == 200
    list_data = list_res.json()["data"]
    assert list_data["total"] == 1
    assert list_data["items"][0]["id"] == task_id

    # 5. Delete task
    delete_res = await client.delete(f"/api/v1/tasks/{task_id}", headers=headers_owner)
    assert delete_res.status_code == 204

    # 6. Retrieve deleted task
    get_deleted_res = await client.get(
        f"/api/v1/tasks/{task_id}", headers=headers_owner
    )
    assert get_deleted_res.status_code == 404


@pytest.mark.asyncio
async def test_task_api_authorization_enforced(client: AsyncClient) -> None:
    headers_owner = await get_auth_headers(
        client, "owner_task2@example.com", "Owner User"
    )
    headers_other = await get_auth_headers(
        client, "other_task2@example.com", "Other User"
    )

    # Owner creates project
    proj_res = await client.post(
        "/api/v1/projects", json={"name": "Proj 2"}, headers=headers_owner
    )
    project_id = proj_res.json()["data"]["id"]

    # Other user attempts to create task on owner's project
    res_create = await client.post(
        "/api/v1/tasks",
        json={"title": "Hack", "project_id": project_id},
        headers=headers_other,
    )
    assert res_create.status_code == 403

    # Owner creates task
    task_res = await client.post(
        "/api/v1/tasks",
        json={"title": "Private Task", "project_id": project_id},
        headers=headers_owner,
    )
    task_id = task_res.json()["data"]["id"]

    # Other user attempts to get task
    res_get = await client.get(f"/api/v1/tasks/{task_id}", headers=headers_other)
    assert res_get.status_code == 403

    # Other user attempts to update task
    res_patch = await client.patch(
        f"/api/v1/tasks/{task_id}",
        json={"title": "Hack title"},
        headers=headers_other,
    )
    assert res_patch.status_code == 403

    # Other user attempts to delete task
    res_delete = await client.delete(f"/api/v1/tasks/{task_id}", headers=headers_other)
    assert res_delete.status_code == 403


@pytest.mark.asyncio
async def test_task_api_validation_checks(client: AsyncClient) -> None:
    headers = await get_auth_headers(client, "owner_task3@example.com", "Owner User")

    import uuid

    # Create task with non-existent project
    res1 = await client.post(
        "/api/v1/tasks",
        json={"title": "No Project", "project_id": str(uuid.uuid4())},
        headers=headers,
    )
    assert res1.status_code == 404

    # Create project
    proj_res = await client.post(
        "/api/v1/projects", json={"name": "Proj 3"}, headers=headers
    )
    project_id = proj_res.json()["data"]["id"]

    # Create task with duplicate title
    res2 = await client.post(
        "/api/v1/tasks",
        json={"title": "Dup", "project_id": project_id},
        headers=headers,
    )
    assert res2.status_code == 201

    res3 = await client.post(
        "/api/v1/tasks",
        json={"title": "Dup", "project_id": project_id},
        headers=headers,
    )
    assert res3.status_code == 422


@pytest.mark.asyncio
async def test_task_api_pagination_search_and_filters(
    client: AsyncClient,
) -> None:
    headers = await get_auth_headers(client, "owner_task4@example.com", "Owner User")

    # Create project
    proj_res = await client.post(
        "/api/v1/projects", json={"name": "Proj 4"}, headers=headers
    )
    project_id = proj_res.json()["data"]["id"]

    # Create tasks
    await client.post(
        "/api/v1/tasks",
        json={
            "title": "Alpha Task",
            "project_id": project_id,
            "status": "todo",
            "priority": "low",
        },
        headers=headers,
    )
    await client.post(
        "/api/v1/tasks",
        json={
            "title": "Beta Task",
            "project_id": project_id,
            "status": "in_progress",
            "priority": "high",
        },
        headers=headers,
    )

    # Search filter
    res_search = await client.get(
        f"/api/v1/tasks?project_id={project_id}&search=Alpha", headers=headers
    )
    assert res_search.status_code == 200
    assert res_search.json()["data"]["total"] == 1
    assert res_search.json()["data"]["items"][0]["title"] == "Alpha Task"

    # Status filter
    res_status = await client.get(
        f"/api/v1/tasks?project_id={project_id}&status=in_progress",
        headers=headers,
    )
    assert res_status.status_code == 200
    assert res_status.json()["data"]["total"] == 1
    assert res_status.json()["data"]["items"][0]["title"] == "Beta Task"

    # Priority filter
    res_priority = await client.get(
        f"/api/v1/tasks?project_id={project_id}&priority=high", headers=headers
    )
    assert res_priority.status_code == 200
    assert res_priority.json()["data"]["total"] == 1
    assert res_priority.json()["data"]["items"][0]["title"] == "Beta Task"

    # Pagination
    res_page = await client.get(
        f"/api/v1/tasks?project_id={project_id}&page=1&page_size=1",
        headers=headers,
    )
    assert res_page.status_code == 200
    assert res_page.json()["data"]["total"] == 2
    assert len(res_page.json()["data"]["items"]) == 1


@pytest.mark.asyncio
async def test_task_api_invalid_query_params(client: AsyncClient) -> None:
    headers = await get_auth_headers(
        client, "owner_invalid_query@example.com", "Owner User"
    )

    # Create project
    proj_res = await client.post(
        "/api/v1/projects", json={"name": "Proj Invalid Query"}, headers=headers
    )
    project_id = proj_res.json()["data"]["id"]

    # Request with invalid status
    res1 = await client.get(
        f"/api/v1/tasks?project_id={project_id}&status=invalid_status_val",
        headers=headers,
    )
    assert res1.status_code == 422

    # Request with invalid priority
    res2 = await client.get(
        f"/api/v1/tasks?project_id={project_id}&priority=invalid_priority_val",
        headers=headers,
    )
    assert res2.status_code == 422


@pytest.mark.asyncio
async def test_task_api_empty_title_validation(client: AsyncClient) -> None:
    headers = await get_auth_headers(
        client, "owner_empty_title@example.com", "Owner User"
    )

    # Create project
    proj_res = await client.post(
        "/api/v1/projects", json={"name": "Proj Empty Title"}, headers=headers
    )
    project_id = proj_res.json()["data"]["id"]

    # Attempt to create task with empty title
    res = await client.post(
        "/api/v1/tasks",
        json={"title": "   ", "project_id": project_id},
        headers=headers,
    )
    assert res.status_code == 422
    assert "Title cannot be empty or whitespace only" in res.json()["error"]["message"]


@pytest.mark.asyncio
async def test_task_api_assignee_not_member_validation(client: AsyncClient) -> None:
    headers_owner = await get_auth_headers(
        client, "owner_assignee_api@example.com", "Owner User"
    )
    headers_other = await get_auth_headers(
        client, "other_assignee_api@example.com", "Other User"
    )

    # Create project
    proj_res = await client.post(
        "/api/v1/projects", json={"name": "Proj Assignee API"}, headers=headers_owner
    )
    project_id = proj_res.json()["data"]["id"]

    # Get other user's ID
    me_res = await client.get("/api/v1/auth/me", headers=headers_other)
    other_id = me_res.json()["data"]["id"]

    # Attempt to assign task to other user who is not a member
    res = await client.post(
        "/api/v1/tasks",
        json={
            "title": "Unassignable Task",
            "project_id": project_id,
            "assignee_id": other_id,
        },
        headers=headers_owner,
    )
    assert res.status_code == 422
    assert "Assignee must be a member of the project" in res.json()["error"]["message"]
