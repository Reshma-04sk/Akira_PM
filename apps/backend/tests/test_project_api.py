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
async def test_project_api_auth_required(client: AsyncClient) -> None:
    # Attempt operations without Authorization header
    res1 = await client.post("/api/v1/projects", json={"name": "No Auth"})
    assert res1.status_code == 401

    res2 = await client.get("/api/v1/projects")
    assert res2.status_code == 401


@pytest.mark.asyncio
async def test_project_api_crud_flow(client: AsyncClient) -> None:
    headers = await get_auth_headers(client, "user1@example.com", "First User")

    # 1. Create project
    payload = {"name": "API Project", "description": "API Desc"}
    create_res = await client.post("/api/v1/projects", json=payload, headers=headers)
    assert create_res.status_code == 201
    proj_data = create_res.json()["data"]
    assert proj_data["name"] == "API Project"
    assert proj_data["description"] == "API Desc"
    assert not proj_data["is_archived"]
    proj_id = proj_data["id"]

    # 2. Get project details
    get_res = await client.get(f"/api/v1/projects/{proj_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["name"] == "API Project"

    # 3. Update project
    update_res = await client.patch(
        f"/api/v1/projects/{proj_id}",
        json={"name": "New Project Name"},
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["name"] == "New Project Name"

    # 4. List projects
    list_res = await client.get("/api/v1/projects", headers=headers)
    assert list_res.status_code == 200
    list_data = list_res.json()["data"]
    assert list_data["total"] == 1
    assert len(list_data["items"]) == 1
    assert list_data["items"][0]["id"] == proj_id

    # 5. Delete project (soft delete)
    delete_res = await client.delete(f"/api/v1/projects/{proj_id}", headers=headers)
    assert delete_res.status_code == 204

    # 6. Retrieve deleted project
    get_deleted_res = await client.get(f"/api/v1/projects/{proj_id}", headers=headers)
    assert get_deleted_res.status_code == 404


@pytest.mark.asyncio
async def test_project_api_duplicate_name_validation(
    client: AsyncClient,
) -> None:
    headers = await get_auth_headers(client, "user2@example.com", "Second User")

    payload = {"name": "Project Alpha"}
    res1 = await client.post("/api/v1/projects", json=payload, headers=headers)
    assert res1.status_code == 201

    # Attempt to create duplicate name
    res2 = await client.post("/api/v1/projects", json=payload, headers=headers)
    assert res2.status_code == 422  # ValidationException maps to 422


@pytest.mark.asyncio
async def test_project_api_authorization_enforced(client: AsyncClient) -> None:
    headers_owner = await get_auth_headers(
        client, "owner_api@example.com", "Owner User"
    )
    headers_other = await get_auth_headers(
        client, "other_api@example.com", "Other User"
    )

    # Owner creates a project
    create_res = await client.post(
        "/api/v1/projects",
        json={"name": "Private API Project"},
        headers=headers_owner,
    )
    proj_id = create_res.json()["data"]["id"]

    # Other user attempts to get project
    res_get = await client.get(f"/api/v1/projects/{proj_id}", headers=headers_other)
    assert res_get.status_code == 403

    # Other user attempts to update project
    res_patch = await client.patch(
        f"/api/v1/projects/{proj_id}",
        json={"name": "Hack"},
        headers=headers_other,
    )
    assert res_patch.status_code == 403

    # Other user attempts to delete project
    res_delete = await client.delete(
        f"/api/v1/projects/{proj_id}", headers=headers_other
    )
    assert res_delete.status_code == 403


@pytest.mark.asyncio
async def test_project_api_pagination_and_search(client: AsyncClient) -> None:
    headers = await get_auth_headers(client, "paginated@example.com", "Paging User")

    # Create 3 projects
    await client.post(
        "/api/v1/projects", json={"name": "Alpha Project"}, headers=headers
    )
    await client.post(
        "/api/v1/projects", json={"name": "Beta Project"}, headers=headers
    )
    await client.post(
        "/api/v1/projects", json={"name": "Gamma Project"}, headers=headers
    )

    # Test search filter
    search_res = await client.get("/api/v1/projects?search=Beta", headers=headers)
    assert search_res.status_code == 200
    search_data = search_res.json()["data"]
    assert search_data["total"] == 1
    assert search_data["items"][0]["name"] == "Beta Project"

    # Test pagination
    paging_res = await client.get(
        "/api/v1/projects?page=2&page_size=1", headers=headers
    )
    assert paging_res.status_code == 200
    paging_data = paging_res.json()["data"]
    assert paging_data["total"] == 3
    assert len(paging_data["items"]) == 1
    assert paging_data["page"] == 2
    assert paging_data["page_size"] == 1
