import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def get_env_filepath() -> str:
    """
    Search up the directory tree to find the active .env file based on ENV_STATE.
    Allows pytest or uvicorn to run from different paths without losing environment files.
    """
    env_state = os.getenv("ENV_STATE", "development")
    filename = f".env.{env_state}"

    current_path = Path(__file__).resolve()
    for parent in current_path.parents:
        potential_file = parent / filename
        if potential_file.exists():
            return str(potential_file)

        # Also check for standard fallback .env
        fallback_file = parent / ".env"
        if fallback_file.exists():
            return str(fallback_file)

    return filename


class Settings(BaseSettings):
    ENV_STATE: str = "development"
    APP_NAME: str = "Akira-PM"

    # Backend
    BACKEND_PORT: int = 8000
    BACKEND_LOG_LEVEL: str = "info"
    BACKEND_SECRET_KEY: str = (
        "change-this-in-production-to-a-secure-random-32-character-string"
    )
    BACKEND_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI Infrastructure
    AI_PROVIDER: str = "gemini"
    OPENAI_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None

    # Sentry & Email Configuration
    SENTRY_DSN: str | None = None
    RESEND_API_KEY: str | None = None

    # DB
    POSTGRES_USER: str = "saas_admin"
    POSTGRES_PASSWORD: str = "saas_password_dev"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "saas_db"
    DATABASE_URL: str | None = None

    # Cache
    REDIS_URL: str | None = None

    # CORS Allowed Origins
    CORS_ALLOWED_ORIGINS: list[str] | str = ["http://localhost:5173"]
    ALLOWED_HOSTS: list[str] | str = ["*"]

    model_config = SettingsConfigDict(
        env_file=get_env_filepath(), env_file_encoding="utf-8", extra="ignore"
    )

    def model_post_init(self, __context) -> None:
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql+asyncpg://{self.POSTGRES_USER}:"
                f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:"
                f"{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )

        # Convert CORS origins to list if passed as comma-separated string
        if isinstance(self.CORS_ALLOWED_ORIGINS, str):
            self.CORS_ALLOWED_ORIGINS = [
                origin.strip()
                for origin in self.CORS_ALLOWED_ORIGINS.split(",")
                if origin.strip()
            ]

        # Convert ALLOWED_HOSTS to list if passed as comma-separated string
        if isinstance(self.ALLOWED_HOSTS, str):
            self.ALLOWED_HOSTS = [
                host.strip() for host in self.ALLOWED_HOSTS.split(",") if host.strip()
            ]

        # Production security check: secret key validation
        if self.ENV_STATE == "production":
            bad_keys = {
                "change-this-in-production-to-a-secure-random-32-character-string",
                "dev_secret_key_placeholder_do_not_use_in_prod_12345",
                "__SECURE_JWT_SECRET_KEY_INJECTED_AT_RUNTIME__",
            }
            if self.BACKEND_SECRET_KEY in bad_keys:
                raise ValueError(
                    "BACKEND_SECRET_KEY must be configured as a secure random string in production environment state!"
                )


settings = Settings()
