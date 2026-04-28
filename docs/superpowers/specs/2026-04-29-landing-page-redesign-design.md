# Landing page redesign — Lab Status Board

**Date:** 2026-04-29
**Scope:** `src/pages/index.astro` and supporting components/data only. No global theme changes, no new routes.

## Problem

The current landing page reads as a personal blog: a giant headline ("working notes on ai integration"), a short bio, and a list of three recent posts. It does not communicate that **samperalabs** is a brand or that there is more here than writing. Visitors don't see projects, what's currently in flight, or anything they can take with them — just three blog post titles.

The visual style (dark, notebook grid, mono nav, sans-serif body, orange accent) is staying. The change is structural: what visitors see when they arrive, and how the brand reads.

## Goals

1. **Brand-forward landing** — `samperalabs.` is the first thing the visitor sees, treated as a wordmark.
2. **Multiple content streams visible above the fold** — not just writing.
3. **Low maintenance** — manually-curated cells are hardcoded in TypeScript so updating means editing one file.
4. **Re-uses existing data** — posts come from the existing SQLite layer; project case-studies are queried by hardcoded slug list.

Non-goals: changing the visual theme, building an admin UI for the new sections, building a separate `/projects` index route.

## Layout

Single column, `max-w-5xl`, three vertical sections:

```
┌─────────────────────────────────────────────────────────────────┐
│  // est. 2024 · the lab        writing  projects  about contact │  ← existing nav, copy tweaked
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  // SAMPERALABS · NOTEBOOK · 2026-04                            │  ← mono kicker
│                                                                 │
│  samperalabs.                                                   │  ← wordmark, ~88px,
│                                                                 │     orange period
│  A working lab on LLM orchestration and context management      │  ← tagline, ~17px,
│  systems. Run by Bernat Sampera — notes from putting AI into    │     max-width 560px
│  production software.                                           │
│                                                                 │
├──────────────────────────┬──────────────────────────────────────┤
│  // NOW BUILDING         │  // RECENT WRITING        all 14 →   │
│  · BleakAI v2 …          │  2025-10-27   BleakAI                │
│  · OllamaGuard …         │  2025-09-21   Safely running …       │
│  · Note-taking pipeline  │  2025-09-20   Common LangGraph …     │
├──────────────────────────┼──────────────────────────────────────┤
│  // PROJECTS             │  // WORTH FOLLOWING                  │
│  · BleakAI               │  person  Simon Willison ↗            │
│  · Kronologs             │  tool    DSPy ↗                      │
│  · TranslatePrompt       │  paper   "Sleep-time compute" ↗      │
└──────────────────────────┴──────────────────────────────────────┘
        // bernat@samperalabs · github · twitter   // updated …
```

The 2×2 grid uses the existing `ink-border-soft` divider color. Each cell is roughly equal weight; the writing cell is the only one with an "all N →" link.

## Component breakdown

### New / changed components

- **`src/pages/index.astro`** — rewritten. Holds the hardcoded data for the manual cells (see "Data sources" below) and queries the DB for writing + projects.
- **`src/components/common/LabHero.astro`** — new. Renders the kicker + wordmark + tagline. Replaces the existing `Hero` usage on the homepage. (`Hero.astro` itself stays — other pages may use it.)
- **`src/components/common/LabCell.astro`** — new. Generic card cell with a mono label, optional "all N →" link, and a slot for items. Used for all four cells.
- **`src/components/common/LabItem.astro`** — new. Single row inside a cell. Variants: `dated` (date + title + optional excerpt), `bulleted` (bullet + title), `linked` (kind + name + why + external arrow).

### Untouched

`Header.astro`, `Footer.astro`, `BlogLayout.astro`, `PageLayout.astro`, all routes other than `/`. The existing `Hero.astro` stays so other pages aren't disturbed.

## Data sources

**Recent writing** (cell 2): top 3 published posts from the existing `getDB().getAllPosts()` call, **excluding the project slugs** (so project case-studies don't appear in both cells). Sorted by `pub_date` desc.

**Projects** (cell 3): hardcoded slug list, queried out of the same `posts` table.

```ts
const PROJECT_SLUGS = ['bleakai', 'kronologs', 'translateprompt', 'packdensack', 'bjjgym'] as const;
```

Display: top 3 by `pub_date` desc. Each row links to `/posts/<slug>`. No "see all" link on this cell — projects also surface in `/blog` chronologically per the existing model.

**Now building** + **Worth following**: hardcoded TypeScript constants in `index.astro` (top of frontmatter). Editing means changing the file.

```ts
const NOW_BUILDING: string[] = [
  'BleakAI v2 — eval suite for tool-calling agents',
  'OllamaGuard — CPU temp watchdog',
  'Note-taking pipeline that survives context windows',
];

const WORTH_FOLLOWING: Array<{kind: 'person' | 'tool' | 'paper' | 'blog'; name: string; href: string; why: string}> = [
  {kind: 'person', name: 'Simon Willison', href: 'https://simonwillison.net', why: 'Best running log of LLM tooling in the wild.'},
  {kind: 'tool',   name: 'DSPy',           href: 'https://dspy.ai',           why: 'Structuring LLM programs so you can actually iterate.'},
  {kind: 'paper',  name: '"Sleep-time compute"', href: 'https://example.com', why: 'Why offline reasoning is going to matter.'},
];
```

The exact item content above is placeholder — the user will edit before launch.

## Copy

- **Kicker:** `// SAMPERALABS · NOTEBOOK · {YYYY-MM}` — month, not full date, since the page itself is not dated content.
- **Wordmark:** `samperalabs.` — period in `text-marker` orange, rest in `text-text-strong`. Reuses existing tokens.
- **Tagline (proposed):** "A working lab on LLM orchestration and context management systems. Run by Bernat Sampera — notes from putting AI into production software." User may revise to taste; lives as a single `const TAGLINE` string in `index.astro`.
- **Cell labels:** `// now building`, `// recent writing`, `// projects`, `// worth following` — lowercase, mono, `text-stamp` blue, same style as the existing `// recent` label.

## Visual / styling rules

Reuses existing Tailwind tokens: `bg-ink`, `text-text-strong`, `text-text`, `text-text-muted`, `text-text-faint`, `text-stamp`, `text-marker`, `border-ink-border-soft`, `bg-marker-soft`, `font-display`, `font-mono`. No new tokens needed.

- Wordmark: `font-display font-bold lowercase text-[88px] leading-[0.95] tracking-[-0.05em]` on desktop, scales down on mobile.
- Cell labels: `font-mono text-[10.5px] uppercase tracking-[0.15em] text-stamp` (matches existing `// recent` label style).
- Grid: 2-col on `md+`, single column stacked on mobile. Cells separated by 1px `border-ink-border-soft` lines, same as current `PostRow` divider.
- Hover: cells with linked items get `hover:bg-marker-soft` on the row, matching `PostRow` behavior.

## Behavior

- All item links are standard `<a>` tags, no JS.
- "Worth following" external links open in a new tab (`target="_blank" rel="noreferrer"`) and show the `↗` glyph after the name.
- `/projects/<slug>` URLs in vercel.json redirects continue to work — homepage links go directly to `/posts/<slug>`.
- No client-side data fetching, no animations beyond CSS hover transitions.

## Edge cases

- **Fewer than 3 posts/projects in DB:** render whatever exists; no placeholder. (Unlikely in practice — the DB has 14+ posts.)
- **A project slug is missing from the DB:** silently skipped. The homepage doesn't break; the slug list is the source of truth for "which slugs are projects", DB rows are the source of "what they currently say".
- **Mobile (<640px):** grid collapses to single column, wordmark scales to ~56px, tagline keeps full width. Nav remains in `Header.astro` unchanged.

## Testing

Manual smoke test in dev:
1. `npm run dev` → visit `/` → verify wordmark, tagline, all 4 cells render with content.
2. Click each writing/project link → lands on `/posts/<slug>`.
3. Click each "worth following" link → opens external URL in new tab.
4. Resize to mobile width → grid stacks, no horizontal scroll, wordmark fits.
5. Click "all 14 →" on writing cell → lands on `/blog`.

No new automated tests; existing Astro typecheck (`tsc --noEmit`) covers prop typing.

## Out of scope (explicitly)

- A `/projects` index route. Projects live in `/blog` chronologically.
- An admin/editing UI for "now building" or "worth following". Hardcoded by design.
- Image/asset wiring for project case-studies (separate TODO already noted in `scripts/project-posts/*.md`).
- Animation/motion beyond existing CSS transitions.
- Any change to dark theme, fonts, or color tokens.

## Open question carried forward

The proposed tagline is a draft. The user may revise the exact wording when implementing — the constant `TAGLINE` is one line in `index.astro`.
