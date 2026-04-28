import {getDB} from '../lib/db';

const SITE = 'https://samperalabs.com';

export const postUrls: string[] = (() => {
  try {
    const db = getDB();
    return db.getAllPosts().map((p) => `${SITE}/posts/${p.slug}`);
  } catch (err) {
    console.warn('[sitemap] could not read posts from DB; sitemap will skip post URLs', err);
    return [];
  }
})();
