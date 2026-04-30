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
