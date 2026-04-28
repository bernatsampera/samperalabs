# SamperaLabs Redesign — Design Spec

**Date:** 2026-04-28
**Status:** Approved (visual direction); ready for implementation plan
**Owner:** Bernat Sampera

## 1. Goal

Replace the current "Silent Edge" minimal-light visual identity with a **dark notebook** identity ("Working Notes"), and at the same time radically simplify the content model: collapse the existing references library and content-type taxonomy into a single kind of thing — a post.

The redesign covers the full site (header, home, blog index, post reading view, about, contact). The blog reading experience is the priority surface and gets the most design budget.

## 2. Why

- The current Silent Edge palette (white background, light grays, black text) is generic for a personal blog about AI integration. Many blogs look like this.
- The site has accumulated structural overhead — references library, content types (post / quick post / article), tag-based browse axis, skills page, experience page, widgets page, separate project case-study pages — without enough content to justify any of it.
- A notebook aesthetic ("samperalabs" → "labs" → working notes) creates a literal-but-fresh identity that's hard to confuse with anything else and ages well.
- One content type (post) lets the writer publish without first deciding what kind of thing the new post is.

## 3. Visual Identity

### 3.1 Palette (locked)

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#0d1117` | Page background |
| `ink-2` | `#161b22` | Elevated surfaces (window chrome, code header) |
| `ink-3` | `#060a10` | Code block body (deeper than page) |
| `border` | `#1f2630` | Hairline borders, dividers |
| `border-soft` | `rgba(149,168,194,.16)` | Row separators on listings |
| `grid` | `rgba(80,120,180,.06)` | Notebook grid lines (32px square) |
| `text` | `#d6e1f0` | Body text |
| `text-strong` | `#f3f7ff` | Headlines, emphasized body |
| `text-muted` | `#95a8c2` | Excerpt / secondary text |
| `text-faint` | `#6b7a90` | Reading time, metadata |
| `stamp` | `#6da0ff` | Mono timestamps, "// kicker" labels |
| `marker` | `#f0a14a` | The single accent — period after the wordmark, heading notch, arrow, link underline, callout rule |
| `success` / `error` | `#5fbfa8` / `#f87272` | Reserved for admin/system feedback only |

The palette is **strictly two-color-with-an-accent**: ink + cool-blue text family + warm-orange marker. No additional accent hues.

### 3.2 Typography

- **Sans (body, display):** PP Neue Montreal — already loaded from `/public/fonts/*.otf` (6 weights including italic). Note: `@fontsource-variable/inter` is listed in `package.json` but never imported in source — phantom dep. The site's actual current sans is PP Neue Montreal; we keep it.
- **Mono:** JetBrains Mono Variable — added via `@fontsource-variable/jetbrains-mono`.
- **No third face.** Display weight comes from PP Neue Montreal at weight 700 with tight tracking (`-0.045em` on `h1`, `-0.025em` on article titles).

| Role | Family | Weight | Size (desktop) | Tracking | Notes |
|---|---|---|---|---|---|
| Hero (home) | PP Neue Montreal | 700 | 78 / 90 px | -0.05em | Lowercase, line-height 0.9 |
| Section display (`writing.`) | PP Neue Montreal | 700 | 64 px | -0.045em | Same as hero, smaller |
| Article title | PP Neue Montreal | 700 | 42 px | -0.025em | Sentence case |
| Article H2 | PP Neue Montreal | 700 | 22 px | -0.01em | Orange notch (`::before`) |
| Lede (article intro) | PP Neue Montreal | 400 italic | 18 px | — | Orange em-dash glyph prefix |
| Body | PP Neue Montreal | 400 | 16 px / line-height 1.72 | — | Max measure ~640 px |
| Excerpt (listings) | PP Neue Montreal | 400 | 13 px / line-height 1.5 | — | `text-muted` |
| Mono timestamp | JetBrains Mono | 400 | 10.5 px | 0.04em | `stamp` color |
| Mono kicker / `// label` | JetBrains Mono | 400 | 10.5 px | 0.06em | `stamp` color |
| Inline code | JetBrains Mono | 400 | 13 px | — | Padded chip with `ink-2` bg |
| Code block | JetBrains Mono | 400 | 12.5 px / line-height 1.65 | — | `ink-3` body, `ink-2` header |

### 3.3 Notebook background

A subtle 32×32 px grid drawn with two `repeating-linear-gradient`s using `--grid` opacity. Applied to the `<body>` (or the main page wrapper). Survives mobile (does not need to be hidden).

### 3.4 Iconography & glyphs

The marker accent does the work that icons would do:
- `→` (mono) — "go to" arrow on listing rows and CTAs
- `←` (mono) — back navigation
- `// label` — kicker / mono prefixes (verbal icon)
- 6×18 px orange rectangle — H2 notch
- 3 px orange left rule — quote / callout

No SVG icon library required. Existing `astro-icon` use in admin or footer can stay.

## 4. Content Model

### 4.1 One kind of thing — `post`

- Drop the concept of "content type" (essay / quick post / article / reference) end-to-end.
- Drop tags as a UI browse axis.
- The `posts.tags` and any `contentType` fields stay in the DB schema for now (data preservation), but no listing, filter, or page reads them. They can be removed in a follow-up cleanup once we're confident nothing depends on them.

### 4.2 References → posts (one-time migration)

Migration script copies every row in `refs` into `posts` with the following mapping:

| `refs` column | `posts` column | Notes |
|---|---|---|
| `title` | `title` | unchanged |
| `description` | `description` | unchanged (used as excerpt) |
| `content` | `content` | unchanged |
| `slug` | `slug` | preserved when unique; if collision, append `-ref` |
| `tags` | `tags` | copied through (dormant) |
| `format` | — | dropped |
| `created_at` | `pub_date`, `published_at`, `created_at` | use `created_at` for all three. Planner should verify nothing else in the app gates on `published_at` independent of `status`. |
| — | `author` | set to `'Bernat Sampera'` |
| — | `status` | `'published'` |

Then drop the `refs` table after a verification pass.

### 4.3 Project case studies → posts (one-time migration)

The five static project pages (`bjjgym`, `bleakai`, `kronologs`, `packdensack`, `translateprompt`) become posts. Their `.astro` content is converted to Markdown manually (one-time, ~5 files) and inserted via a **seed script** (`scripts/seed-project-posts.mjs`) — reproducible across environments and re-runnable idempotently. Each preserves its slug.

## 5. Information Architecture

### 5.1 Routes after redesign

| Path | Status | Notes |
|---|---|---|
| `/` | Restyle | Hero + 3 most recent post rows |
| `/blog` | Restyle, keep URL | Becomes the index of posts. Nav label says "writing", URL stays `/blog` for SEO. |
| `/posts/[slug]` | Restyle | Single-column reading view |
| `/about` | Restyle + absorb | Bio + skills/experience content folded in |
| `/contact` | Restyle | Minimal contact page |
| `/404` | Restyle | Minimal notebook style |

### 5.2 Routes deleted

| Path | Action |
|---|---|
| `/references`, `/references/[slug]` | 301 → `/blog` and `/posts/[slug]` |
| `/skills` | 301 → `/about` |
| `/experience` | 301 → `/about` |
| `/widgets` | Delete; emit **410 Gone** via Vercel (route is permanently retired) |
| `/projects/[name]` | 301 → `/posts/[name]` |
| `/tags/[tag]` | Delete; emit **410 Gone** via Vercel |

Redirects added in `vercel.json` under a `redirects` array. Each `301` permanent.

### 5.3 API endpoints

- `GET/POST /api/references`, `GET/PUT/DELETE /api/references/[id]`, `GET /api/references/slug/[slug]` — **deleted** after migration.
- `GET/POST /api/posts`, `GET/PUT/DELETE /api/posts/[id]` — kept and used unchanged.

## 6. Layouts

### 6.1 Header

Mono brand on the left (`// samperalabs`), mono nav links on the right with an orange underline on the active link. Three items: **writing · about · contact**. Sticky on scroll, hairline border-bottom on `border` color. No logo image — text-only.

### 6.2 Footer

Two lines, mono, faint:
- Line 1: `// samperalabs · since 2024`
- Line 2: `// last updated YYYY-MM-DD` (auto-stamped from build time)
Plus the existing `SocialFollow` component restyled (mono labels, no icons or minimal).

### 6.3 Home (`/`)

```
┌────────────────────────────────────────┐
│ // samperalabs        writing about contact │
│                                        │
│  // notebook · 2026-04-28              │
│                                        │
│  working notes                         │
│  on ai integration.                    │
│                                        │
│  I'm Bernat Sampera. I build software  │
│  that uses LLMs in production…         │
│                                        │
│  // recent                             │
│  ─────────────────────────────────────│
│  2026-04-26  When the model is right…  8 min │
│  2026-04-14  A short defense of…       4 min │
│  2026-04-09  llms.txt for a multi…     2 min │
│                                        │
│  // see all writing →                  │
└────────────────────────────────────────┘
```

- Hero kicker auto-pulls today's date and a stable "entry-N" counter (post count) — optional, can be a static string if implementation is awkward.
- Three rows = 3 most recent published posts, ordered by `pub_date` desc.
- "see all writing →" link to `/blog`.

### 6.4 Blog index (`/blog`)

- Display headline `writing.` (with orange period).
- Right-aligned mono entry count.
- Single search input below the headline (mono placeholder, `/` slash glyph). Client-side filter on title + excerpt + body, identical behavior to current `BlogSearch`.
- One column of dated rows: `[date]  [title + excerpt]  [reading time]`.
- No filter chips, no badges, no tag pills.
- Newest first. **Single render of the full list** — current post count is well under 30, the load-more JS is removed.

### 6.5 Post reading view (`/posts/[slug]`)

- Single column, max-width 640 px, centered.
- Back link (mono, top): `← all writing`.
- Article meta line (mono): `YYYY-MM-DD · N MIN READ`.
- Title (Inter 800/42).
- Lede (italic, with leading `—  ` in marker color).
- Body in `prose` with our custom overrides (see §7).
- End rule: `·  ·  ·` (mono, marker color, letter-spacing 0.3em, centered).
- Next-entry card: previous-by-date post; mono `// next entry` label, title, orange `→`.
- No TOC sidebar (drop the current `BlogLayout` two-column layout).
- No related-posts grid, no share buttons, no comments.

### 6.6 About (`/about`)

Same display headline pattern: `about.`. Body uses the same `prose` styles. Sections for bio, skills (rendered as a mono list), experience (rendered as dated rows similar to post listings). Folds in everything currently on `/skills` and `/experience`.

### 6.7 Contact (`/contact`)

`contact.` headline, one paragraph, email + 3 social links via `SocialFollow`. That's it.

## 7. Components

| Component | Location | Notes |
|---|---|---|
| `Header.astro` | existing | Replace nav rendering; new active style (orange underline + bold). Brand becomes mono. |
| `Footer.astro` | existing | Replace contents with the two-line mono treatment. |
| `Layout.astro` | existing | Add `<body>` background + grid; load JetBrains Mono. |
| `PageLayout.astro` | existing | Apply ink background, max-width container `7xl` → `5xl`. |
| `BlogLayout.astro` | existing | Strip TOC sidebar; switch to single-column. |
| `PostRow.astro` | **new** | Replaces `PostCard.astro` for listing pages. Grid columns `[100px 1fr auto]`. |
| `BlogSearch.astro` | existing | Restyle to mono input with `/` slash glyph. Behavior unchanged. |
| `Hero.astro` | **new** | Home hero block (kicker + display + intro). |
| `Callout.astro` | **new** | `// note to self` style margin callout. Used in MDX. |
| `Quote.astro` | **new** | Pull-quote with optional `// MARGIN NOTE` byline. |
| `CodeBlock.astro` | **new** | Wraps native `<pre>` with file-name header + copy button. Posts are stored as Markdown in SQLite and rendered with `marked` server-side — the planner should inspect the current rendering pipeline (`src/pages/posts/[slug].astro` and `src/utils/frontmatter.mjs`) and choose between (a) a `marked` renderer extension, (b) a post-render DOM rewrite, or (c) a rehype plugin if the pipeline already uses one. |
| `NextEntry.astro` | **new** | End-of-post next-link card. |
| `PostCard.astro` | existing | Delete after `PostRow.astro` is wired. |
| `ReferenceCard.astro` | existing | Delete after migration. |

## 8. Build & Tooling Changes

- **DaisyUI removed.** It's loaded but barely used in our component tree, and the new design needs none of its components. Remove from `tailwind.config.cjs` and from `package.json`.
- **Tailwind theme replacement.** Drop the `silentedge` theme and the legacy color tokens (`accent`, `off-white`, `light-gray`, `medium-gray`, `dark-gray`, `background`). Replace with new tokens matching §3.1 names.
- **Add JetBrains Mono.** `npm install @fontsource-variable/jetbrains-mono`; load alongside Inter in `Layout.astro`.
- **Update `tailwind.config.cjs`:** new `colors` extension, new `fontFamily.mono` entry, `theme.typography` (`prose`) overrides for the new dark style.
- **`@tailwindcss/typography` overrides.** New `prose` config that maps to our palette and adds the heading notch, callout, quote, and inline-link highlighter styles.
- **Background grid.** Implemented as a Tailwind utility (`bg-notebook`) backed by a `backgroundImage` extension.
- **`vercel.json`:** add `redirects` array for the routes in §5.2.

## 9. Migration & Cutover

1. **DB migration script** (`scripts/migrate-references-to-posts.mjs`):
   - Read all rows from `refs`.
   - For each, insert a `posts` row using mapping in §4.2.
   - Verify count + spot-check a few slugs.
   - On success, `DROP TABLE refs`.
2. **Project pages → posts:** convert each of the 5 `.astro` project pages to Markdown by hand, insert via admin, preserve slugs.
3. **Sitemap regeneration:** existing sitemap integration pulls from DB — should pick up new posts automatically. Verify after migration.
4. **RSS:** preserve the existing RSS feed. Make sure migrated posts and project posts appear correctly.
5. **Redirect verification:** smoke-test the Vercel redirects on a preview deploy before promoting.

## 10. Out of Scope

- Admin UI redesign. Admin pages keep functional parity; minimal palette swap only (so they don't read white-on-white when the rest of the site is dark). No layout changes.
- Image-optimization changes (no work on `images-optimization.ts`).
- Analytics / SEO / sitemap.xml structure changes beyond what migration requires.
- Performance budget exercise.
- Comments, social-share buttons, related-posts grid — all explicitly absent.
- A light-mode variant. The site is dark-only.
- Mobile design beyond what falls out of single-column layouts (no separate menu treatment).

## 11. Open Questions / Recommendations Baked In

These were decided in favor of speed; flag if any need revisiting:

1. **Blog URL stays `/blog`** (not `/writing`) for SEO. The nav label says "writing".
2. **DaisyUI dropped entirely**, not migrated.
3. **TOC dropped** from post reading view. Long posts will need to live with that or rely on H2 visual rhythm.
4. **Search stays client-side** with the same JS pattern as today.
5. **Footer kept minimal** — no link grid, no nav repeat.
6. **About page absorbs skills + experience verbatim**, no rewrite.

## 12. Acceptance Criteria

- `/`, `/blog`, `/posts/[slug]`, `/about`, `/contact` all render in the new style and pass visual review against the v4 mockup at `.superpowers/brainstorm/26193-1777388364/d-v4-simplest.html` and the post-reading mockup at `.superpowers/brainstorm/26193-1777388364/post-reading.html`.
- All references in DB are migrated to posts; `/references` and `/references/[slug]` return 301 to the new locations.
- All five project pages migrated to posts; `/projects/[name]` redirects 301.
- `/skills`, `/experience` redirect 301 to `/about`.
- `/widgets`, `/tags/[tag]` return 410 (or 404 acceptably).
- No remaining imports or references to DaisyUI, the `silentedge` theme, the legacy color tokens, or the deleted reference components.
- Build passes; sitemap includes migrated posts; RSS feed valid.
- Admin pages (`/admin`, `/admin/new-post`, `/admin/edit-post/[id]`) render correctly after DaisyUI removal and CRUD on posts still works end-to-end.
