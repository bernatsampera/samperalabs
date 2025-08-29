import AstroSitemap from '@astrojs/sitemap';
import type { AstroIntegration } from 'astro';
import { postUrls } from './postUrls';
import { tagUrls } from './tagUrls';

export function sitemap(): AstroIntegration {
  return AstroSitemap({
    customPages: [...postUrls, ...tagUrls],
    filter: (page) =>
      page !== 'https://samperalabs.com/admin' &&
      page !== 'https://samperalabs.com/admin/new-post' &&
      page !== 'https://samperalabs.com/admin/edit-post',
  });
}
