import type { APIRoute } from 'astro';
import { getDB } from '../../../../lib/db';
import { errorResponse, requireAuth } from '../../../../lib/apiAuth';

export const prerender = false;

// POST /api/posts/[id]/restore — undo a soft delete
export const POST: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const raw = params.id;
  if (!raw || isNaN(Number(raw))) {
    return errorResponse(400, 'invalid post id', 'validation_error', { field: 'id' });
  }
  const id = Number(raw);

  try {
    const db = getDB();
    const existing = await db.getPostById(id);
    if (!existing || !existing.deleted_at) {
      return errorResponse(404, 'post not found', 'not_found');
    }

    await db.restorePost(id);
    return new Response(JSON.stringify(await db.getPostById(id)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error restoring post:', error);
    return errorResponse(500, 'failed to restore post', 'server_error');
  }
};
