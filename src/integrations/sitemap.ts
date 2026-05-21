import AstroSitemap from '@astrojs/sitemap';
import type { AstroIntegration } from 'astro';
import { postUrls } from './postUrls';
import { getNoteDB } from '../lib/db';

const SITE = 'https://samperalabs.com';

const staticPages = [
  `${SITE}/`,
  `${SITE}/about`,
  `${SITE}/notes`,
  `${SITE}/things-i-like`,
];

const noteUrls: string[] = await (async () => {
  try {
    const noteDB = getNoteDB();
    const notes = await noteDB.getAllNotes();
    return notes.map((n) => `${SITE}/notes/${n.slug}`);
  } catch (err) {
    console.warn('[sitemap] could not read notes from DB; sitemap will skip note URLs', err);
    return [];
  }
})();

export function sitemap(): AstroIntegration {
  return AstroSitemap({
    customPages: [...staticPages, ...postUrls, ...noteUrls],
    filter: (page) =>
      page !== `${SITE}/admin` &&
      page !== `${SITE}/admin/new-post` &&
      page !== `${SITE}/admin/edit-post`,
  });
}
