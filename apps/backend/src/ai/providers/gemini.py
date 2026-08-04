import json
import logging
from collections.abc import AsyncGenerator
from typing import Any

import httpx

from src.ai.providers.base import BaseLLMProvider
from src.core.exceptions import AppException
from src.core.settings import settings

logger = logging.getLogger("saas_backend")


class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        self.model = "gemini-1.5-flash"

    @property
    def api_key(self) -> str | None:
        return settings.GEMINI_API_KEY

    async def generate(
        self, prompt: str, system_prompt: str | None = None, **kwargs
    ) -> dict[str, Any]:
        if not self.api_key:
            raise AppException("Gemini API Key is not configured", status_code=500)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}

        contents = [{"parts": [{"text": prompt}]}]
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": kwargs.get("temperature", 0.7),
                "maxOutputTokens": kwargs.get("max_tokens", 1024),
            },
        }

        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code != 200:
                    raise AppException(
                        f"Gemini API error: {response.text}",
                        status_code=response.status_code,
                    )
                data = response.json()

                try:
                    candidate = data["candidates"][0]
                    text = candidate["content"]["parts"][0]["text"]
                except (KeyError, IndexError) as e:
                    logger.error("Failed to parse Gemini response: %s", str(e))
                    raise AppException(
                        "Invalid response structure from Gemini API",
                        status_code=502,
                    ) from e

                usage_metadata = data.get("usageMetadata", {})
                prompt_tokens = usage_metadata.get("promptTokenCount", 0)
                completion_tokens = usage_metadata.get("candidatesTokenCount", 0)
                total_tokens = usage_metadata.get("totalTokenCount", 0)

                return {
                    "text": text,
                    "usage": {
                        "prompt_tokens": prompt_tokens,
                        "completion_tokens": completion_tokens,
                        "total_tokens": total_tokens,
                    },
                    "raw_response": data,
                }
        except httpx.HTTPError as e:
            logger.error("Gemini request failed: %s", str(e))
            raise AppException(
                f"Gemini service unavailable: {str(e)}", status_code=503
            ) from e

    async def stream(
        self, prompt: str, system_prompt: str | None = None, **kwargs
    ) -> AsyncGenerator[str, None]:
        if not self.api_key:
            raise AppException("Gemini API Key is not configured", status_code=500)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:streamGenerateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}

        contents = [{"parts": [{"text": prompt}]}]
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": kwargs.get("temperature", 0.7),
                "maxOutputTokens": kwargs.get("max_tokens", 1024),
            },
        }

        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream(
                    "POST", url, json=payload, headers=headers
                ) as response:
                    if response.status_code != 200:
                        raise AppException(
                            f"Gemini Stream failed with status {response.status_code}",
                            status_code=response.status_code,
                        )

                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line:
                            continue
                        if line.startswith("data: "):
                            line = line[6:]
                        if line == "[" or line == "]":
                            continue
                        if line.endswith(","):
                            line = line[:-1]
                        try:
                            data = json.loads(line)
                            part_text = data["candidates"][0]["content"]["parts"][
                                0
                            ]["text"]
                            if part_text:
                                yield part_text
                        except Exception:
                            continue
        except httpx.HTTPError as e:
            logger.error("Gemini stream request failed: %s", str(e))
            raise AppException(
                f"Gemini streaming error: {str(e)}", status_code=503
            ) from e

    async def health(self) -> bool:
        if not self.api_key or "mock" in self.api_key:
            if settings.ENV_STATE == "development":
                return True
            return False
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": "ping"}]}],
            "generationConfig": {"maxOutputTokens": 1},
        }
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    url, json=payload, headers={"Content-Type": "application/json"}
                )
                return response.status_code == 200
        except Exception:
            return False
