.PHONY: dev-backend dev-frontend lint-backend lint-frontend lint test-backend test-frontend test db-up db-down db-migrate db-make-migration format clean

# ─── Development ────────────────────────────────────────────

dev-backend:
	uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

# ─── Linting ─────────────────────────────────────────────────

lint-backend:
	uv run ruff check backend/
	uv run ruff format --check backend/
	uv run mypy backend/app/

lint-frontend:
	cd frontend && npm run lint && npm run typecheck

lint: lint-backend lint-frontend

# ─── Testing ─────────────────────────────────────────────────

test-backend:
	uv run pytest

test-frontend:
	cd frontend && npm test

test: test-backend test-frontend

# ─── Database ────────────────────────────────────────────────

db-up:
	docker compose up -d db

db-down:
	docker compose down

db-migrate:
	uv run alembic upgrade head

db-make-migration:
	@read -p "Migration message: " msg; uv run alembic revision --autogenerate -m "$$msg"

# ─── Utilities ──────────────────────────────────────────────

format:
	uv run ruff format backend/
	cd frontend && npm run format

clean:
	rm -rf backend/.venv frontend/node_modules frontend/dist __pycache__ .pytest_cache .ruff_cache
