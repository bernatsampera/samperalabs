# Blog Database

This directory contains the SQLite database setup for the blog posts system.

## Files

- `schema.sql` - Database schema definition
- `content.db` - SQLite database file (created automatically, not in git)

## Setup

The database is initialized automatically when you first run the application. The schema is applied automatically.

## Migration

To migrate existing markdown posts to the database, run:

```bash
node scripts/migrate-posts.mjs
```

This will:

1. Read all `.md` files from `src/pages/posts/`
2. Parse frontmatter and content
3. Insert into the SQLite database
4. Generate slugs from filenames

## Database Schema

The `posts` table contains:

- `id` - Primary key (auto-increment)
- `title` - Post title
- `author` - Post author
- `description` - Post description (optional)
- `image_url` - Featured image URL (optional)
- `image_alt` - Image alt text (optional)
- `pub_date` - Publication date
- `tags` - JSON array of tags
- `content` - Markdown content
- `slug` - URL slug (unique)
- `created_at` - Timestamp when created
- `updated_at` - Timestamp when last updated

## API Endpoints

- `GET /api/posts` - Get all posts
- `GET /api/posts?tag=tagname` - Get posts by tag
- `GET /api/posts/[id]` - Get post by ID
- `GET /api/posts/slug/[slug]` - Get post by slug
- `POST /api/posts` - Create new post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

## Production Setup

For production deployments:

1. Ensure the `db/` directory is writable by the server
2. The database file will be created automatically
3. Consider setting up regular backups of `content.db`
