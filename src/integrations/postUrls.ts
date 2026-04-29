import {getDB} from '../lib/db';

const SITE = 'https://samperalabs.com';

// Top-level await is fine in ESM. In remote DB mode this hits prod once at startup.
export const postUrls: string[] = await (async () => {
  try {
    const db = getDB();
    const posts = await db.getAllPosts();
    return posts.map((p) => `${SITE}/posts/${p.slug}`);
  } catch (err) {
    console.warn('[sitemap] could not read posts from DB; sitemap will skip post URLs', err);
    return [];
  }
})();
