# SamperaLabs Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Silent Edge" light theme with a dark "Working Notes" notebook identity, and collapse references / content-types / tags / side-pages into a single `post` content kind, per the design spec at `docs/superpowers/specs/2026-04-28-samperalabs-redesign-design.md`.

**Architecture:** Additive token swap — introduce new dark palette + JetBrains Mono in Tailwind/CSS without removing legacy tokens, then migrate pages one by one to the new tokens (so the build never breaks mid-flight), then delete the obsolete tokens, theme, components, pages, and DaisyUI in a final cleanup pass. Data migration runs once via a script that copies `refs` rows into `posts`; project case studies are seeded from hand-converted Markdown files.

**Tech Stack:** Astro 5 (SSR via Node adapter on Vercel), Tailwind CSS 3, `@tailwindcss/typography` for `prose`, Inter Variable + JetBrains Mono Variable, `marked` + `marked-highlight` + `highlight.js` for Markdown rendering, `better-sqlite3` for data, `vercel.json` for redirects.

> **IMPORTANT — commit policy:** This repo's `~/.claude/CLAUDE.md` says **"Do not do a commit if I don't ask for it explicitly."** The `git commit` step at the end of every task below MUST be skipped unless the user explicitly asks for the commit. Instead, the executor should announce the task is complete and pause for review. Treat the `commit` block in each task as the *commit message it would have used* — preserve the message text for when the user does ask.

---

## File-Structure Map

This plan touches the following files. Use this as a lookup before each task.

**Create (new):**
- `src/components/common/PostRow.astro` — listing row for home + blog index.
- `src/components/common/Hero.astro` — home page hero block.
- `src/components/common/Callout.astro` — `// note to self` margin callout.
- `src/components/common/Quote.astro` — pull-quote with optional `// MARGIN NOTE` byline.
- `src/components/common/CodeBlock.astro` — wraps `<pre>` with file-name header + copy button (used by code-block post-processor).
- `src/components/common/NextEntry.astro` — end-of-post next-link card.
- `src/components/common/Footer.astro` — replaces existing footer (current footer is `Footer.astro` in `elements/`; we'll edit that one in place rather than create a new one — see Task 5).
- `src/styles/post-render.css` — code-block + prose extensions consumed via `prose` overrides and `set:html` blocks.
- `scripts/migrate-references-to-posts.mjs` — one-time DB migration.
- `scripts/seed-project-posts.mjs` — one-time seed for the 5 project case studies.
- `scripts/project-posts/{bjjgym,bleakai,kronologs,packdensack,translateprompt}.md` — hand-converted Markdown source for the seed script.
- `tests/migrate-references-to-posts.test.mjs` — vitest test for migration logic.

**Modify:**
- `tailwind.config.cjs` — new color tokens, mono font, notebook bg utility; later remove DaisyUI + legacy tokens. **Note**: the existing config has a duplicate `plugins: [...]` declaration (two `plugins:` keys in the exported object). That's a pre-existing bug — do NOT propagate it; consolidate to a single `plugins` key the first time you touch the file.
- `src/assets/styles/tailwind.css` — the actual stylesheet (the spec said `src/index.css`; the real path is here). Used to bind any `:root` CSS variables we still want.
- `package.json` — add `@fontsource-variable/jetbrains-mono`; later remove `daisyui`.
- `src/layouts/Layout.astro` — load JetBrains Mono; apply `bg-ink bg-notebook` to `<body>`; remove the hard-coded `data-theme="lofi"` on the `<html>` tag.
- `src/navigation.js` — exports `headerData.links` and `footerData.links` consumed by `PageLayout.astro`. Edit the link arrays to the three new entries (writing → /blog, about → /about, contact → /contact).
- `src/layouts/PageLayout.astro` — palette swap + container width.
- `src/layouts/BlogLayout.astro` — strip TOC sidebar; switch to single-column 640px.
- `src/components/elements/Header.astro` — mono brand, three-link nav (writing/about/contact), orange-underline active.
- `src/components/elements/Footer.astro` — two-line mono treatment.
- `src/components/common/BlogSearch.astro` — mono input with `/` glyph.
- `src/components/Logo.astro` — replace SVG/img with mono text wordmark (or delete and inline).
- `src/pages/index.astro` — new home (Hero + 3 PostRows).
- `src/pages/blog.astro` — drop content-type filter, drop tag filter, drop chips, drop badges, drop load-more JS; use PostRow.
- `src/pages/posts/[slug].astro` — drop TOC + RelatedPosts; restyle prose; wire CodeBlock post-processor.
- `src/pages/about.astro` — restyle + absorb skills + experience content.
- `src/pages/contact.astro` — restyle.
- `src/pages/404.astro` — restyle.
- `src/lib/db.ts` — drop reference CRUD methods after migration; drop `refs` table init.
- `src/integrations/sitemap.ts` — verify still works (no code change expected).
- `db/schema.sql` — drop `refs` table after migration.
- `vercel.json` — add redirects array.
- `src/utils/utils.ts` — keep `getReadingTime`; drop `findRelatedPosts` if unused after task 14.
- `src/components/common/PostCard.astro` — delete after Task 12.
- `src/components/common/ReferenceCard.astro` — delete after Task 19.
- `src/components/common/RelatedPosts.astro` — delete after Task 14.
- `src/components/common/TableOfContents.astro`, `MobileTableOfContents.astro` — delete after Task 14.

**Delete (whole files / dirs):**
- `src/pages/references.astro`
- `src/pages/references/[slug].astro` (and `src/pages/references/` dir)
- `src/pages/api/references/` (whole dir, 3 files)
- `src/pages/skills.astro`
- `src/pages/experience.astro`
- `src/pages/widgets.astro`
- `src/pages/projects/{bjjgym,bleakai,kronologs,packdensack,translateprompt}.astro`
- `src/pages/tags/[tag].astro` (and `src/pages/tags/` dir)

**Out of scope:** `src/pages/admin/*` (admin keeps functional parity; minimal palette touch only as needed in Task 22).

---

## Execution Order

Phase 1 (Foundation) → Phase 2 (Components) → Phase 3 (Public pages) → Phase 4 (Migrations) → Phase 5 (Cleanup).

Tasks within a phase generally have no order dependency unless noted.

---

## Phase 1 — Foundation

### Task 1: Add JetBrains Mono and new design tokens (additive)

**Why first:** every subsequent task depends on the new tokens existing. We add them alongside the legacy `silentedge` theme so nothing breaks.

**Files:**
- Modify: `package.json`
- Modify: `tailwind.config.cjs`
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Install JetBrains Mono**

```bash
cd /Users/bsampera/Documents/projects/samperalabs
npm install @fontsource-variable/jetbrains-mono
```

Expected: package added under `dependencies`.

- [ ] **Step 2: Load JetBrains Mono in Layout**

In `src/layouts/Layout.astro`, locate the existing Inter import (search for `@fontsource-variable/inter`) and add a sibling line directly after it:

```astro
import '@fontsource-variable/jetbrains-mono';
```

- [ ] **Step 3: Add new tokens to `tailwind.config.cjs`**

**Pre-edit check:** open the file and confirm whether `plugins:` appears once or twice in the exported config object. If twice (current state), **merge them into a single `plugins: [...]`** as part of this task — keep `typographyPlugin` and `daisyui` for now (we remove DaisyUI in Task 20).

In `theme.extend.colors`, add the new tokens *without removing the existing ones*:

```js
ink: '#0d1117',
'ink-2': '#161b22',
'ink-3': '#060a10',
'ink-border': '#1f2630',
'ink-border-soft': 'rgba(149,168,194,0.16)',
text: '#d6e1f0',
'text-strong': '#f3f7ff',
'text-muted': '#95a8c2',
'text-faint': '#6b7a90',
stamp: '#6da0ff',
marker: '#f0a14a',
'marker-soft': 'rgba(240,161,74,0.07)',
'marker-soft-strong': 'rgba(240,161,74,0.14)',
```

In `theme.extend`, add a `fontFamily` block (or extend the existing one) with:

```js
fontFamily: {
  sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
  display: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
},
```

In `theme.extend`, add `backgroundImage` for the notebook grid:

```js
backgroundImage: {
  notebook:
    'repeating-linear-gradient(0deg, transparent 0 31px, rgba(80,120,180,0.06) 31px 32px),' +
    'repeating-linear-gradient(90deg, transparent 0 31px, rgba(80,120,180,0.06) 31px 32px)',
},
```

- [ ] **Step 4: Verify build still passes**

```bash
npm run build
```

Expected: build completes (it should, since changes are purely additive).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tailwind.config.cjs src/layouts/Layout.astro
git commit -m "feat(theme): add JetBrains Mono and new dark notebook tokens (additive)"
```

---

### Task 2: Apply ink background and grid to body, drop hard-coded theme

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Remove the hard-coded `data-theme`**

In `src/layouts/Layout.astro`, find the `<html ...>` opening tag — it currently has `data-theme="lofi"` (around line 23). Delete the `data-theme` attribute entirely. This was a DaisyUI light-theme override; we no longer want it.

- [ ] **Step 2: Apply new utility classes to `<body>`**

Find the `<body ...>` opening tag. Add `bg-ink bg-notebook text-text font-sans antialiased min-h-screen` to the body's class list. Remove any prior `bg-background` / `text-foreground` classes if present.

- [ ] **Step 3: Verify in dev**

```bash
npm run dev
```

Open http://localhost:4321/. Expected: page background is now near-black (`#0d1117`) with a faint blue 32px grid; existing white components on top still render but stand out (we'll fix them in later tasks).

- [ ] **Step 4: Stop dev server and commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat(layout): apply ink background and notebook grid; drop lofi theme"
```

---

## Phase 2 — Shared Components

### Task 3: Restyle Header and consolidate nav

**Files:**
- Modify: `src/navigation.js`
- Modify: `src/components/elements/Header.astro`

- [ ] **Step 1: Update the nav data source**

Open `src/navigation.js`. It exports `headerData` (and likely `footerData`). The current `headerData.links` has multiple entries (about/blog/references/etc.). Replace `headerData.links` with exactly:

```js
links: [
  { text: 'writing', href: '/blog' },
  { text: 'about',   href: '/about' },
  { text: 'contact', href: '/contact' },
],
```

If `footerData.links` exists, either set it to the same three entries or to an empty array (the new footer in Task 4 doesn't render a link grid).

- [ ] **Step 2: Replace `Header.astro` body**

Replace the file's template with:

```astro
---
import {getHomePermalink} from '~/utils/permalinks';

interface Link { text?: string; href?: string; }
export interface Props { links?: Array<Link>; isSticky?: boolean; }

const {links = [], isSticky = false} = Astro.props;
const currentPath = new URL(Astro.url).pathname;

function isActive(href?: string): boolean {
  if (!href) return false;
  if (currentPath === href) return true;
  if (href === '/blog' && (currentPath.startsWith('/posts') || currentPath.startsWith('/blog'))) return true;
  if (href === '/about' && currentPath.startsWith('/about')) return true;
  return false;
}
---

<header
  class:list={[
    {sticky: isSticky, relative: !isSticky},
    'top-0 z-40 w-full border-b border-ink-border bg-ink/85 backdrop-blur-sm',
    'transition-all ease-in-out',
  ]}
  {...isSticky ? {'data-sticky-header': true} : {}}
>
  <div class="mx-auto px-6 py-4 max-w-5xl flex justify-between items-center">
    <a href={getHomePermalink()} class="font-mono text-xs tracking-wide text-text-muted hover:text-text-strong transition-colors">
      <span class="text-text-faint">// </span><span class="text-text-strong font-bold">samperalabs</span>
    </a>
    <nav>
      <ul class="flex space-x-7 text-sm text-text-muted">
        {links.map(({text, href}) => (
          <li>
            <a
              href={href}
              class:list={[
                'transition-colors hover:text-text-strong',
                isActive(href) ? 'text-text-strong border-b-2 border-marker pb-1' : '',
              ]}
            >{text}</a>
          </li>
        ))}
      </ul>
    </nav>
  </div>
</header>
```

- [ ] **Step 3: Verify in dev**

```bash
npm run dev
```

Visit `/`, `/blog`, `/about`. Header should show mono `// samperalabs` brand, three links, orange underline on the active route.

- [ ] **Step 4: Commit**

```bash
git add src/navigation.js src/components/elements/Header.astro
git commit -m "feat(header): mono brand and three-link nav with marker underline"
```

---

### Task 4: Restyle Footer

**Files:**
- Modify: `src/components/elements/Footer.astro`

- [ ] **Step 1: Read the current footer to understand existing imports**

Read `src/components/elements/Footer.astro` and note any imports (especially `SocialFollow`).

- [ ] **Step 2: Replace footer body**

Note: this site is server-rendered (Vercel SSR via Node adapter), so `new Date()` evaluates at request time — that's fine. If the deployment is ever switched to fully static output, replace the `lastBuild` literal with a build-time stamp (e.g. via `import.meta.env` injection in `astro.config.mjs`).

Replace the template with:

```astro
---
import SocialFollow from '~/components/ui/SocialFollow.astro';

const lastBuild = new Date().toISOString().slice(0, 10);
---

<footer class="border-t border-ink-border mt-24">
  <div class="mx-auto px-6 py-10 max-w-5xl text-text-faint font-mono text-xs leading-relaxed">
    <div><span class="text-text-faint">// </span>samperalabs · since 2024</div>
    <div><span class="text-text-faint">// </span>last updated {lastBuild}</div>
    <div class="mt-4">
      <SocialFollow mode="minimal" />
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Verify in dev**

Reload any page; footer should render two mono lines + the social links.

- [ ] **Step 4: Commit**

```bash
git add src/components/elements/Footer.astro
git commit -m "feat(footer): two-line mono treatment with auto-stamp"
```

---

### Task 5: Build `PostRow.astro`

**Files:**
- Create: `src/components/common/PostRow.astro`

- [ ] **Step 1: Create the file**

Write to `src/components/common/PostRow.astro`:

```astro
---
import type {EnhancedPost} from '../../lib/db';

export interface Props {
  post: EnhancedPost;
  showArrow?: boolean;
}
const {post, showArrow = false} = Astro.props;

const date = new Date(post.pub_date).toISOString().slice(0, 10);
---

<a
  href={`/posts/${post.slug}`}
  class="grid grid-cols-[100px_1fr_auto] gap-5 items-baseline py-4 border-t border-ink-border-soft hover:bg-marker-soft transition-colors"
>
  <time class="font-mono text-[10.5px] text-stamp pt-1 tracking-wide">{date}</time>
  <div>
    <div class="text-[18px] font-semibold text-text-strong leading-snug tracking-tight">{post.title}</div>
    {post.excerpt && (
      <p class="text-[13px] text-text-muted mt-1 leading-relaxed">{post.excerpt}</p>
    )}
  </div>
  <div class="font-mono text-[10.5px] text-text-faint whitespace-nowrap">
    {showArrow ? <span class="text-marker">→</span> : `${post.readingTime} min`}
  </div>
</a>
```

- [ ] **Step 2: Verify it imports cleanly**

```bash
npx astro check 2>&1 | grep -i "PostRow\|error" | head -20
```

Expected: no errors referencing `PostRow.astro`. (If `astro check` is slow or absent, skip this step — Task 11/12 will exercise the component.)

- [ ] **Step 3: Commit**

```bash
git add src/components/common/PostRow.astro
git commit -m "feat(components): PostRow for listings"
```

---

### Task 6: Build `Hero.astro`

**Files:**
- Create: `src/components/common/Hero.astro`

- [ ] **Step 1: Create the file**

```astro
---
export interface Props {
  kicker?: string;
  title: string;       // raw text; the period is injected by the component
  intro?: string;      // optional lede paragraph (sentence or two)
  highlight?: string;  // optional substring of `title` to colour with marker
}
const {kicker, title, intro, highlight} = Astro.props;

let before = title, mid = '', after = '';
if (highlight && title.includes(highlight)) {
  const idx = title.indexOf(highlight);
  before = title.slice(0, idx);
  mid = highlight;
  after = title.slice(idx + highlight.length);
}
---

<section class="pt-12 pb-8">
  {kicker && (
    <div class="font-mono text-[10.5px] text-stamp tracking-wider mb-3">// {kicker}</div>
  )}
  <h1 class="font-display font-bold lowercase text-[78px] leading-[0.9] tracking-[-0.05em] text-text-strong">
    {before}{mid && <em class="not-italic text-marker">{mid}</em>}{after}<span class="text-marker">.</span>
  </h1>
  {intro && (
    <p class="mt-5 text-[16px] leading-[1.55] text-text max-w-xl">{intro}</p>
  )}
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/common/Hero.astro
git commit -m "feat(components): Hero block for home page"
```

---

### Task 7: Build `Callout.astro`, `Quote.astro`, `NextEntry.astro`

**Files:**
- Create: `src/components/common/Callout.astro`
- Create: `src/components/common/Quote.astro`
- Create: `src/components/common/NextEntry.astro`

- [ ] **Step 1: Write `Callout.astro`**

```astro
---
export interface Props { label?: string; }
const {label = 'note to self'} = Astro.props;
---
<div class="my-6 px-4 py-3 bg-marker-soft border-l-[3px] border-marker font-mono text-[12px] text-text leading-relaxed">
  <span class="text-marker">// {label}</span> — <slot />
</div>
```

- [ ] **Step 2: Write `Quote.astro`**

```astro
---
export interface Props { who?: string; }
const {who} = Astro.props;
---
<blockquote class="my-7 pl-5 border-l-[3px] border-marker text-[17px] italic leading-snug text-text-strong">
  <slot />
  {who && (
    <span class="block not-italic font-mono text-[11px] text-stamp mt-2 tracking-wide">// {who}</span>
  )}
</blockquote>
```

- [ ] **Step 3: Write `NextEntry.astro`**

```astro
---
import type {EnhancedPost} from '../../lib/db';
export interface Props { post: EnhancedPost | null | undefined; }
const {post} = Astro.props;
---
{post && (
  <a
    href={`/posts/${post.slug}`}
    class="mt-4 grid grid-cols-[1fr_auto] gap-3 items-center border border-ink-border-soft rounded-lg px-5 py-4 hover:border-marker transition-colors"
  >
    <div>
      <div class="font-mono text-[10.5px] text-stamp tracking-wide">// next entry</div>
      <h4 class="text-[15px] text-text-strong font-semibold mt-1">{post.title}</h4>
    </div>
    <span class="font-mono text-marker">→</span>
  </a>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/common/Callout.astro src/components/common/Quote.astro src/components/common/NextEntry.astro
git commit -m "feat(components): Callout, Quote, NextEntry"
```

---

### Task 8: Build the code-block post-processor (`CodeBlock` styling)

**Why this is a separate task:** posts are rendered from Markdown via `marked` + `marked-highlight` in `src/pages/posts/[slug].astro`. The HTML output is `<pre><code class="hljs language-X">…</code></pre>`. We need to inject our file-name header + copy button without rewriting the renderer.

The cleanest approach (chosen here): a small post-render string transform that wraps every `<pre>...</pre>` with our chrome. Filename is parsed from a leading comment line in the code body if present (e.g. `// orchestrator.ts`), otherwise the chrome shows the language only. Copy is wired client-side via a global script in `Layout.astro`.

**Note:** this task only ships the wrap utility, the global copy script, and the CSS. The actual integration into `[slug].astro` happens in Task 12, which fully replaces that file.

**Files:**
- Create: `src/utils/codeBlockWrap.ts`
- Modify: `src/layouts/Layout.astro` (inject global copy-button script + import the CSS)
- Create: `src/styles/post-render.css`

- [ ] **Step 1: Write `src/utils/codeBlockWrap.ts`**

```ts
/**
 * Wrap each <pre>…</pre> emitted by marked-highlight with a header bar
 * (filename or language) and a copy button. Idempotent — won't re-wrap
 * already-wrapped blocks.
 */
const PRE_RE = /<pre>(<code class="hljs language-([^"]+)">)([\s\S]*?)<\/code><\/pre>/g;

export function wrapCodeBlocks(html: string): string {
  return html.replace(PRE_RE, (_full, openTag, lang, body) => {
    const m = String(body).match(/^\s*(?:<span [^>]*>)*\s*\/\/\s*([^\n<]+?)\s*(?:<\/span>)*\n/);
    const filename = m ? m[1].trim() : lang;
    return (
      `<div class="codewrap">` +
        `<div class="codehead">` +
          `<span class="filename">${escapeHtml(filename)}</span>` +
          `<button type="button" class="copy" data-copy aria-label="Copy code">copy</button>` +
        `</div>` +
        `<pre>${openTag}${body}</code></pre>` +
      `</div>`
    );
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]!
  ));
}
```

- [ ] **Step 2: Add the global copy script to `Layout.astro`**

Append before the closing `</body>` of `Layout.astro`:

```astro
<script>
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (!t || !t.matches('button[data-copy]')) return;
    const wrap = t.closest('.codewrap');
    const code = wrap?.querySelector('pre code');
    if (!code) return;
    navigator.clipboard.writeText(code.textContent ?? '').then(() => {
      const prev = t.textContent;
      t.textContent = 'copied';
      setTimeout(() => { t.textContent = prev; }, 1200);
    });
  });
</script>
```

- [ ] **Step 3: Add `post-render.css`**

Create `src/styles/post-render.css`:

```css
.codewrap {
  background: #060a10;
  border: 1px solid #1f2630;
  border-radius: 6px;
  margin: 1.5rem 0;
  overflow: hidden;
}
.codewrap .codehead {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 12px;
  background: #0a0f17;
  border-bottom: 1px solid #1f2630;
  font-family: 'JetBrains Mono Variable', 'JetBrains Mono', monospace;
  font-size: 10.5px; color: #6b7a90;
}
.codewrap .codehead .copy { background: none; border: 0; color: #6da0ff; font: inherit; cursor: pointer; }
.codewrap .codehead .copy:hover { color: #f0a14a; }
.codewrap pre { margin: 0; padding: 14px 16px; font: 12.5px/1.65 'JetBrains Mono Variable', 'JetBrains Mono', monospace; color: #d6e1f0; overflow-x: auto; background: transparent; }
```

Import it from `Layout.astro` (frontmatter):

```astro
import '../styles/post-render.css';
```

- [ ] **Step 4: Verify CSS loads without errors**

```bash
npm run dev
```

Visit any page (e.g. `/`). The new CSS file is loaded but won't visibly do anything yet — the wrapping happens in Task 12 when `[slug].astro` is rewritten. We're just confirming no Tailwind / Astro build errors.

- [ ] **Step 5: Commit**

```bash
git add src/utils/codeBlockWrap.ts src/layouts/Layout.astro src/styles/post-render.css
git commit -m "feat(post): code-block wrap utility, copy script, and prose CSS"
```

---

### Task 9: Rewrite `BlogSearch.astro` as a row-filter

**Why a full rewrite:** the current `BlogSearch.astro` renders a separate dropdown panel and consumes `tags`, `readingTime`, and `contentType` from each `[data-post-data]` element. Task 11 reduces the data shape and removes the chip/badge UI, which would break the dropdown. Per spec §6.4, the new behavior is a simple inline row-filter on `[data-post-data]` entries — hide non-matching, show matching. No dropdown.

**Files:**
- Modify (full replace): `src/components/common/BlogSearch.astro`

- [ ] **Step 1: Replace the file with the row-filter version**

```astro
---
// Mono search input that filters [data-post-data] rows in #posts-grid by title or excerpt.
---

<div class="flex items-center gap-2 max-w-sm border border-ink-border-soft rounded font-mono text-[11px] text-text-muted px-3 py-2 focus-within:border-marker">
  <span class="text-stamp">/</span>
  <input
    id="blog-search"
    type="search"
    placeholder="search…"
    autocomplete="off"
    class="bg-transparent outline-none flex-1 text-text-strong placeholder:text-text-faint"
  />
</div>

<script>
  const input = document.getElementById('blog-search') as HTMLInputElement | null;
  if (input) {
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      const items = document.querySelectorAll<HTMLElement>('[data-post-data]');
      items.forEach((el) => {
        if (!q) { el.style.display = ''; return; }
        let data: { title?: string; excerpt?: string } = {};
        try { data = JSON.parse(el.dataset.postData || '{}'); } catch {}
        const hay = `${data.title ?? ''} ${data.excerpt ?? ''}`.toLowerCase();
        el.style.display = hay.includes(q) ? '' : 'none';
      });
    };
    input.addEventListener('input', apply);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.activeElement === input) {
        input.value = ''; apply();
      }
    });
  }
</script>
```

- [ ] **Step 2: Verify in dev**

Open `/blog` (it still renders with the old `blog.astro` until Task 11). Typing in the search box may not filter yet because the old listing wraps each card in `[data-post-data]` rows — that should be fine since the data shape includes `title` and `excerpt`. After Task 11 ships the new index, the filter will work end-to-end.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/BlogSearch.astro
git commit -m "feat(search): mono row-filter input (replaces dropdown)"
```

---

## Phase 3 — Public Pages

### Task 10: Rewrite Home `/`

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace file body**

Replace `src/pages/index.astro` with:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import Hero from '../components/common/Hero.astro';
import PostRow from '../components/common/PostRow.astro';
import {getDB} from '../lib/db';

const db = getDB();
const recent = db.getAllPosts()
  .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime())
  .slice(0, 3);

const today = new Date().toISOString().slice(0, 10);

const metadata = {
  title: 'Sampera Labs',
  description: 'Working notes on AI integration by Bernat Sampera.',
};
---

<PageLayout metadata={metadata}>
  <main class="mx-auto px-6 max-w-5xl">
    <Hero
      kicker={`notebook · ${today}`}
      title="working notes on ai integration"
      highlight="notes"
      intro="I'm Bernat Sampera. I build software that uses LLMs in production — and I write down what I figure out along the way. Mostly evals, glue code, and the wrappers around the wrappers."
    />

    <div class="font-mono text-[10.5px] text-stamp tracking-wider uppercase mt-10 mb-1">// recent</div>
    <div>
      {recent.map((post) => <PostRow post={post} />)}
    </div>

    <a href="/blog" class="mt-8 inline-block font-mono text-[12px] text-stamp hover:text-marker transition-colors">
      // see all writing <span class="text-marker">→</span>
    </a>
  </main>
</PageLayout>
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```

Visit `/`. Expected: bold lowercase hero with orange "notes" + period, three dated rows, "see all writing →" CTA below.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): new hero + recent-entries layout"
```

---

### Task 11: Rewrite Blog Index `/blog`

**Files:**
- Modify: `src/pages/blog.astro`

- [ ] **Step 1: Replace file body**

Replace `src/pages/blog.astro` with:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import PostRow from '../components/common/PostRow.astro';
import BlogSearch from '../components/common/BlogSearch.astro';
import {getDB} from '../lib/db';

const db = getDB();
const posts = db.getAllPosts()
  .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());

const metadata = {
  title: 'Writing | Sampera Labs',
  description: 'All writing — essays, notes, and references.',
};
---

<PageLayout metadata={metadata}>
  <main class="mx-auto px-6 max-w-5xl">
    <header class="pt-12 pb-2 flex items-end justify-between gap-6">
      <h1 class="font-display font-bold lowercase text-[64px] leading-[0.9] tracking-[-0.045em] text-text-strong">
        writing<span class="text-marker">.</span>
      </h1>
      <div class="font-mono text-[11px] text-text-faint">{posts.length} entries</div>
    </header>

    <div class="mt-5 mb-2">
      <BlogSearch />
    </div>

    <div id="posts-grid">
      {posts.map((post) => (
        <div data-post-data={JSON.stringify({ id: post.id, title: post.title, excerpt: post.excerpt, slug: post.slug })}>
          <PostRow post={post} />
        </div>
      ))}
    </div>

    <div id="new-post-button" class="mt-8 hidden">
      <a href="/admin/new-post" class="font-mono text-[12px] text-stamp hover:text-marker">// + new post</a>
    </div>
  </main>
</PageLayout>

<script>
  // Admin "new post" affordance — preserved from prior version
  if (localStorage.getItem('isAdmin') === 'true') {
    document.getElementById('new-post-button')?.classList.remove('hidden');
  }
</script>
```

Notes:
- The `data-post-data` attribute on each row is preserved so the existing client-side search JS in `BlogSearch.astro` keeps working without modification.
- All filter chips, content-type filtering, tag filtering, and load-more JS are intentionally removed.

- [ ] **Step 2: Verify in dev**

Visit `/blog`. Expected: bold `writing.` headline, mono entry count, search input, single column of dated rows. No filter chips, no badges, no tag pills.

- [ ] **Step 3: Test search still filters**

Type a substring of a known post title. Expected: non-matching rows hide.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog.astro
git commit -m "feat(blog): single-column index, drop filters and load-more"
```

---

### Task 12: Rewrite Post Reading View `/posts/[slug]`

**Files:**
- Modify: `src/pages/posts/[slug].astro`
- Modify: `src/layouts/BlogLayout.astro`

- [ ] **Step 1: Rewrite `BlogLayout.astro`**

Replace the layout body with:

```astro
---
import Layout from './PageLayout.astro';
import type {MetaData} from '~/types';

export interface Props {
  metadata?: MetaData;
  post?: {
    title: string;
    author: string;
    pub_date: string;
    description?: string;
    content: string;
  };
}
const {metadata = {}, post} = Astro.props;

const dateISO = post ? new Date(post.pub_date).toISOString().slice(0, 10) : '';

import {getReadingTime} from '../utils/utils';
const minutes = post ? getReadingTime(post.content) : 0;
---

<Layout metadata={metadata}>
  <main class="mx-auto px-6 pt-10 pb-24 max-w-[680px]">
    {post && (
      <header class="mb-10">
        <a href="/blog" class="font-mono text-[11px] text-stamp tracking-wide hover:text-marker transition-colors">
          <span class="text-marker">←</span> all writing
        </a>
        <div class="mt-7 font-mono text-[11px] text-stamp tracking-wide">
          {dateISO} <span class="text-ink-border mx-1">·</span> {minutes} MIN READ
        </div>
        <h1 class="mt-3 font-display font-bold text-[42px] leading-[1.04] tracking-[-0.025em] text-text-strong">
          {post.title}
        </h1>
        {post.description && (
          <p class="mt-4 italic text-[18px] leading-[1.55] text-text">
            <span class="not-italic text-marker">—  </span>{post.description}
          </p>
        )}
      </header>
    )}

    <article class="post-prose">
      <slot />
    </article>
  </main>
</Layout>
```

- [ ] **Step 2: Rewrite `[slug].astro`**

Replace `src/pages/posts/[slug].astro` with:

```astro
---
import BlogLayout from '../../layouts/BlogLayout.astro';
import NextEntry from '../../components/common/NextEntry.astro';
import {getDB} from '../../lib/db';
import {Marked} from 'marked';
import {markedHighlight} from 'marked-highlight';
import {preprocessMarkdownContent} from '../../utils/markdown';
import {addHeadingIds} from '../../utils/tableOfContents';
import {wrapCodeBlocks} from '../../utils/codeBlockWrap';
import hljs from 'highlight.js';

export async function getStaticPaths() {
  const db = getDB();
  return db.getAllPosts().map((post) => ({ params: {slug: post.slug} }));
}

const {slug} = Astro.params;
const db = getDB();
const post = db.getPostBySlug(slug ?? '');
if (!post) return Astro.redirect('/404');

const allPosts = db.getAllPosts()
  .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());
const idx = allPosts.findIndex((p) => p.slug === post.slug);
const next = idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, {language}).value;
    },
  })
);

let html = await marked.parse(preprocessMarkdownContent(post.content));
html = addHeadingIds(html);
html = wrapCodeBlocks(html);

const metadata = { title: post.title, description: post.description };
---

<BlogLayout metadata={metadata} post={post}>
  <div class="post-prose" set:html={html} />

  <div class="mt-14 mb-7 text-center font-mono text-[13px] text-marker tracking-[0.3em]">·  ·  ·</div>

  <NextEntry post={next} />

  <footer id="admin-actions" class="mt-12 pt-6 border-t border-ink-border-soft hidden">
    <div class="flex gap-4 font-mono text-[11px]">
      <a href={`/admin/edit-post/${post.id}`} class="text-stamp hover:text-marker">// edit</a>
      <button id="delete-btn" type="button" data-post-id={post.id} data-post-title={post.title} class="text-marker hover:text-red-400">// delete</button>
    </div>
  </footer>
</BlogLayout>

<script>
  if (localStorage.getItem('isAdmin') === 'true') {
    document.getElementById('admin-actions')?.classList.remove('hidden');
  }
  document.getElementById('delete-btn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const postId = btn.dataset.postId;
    const postTitle = btn.dataset.postTitle;
    if (!postId) return;
    if (!confirm(`Delete "${postTitle}"? This cannot be undone.`)) return;
    const apiKey = localStorage.getItem('BLOG_API_KEY');
    if (!apiKey) { alert('Not signed in. Log in at /admin and try again.'); return; }
    const r = await fetch(`/api/posts/${postId}`, { method: 'DELETE', headers: {Authorization: `Bearer ${apiKey}`} });
    if (r.ok) { window.location.href = '/blog'; } else { const err = await r.json(); alert(`Error deleting post: ${err.error}`); }
  });
</script>
```

Notes:
- TOC sidebar (`TableOfContents`, `MobileTableOfContents`) and `RelatedPosts` are intentionally not imported — they will be deleted in Task 19.
- `NextEntry` shows the next-older post by date; if there is none, the component renders nothing.

- [ ] **Step 3: Extend `src/styles/post-render.css` with `.post-prose` rules**

We deliberately use a custom `.post-prose` class **instead of** `@tailwindcss/typography`'s `prose` class, so the markup never has to fight Tailwind Typography's defaults. Do **not** add a `theme.extend.typography` block — it would only apply to elements with `class="prose"`, which we don't use.

Append the following rules to `src/styles/post-render.css`:

```css
.post-prose { max-width: 640px; }
.post-prose { color: #d6e1f0; line-height: 1.72; font-size: 16px; }
.post-prose strong { color: #f3f7ff; font-weight: 600; }
.post-prose p { margin: 0 0 22px; }
.post-prose h2 { position: relative; padding-left: 14px; margin: 40px 0 14px; font-size: 22px; font-weight: 800; letter-spacing: -0.01em; color: #f3f7ff; }
.post-prose h2::before { content: ""; position: absolute; left: 0; top: 8px; width: 6px; height: 18px; background: #f0a14a; }
.post-prose a { color: #f3f7ff; text-decoration: none; background-image: linear-gradient(transparent 92%, #f0a14a 92%); }
.post-prose code:not(pre code) { background: #1a2230; color: #f3f7ff; padding: 1px 6px; border-radius: 3px; font: 13px/1 'JetBrains Mono Variable', monospace; }
.post-prose blockquote { margin: 28px 0; padding: 4px 0 4px 18px; border-left: 3px solid #f0a14a; font-style: italic; font-size: 17px; line-height: 1.5; color: #f3f7ff; }
.post-prose hr { border: 0; border-top: 1px solid #1f2630; margin: 32px 0; }
.post-prose ul, .post-prose ol { margin: 0 0 22px 1.25rem; }
.post-prose li { margin-bottom: 6px; }
```

- [ ] **Step 4: Remove redundant Tailwind `typography` extension if you added one earlier**

If a previous task accidentally added `theme.extend.typography` to `tailwind.config.cjs`, remove it. Only `.post-prose` styles in CSS should drive the article body.

- [ ] **Step 5: Verify in dev**

Visit any post URL (e.g. `/posts/<known-slug>`). Expected: single-column 640px, bold title, italic lede with orange em-dash, headings with orange notch, code blocks with header bar, end-rule dots, next-entry card, no TOC sidebar.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BlogLayout.astro 'src/pages/posts/[slug].astro' src/styles/post-render.css
git commit -m "feat(post): single-column reading view with notebook prose"
```

---

### Task 13: Restyle About + absorb skills + experience

**Files:**
- Modify: `src/pages/about.astro`
- Read (no modify): `src/pages/skills.astro`, `src/pages/experience.astro` — copy content into the new about page.

- [ ] **Step 1: Read existing source content**

Read all three files. Identify the actual content (bio paragraphs in `about.astro`, skill list in `skills.astro`, experience timeline in `experience.astro`). The visual structure is irrelevant; we keep only the text.

- [ ] **Step 2: Rewrite `about.astro`**

Replace with:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';

const metadata = {
  title: 'About | Sampera Labs',
  description: 'About Bernat Sampera.',
};
---

<PageLayout metadata={metadata}>
  <main class="mx-auto px-6 max-w-[680px]">
    <header class="pt-12 pb-2">
      <h1 class="font-display font-bold lowercase text-[64px] leading-[0.9] tracking-[-0.045em] text-text-strong">
        about<span class="text-marker">.</span>
      </h1>
    </header>

    <article class="post-prose mt-8">
      <!-- BIO copied from previous about.astro -->
      <p>…paragraphs here…</p>

      <h2>Skills</h2>
      <ul>
        <!-- list copied from skills.astro -->
      </ul>

      <h2>Experience</h2>
      <!-- timeline copied from experience.astro, rendered as dated rows or list items -->
    </article>
  </main>
</PageLayout>
```

Manually paste the verbatim content from the old pages into the placeholders. Do not rewrite — preserve voice.

- [ ] **Step 3: Verify in dev**

Visit `/about`. Expected: same calm reading style as posts, with `about.` headline, bio + skills + experience sections.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat(about): restyle and absorb skills + experience content"
```

---

### Task 14: Restyle Contact and 404

**Files:**
- Modify: `src/pages/contact.astro`
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Rewrite `contact.astro`**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import SocialFollow from '~/components/ui/SocialFollow.astro';

const metadata = { title: 'Contact | Sampera Labs' };
---

<PageLayout metadata={metadata}>
  <main class="mx-auto px-6 max-w-[680px]">
    <header class="pt-12 pb-2">
      <h1 class="font-display font-bold lowercase text-[64px] leading-[0.9] tracking-[-0.045em] text-text-strong">
        contact<span class="text-marker">.</span>
      </h1>
    </header>
    <article class="post-prose mt-6">
      <p>Email: <a href="mailto:bernat@samperalabs.com">bernat@samperalabs.com</a></p>
      <p>Or find me here:</p>
      <SocialFollow mode="maximal" />
    </article>
  </main>
</PageLayout>
```

(If the existing email differs, copy it verbatim from the current contact page.)

- [ ] **Step 2: Rewrite `404.astro`**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
const metadata = { title: '404 | Sampera Labs' };
---
<PageLayout metadata={metadata}>
  <main class="mx-auto px-6 max-w-[680px] min-h-[60vh] flex flex-col justify-center">
    <div class="font-mono text-[11px] text-stamp tracking-wide">// HTTP 404</div>
    <h1 class="mt-3 font-display font-bold lowercase text-[64px] leading-[0.9] tracking-[-0.045em] text-text-strong">
      not here<span class="text-marker">.</span>
    </h1>
    <p class="mt-4 text-text">This page doesn't exist. Try <a class="underline decoration-marker decoration-2 underline-offset-4" href="/blog">writing</a>.</p>
  </main>
</PageLayout>
```

- [ ] **Step 3: Verify in dev**

Visit `/contact` and a known-bad URL (e.g. `/zzz`). Both render in the new style.

- [ ] **Step 4: Commit**

```bash
git add src/pages/contact.astro src/pages/404.astro
git commit -m "feat(pages): restyle contact and 404"
```

---

## Phase 4 — Migrations

### Task 15: Migrate references → posts (TDD)

**Files:**
- Create: `tests/migrate-references-to-posts.test.mjs`
- Create: `scripts/migrate-references-to-posts.mjs`

This task is genuinely TDD-able because the migration is pure data transformation.

**DB path note:** the local SQLite database lives at `scripts/manage-sqlite/content.db` (this is the path `getDB()` in `src/lib/db.ts` resolves at runtime — verify by reading `src/lib/db.ts` before running). There is also a stale `db/content.db` next to `db/schema.sql`; do NOT migrate into that one or the running app won't see the new rows.

- [ ] **Step 1: Write the failing test**

Create `tests/migrate-references-to-posts.test.mjs`:

```js
import {test, expect} from 'vitest';
import Database from 'better-sqlite3';
import {migrateReferencesToPosts} from '../scripts/migrate-references-to-posts.mjs';

function freshDb() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, author TEXT NOT NULL, description TEXT,
      image_url TEXT, image_alt TEXT, pub_date TEXT NOT NULL,
      tags TEXT, content TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'published', published_at TEXT, deleted_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE refs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, description TEXT, format TEXT NOT NULL DEFAULT 'markdown',
      tags TEXT, content TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT '2025-01-15T00:00:00Z',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}

test('migrates every refs row into posts with correct mapping', () => {
  const db = freshDb();
  db.prepare(`INSERT INTO refs (title, description, format, tags, content, slug, created_at) VALUES (?,?,?,?,?,?,?)`)
    .run('A Ref', 'desc', 'markdown', '["x"]', '# hi', 'a-ref', '2025-01-15T00:00:00Z');

  const result = migrateReferencesToPosts(db);

  expect(result.migrated).toBe(1);
  const row = db.prepare(`SELECT * FROM posts WHERE slug = 'a-ref'`).get();
  expect(row).toBeTruthy();
  expect(row.title).toBe('A Ref');
  expect(row.description).toBe('desc');
  expect(row.content).toBe('# hi');
  expect(row.author).toBe('Bernat Sampera');
  expect(row.status).toBe('published');
  expect(row.tags).toBe('["x"]');
  expect(row.pub_date).toBe('2025-01-15T00:00:00Z');
  expect(row.published_at).toBe('2025-01-15T00:00:00Z');
});

test('appends -ref to slug on collision', () => {
  const db = freshDb();
  db.prepare(`INSERT INTO posts (title, author, pub_date, content, slug) VALUES ('Existing','x','2024-01-01','c','dup')`).run();
  db.prepare(`INSERT INTO refs (title, content, slug) VALUES ('Dup','# r','dup')`).run();

  migrateReferencesToPosts(db);

  expect(db.prepare(`SELECT slug FROM posts WHERE title='Dup'`).get().slug).toBe('dup-ref');
});

test('is idempotent — second run migrates zero (skips by title+content match)', () => {
  const db = freshDb();
  db.prepare(`INSERT INTO refs (title, content, slug) VALUES ('A','c','a')`).run();
  expect(migrateReferencesToPosts(db).migrated).toBe(1);
  expect(migrateReferencesToPosts(db).migrated).toBe(0);
});
```

- [ ] **Step 2: Add vitest if not already a dev dep**

```bash
npm install -D vitest better-sqlite3
```

(The project already uses `better-sqlite3` at runtime; the `-D` install is harmless; vitest is added if missing.)

Add to `package.json` `scripts` if missing: `"test": "vitest run"`.

- [ ] **Step 3: Run test, expect FAIL**

```bash
npx vitest run tests/migrate-references-to-posts.test.mjs
```

Expected: failure — `migrateReferencesToPosts` not found / file missing.

- [ ] **Step 4: Implement the script**

Create `scripts/migrate-references-to-posts.mjs`:

```js
import Database from 'better-sqlite3';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export function migrateReferencesToPosts(db) {
  const refs = db.prepare(`SELECT * FROM refs`).all();
  const insert = db.prepare(`
    INSERT INTO posts (title, author, description, pub_date, tags, content, slug, status, published_at, created_at)
    VALUES (@title, @author, @description, @pub_date, @tags, @content, @slug, 'published', @published_at, @created_at)
  `);
  const slugExists = db.prepare(`SELECT 1 FROM posts WHERE slug = ?`);
  // Idempotency guard: if a post with the same title AND content already exists,
  // we treat the ref as already migrated.
  const sameContentExists = db.prepare(`SELECT 1 FROM posts WHERE title = ? AND content = ?`);

  let migrated = 0;
  const tx = db.transaction(() => {
    for (const r of refs) {
      if (sameContentExists.get(r.title, r.content)) continue;
      let slug = r.slug;
      if (slugExists.get(slug)) slug = `${slug}-ref`;
      if (slugExists.get(slug)) continue; // truly conflicting — don't clobber
      insert.run({
        title: r.title,
        author: 'Bernat Sampera',
        description: r.description ?? null,
        pub_date: r.created_at,
        tags: r.tags ?? null,
        content: r.content,
        slug,
        published_at: r.created_at,
        created_at: r.created_at,
      });
      migrated += 1;
    }
  });
  tx();
  return {migrated, total: refs.length};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Path matches src/lib/db.ts's getDB() resolution. Verify before running.
  const dbPath = path.resolve(__dirname, 'manage-sqlite', 'content.db');
  const db = new Database(dbPath);
  const r = migrateReferencesToPosts(db);
  console.log(`Migrated ${r.migrated} of ${r.total} references into posts.`);
  db.close();
}
```

- [ ] **Step 5: Run tests, expect PASS**

```bash
npx vitest run tests/migrate-references-to-posts.test.mjs
```

Expected: all three tests pass.

- [ ] **Step 6: Run the migration on the real DB (after backing it up)**

First confirm the actual DB path used by `src/lib/db.ts`:

```bash
grep -n "content.db\|new Database" src/lib/db.ts
```

If the resolved path is *not* `scripts/manage-sqlite/content.db`, update both the script (`migrate-references-to-posts.mjs`) and the commands below before continuing.

```bash
cp scripts/manage-sqlite/content.db scripts/manage-sqlite/content.db.backup-$(date +%Y%m%d-%H%M)
node scripts/migrate-references-to-posts.mjs
```

Expected: prints `Migrated N of N references into posts.` Run a second time — should print `Migrated 0 of N`.

- [ ] **Step 7: Sanity-check in DB**

```bash
sqlite3 scripts/manage-sqlite/content.db "SELECT count(*) FROM posts; SELECT count(*) FROM refs;"
```

Expected: posts count increased by exactly the previous refs count; refs count unchanged (we don't drop the table yet — that's Task 21).

- [ ] **Step 8: Commit**

```bash
git add scripts/migrate-references-to-posts.mjs tests/migrate-references-to-posts.test.mjs package.json package-lock.json
git commit -m "feat(migration): copy references into posts (idempotent, tested)"
```

---

### Task 16: Migrate project case studies → posts (seed script)

**Files:**
- Create: `scripts/project-posts/{bjjgym,bleakai,kronologs,packdensack,translateprompt}.md`
- Create: `scripts/seed-project-posts.mjs`

- [ ] **Step 1: Hand-convert each project page to Markdown**

For each of the five files in `src/pages/projects/`, read the `.astro` source and write a `.md` file under `scripts/project-posts/<slug>.md` with this front-matter-ish header followed by the body:

```md
---
title: BJJGym.com
description: The #1 platform for BJJ travelers to find gyms, open mats, and training partners worldwide.
slug: bjjgym
pub_date: 2024-06-01
---

# BJJGym.com

…body in markdown, with images referenced via /images/... paths…
```

Pick a sensible `pub_date` per project (use the file's git-creation date if you want, or pick a date that places the project chronologically). Keep slugs identical to the existing route paths (`bjjgym`, `bleakai`, etc.) so the redirects in Task 17 line up cleanly.

- [ ] **Step 2: Write the seed script**

Create `scripts/seed-project-posts.mjs`:

```js
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, 'project-posts');

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`No front-matter in ${file}`);
  const meta = Object.fromEntries(
    m[1].split('\n').map((line) => {
      const i = line.indexOf(':');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
  );
  return {meta, content: m[2]};
}

// Same DB path as scripts/migrate-references-to-posts.mjs; verify against src/lib/db.ts before running.
const dbPath = path.resolve(__dirname, 'manage-sqlite', 'content.db');
const db = new Database(dbPath);

const upsert = db.prepare(`
  INSERT INTO posts (title, author, description, pub_date, content, slug, status, published_at)
  VALUES (@title, 'Bernat Sampera', @description, @pub_date, @content, @slug, 'published', @pub_date)
  ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    pub_date = excluded.pub_date,
    content = excluded.content,
    published_at = excluded.published_at,
    updated_at = CURRENT_TIMESTAMP
`);

let n = 0;
for (const f of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))) {
  const {meta, content} = parse(path.join(POSTS_DIR, f));
  upsert.run({
    title: meta.title,
    description: meta.description ?? null,
    pub_date: meta.pub_date,
    content,
    slug: meta.slug,
  });
  n += 1;
}
console.log(`Seeded ${n} project posts.`);
db.close();
```

- [ ] **Step 3: Run and verify**

```bash
node scripts/seed-project-posts.mjs
sqlite3 scripts/manage-sqlite/content.db "SELECT slug, title FROM posts WHERE slug IN ('bjjgym','bleakai','kronologs','packdensack','translateprompt');"
```

Expected: prints 5 rows.

- [ ] **Step 4: Commit**

```bash
git add scripts/project-posts scripts/seed-project-posts.mjs
git commit -m "feat(migration): seed project case studies as posts"
```

---

## Phase 5 — Cleanup

### Task 17: Add Vercel redirects

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Replace `vercel.json` body**

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/_astro/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ],
  "redirects": [
    { "source": "/references",          "destination": "/blog",            "permanent": true },
    { "source": "/references/:slug",    "destination": "/posts/:slug",     "permanent": true },
    { "source": "/skills",              "destination": "/about",           "permanent": true },
    { "source": "/experience",          "destination": "/about",           "permanent": true },
    { "source": "/projects/:name",      "destination": "/posts/:name",     "permanent": true }
  ],
  "rewrites": []
}
```

**Decision on 410:** Vercel's `vercel.json` does not reliably support both `redirects` and a top-level `routes` array on Astro deployments — mixing them often causes the build to reject the config. Per the spec we tried 410, and per the pragmatic fallback we accept 404. **This plan ships only `redirects`**; `/widgets` and `/tags/[tag]` will return 404 once Task 18 deletes the page files. That's acceptable and the spec §5.2 already lists 404 as an acceptable alternative.

If you later find you really do want 410 specifically, add a tiny Astro endpoint at `src/pages/widgets.ts` and `src/pages/tags/[tag].ts` returning `new Response(null, {status: 410})`. Out of scope for this task.

- [ ] **Step 2: Verify after deploy / preview**

```bash
npx vercel dev --listen 3000   # if vercel CLI is installed; otherwise skip
curl -I http://localhost:3000/references/some-slug
# expect: HTTP/1.1 308 Permanent Redirect with location /posts/some-slug (Vercel uses 308 for permanent in some configs — that's fine; both are permanent)
```

If you don't have `vercel` CLI locally, skip this step and verify post-deploy on a Vercel preview URL.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat(redirects): 301 retired routes; widgets and tags 404 by deletion"
```

---

### Task 18: Delete obsolete pages

**Files:**
- Delete: `src/pages/references.astro`
- Delete: `src/pages/references/[slug].astro`, `src/pages/references/` (dir)
- Delete: `src/pages/api/references/index.ts`, `src/pages/api/references/[id].ts`, `src/pages/api/references/slug/[slug].ts`, `src/pages/api/references/` (dir)
- Delete: `src/pages/skills.astro`
- Delete: `src/pages/experience.astro`
- Delete: `src/pages/widgets.astro`
- Delete: `src/pages/projects/{bjjgym,bleakai,kronologs,packdensack,translateprompt}.astro`, `src/pages/projects/` (dir)
- Delete: `src/pages/tags/[tag].astro`, `src/pages/tags/` (dir)

- [ ] **Step 1: Confirm no remaining imports point at these files**

```bash
grep -rn "from.*references\|from.*projects/\|from.*tags/\|/skills\|/experience\|/widgets" src --include='*.astro' --include='*.ts' --include='*.tsx'
```

Investigate each match. Acceptable matches: navigation links pointing at `/about` (after Task 13), redirect rules, tests. Unacceptable: a still-live `import` from a file we are about to delete — fix the importing file first.

- [ ] **Step 2: Delete files**

```bash
rm src/pages/references.astro
rm -r src/pages/references
rm -r src/pages/api/references
rm src/pages/skills.astro
rm src/pages/experience.astro
rm src/pages/widgets.astro
rm -r src/pages/projects
rm -r src/pages/tags
```

(Per user CLAUDE.md, do NOT use `rm -rf`. The above are bounded `rm` and `rm -r` on directories with known contents — the executor should ask the user before running these if there is any ambiguity.)

- [ ] **Step 3: Build to confirm nothing breaks**

```bash
npm run build
```

Expected: clean build. If anything imports from a deleted path, fix it.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove references, projects, tags, skills, experience, widgets pages"
```

---

### Task 19: Delete obsolete components and DB methods

**Files:**
- Delete: `src/components/common/PostCard.astro`
- Delete: `src/components/common/ReferenceCard.astro`
- Delete: `src/components/common/RelatedPosts.astro`
- Delete: `src/components/common/TableOfContents.astro`
- Delete: `src/components/common/MobileTableOfContents.astro`
- Modify: `src/lib/db.ts` (drop `getAllReferences`, `getReferenceBySlug`, `insertReference`, `updateReference`, `deleteReference` — and any `refs` table init/migration calls).
- Modify: `src/utils/utils.ts` (drop `findRelatedPosts` if unused).
- Modify: `src/utils/tableOfContents.ts` (delete file if no longer imported).
- Modify: `src/integrations/sitemap.ts` (remove references URL generation if any).
- Modify: `src/integrations/postUrls.ts`, `src/integrations/tagUrls.ts` (delete `tagUrls.ts` if no longer imported; update `sitemap.ts` to drop the import).

- [ ] **Step 1: Drop DB methods**

In `src/lib/db.ts`, remove every method whose name starts with `Reference` or matches `/refs/i` (e.g. `getAllReferences`, `getReferenceBySlug`, `insertReference`, `updateReference`, `deleteReference`, plus the `Reference` interface). Remove the `refs` table creation from any init / migration block. (Do NOT drop the `refs` table from disk yet — see Task 21.)

Also check whether `getPostsByTag` is still imported anywhere:

```bash
grep -rn "getPostsByTag" src
```

If no callers remain (the new `blog.astro` from Task 11 doesn't use it), remove that method too.

- [ ] **Step 2: Drop helpers**

```bash
grep -rn "findRelatedPosts\|RelatedPosts\|TableOfContents\|MobileTableOfContents\|tagUrls" src
```

For each match outside of the files we plan to delete, remove the import and any usage. Then delete:

```bash
rm src/components/common/PostCard.astro
rm src/components/common/ReferenceCard.astro
rm src/components/common/RelatedPosts.astro
rm src/components/common/TableOfContents.astro
rm src/components/common/MobileTableOfContents.astro
rm src/utils/tableOfContents.ts   # only if grep above confirms no remaining imports
rm src/integrations/tagUrls.ts    # only if grep above confirms no remaining imports
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete components and reference DB methods"
```

---

### Task 20: Remove DaisyUI and prune Tailwind config

**Files:**
- Modify: `tailwind.config.cjs`
- Modify: `package.json`

- [ ] **Step 1: Remove DaisyUI plugin from `tailwind.config.cjs`**

Delete the entire `daisyui: { themes: [...], darkTheme: ... }` block. Remove `'daisyui'` (or `require('daisyui')`) from the `plugins` array.

- [ ] **Step 2: Remove legacy color tokens from `tailwind.config.cjs`**

In `theme.extend.colors`, delete: `black`, `accent`, `off-white`, `light-gray`, `medium-gray`, `dark-gray`, `background`. Keep the new tokens added in Task 1. (Tailwind's defaults still provide `black` etc. — only the *custom* `black` override goes.)

- [ ] **Step 3: Uninstall DaisyUI**

```bash
npm uninstall daisyui
```

- [ ] **Step 4: Sweep for leftover legacy class usages**

```bash
grep -rn "bg-background\|text-foreground\|bg-card\|text-muted-foreground\|bg-primary\|bg-muted\|silentedge\|daisyui\|class=\"btn\|class=\"card " src --include='*.astro' --include='*.tsx' --include='*.ts' --include='*.css'
```

For each match: replace the legacy class with the new equivalent (`bg-ink`, `text-text`, `bg-ink-2`, `text-text-muted`, `text-text-strong`, `bg-ink-2`, etc.). Admin pages (`src/pages/admin/*`) are allowed to use the simplest replacements that keep them legible — no full restyle needed.

- [ ] **Step 5: Update `src/assets/styles/tailwind.css`**

(Spec referred to `src/index.css`; the real file is `src/assets/styles/tailwind.css`.) Remove any `:root` or `[data-theme='silentedge']` blocks that bind the legacy CSS variables. Keep only what `Layout.astro` and `post-render.css` actually consume.

- [ ] **Step 6: Build**

```bash
npm run build
```

Expected: clean build with no Tailwind warnings about unknown classes.

- [ ] **Step 7: Commit**

```bash
git add tailwind.config.cjs package.json package-lock.json src/assets/styles/tailwind.css src
git commit -m "chore: remove DaisyUI and legacy color tokens"
```

---

### Task 21: Drop `refs` table

**Files:**
- Modify: `db/schema.sql`
- One-time SQL on the live DB.

Run this only after the migration in Task 15 is verified and the redirects in Task 17 are deployed.

- [ ] **Step 1: Sanity check**

```bash
sqlite3 scripts/manage-sqlite/content.db "SELECT count(*) FROM refs;"
sqlite3 scripts/manage-sqlite/content.db "SELECT count(*) FROM posts WHERE author = 'Bernat Sampera';"
```

Confirm posts count >= refs count.

- [ ] **Step 2: Drop the table**

```bash
sqlite3 scripts/manage-sqlite/content.db "DROP TABLE refs;"
```

- [ ] **Step 3: Remove `refs` from `db/schema.sql`**

Delete the `CREATE TABLE IF NOT EXISTS refs (...)` block and the `idx_refs_*` indexes.

- [ ] **Step 4: Sync the production DB**

First confirm the CLI surface — Task 15's grep already showed the script lives at `scripts/manage-sqlite/index.py`. Verify the subcommand name before running:

```bash
uv run scripts/manage-sqlite/index.py --help
```

Then run whatever the help output documents as the push/upload command (most likely `push`):

```bash
uv run scripts/manage-sqlite/index.py push
```

**Per user CLAUDE.md, always use `uv run`, never bare `python` or `pip`.** If `--help` shows no `push` subcommand, surface to the user before guessing.

- [ ] **Step 5: Commit**

```bash
git add db/schema.sql
git commit -m "chore(db): drop refs table after migration"
```

---

### Task 22: Touch-up admin pages

**Files:**
- Modify (palette only): `src/pages/admin/index.astro`, `src/pages/admin/new-post.astro`, `src/pages/admin/edit-post/[id].astro`, and any related component files.

- [ ] **Step 1: Audit**

```bash
grep -rn "bg-white\|bg-gray\|text-gray-9\|text-gray-6" src/pages/admin
```

For each match, swap to `bg-ink-2`, `text-text-muted`, `text-text-strong` etc. Preserve all functionality (form fields, buttons, scripts).

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Visit `/admin`, log in, view `/admin/new-post` and `/admin/edit-post/<id>`. Forms render legibly on the dark background; create / edit / delete still work.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin
git commit -m "chore(admin): palette swap for dark theme"
```

---

### Task 23: Acceptance pass

This task verifies §12 of the spec and produces a written sign-off.

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: no errors, no warnings about missing classes / unknown plugins.

- [ ] **Step 2: Dev smoke**

```bash
npm run dev
```

Visit each route and visually compare against the mockups at `.superpowers/brainstorm/26193-1777388364/d-v4-simplest.html` and `.../post-reading.html`:

- `/` — hero + 3 PostRows + "see all writing →"
- `/blog` — `writing.` headline, search input, dated rows, no chips, no badges, no tags
- `/posts/<slug>` — single column, lede, orange-notch H2, code blocks with header bar + working copy button, end-rule dots, NextEntry card
- `/about` — `about.` headline, prose, skills + experience folded in
- `/contact` — minimal
- `/zzz` (404) — `not here.`
- `/admin` — still functional

- [ ] **Step 3: Redirect verification**

On the deployed Vercel preview URL (or `vercel dev` locally):

```bash
for u in /references /references/anything /skills /experience /projects/bjjgym; do
  curl -sI "$BASE$u" | head -2
done
```

Expected: each returns `301` (or `308`) with a `location:` header pointing at the new URL.

```bash
for u in /widgets /tags/foo; do
  curl -sI "$BASE$u" | head -2
done
```

Expected: `410 Gone` (or `404` if Vercel `routes` 410 wiring isn't supported).

- [ ] **Step 4: Sitemap and RSS sanity**

Visit `/sitemap.xml` (or whatever path the integration emits). Confirm migrated posts (e.g. `bjjgym`, plus a known migrated reference slug) appear.

If the project has an RSS feed route, fetch it and confirm it parses (`xmllint --noout <url>` or equivalent).

- [ ] **Step 5: Verify legacy classes are gone**

```bash
grep -rn "silentedge\|bg-background\|text-foreground\|daisyui" src
```

Expected: no matches.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: acceptance pass for redesign"
```

---

## What's Out of Scope (do not do in this plan)

- Light-mode variant.
- Analytics / SEO meta restructuring beyond what migration requires.
- Comments / share buttons / related posts.
- Image-optimization pipeline changes.
- Performance budget work.

---

## Open Risks for the Executor

1. **Code-block filename detection** (Task 8) relies on a leading `// filename` comment in the code body. If the user's existing posts don't follow that convention, the header simply shows the language — graceful fallback. Surface to user only if they explicitly want filenames on every block.
2. **Vercel 410 wiring** (Task 17) uses the `routes` block; some Vercel project configurations disallow it. If the build rejects it, fall back to letting the routes 404 by leaving the deleted page files absent (Task 18 already ensures absence).
3. **Admin styling** (Task 22) is a minimal sweep, not a redesign. If admin UI ends up unreadable after the sweep, surface to user before going deeper — admin redesign is explicitly out of scope.
4. **`@tailwindcss/typography` interaction** with our `.post-prose` class (Task 12) — we deliberately do not apply the `prose` class so `@tailwindcss/typography` doesn't fight us. If the user wants `prose` because it's terser, the typography overrides in Task 12 Step 3 are already wired to match.
