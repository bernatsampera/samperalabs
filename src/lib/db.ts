import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

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
  created_at?: string;
  updated_at?: string;
}

export interface EnhancedPost extends Post {
  wordCount: number;
  readingTime: number;
  excerpt: string;
  contentType: 'note' | 'guide' | 'tutorial' | 'post';
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
  created_at: string;
  updated_at: string;
}

class PostDatabase {
  private db: Database.Database;
  private baseQuery = 'SELECT * FROM posts';
  private insertColumns = 'title, author, description, image_url, image_alt, pub_date, tags, content, slug';
  private insertPlaceholders = '?, ?, ?, ?, ?, ?, ?, ?, ?';

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
  }

  private rowToPost(row: PostRow): EnhancedPost {
    const post: Post = {
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      description: row.description || undefined,
      image_url: row.image_url || undefined,
      image_alt: row.image_alt || undefined,
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
    let contentType: 'note' | 'guide' | 'tutorial' | 'post' = 'post';
    if (readingTime <= 2) {
      contentType = 'note'; // Short reads (1-2 min)
    } else if (readingTime <= 5) {
      contentType = 'post'; // Medium reads (3-5 min)
    } else if (readingTime <= 10) {
      contentType = 'tutorial'; // Longer reads (6-10 min)
    } else {
      contentType = 'guide'; // Very long reads (11+ min)
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
    const rows = this.executeQuery(`${this.baseQuery} ORDER BY pub_date DESC`);
    return rows.map((row) => this.rowToPost(row));
  }

  getPostById(id: number): EnhancedPost | null {
    const row = this.executeSingle(`${this.baseQuery} WHERE id = ?`, id);
    return row ? this.rowToPost(row) : null;
  }

  getPostBySlug(slug: string): EnhancedPost | null {
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

  deletePost(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM posts WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  getPostsByTag(tag: string): EnhancedPost[] {
    const rows = this.executeQuery(`${this.baseQuery} WHERE tags LIKE ? ORDER BY pub_date DESC`, `%"${tag}"%`);
    return rows.map((row) => this.rowToPost(row));
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
