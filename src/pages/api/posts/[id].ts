import type { APIRoute } from 'astro';
import { getDB, type Post } from '../../../lib/db';
import { errorResponse, requireAuth } from '../../../lib/apiAuth';

export const prerender = false;

const ALLOWED_PATCH_FIELDS = [
  'title',
  'author',
  'description',
  'image_url',
  'image_alt',
  'pub_date',
  'tags',
  'content',
  'slug',
  'status',
] as const;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseId(raw: string | undefined): number | null {
  if (!raw || isNaN(Number(raw))) return null;
  return Number(raw);
}

// GET /api/posts/[id] — fetch any post (including drafts and soft-deleted)
export const GET: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) return errorResponse(400, 'invalid post id', 'validation_error', { field: 'id' });

  try {
    const post = getDB().getPostById(id);
    if (!post) return errorResponse(404, 'post not found', 'not_found');
    return jsonResponse(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return errorResponse(500, 'failed to fetch post', 'server_error');
  }
};

// PATCH /api/posts/[id] — partial update
export const PATCH: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) return errorResponse(400, 'invalid post id', 'validation_error', { field: 'id' });

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return errorResponse(400, 'request body must be a JSON object', 'validation_error');
    }

    const db = getDB();
    const existing = db.getPostById(id);
    if (!existing) return errorResponse(404, 'post not found', 'not_found');

    // Whitelist fields the API allows updating
    const update: Partial<Post> = {};
    for (const key of ALLOWED_PATCH_FIELDS) {
      if (key in body && body[key] !== undefined) {
        (update as Record<string, unknown>)[key] = body[key];
      }
    }

    // Slug normalization + collision check
    if (typeof update.slug === 'string') {
      const newSlug = slugify(update.slug);
      if (!newSlug) {
        return errorResponse(400, 'slug cannot be empty', 'validation_error', { field: 'slug' });
      }
      if (newSlug !== existing.slug) {
        const collision = db.getPostBySlugAdmin(newSlug);
        if (collision && collision.id !== id) {
          return errorResponse(409, 'slug already exists', 'slug_conflict', { field: 'slug' });
        }
      }
      update.slug = newSlug;
    }

    // Status validation + first-publish timestamp
    if (update.status !== undefined) {
      if (update.status !== 'draft' && update.status !== 'published') {
        return errorResponse(400, 'status must be "draft" or "published"', 'validation_error', {
          field: 'status',
        });
      }
      const becomingPublished =
        update.status === 'published' && existing.status !== 'published' && !existing.published_at;
      if (becomingPublished) {
        update.published_at = new Date().toISOString();
      }
    }

    if (Array.isArray(update.tags) === false && update.tags !== undefined) {
      return errorResponse(400, 'tags must be an array', 'validation_error', { field: 'tags' });
    }

    const changed = db.updatePost(id, update);
    if (!changed) {
      // Nothing to update — return current state
      return jsonResponse(existing);
    }

    return jsonResponse(db.getPostById(id));
  } catch (error) {
    console.error('Error updating post:', error);
    return errorResponse(500, 'failed to update post', 'server_error');
  }
};

// DELETE /api/posts/[id] — soft delete
export const DELETE: APIRoute = async ({ params, request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) return errorResponse(400, 'invalid post id', 'validation_error', { field: 'id' });

  try {
    const db = getDB();
    const existing = db.getPostById(id);
    if (!existing || existing.deleted_at) {
      return errorResponse(404, 'post not found', 'not_found');
    }

    db.softDeletePost(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return errorResponse(500, 'failed to delete post', 'server_error');
  }
};

