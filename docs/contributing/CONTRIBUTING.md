# Contributing Guide — Akira PM

> **Document Version:** 1.0.0  
> **Status:** Production Reference

---

Thank you for your interest in contributing to **Akira PM**! We welcome bug fixes, performance optimizations, documentation improvements, and feature contributions.

---

## 1. Prerequisites

Ensure your development workstation has:

- **Node.js**: `v22.x` (or `>= 20.x`)
- **pnpm**: `v11.15.0`
- **Python**: `>= 3.12` (Python 3.12, 3.13, or 3.14)
- **uv**: Astral `uv` package manager (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **Docker**: Docker Engine & Docker Compose (for local PostgreSQL/Redis)

---

## 2. Local Setup Workflow

### 1. Clone the Repository

```bash
git clone https://github.com/Reshma-04sk/Akira_PM.git
cd Akira_PM
```

### 2. Install Dependencies

```bash
# Install root & frontend dependencies
pnpm install

# Install backend Python dependencies
cd apps/backend
uv sync
cd ../..
```

### 3. Configure Local Environment

```bash
cp .env.example .env.development
```

### 4. Launch Local Database & Redis

```bash
docker-compose up -d db
```

### 5. Run Database Migrations

```bash
cd apps/backend
ENV_STATE=development uv run alembic upgrade head
cd ../..
```

### 6. Start Development Servers

```bash
# Terminal 1: Backend API
cd apps/backend
ENV_STATE=development uv run uvicorn src.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend App
pnpm --filter saas-frontend dev
```

The frontend will run at `http://localhost:5173`, and backend API docs will be at `http://localhost:8000/docs`.

---

## 3. Code Standards & Testing

### Running Tests

```bash
# Backend Test Suite (59 tests)
cd apps/backend
ENV_STATE=testing PYTHONPATH=. uv run pytest

# Frontend Unit Tests (19 tests)
pnpm --filter saas-frontend test
```

### Running Linters & Type Checks

```bash
# Backend Linter & Formatter
cd apps/backend
uv run ruff check .
uv run ruff format --check .
uv run mypy src

# Frontend Linter & Typecheck
cd apps/frontend
pnpm exec tsc --noEmit
pnpm lint
```

### Running Quality Gate

```bash
python3 .github/scripts/quality_gate.py
```

---

## 4. Git Commit & Branching Conventions

- Use standard Conventional Commits:
  - `feat(tasks): add bulk status transition support`
  - `fix(auth): resolve refresh token race condition`
  - `docs(hld): update container topology diagram`
  - `ci(deploy): update pnpm cache path`
- Create topic branches from `main`: `feat/feature-name` or `fix/bug-name`.
- Ensure all CI validation checks pass before opening Pull Requests.
