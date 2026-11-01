import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Local only: comments from the /ask-review page, saved to a file that Claude reads afterwards.
export const prerender = false;
const FILE = join(process.cwd(), 'design-preview/home-experiences/comments.json');

type Comments = Record<string, { comment: string; updated: string }>;
const read = async (): Promise<Comments> => {
  try {
    return JSON.parse(await readFile(FILE, 'utf8'));
  } catch {
    return {};
  }
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) return new Response(null, { status: 404 });
  return json(await read());
};

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) return new Response(null, { status: 404 });
  let body: { id?: unknown; comment?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'The body must be JSON.' }, 400);
  }
  if (typeof body.id !== 'string' || !/^[a-z0-9-]{1,40}$/.test(body.id) || typeof body.comment !== 'string' || body.comment.length > 5000) {
    return json({ error: 'Send { id, comment }.' }, 400);
  }
  const all = await read();
  if (body.comment.trim()) all[body.id] = { comment: body.comment, updated: new Date().toISOString() };
  else delete all[body.id];
  await writeFile(FILE, JSON.stringify(all, null, 2) + '\n');
  return json({ ok: true, updated: all[body.id]?.updated ?? null });
};
