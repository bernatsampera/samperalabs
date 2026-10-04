# SamperaLabs article prompt

Use this prompt when you have a draft, notes, or a completed project brief. Paste the request below into an AI session with access to this repository.

For the shared Codex and Claude Code command, use [new-post-command.md](new-post-command.md). It accepts a written file, repository, or folder.

## Request

Help me prepare a SamperaLabs article. Read the root index first. Follow the editorial guide and image workflow linked below.

- Material: [draft, notes, or project brief]
- Reader: [who this should help]
- Reader benefit: [what they should understand or do]
- Mode: [presentation only, edit with me, or draft from evidence]
- My main point: [your opinion or lesson]
- Keep unchanged: [passages, facts, or tone]
- Limits: [private details, length, or subjects to exclude]

Default to presentation only when I supply a draft without a mode. If I supply raw project material, propose a story before drafting.

## First response

Read the whole source. Identify the main claim and the reader benefit. Give a short assessment of what already works and what needs attention.

Return:

1. A proposed title and a one-sentence main claim.
2. A section outline with H2 sections and useful H3 subsections. For project articles, follow the problem, available tools, implementation decisions, and resulting capabilities. Use the editorial guide's decision structure.
3. An image plan with placement, purpose, format, and source needs for each image. Propose two distinct visual concepts. Compare their composition and drawing style with recent posts. For a homepage scene, describe its specific movement and static fallback.
4. The few missing facts that prevent an accurate draft.
5. A short sample edit if I requested language changes.

Ask for my decisions together. Do not rewrite the whole article in presentation-only mode. Do not make finished images before the direction is selected, unless I already requested them.

## After I select the direction

Prepare the article and the selected assets within the agreed scope. Follow the image workflow for screenshots, diagrams, and illustrations. Keep captions and alt text with each image.

Use short prose with code samples, folder trees, and diagrams where they explain the mechanism more clearly. Label simplified examples. Make the nested table of contents useful without padding the article.

Preserve my point of view. Mark unsupported claims as open questions in the review notes. Keep those notes outside the article. Do not invent results or personal experience.

Return the complete draft, image previews, source notes, and a brief list of meaningful edits. Identify missing assets. Do not call a draft complete while it contains placeholders.

Prepare metadata with the draft:

- Title and short description.
- Author: Bernat Sampera.
- Proposed slug and relevant existing tags.
- Cover image and alt text, if useful.
- Status: draft.
- Publication date: leave undecided until scheduling or publication is requested.

## Submission and publication

Keep this work local until I request submission. If I ask you to create a remote draft, send `status: "draft"` explicitly. The current create API otherwise defaults to published. Confirm the returned status after creation. Local development uses the remote content service, so it is not an isolated writing sandbox.

Show the final article in the actual reading layout before publication. If a private rendered preview is unavailable, report that gap. Do not publish to obtain a preview.

Publish only when I explicitly instruct you to publish the reviewed version. Draft approval alone is not a publication instruction. Do not commit, deploy, or change the curated homepage selection unless requested.

For an existing article, check whether it has a source revision before editing. For a new article, use the existing post system after submission is requested. Do not add it to the source revision map as a shortcut.

## References

- [editorial-guide.md](editorial-guide.md): Reader criteria, writing rules, and review decisions.
- [post-image-workflow.md](post-image-workflow.md): Visual planning, production, and checks.
- [project-story-brief.md](project-story-brief.md): Evidence collection from another project.
- [../pages/admin/llms.txt](../pages/admin/llms.txt): Existing editor and upload tools.
- [../editorial/revisions/index.md](../editorial/revisions/index.md): Source-managed article editing rules.
