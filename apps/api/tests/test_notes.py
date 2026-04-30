from collections.abc import Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import create_app

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture()
def test_app() -> Generator[FastAPI, None, None]:
    app = create_app(db_engine=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield app
    app.dependency_overrides.clear()


def setup_function() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_note_crud_flow(test_app: FastAPI) -> None:
    client = TestClient(test_app)

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
