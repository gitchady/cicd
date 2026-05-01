import { FormEvent, useEffect, useMemo, useState } from "react";

import type { Note } from "./api";
import { createNote, deleteNote, listNotes, updateNote } from "./api";
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
          <div className="header-copy">
            <p className="eyebrow">CI/CD demo</p>
            <h1>Notes pipeline</h1>
            <p className="header-summary">
              A small live app that moves from GitHub Actions to Docker Compose on Ubuntu.
            </p>
          </div>
          <div className="deploy-card" aria-label="Deployment status">
            <span className="status-pill">Live deploy</span>
            <strong>GitHub Actions -&gt; Docker -&gt; Ubuntu</strong>
            <span>Production: 141.105.67.239</span>
          </div>
        </header>

        <section className="pipeline-strip" aria-label="CI/CD pipeline steps">
          <div>
            <span>01</span>
            <strong>Test</strong>
          </div>
          <div>
            <span>02</span>
            <strong>Build</strong>
          </div>
          <div>
            <span>03</span>
            <strong>Deploy</strong>
          </div>
        </section>

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
