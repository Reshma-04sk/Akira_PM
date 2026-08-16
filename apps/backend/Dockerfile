# --- Build Stage ---
FROM python:3.13-slim AS builder

WORKDIR /app

# Enable bytecode compilation, copy link mode, and disable automatic Python downloads
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

# Install build dependencies if native extensions are needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy uv binaries from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency definition files first to leverage layer caching
COPY pyproject.toml uv.lock ./

# Install project dependencies without installing the project itself
RUN uv sync --frozen --no-dev --no-install-project

# Copy remaining source code and install project into virtual environment
COPY . .
RUN uv sync --frozen --no-dev

# --- Runner Stage ---
FROM python:3.13-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

# Copy virtual environment and application code from builder stage
COPY --from=builder /app/.venv /app/.venv
COPY . .

# Run container as a dedicated non-root user
RUN useradd -u 8888 appuser && chown -R appuser:appuser /app
USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')" || exit 1

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
