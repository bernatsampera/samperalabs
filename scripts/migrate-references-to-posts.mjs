import Database from 'better-sqlite3';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export function migrateReferencesToPosts(db) {
  const refs = db.prepare(`SELECT * FROM refs`).all();
  const insert = db.prepare(`
    INSERT INTO posts (title, author, description, pub_date, tags, content, slug, status, published_at, created_at)
    VALUES (@title, @author, @description, @pub_date, @tags, @content, @slug, 'published', @published_at, @created_at)
  `);
  const slugExists = db.prepare(`SELECT 1 FROM posts WHERE slug = ?`);
  // Idempotency guard: if a post with the same title AND content already exists,
  // we treat the ref as already migrated.
  const sameContentExists = db.prepare(`SELECT 1 FROM posts WHERE title = ? AND content = ?`);

  let migrated = 0;
  const tx = db.transaction(() => {
    for (const r of refs) {
      if (sameContentExists.get(r.title, r.content)) continue;
      let slug = r.slug;
      if (slugExists.get(slug)) slug = `${slug}-ref`;
      if (slugExists.get(slug)) continue;
      insert.run({
        title: r.title,
        author: 'Bernat Sampera',
        description: r.description ?? null,
        pub_date: r.created_at,
        tags: r.tags ?? null,
        content: r.content,
        slug,
        published_at: r.created_at,
        created_at: r.created_at,
      });
      migrated += 1;
    }
  });
  tx();
  return {migrated, total: refs.length};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Path matches src/lib/db.ts's getDB() resolution. Verify before running.
  const dbPath = path.resolve(__dirname, 'manage-sqlite', 'content.db');
  const db = new Database(dbPath);
  const r = migrateReferencesToPosts(db);
  console.log(`Migrated ${r.migrated} of ${r.total} references into posts.`);
  db.close();
}
