import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteName = 'https://samperalabs.com';
const outputDirectory = path.join(__dirname, '../../src/integrations');

const getPostUrls = async () => {
  const dbPath = path.join(__dirname, '../manage-sqlite', 'content.db');
  const db = new Database(dbPath);

  try {
    const posts = db.prepare('SELECT slug FROM posts ORDER BY pub_date DESC').all() as { slug: string }[];
    return posts.map((post) => `${siteName}/posts/${post.slug}`);
  } finally {
    db.close();
  }
};

const getTagUrls = async () => {
  const dbPath = path.join(__dirname, '../manage-sqlite', 'content.db');
  const db = new Database(dbPath);

  try {
    const posts = db.prepare('SELECT tags FROM posts').all() as { tags: string }[];

    // Extract all unique tags from the JSON strings
    const allTags = new Set<string>();
    posts.forEach((post) => {
      try {
        const tags = JSON.parse(post.tags || '[]');
        tags.forEach((tag: string) => allTags.add(tag));
      } catch (e) {
        // Skip invalid JSON
      }
    });

    return Array.from(allTags).map((tag) => `${siteName}/tags/${tag}`);
  } finally {
    db.close();
  }
};

const postUrls = await getPostUrls();
const postsOutputFile = path.join(outputDirectory, 'postUrls.ts');
await fs.writeFile(postsOutputFile, `export const postUrls = [${postUrls.map((url) => `"${url}"`).join(',\n')}]`);

const tagUrls = await getTagUrls();
const tagsOutputFile = path.join(outputDirectory, 'tagUrls.ts');
await fs.writeFile(tagsOutputFile, `export const tagUrls = [${tagUrls.map((url) => `"${url}"`).join(',\n')}]`);

console.log(`Generated ${postUrls.length} post URLs and ${tagUrls.length} tag URLs`);

process.exit(0);
