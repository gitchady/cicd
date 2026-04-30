# CI/CD FastAPI + React Demo

Учебный full-stack проект для проверки CI/CD pipeline.

## Stack

- Backend: FastAPI, SQLAlchemy, Pytest, Ruff
- Frontend: React, TypeScript, Vite, Vitest
- Database: PostgreSQL
- CI: GitHub Actions
- Deploy target: Vercel frontend + Render/Railway backend + Neon/Supabase Postgres

## Local Backend

```bash
docker compose up -d db
cd apps/api
python -m venv .venv
.venv\Scripts\python -m pip install -e ".[dev]"
.venv\Scripts\python -m uvicorn app.main:app --reload
```

Healthcheck:

```bash
curl http://localhost:8000/health
```

## Local Frontend

```bash
cd apps/web
npm install
npm run dev
```

Open `http://localhost:5173`.

## CI

GitHub Actions runs on pull requests and pushes to `main`.

Backend checks:

- Ruff
- Pytest

Frontend checks:

- TypeScript build
- Vitest
- production build

## Deploy

Frontend:

- Platform: Vercel
- Root directory: `apps/web`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL`

Backend:

- Platform: Render or Railway
- Root directory: `apps/api`
- Dockerfile: `apps/api/Dockerfile`
- Environment variables: `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`

Database:

- Platform: Neon or Supabase
- Copy the PostgreSQL connection string into backend `DATABASE_URL`
