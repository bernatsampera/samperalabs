# Site implementation plan

## Current layout and motion revision

A Codex high-effort planner reviewed the actual source. A separate Astra medium-effort agent implements this revision. Align homepage and article rails with one shared shell. Increase rail width on large screens. Left-align the article header, byline, and reading column. Keep the article measure bounded.

Move projects outside the posts grid so the sidebar ends with the writing. Use a borderless project presentation with clear product identity and truthful visuals. Keep the native horizontal slider and its accessible controls.

Give each scene a distinct scroll interval. Exactly one scene may animate at a time. Reserve extra space through stable CSS only; never change section dimensions during a scroll handler. Keep the final phase visible, preserve normal flow on short screens, and honor reduced motion. Strengthen the reading action without extra page labels.

## Scope

Implement the approved homepage structure and original post reading direction in the Astro site. Use white backgrounds, near-black text, and neutral grays. Add life through type scale, clear illustrations, and restrained motion. Do not use a different accent color for each project. Preserve existing content, URLs, metadata, admin tools, and deployment settings. Do not commit, push, or deploy.

## Homepage

1. Render published essays from the existing store. Keep every essay reachable. Exclude both current and historical project slugs from essays.
2. Use open numbered post sections, clear summaries, visible reading links, scroll-driven visual explanations, and a contents rail. Use compact navigation on phones. No card grid, hidden selectors, or scroll capture.
3. Add optional slug-keyed presentation metadata for custom post visuals. Use honest title and description fallbacks for posts without metadata. Never invent article claims or replace database content with sketch text.
4. Keep natural scrolling, keyboard access, readable static content, reduced motion, and short-screen layouts. Avoid giving every archive post a long pinned scene. Use custom scenes where editorial metadata exists and compact sections otherwise.
5. Place BJJGym, IndoEuroMap, and gcontext below essays. Each section includes purpose, problem, solution, a small neutral visual, and the real project URL. No new project detail routes. Keep old project URLs working.

## Reading pages

1. Use large sans-serif headings, a serif reading column, generous spacing, and monochrome surfaces.
2. Generate desktop and mobile contents links from the rendered headings. Handle formatted headings, duplicates, existing IDs, empty headings, and posts without headings. Keep anchors consistent with rendered HTML.
3. Preserve code copy, syntax highlighting, images, interactive essays, admin controls, metadata, and Markdown processing. Keep tables and code scrollable on phones.

## Small image workflow

Document an optional image brief with the idea, visual contrast, placement, caption, and alt text. Reuse existing Markdown images and upload workflow. Do not add automatic generation, publishing, or new infrastructure.

## Work split after Astra high review

Review outcome: approved with the following requirements. Bind custom scenes to verified article content. Include all essays in a bounded, scrollable contents rail and use compact fallbacks. Keep historical project filtering for homepage and RSS. Build heading IDs and contents in one rendered-HTML pass, reserve existing IDs, and preserve valid legacy anchors. Scope serif reading styles so they do not affect interactive React content, notes, or admin. Keep a readable static view without JavaScript. Keep database and API credentials server-only.

- Astra medium A: homepage, post presentation metadata, post visual components, homepage navigation and motion.
- Astra medium B: reading layout, rendered heading IDs and contents, scoped article styles.
- Astra medium C: project data and project sections, neutral shared header/footer adjustments, short image workflow guide.
- Parent: integrate, update navigation and decision records, verify the implementation, resolve findings.

## Validation

Run the existing build and relevant existing checks. Do not add unit tests or a new E2E framework. Use the local development site to check homepage navigation, post links, project links, article contents, code copy, phone layout, reduced motion, and missing presentation metadata. Record commands, results, and limitations in a review file. Keep production data read-only. Report any pre-existing failures separately.
