import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createNote, deleteNote, listNotes, updateNote } from "./api";

const apiNote = {
  id: 3,
  title: "Ship frontend",
  content: "Run Vitest",
  created_at: "2026-04-30T00:00:00Z",
  updated_at: "2026-04-30T00:00:00Z"
};

describe("notes API client", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => apiNote
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads notes from the configured API base URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [apiNote]
    } as Response);

    await expect(listNotes()).resolves.toEqual([apiNote]);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8000/notes", expect.any(Object));
  });

  it("sends JSON bodies for create and update requests", async () => {
    await createNote({ title: "New", content: "Body" });
    await updateNote(3, { title: "Edited" });

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8000/notes",
      expect.objectContaining({
        body: JSON.stringify({ title: "New", content: "Body" }),
        method: "POST"
      })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/notes/3",
      expect.objectContaining({
        body: JSON.stringify({ title: "Edited" }),
        method: "PATCH"
      })
    );
  });

  it("handles empty delete responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: async () => ""
    } as Response);

    await expect(deleteNote(3)).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/notes/3",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("raises API errors with response details", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 422,
      text: async () => "Validation failed"
    } as Response);

    await expect(createNote({ title: "", content: "" })).rejects.toThrow("Validation failed");
  });
});
