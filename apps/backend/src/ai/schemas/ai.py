
from pydantic import BaseModel, Field


class AIConfigResponse(BaseModel):
    active_provider: str = Field(
        ..., description="The name of the currently active LLM provider."
    )
    openai_configured: bool = Field(
        ..., description="True if OpenAI API Key is configured."
    )
    gemini_configured: bool = Field(
        ..., description="True if Gemini API Key is configured."
    )
    anthropic_configured: bool = Field(
        ..., description="True if Anthropic API Key is configured."
    )


class AIHealthResponse(BaseModel):
    openai: str = Field(
        ..., description="Health status of OpenAI ('healthy', 'unconfigured', 'unhealthy')."
    )
    gemini: str = Field(
        ..., description="Health status of Gemini ('healthy', 'unconfigured', 'unhealthy')."
    )
    anthropic: str = Field(
        ..., description="Health status of Anthropic ('healthy', 'unconfigured', 'unhealthy')."
    )


class AITestRequest(BaseModel):
    prompt: str = Field(
        ..., min_length=1, max_length=2000, description="The test prompt to evaluate."
    )
    provider: str | None = Field(
        None, description="Optional override provider for testing."
    )


class AITestResponse(BaseModel):
    success: bool = True
    text: str = Field(..., description="The generated completion text.")
    provider: str = Field(..., description="The provider that handled the request.")
    latency: float = Field(..., description="Execution latency in seconds.")
    estimated_tokens: int = Field(
        ..., description="Estimated total token usage (input + output)."
    )
