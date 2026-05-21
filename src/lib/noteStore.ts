import type Database from 'better-sqlite3';

export interface Note {
  id?: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface NoteStore {
  getAllNotes(): Promise<Note[]>;
  getNoteBySlug(slug: string): Promise<Note | null>;
  getNoteById(id: number): Promise<Note | null>;
  createNote(data: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<number>;
  updateNote(id: number, data: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean>;
  deleteNote(id: number): Promise<boolean>;
}

export class SqliteNoteStore implements NoteStore {
  private db: Database.Database;
  private baseQuery = 'SELECT * FROM notes';
  private orderBy = 'ORDER BY category, sort_order ASC, created_at DESC';

  constructor(db: Database.Database) {
    this.db = db;
  }

  async getAllNotes(): Promise<Note[]> {
    const stmt = this.db.prepare(`${this.baseQuery} ${this.orderBy}`);
    return stmt.all() as Note[];
  }

  async getNoteBySlug(slug: string): Promise<Note | null> {
    const stmt = this.db.prepare(`${this.baseQuery} WHERE slug = ?`);
    const row = stmt.get(slug) as Note | undefined;
    return row ?? null;
  }

  async getNoteById(id: number): Promise<Note | null> {
    const stmt = this.db.prepare(`${this.baseQuery} WHERE id = ?`);
    const row = stmt.get(id) as Note | undefined;
    return row ?? null;
  }

  async createNote(data: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const stmt = this.db.prepare(
      'INSERT INTO notes (title, slug, content, category, sort_order) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(data.title, data.slug, data.content, data.category, data.sort_order);
    return result.lastInsertRowid as number;
  }

  async updateNote(id: number, data: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const updates = Object.entries(data).filter(([, value]) => value !== undefined);
    if (updates.length === 0) return false;

    const setClause = updates.map(([key]) => `${key} = ?`).join(', ');
    const values = [...updates.map(([, value]) => value), id];

    const stmt = this.db.prepare(`UPDATE notes SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values).changes > 0;
  }

  async deleteNote(id: number): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    return stmt.run(id).changes > 0;
  }
}

export class RemoteNoteStore implements NoteStore {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...this.headers(), ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Remote NoteDB ${init?.method ?? 'GET'} ${path} failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  private async fetchOptional<T>(path: string, init?: RequestInit): Promise<T | null> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...this.headers(), ...(init?.headers ?? {}) },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Remote NoteDB ${init?.method ?? 'GET'} ${path} failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async getAllNotes(): Promise<Note[]> {
    const data = await this.fetchJson<{ notes: Note[] }>('/api/notes');
    return data.notes;
  }

  async getNoteBySlug(slug: string): Promise<Note | null> {
    return this.fetchOptional<Note>(`/api/notes/slug/${encodeURIComponent(slug)}`);
  }

  async getNoteById(id: number): Promise<Note | null> {
    return this.fetchOptional<Note>(`/api/notes/${id}`);
  }

  async createNote(data: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const created = await this.fetchJson<Note>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (typeof created.id !== 'number') {
      throw new Error('Remote createNote: response missing id');
    }
    return created.id;
  }

  async updateNote(id: number, data: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const updated = await this.fetchOptional<Note>(`/api/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return updated !== null;
  }

  async deleteNote(id: number): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/notes/${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (res.status === 404) return false;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Remote NoteDB DELETE /api/notes/${id} failed: ${res.status} ${text}`);
    }
    return true;
  }
}
