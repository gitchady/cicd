# CI/CD FastAPI + React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** собрать учебный full-stack проект на FastAPI + React/Vite, который демонстрирует полный CI/CD flow: tests, build, deploy-ready config.

**Architecture:** monorepo с двумя приложениями: `apps/api` для FastAPI backend и `apps/web` для React/Vite frontend. Backend предоставляет healthcheck и CRUD API для notes, frontend работает с этим API через `VITE_API_BASE_URL`, CI проверяет обе части независимо.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy, Pydantic, Pytest, Ruff, React, TypeScript, Vite, Vitest, GitHub Actions, Docker, Vercel, Render/Railway, Neon/Supabase PostgreSQL.

---

## File Structure

Create:

- `README.md` - описание проекта, локальный запуск, CI/CD и deploy steps.
- `.gitignore` - Python, Node, env, build artifacts.
- `docker-compose.yml` - локальный PostgreSQL для backend.
- `.env.example` - пример общих переменных окружения.
- `.github/workflows/ci.yml` - GitHub Actions CI для backend и frontend.
- `apps/api/pyproject.toml` - Python package config, dependencies, Ruff, Pytest.
- `apps/api/Dockerfile` - production-ready container для FastAPI.
- `apps/api/.env.example` - backend env example.
- `apps/api/app/__init__.py` - package marker.
- `apps/api/app/config.py` - settings из environment variables.
- `apps/api/app/database.py` - SQLAlchemy engine/session/base.
- `apps/api/app/models.py` - SQLAlchemy Note model.
- `apps/api/app/schemas.py` - Pydantic schemas.
- `apps/api/app/crud.py` - database operations для notes.
- `apps/api/app/main.py` - FastAPI app, routes, CORS, startup table creation.
- `apps/api/tests/test_health.py` - healthcheck tests.
- `apps/api/tests/test_notes.py` - CRUD API tests.
- `apps/web/package.json` - frontend scripts/dependencies.
- `apps/web/index.html` - Vite entry HTML.
- `apps/web/tsconfig.json` - TypeScript config.
- `apps/web/tsconfig.node.json` - TypeScript config для Vite.
- `apps/web/vite.config.ts` - Vite + Vitest config.
- `apps/web/.env.example` - frontend env example.
- `apps/web/src/main.tsx` - React entry.
- `apps/web/src/App.tsx` - notes UI.
- `apps/web/src/api.ts` - API client.
- `apps/web/src/App.test.tsx` - frontend smoke/component test.
- `apps/web/src/test/setup.ts` - Vitest DOM setup.
- `apps/web/src/styles.css` - компактный responsive UI.

Modify:

- `docs/superpowers/specs/2026-04-30-cicd-fastapi-react-design.md` - already translated to Russian.

---

### Task 1: Repository Metadata And Local Development Docs

**Files:**

- Create: `.gitignore`
- Create: `.env.example`
- Create: `docker-compose.yml`
- Create: `README.md`

- [ ] **Step 1: Create `.gitignore`**

```gitignore
# Python
__pycache__/
*.py[cod]
.pytest_cache/
.ruff_cache/
.mypy_cache/
.venv/
venv/

# Node
node_modules/
dist/
coverage/

# Env
.env
.env.*
!.env.example
!apps/**/.env.example

# Editors and OS
.idea/
.vscode/
.DS_Store
Thumbs.db
```

- [ ] **Step 2: Create root `.env.example`**

```dotenv
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/cicd
SECRET_KEY=change-me
CORS_ORIGINS=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000
```

- [ ] **Step 3: Create `docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cicd
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d cicd"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

- [ ] **Step 4: Create `README.md`**

```markdown
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
```

- [ ] **Step 5: Verify docs files exist**

Run: `Get-ChildItem -Force`

Expected: output includes `.gitignore`, `.env.example`, `docker-compose.yml`, `README.md`, `docs`.

- [ ] **Step 6: Commit**

```bash
git add .gitignore .env.example docker-compose.yml README.md docs/superpowers/specs/2026-04-30-cicd-fastapi-react-design.md
git commit -m "docs: add project setup guide"
```

---

### Task 2: FastAPI Backend Package

**Files:**

- Create: `apps/api/pyproject.toml`
- Create: `apps/api/.env.example`
- Create: `apps/api/app/__init__.py`
- Create: `apps/api/app/config.py`
- Create: `apps/api/app/database.py`
- Create: `apps/api/app/models.py`
- Create: `apps/api/app/schemas.py`
- Create: `apps/api/app/crud.py`
- Create: `apps/api/app/main.py`
- Create: `apps/api/tests/test_health.py`
- Create: `apps/api/tests/test_notes.py`

- [ ] **Step 1: Create backend package config**

```toml
[project]
name = "cicd-api"
version = "0.1.0"
description = "FastAPI backend for CI/CD training project"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.30.0",
    "sqlalchemy>=2.0.0",
    "psycopg[binary]>=3.2.0",
    "pydantic-settings>=2.4.0",
]

[project.optional-dependencies]
dev = [
    "httpx>=0.27.0",
    "pytest>=8.3.0",
    "ruff>=0.6.0",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B"]
```

- [ ] **Step 2: Create backend env example**

```dotenv
DATABASE_URL=sqlite:///./local.db
SECRET_KEY=change-me
CORS_ORIGINS=http://localhost:5173
```

- [ ] **Step 3: Create backend settings**

```python
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./local.db"
    secret_key: str = "change-me"
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

- [ ] **Step 4: Create database module**

```python
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 5: Create Note model**

```python
from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
```

- [ ] **Step 6: Create schemas**

```python
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NoteBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    content: str = ""


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    content: str | None = None


class NoteRead(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

- [ ] **Step 7: Create CRUD functions**

```python
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Note
from app.schemas import NoteCreate, NoteUpdate


def list_notes(db: Session) -> list[Note]:
    return list(db.scalars(select(Note).order_by(Note.id.desc())))


def get_note(db: Session, note_id: int) -> Note | None:
    return db.get(Note, note_id)


def create_note(db: Session, payload: NoteCreate) -> Note:
    note = Note(title=payload.title, content=payload.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, note: Note, payload: NoteUpdate) -> Note:
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(note, key, value)
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, note: Note) -> None:
    db.delete(note)
    db.commit()
```

- [ ] **Step 8: Create FastAPI app**

```python
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import crud, models
from app.config import get_settings
from app.database import Base, engine, get_db
from app.schemas import NoteCreate, NoteRead, NoteUpdate

settings = get_settings()

app = FastAPI(title="CI/CD Demo API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/notes", response_model=list[NoteRead])
def list_notes(db: Session = Depends(get_db)) -> list[models.Note]:
    return crud.list_notes(db)


@app.post("/notes", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)) -> models.Note:
    return crud.create_note(db, payload)


@app.patch("/notes/{note_id}", response_model=NoteRead)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)) -> models.Note:
    note = crud.get_note(db, note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return crud.update_note(db, note, payload)


@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)) -> Response:
    note = crud.get_note(db, note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    crud.delete_note(db, note)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
```

- [ ] **Step 9: Create package marker**

```python
```

- [ ] **Step 10: Create health test**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_ok() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 11: Create notes tests**

```python
from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.main import app


engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


def setup_function() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_note_crud_flow() -> None:
    client = TestClient(app)

    create_response = client.post("/notes", json={"title": "First note", "content": "CI works"})
    assert create_response.status_code == 201
    note = create_response.json()
    assert note["title"] == "First note"
    assert note["content"] == "CI works"

    list_response = client.get("/notes")
    assert list_response.status_code == 200
    assert [item["id"] for item in list_response.json()] == [note["id"]]

    update_response = client.patch(f"/notes/{note['id']}", json={"title": "Updated"})
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated"

    delete_response = client.delete(f"/notes/{note['id']}")
    assert delete_response.status_code == 204

    missing_response = client.patch(f"/notes/{note['id']}", json={"title": "Missing"})
    assert missing_response.status_code == 404
    assert missing_response.json()["detail"] == "Note not found"
```

- [ ] **Step 12: Install backend dependencies**

Run: `.\.venv\Scripts\python.exe -m pip install -e "apps/api[dev]"`

Expected: dependencies install successfully.

- [ ] **Step 13: Run backend tests**

Run: `.\.venv\Scripts\python.exe -m pytest apps/api -q`

Expected: all backend tests pass.

- [ ] **Step 14: Run Ruff**

Run: `.\.venv\Scripts\python.exe -m ruff check apps/api`

Expected: `All checks passed!`

- [ ] **Step 15: Commit**

```bash
git add apps/api
git commit -m "feat(api): add notes FastAPI service"
```

---

### Task 3: Backend Dockerfile

**Files:**

- Create: `apps/api/Dockerfile`

- [ ] **Step 1: Create Dockerfile**

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir .

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 2: Build Docker image**

Run: `docker build -t cicd-api apps/api`

Expected: image builds successfully.

- [ ] **Step 3: Commit**

```bash
git add apps/api/Dockerfile
git commit -m "build(api): add Dockerfile"
```

---

### Task 4: React/Vite Frontend

**Files:**

- Create: `apps/web/package.json`
- Create: `apps/web/index.html`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tsconfig.node.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/.env.example`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/api.ts`
- Create: `apps/web/src/App.test.tsx`
- Create: `apps/web/src/test/setup.ts`
- Create: `apps/web/src/styles.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "cicd-web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "typescript": "^5.5.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "jsdom": "^24.1.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create Vite HTML**

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CI/CD Notes</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create TypeScript configs**

`apps/web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`apps/web/tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create Vite config**

```typescript
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts"
  }
});
```

- [ ] **Step 5: Create frontend env example**

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

- [ ] **Step 6: Create API client**

```typescript
export type Note = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type NoteInput = {
  title: string;
  content: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listNotes(): Promise<Note[]> {
  return request<Note[]>("/notes");
}

export function createNote(input: NoteInput): Promise<Note> {
  return request<Note>("/notes", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateNote(id: number, input: Partial<NoteInput>): Promise<Note> {
  return request<Note>(`/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteNote(id: number): Promise<void> {
  return request<void>(`/notes/${id}`, {
    method: "DELETE"
  });
}
```

- [ ] **Step 7: Create React UI**

```tsx
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Note, createNote, deleteNote, listNotes, updateNote } from "./api";
import "./styles.css";

type FormState = {
  title: string;
  content: string;
};

const emptyForm: FormState = { title: "", content: "" };

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editingNote = useMemo(
    () => notes.find((note) => note.id === editingId) ?? null,
    [editingId, notes]
  );

  async function loadNotes() {
    setLoading(true);
    setError(null);
    try {
      setNotes(await listNotes());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotes();
  }, []);

  function startEdit(note: Note) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateNote(editingId, form);
      } else {
        await createNote(form);
      }
      resetForm();
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить note");
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="page-header">
          <p>CI/CD demo</p>
          <h1>Notes pipeline</h1>
        </header>

        <form className="note-form" onSubmit={handleSubmit}>
          <h2>{editingNote ? "Редактировать note" : "Новая note"}</h2>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Deploy backend"
              required
              maxLength={120}
            />
          </label>
          <label>
            Content
            <textarea
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({ ...current, content: event.target.value }))
              }
              placeholder="Проверить healthcheck после deploy"
              rows={5}
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingNote ? "Save" : "Create"}
            </button>
            {editingNote ? (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <section className="notes-panel" aria-label="Notes list">
          {error ? <div className="error">{error}</div> : null}
          {loading ? <p className="muted">Loading notes...</p> : null}
          {!loading && notes.length === 0 ? <p className="muted">Notes пока нет.</p> : null}
          <div className="notes-list">
            {notes.map((note) => (
              <article className="note-card" key={note.id}>
                <div>
                  <h3>{note.title}</h3>
                  <p>{note.content || "Без описания"}</p>
                </div>
                <div className="note-actions">
                  <button type="button" className="secondary" onClick={() => startEdit(note)}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={() => void handleDelete(note.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
```

- [ ] **Step 8: Create React entry**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 9: Create CSS**

```css
:root {
  color: #172033;
  background: #f4f7fb;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

button,
input,
textarea {
  font: inherit;
}

button {
  border: 0;
  border-radius: 6px;
  background: #1264a3;
  color: white;
  cursor: pointer;
  font-weight: 700;
  padding: 0.75rem 1rem;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.secondary {
  background: #e7edf5;
  color: #172033;
}

.danger {
  background: #b42318;
}

.app-shell {
  min-height: 100vh;
  padding: 32px;
}

.workspace {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(280px, 420px) minmax(0, 1fr);
  margin: 0 auto;
  max-width: 1120px;
}

.page-header {
  grid-column: 1 / -1;
}

.page-header p {
  color: #1264a3;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.page-header h1 {
  font-size: clamp(2rem, 4vw, 4rem);
  letter-spacing: 0;
  line-height: 1;
  margin: 0;
}

.note-form,
.notes-panel {
  background: white;
  border: 1px solid #d8e0ea;
  border-radius: 8px;
  padding: 24px;
}

.note-form {
  align-self: start;
  display: grid;
  gap: 16px;
}

.note-form h2 {
  margin: 0;
}

label {
  display: grid;
  gap: 8px;
  font-weight: 700;
}

input,
textarea {
  border: 1px solid #c7d2df;
  border-radius: 6px;
  color: #172033;
  padding: 0.75rem;
  width: 100%;
}

.form-actions,
.note-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.notes-panel {
  min-height: 320px;
}

.notes-list {
  display: grid;
  gap: 12px;
}

.note-card {
  border: 1px solid #d8e0ea;
  border-radius: 8px;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 16px;
}

.note-card h3 {
  margin: 0 0 8px;
}

.note-card p {
  color: #4b5870;
  margin: 0;
}

.error {
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  color: #9f1f17;
  margin-bottom: 16px;
  padding: 12px;
}

.muted {
  color: #68758a;
}

@media (max-width: 760px) {
  .app-shell {
    padding: 20px;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .note-card {
    display: grid;
  }
}
```

- [ ] **Step 10: Create Vitest setup**

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 11: Create frontend test**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

const notes = [
  {
    id: 1,
    title: "Deploy backend",
    content: "Check /health",
    created_at: "2026-04-30T00:00:00Z",
    updated_at: "2026-04-30T00:00:00Z"
  }
];

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => notes
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders notes from the API", async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByText("Deploy backend")).toBeInTheDocument());
    expect(screen.getByText("Check /health")).toBeInTheDocument();
  });
});
```

- [ ] **Step 12: Install frontend dependencies**

Run: `npm install --prefix apps/web`

Expected: `package-lock.json` is created and dependencies install successfully.

- [ ] **Step 13: Run frontend tests**

Run: `npm test --prefix apps/web`

Expected: Vitest passes.

- [ ] **Step 14: Run frontend build**

Run: `npm run build --prefix apps/web`

Expected: TypeScript and Vite production build pass.

- [ ] **Step 15: Commit**

```bash
git add apps/web
git commit -m "feat(web): add notes frontend"
```

---

### Task 5: GitHub Actions CI

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  api:
    name: Backend
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/api
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install backend dependencies
        run: python -m pip install -e ".[dev]"

      - name: Run Ruff
        run: ruff check .

      - name: Run Pytest
        run: pytest -q

  web:
    name: Frontend
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: apps/web/package-lock.json

      - name: Install frontend dependencies
        run: npm ci

      - name: Run frontend tests
        run: npm test

      - name: Build frontend
        run: npm run build
```

- [ ] **Step 2: Verify workflow syntax by reading the file**

Run: `Get-Content .github/workflows/ci.yml`

Expected: file contains `api` and `web` jobs.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add backend and frontend checks"
```

---

### Task 6: Local Verification And Push

**Files:**

- Modify: no planned file changes.

- [ ] **Step 1: Run backend test suite**

Run: `.\.venv\Scripts\python.exe -m pytest apps/api -q`

Expected: backend tests pass.

- [ ] **Step 2: Run backend lint**

Run: `.\.venv\Scripts\python.exe -m ruff check apps/api`

Expected: Ruff passes.

- [ ] **Step 3: Run frontend test suite**

Run: `npm test --prefix apps/web`

Expected: frontend tests pass.

- [ ] **Step 4: Run frontend build**

Run: `npm run build --prefix apps/web`

Expected: frontend build passes.

- [ ] **Step 5: Check git status**

Run: `git status --short`

Expected: clean working tree.

- [ ] **Step 6: Push to GitHub**

Run: `git push origin main`

Expected: branch pushes to `https://github.com/gitchady/cicd.git` and GitHub Actions starts.

---

## Self-Review

Spec coverage:

- FastAPI backend is covered by Task 2.
- React/Vite frontend is covered by Task 4.
- PostgreSQL local development is covered by Task 1.
- GitHub Actions CI is covered by Task 5.
- Docker deploy readiness is covered by Task 3.
- Vercel/Render/Railway/Neon/Supabase deploy instructions are covered by Task 1 README.
- Environment variables are covered by Task 1, Task 2, and Task 4.
- Testing strategy is covered by Task 2, Task 4, and Task 6.

Placeholder scan:

- No `TBD`, `TODO`, `implement later`, or undefined task references remain.

Type consistency:

- Backend uses `Note`, `NoteCreate`, `NoteUpdate`, and `NoteRead` consistently.
- Frontend uses `Note` and `NoteInput` consistently.
- API routes match between backend and frontend: `/health`, `/notes`, `/notes/{id}`.
