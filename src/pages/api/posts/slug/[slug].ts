import type { APIRoute } from 'astro';
import { getDB } from '../../../../lib/db';
import { errorResponse, requireAuth } from '../../../../lib/apiAuth';

export const prerender = false;

// GET /api/posts/slug/[slug] — admin/agent lookup by slug (returns drafts and soft-deleted too)
export const GET: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const { slug } = params;
  if (!slug) {
    return errorResponse(400, 'invalid slug', 'validation_error', { field: 'slug' });
  }

  try {
    const post = getDB().getPostBySlugAdmin(slug);
    if (!post) return errorResponse(404, 'post not found', 'not_found');
    return new Response(JSON.stringify(post), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return errorResponse(500, 'failed to fetch post', 'server_error');
  }
};
