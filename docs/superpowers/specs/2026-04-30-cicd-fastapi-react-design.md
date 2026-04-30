# CI/CD FastAPI + Frontend Training Project Design

## Goal

Build a small full-stack project that exists mainly to test and understand a real CI/CD pipeline.

The project will use:

- FastAPI backend
- React/Vite frontend
- PostgreSQL database
- GitHub Actions for CI
- Vercel for frontend deployment
- Render or Railway for backend deployment
- Neon or Supabase for managed PostgreSQL

## Repository Shape

The repository is a monorepo:

```text
apps/
  api/
  web/
.github/
  workflows/
docker-compose.yml
README.md
```

`apps/api` owns the FastAPI app, tests, database models, migrations, and Dockerfile.

`apps/web` owns the frontend app, frontend tests, production build, and API client configuration.

`.github/workflows` owns CI and deploy automation.

## Application Scope

The app should stay intentionally small. A notes, tasks, or simple CRM-style app is enough.

Minimum backend features:

- `GET /health`
- CRUD API for one resource
- PostgreSQL connection
- basic automated tests

Minimum frontend features:

- list items from the API
- create/edit/delete an item
- show basic loading and error states
- read API base URL from environment variables

## CI Pipeline

CI runs on pull requests and pushes to `main`.

Backend CI:

- install Python dependencies
- run Ruff
- run Pytest
- optionally run type checks after the base pipeline is stable

Frontend CI:

- install Node dependencies
- run lint/test if configured
- run production build

The first implementation should keep CI strict enough to catch real regressions, but not overloaded with tools that distract from learning the pipeline.

## Deployment Flow

Frontend deployment:

- Vercel is connected to the GitHub repository
- `apps/web` is configured as the frontend root
- pushes to `main` deploy production
- pull requests create preview deployments

Backend deployment:

- Render or Railway is connected to the GitHub repository
- backend deploys from `apps/api`
- service uses either Dockerfile or a Python start command
- production environment variables are configured in the platform dashboard

Database:

- Neon or Supabase hosts PostgreSQL
- backend receives `DATABASE_URL` from platform secrets

## Environment Variables

Backend:

- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`

Frontend:

- `VITE_API_BASE_URL`

Secrets must not be committed to the repository.

## Codex Plugins And Skills

Required Codex capabilities for this project are already available in the current Codex environment:

- GitHub plugin: inspect PRs, checks, CI logs, and publish changes
- Browser Use plugin: test local frontend flows in the in-app browser
- Superpowers skills: planning, debugging, verification, and review workflow
- Python and frontend skills: implementation guidance for FastAPI and React/Vite

No extra Codex plugin installation is required before implementation.

## Testing Strategy

Start with focused tests:

- backend unit/API tests around health and CRUD endpoints
- database tests can use SQLite or a test PostgreSQL container depending on complexity
- frontend smoke/build test first, then component tests for important UI flows

Deployment smoke checks:

- backend `/health` returns OK after deployment
- frontend loads and can reach the deployed API

## Error Handling

Backend should return consistent JSON errors for validation and not-found cases.

Frontend should show clear loading and error states for API failures.

CI failures should be treated as part of the learning goal: inspect logs, identify the failing step, patch, push again.

## Out Of Scope Initially

- Kubernetes
- complex auth
- payments
- multi-environment infrastructure as code
- production-grade observability
- custom domain setup

These can be added later after the basic pipeline is understood.
