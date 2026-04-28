import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

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

export interface Reference {
  id?: number;
  title: string;
  description?: string;
  format: 'markdown' | 'plaintext';
  tags: string[];
  content: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReferenceRow {
  id: number;
  title: string;
  description: string | null;
  format: string;
  tags: string;
  content: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

class PostDatabase {
  private db: Database.Database;
  private baseQuery = 'SELECT * FROM posts';
  private publicWhere = "status = 'published' AND deleted_at IS NULL";
  private insertColumns = 'title, author, description, image_url, image_alt, pub_date, tags, content, slug, status, published_at';
  private insertPlaceholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';

  constructor() {
    // Use environment-specific database path
    const dbPath =
      import.meta.env.NODE_ENV === 'production'
        ? '/app/data/content.db'
        : join(process.cwd(), 'scripts', 'manage-sqlite', 'content.db');

    // Ensure the database directory exists locally
    if (import.meta.env.NODE_ENV !== 'production') {
      const dbDir = dirname(dbPath);
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
      }
    }

    this.db = new Database(dbPath);
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
      // Backfill: existing rows are considered published as of their pub_date
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

    // Add computed properties
    return this.enhancePostWithMetadata(post);
  }

  private enhancePostWithMetadata(post: Post): EnhancedPost {
    // Use existing getReadingTime function
    const readingTime = Math.max(Math.floor(post.content.length / 1000), 1);

    // Calculate word count from content
    const cleanText = post.content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove links but keep text
      .replace(/[#*_~`]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    const wordCount = cleanText.split(' ').filter((word) => word.length > 0).length;

    // Generate excerpt from content (use description if available)
    const excerpt =
      post.description ||
      (cleanText.length <= 150 ? cleanText : cleanText.substring(0, 150).split(' ').slice(0, -1).join(' ') + '...');

    // Determine content type based on reading time
    let contentType: 'quick post' | 'post' | 'article' = 'post';
    if (readingTime <= 2) {
      contentType = 'quick post'; // Short reads (2 min or less)
    } else if (readingTime <= 10) {
      contentType = 'post'; // Medium reads (3-10 min)
    } else {
      contentType = 'article'; // Long reads (more than 10 min)
    }

    return {
      ...post,
      wordCount,
      readingTime,
      excerpt,
      contentType,
    };
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

  getAllPosts(): EnhancedPost[] {
    const rows = this.executeQuery(`${this.baseQuery} WHERE ${this.publicWhere} ORDER BY pub_date DESC`);
    return rows.map((row) => this.rowToPost(row));
  }

  // Admin/API: returns drafts, deleted, etc. based on filters. Includes total count for pagination.
  getAllPostsAdmin(opts: {
    status?: PostStatus;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  } = {}): { posts: EnhancedPost[]; total: number } {
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

  // Admin/API: returns post regardless of status or soft-delete state.
  getPostById(id: number): EnhancedPost | null {
    const row = this.executeSingle(`${this.baseQuery} WHERE id = ?`, id);
    return row ? this.rowToPost(row) : null;
  }

  // Public: only returns published, non-deleted posts.
  getPostBySlug(slug: string): EnhancedPost | null {
    const row = this.executeSingle(`${this.baseQuery} WHERE slug = ? AND ${this.publicWhere}`, slug);
    return row ? this.rowToPost(row) : null;
  }

  // Admin/API: returns post by slug regardless of status.
  getPostBySlugAdmin(slug: string): EnhancedPost | null {
    const row = this.executeSingle(`${this.baseQuery} WHERE slug = ?`, slug);
    return row ? this.rowToPost(row) : null;
  }

  insertPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = this.db.prepare(`INSERT INTO posts (${this.insertColumns}) VALUES (${this.insertPlaceholders})`);
    const result = stmt.run(...this.postToRowValues(post));
    return result.lastInsertRowid as number;
  }

  updatePost(id: number, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>): boolean {
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

  // Hard delete — kept for tests/admin scripts; the API uses softDeletePost.
  deletePost(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM posts WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  softDeletePost(id: number): boolean {
    const stmt = this.db.prepare(
      'UPDATE posts SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL'
    );
    return stmt.run(id).changes > 0;
  }

  restorePost(id: number): boolean {
    const stmt = this.db.prepare(
      'UPDATE posts SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NOT NULL'
    );
    return stmt.run(id).changes > 0;
  }

  getPostsByTag(tag: string): EnhancedPost[] {
    const rows = this.executeQuery(
      `${this.baseQuery} WHERE tags LIKE ? AND ${this.publicWhere} ORDER BY pub_date DESC`,
      `%"${tag}"%`
    );
    return rows.map((row) => this.rowToPost(row));
  }

  // ── Reference methods ──

  private rowToReference(row: ReferenceRow): Reference {
    return {
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      description: row.description || undefined,
      format: row.format as 'markdown' | 'plaintext',
    };
  }

  getAllReferences(): Reference[] {
    const stmt = this.db.prepare('SELECT * FROM refs ORDER BY updated_at DESC');
    const rows = stmt.all() as ReferenceRow[];
    return rows.map((row) => this.rowToReference(row));
  }

  getReferenceById(id: number): Reference | null {
    const stmt = this.db.prepare('SELECT * FROM refs WHERE id = ?');
    const row = stmt.get(id) as ReferenceRow | undefined;
    return row ? this.rowToReference(row) : null;
  }

  getReferenceBySlug(slug: string): Reference | null {
    const stmt = this.db.prepare('SELECT * FROM refs WHERE slug = ?');
    const row = stmt.get(slug) as ReferenceRow | undefined;
    return row ? this.rowToReference(row) : null;
  }

  getReferencesByTag(tag: string): Reference[] {
    const stmt = this.db.prepare('SELECT * FROM refs WHERE tags LIKE ? ORDER BY updated_at DESC');
    const rows = stmt.all(`%"${tag}"%`) as ReferenceRow[];
    return rows.map((row) => this.rowToReference(row));
  }

  getReferencesByFormat(format: string): Reference[] {
    const stmt = this.db.prepare('SELECT * FROM refs WHERE format = ? ORDER BY updated_at DESC');
    const rows = stmt.all(format) as ReferenceRow[];
    return rows.map((row) => this.rowToReference(row));
  }

  insertReference(ref: Omit<Reference, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = this.db.prepare(
      'INSERT INTO refs (title, description, format, tags, content, slug) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      ref.title,
      ref.description || null,
      ref.format,
      JSON.stringify(ref.tags || []),
      ref.content,
      ref.slug
    );
    return result.lastInsertRowid as number;
  }

  updateReference(id: number, ref: Partial<Omit<Reference, 'id' | 'created_at' | 'updated_at'>>): boolean {
    const updates = Object.entries(ref)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => {
        const dbValue = key === 'tags' ? JSON.stringify(value) : value;
        return { key, value: dbValue };
      });

    if (updates.length === 0) return false;

    const setClause = updates.map(({ key }) => `${key} = ?`).join(', ');
    const values = [...updates.map(({ value }) => value), id];

    const stmt = this.db.prepare(`UPDATE refs SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values).changes > 0;
  }

  deleteReference(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM refs WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  close() {
    this.db.close();
  }
}

// Singleton instance
let dbInstance: PostDatabase | null = null;

export function getDB(): PostDatabase {
  if (!dbInstance) {
    dbInstance = new PostDatabase();
  }
  return dbInstance;
}

export function closeDB() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
