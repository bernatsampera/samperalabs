# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current hero-and-post-list homepage with a brand-forward "lab status board": large `samperalabs.` wordmark, tagline, and a 2×2 grid showing Now Building / Recent Writing / Projects / Worth Following.

**Architecture:** Three new presentational Astro components (`LabHero`, `LabCell`, `LabItem`) composed inside a rewritten `src/pages/index.astro`. Recent writing and projects come from the existing SQLite layer (`getDB().getAllPosts()`); "now building" and "worth following" are TypeScript constants at the top of `index.astro`. Project posts are identified by a hardcoded slug list (`bleakai`, `kronologs`, `translateprompt`, `packdensack`, `bjjgym`) and excluded from the recent writing query.

**Tech Stack:** Astro 5 SSR, TypeScript, Tailwind (existing tokens only — no new colors), `better-sqlite3` via existing `src/lib/db.ts`. No new dependencies.

**Spec:** [docs/superpowers/specs/2026-04-29-landing-page-redesign-design.md](../specs/2026-04-29-landing-page-redesign-design.md)

**Verification approach:** This codebase does not have component-level unit tests, and the spec explicitly says no new automated tests. Each task is verified by `npx astro check` (type/prop validation) plus a visual smoke test in `npm run dev`. The existing vitest suite (`npm test`) is run once at the end as a regression check.

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/common/LabItem.astro` | Single row inside a cell. Three variants (`dated`, `bulleted`, `linked`) chosen via discriminated-union props. |
| Create | `src/components/common/LabCell.astro` | One quadrant of the grid: mono `// label`, optional `all N →` link, slot for items. |
| Create | `src/components/common/LabHero.astro` | Mono kicker + `samperalabs.` wordmark + tagline paragraph. |
| Modify | `src/pages/index.astro` | Full rewrite. Holds the four hardcoded constants, fetches posts and projects from the DB, renders `LabHero` + four `LabCell`s. |

`src/components/common/Hero.astro` and `src/components/common/PostRow.astro` are **untouched** — they remain available for other pages.

---

## Task 1: Create `LabItem` component

**Files:**
- Create: `src/components/common/LabItem.astro`

`LabItem` renders one row. Three discriminated variants:

- `dated` — date column + title + optional excerpt. Used by Recent Writing. Wraps in `<a>` if `href` is supplied.
- `bulleted` — orange `·` bullet + title + optional description. Used by Now Building and Projects. Wraps in `<a>` if `href` is supplied.
- `linked` — small uppercase `kind` + bold name + `↗` + one-line `why`. Always wraps in an `<a target="_blank">`. Used by Worth Following.

Tailwind classes reuse existing tokens (`text-text-strong`, `text-text-muted`, `text-text-faint`, `text-stamp`, `text-marker`, `border-ink-border-soft`, `bg-marker-soft`, `font-mono`).

- [ ] **Step 1: Create the component file**

Write `src/components/common/LabItem.astro`:

```astro
---
export interface DatedItem {
  variant: 'dated';
  date: string;       // YYYY-MM-DD
  title: string;
  excerpt?: string;
  href?: string;
}
export interface BulletedItem {
  variant: 'bulleted';
  title: string;
  description?: string;
  href?: string;
}
export interface LinkedItem {
  variant: 'linked';
  kind: 'person' | 'tool' | 'paper' | 'blog';
  name: string;
  href: string;
  why: string;
}
export type Props = DatedItem | BulletedItem | LinkedItem;

const item = Astro.props;

const baseRow = 'block py-2 transition-colors';
const hoverable = 'hover:bg-marker-soft -mx-3 px-3 rounded-sm';
---

{item.variant === 'dated' && (
  item.href ? (
    <a href={item.href} class={`${baseRow} ${hoverable} grid grid-cols-[88px_1fr] gap-3 items-baseline`}>
      <time class="font-mono text-[10.5px] text-text-faint tracking-wide">{item.date}</time>
      <div>
        <div class="text-[14px] font-medium text-text-strong leading-snug">{item.title}</div>
        {item.excerpt && (
          <p class="text-[12px] text-text-muted mt-1 leading-relaxed">{item.excerpt}</p>
        )}
      </div>
    </a>
  ) : (
    <div class={`${baseRow} grid grid-cols-[88px_1fr] gap-3 items-baseline`}>
      <time class="font-mono text-[10.5px] text-text-faint tracking-wide">{item.date}</time>
      <div>
        <div class="text-[14px] font-medium text-text-strong leading-snug">{item.title}</div>
        {item.excerpt && (
          <p class="text-[12px] text-text-muted mt-1 leading-relaxed">{item.excerpt}</p>
        )}
      </div>
    </div>
  )
)}

{item.variant === 'bulleted' && (
  item.href ? (
    <a href={item.href} class={`${baseRow} ${hoverable}`}>
      <div class="text-[14px] font-medium text-text-strong leading-snug">
        <span class="text-marker mr-2">·</span>{item.title}
      </div>
      {item.description && (
        <p class="text-[12px] text-text-muted mt-1 leading-relaxed pl-4">{item.description}</p>
      )}
    </a>
  ) : (
    <div class={baseRow}>
      <div class="text-[14px] font-medium text-text-strong leading-snug">
        <span class="text-marker mr-2">·</span>{item.title}
      </div>
      {item.description && (
        <p class="text-[12px] text-text-muted mt-1 leading-relaxed pl-4">{item.description}</p>
      )}
    </div>
  )
)}

{item.variant === 'linked' && (
  <a href={item.href} target="_blank" rel="noreferrer" class={`${baseRow} ${hoverable} grid grid-cols-[72px_1fr] gap-3 items-baseline`}>
    <span class="font-mono text-[9.5px] text-text-faint tracking-[0.1em] uppercase pt-1">{item.kind}</span>
    <div>
      <div class="text-[14px] font-medium text-text-strong leading-snug">
        {item.name}<span class="text-marker font-mono text-[11px] ml-1">↗</span>
      </div>
      <p class="text-[12px] text-text-muted mt-1 leading-relaxed">{item.why}</p>
    </div>
  </a>
)}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx astro check`
Expected: 0 errors related to `LabItem.astro`. (Pre-existing errors elsewhere are out of scope — note them but do not fix.)

- [ ] **Step 3: Commit**

```bash
git add src/components/common/LabItem.astro
git commit -m "feat: add LabItem component for landing page redesign"
```

---

## Task 2: Create `LabCell` component

**Files:**
- Create: `src/components/common/LabCell.astro`

`LabCell` is a quadrant of the grid: a mono `// label` header, an optional `all N →` link aligned right, and a default slot for `LabItem`s.

- [ ] **Step 1: Create the component file**

Write `src/components/common/LabCell.astro`:

```astro
---
export interface Props {
  label: string;        // e.g. "now building" — rendered as "// now building"
  allHref?: string;     // optional "all N →" link
  allLabel?: string;    // text for the all link, e.g. "all 14"
}
const {label, allHref, allLabel} = Astro.props;
---

<div class="py-7">
  <div class="flex items-baseline justify-between mb-4">
    <span class="font-mono text-[10.5px] text-stamp uppercase tracking-[0.15em]">// {label}</span>
    {allHref && allLabel && (
      <a href={allHref} class="font-mono text-[10px] text-text-muted hover:text-marker transition-colors">
        {allLabel} <span class="text-marker">→</span>
      </a>
    )}
  </div>
  <div>
    <slot />
  </div>
</div>
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx astro check`
Expected: 0 errors related to `LabCell.astro`.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/LabCell.astro
git commit -m "feat: add LabCell component for landing page redesign"
```

---

## Task 3: Create `LabHero` component

**Files:**
- Create: `src/components/common/LabHero.astro`

`LabHero` renders the kicker, the `samperalabs.` wordmark with orange period, and a tagline paragraph.

- [ ] **Step 1: Create the component file**

Write `src/components/common/LabHero.astro`:

```astro
---
export interface Props {
  kicker: string;   // e.g. "SAMPERALABS · NOTEBOOK · 2026-04"
  tagline: string;  // one-paragraph description of the lab
}
const {kicker, tagline} = Astro.props;
---

<section class="pt-16 pb-10">
  <div class="font-mono text-[11px] text-stamp tracking-[0.12em] mb-5">// {kicker}</div>
  <h1 class="font-display font-bold lowercase text-[56px] md:text-[88px] leading-[0.95] tracking-[-0.05em] text-text-strong">
    samperalabs<span class="text-marker">.</span>
  </h1>
  <p class="mt-6 text-[16px] md:text-[17px] leading-[1.55] text-text-muted max-w-xl">
    {tagline}
  </p>
</section>
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx astro check`
Expected: 0 errors related to `LabHero.astro`.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/LabHero.astro
git commit -m "feat: add LabHero component for landing page redesign"
```

---

## Task 4: Rewrite `src/pages/index.astro`

**Files:**
- Modify: `src/pages/index.astro` (full rewrite)

This is the integration step. The page:

1. Defines the four hardcoded TypeScript constants (`PROJECT_SLUGS`, `NOW_BUILDING`, `WORTH_FOLLOWING`, `TAGLINE`).
2. Fetches all published posts from the DB.
3. Looks up the project posts by slug from the fetched list and sorts them by `pub_date` desc.
4. Builds the recent writing list by **excluding** project slugs and taking the top 3.
5. Renders `LabHero`, then a `<div class="grid md:grid-cols-2 ...">` with four `LabCell`s, each holding the appropriate `LabItem`s.

The "kicker" uses the current year-month. Per the reviewer's recommendation, this is computed at request time (SSR) using `new Date()`.

- [ ] **Step 1: Replace the file contents**

Write `src/pages/index.astro`:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import LabHero from '../components/common/LabHero.astro';
import LabCell from '../components/common/LabCell.astro';
import LabItem from '../components/common/LabItem.astro';
import {getDB} from '../lib/db';

// --- Hardcoded content (edit me) ----------------------------------------

const TAGLINE =
  'A working lab on LLM orchestration and context management systems. ' +
  'Run by Bernat Sampera. Notes from putting AI into production software.';

const PROJECT_SLUGS = [
  'bleakai',
  'kronologs',
  'translateprompt',
  'packdensack',
  'bjjgym',
] as const;

const NOW_BUILDING: string[] = [
  'BleakAI v2 — eval suite for tool-calling agents',
  'OllamaGuard — CPU temp watchdog',
  'Note-taking pipeline that survives context windows',
];

type FollowingItem = {
  kind: 'person' | 'tool' | 'paper' | 'blog';
  name: string;
  href: string;
  why: string;
};

const WORTH_FOLLOWING: FollowingItem[] = [
  {
    kind: 'person',
    name: 'Simon Willison',
    href: 'https://simonwillison.net',
    why: 'Best running log of LLM tooling in the wild.',
  },
  {
    kind: 'tool',
    name: 'DSPy',
    href: 'https://dspy.ai',
    why: 'Structuring LLM programs so you can actually iterate.',
  },
  {
    kind: 'paper',
    name: '"Sleep-time compute"',
    href: 'https://arxiv.org/',
    why: 'Why offline reasoning is going to matter.',
  },
];

// --- DB queries ----------------------------------------------------------

const db = getDB();
const allPosts = db.getAllPosts();

const projectSlugSet = new Set<string>(PROJECT_SLUGS);

const projectPosts = allPosts
  .filter((p) => projectSlugSet.has(p.slug))
  .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());

const recentWriting = allPosts
  .filter((p) => !projectSlugSet.has(p.slug))
  .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime())
  .slice(0, 3);

const topProjects = projectPosts.slice(0, 3);
const allWritingCount = allPosts.length - projectPosts.length;

// --- Kicker date (request-time SSR) --------------------------------------

const now = new Date();
const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const kicker = `SAMPERALABS · NOTEBOOK · ${yearMonth}`;

const metadata = {
  title: 'Sampera Labs',
  description: 'A one-person lab on LLM orchestration and context management. Notes by Bernat Sampera.',
};
---

<PageLayout metadata={metadata}>
  <main class="mx-auto px-6 max-w-5xl">
    <LabHero kicker={kicker} tagline={TAGLINE} />

    <div class="grid md:grid-cols-2 md:gap-x-10 border-t border-ink-border-soft mt-4">
      <div class="border-b border-ink-border-soft md:border-r md:pr-10">
        <LabCell label="now building">
          {NOW_BUILDING.map((title) => (
            <LabItem variant="bulleted" title={title} />
          ))}
        </LabCell>
      </div>

      <div class="border-b border-ink-border-soft md:pl-10">
        <LabCell label="recent writing" allHref="/blog" allLabel={`all ${allWritingCount}`}>
          {recentWriting.map((post) => (
            <LabItem
              variant="dated"
              date={new Date(post.pub_date).toISOString().slice(0, 10)}
              title={post.title}
              excerpt={post.excerpt}
              href={`/posts/${post.slug}`}
            />
          ))}
        </LabCell>
      </div>

      <div class="border-b border-ink-border-soft md:border-r md:pr-10 md:border-b-0">
        <LabCell label="projects">
          {topProjects.map((post) => (
            <LabItem
              variant="bulleted"
              title={post.title}
              description={post.description ?? post.excerpt}
              href={`/posts/${post.slug}`}
            />
          ))}
        </LabCell>
      </div>

      <div class="md:pl-10">
        <LabCell label="worth following">
          {WORTH_FOLLOWING.map((f) => (
            <LabItem variant="linked" kind={f.kind} name={f.name} href={f.href} why={f.why} />
          ))}
        </LabCell>
      </div>
    </div>
  </main>
</PageLayout>
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx astro check`
Expected: 0 new errors. The file `src/pages/index.astro` should be clean. Pre-existing errors elsewhere are not in scope.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: rewrite homepage as lab status board"
```

---

## Task 5: Smoke test in dev

**Files:** None modified.

Manual visual verification per the spec's testing section.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server reports a local URL (typically `http://localhost:4321`).

- [ ] **Step 2: Verify the homepage renders correctly**

Open `http://localhost:4321/` in a browser and confirm:

- The wordmark `samperalabs.` is visible with an orange period.
- The kicker reads `// SAMPERALABS · NOTEBOOK · 2026-04`.
- The tagline paragraph appears below the wordmark.
- All four cells (Now Building, Recent Writing, Projects, Worth Following) render with content.
- The Recent Writing cell shows three posts that are **not** projects.
- The Projects cell shows up to three of: BleakAI, Kronologs, TranslatePrompt, PackDenSack, BJJ Gym.
- "all N →" link is visible on the Recent Writing cell only.
- "Worth following" rows show `↗` and have `target="_blank"`.

If any of these fail, fix in `src/pages/index.astro` or the appropriate component, then re-verify.

- [ ] **Step 3: Verify links work**

Click through:
- A Recent Writing row → lands on `/posts/<slug>`.
- A Project row → lands on `/posts/<slug>`.
- A Worth Following row → opens external URL in a new tab.
- The `all N →` on Recent Writing → lands on `/blog`.

- [ ] **Step 4: Verify mobile layout**

Resize the browser to ~375px wide (or use devtools mobile emulation):
- Wordmark scales down (uses `text-[56px]` at this width).
- Grid collapses to a single column — all four cells stack vertically.
- No horizontal scroll.
- Tagline reflows; no overflow.

- [ ] **Step 5: Run existing test suite as a regression check**

Run: `npm test`
Expected: existing vitest suite passes (no new tests were added; this is just to confirm nothing else broke).

- [ ] **Step 6: Final review of git log**

Run: `git log --oneline -5`
Expected: Four feature commits, one per task (LabItem, LabCell, LabHero, index.astro rewrite). No stray changes outside the four files in the File Structure table.

If everything is green, the redesign is complete.

---

## Edge cases handled

- **Missing project slug in DB**: filtered out by `projectSlugSet.has`; the cell silently shows fewer rows.
- **Fewer than 3 non-project posts**: `slice(0, 3)` returns whatever exists.
- **Project descriptions**: falls back to `excerpt` if `description` is null.
- **Mobile**: grid uses `md:grid-cols-2` so it stacks below the `md` breakpoint (768px).

## Out of scope (per spec)

- New `/projects` route
- Theme/token changes
- Image/asset wiring for project markdown
- Component-level unit tests
