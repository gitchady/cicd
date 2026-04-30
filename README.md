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

Recommended for this repository now:

- Personal Linux server over SSH
- Docker Compose on the server
- Frontend and backend on one IP

See [Linux server deploy guide](docs/deploy-linux-server.md).

Server URLs after deploy:

```text
http://SERVER_IP/       -> frontend
http://SERVER_IP/api/*  -> backend
```

Frontend:

- Platform: Vercel
- Root directory: `apps/web`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL`
- Project config: `apps/web/vercel.json`

### Vercel frontend setup

1. Open Vercel and import the GitHub repository.
2. Select `gitchady/cicd`.
3. Set the root directory to `apps/web`.
4. Keep the build command as `npm run build`.
5. Keep the output directory as `dist`.
6. Add production environment variable:

```text
VITE_API_BASE_URL=https://your-backend-url
```

Every push to `main` will create a production deployment. Pull requests will create preview deployments.

Backend:

- Platform: Render or Railway
- Root directory: `apps/api`
- Dockerfile: `apps/api/Dockerfile`
- Environment variables: `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`

Database:

- Platform: Neon or Supabase
- Copy the PostgreSQL connection string into backend `DATABASE_URL`
