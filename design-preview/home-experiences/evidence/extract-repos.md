# gcontext: a factual timeline from three repositories

Written 2026-11-01 from read-only reads of:

- A. `/Users/bsampera/Documents/bleak-dev/gcontext-cloud` (git: 697 commits, 2026-04-02 to 2026-07-24; branch `master`)
- B. `/Users/bsampera/Documents/bleak-dev/gcontext-framework` (git: 576 commits, 2026-07-21 to 2026-11-01; branch `main`; tag `before-cleanup` keeps the state before the 2026-10-31 cleanup)
- C. `/Users/bsampera/Documents/bernat-agent` (git: 25 commits, 2026-08-12 to 2026-10-25)

Conventions in this file:

- FACT: taken from a commit message, a tag, or a document in the repos. INFERENCE: my reading, not stated in a source.
- Quotes are verbatim. Where a source quote holds an em dash, I write a colon or a comma in its place and keep every word. Typing errors in Bernat's quotes stay as they are in the source.
- [paraphrase] marks my summary of a source.
- Commit dates are author dates (`git log --date=short`). Commits per month, repo A: April 292, May 143, June 114, July 148. Repo B: July 17, August 176, September 67, October 313, November 3 (to 2026-11-01).
- Privacy: three to four modules of repo C touch private topics. They appear only as "private topic".

---

## 1. Timeline by month, April 2026 to November 2026

### April 2026: the proof of concept, "Context Loader", then "ContextAgora" (repo A)

FACT. The first commit is `2026-04-02 feat: build first poc`; the Python package was named `context-loader-poc` (pyproject.toml at that commit). In two days the server moved from SQLite to Supabase to "GitHub-based module loading" (04-03), got Docker, Infisical secrets ("Infisical setup guide", 04-03) and a streaming chat (04-03). On 04-04 a React SPA replaced the HTML templates ("scaffold React frontend with Vite, TanStack Router, TanStack Query, Tailwind", "replace plain text chat with SSE stream-json endpoint"). 04-05 to 04-09: chat UI redesign, session management "use cc for session management" (04-07, cc = Claude Code), a "DecisionTreePanel" that shows which files the agent read, slash commands, `/download`, "symlinked module loading", a benchmarks UI ("add benchmark management features", 04-08), @-mentions. 04-10: "architectural decisions documentation for context loader", `module.yaml` manifest. 04-11: "convert it to monorepo", an Astro landing page with deployment guides named "Project Semelweis" and "Project Notcontext", and the same day "rename project from Semelweis/Notcontext to ContextAgora", "rename context-loader-poc to contextagora". 04-12: prompts moved to markdown files; "rename Context Loader to Context Agora across documentation and frontend". 04-13 to 04-18: landing with testimonials, use case spotlights, MAAT logo, demo videos, FAQ, Umami analytics; versions 0.1.3 (04-14), 0.1.4 (04-17), 0.1.6 (04-19), 0.1.7 (04-20); "tasks and two-zone sidebar" (04-15); "/improve-integration command" (04-14); CLAUDE.md injected as system prompt (04-18); a guide "for deploying additional ContextAgora instances behind Cloudflare" (04-18). 04-19 to 04-22: module file execution, `/add-script`, boot-time dependency install, "session persistence with SQLite" (04-22). 04-25 to 04-29: social post, tweet and LinkedIn generation from session transcripts, Context7 docs integration, job scheduling, workflows spec and implementation ("/add-workflow", cron jobs, 04-26), 0.1.8 and 0.1.9, Tiptap markdown editor.

FACT. The April landing (Astro, commit of 2026-04-14) said: title "ContextAgora: The AI support layer for startups"; "AI support that knows your product."; "Connect your AI agents to all your integrations and 3rd parties. Feed the right context to your AI every time, so your Agent can understand the whole picture."; contact `hello@contextagora.com`; case studies Soundmurai ("Eduard, Co-founder at Soundmurai") and MAAT ("Bernat, AI Engineer at MAAT"); "Join the waitlist."

FACT. The plan `docs/plans/archive/10-commercialization-validation.md` ("Context Agora is too generic for outreach. Pick a short, memorable name.") dates from this period (commit 04-07 "add commercialization validation plan for Context Loader").

INFERENCE. April was the month of the fastest building: 292 commits, a full web product in four weeks, with the name changing three times.

### May 2026: features, "EIC Cloud", then the name gcontext (repo A)

FACT. 05-01: "shareable session URLs", "Merge pull request #1 from bleak-ai/feat/shareable-session-urls" (the GitHub org `bleak-ai` is in use). 05-02: "remove non essential features", chat mode, module archiving. 05-03: Playwright E2E tests. 05-04: usage tracking, 0.1.11, a product page. 05-05 to 05-08: landing "anatomy and approach pages", "non-destructive pull", "demo mode". 05-15: "docs(ideas): core idea note on context-centered development" (`docs/ideas/core_idea.md`, Bernat's brainstorming notes), "module apps" (each module can ship a small web app), `/add-app` and `/suggest-apps`. 05-16: "big 0.12.0 release", CLAUDE.md split into system.md, principles.md, module_features.md, the plan "Context Reorg, Contextagora-style". 05-17: multi-app support, "programmatic sessions API". 05-20: "extract core/ shared library, build eic.py CLI", "GitHub Action to sync core/ + template/ to everythingiscontext repo", "orchestrate layer implementation plan" (a Stripe migration tool for gyms, MAAT work). 05-21 to 05-23: run scripts from the sidebar, toasts, "Merge branch 'master' into maat". 05-24: "rebrand Context Agora to EIC Cloud across entire codebase", then "rebrand Contextagora/EIC Cloud to EIC across all pages", "rewrite hero with open-source messaging", "point GitHub links to public everythingiscontext repo", "replace landing with landing-2 (Next.js + shadcn/ui)". 05-25: "archive old Astro landing page", MemoryComparison, waitlist form, "rewrite template README for EIC Cloud". 05-26: ExecutionTrace component, README "comprehensive context engineering overview". 05-30: "rename template package from eic to gcontext", "rebrand platform from eic to gcontext", "rebrand landing page from eic to gcontext", "rebrand docs, CI, and root config from eic to gcontext". The string `gcontext.ai` first enters the repo in these 05-30 commits.

FACT. The EIC landing (2026-05-24) said: "EIC Cloud: a plain-text context management system for AI agents"; "No MCP. No RAG. No vector DB. One folder of plain files; the agent walks llms.txt and reads only what each task needs."; sections "Context is the bottleneck.", "Navigate a tree of context files.", "Build your own integrations. In one chat."

INFERENCE. EIC stands for "everything is context" (public repo `bleak-ai/everythingiscontext`, CLI `eic.py`). The name lasted six days in the codebase (05-24 to 05-30).

### June 2026: gcontext-ai on PyPI, the monorepo, a support app, a hosted MCP connector (repo A)

FACT. 06-02: "publish CLI as gcontext-ai and rebrand demo", "ci: point oss sync at renamed bleak-ai/gcontext repo" (the public repo was renamed from everythingiscontext to gcontext). 06-10: "launch-readiness QA fixes for OSS CLI v0.2.2", "give open source top billing alongside the video". 06-11: "agent-led onboarding for fresh workspaces", "two-pillar repositioning across README and landing", CLI journey and packaging tests, "live connection probes + AI agent journeys with evidence reports", "real-session story page and replay recording", "dashes replaced throughout", release v0.2.3. 06-12: v0.2.4. 06-13: "gcontext navigation diagram", "maat-support case study (anonymized)". 06-14: monorepo restructure, "relocate gcontext-core to packages/", "move template/ -> apps/cli/", "move platform/ -> apps/cloud/", "scaffold apps/support FastAPI app". 06-15 to 06-21: the support app: Electron desktop, local secrets store, "MCP server + context/prompt docs store", "desktop release pipeline (frozen server + dmg)", ad-hoc signing (tags `support-v0.1.0`, `support-v0.1.1`). 06-23 to 06-24: "feat(world): v1 scaffold, world/building/room/file CRUD", "Integrations Hub and Building Interior components", "add mcp", "feat(mcp-minimal): minimal MCP server (files/folders + client-side secrets)". 06-26 to 06-30: mcp-minimal grows into a hosted product: "gcontext connector, cloud/local split, packaging, presence", "multi-workspace + token scoping", "accounts + token issuance", "Postgres-backed cloud + Dockerfile", "point connector default at the deployed cloud (api.gcontext.ai)", "publish connector to PyPI as gcontext-mcp", "hosted login dashboard", "Stripe billing gate (free node cap + Pro unlock)", Supabase JWT then "replace Supabase auth with self-hosted Google/GitHub OAuth" (06-28), "redo landing" (06-28), "render typed folders via sandboxed user components", "redesign gcontext dashboard" (06-30).

FACT. STATUS.md (last changed 2026-06-11) describes four packages: gcontext-core 0.1.0 (local), gcontext-ai 0.2.2 (PyPI, command `gcontext`), gcontext-cloud 0.1.12 (GHCR Docker image), landing (Coolify deploy, gcontext.ai). "On push to master, `sync-oss.yml` mirrors `core/` + `template/` + `demo/` to the public `bleak-ai/gcontext` repo".

INFERENCE. June holds three products in one repo at once: the Cloud web platform (apps/cloud), the OSS CLI (apps/cli), the desktop support app (apps/support), and from 06-24 a fourth, mcp-minimal, which became the hosted "gcontext" at app.gcontext.ai. The folder `_archive/` today holds `cli`, `poc`, `support`, `world`.

### July 2026: the hosted connector matures, then the repo stops and a new one starts (repo A ends, repo B begins)

FACT, repo A. 07-02: self-hosting for mcp-minimal ("docker-compose + env example", "publish self-host cloud image to GHCR on version tags", tags `mcp-v0.1.0` to `mcp-v0.3.3`), "read-path v2 (scoped regex grep, partial reads, glob, batch reads)". 07-03: a Context page that shows what the agent receives, "shrink connect payload to an llms.txt-style index". 07-04: "isometric city layout for context map", "local app host for workspace-stored mini apps", keyring for secrets. 07-05: "real pricing tiers plus terms, privacy, self-hosting pages", "single-source docs folder, shared with gcontext.ai/docs". 07-07: "introduce Workflow type and support workflow guide". 07-09: "add Fumadocs docs site". 07-12: "reposition README around secure execution angle". 07-13: "comprehensive features comparison for gcontext vs. alternatives" (`position.md`). 07-14: public folders (`/p/` route). 07-15: "archive dead apps, clean up CI, repurpose public repo", landing "dark terminal aesthetic". 07-18: "remove the types concept, folders are just folders", "detect_main prefers index.md then info.md as folder main doc". 07-24, the last two commits: "ci: remove OSS sync workflow, bleak-ai/gcontext becomes the standalone CLI repo" and "feat: redesign landing around 'the framework for building stateful agents'".

FACT, repo A landing today (`landing/app/page.tsx`, 2026-07-24): hero "The framework for building stateful agents"; "Your agent is a folder: connections, modules, secrets. gcontext serves the folder over MCP. Use it from Claude Code, Claude Desktop, Codex, or Cursor."; install `uv tool install gcontext-ai`; steps "Init, serve, attach"; "gcontext has no chat loop and no LLM client. The runtime that you attach does the thinking. gcontext keeps the state."; five tools `overview`, `read_context`, `write_context`, `run_script`, `list_connections`. The older page kept at `landing/app/v1/page.tsx` says "One agent, all your integrations." and "Skip the subagent-per-tool setup. Connect once via MCP, your AI reaches Stripe, GitHub, Postgres, and more.", with case studies MAAT (Stefano Saitta, CTO, "64% faster support tasks with gcontext") and Soundmurai (Eduard Aymerich, "79% faster insight generation").

FACT, repo B. `history/docs/decisions.md` (planning dated 2026-07-20): "A directory of folders becomes an agent. Every folder is context." It rejects "The previous gcontext module system with three kinds (integration, task, workflow), `module.yaml` manifests, and typed folders. This was powerful but too complex for other people to understand and use." 07-21: "Initialize gcontext framework with project structure, CLI, and MCP server" with example connections Stripe and Cloudflare; "Add Pi evaluation (rejected) and iteration 0 decision log". 07-22: iteration 1, "Visible script runtime" (a `.venv` per project). 07-23: iteration 2 "state-first gcontext with context ledger, runtime launchers for claude and codex", decision "gcontext is a state manager, not a runtime"; iteration 3 "one HTTP server at a URL, harnesses connect to it" (`gcontext up`, http://127.0.0.1:4242/mcp). 07-24: iteration 4 "flows as reactive state, plus the archive convention". 07-26: "Restructure: history/ for frozen iterations, gcontext-public/ as the live repo"; the README of that day: "gcontext-public/ ... is a separate git repo, pushed to https://github.com/bleak-ai/gcontext and published on PyPI as `gcontext-ai`."

INFERENCE. The hand-over happened in the last week of July: the Cloud repo's landing was rewritten to sell the new framework (07-24), the OSS sync was cut, and the framework repo took the public CLI as "gcontext-public".

### August 2026: the lab, releases every day, a marketplace, agents, the split of bernat-agent (repo B, repo C starts)

FACT. 08-01: iteration 5 (ideas ported from "maat-agent": kept scripts, commands as MCP prompts, agent-facing text in markdown), iteration 6 "strip flows" ("decided by Bernat on 2026-08-01"; "flows never met a real use case"), iteration 7 "apps, agent-authored static sites served by the gcontext server"; the iteration workflow itself was retired ("Retired 2026-08-01 ... the copy, graduate, freeze loop proved too messy in practice"); "Record the day in bernat-agent: hetzner-vps connection, features map, error demo" (a bernat-agent folder exists inside the lab). 08-02: modules "bjjgym-pseo, coolify-ops, mac-disk-space", "Record GitHub remote decision" (versions.md: "Remote (since 2026-08-02): github.com/bleak-ai/framework, private"). 08-04: "Add pypi connection for gcontext-ai package publishing". 08-05: "Move landing page from gcontext-cloud into this repo". 08-07: chrome-cdp connection, journal and vps-ops modules, "opportunity-pipeline workflow draft", the workflow marketplace decisions ("decided 2026-08-07"). 08-08: marketplace tasks closed: template spec, share-workflow skill, "gcontext add command", "0.4.4 release", design system, workflows landing; marketplace API "live since 2026-08-08 at https://api.gcontext.ai". 08-09: marketplace site detail page, admin dashboard; "Archive workflow-marketplace module into history/". 08-10: "Landing pre-launch: connections page, error/404 pages, dead code cleanup, honest legal pages", `landing-v0.1.1`, "switch workflows pages to GitHub registry, remove /admin", "registry migration, release-ops, umami, go-live". 08-11: landing v0.2.0 to v0.4.0, "buttondown connection, gcontext-live email capture decisions", changelog page. 08-12: landing v0.5.0 and v0.6.0, "changelog entry for gcontext 0.9.0", "Landing copy: hero headline to The Agent State Manager", "Agent-ops module: publish path, test loop, and harvest process for the registry agents", "feat: add setup experience", and "feat: split agent into gcontext-agent and personal instance, restructure lab-repo". 08-14: landing v0.7.0, gcontext v0.10.0 changelog ("approved by Bernat 2026-08-14": generated commands, agent dependencies, `explain` prompt, setup script standard; "Removed: The templates/ folder: the bleak-ai/agents registry is the single source of installable agents"). 08-15: landing v0.8.0, v0.9.0, v0.10.0; gcontext-ai 0.10.3 "latest published 0.10.3 (2026-08-15)"; about fifty cleanup commits in one day; README rewritten: "gcontext lab (private workspace)" with `gcontext/` (bleak-ai/gcontext), `gcontext-agent/`, `agents/` ("The public agent registry. Separate git repo (`bleak-ai/agents`)"), `landing/`, `history/`; "fix: mark gcontext-vision as historical snapshot"; "rename agent-ideas/browser-recipes to browser-cookbook". 08-16: landing v0.11.0, "web-poc: reactive web UI exploration over agent flows", "browser-driver POC: Playwright vs agent-browser comparison", diagram-crafter. 08-20 to 08-23: "bot-commenter review dashboard", "release runs for gcontext 0.12.x, agents 0.1.0, landing 0.11.0", agent-friendly 404, markdown content negotiation, llms.txt for the site, OpenAPI, JSON-LD, landing v0.12.0 (08-23, the last landing tag). 08-27: "gcontext-agent: update port and release log through v0.15.0", cronicle connection, "knowledge-grove module", "distribution-pipeline-v2 spec, codex config, and AGENTS.md". 08-30: "knowledge-grove: v5 spec, migration plan, vision, and how.md", "install context standard v5, migrate lab from gcontext-agent", "v5 deprecation, install packages/tasks, retire docs/improvements/dashboard".

FACT, repo C. First commit `2026-08-12 feat: initial state from the gcontext lab split`. `agent.md`: "This instance was split out of the gcontext lab repo on 2026-08-12; the gcontext project's own context lives in the gcontext-agent instance inside ~/Documents/bleak-dev/gcontext-framework (port 4243)." `gcontext.yaml`: `name: bernat-agent`, `port: 4249`.

INFERENCE. August is the month gcontext was a public product with a release train (15 landing tags, PyPI 0.4.4 to 0.15.0 in four weeks) and a marketplace. By 08-30 the direction turned inward: "knowledge-grove" and a "context standard v5" that replaces the agent folder with a `context/` memory folder.

### September 2026: the folder standard, then the rethink (repo B)

FACT. 09-05: "gcontext-framework becomes canonical standard source", "context-evolution experiment, automatic saves, runs runner". 09-06: "context standard v6 to v7.1, facets, placement runs, survey", "context standard v9, one rules file, shape tests", "context loop v9, sync-index-files, track-context-changes, /check-structure", README "explains gcontext, how to start, and every script". That README: "gcontext is a folder standard. It gives an AI agent a memory of your project." ... "gcontext replaces that file with a folder named `context/`. The agent writes each durable fact into `context/`." ... "One rule decides where a fact goes: a path is a chain of common denominators." Three things happen: Save (a hook forces a save every five turns), Track (a status line), Check (`/check-structure`). "The package `gcontext-ai` on PyPI ... bundles a copy of `context/system/`." 09-19: "chore: remove history/ (iterations 0-7, setup-experience, v5-deprecation, workflow-marketplace)", "remove pocs/, web-poc/, requests/, tasks.md", "remove agents marketplace pages from landing", "feat(landing): add packages and standard pages". 09-20: "jev-context experiment with Typesafe API examples and index scorer prototype". 09-21: "feat(experiments): add gcontext-rethink idea docs and MVP server", "refactor: promote rethink and archive legacy project" (the whole previous project, its site and agent state move to `legacy/`), "nest MVP under minimal idea". The rethink README: "It stores context for agents through a trigger that accepts text and a puller that finds context for a task." `idea.md`: "gcontext is a way to store context that follows a standard. The standard keeps the context trimmed and structured. The primary goal: context grows and stays healthy without manual curation." 09-22 to 09-28: a benchmark ("v1 pull and trigger benchmark"), versioned implementations V1 to V4 ("V3 wide Jev search, V4 record writes"), a blueprint, "PageIndex inspiration notes". 09-29: "Rename record and retrieve to learn and recall", "SessionStart recall hook, A/B harness", "the session watcher: event log, tree writes with diffs", "the demo site and the knowledge field prototypes", "the replay harness spec, converter, runner", "16 diversity-map replay cases with redacted session turn logs". 09-30: replay rounds 1 to 5, "stale fact cases", "the replay report: stale facts across files lead".

INFERENCE. Two distinct ideas in one month: first a standard that tells a coding agent how to keep a `context/` folder healthy by itself (v5 to v9), then a server-side rethink where a model (Jev) scores where a fact goes and what to pull. The legacy site still had to stay live ("The site at gcontext.ai must stay live", legacy/README.md).

### October 2026: three iterations in one month, the vision, and public v1 (repo B)

FACT, 10-02 to 10-05 (end of the rethink). Tasks 01 to 20: integrate replay tools, project setup commands, "import recorded Claude sessions", "run session learning once with saved stage evidence", a read-only watcher, "load project context at Claude session start", "compare Jev with Pi for keep decisions", "use Jev for session keep decisions", "support Codex and common coding-agent sessions", short `gc` commands, "correct current system documentation" ("The current project pipeline is `project-learning-v6`, with implementation V5. Property Tree remains independent"), "public demo script", "the animal tree motion demo", "scroll story".

FACT, 10-06 to 10-18 (the "first iteration" of the later numbering). 10-06: "engine tasks 0 and 1: move old code to reference, add NestJS and Mastra skeleton" (`first-iteration/README.md`: "2026-10-06 The restart. The old code moved to `archive/reference/`. A new TypeScript method started"). 10-06 to 10-07: engine tasks 2 to 7b: records, "generic Source input", "public POST /sources endpoint", instances with config, extract-units, summarize-units, questions domain, tree domain, "buildTree, placeUnit", a flow page with "pizza examples". 10-10 to 10-15: domain identification, "remove legacy Mastra and NestJS flow", flow-lab inspect and replay, restructure into `packages/core, apps/server, apps/lab, evals, docs` (10-13), place-units, "shiftboard golden case", a showcase app. 10-17 (41 commits in one day): Ollama Cloud provider, "extraction: keep only what is worth keeping", "golden instance of gcontext-framework" (the memory of the repo written by hand, 59 questions), "folders grow out of content", "Pedal, a fake project with a designed growth pattern", "the gcontext command, the instance store, and the Claude Code adapter", then "pause the Claude Code adapter", "the SEO agent for bjjgym.com, version one, no gcontext in it", trace folders, "the parts of gcontext, the shared contract", "the viewer of the traces". 10-18 (about 90 commits): rerun of a save, "the second iteration plan, approved 2026-10-18", the layout move ("the first iteration goes to first-iteration/"), "remove gcontext rethink", config lines ("keep lines" and "drop lines"), the legend rename ("the piece, the type, the use, and the tree words"; "the capture, the session, and the disk names"), two stages, extraction without turns, "the context tree holds files, and the queue goes".

FACT, 10-19 to 10-23 (the "second iteration"). Live state and a run console in the viewer, "the coding agent adapter spec, the agent as the model provider through MCP step tools", an extraction scorer and gold set, "the brain adapter brain/1" (the Maat brain, 10-19), the adapter boundary with "three members", extraction and load moved into the core (10-20), "the viewer: capture sessions, edit sources, and ask questions", "project connections", "the instance page in three modes", "Claude project memory trial with the tree viewer" (10-21), session titles, a light design system, "capture a saved record with a separate agent through local MCP tools" (10-21), "seed step redesign ... domain vision" (10-22), Tree mode rounds 3 and 11, "classification: split and regroup" (10-23).

FACT, 10-24 to 10-31 (the "third iteration"). 10-24: "docs(third-iteration): vision, names, shared model, challenges, and matching research" (the vision session was 2026-10-23 and 2026-10-24; "approved by Bernat on 2026-10-24"), "addition-tests: one command adds a contribution to a fictional handbook and checks the result". 10-25: methods "guides" (later "folder-index"), "a free method between one input and one output", "Taskpad L and XL, and the fact ledger", "fact-embeddings, the recheck command, the evaluation". 10-26: "the gateway and the viewer on the handbook path, the Maat brain and Taskpad XL instances", "the overnight task, grouped additions as an option". 10-27: "organize research and proof history", "improve daily handbook capture and review", "record the active Maat trial"; checkpoint merged into local main. 10-28 and 10-29: the gateway rethink (documents only; see section 4). 10-30: "session intake for package, brain, and claude-code/2, the gateway declaration and pull, and the bjjgym trial record". 10-31 (19 commits): bjjgym trial fixes; the branch `public-v1`: "remove the archives, move the record into dev, new agent rules and the plan", "phase 3, the new layout, one model runner", "starter handbook, default rules, seed skill", "phases 4 to 5, one command, one settings place, setup that does the whole job", "phase 6, product words in the viewer and the command", "README, configuration page", "Preanalyse replaces the yes-or-no Check", "phase 8, the E2E proof of the quickstart", "the first recording of the E2E proof, 19 of 19 checks", "open sessions show at once, and Close session", "Bernat tested the port in the viewer", "merge main into public-v1", and the last commit of the month: "chore: ready to publish: MIT license, the name @bleak-ai/gcontext, the viewer reads only the data and handbook folders, doctor names the gcontext command, no Maat lines".

INFERENCE. October is the densest month (313 commits). The numbering "first, second, third iteration" is internal to October: the first iteration starts with the 10-06 restart, the second with the 10-18 plan, the third with the 10-24 vision. It does not continue the July numbering (iterations 0 to 7).

### November 2026 (to 2026-11-01, repo B)

FACT. Three commits on 11-01: "docs(trials): the read-signal prompt for bjjgym"; "chore: name cleanup: the fact index in fact-index/facts.json with a move of the old folder, Agents and Drop in the rules, new E2E answers"; "docs(trials): the load from zero and the bjjgym switch: the handbook skill test of four ways on five questions, the goal of the switch from docs to the handbook". Three decision files are dated 2026-11-01: `load-from-zero.md` (the CLAUDE.md load block is not the baseline, the load becomes a skill that Bernat starts by hand), `maat-brain-trial.md` (a second trial runs in parallel: the team's conversations with the Maat brain add knowledge to a clone of its state repo), `name-cleanup.md`.

---

## 2. The names

| Name | First seen | Evidence and what the docs say |
| --- | --- | --- |
| context-loader-poc, Context Loader | 2026-04-02 | FACT. `pyproject.toml` name at the first commit. Docs used "Context Loader" until "docs: rename Context Loader to Context Agora across documentation and frontend" (04-12). |
| Project Semelweis, Project Notcontext | 2026-04-11 | FACT. Commit messages "create comprehensive deployment guide for Project Semelweis", "update deployment guide for Project Notcontext", then the same day "rename project from Semelweis/Notcontext to ContextAgora". INFERENCE: working names of the landing or deployment, alive for hours. |
| ContextAgora, Context Agora | 2026-04-11 | FACT. "rename context-loader-poc to contextagora" (04-11). Landing of 04-14: "ContextAgora: The AI support layer for startups", `hello@contextagora.com`. `docs/specs/instant-demo-spec.md` (05-04) plans `demo.contextagora.com`, `control.contextagora.com`, per-startup subdomains. The archived commercialization plan says: "Context Agora is too generic for outreach. Pick a short, memorable name." The E2E env var is still `CONTEXTAGORA_E2E_URL` (llms.txt). |
| EIC, EIC Cloud, everythingiscontext | 2026-05-20 | FACT. "build eic.py CLI", "sync core/ + template/ to everythingiscontext repo" (05-20); "rebrand Context Agora to EIC Cloud across entire codebase" and "rebrand Contextagora/EIC Cloud to EIC across all pages" (05-24); public repo `bleak-ai/everythingiscontext`. Replaced on 05-30. INFERENCE: EIC = everything is context. |
| gcontext, gcontext Cloud, gcontext.ai | 2026-05-30 | FACT. Four "rebrand ... from eic to gcontext" commits on 05-30. README title "gcontext Cloud". `gcontext.ai` first appears in these commits. Public repo renamed `bleak-ai/gcontext` (06-02). Packages: `gcontext-core` (local), `gcontext-ai` (PyPI, command `gcontext`, "publish CLI as gcontext-ai" 06-02), `gcontext-cloud` (GHCR image), `gcontext-mcp` (PyPI connector, 06-27). Domains in code: `gcontext.ai`, `app.gcontext.ai`, `api.gcontext.ai`, `docs.gcontext.ai`, `info@gcontext.ai`. No document read explains the letter "g". INFERENCE: "global context" (the samperalabs draft folder `global-context` and the article slug `why-ai-agents-need-a-global-context` point to it). Check with Bernat. |
| "The framework for building stateful agents" | 2026-07-24 (repo A), iterations 5 to 7 (repo B) | FACT. Landing hero and README line. Iteration 4 decision: "The product is statefulness, not integrations". |
| gcontext-framework, gcontext-public, the lab | 2026-07-21, 2026-07-26 | FACT. Repo B is named gcontext-framework. README 07-26: "gcontext-framework (private lab)"; `gcontext-public/` was "the live repo" pushed to `bleak-ai/gcontext`. README 08-15: "gcontext lab (private workspace)". GitHub remote `bleak-ai/framework`, private, since 2026-08-02. |
| "State Management for Agents", "The Agent State Manager" | 2026-08-08, 2026-08-12 | FACT. Marketplace spec: hero heading "State Management for Agents" (Bernat's wording). Commit 08-12 "Landing copy: hero headline to The Agent State Manager". |
| context-based workflows, workflow marketplace | 2026-08-07 | FACT. `history/workflow-marketplace/index.md`: "Name: 'context-based workflows' as the full concept name; 'workflow' as the CLI noun." Archived 08-09, pages removed 09-19. |
| gcontext-agent, bernat-agent | 2026-08-12 | FACT. "split agent into gcontext-agent and personal instance". gcontext-agent: the project's own instance (port 4243). bernat-agent: the personal instance (port 4249), repo C. |
| agents, bleak-ai/agents, browser-cookbook | 2026-08-12 to 08-15 | FACT. "The public agent registry. Separate git repo (`bleak-ai/agents`)". Agents named: browser-cookbook (renamed from browser-recipes 08-15), create-post, release-ops, seo-pipeline, support-ops. |
| knowledge-grove, context standard v5 to v9 | 2026-08-27 to 2026-09-06 | FACT. Commit messages. README 09-06: "gcontext is a folder standard." |
| gcontext rethink, triggers and pullers, learn and recall, Property Tree, project-learning-v6 | 2026-09-21 to 2026-10-05 | FACT. "gcontext-rethink idea docs and MVP server"; "Rename record and retrieve to learn and recall" (09-29); README 10-05. Removed from the tree on 10-18 ("remove gcontext rethink"). |
| the engine, the flow lab, the method, the gcontext workflow | 2026-10-06 to 10-18 | FACT. "engine tasks 0 and 1" (10-06). Legend of 10-18: "the gcontext workflow: The core of gcontext ... Replaces: the method, core, the shared code, gcontext (as the code)". AGENTS.md today bans "engine" in user text. |
| instance, brief (config.md), context tree, unit then piece, domain, trace viewer, adapter, capture, seed, append, rerun, load | 2026-10-17 to 10-18 | FACT. `second-iteration/decisions/legend.md` ("Bernat named the parts in a naming round, one question at a time, from the outside in"): "the piece of information ... Replaces: information unit, unit", "the capture ... Replaces: save", "the instance agent session ... Replaces: run". |
| memory layer, adapter, process, piece of information (vision session words) | 2026-10-23 and 10-24 | FACT. vision-session.md: "'memory layer' is now the handbook, 'adapter' is the gateway, 'process' is an agent or a session, 'piece of information' is a contribution." |
| handbook, gateway, agent, session, contribution, knowledge and know-how, template, purpose | 2026-10-24 | FACT. names.md: "all names decided on 2026-10-24". Bernat: "Ok, let's go w handbook", "gateway sounds good", "agent sounds good", "ok, session then", "contribution sounds good". Rejected by Bernat: "a context" ("context means a lot of things in the world of AI"), "setup" (loses why the adapter exists), "conversation" (too specific), "run", "information and instructions", "pattern" (too general), "takeaway" ("what are u telling me, that we are going to name all of this workflow 'takeaway' ??"). |
| reader, model runner, rules.md, settings.json, fact index, viewer, Preanalyse, proposal, load | 2026-10-31 | FACT. plan-public-v1.md names table: instance becomes handbook; `config.md` and `handbook.json` become `rules.md` and `settings.json`; adapter becomes reader; ledger becomes fact index; trace viewer becomes viewer; "brief, context tree, unit, domain: removed". "Preanalyse replaces the yes-or-no Check" (10-31). AGENTS.md: "Do not use these old words in user text: instance, brief, context tree, unit, domain, ledger, adapter, trace viewer, engine." |
| @bleak-ai/gcontext | 2026-10-31 | FACT. decisions/2026-10-31-public-v1.md: "The npm name `gcontext` belongs to another package, so the package is `@bleak-ai/gcontext`, and the command stays `gcontext`. The GitHub repo keeps its name until it is published." `package.json`: `"private": true`. |
| Jev | 2026-09-20 | FACT. Appears in commits ("jev-context", "V3 wide Jev search", "compare Jev with Pi for keep decisions") and in idea.md ("Jev scores documents for relevance"). Not defined in the documents read. |

---

## 3. What each version did, in plain words

Note on numbering. Repo B uses two schemes. July and August 2026 had "iterations 0 to 7" (frozen folders, removed 2026-09-19). October 2026 has "first iteration" (10-06 to 10-18), "second iteration" (10-18 to 10-23), "third iteration" (10-24 on). Both are given here.

### v1: gcontext Cloud (April to July 2026, repo A)

1. A self-hosted web app (FastAPI backend, React frontend, Docker image on GHCR, port 9090) where you pick which "context modules" the agent loads: integrations, workflows, tasks, each a folder of markdown with a `module.yaml`, stored in your own git repo.
2. A built-in chat that runs the `claude` CLI as a subprocess with those modules in its working folder; the agent reads a module, writes a Python script, runs it, and returns the result ("READ, GENERATE, EXECUTE").
3. Secrets by name: modules declare which secrets they need; values live in Infisical and are injected per command by Varlock, never written to disk or shown to the agent.
4. Extras built along the way: a decision tree of files read, benchmarks, cron jobs, workflows with run logs, social posts from sessions, module apps, Playwright tests, an OSS CLI (`gcontext-ai` on PyPI), a desktop support app, and from June a hosted MCP connector (`gcontext-mcp`, app.gcontext.ai, Free and Pro at $12 a month) with the folder structure in the cloud and execution on your machine.
5. Its position (position.md): "Typed folders the agent reads AND writes", "Names in cloud (agent sees what exists), values on local machine", "Runs on your machine, secrets injected at runtime, output scrubbed", "Works with any MCP client".

### gcontext framework, iterations 0 to 7 (July 20 to August 2026, repo B, public as gcontext-ai 0.4 to 0.15)

1. "Your agent's state lives in a folder. Plug it into any runtime." (iteration 2 README). The folder: `gcontext.yaml`, `instructions.md`, `secrets.env`, `connections/<service>/connection.yaml` and `index.md`, `modules/`.
2. One local HTTP server, `gcontext up`, serves the folder over MCP at http://127.0.0.1:4242/mcp with five tools; Claude Code, Claude Desktop, Codex or Cursor attach by URL. "gcontext is not a runtime. It has no chat loop, no LLM client."
3. A "context ledger" lists every path by which context reaches the agent: loaded, on demand, skipped, uncontrolled. Nothing is pushed invisibly.
4. Tried and dropped inside this version: a Pi frontend (iteration 0-pi), a custom REPL (iteration 2), stdio transport (iteration 3), flows as reactive state (iteration 4, stripped in iteration 6), static apps served by the server (iteration 7).
5. Around it in August: a landing with a changelog, a workflow marketplace and then an agent registry (`bleak-ai/agents`: browser-cookbook, create-post, release-ops), `gcontext add <agent>`, telemetry, and two instances in daily use: gcontext-agent (the project) and bernat-agent (personal).

### Interlude: the context standard and the rethink (August 30 to October 5, 2026)

1. The standard (v5 to v9): "gcontext is a folder standard. It gives an AI agent a memory of your project." A `context/` folder, a `/save` command every five turns, a status line that counts new facts, a `/check-structure` command that proposes the smallest tree, a git hook.
2. The rethink (from 09-21): a server with a "trigger" that accepts raw text and a "puller" that returns pointers; a model (Jev) descends `index.md` files level by level to choose the folder and file; versioned implementations V1 to V5 measured by a fixed benchmark; "learn" and "recall"; a session watcher and a replay harness over recorded Claude sessions.

### First iteration (2026-10-06 to 2026-10-18, repo B)

1. A restart in TypeScript (`first-iteration/README.md`: "The old code moved to `archive/reference/`"): a five-step build of a tree from "units" of information: identify domains, define criteria, assign values, order criteria, build the tree with code.
2. A "flow lab" (NestJS and React) to run, inspect and replay the steps; later `place-units` to add one note to a frozen tree.
3. A hand-written "golden instance" of the repo itself (59 questions) showed the limits: "gcontext could not build a tree: 110 units were 156 KB, and the steps take 100 KB". "Three days of extraction from raw sessions built no tree."
4. Pedal, a fake project of short conversations, gave six placement rules in one day. The `gcontext` command, an instance store in `~/.gcontext/`, a Claude Code adapter (paused the same day because its Stop hook "held the windows at every Stop"), and an SEO agent for bjjgym.com as the one real user.
5. The parts and the shared contract (adapter, extraction, placement, trace, save, load), a trace on disk for every save and load, and a trace viewer with a Rerun button. "What the second iteration keeps": the core, the SEO agent, the viewer, the free proofs.

### Second iteration (2026-10-18 to 2026-10-23, repo B)

1. Direction (PLAN.md): "gcontext is the memory of the SEO agent of bjjgym.com, and every session with an instance must be better than the session before, visibly, in the trace viewer." One agent, real sessions, no fake project.
2. The brief: a `config.md` per instance with "Keep" lines (what a piece is) and "Ban" lines (what never enters); every kept piece cites a keep line, every discard a ban.
3. The legend: one name for each part (piece, capture, session, instance, seed, append, rerun, load, context tree); two stages in the trace (extraction, classification); the tree holds files.
4. The loop: session, capture, trace, review one step, change one rule, rerun from that step. The viewer gets a run console, live state, session capture, source edits, an instance page with Sessions, Tree, Ask and History.
5. New sources beside the chat: the Claude Code adapter `claude-code/1` with a startup retrieval skill, the brain adapter `brain/1` (the Maat brain's tool-call record), and "a separate agent through local MCP tools" that captures a record. By 10-21 "the instance has 84 pieces in 58 files".

### Third iteration: the vision of 2026-10-24 (repo B)

1. "We start the third iteration from 0." The product is a handbook: "the knowledge and the know-how that it needs for its work, in folders and files." A gateway sits between the sessions of an agent and the handbook.
2. The hard problem is named: "the problem that we are trying to solve is not one of generating information, but structuring information". The core job: match the information extracted from a session with the handbook and find where it goes.
3. The addition tests: one command adds a fictional contribution to a fictional handbook (Taskpad) and checks the result; methods compared by accuracy and speed against `simple` (one agent with its own tools); six methods removed; `folder-index` and `fact-embeddings` accepted.
4. The gateway: a session becomes a proposal on a staged copy of a real handbook; a person accepts or rejects; a fact ledger with vectors finds the facts a piece touches. Real instances: the third-iteration folder itself, the Maat brain, Taskpad XL. The bjjgym trial of 10-30 and 10-31 "proved the full loop".
5. Rules settled on the way: the handbook stays folders and files that humans read and agents grep (no graph); each folder owns its template and its purpose; the LLM Wiki pattern is the baseline; a rejected session stays rejected; a done session is final; the gateway points at where the sessions appear.

### Public v1 (2026-10-31, repo B main)

1. README: "gcontext gives a coding agent a handbook: a folder of Markdown files with what the agent needs to know about a project. ... When a session is finished, gcontext reads it, keeps what your rules ask for, and proposes changes to the handbook files. You accept or reject each proposal. At the start of each session, the agent reads the handbook."
2. Setup in five steps: `gcontext doctor`, `gcontext init <name> --project <dir> --handbook <dir>` (writes `rules.md`, `settings.json`, a starter handbook with `product/`, `architecture/`, `connections/`, `plans/`, and a load block in `CLAUDE.md`), a seed skill that the developer's own agent follows to fill the handbook, `gcontext build` (the fact index), `gcontext viewer`.
3. One capture: read (code), Preanalyse (optional, one call), extraction (pieces that cite a Keep line, discards that cite a Drop line), proposal (operations update, supersede, add, new_file on a copy), description, review by a person. "A capture of a normal session makes about 5 model calls and takes one to three minutes."
4. Plug points: readers (`claude-code`, `package`; Codex and pi planned), model runner (`claude -p` with the Claude Code login; `replay` for tests), load (a block in `CLAUDE.md` and `AGENTS.md`). The target: "A developer who uses Claude Code reads the README and sets up a handbook for a project in 10 minutes".
5. Status: MIT license, npm name `@bleak-ai/gcontext`, `"private": true`, not published ("I won't make it just yet public, I wanted to have it organised, that's all"). Two live trials: bjjgym (the handbook replaces `docs/`) and the Maat brain (5 minutes a day of Preanalyse and accept or reject).

---

## 4. What was abandoned, and why

Each item gives the source. Quotes marked "The user said" in DECISIONS.md are Bernat's words as the document records them.

### From repo A, `docs/DECISIONS.md` (gcontext Cloud)

- GitHub Contents API per request (the first implementation, "reversed after ~4 days"). Reason: "The user identified this: 'The current approach where we always are directly uploading to git doesn't make much sense.'" Replaced by a local git clone.
- Copies of modules into the agent workspace. "The user had three copies of the same data (remote, local clone, and context/ copy) and said 'could this be simplified?'" Replaced by symlinks.
- Direct env injection instead of Varlock. "The user defended this repeatedly against suggestions to replace varlock with direct env injection: 'accept that maybe there are new products like varlock that you're not much aware of.'"
- Local `.env` files. "The user explicitly stated: 'I want to proceed with the infisical integration because I don't want to have the .env saved locally.'"
- Infisical credentials in module schemas. "The user insisted: 'the infisical variables CANNOT live in the .env.schema, they are platform base, it doesn't even make any sense.'"
- Per-module `.env.schema` files. "The user said: 'I don't like this whole enrichment, it feels complicated. Why do we even need it? Can we just have a global .env.schema in the root folder under context/?'"
- A backend session store and a frontend session store. "The user explicitly rejected both backend and frontend session stores: 'Can't we just parse the sessions as how they are saved in claude code and then show them in the sidebar? Why do we have to even replicate any of their logic.'" This decision was itself "Superseded 2026-04-21" by a write-through SQLite store, after two production failures (sessions missing on a second computer; coupling to Claude Code's private JSONL format).
- A web form for module creation. "The user explicitly rejected a web UI form for module creation: 'I would just go for the chat for now, do not create the web ui.'" Later relaxed: "a minimal scaffold form is faster for users who already know what they want."
- Secret values or status in the module editor. "'The chat app takes care of it, not here, this has to be very simple.'"
- A persisted decision tree. "The user explicitly chose this: 'I don't want to go back and see which things were found before.'"
- Rejected storage backends: "Cloudflare R2+D1 ('overkill for MVP'), Supabase ('not a fan'), SQLite+local FS, Firebase, npm registry."
- The repo layout "root-as-core" and "a single uv workspace lock for everything" (monorepo restructure of 2026-06-14).

### From repo A, `docs/ideas/core_idea.md` (Bernat's brainstorming, recorded 2026-05-15)

- "Earlier version: a static tree representing the whole knowledge of a company. That worked for integrations: they're stable, they belong in a permanent tree. It broke for everything else: couldn't scale; couldn't represent disposable, per-task work; tasks and one-off investigations cluttered the tree, never got cleaned up. The fix: make context loadable."

### From repo A, commit messages (dropped sub-projects)

- FACT. "feat: remove non essential features" (05-02), "feat: remove specs" (05-04), "feat: remove real run" (04-26). "chore: archive dead apps, clean up CI, repurpose public repo" (07-15): `_archive/` holds `cli`, `poc`, `support`, `world`. "refactor: remove the types concept, folders are just folders" (07-18). "ci: remove OSS sync workflow, bleak-ai/gcontext becomes the standalone CLI repo" (07-24).
- INFERENCE. The hosted connector (mcp-minimal, app.gcontext.ai, Stripe billing) has no commit after 07-23 and no mention in repo B. Its fate (shut down, kept running, or sold) is not recorded in the files read.

### From repo B, `history/docs/decisions.md` and the iteration decision logs (July and August)

- The Cloud module system. "The previous gcontext module system with three kinds (integration, task, workflow), `module.yaml` manifests, and typed folders. This was powerful but too complex for other people to understand and use. The classification system created decision paralysis ('is this a task or a workflow?') and the manifest format had too many fields."
- Pi as chat frontend (iteration 0-pi, 2026-07-21): "Two issues in 5 minutes. Version incompatibility and session bleed." Kept: "The `claude -p` wrapper approach. It's ~80 lines, we own it".
- The custom REPL (iteration 2): replaced by "a ~40 line launcher that prints the context ledger and then execs the real `claude`". Also "Auto-injecting instructions.md through the MCP handshake `instructions` field (built, then reverted the same day: hidden context channels contradict a context management system)."
- stdio transport (iteration 3): "stdio inverts the mental model. There is no 'server running', every harness silently spawns its own private copy".
- Flows (iteration 6, "decided by Bernat on 2026-08-01"): "flows never met a real use case. The demo-brief flow stayed the only flow ever written; the real test example Bernat planned to supply after iteration 4 never appeared."
- Per-folder secret scoping (iteration 5): "Rejected by Bernat: per-folder secret scoping ('pretty pointless' while the union model works)".
- The iteration workflow itself: "Retired 2026-08-01. Iterations 5 and 6 were the last ones; the copy, graduate, freeze loop proved too messy in practice."
- The workflow marketplace and its API: module archived 2026-08-09; "Landing: switch workflows pages to GitHub registry, remove /admin" (08-10); "API decommission" listed as an open gate (08-15); pages removed 09-19. Reason not quoted; INFERENCE: the GitHub registry replaced the hosted API.

### From repo B, `first-iteration/README.md` (tag `before-cleanup`), "What did not work, and why"

- "The Claude Code adapter held the windows at every Stop. The Stop hook stored in the foreground: the owner waited 6 minutes for 16 units. ... It was paused on 2026-10-17."
- "Three days of extraction from raw sessions built no tree. ... A full check cost 300,000 to 500,000 tokens and one hour. ... The lesson: the adapter shapes the input; extraction from messy text is not the job of the placement."
- "The night run of parallel agents. Parallel agents that try prompt changes on the full pipeline are not a method. It was stopped after 20 minutes."
- "The weight around the method. The flow lab grew to 9,031 lines, 8 packages, and a second install. 94 percent of the tracked files were archive."

### From repo B, `dev/challenges.md` (2026-10-24 and 10-25)

- The first ranking of challenges: "yes, these are all challenges true, but they are very superficial, when we go deeper into the details, after giving to it much more though I think that the problem is with llms." ... "but the problem that we are trying to solve is not one of generating information, but structuring information, this is the real problem, how to structure information."
- The placement interview: "i understand that you want to ask me what are the things that I know when I place a piece of content in one place or another, and there is some logic to it, but right now we don't have a place to define this information, you are just simply writing prompts, we want to create the abstraction layer that is able to handle information".
- The IR (intermediate representation) as the main answer: "wait I am not sure if the IR is exactly what I had in mind, what I had in mind was a language that we can give to an AI agent and based on the requirements for what needs to be changed, is able to understand the purpose and find the place and the operation needed to do with the information in an easier way ." ... "Let's wait a moment before we start building stuff, this is not easy".
- Fixed kinds and fixed questions (Claude's "idea 1"): "If you are defining these kinds like knowledge or know how I believe that we are limiting ourselves already too much. ... We don't want to make something static".
- One simple question as the match: "a simple question it's too simple. It's not able to understand understand of all the intricacies that a piece of information has the structure and the meaning and everything that it's needed to then be able to add it in the handbook."
- A graph as the base: "All of these systems like Memo and Graffiti, they works with graph. ... I don't want a system where everything works in graphs and the structure of the information it's based on graph. I don't want that."
- Rules at the handbook level: "it's important to not put all the 'rules' like 'templates' at the handbook level".
- The challenges phase itself: "the thing is that we've been talking about the challenges to long." ... "I want to explore a minimal version of one approach and see what is possible and in which direction to go."
- Four operations around grep (find, open, write, new-folder): "honestly those operations are absolutely not the soltuion, this is not doing anything."
- Claude's wording "No hidden structure is added beside the files": "What do u mean by hidden structure besides the files. This is exactly what I want, why is it banned" (2026-10-25). Structure beside the files is allowed; it is the abstraction layer.

### From repo B, `third-iteration/addition-tests/overview.md` (tag `before-cleanup`, 2026-10-24 and 10-25)

- Six methods removed on Bernat's ask ("can we remove the plans that have cleary not worked?"): `analyze-first` ("It reads the handbook two times. It is the slowest method, and it uses the most tokens."), `map-ai` ("Each update writes the whole map again ... Its map holds placement rules that the model made up"), `map-ai-inside` ("The map also repeats the facts of the handbook inside the handbook."), `map-code-inside` ("The agent took `MAP.md` for the index of the folder"), `map-code` ("the agent forgot to add a new folder to that list 2 times in 3"), `tree-only` ("It is slower than `simple`."). Lesson: "The index files of the folders do the work."
- On the first `accepted/` folder: "what?? this is not good, on accepted I just wanted the single run that we accept as proof of the method, not the code and not whatever there is now".
- The overnight task (9 iterations to make `fact-embeddings` faster): "Closed by Bernat on 2026-10-26 after iteration 9: the grouped path (2 calls in place of 10) is opt in, because a large group can drop a sentence of a piece."

### From repo B, `dev/gateway-rethink.md` (2026-10-28 and 10-29)

- Building before defining: "WE define them and how their agent looks like and then we try to build the gateway, we went too fast."
- A required server: "I guess that in my head I have an http post endoiunt called submit-session or something similar, this is what it is in myy head, but I am not sure if this is the best case, because then if someone want to use gcontext locally has to have a ... server running, which is very annoying" ... "I AM NOT SURE IF IT MAKE SENSE TO HAVE A SERVER FOR THIS, I DO NOT KNOW. First will be local".
- Custom code per developer: "what I don't want is to make that every developer has to build a custom solution for yeah for each thing, like building a fucking SCTP request and everything, and then they have to manage when it's sent".
- The word "integration" and an extra program: "What the fuck but why aren't we calling this the gateway? Why is now integration? ... What I've told you is that I want that it's easy to fit these things. Here we have the sessions in the folder. And then we have the z context instance. The question is how can we easily fit the sessions to the gcontext instance?" Result: "The word 'integration' is dropped." The gateway "points at the place where the sessions appear".
- "Process only the new parts" of a session: replaced by "the session should never arrive in the viewer if there are still things to come, if something else arrives, it should be in a new session".
- Tests at that stage: "Don't bother about the test and they are not important now."

### From repo B, `dev/decisions/` and `dev/plan-public-v1.md` (2026-10-31 and 11-01)

- The archives and the second-iteration code: "Cleanup, the things can stay in old commits or another branch. Most stuff can be deleted though". Deleted in phase 2 and 3 (kept in tag `before-cleanup`): `first-iteration/`, `second-iteration/`, `proofs/`, `uses/`, tree sorting, the `claude-start` hook, the MCP agent bridge, the `conversation`, `source` and `brain` adapters, the Ollama provider.
- The gateway declaration file (plans A and F of 2026-10-27): "In version 1 the readers are fixed ... so the declaration leaves the user surface and the code. It stays in the tag `before-cleanup`."
- Codex as worker for this branch: "wait, no codex, use opus 5.5 subagents".
- The yes-or-no Check: replaced by Preanalyse (10-31). Bernat on the Check: "At the end of the day I think that in this process is not so important that an AI tells us 'is it wroth' but that the AI can help us map what happened in the conversation in a way that is easier for us to understand in a glance" (trials/bjjgym/index.md).
- The load block in `CLAUDE.md` as baseline (11-01): "I think that I don't like the Block and we have to rethink completely how the handbook is loaded onto an AI agent" ... "for now I think I want a skill, that I can activate when I want to use it, to control when it's being used".
- A slow move of bjjgym from `docs/` to the handbook (11-01): "noo, I want to make the siwtch ... we have to start over then and define exactly what is the goal of this trial".
- Publishing now: "I am not sure, keep it like it is right now, I won't make it just yet public, I wanted to have it organised, that's all. And maybe in a future make it public, not a decision for now".
- Maat lines in the public dev folder: "Keep it, cut the Maat lines (Recommended)". The five mentions were cut; the 2026-11-01 Maat trial decision names Maat again.

---

## 5. Bernat's own words found in the docs

Verbatim, with the file. Repo A quotes are attributed in the source as "The user said" or "The user explicitly stated"; I take them as Bernat's words. Long answers of the vision session are given in full because they are the raw material of the story.

### Repo A: `docs/DECISIONS.md`

- "The current approach where we always are directly uploading to git doesn't make much sense."
- "could this be simplified?"
- "accept that maybe there are new products like varlock that you're not much aware of."
- "I want to proceed with the infisical integration because I don't want to have the .env saved locally."
- "the infisical variables CANNOT live in the .env.schema, they are platform base, it doesn't even make any sense."
- "I don't like this whole enrichment, it feels complicated. Why do we even need it? Can we just have a global .env.schema in the root folder under context/?"
- "Can't we just parse the sessions as how they are saved in claude code and then show them in the sidebar? Why do we have to even replicate any of their logic."
- "I would just go for the chat for now, do not create the web ui."
- "better distribution and organisation" (what he wanted), not "more features or error handling".
- "The chat app takes care of it, not here, this has to be very simple."
- "I don't want to go back and see which things were found before."
- "differentiated from the modules as they can't be unloaded."
- "Two browser tabs is the diff." (benchmark section; attribution to Bernat is INFERENCE, the source gives no speaker)

### Repo A: `docs/ideas/core_idea.md` ("Context-centered development: source notes from Bernat", 2026-05-15; the document is Claude's capture of a brainstorm, the two block quotes are marked as his words)

- "The AI can do everything, but it needs the right information. The whole game is making all your company's info available, then letting the AI pull the right slice per task with the least noise possible."
- "Make all your company's tools and information available to the AI as plain files; let the agent pull only what it needs per task. Loadable modules in, noise out."
- [paraphrase of the same note] Why folders and markdown: simplicity, agent-friendly, "The medium is the message: simple files, no abstraction tax." Why llms.txt: "Navigation, not retrieval." The split: "The architecture is human. ... The content can be agentic." "Only a human can draw the outline. The agent can write what goes in the rooms once the rooms are drawn."

### Repo A: `docs/ideas/info.md` (undated, the foundational note)

- "Rethink pieces of context as modules." ... "The APP is a CHAT to opencode / claude. And every session / conversation loads a specific amount of context / knowledge. The user has a set of context available for him and he can choose what he wants to enable for a specific session."

### Repo B: `history/iterations/4/decisions.md` (2026-07-24, via git history)

- "In AI, information is the currency."

### Repo B: `history/iterations/5/decisions.md` (2026-08-01)

- per-folder secret scoping: "pretty pointless"

### Repo B: `history/workflow-marketplace/index.md` (2026-08-08)

- Hero heading "State Management for Agents" (Bernat's wording).

### Repo B: `dev/vision/vision-session.md` (2026-10-23 and 2026-10-24)

The rules of the session:

> what I say in this conversation will be the most updated view of gcontext and it's purpose, now I will put every rule and constrain that we need to achieve in order to make gcontext a reality, I don't care what I put before or anything from the past, yet, we will define gcontext from scrratch, afterwards you can ask me things that don't match what we've said before, but now in this first run , the third iteration, we'll define it from scratch

> I will explain again what is the whole idea with the adapters and what gcontext does, and you will ask me questions and grill me but just based on this conversation. Is it importance to set this rules as when I start to tunnel vision onto this I don't want to be bothered about anything that is not my current vision, afterwards, when this is done, we can proceed onto comparing what we have now and how to build the third iteration

The explanation:

> Okay, so here is where we are. The problem that I am trying to resolve is how AI is able to find information, use it, explore, tag with the user, and then understand which of this information should be added again in a kind of memory for the agent. What we are building is just this memory layer that serves to pick up information and then work with it, add new information related or not, and then add it again to the memory layer.
>
> Now when we come on to doing that, we see that there are many problems because if we allow just the AI to add the information, it doesn't do it in a right way. Why is that? Because these models, LLMs, are good at predicting the next token or whatever they have been trained at. But what they cannot do is organise context properly. They can do it better if you ask a very large LLM how to organise this in a nice way and following some specific rules. This can be done, but it requires the human to specify these rules and to give the sense of the whole agent or purpose of the memory layer to the AI. Now what do we want to do is to give the AI the set of tools and here I don't mean tool calls or anything, just tools in general. We want to give the AI away to structure the information following rules where these rules come from non-deterministic values. What do I mean by this? In each agent, there is a memory layer, and this memory layer serves one purpose, but instead, but inside of this memory, there might be specific parts that serve one specific purpose inside the whole memory, What we want to do is To give the AI the tools to understand for one specific piece of information to which purpose itself, and based on this, be able to locate it in the right memory. This can be in the global one, but it can also be in a specific one. And here are not just two levels. There may be many many levels, and we can use a lot of information to be able to place it properly, because if for example the agent is loading some type of information, then we can know that the agent has loaded this information, and when the information is worked and new things are added, there's a high degree of probability that when we add this information again into the memory layer, it's in the same purpose. This is just to give you an idea of what is possible and with which variables do we work.

Answer 1 (where purposes come from):

> This depends on the information. Like for example, there can be that an AI agent has to do support tasks. And then there is a support folder, and inside there are playbooks, and then there is one file for each playbook. In that case, the purpose of the support folder would be to store the playbooks to be able to be used for support tasks. Or here maybe it could be even better if there is a playbooks folder inside support. And in support there is a index.md file that tells the agent how to use the files inside playbooks. Another one can be for example one folder called connections and inside there are the values of connections used in an AI agent. There is stripe, there is FireStore, there is Postgres, and then inside each of these connections, there is a index.md f file that explains how to use these connections. [...] By memory, it seems that it's just information, which to be very just information, but we can also have rules and more kind of operation things. Here the problem that I am seeing is that by information, sometimes it's mean just words, just information, like what you might find in a encyclopedia, pure information, but then there is also playbooks or connection files, which it's also a type of information, but that serves a specific purpose.

Answer 2 (pure information against a playbook):

> Changes because we have to understand where each type of information goes. In some cases, and this is what makes this so complicated, we have to put some beauty information inside a connection file, for example, but the overall purpose of the file is the one that is defined by the connection folder. And here the problem is in more how I've been treating the solution for G context. As now I was always just scaring about the pure information and how to be able to structure it, which to be honest, I reach some progress, but this is very complicated, especially when there are a lot of pieces of information. It's very complicated to structure everything right. [...] I think that it's very important to define and put more emphasis in what is the structure inside of a folder, and not just that, but what is the structure inside the files of a folder inside the parent folder, Because this is what able to do the cases of the connections and support playbooks right if we define from the parent connection and the parent support folder, what is the right structure of the folder and files under the subfolders.

Answer 3 (what a parent defines):

> Like in both cases what I mean is that inside connections there is a index.md file and then there is a reference to each folder inside connections, and then it's instructed okay go to stripe an example of a connection and read the index.md file to know this, and then read this other file inside stripe to know that. For example, a pattern I've used before is to have a verify.p to be able to run a Python script to check that the connection works. In the case of the playbook, it can be for example to have a playbook.md file for each playbook, and then the agent is able to know exactly which name has the file that it needs to search. These are just examples. And I'm not sure where should be defined. This is just me that when I was thinking how can I create the best information for the agent to access, I've thought of that. My goal is that this can be done in a non-deterministic way by the AI. And that the result is even better

Answer 4 (success):

> The goal is that the agent that uses this memory layer is able to do the actions or answer the things that the agent needs to answer in a faster, more accurate and cheaper way than before. This is how we measure it. In some cases we need to do actions like in the support or connections and in other cases we need to just answer information. But here the system is better if the right information to either return it or to do an action or to do some research, but when the right information is structured in a better way for this agent.

Answer 5 (the adapter):

> This depends on agent to agent. We have to provide in the setup of each instance of the system Gcontext that we are building So that it's easy by the person that implements it to define which are the rules that make some information relevant or not. We have to see a method that it's easy on each JSON that they are building some rules. This is what I call the adapter in the second iteration. And this is what exactly what defines how the information is loaded, which information it's kept, and how to extract this information from each session, or not really session, but how to extract this information from each process that the agent has.

Answer 6:

> I am not sure, but we as the people that provide the context want to figure it out how to create the rules and the infrastructure so the people can set it up this instance in the easiest way possible for their setup. But this is something that we need to explore. I d do not have an answer right now on what needs to be exactly what the person defines.

Answer 7 (the life of the structure):

> I do not know. This is the part that must happen. I don't want that the human does it, but this is exactly what I am having so many problems about. I am not sure how to define the structure. I am not sure how to define it. I am not sure how much a human needs to be involved. Or in which cases a human has to be involved. And I am not sure how to trigger that it changes over time. It's something that I've been kind of recusing, and maybe it's not worth it. The fact that a system can change completely if new information is added and it makes more sense to restructure this in a better way. I'm not sure if this level of reshuffling it is needed. I think that there has to be some adaptability in the memory layer of the Asian, so that new folders and maybe even new domains can be created, but completely 1008 reshuffle maybe is not needed as I've tried to attempt before. If it's possible, perfect, but I am not sure it's feasible.

Answer 8:

> it doesn't really matter at all, this is just a memory layer and the adapter has the rules how the information is processed, any agent can use it if it can properly connect to the adapter to read the contents and update them if it is able also, no restriciton on that front

Answer 9 and its addition:

> yes, It depends on the specific instance of gcontext and what is the purpose of it

> Regarding the question number nine, I wanted to add that yes, but we don't want to add the information to G context if it already exists in some other place. For example, It's quite normal that now our agents have also access to APIs like to Notion or to Stripe and a database. We don't want if the agent has access to these third party. What we don't want is to have to fetch the data from this place and repeat it in G context. We want to be able to have the instructions to access this third party. But this just in this case, it's not that every G context instance will have access to third parties, it's just to put your purpose that the things have to have a meaning. This was regarding question nine.

Answer 10 (hard limits):

> Some rules are that information cannot or should not be repeated.
> And also in each G context instance there is the rules and purpose and process defined in the setup what makes every instance different. The rules of each of these instances must be respected. We must find a way not to put general rules, but we must allow the persons using G context To be able to specify these rules and their needs of their Asian easy enough, and not just Asian, also process. Let's just call it process. So that the context that builds in G context is easy to grow. Basically, no one knows G context, but we must find a way that it's very easy to use and understand what's the purpose, and with a basic setup of how do they want to use it, they can already get a very good value. This is very very important because without a good setup and if the rules are not easily enforced, I mean the rules that their needs of GContext need, which will depend in every instance. And they might also be able to change them and tweak some things, so we will come to this.

Answer 11 and the names:

> Process is honestly a very common word in this case, it serves both purposes, and actually with names I've have a lot of problems and I don't believe that these are the best names at all. Now that I have explained you what is your context, which names would you use for it?

> These are quite but honestly a context is not good why because context means a lot of things in the world of AI we already have G context and this is just confusing by the setup it's true that I've made setup but you have to understand why I chose adapter I am not a fan of adapter but it has the purpose of being in the middle place between whatever thing the user does with AI which in the test cases as I can envision it will be a conversation but conversation very important that it's not the word because it's too specific and but between this thing and G context and the bugging where we store the information with our roles then a process it's not completely bad but it's also not the best I think regarding the others they are too general I think same with run information and instructions the pattern a piece of information I've used it a lot but I don't like it I'm not sure if there is something better and index.md is just an example it's not the same used always this is not something decided this is a very opinionated decision and I don't think that I want to go for it just yet can you just for every concept give me some options that I can choose

> Give it actually a bit of thought to each option. Don't say it too quick. I want to see that you put some thought into it.

> 1. I like space, maybe even better than instance. but you decide. If I decide handook, would you suggest to use space handook, or instance handbook? Or gcontext handbook, or just handbook, I get what u mean, could work actually, drop instance or space and just use handbook right?
> 2. Ok, let's go w handbook
> 3. gateway sounds good
> 4. agent sounds good
> 5. here still not sure, from those session seems to be the one that makes more sense still, task doesn't really fit conversation which is a common use for it.
> 6. but maybe there are more types of information in the future, I am not sure if I want to restrict this. for now these names are good
> 7.sounds good
> 8. the problem is that all of this are too specific, too small, maybe in one "session" (session needs to change, not specific enough) , it's decided that a whole new support workflow has to be added in the handbook, what are u telling me, that we are going to name all of this workflow "takeaway" ?? Or the same if a new connection is added, with 3-4 files from his template spec, is this a takewawawy??

Round 2 (names.md): "8. contribution sounds good", "5. ok, session then".

### Repo B: `dev/challenges.md` (2026-10-24 and 10-25)

> We start the third iteration from 0. The vision loads by itself (third-iteration/vision.md). It is the base of this conversation.

> The task: understand the problem from 0, and find the main challenges that we must overcome to build gcontext as the vision says. We need these challenges before we design the test that measures our progress, and before we choose an approach.

> yes, these are all challenges true, but they are very superficial, when we go deeper into the details, after giving to it much more though I think that the problem is with llms.

> but the problem that we are trying to solve is not one of generating information, but structuring information, this is the real problem, how to structure information.

> To me it's occurying the option to adding an abstraction layer, between the information and the AI agent, the goal of this abstraction layer is to make it easy for the ai to
> 1. Add information
> 2. remove inforamtion
> 3. replace inforamtion
> 4. structure information

> The goal is to be able to define a very clear way to move all the decisions that go in the head of a human when it does the decisions to put x piece of information in one place or antoher to the AI.

> Like I can nowadays do this job, if I had infinite time and infinite close of me I could instruct that a clone of me analyzes what happen in an AI agent session , then my human clone would already know what the handbook is about and how it works, and would be able to know which are the places where this information must be added , if something else must be removed or if the structure of the handbook has to change (new folder, new files...) .

> Though with AI there is also techniques to do similar things like provide a global map of the handbook with references, like an index + nstructions on how it works. and this is just an efficiency problem.

> But now let's investigate how can we try to replicate this process that now a human does so the AI does it, what is exactly what we are missing

> one possible information with two destinations are for example if I a company uses stripe. [...] I think that in product it makes more sense, but some of it should be also in stripe, or that at least there is a direct reference from the stripe connection to the place in the product where the stripe setup is explained

> now we want to know if it makes sense to build an abstraction layer and how.

> i understand that you want to ask me what are the things that I know when I place a piece of content in one place or another, and there is some logic to it, but right now we don't have a place to define this information, you are just simply writing prompts, we want to create the abstraction layer that is able to handle information

> ok, but now how can we build it? any idea at all?

> sounds interesting, how would this compare to this though ir-method.md , can some kind of abstraction like this be used to build the separation between information and ai? would it make sense

> yes I think that sounds good, to explore different methods and see what works and what not

> wait I am not sure if the IR is exactly what I had in mind, what I had in mind was a language that we can give to an AI agent and based on the requirements for what needs to be changed, is able to understand the purpose and find the place and the operation needed to do with the information in an easier way .

> Let's wait a moment before we start building stuff, this is not easy

> Ok right now is the point where I want that with all the information I given to you that you think a bit and propose me different methods of building this and seeing what can work and what not

> ok, let's start discussing idea 1 first, before we start building it I want to explore if it makes sense and understand it better

> I am not sure if the questions are the right approach. I understand where you come from, but I believe that they are too specific. When we come into information, we come into things that can be very flexible. At the end is information, everything are words and things that are transmitted to one place from another. If you are defining these kinds like knowledge or know how I believe that we are limiting ourselves already too much. When I put you those examples of connections or support, they were just examples. We don't want to make something static, and that this can be the same for each G Context Handbook. We want those to have a sense in one specific handbook, and that all the system is able to understand what has been defined in each handbook, because each handbook is different. And the same for the questions. But like for kinds right now, I believe it's too specific. It has to analyze better the information.

> No, Z context puts the rules. What I was meaning is that a simple question it's too simple. It's not able to understand understand of all the intricacies that a piece of information has the structure and the meaning and everything that it's needed to then be able to add it in the handbook. Here I believe that there are strategies that are better to Analyze the information like there is vector databases that use this kind of semantic relationships, which I am not proposing to do there, but I believe that between a simple question and this, there's a lot of other options. I am not sure. This is not my deepest field of topic, but there are a lot of options that we can choose to be able to match the information that is extracted from one session to the handbook, the where it goes. This is what Z context does. It's able to match the information that has been extracted with the handbook. And one simple question is not enough.

> This sounds good, but there is a big difference in why I Half all this time went for the tree of information Or purposes as you mentioned. And the reason is that I want that the final thing is easy to understand for both the humans and also the AI. All of these systems like Memo and Graffiti, they works with graph. But we are on the same problem that the graph, while it is cool, it's a way to structure the information. And this is the one of the graph. The reason that I mentioned the templates is because I believe that different types of information, like the playbooks or the connections require different templates. And right now LLMs are already very good at using gred to parse this information. I like how this goes that a coding agent uses GREP to parse this information. I don't want a system where everything works in graphs and the structure of the information it's based on graph. I don't want that. I want that it's information or I want a system that based on the purpose of this folder or whatever or handbook, it's able to know which is the best format to store the information for the future.

> what do you mean by form? I think the work it's information / contribution. I am not sure what are u defining by templates, like I know I said that the connection and support folders could be understood as templates, but these are tied to the specific folder, I don't want that they are tied to the whole handbook.

> So to put it clearly
> handbook -> has folders that serve differernt putpose (connections, support), each of those folder follows a template.
> The handbook can know that this template is possible in the handbook because of the connections folder, but it's responsability of the connections folder to update the template.
> i am not sure if you understand, or if it makes sense now for you but it's important to not put all the "rules" like "templates" at the handbook level

> 1. find the folder part: No, we are not sure of that, we don't know how to structure information yet, we don't know if finding the purpose is better / more effective than the rules
> 2. write the contribution: yes, or at least how this piece is added to the existing things.

> the llm wiki is a similar concept to this, the difference is that we want to make our system more efficient by using this abstraction layer, I am still not sure if it will work, but I want to try, but yes, it's a very similar concept to the llm wiki

> you can write this list onto challenges though

> What do u mean by hidden structure besides the files. This is exactly what I want, why is it banned

> the thing is that we've been talking about the challenges to long.

> I think it makes more sense to start exploring approaches, as right now we've done 0 progress on that and I am not sure if there's even an approach that can work for that, I want to explore a minimal version of one approach and see what is possible and in which direction to go. We don't have to define each edge case of the process.

> honestly those operations are absolutely not the soltuion, this is not doing anything.

### Repo B: `third-iteration/addition-tests/overview.md` (tag `before-cleanup`, 2026-10-24)

> also I want to be able to see in a clear manner what is the current value of every method, the one that got the lastest "accepted" method, so that we can iterate on that, this run, the accepted one, will be commited, not like the others, and will be manually accepted by me or AI, not automatic, in an automatic way it still work like now.
>
> Regarding the methods that u deleted now, let's have a overview.md inside addition-test that explains what we are doing and the methods we've tried and didn't worked out and why

> what?? this is not good, on accepted I just wanted the single run that we accept as proof of the method, not the code and not whatever there is now

Also "can we remove the plans that have cleary not worked?" and (2026-10-25) "third-iteration/ minus records", "let's add a new handbook onto the viewer to test it, the one of the maat brain would be cool", "This test runs a known example through the whole flow", "yes, change the rule" (gateway/index.md). On the second Maat capture: "It's not bad, but too much info has been added. It's a problem if this context files have too much info, because then AI wastes a lot of tokens each time needs to undeerstand somehting, so keeping it trim is a need". On the history folder (history/index.md): "pls put the things of the overnigh task somewhere else, like this they are occupying mane space, same with all the files of the third iteration".

### Repo B: `third-iteration/checkpoint.md` and `daily-use/index.md` (tag `before-cleanup`, 2026-10-27)

> ok, now this version is pretty good, before we progress w iteration 3, can we merge the chagnes to main and plan further from there? Is there already any plan in place somewhere

> yes, I like all of these, can we do all of them besides the automatic accep or reject recommendation. Should we do all of them with the same or different agents? maybe some can be grouped together

> ok, then proceed to create two plans with codex astra for each agent, and then dispatch two codex sol subagents for the implementation.
> when done, disptach two subagents more in codex astra to do a review

> I want to e able to see exactly the changes. And what I am most interested is
> 1. what has been added / changed
> NOTHING ELSE, NOW THERE ARE TOO MANY OPTIONS, AND SMALL TEXT AROUND it, AND OBRDER, AND BULLSHIT. I JUST CARE ABOUT THIS, LETS MAKE IT SIMPLER

> The summaries should be clear what are (summaries)
> The permanent contentn in the handbook should be very clear that is permanent content added, make this w UI
> Labels like "existing file" are unnecessary, SHOW THINGS WITH UI , NO WITH TEXT
> now show a single html with different version to this problems, I will tel you what is right or wrong in each one

> the source shouldn't be text!!

> ok, after those tthree changes I mentioned u we can proceed to give this as good and done

### Repo B: `dev/gateway-rethink.md` (2026-10-28 and 10-29)

> I am trying to define first the gateway without going onto the details of how should it be implemented

> WE define them and how their agent looks like and then we try to build the gateway, we went too fast.

> And also, let's build a whole folder for this inside adapters/rethink with a file for each case and an index.md that explain what are we doing

> it doesn't really matter, for now let's make it to each gym owner, but this would be something that the developer changes when it implement sit

> what I want to know is that is the first point of the process that is the same for EACH ONE of the cases. I guess that in my head I have an http post endoiunt called submit-session or something similar, this is what it is in myy head, but I am not sure if this is the best case, because then if someone want to use gcontext locally has to have a ... server running, which is very annoying

> YES, this is exactly what I was thinking

> IT IS NOT CLEAR THAT IT WILL ALWAYS BE A CONVERSATION, I DO NOT KNOW

> I AM NOT SURE IF IT MAKE SENSE TO HAVE A SERVER FOR THIS, I DO NOT KNOW. First will be local

> regarding the gap I will take care of this, don't bother for it now, I want to first focus on how the information is sabed into gcontext after it has been in the agnent.

> what I don't want is to make that every developer has to build a custom solution for yeah for each thing, like building a fucking SCTP request and everything, and then they have to manage when it's sent

> Don't bother about the test and they are not important now.

> you just plan to implement something, use a codex subagent.

> yes, once a session has been rejected, this is rejected forever

> the thing is that the session should never arrive in the viewer if there are still things to come, if something else arrives, it should be in a new session

> What the fuck but why aren't we calling this the gateway? Why is now integration? ... What I've told you is that I want that it's easy to fit these things. Here we have the sessions in the folder. And then we have the z context instance. The question is how can we easily fit the sessions to the gcontext instance?

> yes, rewrite the plan and proceed to implement it, also plan 3 if need some changes

### Repo B: `dev/trials/bjjgym/index.md` (2026-10-30 and 10-31)

His twelve-step flow:

> 1. I have conversation with bjjgym
> 2. COnversation is done
> 3. Process to view claude code session in trace viewer is triggered (not sure how we did it, if automatically or manually)
> 4. I see the session in trace viewer (not captured yet)
> 5. I press capture the session
> 6. I see what is captured and what is not captured
> 7. I see that some things captured are right and some other are wrong
> 8. I can change (right now I don't know how) , the parameters that affect that something is captured, I tweak those parameters
> 9. I run the capture session again, --> go back to step 5
> 10. When I am satisfied the capture is accepted
> 11. There is a recorded of which changes there were on the parameters that affected what was captured, to understand what are we changing and what not.
> 12. There is a memory of the record of the session that was triggered and what I accepted as a valid answer, I can come back to this later to be able to test again.

> this is more an internal record that we have just when developing ... I want that the AI is in charge of tracking the differences over time in the configuration. Maybe in the future the changes will be permanent, for now let's not build anything around

> let's keep it simple

> Right now I don't want to build anything, I want to start testing as soon as possible with the help of you, if something has to be build it now, let's not do it, let's find a workaround where we come to the blocking point.

> everything that happens will be monitored by AI to guide me into what to do at each step

> it would be nice to see what is happening, some logs would be good but even better which decisions are being taken at every moment, just so that there is the feeling that something is happening. Ofcourse the ui to make it look understandable so the user understands what is being recorded is a bit difficult, so better to start minimak

> I want to start working on this and have a flow that I can "save" some sessions that I find important to be saved, but I don't want to make of this a complicated process where I have to spend a lot of time thinking what is kept and everything ... I am ok by making this at first more manual and improve across the time past. ... maybe it would be good to start a better way to analyze the session and improve the current "check" , so it wouldn't be as manual as it's now and would indicate more clearly to the user which session need to be saved, and those that are not picked are automatically archived, so that the new entries are "clean" and I don't mix them up with new ones coming.

> now the prompts for both extraction and check are for every handbook the same, I am not sure if this is aligned with the vision I have for the project

> At the end of the day I think that in this process is not so important that an AI tells us "is it wroth" but that the AI can help us map what happened in the conversation in a way that is easier for us to understand in a glance : 1. What happened in the conversation (general) 2. Was there any research being made (specific) 3. Did anything change (new decision / change of feature) ... 4. propose more things that would be useful to track.

> state at the end "VERY GOOD, this is exactly the idea, to know at the end what was the ontologic meaning of the session"

> most of them, I think we can try them and see what I like and what not

> i think I want a ranking somehow, that the most important things are shown sooner

> to have NOT SO SPECIFIC Things, though in the future it maybe makes sense that this is something configurable for evey instance, stillw ay too early to decide

### Repo B: `dev/decisions/2026-10-31-public-v1.md`

> My goal is to have from this an public repository that everyone can use and setup in 10 min. ( maybe there are some limitations in the current process, I want to understand them )

> right now I just want that you understand the whole problem and think what would be a good way to enfoque it (not to start solving)

> yes, exactly, developer that uses claude code (would be much better if this doesn't restrict claude code though, and people using pi, codex... also can use it (though step by step, not sure how complicated it is)

> Cleanup, the things can stay in old commits or another branch. Most stuff can be deleted though

> I am not sure, this is your job to decide

> i want that you think for a bit on how to do it and then propose me how to start with it, and then do all of the changes in a new branch and my goal is that then I can test that branch with the bjjgym example and me myself also adopt that.

> Before you start the whole process wait for my approval

> 1. can u start directly in a new branch and then ahndle the conflict merges, right now there is some work here that maybe won't be commited
> 2. yes
> 3. yes, the [brain] handbook will be restarted though
> 4. yes

> wait, no codex, use opus 5.5 subagents

"ok, now do C"; "MIT (Recommended)"; "I am not sure, keep it like it is right now, I won't make it just yet public, I wanted to have it organised, that's all. And maybe in a future make it public, not a decision for now"; "Keep it, cut the Maat lines (Recommended)"; "bleak-ai/gcontext (Recommended)". From plan-public-v1.md phase 9 and 10: "ok, looks good"; "it works fine".

### Repo B: `dev/decisions/2026-11-01-load-from-zero.md`

> I think that I don't like the Block and we have to rethink completely how the handbook is loaded onto an AI agent

> I prefer to explore other options and not have this one as the existing one when evaluating what is possible

> for now I think I want a skill, that I can activate when I want to use it, to control when it's being used, maybe we make a prompt hook or start hook in future but it's not sure

> yes, the goal would be that "docs" are dropped and this becomes the handbook, in a way gcontext is a way to have the docs, we are currently doing this.

> don't u think that for scaling the map might be better? I don't agree with build for later

> noo, I want to make the siwtch ... we have to start over then and define exactly what is the goal of this trial

> Not really. [...] The goal is to have one project where we use G context as the main driver instead of the docs. Right now this project has already started, so we're not starting from zero. But what do we want is that yeah, from this point onwards, we make the transition to the handbook. And here the goal is to analyze how this work in [bjjgym], how does the process once it has already started look like, and how can we improve it? The goal is not for [bjjgym] specifically, the goal is to see how it works here, and how can we then apply the findings to the overall G context projects so that we can apply this to more projects.

### Repo B: `dev/decisions/2026-11-01-maat-brain-trial.md`

> ok, another thing, during the week I work more on maat brain than in this, can we make that we have both trials going on at the same time.
>
> My goal is that for me during the week I can dedicate just 5 minutes each day to analyse converastion of maat, preanlaysing and accepting / rejecting them, and by the end of the week we have some results

> not sure how well is the one of the maat brain handbook prepared for it (in this case it would be more of adding information into the brain, and also evaluating how would it be possible to feeding it back to the brain, I want to analyse it.

> A, but let's not push the changes back to the brain state just yet, this has an impact on real people, first I'll want to analyse them here, for this week I just want to be able to accumulate more and more changes and see how they would change the state, and based on this tweak the instructions on what should be saved

> I am not sure, this will change as I test it, this should be part of the setup of a new instance, like I don't want to have to think of this , it should be clear when the project is being created, and then the user tweaks it

> proceed, don't use codex, make everything with opus 5.5 subagents

### Repo B: `dev/decisions/2026-11-01-name-cleanup.md`

> ok to be honest, this feels a bit unstructured, like there are this parts but it's a bit confusing, do you agree? what it's what it makes it so confusing

> a bit of cleanup if u can do it now would be very good

### Repo B: `second-iteration/decisions/legend.md` (tag `before-cleanup`, 2026-10-18)

- "use your best judgement" (Bernat left before the end of the naming round).

---

## 6. The vision, as the docs state it today

From `dev/vision/vision.md` ("Status: approved by Bernat on 2026-10-24"), verbatim:

> gcontext gives an agent a handbook: the knowledge and the know-how that it needs for its work, in folders and files. In a session, the agent picks up what it needs from the handbook, works with it (it uses it, explores, and talks with the user), and new information comes out. The handbook takes in the contributions that matter, in the right place.

> If the AI alone adds the information, it does not do it in the right way. A model is good at predicting the next token, but it cannot organize context properly. A very large model can do better with specific rules, but then a human must write the rules and give it the sense of the whole agent. gcontext gives the AI tools (tools in general, not tool calls) to structure the information, by rules that come from non-deterministic values: the purposes.

> The AI makes the structure in a non-deterministic way, and the result is even better than a structure that a person designs.

> Success: the agent that uses the handbook does its actions, gives its answers, and does its research faster, more accurately, and cheaper than before. One structure is better than another when the right information is structured better for this agent.

How it works (the eight points, condensed to their first sentences, verbatim):

> 1. The handbook. A top folder with folders and files in it, at many levels. Each folder has a purpose. A file holds information. The handbook holds knowledge (what is true) and know-how (how to do things: playbooks, connection files, rules, scripts).
> 2. Templates. A parent folder defines the template of what is under it: its folders, the files in them, and the structure inside those files.
> 3. The gateway. The part in the middle, between the sessions of an agent and the handbook with its backend. Which information matters depends on the agent, so the person who sets up gcontext for an agent defines the rules of the gateway: how information is loaded, which information is kept, and how information is extracted from each session.
> 4. Agents and sessions. An agent is anything that works with AI and connects to gcontext, also a plain process.
> 5. Contributions. A contribution is what a session adds to the handbook, of any size: one fact, a rule, a new playbook, a new connection with the files of its template, or a whole new workflow.
> 6. What helps the placement. We can use a lot of information. Named so far: what the agent loaded (...), the kind of information, and the template of the parent.
> 7. Information from outside. Documents and other systems can also bring information, if the purpose of the handbook needs it.
> 8. Change. The handbook adapts: new folders, and maybe new domains, can be created. A complete reshuffle is not required: good if it is possible, but it may not be feasible.

Hard limits, verbatim:

> - Information is not repeated.
> - Data that exists in another place, such as Notion, Stripe, or a database, is not copied. The handbook holds the instructions to access it.
> - Everything in a handbook has a meaning.
> - Each handbook has its own rules, purpose, and process, from the person who sets it up. They must be respected.
> - gcontext does not put general rules. The people who use gcontext set their own rules and the needs of their agent, and this is easy.
> - gcontext is very easy to use and to understand. A basic setup already gives very good value. Without a good setup and rules that are easy to enforce, it does not work.

How to use this file, verbatim:

> - This is the newest view of gcontext. Where an older document says something else, this file holds.
> - Before a plan, a test, or a question, say which line of this file it serves and what the answer changes. If no line fits, do not do it.
> - Only Bernat changes this file. Each change has a date.

From `dev/vision/vision-session.md`, the sentences that carry the vision in Bernat's voice (verbatim, see section 5 for the full answers):

> The problem that I am trying to resolve is how AI is able to find information, use it, explore, tag with the user, and then understand which of this information should be added again in a kind of memory for the agent.

> these models, LLMs, are good at predicting the next token or whatever they have been trained at. But what they cannot do is organise context properly.

> We want to give the AI away to structure the information following rules where these rules come from non-deterministic values.

> My goal is that this can be done in a non-deterministic way by the AI. And that the result is even better

> The goal is that the agent that uses this memory layer is able to do the actions or answer the things that the agent needs to answer in a faster, more accurate and cheaper way than before. This is how we measure it.

> Basically, no one knows G context, but we must find a way that it's very easy to use and understand what's the purpose, and with a basic setup of how do they want to use it, they can already get a very good value.

The sentence that names the open heart of the work (answer 7): "I do not know. This is the part that must happen. I don't want that the human does it, but this is exactly what I am having so many problems about."

The vision with Claude's leans before the names were decided (`names.md`): "gcontext keeps a handbook for each agent: the knowledge and the know-how it needs, in folders with a purpose. The agent reaches its handbook through a gateway. The gateway has the rules of the handbook: what to load at the start of a task, and which takeaways to keep at the end. The AI puts each takeaway in the folder whose purpose it serves, and it follows the template of that folder."

---

## 7. The personal agent (repo C, bernat-agent)

1. FACT. `agent.md`: "You are Bernat's personal agent. You hold his personal context: the journal, [private topic], post writing, and the operations of his machines and VPS. This instance was split out of the gcontext lab repo on 2026-08-12". Format: `gcontext.yaml` (`name: bernat-agent`, `port: 4249`), `modules/`, `connections/`, `agents/`. This is the August "agent is a folder" shape of gcontext-ai.
2. FACT. Fourteen modules (`ls modules`): aerospace-wm, bjjgym-inbox, bot-commenter, idea-scout, journal (personal, not read), mac-disk-space, pi-http, remote-agents, shared-connections, vps-ops, and four private topics (crisis-preparedness, house-search, nomad-europe, tax-situation) that this file does not describe.
3. FACT. `index.md` names the work modules: "BJJGym inbox: Review business mail, use the reply policy, and record cases that need Bernat."; "Local Pi HTTP service"; "Idea Scout: Review the local idea discovery UI, evidence rules, and Telegram delivery before implementation."; "Remote agents: Move a project, its branches, and a Codex, Claude Code or Pi chat between the Mac and casaserver. Continue it on the phone in Paseo."
4. FACT. Capabilities in `agent.md`: browser automation over Chrome CDP ("You can act on live websites: fill forms, log in, check pages, read Gmail."), with "two isolated identities, one browser each"; "You can manage the Hetzner VPS end to end" through the Coolify REST API, SSH and the Hetzner Cloud API, with hard rules ("never delete Coolify resources or change env vars without explicit user confirmation"); Telegram messages through "the Bernat Agent bot"; installed agents `browser-cookbook` ("browser agent that learns sites") and `create-post`.
5. FACT. `modules/remote-agents/index.md` (last update 2026-10-25): a tool pair `send-to-server` and `pull-from-server` that snapshots a git working state without a commit, moves it and one chat (Codex, Claude Code or Pi) to a home server, and opens it in the Paseo phone app; history 2026-10-09 to 10-20; lessons such as "Never guess a pid from the cwd when more than one process can own a chat." `modules/idea-scout/index.md`: "Design a local agent that finds useful ideas across public sources. Send selected ideas through the existing Telegram connection." Status: "The current work is a design draft." INFERENCE: the repo is still in daily use as a plain folder of notes (25 commits to 2026-10-25); whether a gcontext server still serves it on port 4249 is not verifiable from the files.

---

## 8. Facts to check

Dates and counts (all FACT from git unless noted):

- Repo A first commit 2026-04-02, last 2026-07-24, 697 commits. Repo B first commit 2026-07-21 (planning doc dated 2026-07-20), 576 commits to 2026-11-01. Repo C 2026-08-12 to 2026-10-25, 25 commits.
- The vision session: 2026-10-23 and 2026-10-24; vision approved 2026-10-24. Second iteration plan approved 2026-10-18. First iteration 2026-10-06 to 2026-10-18. Public v1 merged into main 2026-10-31. bjjgym trial 2026-10-30 and 2026-10-31 ("proved the full loop"). E2E proof: 19 of 19 checks, 6 model calls, recorded 2026-10-31.
- Name timeline: context-loader-poc 04-02; Semelweis and Notcontext 04-11 (hours); ContextAgora 04-11 to 05-24; EIC 05-24 to 05-30; gcontext from 05-30. Check: did "contextagora.com" ever go live, and is it still owned? The repo shows `hello@contextagora.com` on the 04-14 landing and planned subdomains on 05-04; no DNS or deploy record was read.
- `gcontext.ai`: in code from 2026-05-30; landing deployed by Coolify (STATUS.md); OG metadata `metadataBase: new URL('https://gcontext.ai')`; `app.gcontext.ai`, `api.gcontext.ai`, `docs.gcontext.ai` (Fumadocs, 07-09) in code. Check which of these still resolve today. The 09-21 note says "The site at gcontext.ai must stay live"; the landing source was last in repo B under `legacy/landing/` and is gone from the current tree after the 10-31 cleanup.
- PyPI: `gcontext-ai` (CLI; 0.2.2 to 0.2.4 in June 2026; 0.4.4, 0.8.0, 0.9.0, 0.10.0, 0.10.1, 0.10.3 in August; "0.12.x" by 08-21; "v0.15.0" by 08-27). `gcontext-mcp` (connector, 2026-06-27). Check the current versions and whether `gcontext-ai` still installs the August framework (`uv tool install gcontext-ai`) or the September "folder standard" (README 09-06 says the package "bundles a copy of `context/system/`").
- GHCR images: `gcontext-cloud` (tags `v0.2.2` to `v0.2.4` in repo A are CLI releases; the cloud image version in STATUS.md is 0.1.12), the mcp-minimal cloud image on `mcp-v*` tags (`mcp-v0.1.0`, `0.1.1`, `0.3.0`, `0.3.1`, `0.3.3`), `support-v0.1.0` and `0.1.1`. Owner `bleak-ai` ("GHCR/git owner is bleak-ai, not bernatsampera", 07-02).
- GitHub org `bleak-ai`: `bleak-ai/gcontext` (public; was `everythingiscontext` until 06-02; "becomes the standalone CLI repo" 07-24), `bleak-ai/gcontext-cloud` (remote of repo A; visibility not recorded), `bleak-ai/agents` (public registry, released 2026-08-15, agents-v0.1.0), `bleak-ai/framework` (private, remote of repo B since 2026-08-02). npm `@bleak-ai/gcontext` is the chosen name, not published (`"private": true`). Check what is public today.
- The letter "g" in gcontext: not explained in any file read. INFERENCE: "global context". Ask Bernat.
- People and companies named in public copy: MAAT (maatapp.com; Stefano Saitta, CTO; "64% faster support tasks"; April landing "Bernat, AI Engineer at MAAT"), Soundmurai (soundmurai.com; Eduard Aymerich, co-founder; "79% faster insight generation"). Bernat chose on 2026-10-31 to "cut the Maat lines" from the public `dev/` folder; decide whether the personal site names Maat and the Maat brain trial.
- bjjgym.com: "a directory of Brazilian Jiu-Jitsu gyms, open mats, and training partners", "an Astro site" (second-iteration brief); the SEO agent and the bjjgym handbook trial are the real test beds. Traffic line in PLAN.md (2026-10-18): "28 clicks per day in October (6 in June). 721 clicks in the 28 days to 2026-10-14." Check whether to publish these numbers.
- Pricing of the hosted connector (July 2026 landing, from llms.txt): "Free ($0, 30 files and folders), Pro ($12/month, unlimited ...)". Check whether this product is live, paused or closed; no record in repo B.
- Tools and models named: Varlock and Infisical (secrets, April), Claude Code (`claude -p`) as the model runner throughout, Codex and "Opus 5.5 subagents" as workers in October, Ollama Cloud and glm-5.3 (first iteration provider), "Jev" and "Pi" compared for keep decisions (10-03), `BAAI/bge-small-en-v1.5` as the local embedding model of the fact index (README). Check how to describe Jev.
- Public v1 requirements (README): Node 22 or later, uv, Claude Code with a login; "Tested on macOS. Linux is not tested yet." Limits (docs/limits.md): "Claude Code only", "A person reviews each proposal", "One machine", "A failed proposal ends the session ... This is a known fault."
- Two numbering schemes for "iterations" (0 to 7 in July and August; first, second, third in October). Any public text must say which.
