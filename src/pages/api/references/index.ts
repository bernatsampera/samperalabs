import type { APIRoute } from 'astro';
import { getDB, type Reference } from '../../../lib/db';

export const prerender = false;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/references - Get all references
export const GET: APIRoute = async ({ url }) => {
  try {
    const db = getDB();
    const searchParams = new URL(url).searchParams;
    const tag = searchParams.get('tag');
    const format = searchParams.get('format');

    let refs: Reference[];

    if (tag) {
      refs = db.getReferencesByTag(tag);
    } else if (format) {
      refs = db.getReferencesByFormat(format);
    } else {
      refs = db.getAllReferences();
    }

    return new Response(JSON.stringify(refs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching references:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch references' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/references - Create a new reference
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, description, format, tags, content } = body;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const slug = slugify(title);
    const db = getDB();

    const existing = db.getReferenceBySlug(slug);
    if (existing) {
      return new Response(
        JSON.stringify({ error: 'A reference with this title already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newRef: Omit<Reference, 'id' | 'created_at' | 'updated_at'> = {
      title,
      description: description || undefined,
      format: format || 'markdown',
      tags: Array.isArray(tags) ? tags : [],
      content,
      slug,
    };

    const refId = db.insertReference(newRef);
    const created = db.getReferenceById(refId);

    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating reference:', error);
    return new Response(JSON.stringify({ error: 'Failed to create reference' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
