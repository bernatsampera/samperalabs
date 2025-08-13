import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

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

  constructor() {
    // Create db directory if it doesn't exist
    const dbPath = join(process.cwd(), 'db', 'content.db');
    this.db = new Database(dbPath);

    // Initialize schema
    this.initSchema();
  }

  private initSchema() {
    const schemaPath = join(process.cwd(), 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);
  }

  // Convert database row to Post interface
  private rowToPost(row: PostRow): Post {
    return {
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      description: row.description || undefined,
      image_url: row.image_url || undefined,
      image_alt: row.image_alt || undefined,
    };
  }

  // Convert Post to database row format
  private postToRow(post: Post): Omit<PostRow, 'id' | 'created_at' | 'updated_at'> {
    return {
      title: post.title,
      author: post.author,
      description: post.description || null,
      image_url: post.image_url || null,
      image_alt: post.image_alt || null,
      pub_date: post.pub_date,
      tags: JSON.stringify(post.tags),
      content: post.content,
      slug: post.slug,
    };
  }

  // Get all posts
  getAllPosts(): Post[] {
    const stmt = this.db.prepare(`
      SELECT * FROM posts 
      ORDER BY pub_date DESC
    `);
    const rows = stmt.all() as PostRow[];
    return rows.map((row) => this.rowToPost(row));
  }

  // Get post by ID
  getPostById(id: number): Post | null {
    const stmt = this.db.prepare('SELECT * FROM posts WHERE id = ?');
    const row = stmt.get(id) as PostRow | undefined;
    return row ? this.rowToPost(row) : null;
  }

  // Get post by slug
  getPostBySlug(slug: string): Post | null {
    const stmt = this.db.prepare('SELECT * FROM posts WHERE slug = ?');
    const row = stmt.get(slug) as PostRow | undefined;
    return row ? this.rowToPost(row) : null;
  }

  // Insert new post
  insertPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO posts (title, author, description, image_url, image_alt, pub_date, tags, content, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const row = this.postToRow(post);
    const result = stmt.run(
      row.title,
      row.author,
      row.description,
      row.image_url,
      row.image_alt,
      row.pub_date,
      row.tags,
      row.content,
      row.slug
    );

    return result.lastInsertRowid as number;
  }

  // Update post
  updatePost(id: number, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>): boolean {
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(post).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'tags') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
    });

    if (updates.length === 0) return false;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE posts 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...values);
    return result.changes > 0;
  }

  // Delete post
  deletePost(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM posts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Search posts by tag
  getPostsByTag(tag: string): Post[] {
    const stmt = this.db.prepare(`
      SELECT * FROM posts 
      WHERE tags LIKE ?
      ORDER BY pub_date DESC
    `);
    const rows = stmt.all(`%"${tag}"%`) as PostRow[];
    return rows.map((row) => this.rowToPost(row));
  }

  // Close database connection
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
