import type { APIRoute } from 'astro';
import { getDB } from '../../../../lib/db';

export const prerender = false;

// GET /api/posts/slug/[slug] - Get a single post by slug
export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Invalid slug' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const db = getDB();
    const post = db.getPostBySlug(slug);

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch post' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
