# Blog Database

SQLite-backed storage for blog posts and project pages. One DB, two execution contexts:

| Where | What `getDB()` returns | DB location |
|---|---|---|
| Local dev (`npm run dev`, scripts importing `~/lib/db`) | `RemoteStore` — talks to the prod API over HTTPS | n/a (no local file is read) |
| Production Docker on the VPS | `SqliteStore` — reads the file directly | `/app/data/content.db` (Docker volume) |

The dev server hits prod. There is no separate "local" copy of the data the app cares about. If you want a writable local snapshot for one-off scripts, use `scripts/manage-sqlite/index.py pull` — that file is read by ad-hoc scripts (migrations, sitemap generation), never by the app.

## Setup (dev)

Set in `.env`:

```
BLOG_API_KEY=<prod blog api key>
```

Optional override (defaults to `https://samperalabs.com`):

```
BLOG_REMOTE_URL=https://samperalabs.com
```

That's it. No mode flag. Dev always runs against prod.

**Caveats** (since dev = prod for data):
- Writes from `npm run dev` mutate prod. Treat the local admin panel like the live one.
- Every page render is a network round-trip. Offline work breaks.
- `deletePost` (hard delete) is not exposed by the API and throws. Use `softDeletePost`.

## Setup (production)

Mount `/app/data/` from a Docker volume so the SQLite file survives redeploys. The schema is applied automatically on first run.

For backups: `uv run --no-project python scripts/manage-sqlite/index.py pull` copies the prod file into `scripts/manage-sqlite/content.db`.

## Database Schema

See [`schema.sql`](schema.sql) for the canonical definition. The `posts` table contains:

- `id` — primary key
- `title`, `author`, `description`, `image_url`, `image_alt`
- `pub_date`, `published_at`, `deleted_at`
- `tags` — JSON array
- `content` — Markdown
- `slug` — unique
- `status` — `draft` | `published`
- `created_at`, `updated_at`

The `refs` table mirrors a similar shape for reference documents.

## API Endpoints

All under `/api/posts`. Auth: `Authorization: Bearer $BLOG_API_KEY`.

- `GET /api/posts?status=published&limit=20&offset=0&include_deleted=false`
- `GET /api/posts/[id]`
- `GET /api/posts/slug/[slug]`
- `POST /api/posts`
- `PATCH /api/posts/[id]`
- `DELETE /api/posts/[id]` — soft-delete (sets `deleted_at`)
- `POST /api/posts/[id]/restore`

## Migration

To migrate markdown posts from `src/pages/posts/` into the DB:

```bash
node scripts/migrate-posts.mjs
```

This script writes to `scripts/manage-sqlite/content.db` (the local working file). After it runs, `uv run --no-project python scripts/manage-sqlite/index.py push` to ship the result to prod.
