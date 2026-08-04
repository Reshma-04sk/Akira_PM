import logging
import time
from collections.abc import AsyncGenerator
from typing import Any

from src.ai.providers.anthropic import AnthropicProvider
from src.ai.providers.gemini import GeminiProvider
from src.ai.providers.openai import OpenAIProvider
from src.ai.utils.logging import log_ai_call
from src.ai.utils.security import check_rate_limit, sanitize_input, validate_prompt
from src.ai.utils.token_count import estimate_tokens
from src.core.exceptions import AppException
from src.core.settings import settings

logger = logging.getLogger("saas_backend")


class AIService:
    def __init__(self):
        self.providers = {
            "openai": OpenAIProvider(),
            "gemini": GeminiProvider(),
            "anthropic": AnthropicProvider(),
        }

    def get_provider(self, name: str | None = None):
        provider_name = name or settings.AI_PROVIDER
        provider_name = provider_name.lower().strip()
        if provider_name not in self.providers:
            raise AppException(
                f"Unsupported AI Provider: {provider_name}", status_code=400
            )
        return self.providers[provider_name]

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        provider_name: str | None = None,
        **kwargs,
    ) -> dict[str, Any]:
        """
        Coordinates request validation, rate limiting, LLM invocation, latency measurement,
        token estimation, and telemetry logging.
        """
        # Sanitization
        clean_prompt = sanitize_input(prompt)
        clean_system = sanitize_input(system_prompt) if system_prompt else None

        # Content validation
        validate_prompt(clean_prompt)

        # Token limit validation
        estimated_input_tokens = estimate_tokens(clean_prompt) + (
            estimate_tokens(clean_system) if clean_system else 0
        )
        if estimated_input_tokens > 4000:
            raise AppException(
                f"Input size estimates {estimated_input_tokens} tokens which exceeds the maximum limit of 4000.",
                status_code=422,
            )

        # Rate limiting check
        await check_rate_limit()

        # Retrieve active provider
        active_provider_name = provider_name or settings.AI_PROVIDER
        provider = self.get_provider(active_provider_name)

        # Time LLM latency
        start_time = time.perf_counter()
        try:
            result = await provider.generate(
                clean_prompt, system_prompt=clean_system, **kwargs
            )
            latency = time.perf_counter() - start_time

            # Compute estimated metrics
            text_out = result.get("text", "")
            usage = result.get("usage", {})
            p_tokens = usage.get("prompt_tokens") or estimated_input_tokens
            c_tokens = usage.get("completion_tokens") or estimate_tokens(text_out)
            total_tokens = usage.get("total_tokens") or (p_tokens + c_tokens)

            # Telemetry structured log
            log_ai_call(
                provider=active_provider_name,
                latency=latency,
                prompt_size=len(clean_prompt),
                completion_size=len(text_out),
                estimated_tokens=total_tokens,
            )

            return result
        except Exception as e:
            logger.error("AI service generation call failed: %s", str(e))
            raise

    async def stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        provider_name: str | None = None,
        **kwargs,
    ) -> AsyncGenerator[str, None]:
        """
        Streams response chunks from the chosen LLM provider.
        """
        # Sanitization
        clean_prompt = sanitize_input(prompt)
        clean_system = sanitize_input(system_prompt) if system_prompt else None

        # Content validation
        validate_prompt(clean_prompt)

        # Rate limiting check
        await check_rate_limit()

        active_provider_name = provider_name or settings.AI_PROVIDER
        provider = self.get_provider(active_provider_name)

        async for chunk in provider.stream(
            clean_prompt, system_prompt=clean_system, **kwargs
        ):
            yield chunk


ai_service = AIService()
