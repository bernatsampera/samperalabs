import type { APIRoute } from 'astro';
import { getLikeDB, type Like } from '../../../lib/db';
import { errorResponse, requireAuth } from '../../../lib/apiAuth';

export const prerender = false;

const ALLOWED_PATCH_FIELDS = [
  'title',
  'author',
  'url',
  'type',
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

// GET /api/likes/[id] — fetch like by ID
export const GET: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) return errorResponse(400, 'invalid like id', 'validation_error', { field: 'id' });

  try {
    const like = await getLikeDB().getLikeById(id);
    if (!like) return errorResponse(404, 'like not found', 'not_found');
    return jsonResponse(like);
  } catch (error) {
    console.error('Error fetching like:', error);
    return errorResponse(500, 'failed to fetch like', 'server_error');
  }
};

// PATCH /api/likes/[id] — partial update
export const PATCH: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) return errorResponse(400, 'invalid like id', 'validation_error', { field: 'id' });

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return errorResponse(400, 'request body must be a JSON object', 'validation_error');
    }

    const db = getLikeDB();
    const existing = await db.getLikeById(id);
    if (!existing) return errorResponse(404, 'like not found', 'not_found');

    // Whitelist fields the API allows updating
    const update: Partial<Like> = {};
    for (const key of ALLOWED_PATCH_FIELDS) {
      if (key in body && body[key] !== undefined) {
        (update as Record<string, unknown>)[key] = body[key];
      }
    }

    const changed = await db.updateLike(id, update);
    if (!changed) {
      // Nothing to update — return current state
      return jsonResponse(existing);
    }

    return jsonResponse(await db.getLikeById(id));
  } catch (error) {
    console.error('Error updating like:', error);
    return errorResponse(500, 'failed to update like', 'server_error');
  }
};

// DELETE /api/likes/[id] — hard delete
export const DELETE: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) return errorResponse(400, 'invalid like id', 'validation_error', { field: 'id' });

  try {
    const db = getLikeDB();
    const existing = await db.getLikeById(id);
    if (!existing) {
      return errorResponse(404, 'like not found', 'not_found');
    }

    await db.deleteLike(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting like:', error);
    return errorResponse(500, 'failed to delete like', 'server_error');
  }
};
