from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator
from typing import Any


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate(
        self, prompt: str, system_prompt: str | None = None, **kwargs
    ) -> dict[str, Any]:
        """
        Generate a complete response from the LLM.

        Args:
            prompt: User message prompt.
            system_prompt: Optional system prompt to instruct the model.
            **kwargs: Extra parameters (e.g. temperature, max_tokens).

        Returns:
            dict containing:
                "text": Generated completion string.
                "usage": dict with prompt_tokens, completion_tokens, total_tokens.
                "raw_response": Full raw API response body dictionary.
        """
        pass

    @abstractmethod
    async def stream(
        self, prompt: str, system_prompt: str | None = None, **kwargs
    ) -> AsyncGenerator[str, None]:
        """
        Stream response chunks from the LLM.

        Args:
            prompt: User message prompt.
            system_prompt: Optional system prompt to instruct the model.
            **kwargs: Extra parameters.

        Yields:
            Generated text chunks.
        """
        yield ""

    @abstractmethod
    async def health(self) -> bool:
        """
        Validate connectivity and configuration of the provider.

        Returns:
            True if healthy and configured, False otherwise.
        """
        pass
