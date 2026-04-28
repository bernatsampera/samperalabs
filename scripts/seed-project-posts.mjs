import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, 'project-posts');

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`No front-matter in ${file}`);
  const meta = Object.fromEntries(
    m[1].split('\n').map((line) => {
      const i = line.indexOf(':');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
  );
  return {meta, content: m[2]};
}

// Same DB path as scripts/migrate-references-to-posts.mjs.
const dbPath = path.resolve(__dirname, 'manage-sqlite', 'content.db');
const db = new Database(dbPath);

const upsert = db.prepare(`
  INSERT INTO posts (title, author, description, pub_date, content, slug, status, published_at)
  VALUES (@title, 'Bernat Sampera', @description, @pub_date, @content, @slug, 'published', @pub_date)
  ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    pub_date = excluded.pub_date,
    content = excluded.content,
    published_at = excluded.published_at,
    updated_at = CURRENT_TIMESTAMP
`);

let n = 0;
for (const f of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))) {
  const {meta, content} = parse(path.join(POSTS_DIR, f));
  upsert.run({
    title: meta.title,
    description: meta.description ?? null,
    pub_date: meta.pub_date,
    content,
    slug: meta.slug,
  });
  n += 1;
}
console.log(`Seeded ${n} project posts.`);
db.close();
