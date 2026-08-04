import json
import logging
from collections.abc import AsyncGenerator
from typing import Any

import httpx

from src.ai.providers.base import BaseLLMProvider
from src.core.exceptions import AppException
from src.core.settings import settings

logger = logging.getLogger("saas_backend")


class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        self.model = "gpt-4o-mini"

    @property
    def api_key(self) -> str | None:
        return settings.OPENAI_API_KEY

    async def generate(
        self, prompt: str, system_prompt: str | None = None, **kwargs
    ) -> dict[str, Any]:
        if not self.api_key:
            raise AppException("OpenAI API Key is not configured", status_code=500)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": kwargs.get("model", self.model),
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 1024),
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    json=payload,
                    headers=headers,
                )
                if response.status_code != 200:
                    raise AppException(
                        f"OpenAI API error: {response.text}",
                        status_code=response.status_code,
                    )
                data = response.json()
                choice = data["choices"][0]
                text = choice["message"]["content"]
                usage = data.get("usage", {})
                return {
                    "text": text,
                    "usage": {
                        "prompt_tokens": usage.get("prompt_tokens", 0),
                        "completion_tokens": usage.get("completion_tokens", 0),
                        "total_tokens": usage.get("total_tokens", 0),
                    },
                    "raw_response": data,
                }
        except httpx.HTTPError as e:
            logger.error("OpenAI request failed: %s", str(e))
            raise AppException(
                f"OpenAI service unavailable: {str(e)}", status_code=503
            ) from e

    async def stream(
        self, prompt: str, system_prompt: str | None = None, **kwargs
    ) -> AsyncGenerator[str, None]:
        if not self.api_key:
            raise AppException("OpenAI API Key is not configured", status_code=500)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": kwargs.get("model", self.model),
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 1024),
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream(
                    "POST",
                    "https://api.openai.com/v1/chat/completions",
                    json=payload,
                    headers=headers,
                ) as response:
                    if response.status_code != 200:
                        raise AppException(
                            f"OpenAI Stream failed with status {response.status_code}",
                            status_code=response.status_code,
                        )
                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line:
                            continue
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk_data = json.loads(data_str)
                                if chunk_data.get("choices"):
                                    delta = chunk_data["choices"][0].get("delta", {})
                                    if "content" in delta:
                                        yield delta["content"]
                            except (json.JSONDecodeError, KeyError):
                                continue
        except httpx.HTTPError as e:
            logger.error("OpenAI stream request failed: %s", str(e))
            raise AppException(
                f"OpenAI streaming error: {str(e)}", status_code=503
            ) from e

    async def health(self) -> bool:
        if not self.api_key or "mock" in self.api_key:
            if settings.ENV_STATE == "development":
                return True
            return False
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": "ping"}],
            "max_tokens": 1,
        }
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    json=payload,
                    headers=headers,
                )
                return response.status_code == 200
        except Exception:
            return False
