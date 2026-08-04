import time

from fastapi import APIRouter, Depends

from src.ai.schemas.ai import (
    AIConfigResponse,
    AIHealthResponse,
    AITestRequest,
    AITestResponse,
)
from src.ai.services.ai import ai_service
from src.core.settings import settings
from src.dependencies.auth import get_current_active_user
from src.models.user import User
from src.schemas.response import APIResponse

router = APIRouter()


def is_provider_configured(key: str | None) -> bool:
    if not key:
        return False
    val = key.lower().strip()
    if not val or "placeholder" in val or "injected" in val or "change-this" in val:
        return False
    if "mock" in val:
        return settings.ENV_STATE in ("development", "testing")
    return True


@router.get("/config", response_model=APIResponse[AIConfigResponse])
async def get_ai_config(
    current_user: User = Depends(get_current_active_user),
) -> APIResponse[AIConfigResponse]:
    """
    Get current configured state of all LLM providers.
    """
    config_data = AIConfigResponse(
        active_provider=settings.AI_PROVIDER,
        openai_configured=is_provider_configured(settings.OPENAI_API_KEY),
        gemini_configured=is_provider_configured(settings.GEMINI_API_KEY),
        anthropic_configured=is_provider_configured(settings.ANTHROPIC_API_KEY),
    )
    return APIResponse(data=config_data)


@router.get("/health", response_model=APIResponse[AIHealthResponse])
async def get_ai_health(
    current_user: User = Depends(get_current_active_user),
) -> APIResponse[AIHealthResponse]:
    """
    Runs connectivity and configuration check across providers.
    """
    openai_provider = ai_service.get_provider("openai")
    gemini_provider = ai_service.get_provider("gemini")
    anthropic_provider = ai_service.get_provider("anthropic")

    openai_status = "unconfigured"
    if is_provider_configured(settings.OPENAI_API_KEY):
        try:
            openai_status = "healthy" if await openai_provider.health() else "unhealthy"
        except Exception:
            openai_status = "unhealthy"

    gemini_status = "unconfigured"
    if is_provider_configured(settings.GEMINI_API_KEY):
        try:
            gemini_status = "healthy" if await gemini_provider.health() else "unhealthy"
        except Exception:
            gemini_status = "unhealthy"

    anthropic_status = "unconfigured"
    if is_provider_configured(settings.ANTHROPIC_API_KEY):
        try:
            anthropic_status = (
                "healthy" if await anthropic_provider.health() else "unhealthy"
            )
        except Exception:
            anthropic_status = "unhealthy"

    return APIResponse(
        data=AIHealthResponse(
            openai=openai_status,
            gemini=gemini_status,
            anthropic=anthropic_status,
        )
    )


@router.post("/test", response_model=APIResponse[AITestResponse])
async def test_ai_generate(
    payload: AITestRequest,
    current_user: User = Depends(get_current_active_user),
) -> APIResponse[AITestResponse]:
    """
    Performs a connection test by generating content from the active or specified provider.
    """
    provider_name = payload.provider or settings.AI_PROVIDER

    start_time = time.perf_counter()
    result = await ai_service.generate(
        prompt=payload.prompt, provider_name=provider_name
    )
    latency = time.perf_counter() - start_time

    text = result.get("text", "")
    usage = result.get("usage", {})
    from src.ai.utils.token_count import estimate_tokens

    estimated_total = usage.get("total_tokens") or (
        estimate_tokens(payload.prompt) + estimate_tokens(text)
    )

    test_result = AITestResponse(
        text=text,
        provider=provider_name,
        latency=latency,
        estimated_tokens=estimated_total,
    )
    return APIResponse(data=test_result)
