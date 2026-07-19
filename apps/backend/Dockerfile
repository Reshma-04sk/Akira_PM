# --- Build Stage ---
FROM python:3.12-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install compile dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv for rapid package downloads
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Mount pyproject.toml to install lock-free requirements
COPY pyproject.toml ./
RUN uv venv /opt/venv && uv pip install --no-cache -r pyproject.toml

# --- Runner Stage ---
FROM python:3.12-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Copy virtual env and code from builder
COPY --from=builder /opt/venv /opt/venv
COPY . .

# Run container as a dedicated non-root user
RUN useradd -u 8888 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
