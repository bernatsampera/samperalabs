# SamperaLabs navigation

- [.github/workflows/deploy.yml](.github/workflows/deploy.yml): Builds the application image and requests a Coolify deployment.

- [src/docs/deploy-post-command.md](src/docs/deploy-post-command.md): One-command post publication, release manifests, and saved results.
- [src/docs/commands/deploy-post/SKILL.md](src/docs/commands/deploy-post/SKILL.md): Shared Codex and Claude Code publication command.
- [src/docs/commands/deploy-post/failure-modes.md](src/docs/commands/deploy-post/failure-modes.md): Release failures defined before script implementation.
- [scripts/deploy-post.mjs](scripts/deploy-post.mjs): Post publication with image delivery, optional code release, and HTTP checks.
- [scripts/install-deploy-post-command.mjs](scripts/install-deploy-post-command.mjs): Installs the deploy-post skill without replacing existing entries.
- [.codex/skills/deploy-post/SKILL.md](.codex/skills/deploy-post/SKILL.md): Project Codex activation link for post publication.
- [.claude/skills/deploy-post/SKILL.md](.claude/skills/deploy-post/SKILL.md): Project Claude Code activation link for post publication.

- [src/docs/new-post-command.md](src/docs/new-post-command.md): Shared Codex and Claude Code article command, input examples, and installation.
- [src/docs/commands/new-post/SKILL.md](src/docs/commands/new-post/SKILL.md): Command instructions for text files, repositories, and folders.
- [src/docs/commands/new-post/agents/openai.yaml](src/docs/commands/new-post/agents/openai.yaml): Codex display metadata for the shared command.
- [src/docs/article-site-reference.md](src/docs/article-site-reference.md): Site purpose, content API, image delivery, homepage rules, and Coolify releases.
- [scripts/install-post-command.mjs](scripts/install-post-command.mjs): Installs shared skill links without replacing existing entries.
- [.codex/skills/new-post/SKILL.md](.codex/skills/new-post/SKILL.md): Project Codex activation link to the shared article command.
- [.claude/skills/new-post/SKILL.md](.claude/skills/new-post/SKILL.md): Project Claude Code activation link to the shared article command.

- [.agents/skills/asd-ste100/SKILL.md](.agents/skills/asd-ste100/SKILL.md): Project-local Simplified Technical English skill for clear sentences and consistent terms.

- [src/editorial/drafts/index.md](src/editorial/drafts/index.md): Local article drafts and the MAAT Brain page preview.

- [context/index.md](context/index.md): Project context tree loaded through the local gcontext hook.
- [gcontext-guide.md](gcontext-guide.md): Setup scope, daily commands, version details, and improvement inbox.

- [src/docs/editorial-guide.md](src/docs/editorial-guide.md): Manual article workflow, reader criteria, writing rules, and review decisions.
- [src/docs/project-story-brief.md](src/docs/project-story-brief.md): Portable brief for turning project features into evidence for an article.
- [src/docs/post-image-workflow.md](src/docs/post-image-workflow.md): Image planning, production, captions, and a worked article example.
- [src/docs/new-essay-prompt.md](src/docs/new-essay-prompt.md): Reusable prompt for preparing a draft and submitting it only on request.
- [design-preview/decisions.md](design-preview/decisions.md): Approved design decisions and constraints to preserve during future work.
- [design-preview/implementation-review.md](design-preview/implementation-review.md): Current site implementation, verification results, and remaining content work.
- [llms.txt](llms.txt): Existing guide to the site, database, scripts, and configuration.
- [src/docs/llms.txt](src/docs/llms.txt): Frontend routes, components, layouts, and content tools.
- [db/llms.txt](db/llms.txt): Database guide and content storage.
- [src/editorial/revisions/index.md](src/editorial/revisions/index.md): Source-managed public article revisions and their editing rules.
- [design-preview/index.md](design-preview/index.md): Local design sketch for review before site changes.

- [src/components/home/BrainScene.astro](src/components/home/BrainScene.astro): Shared handbook scene with several readers for the MAAT Brain article.
- [src/components/home/ScheduleScene.astro](src/components/home/ScheduleScene.astro): Homepage schedule import scene with unique accessible labels.
- [src/components/home/schedule-scene.svg](src/components/home/schedule-scene.svg): Shared drawing that changes from a picture to Markdown and editable classes.
- [public/images/gym-schedule-import-comic.png](public/images/gym-schedule-import-comic.png): Approved comic that compares manual entry with the schedule import tool.
- [public/images/gym-schedule-import-review.jpg](public/images/gym-schedule-import-review.jpg): Staged frontend view of the image and Markdown review.
- [public/images/gym-schedule-import-editor.jpg](public/images/gym-schedule-import-editor.jpg): Staged frontend view of editable schedule classes.
- [src/assets/styles/brain-article.css](src/assets/styles/brain-article.css): Article diagrams and comic layout.
- [public/images/maat-brain-comic.png](public/images/maat-brain-comic.png): Published article comic.

- [public/images/express-the-general-comic.png](public/images/express-the-general-comic.png): Original comic for the published Express the General revision.
