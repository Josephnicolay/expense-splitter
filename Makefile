.PHONY: install test test-verbose lint backend frontend dev clean

install:
	cd backend && uv sync
	cd frontend && npm install

test:
	cd backend && uv run pytest

test-verbose:
	cd backend && uv run pytest -v

lint:
	cd frontend && npx tsc --noEmit

backend:
	cd backend && uv run uvicorn app.main:app --reload

frontend:
	cd frontend && npm run dev

dev: backend frontend

clean:
	rm -rf backend/.venv backend/__pycache__ backend/app/__pycache__ backend/app/routers/__pycache__
	rm -f backend/*.db
	rm -rf frontend/node_modules
