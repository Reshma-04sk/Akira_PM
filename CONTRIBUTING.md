# Contributing to Akira-PM

Thank you for your interest in contributing to Akira-PM! To ensure a smooth process, please follow the guidelines below.

---

## 1. Onboarding & Local Setup

For complete local environment setup steps (using `pnpm` and `uv` packages tools), please read our detailed [Contributor Guide](docs/Contributing.md).

---

## 2. Code Quality & Standards

We enforce strict validation gates to maintain code quality:

### Backend (Python/FastAPI)
- Formatting and style rules are managed via **Ruff**.
- Run checks locally before pushing changes:
  ```bash
  cd apps/backend
  uv run ruff check .
  uv run ruff format .
  ```

### Frontend (React/TypeScript)
- We use ESLint and Prettier for syntax styles.
- Verify typescript types and styles:
  ```bash
  cd apps/frontend
  pnpm lint
  pnpm tsc --noEmit
  ```

---

## 3. Git Commit Rules

We adhere to **Conventional Commits** patterns:
- `feat: add Google OAuth registration option`
- `fix: resolve task priority dropdown UI alignment`
- `docs: update setup steps in deployment guide`
- `test: add user login integration validation cases`

---

## 4. Submitting a Pull Request (PR)

1. Fork the repository and create your feature/fix branch.
2. Implement your changes, verifying that all lint and test suites pass locally.
3. Commit and push your changes to your fork.
4. Open a Pull Request against our `main` branch.
5. Review the checklists in our [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
