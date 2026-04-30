# Дизайн учебного CI/CD проекта на FastAPI + Frontend

## Цель

Собрать небольшой full-stack проект, основная задача которого - протестировать и понять настоящий CI/CD pipeline.

Проект будет использовать:

- FastAPI backend
- React/Vite frontend
- PostgreSQL database
- GitHub Actions для CI
- Vercel для деплоя frontend
- Render или Railway для деплоя backend
- Neon или Supabase для managed PostgreSQL

## Структура репозитория

Репозиторий будет monorepo:

```text
apps/
  api/
  web/
.github/
  workflows/
docker-compose.yml
README.md
```

`apps/api` отвечает за FastAPI приложение, тесты, модели базы данных, миграции и Dockerfile.

`apps/web` отвечает за frontend приложение, frontend тесты, production build и настройку API client.

`.github/workflows` отвечает за CI и deploy automation.

## Scope приложения

Приложение должно оставаться намеренно небольшим. Достаточно notes, tasks или простого CRM-style приложения.

Минимальные backend функции:

- `GET /health`
- CRUD API для одного ресурса
- подключение к PostgreSQL
- базовые автоматические тесты

Минимальные frontend функции:

- показать список элементов из API
- создать/редактировать/удалить элемент
- показать базовые loading и error states
- читать API base URL из environment variables

## CI Pipeline

CI запускается на pull requests и push в `main`.

Backend CI:

- установить Python dependencies
- запустить Ruff
- запустить Pytest
- опционально добавить type checks после стабилизации базового pipeline

Frontend CI:

- установить Node dependencies
- запустить lint/test, если они настроены
- запустить production build

Первая реализация должна быть достаточно строгой, чтобы ловить реальные регрессии, но не перегруженной инструментами, которые будут отвлекать от изучения pipeline.

## Deployment Flow

Frontend deployment:

- Vercel подключается к GitHub repository
- `apps/web` настраивается как frontend root
- push в `main` деплоит production
- pull requests создают preview deployments

Backend deployment:

- Render или Railway подключается к GitHub repository
- backend деплоится из `apps/api`
- service использует Dockerfile или Python start command
- production environment variables настраиваются в dashboard платформы

Database:

- Neon или Supabase хостит PostgreSQL
- backend получает `DATABASE_URL` из platform secrets

## Environment Variables

Backend:

- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`

Frontend:

- `VITE_API_BASE_URL`

Secrets must not be committed to the repository.

## Codex Plugins и Skills

Нужные Codex capabilities для этого проекта уже доступны в текущем Codex environment:

- GitHub plugin: смотреть PR, checks, CI logs и публиковать изменения
- Browser Use plugin: тестировать локальные frontend flows в in-app browser
- Superpowers skills: planning, debugging, verification и review workflow
- Python и frontend skills: помощь с реализацией FastAPI и React/Vite

Дополнительная установка Codex plugins перед реализацией не требуется.

## Testing Strategy

Начинаем с focused tests:

- backend unit/API tests для health и CRUD endpoints
- database tests могут использовать SQLite или test PostgreSQL container, в зависимости от сложности
- frontend сначала проверяется через smoke/build test, затем добавляются component tests для важных UI flows

Deployment smoke checks:

- backend `/health` возвращает OK после deployment
- frontend загружается и может достучаться до deployed API

## Error Handling

Backend должен возвращать consistent JSON errors для validation и not-found cases.

Frontend должен показывать понятные loading и error states при API failures.

CI failures считаются частью учебной цели: смотрим logs, находим failing step, исправляем, снова push.

## Что не делаем на первом этапе

- Kubernetes
- сложную авторизацию
- payments
- multi-environment infrastructure as code
- production-grade observability
- настройку custom domain

Это можно добавить позже, после того как базовый pipeline станет понятен.
