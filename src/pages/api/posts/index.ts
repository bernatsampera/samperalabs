import type { APIRoute } from 'astro';
import { getDB, type Post } from '../../../lib/db';

export const prerender = false;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// GET /api/posts - Get all posts
export const GET: APIRoute = async ({ url }) => {
  try {
    const db = getDB();
    const searchParams = new URL(url).searchParams;
    const tag = searchParams.get('tag');

    let posts: Post[];

    if (tag) {
      posts = db.getPostsByTag(tag);
    } else {
      posts = db.getAllPosts();
    }

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// POST /api/posts - Create a new post
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, author, description, image_url, image_alt, pub_date, tags, content } = body;

    // Validate required fields
    if (!title || !author || !content) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: title, author, and content are required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Generate slug from title
    const slug = slugify(title);

    const db = getDB();

    // Check if slug already exists
    const existingPost = db.getPostBySlug(slug);
    if (existingPost) {
      return new Response(
        JSON.stringify({
          error: 'A post with this title already exists',
        }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const newPost: Omit<Post, 'id' | 'created_at' | 'updated_at'> = {
      title,
      author,
      description,
      image_url,
      image_alt,
      pub_date: pub_date || new Date().toISOString().split('T')[0],
      tags: Array.isArray(tags) ? tags : [],
      content,
      slug,
    };

    const postId = db.insertPost(newPost);
    const createdPost = db.getPostById(postId);

    return new Response(JSON.stringify(createdPost), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return new Response(JSON.stringify({ error: 'Failed to create post' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
