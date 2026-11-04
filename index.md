# SamperaLabs navigation

- [design-preview/header-study.html](design-preview/header-study.html): Interactive header comparison with a revised Work header and a Project view without the site header.

- [src/pages/work.astro](src/pages/work.astro): Project overview with MAAT, gcontext, related articles, and side projects.
- [src/components/elements/Header.astro](src/components/elements/Header.astro): Shared desktop and phone navigation for all public page layouts.
- [src/lib/ask/content.ts](src/lib/ask/content.ts): Structured Jev answers, main next actions, and shared project cards.
- [src/lib/ask/publicContent.ts](src/lib/ask/publicContent.ts): Jev article choices loaded from the published post store.
- [scripts/site-navigation-check.mjs](scripts/site-navigation-check.mjs): Local HTTP checks for public routes, shared navigation, and Jev topic paths with a JSON report.

- [design-preview/portfolio-soft.html](design-preview/portfolio-soft.html): Local preview of one broad continuous fade behind the approved portrait pieces.
- [design-preview/build-portfolio-soft.mjs](design-preview/build-portfolio-soft.mjs): Builds the local soft-fade preview without changing the production renderer.

- [src/components/flight/Flight.astro](src/components/flight/Flight.astro): Homepage portrait with the approved information sequence and a static reading fallback.
- [src/components/flight/information-flight.js](src/components/flight/information-flight.js): Continuous portrait renderer with one readable piece at a time and no card clicks.
- [src/components/flight/information-panels.js](src/components/flight/information-panels.js): Approved information copy and transparent typography compositions.
- [public/images/portrait-context.webp](public/images/portrait-context.webp): Transparent monochrome context figure for the homepage portrait.
- [public/images/portrait-structure.webp](public/images/portrait-structure.webp): Transparent monochrome structure figure for the homepage portrait.
- [public/images/portrait-maintaining.webp](public/images/portrait-maintaining.webp): Transparent monochrome maintaining figure for the homepage portrait.

- [design-preview/portfolio-focus.html](design-preview/portfolio-focus.html): Three centred versions with Geist type, approved structure copy, and new context subtitles.
- [design-preview/build-portfolio-focus.mjs](design-preview/build-portfolio-focus.mjs): Builds the Signal, Between, and Reveal preview with version controls and comparison.
- [design-preview/portfolio-focus-panels.mjs](design-preview/portfolio-focus-panels.mjs): Three transparent layouts that place figures above, below, or between title lines.

- [design-preview/portfolio-play.html](design-preview/portfolio-play.html): Three transparent compositions with stronger type, new copy, and a quieter portrait field.
- [design-preview/build-portfolio-play.mjs](design-preview/build-portfolio-play.mjs): Builds the standalone three-version preview with a comparison view.
- [design-preview/portfolio-play-panels.mjs](design-preview/portfolio-play-panels.mjs): Impact, Questions, and Margins layouts with the unchanged pruning copy.

- [design-preview/portfolio-fragments.html](design-preview/portfolio-fragments.html): Portrait exploration with floating text, transparent monochrome figures, and no panel backgrounds or borders.
- [design-preview/build-portfolio-fragments.mjs](design-preview/build-portfolio-fragments.mjs): Builds the standalone preview with alpha-aware rendering and no hover rectangles.
- [design-preview/portfolio-fragments-panels.mjs](design-preview/portfolio-fragments-panels.mjs): Transparent compositions containing only typography and isolated figures.
- [design-preview/portfolio-fragments-assets/index.md](design-preview/portfolio-fragments-assets/index.md): Minimal generated figures and their prompts.

- [design-preview/portfolio-directions.html](design-preview/portfolio-directions.html): Three portfolio layouts with shorter copy, integrated image backgrounds, and no date label.
- [design-preview/build-portfolio-directions.mjs](design-preview/build-portfolio-directions.mjs): Builds the Editorial, Poster, and Split comparison preview.
- [design-preview/portfolio-directions-panels.mjs](design-preview/portfolio-directions-panels.mjs): Short card copy, three layouts, and image background integration.

- [design-preview/portfolio-context.html](design-preview/portfolio-context.html): New portrait preview with the approved opening, three cards, and generated object illustrations.
- [design-preview/build-portfolio-context.mjs](design-preview/build-portfolio-context.mjs): Builds the standalone preview with embedded images and the continuous reading zone.
- [design-preview/portfolio-context-panels.mjs](design-preview/portfolio-context-panels.mjs): Approved copy, automatic month formatting, and opening and card layouts.
- [design-preview/portfolio-context-assets/index.md](design-preview/portfolio-context-assets/index.md): Generated illustrations and their complete prompts.

- [design-preview/information-visuals.html](design-preview/information-visuals.html): Portrait flight with continuous reading zones and Objects selected by default.
- [design-preview/build-information-visuals.mjs](design-preview/build-information-visuals.mjs): Builds the three wordless visual versions with short titles and descriptions.
- [design-preview/information-visuals-art.mjs](design-preview/information-visuals-art.mjs): Draws twelve wordless illustrations for the minimal portfolio cards.
- [design-preview/information-reading-zone.mjs](design-preview/information-reading-zone.mjs): Maps continuous scrolling to readable panel movement and gradual visual focus.

- [design-preview/information-flight.html](design-preview/information-flight.html): Continuous portrait flight with four questions, three visual versions, and a comparison view.
- [design-preview/build-information-flight.mjs](design-preview/build-information-flight.mjs): Builds the standalone portrait preview with continuous scrolling, panel art, and embedded assets.
- [design-preview/information-panel-art.mjs](design-preview/information-panel-art.mjs): Draws the Paper, Type, and Windows versions of the four information panels.

- [design-preview/information-journey.html](design-preview/information-journey.html): Interactive HTML concept for information, context across sessions, and gcontext research.

- [design-preview/work-flight.html](design-preview/work-flight.html): Self-contained HTML preview of project and article cards inside the portrait flight.

- [.github/workflows/deploy.yml](.github/workflows/deploy.yml): Builds the application image and requests a Coolify deployment.

- [src/docs/deploy-post-command.md](src/docs/deploy-post-command.md): One-command post publication, release manifests, and saved results.
- [src/docs/commands/deploy-post/SKILL.md](src/docs/commands/deploy-post/SKILL.md): Shared Codex and Claude Code publication command.
- [src/docs/commands/deploy-post/failure-modes.md](src/docs/commands/deploy-post/failure-modes.md): Release failures defined before script implementation.
- [scripts/deploy-post.mjs](scripts/deploy-post.mjs): Post publication with image delivery, optional code release, and HTTP checks.
- [scripts/home-layout-e2e.mjs](scripts/home-layout-e2e.mjs): Homepage composition check for the four layout rules, with screenshots and a report.
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

- [src/docs/linkedin-post-command.md](src/docs/linkedin-post-command.md): LinkedIn post command, output folder, slide and post formats.
- [src/docs/commands/post-to-linkedin/SKILL.md](src/docs/commands/post-to-linkedin/SKILL.md): Shared Codex and Claude Code skill that prepares a LinkedIn post for a published article.
- [src/docs/commands/post-to-linkedin/linkedin-guide.md](src/docs/commands/post-to-linkedin/linkedin-guide.md): Default editorial decisions: post shape, voice, media choice, link, and calendar.
- [src/docs/commands/post-to-linkedin/failure-modes.md](src/docs/commands/post-to-linkedin/failure-modes.md): Media and post-check failures defined before script implementation.
- [scripts/linkedin-media.mjs](scripts/linkedin-media.mjs): Carousel PDF, scene video, image copy, and post check for LinkedIn posts.
- [src/editorial/linkedin/index.md](src/editorial/linkedin/index.md): LinkedIn post calendar and local post folders.

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
- [src/components/home/AgentTurnScene.astro](src/components/home/AgentTurnScene.astro): Homepage agent turn scene with unique accessible labels.
- [src/components/home/agent-turn-scene.svg](src/components/home/agent-turn-scene.svg): Animated owner question, Jev plan, action call, and member status widget.
- [src/components/home/GlobalContextScene.astro](src/components/home/GlobalContextScene.astro): Homepage global context scene with unique accessible labels.
- [src/components/home/global-context-scene.svg](src/components/home/global-context-scene.svg): Animated card catalog map, Sales drawer, price change, and saved state.
- [public/images/gym-schedule-import-comic.png](public/images/gym-schedule-import-comic.png): Approved comic that compares manual entry with the schedule import tool.
- [public/images/gym-schedule-import-review.jpg](public/images/gym-schedule-import-review.jpg): Staged frontend view of the image and Markdown review.
- [public/images/gym-schedule-import-editor.jpg](public/images/gym-schedule-import-editor.jpg): Staged frontend view of editable schedule classes.
- [src/assets/styles/brain-article.css](src/assets/styles/brain-article.css): Article diagrams and comic layout.
- [public/images/maat-brain-comic.png](public/images/maat-brain-comic.png): Published article comic.

- [public/images/express-the-general-comic.png](public/images/express-the-general-comic.png): Original comic for the published Express the General revision.

- [public/images/how-we-built-the-maat-admin-agent-00-cover-efb012af5f15.png](public/images/how-we-built-the-maat-admin-agent-00-cover-efb012af5f15.png): Article image for How we built the MAAT Admin Agent for gym owners.
- [public/images/how-we-built-the-maat-admin-agent-01-scope-score-d216f04ddfa2.png](public/images/how-we-built-the-maat-admin-agent-01-scope-score-d216f04ddfa2.png): Article image for How we built the MAAT Admin Agent for gym owners.
- [public/images/how-we-built-the-maat-admin-agent-02-actions-3da68e1ea340.png](public/images/how-we-built-the-maat-admin-agent-02-actions-3da68e1ea340.png): Article image for How we built the MAAT Admin Agent for gym owners.
- [public/images/how-we-built-the-maat-admin-agent-03-decision-generation-d9fc1d7af21d.png](public/images/how-we-built-the-maat-admin-agent-03-decision-generation-d9fc1d7af21d.png): Article image for How we built the MAAT Admin Agent for gym owners.
- [public/images/how-we-built-the-maat-admin-agent-04-widget-anatomy-ffd3462771b3.png](public/images/how-we-built-the-maat-admin-agent-04-widget-anatomy-ffd3462771b3.png): Article image for How we built the MAAT Admin Agent for gym owners.
- [public/images/how-we-built-the-maat-admin-agent-05-model-screening-4fd52c434336.png](public/images/how-we-built-the-maat-admin-agent-05-model-screening-4fd52c434336.png): Article image for How we built the MAAT Admin Agent for gym owners.
- [public/images/how-we-built-the-maat-admin-agent-06-intent-map-eaa89f411c59.png](public/images/how-we-built-the-maat-admin-agent-06-intent-map-eaa89f411c59.png): Article image for How we built the MAAT Admin Agent for gym owners.

- [public/images/how-we-built-the-maat-admin-agent-03-decision-generation-382f062e79b0.png](public/images/how-we-built-the-maat-admin-agent-03-decision-generation-382f062e79b0.png): Article image for How we built the MAAT Admin Agent for gym owners.
- [public/images/how-we-built-the-maat-admin-agent-04-widget-anatomy-77b749fc873f.png](public/images/how-we-built-the-maat-admin-agent-04-widget-anatomy-77b749fc873f.png): Article image for How we built the MAAT Admin Agent for gym owners.
- [public/images/how-we-built-the-maat-admin-agent-05-model-screening-efd2a0ee4cd0.png](public/images/how-we-built-the-maat-admin-agent-05-model-screening-efd2a0ee4cd0.png): Article image for How we built the MAAT Admin Agent for gym owners.

- [public/images/how-we-built-the-maat-admin-agent-04-widget-anatomy-5e957a65938c.png](public/images/how-we-built-the-maat-admin-agent-04-widget-anatomy-5e957a65938c.png): Article image for How we built the MAAT Admin Agent for gym owners.

- [public/images/why-ai-agents-need-a-global-context-00-renewal-email-0c0723b48767.png](public/images/why-ai-agents-need-a-global-context-00-renewal-email-0c0723b48767.png): Article image for Global context for AI agents: minimal to load, fast to find.
- [public/images/why-ai-agents-need-a-global-context-07-misc-drawers-007d8570fcbd.png](public/images/why-ai-agents-need-a-global-context-07-misc-drawers-007d8570fcbd.png): Article image for Global context for AI agents: minimal to load, fast to find.
- [public/images/why-ai-agents-need-a-global-context-01-where-to-look-33294056305d.png](public/images/why-ai-agents-need-a-global-context-01-where-to-look-33294056305d.png): Article image for Global context for AI agents: minimal to load, fast to find.
- [public/images/why-ai-agents-need-a-global-context-05-everything-just-in-case-929ce4fb79b4.png](public/images/why-ai-agents-need-a-global-context-05-everything-just-in-case-929ce4fb79b4.png): Article image for Global context for AI agents: minimal to load, fast to find.
- [public/images/why-ai-agents-need-a-global-context-02-loading-5cdbd217d372.png](public/images/why-ai-agents-need-a-global-context-02-loading-5cdbd217d372.png): Article image for Global context for AI agents: minimal to load, fast to find.
- [public/images/why-ai-agents-need-a-global-context-06-whiteboard-wiped-66ffa59fe7b1.png](public/images/why-ai-agents-need-a-global-context-06-whiteboard-wiped-66ffa59fe7b1.png): Article image for Global context for AI agents: minimal to load, fast to find.
- [public/images/why-ai-agents-need-a-global-context-03-saving-1b38ba386f3b.png](public/images/why-ai-agents-need-a-global-context-03-saving-1b38ba386f3b.png): Article image for Global context for AI agents: minimal to load, fast to find.
- [public/images/why-ai-agents-need-a-global-context-08-domain-alone-bc62a0026917.png](public/images/why-ai-agents-need-a-global-context-08-domain-alone-bc62a0026917.png): Article image for Global context for AI agents: minimal to load, fast to find.
- [public/images/why-ai-agents-need-a-global-context-04-whole-system-7f858ad31724.png](public/images/why-ai-agents-need-a-global-context-04-whole-system-7f858ad31724.png): Article image for Global context for AI agents: minimal to load, fast to find.
- [public/images/why-ai-agents-need-a-global-context-09-read-the-map-first-142233a3d34e.png](public/images/why-ai-agents-need-a-global-context-09-read-the-map-first-142233a3d34e.png): Article image for Global context for AI agents: minimal to load, fast to find.
