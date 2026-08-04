from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from src.ai.prompts.templates import render_prompt
from src.ai.services.ai import ai_service
from src.ai.utils.security import sanitize_input, validate_prompt
from src.ai.utils.token_count import estimate_tokens
from src.core.exceptions import AppException


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


def test_sanitize_input():
    assert sanitize_input("<script>alert(1)</script> hello") == "alert(1) hello"
    assert sanitize_input("  leading and trailing  ") == "leading and trailing"
    assert sanitize_input(None) == ""


def test_validate_prompt():
    with pytest.raises(AppException) as exc:
        validate_prompt("")
    assert exc.value.status_code == 422

    with pytest.raises(AppException) as exc:
        validate_prompt("a" * 8001)
    assert exc.value.status_code == 422


def test_estimate_tokens():
    assert estimate_tokens("") == 0
    assert estimate_tokens("hello world") == 2
    assert estimate_tokens("a" * 100) == 25


def test_render_prompt():
    rendered = render_prompt(
        "task_summary",
        title="Test Task",
        description="Detailed description",
        status="todo",
        priority="high",
    )
    assert "Test Task" in rendered["user"]
    assert "professional project manager" in rendered["system"].lower()

    with pytest.raises(ValueError):
        render_prompt("invalid_template_name", title="abc")


@pytest.mark.asyncio
async def test_ai_service_orchestration():
    mock_response = {
        "text": "This is a mock completion",
        "usage": {"prompt_tokens": 10, "completion_tokens": 15, "total_tokens": 25},
        "raw_response": {
            "choices": [{"message": {"content": "This is a mock completion"}}]
        },
    }

    with patch(
        "src.ai.providers.openai.OpenAIProvider.generate", new_callable=AsyncMock
    ) as mock_gen:
        mock_gen.return_value = mock_response

        res = await ai_service.generate(
            prompt="Hello!", provider_name="openai", temperature=0.5
        )

        assert res["text"] == "This is a mock completion"
        assert res["usage"]["total_tokens"] == 25
        mock_gen.assert_called_once_with("Hello!", system_prompt=None, temperature=0.5)


@pytest.mark.asyncio
async def test_api_config_endpoint(client: AsyncClient):
    headers = await get_auth_headers(client, "ai_test@example.com", "AI User")
    response = await client.get("/api/v1/ai/config", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "active_provider" in data["data"]
    assert "openai_configured" in data["data"]


@pytest.mark.asyncio
async def test_api_health_endpoint(client: AsyncClient):
    headers = await get_auth_headers(client, "ai_health@example.com", "AI User")

    with patch(
        "src.ai.providers.openai.OpenAIProvider.health", new_callable=AsyncMock
    ) as mock_oa_health, patch(
        "src.ai.providers.gemini.GeminiProvider.health", new_callable=AsyncMock
    ) as mock_gem_health, patch(
        "src.ai.providers.anthropic.AnthropicProvider.health", new_callable=AsyncMock
    ) as mock_ant_health:

        mock_oa_health.return_value = True
        mock_gem_health.return_value = False
        mock_ant_health.return_value = True

        with patch("src.core.settings.settings.OPENAI_API_KEY", "mock-key"), patch(
            "src.core.settings.settings.GEMINI_API_KEY", "mock-key"
        ), patch("src.core.settings.settings.ANTHROPIC_API_KEY", "mock-key"):

            response = await client.get("/api/v1/ai/health", headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert data["data"]["openai"] == "healthy"
            assert data["data"]["gemini"] == "unhealthy"
            assert data["data"]["anthropic"] == "healthy"


@pytest.mark.asyncio
async def test_api_test_endpoint(client: AsyncClient):
    headers = await get_auth_headers(
        client, "ai_generate_test@example.com", "AI User"
    )

    mock_response = {
        "text": "Hello test generation",
        "usage": {"prompt_tokens": 5, "completion_tokens": 5, "total_tokens": 10},
        "raw_response": {},
    }

    with patch("src.ai.services.ai.AIService.generate", new_callable=AsyncMock) as mock_service_gen:
        mock_service_gen.return_value = mock_response

        test_payload = {"prompt": "Test connection prompt", "provider": "gemini"}

        response = await client.post(
            "/api/v1/ai/test", json=test_payload, headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["text"] == "Hello test generation"
        assert data["data"]["provider"] == "gemini"
        assert data["data"]["estimated_tokens"] == 10
