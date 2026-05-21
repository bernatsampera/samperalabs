import type { APIRoute } from 'astro';
import { getNoteDB, type Note } from '../../../lib/db';
import { errorResponse, requireAuth } from '../../../lib/apiAuth';

export const prerender = false;

const ALLOWED_PATCH_FIELDS = [
  'title',
  'slug',
  'content',
  'category',
  'sort_order',
] as const;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseId(raw: string | undefined): number | null {
  if (!raw || isNaN(Number(raw))) return null;
  return Number(raw);
}

// GET /api/notes/[id] — fetch note by ID
export const GET: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) return errorResponse(400, 'invalid note id', 'validation_error', { field: 'id' });

  try {
    const note = await getNoteDB().getNoteById(id);
    if (!note) return errorResponse(404, 'note not found', 'not_found');
    return jsonResponse(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return errorResponse(500, 'failed to fetch note', 'server_error');
  }
};

// PATCH /api/notes/[id] — partial update
export const PATCH: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) return errorResponse(400, 'invalid note id', 'validation_error', { field: 'id' });

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return errorResponse(400, 'request body must be a JSON object', 'validation_error');
    }

    const db = getNoteDB();
    const existing = await db.getNoteById(id);
    if (!existing) return errorResponse(404, 'note not found', 'not_found');

    // Whitelist fields the API allows updating
    const update: Partial<Note> = {};
    for (const key of ALLOWED_PATCH_FIELDS) {
      if (key in body && body[key] !== undefined) {
        (update as Record<string, unknown>)[key] = body[key];
      }
    }

    // Slug uniqueness check if changing slug
    if (typeof update.slug === 'string' && update.slug !== existing.slug) {
      if (!update.slug) {
        return errorResponse(400, 'slug cannot be empty', 'validation_error', { field: 'slug' });
      }
      const collision = await db.getNoteBySlug(update.slug);
      if (collision && collision.id !== id) {
        return errorResponse(409, 'slug already exists', 'slug_conflict', { field: 'slug' });
      }
    }

    const changed = await db.updateNote(id, update);
    if (!changed) {
      // Nothing to update — return current state
      return jsonResponse(existing);
    }

    return jsonResponse(await db.getNoteById(id));
  } catch (error) {
    console.error('Error updating note:', error);
    return errorResponse(500, 'failed to update note', 'server_error');
  }
};

// DELETE /api/notes/[id] — hard delete
export const DELETE: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) return errorResponse(400, 'invalid note id', 'validation_error', { field: 'id' });

  try {
    const db = getNoteDB();
    const existing = await db.getNoteById(id);
    if (!existing) {
      return errorResponse(404, 'note not found', 'not_found');
    }

    await db.deleteNote(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting note:', error);
    return errorResponse(500, 'failed to delete note', 'server_error');
  }
};
