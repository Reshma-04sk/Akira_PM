import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


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
async def test_user_settings_flow(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    headers = await get_auth_headers(
        client, "settings_tester@example.com", "Settings Tester"
    )

    # 1. Get current profile (GET /users/me)
    me_res = await client.get("/api/v1/users/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()["data"]
    assert me_data["email"] == "settings_tester@example.com"
    assert me_data["full_name"] == "Settings Tester"
    assert me_data["avatar_url"] is None
    assert me_data["notification_preferences"] is None

    # 2. Update profile (PUT /users/profile)
    update_payload = {
        "full_name": "Updated Name",
        "avatar_url": "https://example.com/avatar.png",
        "notification_preferences": {"email": True, "browser": False},
    }
    update_res = await client.put(
        "/api/v1/users/profile", json=update_payload, headers=headers
    )
    assert update_res.status_code == 200
    update_data = update_res.json()["data"]
    assert update_data["full_name"] == "Updated Name"
    assert update_data["avatar_url"] == "https://example.com/avatar.png"
    assert update_data["notification_preferences"] == {"email": True, "browser": False}

    # Verify via GET /users/me
    me_res2 = await client.get("/api/v1/users/me", headers=headers)
    assert me_res2.status_code == 200
    me_data2 = me_res2.json()["data"]
    assert me_data2["full_name"] == "Updated Name"
    assert me_data2["avatar_url"] == "https://example.com/avatar.png"
    assert me_data2["notification_preferences"] == {"email": True, "browser": False}

    # 3. Change password (POST /users/change-password)
    # Incorrect old password should fail (400 / ValidationException)
    bad_password_payload = {
        "old_password": "WrongPassword!",
        "new_password": "NewPassword123!",
    }
    pwd_fail_res = await client.post(
        "/api/v1/users/change-password", json=bad_password_payload, headers=headers
    )
    assert pwd_fail_res.status_code == 422

    # Correct password change
    good_password_payload = {
        "old_password": "Password123!",
        "new_password": "NewPassword123!",
    }
    pwd_success_res = await client.post(
        "/api/v1/users/change-password", json=good_password_payload, headers=headers
    )
    assert pwd_success_res.status_code == 200

    # Login with old password should fail
    old_login_payload = {
        "email": "settings_tester@example.com",
        "password": "Password123!",
    }
    old_login_res = await client.post("/api/v1/auth/login", json=old_login_payload)
    assert old_login_res.status_code == 401

    # Login with new password should succeed
    new_login_payload = {
        "email": "settings_tester@example.com",
        "password": "NewPassword123!",
    }
    new_login_res = await client.post("/api/v1/auth/login", json=new_login_payload)
    assert new_login_res.status_code == 200
    assert "access_token" in new_login_res.json()["data"]
