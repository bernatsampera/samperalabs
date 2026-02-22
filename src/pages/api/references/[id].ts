import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';

export const prerender = false;

// GET /api/references/[id] - Get a single reference by ID
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: 'Invalid reference ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB();
    const ref = db.getReferenceById(Number(id));

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
    console.error('Error fetching reference:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch reference' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PUT /api/references/[id] - Update a reference
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: 'Invalid reference ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const db = getDB();

    const existing = db.getReferenceById(Number(id));
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Reference not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updated = db.updateReference(Number(id), body);

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Failed to update reference' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedRef = db.getReferenceById(Number(id));

    return new Response(JSON.stringify(updatedRef), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating reference:', error);
    return new Response(JSON.stringify({ error: 'Failed to update reference' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/references/[id] - Delete a reference
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: 'Invalid reference ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB();

    const existing = db.getReferenceById(Number(id));
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Reference not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const deleted = db.deleteReference(Number(id));

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Failed to delete reference' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Reference deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting reference:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete reference' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
