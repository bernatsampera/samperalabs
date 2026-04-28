import {test, expect} from 'vitest';
import Database from 'better-sqlite3';
import {migrateReferencesToPosts} from '../scripts/migrate-references-to-posts.mjs';

function freshDb() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, author TEXT NOT NULL, description TEXT,
      image_url TEXT, image_alt TEXT, pub_date TEXT NOT NULL,
      tags TEXT, content TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'published', published_at TEXT, deleted_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE refs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, description TEXT, format TEXT NOT NULL DEFAULT 'markdown',
      tags TEXT, content TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT '2025-01-15T00:00:00Z',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}

test('migrates every refs row into posts with correct mapping', () => {
  const db = freshDb();
  db.prepare(`INSERT INTO refs (title, description, format, tags, content, slug, created_at) VALUES (?,?,?,?,?,?,?)`)
    .run('A Ref', 'desc', 'markdown', '["x"]', '# hi', 'a-ref', '2025-01-15T00:00:00Z');

  const result = migrateReferencesToPosts(db);

  expect(result.migrated).toBe(1);
  const row = db.prepare(`SELECT * FROM posts WHERE slug = 'a-ref'`).get();
  expect(row).toBeTruthy();
  expect(row.title).toBe('A Ref');
  expect(row.description).toBe('desc');
  expect(row.content).toBe('# hi');
  expect(row.author).toBe('Bernat Sampera');
  expect(row.status).toBe('published');
  expect(row.tags).toBe('["x"]');
  expect(row.pub_date).toBe('2025-01-15T00:00:00Z');
  expect(row.published_at).toBe('2025-01-15T00:00:00Z');
});

test('appends -ref to slug on collision', () => {
  const db = freshDb();
  db.prepare(`INSERT INTO posts (title, author, pub_date, content, slug) VALUES ('Existing','x','2024-01-01','c','dup')`).run();
  db.prepare(`INSERT INTO refs (title, content, slug) VALUES ('Dup','# r','dup')`).run();

  migrateReferencesToPosts(db);

  expect(db.prepare(`SELECT slug FROM posts WHERE title='Dup'`).get().slug).toBe('dup-ref');
});

test('is idempotent — second run migrates zero (skips by title+content match)', () => {
  const db = freshDb();
  db.prepare(`INSERT INTO refs (title, content, slug) VALUES ('A','c','a')`).run();
  expect(migrateReferencesToPosts(db).migrated).toBe(1);
  expect(migrateReferencesToPosts(db).migrated).toBe(0);
});
