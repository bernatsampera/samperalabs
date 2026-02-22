import type { APIRoute } from 'astro';
import { getDB } from '../../../../lib/db';

export const prerender = false;

// GET /api/references/slug/[slug] - Get a single reference by slug
export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Invalid slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB();
    const ref = db.getReferenceBySlug(slug);

    if (!ref) {
      return new Response(JSON.stringify({ error: 'Reference not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(ref), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching reference by slug:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch reference' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
