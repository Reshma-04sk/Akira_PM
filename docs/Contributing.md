# Contributor Guide

Welcome to the Akira-PM contributor guide. Follow these standards to maintain codebase health, safety, and readability.

---

## 1. Local Environment Onboarding

### 1. Requirements
Ensure you have the following installed:
- Python 3.12+ / `uv` utility
- Node.js 20+ / `pnpm` utility
- Docker & Docker Compose

### 2. Sandbox Setup
```bash
# Clone and enter repo
git clone https://github.com/Reshma-04sk/Akira_PM.git
cd Akira_PM

# Install all sub-packages and tools
pnpm install
cd apps/backend && uv pip install -e .[dev]
```

---

## 2. Coding Guidelines & Styles

To ensure consistency, coding policies are enforced automatically.

### Python Backend Standards
- **Style Rules**: Checked via **Ruff** (replaces black, flake8, and isort).
- **Type Annotations**: Mandatory on all services, routes, and models arguments.
- **SQLAlchemy Models**: Use type annotations mapping (`Mapped[...]`) with explicit nullable flags.

Running python formatting and validation locally:
```bash
cd apps/backend
uv run ruff check .
uv run ruff format .
```

### TypeScript Frontend Standards
- **Styles**: Checked via ESLint and formatted using Prettier.
- **Types**: Strict type checking is required. Avoid the `any` type.
- **Imports**: Organize imports with absolute mappings starting with `@/`.

Running frontend checks locally:
```bash
cd apps/frontend
pnpm lint
pnpm tsc --noEmit
```

---

## 3. Git Branching & Commit Guidelines

### Branch Names
Use lowercase, hyphen-separated branch names categorized by purpose:
- `feature/your-feature-name` (New capabilities)
- `bugfix/issue-description` (Bugs resolution)
- `docs/topic-name` (Documentation updates)

### Commit Formatting
We adhere to **Conventional Commits**:
- `feat: add social registration options`
- `fix: resolve task drawer height overflow`
- `docs: update deployment setup instructions`
- `test: add comment service unit verification cases`

---

## 4. Pull Request Policy

1. Create a branch and implement changes.
2. Verify formatting and run the test suite locally.
3. Commit and push changes, then open a Pull Request against the `main` branch.
4. Ensure the GitHub Actions Continuous Integration (CI) checks pass.
5. Obtain approval from at least one core engineer before merging.
