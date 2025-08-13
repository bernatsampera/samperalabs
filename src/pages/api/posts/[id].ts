import type { APIRoute } from 'astro';
import { getDB, type Post } from '../../../lib/db';

export const prerender = false;

// GET /api/posts/[id] - Get a single post by ID
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: 'Invalid post ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const db = getDB();
    const post = db.getPostById(Number(id));

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
    console.error('Error fetching post:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch post' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// PUT /api/posts/[id] - Update a post
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: 'Invalid post ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const body = await request.json();
    const db = getDB();

    // Check if post exists
    const existingPost = db.getPostById(Number(id));
    if (!existingPost) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Update the post
    const updated = db.updatePost(Number(id), body);

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Failed to update post' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Return updated post
    const updatedPost = db.getPostById(Number(id));

    return new Response(JSON.stringify(updatedPost), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return new Response(JSON.stringify({ error: 'Failed to update post' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// DELETE /api/posts/[id] - Delete a post
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: 'Invalid post ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const db = getDB();

    // Check if post exists
    const existingPost = db.getPostById(Number(id));
    if (!existingPost) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Delete the post
    const deleted = db.deletePost(Number(id));

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Failed to delete post' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Post deleted successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete post' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
