import logging
from typing import Any

logger = logging.getLogger("saas_backend")


def log_ai_call(
    provider: str,
    latency: float,
    prompt_size: int,
    completion_size: int,
    estimated_tokens: int,
    extra_meta: dict[str, Any] | None = None,
) -> None:
    """
    Log metrics associated with an AI prompt execution.

    Args:
        provider: Name of the LLM provider (e.g. 'openai').
        latency: Execution time in seconds.
        prompt_size: Number of characters in the request prompt.
        completion_size: Number of characters in the response text.
        estimated_tokens: Total tokens consumed (prompt + completion).
        extra_meta: Optional metadata to append to the log.
    """
    log_payload = {
        "metric_type": "ai_inference",
        "provider": provider,
        "latency_seconds": round(latency, 4),
        "prompt_size_chars": prompt_size,
        "completion_size_chars": completion_size,
        "estimated_token_usage": estimated_tokens,
    }
    if extra_meta:
        log_payload.update(extra_meta)

    # In production, this logger handles serializing JSON entries.
    # In development, it prints a clean log message.
    logger.info("AI Inference metrics: %s", log_payload)
