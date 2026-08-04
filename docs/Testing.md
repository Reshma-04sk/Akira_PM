# Testing Guide

This document describes testing strategies, suite layouts, mocks, and how to execute automated tests in Akira-PM.

---

## 1. Testing Strategy

Akira-PM adopts a hybrid testing layout:
- **Backend**: Focuses on unit validations at the service level (checking business rule assertions, Demotions, demoting the last Owner, comment permissions) and integration checks at the router level (REST responses, HTTP statuses, and database writes).
- **Frontend**: Tests focus on UI layouts, filtering logic on tables, forms validation, storage handlers, and API client request parsing.

---

## 2. Backend Test Architecture (pytest)

### SQLite In-Memory Database
For speed and isolation, testing runs using a transient in-memory SQLite database:
`TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"`

Tables are created before every test function and dropped immediately after completion, ensuring a clean state.

### Mocks and Dependency Overrides
FastAPI router tests utilize dependency overrides to inject mock objects or session structures:
```python
# conftest.py snippet
@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
```

### Running Backend Tests
```bash
cd apps/backend
$env:ENV_STATE="testing"
uv run python -m pytest
```

---

## 3. Frontend Test Architecture (Vitest)

Frontend tests use **Vitest** for fast unit assertions and **React Testing Library** for component mounting and user interaction emulation.

### Mock Service Interceptors
API hooks and Axios network requests are mocked using Vitest spy functions to prevent external dependencies during client tests.

### Running Frontend Tests
```bash
cd apps/frontend
# Run test suite
pnpm test
```
---

## 4. Quality Gates & Linting Checks

To ensure code health before staging a pull request, developers must execute linting checks:

### Backend Checks
```bash
cd apps/backend
uv run ruff check .
uv run ruff format --check .
```

### Frontend Checks
```bash
cd apps/frontend
pnpm lint
pnpm tsc --noEmit
```
All code changes must yield zero warnings and compile cleanly before being merged into the master branches.
