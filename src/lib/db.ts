import type Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { createRequire } from 'module';

export type PostStatus = 'draft' | 'published';

export interface Post {
  id?: number;
  title: string;
  author: string;
  description?: string;
  image_url?: string;
  image_alt?: string;
  pub_date: string;
  tags: string[]; // Will be stored as JSON in DB
  content: string;
  slug: string;
  status?: PostStatus;
  published_at?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EnhancedPost extends Post {
  wordCount: number;
  readingTime: number;
  excerpt: string;
  contentType: 'quick post' | 'post' | 'article';
}

export interface PostRow {
  id: number;
  title: string;
  author: string;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  pub_date: string;
  tags: string; // JSON string in DB
  content: string;
  slug: string;
  status: string;
  published_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminListOpts {
  status?: PostStatus;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface AdminListResult {
  posts: EnhancedPost[];
  total: number;
}

export interface PostStore {
  getAllPosts(): Promise<EnhancedPost[]>;
  getAllPostsAdmin(opts?: AdminListOpts): Promise<AdminListResult>;
  getPostById(id: number): Promise<EnhancedPost | null>;
  getPostBySlug(slug: string): Promise<EnhancedPost | null>;
  getPostBySlugAdmin(slug: string): Promise<EnhancedPost | null>;
  insertPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<number>;
  updatePost(id: number, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean>;
  deletePost(id: number): Promise<boolean>;
  softDeletePost(id: number): Promise<boolean>;
  restorePost(id: number): Promise<boolean>;
  close(): void;
}

function enhancePostWithMetadata(post: Post): EnhancedPost {
  const readingTime = Math.max(Math.floor(post.content.length / 1000), 1);

  const cleanText = post.content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = cleanText.split(' ').filter((word) => word.length > 0).length;

  const excerpt =
    post.description ||
    (cleanText.length <= 150 ? cleanText : cleanText.substring(0, 150).split(' ').slice(0, -1).join(' ') + '...');

  let contentType: 'quick post' | 'post' | 'article' = 'post';
  if (readingTime <= 2) {
    contentType = 'quick post';
  } else if (readingTime <= 10) {
    contentType = 'post';
  } else {
    contentType = 'article';
  }

  return {
    ...post,
    wordCount,
    readingTime,
    excerpt,
    contentType,
  };
}

class SqliteStore implements PostStore {
  private db: Database.Database;
  private baseQuery = 'SELECT * FROM posts';
  private publicWhere = "status = 'published' AND deleted_at IS NULL";
  private insertColumns = 'title, author, description, image_url, image_alt, pub_date, tags, content, slug, status, published_at';
  private insertPlaceholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';

  constructor() {
    const dbPath =
      import.meta.env.NODE_ENV === 'production'
        ? '/app/data/content.db'
        : join(process.cwd(), 'scripts', 'manage-sqlite', 'content.db');

    if (import.meta.env.NODE_ENV !== 'production') {
      const dbDir = dirname(dbPath);
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
      }
    }

    // Lazy-require better-sqlite3 so the native binding is never loaded in remote mode.
    const require = createRequire(import.meta.url);
    const BetterSqlite3 = require('better-sqlite3') as typeof import('better-sqlite3');
    this.db = new BetterSqlite3(dbPath);
    this.initSchema();
  }

  private initSchema() {
    const schemaPath = join(process.cwd(), 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);
    this.migratePostsAddStatusColumns();
  }

  private migratePostsAddStatusColumns() {
    const cols = this.db.prepare("PRAGMA table_info('posts')").all() as Array<{ name: string }>;
    const has = (name: string) => cols.some((c) => c.name === name);

    if (!has('status')) {
      this.db.exec("ALTER TABLE posts ADD COLUMN status TEXT NOT NULL DEFAULT 'published'");
    }
    if (!has('published_at')) {
      this.db.exec('ALTER TABLE posts ADD COLUMN published_at TEXT');
      this.db.exec('UPDATE posts SET published_at = pub_date WHERE published_at IS NULL');
    }
    if (!has('deleted_at')) {
      this.db.exec('ALTER TABLE posts ADD COLUMN deleted_at TEXT');
    }

    this.db.exec('CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at)');
  }

  private rowToPost(row: PostRow): EnhancedPost {
    const post: Post = {
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      description: row.description || undefined,
      image_url: row.image_url || undefined,
      image_alt: row.image_alt || undefined,
      status: (row.status as PostStatus) || 'published',
      published_at: row.published_at,
      deleted_at: row.deleted_at,
    };
    return enhancePostWithMetadata(post);
  }

  private postToRowValues(post: Post | Partial<Post>) {
    return [
      post.title,
      post.author,
      post.description || null,
      post.image_url || null,
      post.image_alt || null,
      post.pub_date,
      JSON.stringify(post.tags || []),
      post.content,
      post.slug,
      post.status || 'draft',
      post.published_at ?? null,
    ];
  }

  private executeQuery(query: string, ...params: unknown[]): PostRow[] {
    const stmt = this.db.prepare(query);
    return stmt.all(...params) as PostRow[];
  }

  private executeSingle(query: string, ...params: unknown[]): PostRow | undefined {
    const stmt = this.db.prepare(query);
    return stmt.get(...params) as PostRow | undefined;
  }

  async getAllPosts(): Promise<EnhancedPost[]> {
    const rows = this.executeQuery(`${this.baseQuery} WHERE ${this.publicWhere} ORDER BY pub_date DESC`);
    return rows.map((row) => this.rowToPost(row));
  }

  async getAllPostsAdmin(opts: AdminListOpts = {}): Promise<AdminListResult> {
    const where: string[] = [];
    const params: unknown[] = [];
    if (opts.status) {
      where.push('status = ?');
      params.push(opts.status);
    }
    if (!opts.includeDeleted) {
      where.push('deleted_at IS NULL');
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const totalRow = this.db
      .prepare(`SELECT COUNT(*) as c FROM posts ${whereSql}`)
      .get(...params) as { c: number };

    const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);
    const offset = Math.max(opts.offset ?? 0, 0);

    const rows = this.executeQuery(
      `${this.baseQuery} ${whereSql} ORDER BY COALESCE(published_at, pub_date) DESC, id DESC LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset
    );

    return { posts: rows.map((row) => this.rowToPost(row)), total: totalRow.c };
  }

  async getPostById(id: number): Promise<EnhancedPost | null> {
    const row = this.executeSingle(`${this.baseQuery} WHERE id = ?`, id);
    return row ? this.rowToPost(row) : null;
  }

  async getPostBySlug(slug: string): Promise<EnhancedPost | null> {
    const row = this.executeSingle(`${this.baseQuery} WHERE slug = ? AND ${this.publicWhere}`, slug);
    return row ? this.rowToPost(row) : null;
  }

  async getPostBySlugAdmin(slug: string): Promise<EnhancedPost | null> {
    const row = this.executeSingle(`${this.baseQuery} WHERE slug = ?`, slug);
    return row ? this.rowToPost(row) : null;
  }

  async insertPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const stmt = this.db.prepare(`INSERT INTO posts (${this.insertColumns}) VALUES (${this.insertPlaceholders})`);
    const result = stmt.run(...this.postToRowValues(post));
    return result.lastInsertRowid as number;
  }

  async updatePost(id: number, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const updates = Object.entries(post)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => {
        const dbValue = key === 'tags' ? JSON.stringify(value) : value;
        return { key, value: dbValue };
      });

    if (updates.length === 0) return false;

    const setClause = updates.map(({ key }) => `${key} = ?`).join(', ');
    const values = [...updates.map(({ value }) => value), id];

    const stmt = this.db.prepare(`UPDATE posts SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values).changes > 0;
  }

  async deletePost(id: number): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM posts WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  async softDeletePost(id: number): Promise<boolean> {
    const stmt = this.db.prepare(
      'UPDATE posts SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL'
    );
    return stmt.run(id).changes > 0;
  }

  async restorePost(id: number): Promise<boolean> {
    const stmt = this.db.prepare(
      'UPDATE posts SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NOT NULL'
    );
    return stmt.run(id).changes > 0;
  }

  close() {
    this.db.close();
  }
}

class RemoteStore implements PostStore {
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
      throw new Error(`Remote DB ${init?.method ?? 'GET'} ${path} failed: ${res.status} ${text}`);
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
      throw new Error(`Remote DB ${init?.method ?? 'GET'} ${path} failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  // The remote /api/posts endpoint paginates with limit<=100. Walk pages until exhausted.
  private async listAllPages(query: string): Promise<EnhancedPost[]> {
    const pageSize = 100;
    const all: EnhancedPost[] = [];
    let offset = 0;
    while (true) {
      const sep = query.includes('?') ? '&' : '?';
      const data = await this.fetchJson<AdminListResult>(
        `/api/posts${query}${sep}limit=${pageSize}&offset=${offset}`
      );
      all.push(...data.posts);
      offset += data.posts.length;
      if (data.posts.length < pageSize || offset >= data.total) break;
    }
    return all;
  }

  async getAllPosts(): Promise<EnhancedPost[]> {
    const posts = await this.listAllPages('?status=published');
    return posts
      .filter((p) => !p.deleted_at)
      .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());
  }

  async getAllPostsAdmin(opts: AdminListOpts = {}): Promise<AdminListResult> {
    const params = new URLSearchParams();
    if (opts.status) params.set('status', opts.status);
    if (opts.includeDeleted) params.set('include_deleted', 'true');
    params.set('limit', String(Math.min(Math.max(opts.limit ?? 20, 1), 100)));
    params.set('offset', String(Math.max(opts.offset ?? 0, 0)));
    return this.fetchJson<AdminListResult>(`/api/posts?${params.toString()}`);
  }

  async getPostById(id: number): Promise<EnhancedPost | null> {
    return this.fetchOptional<EnhancedPost>(`/api/posts/${id}`);
  }

  async getPostBySlug(slug: string): Promise<EnhancedPost | null> {
    const post = await this.fetchOptional<EnhancedPost>(`/api/posts/slug/${encodeURIComponent(slug)}`);
    if (!post) return null;
    // Mirror SqliteStore public filter: published + not soft-deleted only.
    if (post.status !== 'published' || post.deleted_at) return null;
    return post;
  }

  async getPostBySlugAdmin(slug: string): Promise<EnhancedPost | null> {
    return this.fetchOptional<EnhancedPost>(`/api/posts/slug/${encodeURIComponent(slug)}`);
  }

  async insertPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const created = await this.fetchJson<EnhancedPost>(`/api/posts`, {
      method: 'POST',
      body: JSON.stringify(post),
    });
    if (typeof created.id !== 'number') {
      throw new Error('Remote insertPost: response missing id');
    }
    return created.id;
  }

  async updatePost(id: number, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const updated = await this.fetchOptional<EnhancedPost>(`/api/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(post),
    });
    return updated !== null;
  }

  async deletePost(_id: number): Promise<boolean> {
    throw new Error('Hard delete is not exposed via the remote API; use softDeletePost.');
  }

  async softDeletePost(id: number): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/posts/${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (res.status === 404) return false;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Remote DB DELETE /api/posts/${id} failed: ${res.status} ${text}`);
    }
    return true;
  }

  async restorePost(id: number): Promise<boolean> {
    const res = await this.fetchOptional<EnhancedPost>(`/api/posts/${id}/restore`, { method: 'POST' });
    return res !== null;
  }

  close() {
    // no-op
  }
}

let dbInstance: PostStore | null = null;

function isRemoteMode(): boolean {
  return import.meta.env.BLOG_DB_MODE === 'remote';
}

export function getDB(): PostStore {
  if (dbInstance) return dbInstance;

  if (isRemoteMode()) {
    const url = import.meta.env.BLOG_REMOTE_URL as string | undefined;
    const key = import.meta.env.BLOG_API_KEY as string | undefined;
    if (!url) throw new Error('BLOG_DB_MODE=remote but BLOG_REMOTE_URL is not set');
    if (!key) throw new Error('BLOG_DB_MODE=remote but BLOG_API_KEY is not set');
    console.log(`[db] using remote store at ${url}`);
    dbInstance = new RemoteStore(url, key);
  } else {
    dbInstance = new SqliteStore();
  }
  return dbInstance;
}

export function closeDB() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
