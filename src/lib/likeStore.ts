import type Database from 'better-sqlite3';

export interface Like {
  id?: number;
  title: string;
  author: string;
  url: string;
  type: string;
  category: string;
  sort_order: number;
  created_at?: string;
}

export interface LikeStore {
  getAllLikes(): Promise<Like[]>;
  getLikeById(id: number): Promise<Like | null>;
  createLike(data: Omit<Like, 'id' | 'created_at'>): Promise<number>;
  updateLike(id: number, data: Partial<Omit<Like, 'id' | 'created_at'>>): Promise<boolean>;
  deleteLike(id: number): Promise<boolean>;
}

export class SqliteLikeStore implements LikeStore {
  private db: Database.Database;
  private baseQuery = 'SELECT * FROM likes';
  private orderBy = 'ORDER BY category, sort_order ASC, created_at DESC';

  constructor(db: Database.Database) {
    this.db = db;
  }

  async getAllLikes(): Promise<Like[]> {
    const stmt = this.db.prepare(`${this.baseQuery} ${this.orderBy}`);
    return stmt.all() as Like[];
  }

  async getLikeById(id: number): Promise<Like | null> {
    const stmt = this.db.prepare(`${this.baseQuery} WHERE id = ?`);
    const row = stmt.get(id) as Like | undefined;
    return row ?? null;
  }

  async createLike(data: Omit<Like, 'id' | 'created_at'>): Promise<number> {
    const stmt = this.db.prepare(
      'INSERT INTO likes (title, author, url, type, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(data.title, data.author, data.url, data.type, data.category, data.sort_order);
    return result.lastInsertRowid as number;
  }

  async updateLike(id: number, data: Partial<Omit<Like, 'id' | 'created_at'>>): Promise<boolean> {
    const updates = Object.entries(data).filter(([, value]) => value !== undefined);
    if (updates.length === 0) return false;

    const setClause = updates.map(([key]) => `${key} = ?`).join(', ');
    const values = [...updates.map(([, value]) => value), id];

    const stmt = this.db.prepare(`UPDATE likes SET ${setClause} WHERE id = ?`);
    return stmt.run(...values).changes > 0;
  }

  async deleteLike(id: number): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM likes WHERE id = ?');
    return stmt.run(id).changes > 0;
  }
}

export class RemoteLikeStore implements LikeStore {
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
      throw new Error(`Remote LikeDB ${init?.method ?? 'GET'} ${path} failed: ${res.status} ${text}`);
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
      throw new Error(`Remote LikeDB ${init?.method ?? 'GET'} ${path} failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async getAllLikes(): Promise<Like[]> {
    return this.fetchJson<Like[]>('/api/likes');
  }

  async getLikeById(id: number): Promise<Like | null> {
    return this.fetchOptional<Like>(`/api/likes/${id}`);
  }

  async createLike(data: Omit<Like, 'id' | 'created_at'>): Promise<number> {
    const created = await this.fetchJson<Like>('/api/likes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (typeof created.id !== 'number') {
      throw new Error('Remote createLike: response missing id');
    }
    return created.id;
  }

  async updateLike(id: number, data: Partial<Omit<Like, 'id' | 'created_at'>>): Promise<boolean> {
    const updated = await this.fetchOptional<Like>(`/api/likes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return updated !== null;
  }

  async deleteLike(id: number): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/likes/${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (res.status === 404) return false;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Remote LikeDB DELETE /api/likes/${id} failed: ${res.status} ${text}`);
    }
    return true;
  }
}
