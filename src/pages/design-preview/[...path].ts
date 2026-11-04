import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';

// Local only: serves design-preview/ files over the dev server, so a preview page can link to them
// (for example the MAAT story from the Ask Jev preview). Not available in production.
export const prerender = false;

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
};

export const GET: APIRoute = async ({ params }) => {
  if (import.meta.env.PROD) return new Response(null, { status: 404 });
  const base = join(process.cwd(), 'design-preview');
  const file = normalize(join(base, params.path || 'index.html'));
  if (!file.startsWith(base + sep)) return new Response(null, { status: 404 });
  try {
    return new Response(await readFile(file), { headers: { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' } });
  } catch {
    return new Response(null, { status: 404 });
  }
};
