# Daily use of gcontext

Setup scope: create a small context tree from existing docs, register this
project's Claude and Codex SessionStart hooks, and keep private run data out of Git.
No application code or publication changes are part of setup.

## Start work

Start a new Claude Code or local Codex session in this project as usual.
For Codex, first review and trust the installed registration in /hooks.
Setup does not grant that trust. The user verified Codex context loading on 2026-10-03.
The project hook supplies context/index.md and any first-level indexes.
The agent reads the linked topic files when needed. The hook does not insert every file.
It makes no model calls. It does not apply to every project on this computer.
An already open session has not received this new hook's context.

For the first new session, ask: "What gcontext tree did SessionStart provide?
Read editorial.md and tell me the publication rule. Do not edit anything."

## Finish work

Learning is manual. Finish a session before submitting it.
From this project, use `gc learn` and choose the finished session.
The full Codex command is also available:

```text
cd /Users/bsampera/Documents/bleak-dev/gcontext-framework
uv run --locked --project adapter python gcontext.py trigger-end-session /Users/bsampera/Documents/projects/samperalabs SESSION_ID --agent codex
```

Replace SESSION_ID with the main Codex conversation ID. Ask your agent to find
the matching local conversation by project, time, and topic if needed.
The importer reads all retained history pages through the local Codex client.
It does not resume the conversation or call a model during import.

For Claude, replace --agent codex with --agent claude.
Use the Claude session UUID. Local transcript filenames
contain the UUID. List this project's top-level transcripts by modification time:

```text
ls -lt /Users/bsampera/.claude/projects/-Users-bsampera-Documents-projects-samperalabs/*.jsonl
```

Select the session you finished. Do not assume the newest file is always correct
when several sessions are open. Remove .jsonl from the filename for the ID.
You can also ask your agent to find the matching session by time and topic.
The CLI has no session picker yet.

The command imports the transcript, starts a worker, and waits for its result.
It extracts facts, scores keep decisions, then routes and writes kept facts.
It writes directly to context/. It does not wait for approval between stages.
There is no background learning service or automatic session-end trigger.

## Inspect results

Start the read-only watcher in another terminal:

```text
cd /Users/bsampera/Documents/bleak-dev/gcontext-framework
uv run --locked --project adapter python adapter/web.py --root /Users/bsampera/Documents/projects/samperalabs/.gcontext --port 8770
```

Open http://127.0.0.1:8770. Review facts, keep decisions, routes, writing,
and overall changes. Keep the terminal running while you use the watcher.
The next configured agent session loads the updated indexes.

The trigger prints a run ID. To inspect its status:

```text
uv run --locked --project adapter python gcontext.py learning-status /Users/bsampera/Documents/projects/samperalabs RUN_ID
```

## Limits to remember

- Submit each session once, when finished. Learning later additions to a resumed
  session is not supported. Use a new session after submission.
- Failed or uncertain runs do not retry. Inspect their saved evidence first.
  Some earlier writes can already have changed the tree.
- Extraction stops above 60,000 rendered characters. It does not silently truncate.
- Keep decisions can be wrong. Review changes, especially during initial use.
- Runs, transcripts, and start evidence are private local files in .gcontext/.
- The context tree can be reviewed and committed with your project.
- Setup and the hook do not require a running watcher.

## Current versions

Task 09 is a task number, not implementation V9.
Task 10 adds coding agent support. New CLI runs use project-learning-v5.
Pi/GLM extracts facts and writes text.
Jev 1.13.0 scores keep decisions in one batch, with a threshold of 0.5.
Implementation V5 supplies routing and writing. Routing uses Jev.

## Record improvements

Use the shared inbox at:
/Users/bsampera/Documents/bleak-dev/gcontext-framework/task-support/feedback.md

Ask your agent: "Add this to the gcontext feedback inbox. Record the project,
session or run ID, expected result, actual result, and evidence path. Do not implement it."

The inbox is manual. Nothing scans it or schedules changes automatically.
During a gcontext review, select an item and turn it into the next numbered task.
Keep private transcript text in the project. Put only evidence paths in the inbox.
