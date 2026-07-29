.PHONY: dev down build install lint lint-backend lint-frontend test test-backend test-frontend clean

dev:
	docker compose up

down:
	docker compose down

build:
	docker compose build

install:
	pnpm install
	cd apps/backend && uv pip install -e .[dev]

lint: lint-frontend lint-backend

lint-backend:
	cd apps/backend && uv run ruff check . && uv run ruff format --check .

lint-frontend:
	pnpm --filter saas-frontend lint

test: test-backend test-frontend

test-backend:
	cd apps/backend && uv run pytest

test-frontend:
	pnpm --filter saas-frontend test

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
	rm -rf apps/frontend/dist apps/frontend/node_modules node_modules
