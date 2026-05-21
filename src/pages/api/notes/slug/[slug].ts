import type { APIRoute } from 'astro';
import { getNoteDB } from '../../../../lib/db';
import { errorResponse, requireAuth } from '../../../../lib/apiAuth';

export const prerender = false;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET /api/notes/slug/[slug] — fetch note by slug
export const GET: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const { slug } = params;
  if (!slug) {
    return errorResponse(400, 'invalid slug', 'validation_error', { field: 'slug' });
  }

  try {
    const note = await getNoteDB().getNoteBySlug(slug);
    if (!note) return errorResponse(404, 'note not found', 'not_found');
    return jsonResponse(note);
  } catch (error) {
    console.error('Error fetching note by slug:', error);
    return errorResponse(500, 'failed to fetch note', 'server_error');
  }
};
