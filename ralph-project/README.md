# Ralph

AI agent loop. Each task runs in a fresh invocation — no context pollution.

## 1. Plan

Tell your AI what tasks to create:

```
Read ralph/README.md and create a ralph setup for [YOUR GOAL].
[Describe what needs to be done.]
Do NOT execute any tasks — only create the plan files.
```

This populates `fix_plan.md` with checkbox tasks. That's it — **the AI must not run any task yet**.

## 2. Run

```bash
npm start 20
```

Ralph picks up tasks one by one, each in a fresh invocation. Open `fix_plan.md` to watch them get ticked off.

---

## Files

| File | Purpose |
|------|---------|
| `fix_plan.md` | Task checklist. One `- [ ]` = one iteration |
| `specs/` | Extra context for tasks that need it |
| `AGENT.md` | Project config and quality standards |
| `PROMPT.md` | Loop logic — **don't modify** |

## Config Management

```bash
npm run ralph:save -- my-task     # save
npm run ralph:load -- my-task     # restore
npm run ralph:list                # list all
npm run ralph:new                 # reset to blank
```

---

<!-- Everything below is for the AI setting up Ralph, not for the human. -->

## AI Setup Instructions

**STOP: YOUR ROLE IS PLANNING ONLY.**

You are setting up Ralph, not running it. **Create configuration files. Nothing else.**

<!-- RECIPE_INSTRUCTIONS_START -->
### Recipe: Create llms.txt Documentation for Any Subject

Read `specs/llms-txt-general-guide.md` to understand the llms.txt documentation system and how it applies to general subjects (not just codebases).

The user has specified a **subject** to document. This could be a website, documentation site, book, API reference, framework, concept, or any other topic. Identify:

1. **What** the subject is (e.g., "FastAPI documentation", "Clean Architecture book", "Stripe API")
2. **Where** the source material lives (URL, local files, or your own knowledge)
3. **The structure** of the subject — its major sections, topics, or chapters

If the source is a URL, explore it to understand its structure and content hierarchy. If it is a book or concept, use your knowledge to design an appropriate hierarchy.

Create tasks in `fix_plan.md` to produce llms.txt files for this subject:
1. Root llms.txt first — overview of the entire subject
2. Major topic/section llms.txt files next — one per major area
3. Sub-topic llms.txt files as needed for complex areas
4. Leaf documentation files (.md) for detailed content

Each task should create ONE file. Be specific about:
- The exact file path to create
- What content it should contain
- What source material to reference or summarize
- What links it should include to other files in the hierarchy

Output all files into the parent directory (../) so the llms.txt tree lives alongside this ralph directory.
<!-- RECIPE_INSTRUCTIONS_END -->

### You must NOT:
- Execute, implement, or start working on any task in fix_plan.md
- Modify any files outside the ralph/ directory
- Run tests, builds, or any project commands
- Run `npm start` or `./run.sh`
- Read or modify `PROMPT.md`

### Why:
Tasks are executed LATER by `npm start`, one per iteration, with fresh context each time. If you execute them now, you defeat Ralph's entire purpose.

**After creating fix_plan.md, STOP. Your work is done.**

### Setup Checklist
- [ ] `fix_plan.md` has specific, actionable checkbox tasks
- [ ] Each task describes what to read, do, and write
- [ ] At most 1 spec file in `specs/`
- [ ] All checkboxes are still unchecked — no tasks executed
- [ ] No files outside `ralph/` modified
- [ ] `PROMPT.md` untouched
