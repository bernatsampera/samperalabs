# LinkedIn post command

`/post-to-linkedin <slug>` prepares a ready-to-paste LinkedIn post for one published article.
The agent makes the editorial decisions with the [LinkedIn guide](commands/post-to-linkedin/linkedin-guide.md).
Nothing is posted, committed, or pushed.

```text
/post-to-linkedin why-ai-agents-need-a-global-context
/post-to-linkedin global-context
```

In Codex, use `$post-to-linkedin <slug>`.
Install the skill links with `node scripts/install-post-to-linkedin-command.mjs`.

## Output folder

```text
src/editorial/linkedin/
  index.md                 calendar, status, ideas, and images used
  <slug>/
    post.md                post text, first comment, media, decisions, facts
    slides.json            carousel input (carousel posts only)
    carousel.pdf           attach as a LinkedIn document
    slides/01.png ...      slide previews
    video.mp4, poster.png  scene video (video posts only)
    image.png              single image (image posts only)
    source/                downloaded images for articles without a local draft
```

## Media script

```text
npm run linkedin-media -- image <slug> <repo-relative-image-path>
npm run linkedin-media -- carousel <slug>
npm run linkedin-media -- video <slug>
npm run linkedin-media -- check <slug>
npm run linkedin-media:e2e
```

The script stops on the failures in [failure-modes.md](commands/post-to-linkedin/failure-modes.md).
The E2E run writes its artifacts and `report.md` to `src/editorial/linkedin/_e2e/`.

## `slides.json`

```json
{
  "slug": "why-ai-agents-need-a-global-context",
  "title": "Global context for AI agents: minimal to load, fast to find",
  "url": "https://samperalabs.com/posts/why-ai-agents-need-a-global-context",
  "slides": [
    { "kind": "cover", "heading": "...", "body": "...", "image": "src/editorial/drafts/global-context/00-renewal-email.png" },
    { "kind": "image", "image": "src/editorial/drafts/global-context/01-where-to-look.png", "text": "..." },
    { "kind": "text", "eyebrow": "...", "heading": "...", "body": "...", "list": ["...", "..."] },
    { "kind": "code", "eyebrow": "...", "heading": "...", "code": "# comment line, shown in gold\nload: map.md", "body": "optional caption" },
    { "kind": "end", "heading": "...", "body": "...", "url": "samperalabs.com/posts/why-ai-agents-need-a-global-context" }
  ]
}
```

Image paths are relative to the site root. A carousel has 3 to 10 slides. Pages are 1080 x 1350 px.
Every kind accepts an optional `eyebrow` label. Image slides accept an optional `heading`. A cover without an image renders as large type.
Code lines must fit 36 characters. Lines that start with `#` render as comments.

## `post.md`

```markdown
---
slug: why-ai-agents-need-a-global-context
url: https://samperalabs.com/posts/why-ai-agents-need-a-global-context
media: carousel
media_files:
  - carousel.pdf
planned: 2026-10-20 09:00 Europe/Madrid
status: ready
---

## Post

(the text to paste)

## First comment

(article title, URL, and one sentence)

## Faith

(the five gate inputs: faith, claim, artifact, mechanism, where it breaks)

## Media

(the file to attach, and why this media type and these images)

## Decisions

(one line for each decision: hook and the rejected hook candidates, voice, tag, media, date, with the reason)

## Facts

| Claim | Source |
| --- | --- |
| (claim used in the post) | src/editorial/drafts/<folder>/article.md |
```

Status values: `ready` (prepared), `posted` (the author posted it; add the LinkedIn URL in the index).
