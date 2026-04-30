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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
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
