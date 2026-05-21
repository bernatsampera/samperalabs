# Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign samperalabs.com from a dark code-themed portfolio to a minimalist, light, typography-focused writer/builder site with new Notes and Things I Like sections, all managed via API.

**Architecture:** Strip existing dark theme and lab-style components. Replace with stone-palette light design using Tailwind's built-in colors and system fonts. Add two new SQLite tables (notes, likes) with full CRUD API endpoints following the existing PostStore dual-store pattern. Rewrite all public pages to the new minimal aesthetic.

**Tech Stack:** Astro 5 SSR, SQLite (better-sqlite3), Tailwind CSS 3, TypeScript, system fonts

**Spec:** `docs/superpowers/specs/2026-05-21-site-redesign-design.md`

---

## Phase 1: Database & Data Access Layer

### Task 1: Add Notes and Likes Tables to Schema

**Files:**
- Modify: `db/schema.sql`

- [ ] **Step 1: Add notes table to schema**

Append to `db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_slug ON notes(slug);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
```

- [ ] **Step 2: Add likes table to schema**

Append to `db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'article',
  category TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_likes_category ON likes(category);
```

- [ ] **Step 3: Commit**

```bash
git add db/schema.sql
git commit -m "feat: add notes and likes tables to schema"
```

---

### Task 2: Extend Data Access Layer with Note and Like Stores

**Files:**
- Create: `src/lib/noteStore.ts`
- Create: `src/lib/likeStore.ts`
- Modify: `src/lib/db.ts`

This follows the exact same dual-store pattern as the existing PostStore: a `SqliteStore` implementation for production and a `RemoteStore` that proxies to the API for dev.

- [ ] **Step 1: Create `src/lib/noteStore.ts`**

```typescript
import type Database from 'better-sqlite3';

export interface Note {
  id?: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NoteStore {
  getAllNotes(): Promise<Note[]>;
  getNoteBySlug(slug: string): Promise<Note | null>;
  getNoteById(id: number): Promise<Note | null>;
  createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<number>;
  updateNote(id: number, note: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean>;
  deleteNote(id: number): Promise<boolean>;
}

export class SqliteNoteStore implements NoteStore {
  constructor(private db: Database.Database) {}

  async getAllNotes(): Promise<Note[]> {
    return this.db.prepare('SELECT * FROM notes ORDER BY category, sort_order ASC, created_at DESC').all() as Note[];
  }

  async getNoteBySlug(slug: string): Promise<Note | null> {
    return (this.db.prepare('SELECT * FROM notes WHERE slug = ?').get(slug) as Note) ?? null;
  }

  async getNoteById(id: number): Promise<Note | null> {
    return (this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note) ?? null;
  }

  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const stmt = this.db.prepare(
      'INSERT INTO notes (title, slug, content, category, sort_order) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(note.title, note.slug, note.content, note.category, note.sort_order ?? 0);
    return result.lastInsertRowid as number;
  }

  async updateNote(id: number, note: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const updates = Object.entries(note).filter(([, v]) => v !== undefined);
    if (updates.length === 0) return false;
    const setClause = updates.map(([key]) => `${key} = ?`).join(', ');
    const values = [...updates.map(([, v]) => v), id];
    const stmt = this.db.prepare(`UPDATE notes SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values).changes > 0;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.db.prepare('DELETE FROM notes WHERE id = ?').run(id).changes > 0;
  }
}

export class RemoteNoteStore implements NoteStore {
  constructor(private baseUrl: string, private apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' };
  }

  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers: { ...this.headers(), ...(init?.headers ?? {}) } });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Remote notes ${init?.method ?? 'GET'} ${path} failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async getAllNotes(): Promise<Note[]> {
    const data = await this.fetchJson<{ notes: Note[] }>('/api/notes');
    return data.notes;
  }

  async getNoteBySlug(slug: string): Promise<Note | null> {
    const res = await fetch(`${this.baseUrl}/api/notes/slug/${encodeURIComponent(slug)}`, { headers: this.headers() });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Remote notes GET slug/${slug} failed: ${res.status}`);
    return res.json() as Promise<Note>;
  }

  async getNoteById(id: number): Promise<Note | null> {
    const res = await fetch(`${this.baseUrl}/api/notes/${id}`, { headers: this.headers() });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Remote notes GET ${id} failed: ${res.status}`);
    return res.json() as Promise<Note>;
  }

  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const created = await this.fetchJson<Note>('/api/notes', { method: 'POST', body: JSON.stringify(note) });
    return created.id!;
  }

  async updateNote(id: number, note: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/notes/${id}`, {
      method: 'PATCH', headers: this.headers(), body: JSON.stringify(note),
    });
    return res.ok;
  }

  async deleteNote(id: number): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/notes/${id}`, { method: 'DELETE', headers: this.headers() });
    return res.ok;
  }
}
```

- [ ] **Step 2: Create `src/lib/likeStore.ts`**

```typescript
import type Database from 'better-sqlite3';

export interface Like {
  id?: number;
  title: string;
  author: string;
  url: string;
  type: string;
  category: string;
  sort_order?: number;
  created_at?: string;
}

export interface LikeStore {
  getAllLikes(): Promise<Like[]>;
  getLikeById(id: number): Promise<Like | null>;
  createLike(like: Omit<Like, 'id' | 'created_at'>): Promise<number>;
  updateLike(id: number, like: Partial<Omit<Like, 'id' | 'created_at'>>): Promise<boolean>;
  deleteLike(id: number): Promise<boolean>;
}

export class SqliteLikeStore implements LikeStore {
  constructor(private db: Database.Database) {}

  async getAllLikes(): Promise<Like[]> {
    return this.db.prepare('SELECT * FROM likes ORDER BY category, sort_order ASC, created_at DESC').all() as Like[];
  }

  async getLikeById(id: number): Promise<Like | null> {
    return (this.db.prepare('SELECT * FROM likes WHERE id = ?').get(id) as Like) ?? null;
  }

  async createLike(like: Omit<Like, 'id' | 'created_at'>): Promise<number> {
    const stmt = this.db.prepare(
      'INSERT INTO likes (title, author, url, type, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(like.title, like.author, like.url, like.type, like.category, like.sort_order ?? 0);
    return result.lastInsertRowid as number;
  }

  async updateLike(id: number, like: Partial<Omit<Like, 'id' | 'created_at'>>): Promise<boolean> {
    const updates = Object.entries(like).filter(([, v]) => v !== undefined);
    if (updates.length === 0) return false;
    const setClause = updates.map(([key]) => `${key} = ?`).join(', ');
    const values = [...updates.map(([, v]) => v), id];
    const stmt = this.db.prepare(`UPDATE likes SET ${setClause} WHERE id = ?`);
    return stmt.run(...values).changes > 0;
  }

  async deleteLike(id: number): Promise<boolean> {
    return this.db.prepare('DELETE FROM likes WHERE id = ?').run(id).changes > 0;
  }
}

export class RemoteLikeStore implements LikeStore {
  constructor(private baseUrl: string, private apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' };
  }

  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers: { ...this.headers(), ...(init?.headers ?? {}) } });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Remote likes ${init?.method ?? 'GET'} ${path} failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async getAllLikes(): Promise<Like[]> {
    const data = await this.fetchJson<{ likes: Like[] }>('/api/likes');
    return data.likes;
  }

  async getLikeById(id: number): Promise<Like | null> {
    const res = await fetch(`${this.baseUrl}/api/likes/${id}`, { headers: this.headers() });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Remote likes GET ${id} failed: ${res.status}`);
    return res.json() as Promise<Like>;
  }

  async createLike(like: Omit<Like, 'id' | 'created_at'>): Promise<number> {
    const created = await this.fetchJson<Like>('/api/likes', { method: 'POST', body: JSON.stringify(like) });
    return created.id!;
  }

  async updateLike(id: number, like: Partial<Omit<Like, 'id' | 'created_at'>>): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/likes/${id}`, {
      method: 'PATCH', headers: this.headers(), body: JSON.stringify(like),
    });
    return res.ok;
  }

  async deleteLike(id: number): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/likes/${id}`, { method: 'DELETE', headers: this.headers() });
    return res.ok;
  }
}
```

- [ ] **Step 3: Extend `src/lib/db.ts` to expose note and like stores**

The key pattern: `SqliteStore` opens a `better-sqlite3` connection in its constructor and runs `schema.sql` via `initSchema()`. The new stores must share the same DB connection (not open a separate one) so the schema is already initialized.

**Approach:** Expose the internal `Database.Database` instance from `SqliteStore` via a getter, then pass it to the new store constructors. This avoids duplicate connections and ensures schema.sql (which now includes notes/likes tables) has already been run.

Add to the imports at top of `src/lib/db.ts`:

```typescript
import { SqliteNoteStore, RemoteNoteStore, type NoteStore } from './noteStore';
import { SqliteLikeStore, RemoteLikeStore, type LikeStore } from './likeStore';
```

Add a public getter to `SqliteStore` class (after the constructor):

```typescript
getConnection(): Database.Database {
  return this.db;
}
```

Add new singleton variables near line 448:

```typescript
let noteInstance: NoteStore | null = null;
let likeInstance: LikeStore | null = null;
```

Add two new factory functions after `getDB()`:

```typescript
export function getNoteDB(): NoteStore {
  if (noteInstance) return noteInstance;

  if (import.meta.env.PROD) {
    // Ensure the main PostStore is initialized first (runs schema.sql which creates all tables).
    const postStore = getDB() as SqliteStore;
    noteInstance = new SqliteNoteStore(postStore.getConnection());
    return noteInstance;
  }

  const url = process.env.BLOG_REMOTE_URL ?? DEFAULT_REMOTE_URL;
  const key = process.env.BLOG_API_KEY;
  if (!key) throw new Error('BLOG_API_KEY is required in dev.');
  noteInstance = new RemoteNoteStore(url, key);
  return noteInstance;
}

export function getLikeDB(): LikeStore {
  if (likeInstance) return likeInstance;

  if (import.meta.env.PROD) {
    const postStore = getDB() as SqliteStore;
    likeInstance = new SqliteLikeStore(postStore.getConnection());
    return likeInstance;
  }

  const url = process.env.BLOG_REMOTE_URL ?? DEFAULT_REMOTE_URL;
  const key = process.env.BLOG_API_KEY;
  if (!key) throw new Error('BLOG_API_KEY is required in dev.');
  likeInstance = new RemoteLikeStore(url, key);
  return likeInstance;
}
```

Update `closeDB()` to also clear new stores (they share the same DB connection, so no separate close needed):

```typescript
export function closeDB() {
  if (dbInstance) { dbInstance.close(); dbInstance = null; }
  noteInstance = null;
  likeInstance = null;
}
```

Re-export types:

```typescript
export type { Note, NoteStore } from './noteStore';
export type { Like, LikeStore } from './likeStore';
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds (new code is not yet used by any page, so it just needs to compile).

- [ ] **Step 5: Commit**

```bash
git add src/lib/noteStore.ts src/lib/likeStore.ts src/lib/db.ts
git commit -m "feat: add note and like data access layer with dual-store pattern"
```

---

### Task 3: Create Notes API Endpoints

**Files:**
- Create: `src/pages/api/notes/index.ts`
- Create: `src/pages/api/notes/[id].ts`
- Create: `src/pages/api/notes/slug/[slug].ts`

Follow the exact same patterns as `src/pages/api/posts/index.ts` and `src/pages/api/posts/[id].ts`: auth guard via `requireAuth()`, JSON responses, same error format.

- [ ] **Step 1: Create `src/pages/api/notes/index.ts` (GET list + POST create)**

Follow the exact patterns from `src/pages/api/posts/index.ts`: use `errorResponse()` helper, `jsonResponse()` helper, `export const prerender = false`, and try/catch wrapping.

```typescript
import type { APIRoute } from 'astro';
import { getNoteDB } from '~/lib/db';
import { errorResponse, requireAuth } from '~/lib/apiAuth';

export const prerender = false;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    const db = getNoteDB();
    let notes = await db.getAllNotes();

    if (category) {
      notes = notes.filter((n) => n.category === category);
    }

    return jsonResponse({ notes });
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { title, slug, content, category, sort_order } = body;

    if (!title || !slug) {
      return errorResponse(400, 'title and slug are required', 'validation_error');
    }

    const db = getNoteDB();

    const existing = await db.getNoteBySlug(slug);
    if (existing) {
      return errorResponse(409, 'Slug already exists', 'slug_conflict');
    }

    const id = await db.createNote({
      title,
      slug,
      content: content ?? '',
      category: category ?? '',
      sort_order: sort_order ?? 0,
    });

    const note = await db.getNoteById(id);
    return jsonResponse(note, 201);
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};
```

- [ ] **Step 2: Create `src/pages/api/notes/[id].ts` (GET, PATCH, DELETE by ID)**

```typescript
import type { APIRoute } from 'astro';
import { getNoteDB } from '~/lib/db';
import { errorResponse, requireAuth } from '~/lib/apiAuth';

export const prerender = false;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const id = Number(params.id);
    if (isNaN(id)) return errorResponse(400, 'Invalid ID', 'validation_error');

    const db = getNoteDB();
    const note = await db.getNoteById(id);
    if (!note) return errorResponse(404, 'Note not found', 'not_found');

    return jsonResponse(note);
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const id = Number(params.id);
    if (isNaN(id)) return errorResponse(400, 'Invalid ID', 'validation_error');

    const db = getNoteDB();
    const existing = await db.getNoteById(id);
    if (!existing) return errorResponse(404, 'Note not found', 'not_found');

    const body = await request.json();
    const allowed = ['title', 'slug', 'content', 'category', 'sort_order'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (updates.slug && updates.slug !== existing.slug) {
      const conflict = await db.getNoteBySlug(updates.slug as string);
      if (conflict) return errorResponse(409, 'Slug already exists', 'slug_conflict');
    }

    await db.updateNote(id, updates);
    const updated = await db.getNoteById(id);
    return jsonResponse(updated);
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const id = Number(params.id);
    if (isNaN(id)) return errorResponse(400, 'Invalid ID', 'validation_error');

    const db = getNoteDB();
    const deleted = await db.deleteNote(id);
    if (!deleted) return errorResponse(404, 'Note not found', 'not_found');

    return new Response(null, { status: 204 });
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};
```

- [ ] **Step 3: Create `src/pages/api/notes/slug/[slug].ts` (GET by slug)**

```typescript
import type { APIRoute } from 'astro';
import { getNoteDB } from '~/lib/db';
import { errorResponse, requireAuth } from '~/lib/apiAuth';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const slug = params.slug;
    if (!slug) return errorResponse(400, 'Slug is required', 'validation_error');

    const db = getNoteDB();
    const note = await db.getNoteBySlug(slug);
    if (!note) return errorResponse(404, 'Note not found', 'not_found');

    return new Response(JSON.stringify(note), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};
```

- [ ] **Step 4: Verify build compiles**

Run: `npm run build 2>&1 | tail -20`

- [ ] **Step 5: Commit**

```bash
git add src/pages/api/notes/
git commit -m "feat: add notes API endpoints (CRUD + slug lookup)"
```

---

### Task 4: Create Likes API Endpoints

**Files:**
- Create: `src/pages/api/likes/index.ts`
- Create: `src/pages/api/likes/[id].ts`

- [ ] **Step 1: Create `src/pages/api/likes/index.ts` (GET list + POST create)**

```typescript
import type { APIRoute } from 'astro';
import { getLikeDB } from '~/lib/db';
import { errorResponse, requireAuth } from '~/lib/apiAuth';

export const prerender = false;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    const db = getLikeDB();
    let likes = await db.getAllLikes();

    if (category) {
      likes = likes.filter((l) => l.category === category);
    }

    return jsonResponse({ likes });
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { title, author, url: itemUrl, type, category, sort_order } = body;

    if (!title) return errorResponse(400, 'title is required', 'validation_error');

    const db = getLikeDB();
    const id = await db.createLike({
      title,
      author: author ?? '',
      url: itemUrl ?? '',
      type: type ?? 'article',
      category: category ?? '',
      sort_order: sort_order ?? 0,
    });

    const like = await db.getLikeById(id);
    return jsonResponse(like, 201);
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};
```

- [ ] **Step 2: Create `src/pages/api/likes/[id].ts` (GET, PATCH, DELETE by ID)**

```typescript
import type { APIRoute } from 'astro';
import { getLikeDB } from '~/lib/db';
import { errorResponse, requireAuth } from '~/lib/apiAuth';

export const prerender = false;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const id = Number(params.id);
    if (isNaN(id)) return errorResponse(400, 'Invalid ID', 'validation_error');

    const db = getLikeDB();
    const like = await db.getLikeById(id);
    if (!like) return errorResponse(404, 'Like not found', 'not_found');

    return jsonResponse(like);
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const id = Number(params.id);
    if (isNaN(id)) return errorResponse(400, 'Invalid ID', 'validation_error');

    const db = getLikeDB();
    const existing = await db.getLikeById(id);
    if (!existing) return errorResponse(404, 'Like not found', 'not_found');

    const body = await request.json();
    const allowed = ['title', 'author', 'url', 'type', 'category', 'sort_order'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    await db.updateLike(id, updates);
    const updated = await db.getLikeById(id);
    return jsonResponse(updated);
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const id = Number(params.id);
    if (isNaN(id)) return errorResponse(400, 'Invalid ID', 'validation_error');

    const db = getLikeDB();
    const deleted = await db.deleteLike(id);
    if (!deleted) return errorResponse(404, 'Like not found', 'not_found');

    return new Response(null, { status: 204 });
  } catch (err) {
    return errorResponse(500, String(err), 'server_error');
  }
};
```

- [ ] **Step 3: Verify build compiles**

Run: `npm run build 2>&1 | tail -20`

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/likes/
git commit -m "feat: add likes API endpoints (CRUD)"
```

---

## Phase 2: Design System & Layouts

### Task 5: Replace Tailwind Configuration

**Files:**
- Modify: `tailwind.config.cjs`

- [ ] **Step 1: Replace `tailwind.config.cjs` with new config**

Replace the entire file contents:

```javascript
import typographyPlugin from '@tailwindcss/typography';

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', "'Segoe UI'", 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [typographyPlugin],
};
```

This removes: ink palette, stamp/marker colors, custom fonts, notebook background, `darkMode: 'class'`. Stone colors are built into Tailwind — no custom tokens needed.

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.cjs
git commit -m "refactor: replace dark ink theme with minimal stone config"
```

---

### Task 6: Update Global CSS

**Files:**
- Modify: `src/assets/styles/tailwind.css`
- Modify: `src/styles/post-render.css`

- [ ] **Step 1: Replace `src/assets/styles/tailwind.css`**

Replace entire file contents with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

This removes: header scroll shadow, dark mode styles, dropdown menu styles, icon stroke classes, hamburger animation. All will be replaced by component-level Tailwind classes.

- [ ] **Step 2: Replace `src/styles/post-render.css` for light theme**

Replace the entire file. Restyle from dark Catppuccin to a light stone aesthetic:

```css
.post-prose {
  color: #44403c; /* stone-700 */
  font-size: 15px;
  line-height: 1.75;
  max-width: 44rem;
}

.post-prose h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1c1917; /* stone-900 */
  margin-top: 2em;
  margin-bottom: 0.75em;
}

.post-prose h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1c1917;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.post-prose p {
  margin-bottom: 1em;
}

.post-prose a {
  color: #1c1917;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: #d6d3d1; /* stone-300 */
}

.post-prose a:hover {
  text-decoration-color: #a8a29e; /* stone-400 */
}

.post-prose blockquote {
  border-left: 3px solid #e7e5e4; /* stone-200 */
  padding-left: 1em;
  color: #78716c; /* stone-500 */
  font-style: italic;
  margin: 1.5em 0;
}

.post-prose ul,
.post-prose ol {
  margin: 1em 0;
  padding-left: 1.5em;
}

.post-prose li {
  margin-bottom: 0.25em;
}

.post-prose code {
  background: #f5f5f4; /* stone-100 */
  color: #44403c;
  padding: 0.15em 0.35em;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.post-prose pre {
  background: #1c1917; /* stone-900 — dark code blocks */
  color: #e7e5e4;
  padding: 1em 1.25em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.5em 0;
  font-size: 14px;
  line-height: 1.6;
}

.post-prose pre code {
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}

.post-prose img {
  border-radius: 6px;
  margin: 1.5em 0;
}

.post-prose hr {
  border: none;
  border-top: 1px solid #e7e5e4;
  margin: 2em 0;
}

/* Copy button on code blocks */
.copy-code-button {
  color: #a8a29e;
  font-size: 12px;
  cursor: pointer;
}
.copy-code-button:hover {
  color: #78716c;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/assets/styles/tailwind.css src/styles/post-render.css
git commit -m "refactor: restyle global CSS from dark to light stone theme"
```

---

### Task 7: Update Base Layout

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Update `src/layouts/Layout.astro`**

Key changes to `src/layouts/Layout.astro` (currently 118 lines):

1. **Line 2:** Remove `import '~/assets/styles/tiptap.css';` — move to admin pages only
2. **Line 5:** Remove `import '@fontsource-variable/jetbrains-mono';` — no custom fonts
3. **Lines 32-78:** Remove all six `@font-face` blocks for PP Neue Montreal
4. **Line 100:** Replace `<body>` class: `bg-ink bg-notebook text-text font-sans` → `bg-stone-50 text-stone-900 font-sans`
5. Keep: `tailwind.css` import, `post-render.css` import, meta tags, analytics, copy-to-clipboard script, font-feature-settings, antialiasing

**Important:** The admin pages at `src/pages/admin/` use the TipTap editor which needs `tiptap.css`. Check if admin pages have their own layout — if they import Layout.astro directly, add `import '~/assets/styles/tiptap.css'` to the admin page(s) that use the editor. Look at `src/pages/admin/` to find where to add it.

- [ ] **Step 2: Verify dev server starts**

Run: `npm run dev` and check that the page loads (will look broken — that's expected at this stage).

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "refactor: update base layout to light stone theme, remove custom fonts"
```

---

### Task 8: Rewrite Header with Menu Overlay

**Files:**
- Modify: `src/components/elements/Header.astro`
- Modify: `src/navigation.js`

- [ ] **Step 1: Replace `src/components/elements/Header.astro`**

Replace the entire file:

```astro
---
import {getHomePermalink} from '~/utils/permalinks';

interface Link { text?: string; href?: string; }
export interface Props { links?: Array<Link>; isSticky?: boolean; }

const {links = [], isSticky = true} = Astro.props;
---

<header class="sticky top-0 z-40 w-full bg-stone-50/85 backdrop-blur-sm">
  <div class="mx-auto max-w-[44rem] px-5 sm:px-8 h-14 flex items-center justify-between">
    <a href={getHomePermalink()} class="text-[15px] font-medium text-stone-900 hover:text-stone-600 transition-colors">
      Bernat Sampera
    </a>
    <button
      id="menu-toggle"
      class="text-[13px] text-stone-400 hover:text-stone-600 transition-colors"
      aria-expanded="false"
      aria-controls="menu-overlay"
    >
      Open menu
    </button>
  </div>
</header>

<!-- Menu Overlay -->
<div
  id="menu-overlay"
  class="fixed inset-0 z-50 bg-stone-50 hidden opacity-0 transition-opacity duration-200"
>
  <div class="mx-auto max-w-[44rem] px-5 sm:px-8 h-14 flex items-center justify-between">
    <a href={getHomePermalink()} class="text-[15px] font-medium text-stone-900 hover:text-stone-600 transition-colors">
      Bernat Sampera
    </a>
    <button
      id="menu-close"
      class="text-[13px] text-stone-400 hover:text-stone-600 transition-colors"
    >
      Close
    </button>
  </div>

  <nav class="mx-auto max-w-[44rem] px-5 sm:px-8 pt-12">
    <div class="flex flex-col gap-6">
      {links.map(({text, href}) => (
        <a
          href={href}
          class="text-[28px] text-stone-900 hover:text-stone-600 transition-colors"
        >{text}</a>
      ))}
    </div>

    <div class="mt-12 pt-6 border-t border-stone-200 flex gap-6">
      <a href="https://x.com/bsampera97" target="_blank" rel="noreferrer" class="text-[13px] text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2">X ↗</a>
      <a href="https://github.com/bernatsampera" target="_blank" rel="noreferrer" class="text-[13px] text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2">GitHub ↗</a>
      <a href="/rss.xml" class="text-[13px] text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2">RSS</a>
    </div>
  </nav>
</div>

<script>
  const toggle = document.getElementById('menu-toggle');
  const overlay = document.getElementById('menu-overlay');
  const close = document.getElementById('menu-close');

  function openMenu() {
    overlay?.classList.remove('hidden');
    requestAnimationFrame(() => {
      overlay?.classList.remove('opacity-0');
      overlay?.classList.add('opacity-100');
    });
    toggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    overlay?.classList.remove('opacity-100');
    overlay?.classList.add('opacity-0');
    setTimeout(() => overlay?.classList.add('hidden'), 200);
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle?.addEventListener('click', openMenu);
  close?.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
</script>
```

- [ ] **Step 2: Update `src/navigation.js`**

Replace the entire file:

```javascript
export const headerData = {
  links: [
    { text: 'Essays', href: '/' },
    { text: 'About', href: '/about' },
    { text: 'Notes', href: '/notes' },
    { text: 'Things I Like', href: '/things-i-like' },
  ],
};

export const footerData = {};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/elements/Header.astro src/navigation.js
git commit -m "feat: rewrite header with menu overlay and new navigation"
```

---

### Task 9: Rewrite Footer

**Files:**
- Modify: `src/components/elements/Footer.astro`

- [ ] **Step 1: Replace `src/components/elements/Footer.astro`**

Replace the entire file. Minimal footer matching the stone aesthetic:

```astro
---
---

<footer class="mt-24 border-t border-stone-200">
  <div class="mx-auto max-w-[44rem] px-5 sm:px-8 py-10 text-[13px] text-stone-400">
    <p>Bernat Sampera · {new Date().getFullYear()}</p>
  </div>
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/elements/Footer.astro
git commit -m "refactor: simplify footer to minimal stone style"
```

---

### Task 10: Create Essay Layout

**Files:**
- Modify: `src/layouts/BlogLayout.astro`

- [ ] **Step 1: Rewrite `src/layouts/BlogLayout.astro`**

Replace with a minimal essay layout. Keep ToC and reading time, remove related posts and dark theme styling:

```astro
---
import PageLayout from '~/layouts/PageLayout.astro';
import type {MetaData} from '~/types';

export interface Props {
  metadata?: MetaData;
  post: {
    title: string;
    author: string;
    pub_date: string;
    description?: string;
    content: string;
  };
}

const {metadata, post} = Astro.props;

const readingTime = Math.max(Math.floor(post.content.length / 1000), 1);
const pubDate = new Date(post.pub_date);
const formattedDate = pubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
---

<PageLayout metadata={metadata}>
  <article class="mx-auto max-w-[44rem] px-5 sm:px-8 pt-12 sm:pt-16 pb-16">
    <header class="mb-10">
      <a href="/" class="text-[13px] text-stone-400 hover:text-stone-600 transition-colors">← Essays</a>
      <h1 class="mt-4 text-[28px] font-semibold text-stone-900 leading-tight">{post.title}</h1>
      <div class="mt-3 text-[13px] text-stone-400 tabular-nums">
        {readingTime} min read · {formattedDate}
      </div>
      {post.description && (
        <p class="mt-4 text-[15px] text-stone-500 italic">{post.description}</p>
      )}
    </header>

    <div class="post-prose">
      <slot />
    </div>
  </article>
</PageLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/BlogLayout.astro
git commit -m "refactor: restyle blog layout as minimal essay layout"
```

---

## Phase 3: Pages

### Task 11: Rewrite Homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace `src/pages/index.astro`**

Replace the entire file:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import {getDB} from '../lib/db';
import {projectSlugSet} from '../lib/projects';

const db = getDB();
const allPosts = await db.getAllPosts();

const essays = allPosts
  .filter((p) => !projectSlugSet.has(p.slug))
  .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());

// Group by year
const byYear = new Map<number, typeof essays>();
for (const post of essays) {
  const year = new Date(post.pub_date).getFullYear();
  if (!byYear.has(year)) byYear.set(year, []);
  byYear.get(year)!.push(post);
}
const years = [...byYear.keys()].sort((a, b) => b - a);

const metadata = {
  title: 'Bernat Sampera',
  description: 'Builder and writer at the intersection of AI and software.',
};
---

<PageLayout metadata={metadata}>
  <main class="animate-fade-in">
    <!-- Hero -->
    <section class="mx-auto max-w-[44rem] px-5 sm:px-8 pt-8 sm:pt-12 pb-10 sm:pb-14">
      <p class="text-[20px] text-stone-500 leading-relaxed">
        Everything is context.
      </p>
      <p class="mt-4 text-[15px] text-stone-400 leading-relaxed">
        Builder and writer working at the intersection of AI and software.
      </p>
    </section>

    <!-- Essays by year -->
    <section class="mx-auto max-w-[44rem] px-5 sm:px-8 pb-16">
      {years.map((year) => (
        <div>
          <h3 class="text-[14px] font-semibold text-stone-900 pt-8 sm:pt-10 pb-3 sm:pb-4">
            {year}
          </h3>
          <ul class="border-t border-stone-100/80">
            {byYear.get(year)!.map((post) => {
              const date = new Date(post.pub_date);
              const month = date.toLocaleDateString('en-US', { month: 'short' });
              const day = date.getDate();
              return (
                <li class="border-b border-stone-100/80">
                  <a
                    href={`/posts/${post.slug}`}
                    class="group block py-3 sm:py-2.5"
                  >
                    <div class="flex justify-between items-baseline gap-4">
                      <h2 class="text-[16px] text-stone-900 group-hover:text-stone-600 transition-colors break-words">
                        {post.title}
                      </h2>
                      <span class="text-[13px] text-stone-400 tabular-nums whitespace-nowrap">
                        {post.readingTime} min · {month} {day}
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  </main>
</PageLayout>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.4s ease-out;
  }
</style>
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`
Open http://localhost:4322 and verify the homepage renders with hero + essays by year.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: rewrite homepage with hero tagline and essays by year"
```

---

### Task 12: Rewrite About Page

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Replace `src/pages/about.astro`**

Replace the entire file:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';

const metadata = {
  title: 'About',
  description: 'About Bernat Sampera — builder and writer at the intersection of AI and software.',
};
---

<PageLayout metadata={metadata}>
  <main class="mx-auto max-w-[44rem] px-5 sm:px-8 pt-12 sm:pt-16 pb-16 animate-fade-in">
    <h1 class="text-[28px] font-semibold text-stone-900 mb-8">About</h1>

    <div class="text-[15px] text-stone-700 leading-[1.75] space-y-4">
      <p>I'm Bernat Sampera. I build software that puts AI into production — not demos, not proofs of concept, but systems that run in the real world and do useful work.</p>
      <p>I've spent the last years working at the intersection of language models and application development. I care about context management, orchestration, and making AI tools that people actually use.</p>
      <p>Before that, I worked across the stack — frontend, backend, infrastructure. That range matters when you're integrating AI into existing systems.</p>
    </div>

    <h3 class="text-[14px] font-semibold text-stone-900 pt-10 pb-4">What I Believe</h3>
    <div class="text-[15px] text-stone-700 leading-[1.75] space-y-4">
      <p><strong class="text-stone-900">Context is everything.</strong> The model matters less than what you feed it. Most AI failures are context failures.</p>
      <p><strong class="text-stone-900">Ship, then refine.</strong> Working software teaches you more than planning documents. Get it in front of users.</p>
      <p><strong class="text-stone-900">Simple beats clever.</strong> The best systems are the ones you can explain in a sentence. Complexity is a cost, not a feature.</p>
      <p><strong class="text-stone-900">Writing is thinking.</strong> If you can't write it clearly, you don't understand it yet.</p>
    </div>

    <h3 class="text-[14px] font-semibold text-stone-900 pt-10 pb-4">Connect</h3>
    <div class="text-[15px] text-stone-700 leading-[1.75]">
      <p>
        Find me on
        <a href="https://x.com/bsampera97" target="_blank" rel="noreferrer" class="text-stone-900 underline underline-offset-2 decoration-stone-300 hover:decoration-stone-400 transition-colors">X <span class="text-stone-400">↗</span></a>.
      </p>
    </div>
  </main>
</PageLayout>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.4s ease-out;
  }
</style>
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:4322/about and verify the page renders correctly.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: rewrite about page with stone minimal style"
```

---

### Task 13: Create Notes Pages

**Files:**
- Create: `src/pages/notes/index.astro`
- Create: `src/pages/notes/[slug].astro`

- [ ] **Step 1: Create `src/pages/notes/index.astro`**

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import {getNoteDB} from '../../lib/db';

const db = getNoteDB();
const allNotes = await db.getAllNotes();

// Group by category
const byCategory = new Map<string, typeof allNotes>();
for (const note of allNotes) {
  const cat = note.category || 'Uncategorized';
  if (!byCategory.has(cat)) byCategory.set(cat, []);
  byCategory.get(cat)!.push(note);
}
const categories = [...byCategory.keys()];

const metadata = {
  title: 'Notes',
  description: 'Ideas, patterns, and things I keep coming back to.',
};
---

<PageLayout metadata={metadata}>
  <main class="mx-auto max-w-[44rem] px-5 sm:px-8 pt-12 sm:pt-16 pb-16 animate-fade-in">
    <h1 class="text-[28px] font-semibold text-stone-900 mb-2">Notes</h1>
    <p class="text-[15px] text-stone-500 leading-relaxed mb-8">
      Ideas, patterns, and things I keep coming back to. Collected from building, reading, and paying attention.
    </p>

    {categories.length > 1 && (
      <div class="flex flex-wrap gap-2 mb-8 pb-4 border-b border-stone-200">
        {categories.map((cat) => (
          <a
            href={`#${cat.toLowerCase().replace(/\s+/g, '-')}`}
            class="text-[12px] text-stone-500 px-2.5 py-1 bg-stone-100 rounded hover:bg-stone-200 transition-colors"
          >{cat}</a>
        ))}
      </div>
    )}

    {categories.map((cat) => (
      <div>
        <h3
          id={cat.toLowerCase().replace(/\s+/g, '-')}
          class="text-[14px] font-semibold text-stone-900 pt-8 sm:pt-10 pb-3 sm:pb-4"
        >{cat}</h3>
        <ul class="border-t border-stone-100/80">
          {byCategory.get(cat)!.map((note) => (
            <li class="border-b border-stone-100/80">
              <a
                href={`/notes/${note.slug}`}
                class="group block py-3 sm:py-2.5"
              >
                <h2 class="text-[16px] text-stone-900 group-hover:text-stone-600 transition-colors break-words">
                  {note.title}
                </h2>
              </a>
            </li>
          ))}
        </ul>
      </div>
    ))}

    {categories.length === 0 && (
      <p class="text-[15px] text-stone-400 py-8">No notes yet.</p>
    )}
  </main>
</PageLayout>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.4s ease-out;
  }
</style>
```

- [ ] **Step 2: Create `src/pages/notes/[slug].astro`**

Use the same markdown rendering pipeline as `src/pages/posts/[slug].astro`: `Marked` class with `markedHighlight`, `preprocessMarkdownContent`, `addHeadingIds`, `wrapCodeBlocks`.

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import {getNoteDB} from '../../lib/db';
import {Marked} from 'marked';
import {markedHighlight} from 'marked-highlight';
import {preprocessMarkdownContent} from '../../utils/markdown';
import {addHeadingIds} from '../../utils/tableOfContents';
import {wrapCodeBlocks} from '../../utils/codeBlockWrap';
import hljs from 'highlight.js';

const {slug} = Astro.params;
const db = getNoteDB();
const note = await db.getNoteBySlug(slug!);

if (!note) {
  return Astro.redirect('/404');
}

const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, {language}).value;
    },
  })
);

let html = await marked.parse(preprocessMarkdownContent(note.content));
html = addHeadingIds(html);
html = wrapCodeBlocks(html);

const metadata = {
  title: note.title,
  description: `${note.title} — a note by Bernat Sampera.`,
};
---

<PageLayout metadata={metadata}>
  <article class="mx-auto max-w-[44rem] px-5 sm:px-8 pt-12 sm:pt-16 pb-16 animate-fade-in">
    <header class="mb-10">
      <a href="/notes" class="text-[13px] text-stone-400 hover:text-stone-600 transition-colors">← Notes</a>
      <h1 class="mt-4 text-[28px] font-semibold text-stone-900 leading-tight">{note.title}</h1>
      {note.category && (
        <span class="mt-2 inline-block text-[12px] text-stone-400">{note.category}</span>
      )}
    </header>

    <div class="post-prose" set:html={renderedContent} />
  </article>
</PageLayout>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.4s ease-out;
  }
</style>
```

- [ ] **Step 3: Verify in browser**

Open http://localhost:4322/notes — should show an empty state ("No notes yet.") since no data exists yet.

- [ ] **Step 4: Commit**

```bash
git add src/pages/notes/
git commit -m "feat: add notes listing and individual note pages"
```

---

### Task 14: Create Things I Like Page

**Files:**
- Create: `src/pages/things-i-like.astro`

- [ ] **Step 1: Create `src/pages/things-i-like.astro`**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import {getLikeDB} from '../lib/db';

const db = getLikeDB();
const allLikes = await db.getAllLikes();

// Group by category
const byCategory = new Map<string, typeof allLikes>();
for (const like of allLikes) {
  const cat = like.category || 'Uncategorized';
  if (!byCategory.has(cat)) byCategory.set(cat, []);
  byCategory.get(cat)!.push(like);
}
const categories = [...byCategory.keys()];

const metadata = {
  title: 'Things I Like',
  description: 'Books, podcasts, talks, and articles I keep coming back to.',
};
---

<PageLayout metadata={metadata}>
  <main class="mx-auto max-w-[44rem] px-5 sm:px-8 pt-12 sm:pt-16 pb-16 animate-fade-in">
    <h1 class="text-[28px] font-semibold text-stone-900 mb-2">Things I Like</h1>
    <p class="text-[15px] text-stone-500 leading-relaxed mb-8">
      Books, podcasts, talks, and articles I keep coming back to.
    </p>

    {categories.map((cat) => (
      <div>
        <h3 class="text-[14px] font-semibold text-stone-900 pt-8 sm:pt-10 pb-3 sm:pb-4">{cat}</h3>
        <ul class="border-t border-stone-100/80">
          {byCategory.get(cat)!.map((like) => (
            <li class="border-b border-stone-100/80">
              <a
                href={like.url}
                target="_blank"
                rel="noreferrer"
                class="group block py-3 sm:py-2.5"
              >
                <div class="flex justify-between items-baseline gap-4">
                  <div class="min-w-0">
                    <span class="text-[16px] text-stone-900 group-hover:text-stone-600 transition-colors break-words">
                      {like.title}
                    </span>
                    {like.author && (
                      <span class="text-[13px] text-stone-400 ml-2">{like.author}</span>
                    )}
                  </div>
                  <span class="text-[12px] text-stone-400 whitespace-nowrap group-hover:text-stone-600 transition-colors">
                    {like.type} <span class="inline-block transition-transform group-hover:translate-x-0.5">↗</span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    ))}

    {categories.length === 0 && (
      <p class="text-[15px] text-stone-400 py-8">Nothing here yet.</p>
    )}
  </main>
</PageLayout>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.4s ease-out;
  }
</style>
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:4322/things-i-like — should show empty state.

- [ ] **Step 3: Commit**

```bash
git add src/pages/things-i-like.astro
git commit -m "feat: add things I like page"
```

---

### Task 15: Restyle 404 Page

**Files:**
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Replace `src/pages/404.astro`**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';

const metadata = {
  title: 'Page Not Found',
};
---

<PageLayout metadata={metadata}>
  <main class="mx-auto max-w-[44rem] px-5 sm:px-8 pt-24 pb-16 text-center">
    <h1 class="text-[28px] font-semibold text-stone-900 mb-4">Page not found</h1>
    <p class="text-[15px] text-stone-500 mb-8">The page you're looking for doesn't exist.</p>
    <a href="/" class="text-[15px] text-stone-900 underline underline-offset-2 decoration-stone-300 hover:decoration-stone-400 transition-colors">
      Go home
    </a>
  </main>
</PageLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/404.astro
git commit -m "refactor: restyle 404 page for stone minimal theme"
```

---

## Phase 4: Cleanup & Configuration

### Task 16: Remove Old Pages

Only `src/pages/contact.astro` exists as a tracked file. The other pages (skills, experience, widgets, references, tags, projects) have already been removed from the repo in prior work.

**Files:**
- Delete: `src/pages/contact.astro`

- [ ] **Step 1: Remove contact page via git**

```bash
git rm src/pages/contact.astro
```

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: remove contact page"
```

---

### Task 17: Add Blog Redirect and Remove Old Blog Listing

**Files:**
- Modify: `src/pages/blog.astro` — replace with a redirect

- [ ] **Step 1: Replace `src/pages/blog.astro` with a redirect**

Replace the entire file:

```astro
---
return Astro.redirect('/', 301);
---
```

This handles any old links or bookmarks pointing to `/blog`.

- [ ] **Step 2: Commit**

```bash
git add src/pages/blog.astro
git commit -m "refactor: redirect /blog to homepage (essays now on /)"
```

---

### Task 18: Remove Unused Components

Files that exist and should be removed: `LabHero.astro`, `LabCell.astro`, `LabItem.astro`, `SocialFollow.astro`. (`ReferenceCard.astro` doesn't exist — already removed.)

**Files:**
- Delete: `src/components/common/LabHero.astro`
- Delete: `src/components/common/LabCell.astro`
- Delete: `src/components/common/LabItem.astro`
- Delete: `src/components/ui/SocialFollow.astro`

- [ ] **Step 1: Remove unused components via git**

```bash
git rm src/components/common/LabHero.astro
git rm src/components/common/LabCell.astro
git rm src/components/common/LabItem.astro
git rm src/components/ui/SocialFollow.astro
```

- [ ] **Step 2: Verify build still compiles**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds. If any remaining page imports a deleted component, the build will fail — fix the import.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove unused lab and portfolio components"
```

---

### Task 19: Restyle Essay Post Page

**Files:**
- Modify: `src/pages/posts/[slug].astro`

The current file uses dark theme classes (`text-marker`, `text-stamp`, `border-ink-border-soft`), a `NextEntry` component, and an admin footer with old styling. Restyle for the new stone aesthetic.

- [ ] **Step 1: Update `src/pages/posts/[slug].astro`**

Key changes:
1. Keep all the markdown rendering logic (Marked + markedHighlight + hljs + preprocessMarkdownContent + addHeadingIds + wrapCodeBlocks) — this stays exactly as-is
2. Remove the `NextEntry` import and component usage
3. Replace the divider (`text-marker tracking-[0.3em]`) with stone-styled divider: `text-stone-300`
4. Restyle the admin footer: replace `border-ink-border-soft` with `border-stone-200`, `text-stamp` with `text-stone-400`, `text-marker` with `text-stone-500`, `hover:text-marker` with `hover:text-stone-600`
5. Change the delete redirect from `/blog` to `/`
6. Keep the `getStaticPaths`, markdown rendering, admin visibility script — all unchanged

- [ ] **Step 2: Verify in browser**

Open http://localhost:4322/posts/<any-existing-slug> and verify the essay renders with stone styling.

- [ ] **Step 3: Commit**

```bash
git add src/pages/posts/[slug].astro
git commit -m "refactor: restyle essay post page for stone theme"
```

---

### Task 20: Update RSS Feed

**Files:**
- Modify: `src/pages/rss.xml.js`

- [ ] **Step 1: Update RSS title and description**

In `src/pages/rss.xml.js`, change:
- `title: 'Sampera Labs | Writing'` → `title: 'Bernat Sampera'`
- `description: 'Working notes on AI integration by Bernat Sampera.'` → `description: 'Essays on building with AI and software.'`

Keep everything else (project slug filtering, sort order, items mapping).

- [ ] **Step 2: Commit**

```bash
git add src/pages/rss.xml.js
git commit -m "refactor: update RSS feed title and description"
```

---

### Task 21: Update Site Configuration

**Files:**
- Modify: `src/config.yaml`

- [ ] **Step 1: Update `src/config.yaml`**

Change these values:

```yaml
metadata:
  title:
    default: Bernat Sampera
    template: '%s — Bernat Sampera'
  description: 'Builder and writer at the intersection of AI and software.'
```

Remove the `ui.theme` line entirely (light only, no toggle).

- [ ] **Step 2: Commit**

```bash
git add src/config.yaml
git commit -m "refactor: update site metadata for new positioning"
```

---

### Task 22: Update Sitemap Integration

**Files:**
- Modify: `src/integrations/sitemap.ts`

- [ ] **Step 1: Update sitemap to include new routes**

Open `src/integrations/sitemap.ts` and:
- Add `/notes` and `/things-i-like` to the static pages list
- Add note URLs by querying `getNoteDB().getAllNotes()` and generating `/notes/:slug` entries
- Remove any references to deleted pages (skills, experience, contact, widgets, references)

- [ ] **Step 2: Verify build compiles**

Run: `npm run build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/integrations/sitemap.ts
git commit -m "refactor: update sitemap with new routes, remove old ones"
```

---

### Task 23: Update llms.txt Files

**Files:**
- Modify: `llms.txt` (root)
- Modify: `src/docs/llms.txt`

- [ ] **Step 1: Update `src/docs/llms.txt`**

Update the frontend documentation to reflect:
- New pages: notes/index.astro, notes/[slug].astro, things-i-like.astro
- Removed pages: skills, experience, contact, widgets, references, project pages
- Blog listing now redirects
- New API endpoints: notes, likes
- New lib files: noteStore.ts, likeStore.ts
- Updated components: Header (with menu overlay), Footer (minimal)
- Removed components: LabHero, LabCell, LabItem, SocialFollow, ReferenceCard

- [ ] **Step 2: Commit**

```bash
git add llms.txt src/docs/llms.txt
git commit -m "docs: update llms.txt files for redesigned site structure"
```

---

### Task 24: Final Verification

- [ ] **Step 1: Run full build**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Start dev server and verify all pages**

Run: `npm run dev`

Check each route in browser:
- `http://localhost:4322/` — Homepage with hero + essays
- `http://localhost:4322/about` — About page
- `http://localhost:4322/notes` — Notes page (empty state)
- `http://localhost:4322/things-i-like` — Things I Like page (empty state)
- `http://localhost:4322/blog` — Should 301 redirect to `/`
- `http://localhost:4322/posts/<existing-slug>` — Essay page renders correctly
- `http://localhost:4322/anything-random` — 404 page
- Menu overlay: click "Open menu" on any page, verify overlay appears with navigation links

- [ ] **Step 3: Test API endpoints**

Test notes API:
```bash
curl -X POST http://localhost:4322/api/notes \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","slug":"test-note","content":"Hello world","category":"Testing"}'

curl http://localhost:4322/api/notes \
  -H "Authorization: Bearer $BLOG_API_KEY"

curl http://localhost:4322/api/notes/slug/test-note \
  -H "Authorization: Bearer $BLOG_API_KEY"
```

Test likes API:
```bash
curl -X POST http://localhost:4322/api/likes \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Book","author":"Test Author","url":"https://example.com","type":"book","category":"Testing"}'

curl http://localhost:4322/api/likes \
  -H "Authorization: Bearer $BLOG_API_KEY"
```

- [ ] **Step 4: Verify notes and likes pages show API-created content**

After creating test data via API, reload:
- `http://localhost:4322/notes` — should show "Testing" category with "Test Note"
- `http://localhost:4322/notes/test-note` — should show the note content
- `http://localhost:4322/things-i-like` — should show "Testing" category with "Test Book"
