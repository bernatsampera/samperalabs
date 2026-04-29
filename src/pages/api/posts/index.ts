import type { APIRoute } from 'astro';
import { getDB, type Post, type PostStatus } from '../../../lib/db';
import { errorResponse, requireAuth } from '../../../lib/apiAuth';

export const prerender = false;

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

function parseStatus(value: string | null): PostStatus | undefined {
  if (value === 'draft' || value === 'published') return value;
  return undefined;
}

// GET /api/posts — list posts (admin view: includes drafts; excludes deleted by default)
export const GET: APIRoute = async ({ request, url }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const params = new URL(url).searchParams;
    const status = parseStatus(params.get('status'));
    const includeDeleted = params.get('include_deleted') === 'true';
    const limit = Math.min(Math.max(Number(params.get('limit') ?? 20), 1), 100);
    const offset = Math.max(Number(params.get('offset') ?? 0), 0);

    const db = getDB();
    const { posts, total } = await db.getAllPostsAdmin({ status, includeDeleted, limit, offset });

    return jsonResponse({ posts, total, limit, offset });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return errorResponse(500, 'failed to fetch posts', 'server_error');
  }
};

// POST /api/posts — create a new post
export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const {
      title,
      author,
      description,
      image_url,
      image_alt,
      pub_date,
      tags,
      content,
      slug: providedSlug,
      status: providedStatus,
    } = body ?? {};

    if (!title || !author || !content) {
      return errorResponse(
        400,
        'missing required fields: title, author, content',
        'validation_error',
        { field: !title ? 'title' : !author ? 'author' : 'content' }
      );
    }

    const status: PostStatus = providedStatus === 'draft' ? 'draft' : 'published';
    const slug = (typeof providedSlug === 'string' && providedSlug.length ? slugify(providedSlug) : slugify(title));
    if (!slug) {
      return errorResponse(400, 'slug could not be derived from title', 'validation_error', {
        field: 'slug',
      });
    }

    const db = getDB();
    if (await db.getPostBySlugAdmin(slug)) {
      return errorResponse(409, 'slug already exists', 'slug_conflict', { field: 'slug' });
    }

    const nowIso = new Date().toISOString();
    const newPost: Omit<Post, 'id' | 'created_at' | 'updated_at'> = {
      title,
      author,
      description,
      image_url,
      image_alt,
      pub_date: pub_date || nowIso.split('T')[0],
      tags: Array.isArray(tags) ? tags : [],
      content,
      slug,
      status,
      published_at: status === 'published' ? nowIso : null,
    };

    const postId = await db.insertPost(newPost);
    const created = await db.getPostById(postId);

    return jsonResponse(created, 201);
  } catch (error) {
    console.error('Error creating post:', error);
    return errorResponse(500, 'failed to create post', 'server_error');
  }
};
