import type { APIRoute } from 'astro';
import { getLikeDB, type Like } from '../../../lib/db';
import { errorResponse, requireAuth } from '../../../lib/apiAuth';

export const prerender = false;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET /api/likes — list all likes, optional ?category= filter
export const GET: APIRoute = async ({ request, url }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const category = new URL(url).searchParams.get('category');

    const db = getLikeDB();
    let likes = await db.getAllLikes();

    if (category) {
      likes = likes.filter((l) => l.category === category);
    }

    return jsonResponse({ likes });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return errorResponse(500, 'failed to fetch likes', 'server_error');
  }
};

// POST /api/likes — create a new like
export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { title, author, url, type, category, sort_order } = body ?? {};

    if (!title) {
      return errorResponse(400, 'missing required field: title', 'validation_error', { field: 'title' });
    }

    const likeData: Omit<Like, 'id' | 'created_at'> = {
      title,
      author: author ?? '',
      url: url ?? '',
      type: type ?? '',
      category: category ?? '',
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
    };

    const db = getLikeDB();
    const likeId = await db.createLike(likeData);
    const created = await db.getLikeById(likeId);

    return jsonResponse(created, 201);
  } catch (error) {
    console.error('Error creating like:', error);
    return errorResponse(500, 'failed to create like', 'server_error');
  }
};
