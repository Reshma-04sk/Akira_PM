import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_auth_api_flow(client: AsyncClient) -> None:
    # 1. Register endpoint
    reg_payload = {
        "email": "apitester@example.com",
        "password": "Password123!",
        "full_name": "API Tester"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    assert reg_res.json()["data"]["email"] == "apitester@example.com"

    # 2. Login endpoint
    login_payload = {
        "email": "apitester@example.com",
        "password": "Password123!"
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    data = login_res.json()["data"]
    access_token = data["access_token"]
    refresh_token = data["refresh_token"]

    # 3. Me endpoint (authenticated)
    headers = {"Authorization": f"Bearer {access_token}"}
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["data"]["email"] == "apitester@example.com"

    # 4. Refresh endpoint
    ref_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_res.status_code == 200
    new_refresh_token = ref_res.json()["data"]["refresh_token"]

    # 5. Logout endpoint
    logout_res = await client.post("/api/v1/auth/logout", json={"refresh_token": new_refresh_token})
    assert logout_res.status_code == 200
    assert logout_res.json()["data"]["message"] == "Logged out successfully"
