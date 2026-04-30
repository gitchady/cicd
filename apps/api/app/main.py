from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Engine
from sqlalchemy.orm import Session

from app import crud, models
from app.config import get_settings
from app.database import Base, engine, get_db
from app.schemas import NoteCreate, NoteRead, NoteUpdate

settings = get_settings()
DbSession = Annotated[Session, Depends(get_db)]


def create_app(db_engine: Engine = engine) -> FastAPI:
    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        Base.metadata.create_all(bind=db_engine)
        yield

    api = FastAPI(title="CI/CD Demo API", lifespan=lifespan)
    api.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @api.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @api.get("/notes", response_model=list[NoteRead])
    def list_notes(db: DbSession) -> list[models.Note]:
        return crud.list_notes(db)

    @api.post("/notes", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
    def create_note(payload: NoteCreate, db: DbSession) -> models.Note:
        return crud.create_note(db, payload)

    @api.patch("/notes/{note_id}", response_model=NoteRead)
    def update_note(note_id: int, payload: NoteUpdate, db: DbSession) -> models.Note:
        note = crud.get_note(db, note_id)
        if note is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        return crud.update_note(db, note, payload)

    @api.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_note(note_id: int, db: DbSession) -> Response:
        note = crud.get_note(db, note_id)
        if note is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        crud.delete_note(db, note)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return api


app = create_app()
