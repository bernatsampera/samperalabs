# Blog Database

This directory contains the SQLite database setup for the blog posts system.

## Files

- `schema.sql` - Database schema definition

The SQLite database file itself is not in this directory:

- **Development:** `scripts/manage-sqlite/content.db` (created automatically, gitignored)
- **Production:** `/app/data/content.db` (Docker volume on the VPS)

The path is resolved by `getDB()` in `src/lib/db.ts`.

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

1. Ensure `/app/data/` is mounted from a Docker volume and writable by the server
2. The database file will be created automatically
3. Consider setting up regular backups of `/app/data/content.db` (the `scripts/manage-sqlite/index.py` script can pull it locally via SCP)

## Remote Mode (use prod DB from local dev)

`src/lib/db.ts` supports two backends behind the same `PostStore` interface:

- `SqliteStore` (default): opens the resolved `content.db` (see *Files* above) directly via better-sqlite3.
- `RemoteStore`: calls the production `/api/posts` endpoints over HTTP using `BLOG_API_KEY`.

To run local dev against the prod database (no SCP sync needed), set in `.env`:

```
BLOG_DB_MODE=remote
BLOG_REMOTE_URL=https://samperalabs.com
BLOG_API_KEY=<prod blog api key>
```

Notes:
- **Never set `BLOG_DB_MODE=remote` on the prod VPS** — `RemoteStore` would call the same server's `/api/posts`, which calls `getDB()` again, causing an infinite loop. Production must always run in default (local SQLite) mode.
- Every page render in remote mode does a network round-trip to prod. Dev will be slower and offline work breaks.
- Writes from dev mutate prod. There is no read-only gate; treat the dev environment with the same care as the admin panel.
- `deletePost` (hard delete) is not exposed via the API and will throw in remote mode. Use `softDeletePost`.
