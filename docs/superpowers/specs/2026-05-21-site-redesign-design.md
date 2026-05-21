# Site Redesign — Minimalist Writer/Builder Portfolio

**Date:** 2026-05-21
**Status:** Approved

## Overview

Complete redesign of samperalabs.com from a dark, code-themed AI lab portfolio to a minimalist, light, typography-focused personal site modeled on noahzender.com. The site repositions Bernat Sampera as a builder and writer at the intersection of AI and software.

**Tagline:** "Everything is context."

## Site Structure

| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Hero tagline + essays listed by year |
| About | `/about` | Personal narrative, beliefs, connect links |
| Notes | `/notes` | Categorized ideas/mental models (incl. AI engineering) |
| Note | `/notes/:slug` | Individual note page with full content |
| Things I Like | `/things-i-like` | Curated books, podcasts, videos, articles by category |
| Essay | `/posts/:slug` | Individual essay pages (restyled) |
| 404 | `404` | Restyled to match new aesthetic |
| Admin | `/admin/*` | Unchanged — blog post management |
| API | `/api/*` | CRUD endpoints for posts, notes, likes |

### Pages Removed

- `/skills` — skills page
- `/experience` — experience timeline
- `/contact` — contact page
- `/widgets` — widget showcase
- `/references` and `/references/:slug` — reference library
- `/projects/*` — individual project case study pages
- `/blog` — 301 redirect to `/` (essays now live on homepage)
- `/tags/[tag]` — tag archive pages (removed, tags no longer surfaced)

### Project Posts in Database

Existing project posts (bjjgym, bleakai, etc.) remain in the database but are excluded from the homepage essay list. The `projectSlugSet` filter in `src/lib/projects.ts` is preserved for this purpose. Project posts are not accessible via any public route.

## Visual Design

### Aesthetic

Pure minimalist, light, typography-focused. Matches Noah Zender's approach: off-white background, stone grays, system fonts, generous whitespace, no images, no cards, no icons. Text only.

### Color Palette

Replace the current dark "ink" palette entirely. Use Tailwind's built-in `stone` scale:

| Token | Value | Usage |
|---|---|---|
| `stone-50` | `#fafaf9` | Page background |
| `stone-900` | `#1c1917` | Primary text, headings |
| `stone-600` | `#57534e` | Hover states on titles |
| `stone-500` | `#78716c` | Hero tagline, subtitles |
| `stone-400` | `#a8a29e` | Muted text, metadata, dates |
| `stone-100` | `#f5f5f4` | Subtle borders, dividers |
| `white` | `#ffffff` | Menu overlay background |

### Typography

- **Font stack:** `system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Remove:** PP Neue Montreal, JetBrains Mono — no custom fonts
- **Headings:** system sans, semibold (600)
- **Body:** system sans, regular (400), 15px, line-height 1.75
- **Meta/labels:** 12-14px, stone-400/500
- **Antialiased rendering**

### Layout

- **Max width:** 44rem (704px) centered
- **Horizontal padding:** 20px mobile, 32px desktop
- **Generous vertical spacing** between sections

### Dark Mode

Removed. Light only.

## Page Designs

### Homepage (`/`)

1. **Header:** "Bernat Sampera" left-aligned, "Open menu" right-aligned
2. **Hero section:**
   - Tagline: "Everything is context." (20px, stone-500)
   - Sub-description: one sentence about being a builder/writer at the AI/software intersection (15px, stone-400)
3. **Essays by year:**
   - Year heading (h3, 14px, semibold, stone-900)
   - Each essay: title + reading time + date on the right
   - Subtle border dividers between entries
   - Hover: title changes to stone-600

**Data source:** Existing `posts` table, filtered to exclude project slugs (using `projectSlugSet`), grouped by year from `pub_date`.

### About (`/about`)

1. **Title:** "About" (28px, semibold)
2. **Intro:** 2-3 paragraphs — personal narrative, trajectory, what you do (placeholder copy, user will write real content)
3. **"What I Believe"** section: 3-5 bold statement + one-line explanation pairs
4. **"Connect"** section: Links to X and email

**Data source:** Static Astro page (no database).

### Notes (`/notes`)

1. **Title:** "Notes" + subtitle describing purpose
2. **Category navigation:** Pill-style jump links at top (e.g. "AI Engineering", "Building & Craft", "Thinking & Decisions", "Work & Leadership", "Business & Markets")
3. **Notes by category:** Category heading (h3) followed by list of note titles, each linking to `/notes/:slug`

**Data source:** New `notes` table in SQLite.

### Individual Note Page (`/notes/:slug`)

1. **Header:** Same sticky header as all pages
2. **Back link:** "← Notes" link back to `/notes` listing (stone-400, top of content area)
3. **Title:** Note title (28px, semibold, stone-900)
4. **Category label:** Displayed below title (12px, stone-400)
5. **Content:** Rendered markdown using the same `marked` pipeline as posts
6. **No table of contents, no reading time, no related items** — keep it simple

**Data source:** `notes` table, resolved by slug.

### Things I Like (`/things-i-like`)

1. **Title:** "Things I Like" + subtitle
2. **Items by category:** Category heading (h3) followed by list of items
3. **Each item:** Title + author + type label (book/podcast/video/article/paper) + external link with ↗ indicator

**Data source:** New `likes` table in SQLite.

### Essay Pages (`/posts/:slug`)

Restyled to match the new aesthetic. Same content rendering (markdown), but with:
- Stone color palette
- System fonts
- 44rem max width
- Minimal header/footer
- Table of contents and reading time preserved
- Related posts section removed

### 404 Page

Restyled to match new aesthetic:
- "Page not found" heading (28px, semibold, stone-900)
- Brief message (15px, stone-500)
- Link back to home
- Same 44rem centered layout

### Navigation

- **Header:** Sticky. "Bernat Sampera" (link to home) left, "Open menu" right
- **Menu overlay:** Full-screen white overlay with large nav links:
  - Essays (→ `/`)
  - About (→ `/about`)
  - Notes (→ `/notes`)
  - Things I Like (→ `/things-i-like`)
- **Social footer in menu:** X, GitHub, RSS links below a divider
- **Toggle:** "Open menu" / "Close" text toggle

## Layouts

### What survives

- **`Layout.astro`** — Base HTML layout. Updated: remove dark mode classes, update font references, set stone-50 background.
- **`PageLayout.astro`** — Standard page layout with header/footer. Updated: wire new Header and Footer components.

### What gets replaced

- **`BlogLayout.astro`** — Replaced with a simpler `EssayLayout.astro`: same 44rem centered layout, stone styling, keeps ToC and reading time, removes related posts and dark-themed components.
- **`MarkdownLayout.astro`** — Replaced or merged into `EssayLayout.astro` since both render markdown content.

## Database Changes

### New Table: `notes`

```sql
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### New Table: `likes`

```sql
CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'article',
  category TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

`sort_order` enables manual ordering within categories. Default ordering: `sort_order ASC, created_at DESC`.

### Existing Table: `posts`

No schema changes. Posts continue to serve as essays on the homepage.

## Data Access Layer

The existing codebase uses a dual-store pattern: `SqliteStore` (reads local SQLite in production/Docker) and `RemoteStore` (proxies to prod API in dev). Both implement the `PostStore` interface.

New tables need the same treatment:

1. **Define `NoteStore` interface** with methods: `getAllNotes()`, `getNoteBySlug(slug)`, `createNote(data)`, `updateNote(id, data)`, `deleteNote(id)`
2. **Define `LikeStore` interface** with methods: `getAllLikes()`, `createLike(data)`, `updateLike(id, data)`, `deleteLike(id)`
3. **Implement both `SqliteNoteStore` and `RemoteNoteStore`** (and same for likes)
4. **Wire into `getDB()`** so the rest of the app uses the same pattern

Alternatively, extend the existing `PostStore` interface and implementations to include note/like methods. Implementation decision left to the implementer — either approach works as long as both dev and prod paths are covered.

## API Endpoints

All endpoints require `BLOG_API_KEY` Bearer authentication (same as existing post endpoints, via `requireAuth()`). All return JSON.

### Posts (existing — keep as-is)

- `GET /api/posts` — list all posts
- `POST /api/posts` — create post
- `PATCH /api/posts/:id` — update post
- `DELETE /api/posts/:id` — delete post

### Notes (new)

- `GET /api/notes` — list all notes (optional `?category=` filter)
- `POST /api/notes` — create note `{ title, slug, content, category }`
- `GET /api/notes/:id` — get single note by ID
- `GET /api/notes/slug/:slug` — get single note by slug (used by page routing)
- `PATCH /api/notes/:id` — update note
- `DELETE /api/notes/:id` — delete note

### Likes (new)

- `GET /api/likes` — list all likes (optional `?category=` filter)
- `POST /api/likes` — create like `{ title, author, url, type, category }`
- `GET /api/likes/:id` — get single like
- `PATCH /api/likes/:id` — update like
- `DELETE /api/likes/:id` — delete like

No admin UI is built for notes or likes. All content management happens via API calls from an external agent.

## Tailwind Configuration Changes

Replace the entire custom color/font config:

- **Remove:** ink palette, stamp, marker colors, PP Neue Montreal, JetBrains Mono, notebook background, `darkMode: 'class'`
- **Add:** system font stack as default sans. Stone colors are built into Tailwind — no custom tokens needed.
- **Keep:** typography plugin, content paths

## Config Updates

### `src/config.yaml`

- `metadata.title.default`: "Bernat Sampera" (was "Bernat Sampera - AI Integration Specialist")
- `metadata.title.template`: "%s — Bernat Sampera" (was "%s samperalabs")
- `metadata.description`: "Builder and writer at the intersection of AI and software." (was AI integration specialist copy)
- `ui.theme`: remove entirely (light only, no toggle)

### RSS Feed

- Title: "Bernat Sampera" (was "Sampera Labs | Writing")
- Description: "Essays on building with AI and software."
- Continue excluding project slugs from the feed
- No separate RSS feed for notes

### Sitemap

Update `src/integrations/sitemap.ts` and related files:
- Add `/notes`, `/things-i-like`, and individual `/notes/:slug` URLs
- Remove URLs for deleted pages (skills, experience, contact, widgets, references, projects)
- Keep `/about`

## What Stays Unchanged

- Astro 5 SSR with Node.js adapter
- SQLite database backend
- Admin panel (`/admin/*`) — post management only
- Build/deploy pipeline
- Image optimization utilities (kept for potential future use)
- `src/lib/apiAuth.ts` — authentication layer

## What Gets Removed

- Dark "ink" theme and all related color tokens
- Monospace/code aesthetic (font-mono usage throughout)
- Custom fonts (PP Neue Montreal, JetBrains Mono)
- Pages: skills, experience, contact, widgets, references, project case studies, blog listing, tag archives
- Components: LabHero, LabCell, LabItem, SocialFollow, ReferenceCard, chronology timeline
- Dark mode toggle/support
- "lofi" theme setting
- Notebook background pattern
- Related posts section on essay pages
