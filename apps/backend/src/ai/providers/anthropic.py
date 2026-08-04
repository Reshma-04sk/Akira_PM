import json
import logging
from collections.abc import AsyncGenerator
from typing import Any

import httpx

from src.ai.providers.base import BaseLLMProvider
from src.core.exceptions import AppException
from src.core.settings import settings

logger = logging.getLogger("saas_backend")


class AnthropicProvider(BaseLLMProvider):
    def __init__(self):
        self.model = "claude-3-5-haiku-20241022"

    @property
    def api_key(self) -> str | None:
        return settings.ANTHROPIC_API_KEY

    async def generate(
        self, prompt: str, system_prompt: str | None = None, **kwargs
    ) -> dict[str, Any]:
        if not self.api_key:
            raise AppException("Anthropic API Key is not configured", status_code=500)

        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        payload = {
            "model": kwargs.get("model", self.model),
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": kwargs.get("max_tokens", 1024),
            "temperature": kwargs.get("temperature", 0.7),
        }

        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code != 200:
                    raise AppException(
                        f"Anthropic API error: {response.text}",
                        status_code=response.status_code,
                    )
                data = response.json()

                try:
                    text = data["content"][0]["text"]
                except (KeyError, IndexError) as e:
                    logger.error("Failed to parse Anthropic response: %s", str(e))
                    raise AppException(
                        "Invalid response structure from Anthropic API",
                        status_code=502,
                    ) from e

                usage = data.get("usage", {})
                prompt_tokens = usage.get("input_tokens", 0)
                completion_tokens = usage.get("output_tokens", 0)

                return {
                    "text": text,
                    "usage": {
                        "prompt_tokens": prompt_tokens,
                        "completion_tokens": completion_tokens,
                        "total_tokens": prompt_tokens + completion_tokens,
                    },
                    "raw_response": data,
                }
        except httpx.HTTPError as e:
            logger.error("Anthropic request failed: %s", str(e))
            raise AppException(
                f"Anthropic service unavailable: {str(e)}", status_code=503
            ) from e

    async def stream(
        self, prompt: str, system_prompt: str | None = None, **kwargs
    ) -> AsyncGenerator[str, None]:
        if not self.api_key:
            raise AppException("Anthropic API Key is not configured", status_code=500)

        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        payload = {
            "model": kwargs.get("model", self.model),
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": kwargs.get("max_tokens", 1024),
            "temperature": kwargs.get("temperature", 0.7),
            "stream": True,
        }

        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream(
                    "POST", url, json=payload, headers=headers
                ) as response:
                    if response.status_code != 200:
                        raise AppException(
                            f"Anthropic Stream failed with status {response.status_code}",
                            status_code=response.status_code,
                        )

                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line:
                            continue
                        if line.startswith("data: "):
                            data_str = line[6:]
                            try:
                                chunk_data = json.loads(data_str)
                                if chunk_data.get("type") == "content_block_delta":
                                    delta = chunk_data.get("delta", {})
                                    if delta.get("type") == "text_delta":
                                        yield delta.get("text", "")
                            except Exception:
                                continue
        except httpx.HTTPError as e:
            logger.error("Anthropic stream request failed: %s", str(e))
            raise AppException(
                f"Anthropic streaming error: {str(e)}", status_code=503
            ) from e

    async def health(self) -> bool:
        if not self.api_key or "mock" in self.api_key:
            if settings.ENV_STATE == "development":
                return True
            return False
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": "ping"}],
            "max_tokens": 1,
        }
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                return response.status_code == 200
        except Exception:
            return False
