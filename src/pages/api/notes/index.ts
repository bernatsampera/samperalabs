import type { APIRoute } from 'astro';
import { getNoteDB, type Note } from '../../../lib/db';
import { errorResponse, requireAuth } from '../../../lib/apiAuth';

export const prerender = false;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET /api/notes — list all notes, optional ?category= filter
export const GET: APIRoute = async ({ request, url }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const category = new URL(url).searchParams.get('category');

    const db = getNoteDB();
    let notes = await db.getAllNotes();

    if (category) {
      notes = notes.filter((n) => n.category === category);
    }

    return jsonResponse({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return errorResponse(500, 'failed to fetch notes', 'server_error');
  }
};

// POST /api/notes — create a new note
export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { title, slug, content, category, sort_order } = body ?? {};

    if (!title || !slug) {
      return errorResponse(
        400,
        'missing required fields: title, slug',
        'validation_error',
        { field: !title ? 'title' : 'slug' }
      );
    }

    const db = getNoteDB();

    const existing = await db.getNoteBySlug(slug);
    if (existing) {
      return errorResponse(409, 'slug already exists', 'slug_conflict', { field: 'slug' });
    }

    const noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'> = {
      title,
      slug,
      content: content ?? '',
      category: category ?? '',
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
    };

    const noteId = await db.createNote(noteData);
    const created = await db.getNoteById(noteId);

    return jsonResponse(created, 201);
  } catch (error) {
    console.error('Error creating note:', error);
    return errorResponse(500, 'failed to create note', 'server_error');
  }
};
