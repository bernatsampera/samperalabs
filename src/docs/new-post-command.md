# Shared new-post command

Use this command in Codex or Claude Code from the site or another project directory.
Both tools load the same skill and the current site documents.

## Use a written file

In Codex:

```text
$new-post "/absolute/path/my article.txt". Keep my wording. Suggest the structure and images.
```

In Claude Code:

```text
/new-post "/absolute/path/my article.txt". Keep my wording. Suggest the structure and images.
```

Relative paths resolve against the directory where the command starts.
Quote paths that contain spaces.
A complete article defaults to presentation only.
Notes default to a draft from evidence.
State a different mode when needed.

## Use a repository or folder

```text
$new-post /absolute/path/project. I want to explain how we added shared context for support. Focus on the decisions.
```

```text
/new-post /absolute/path/project. I want to explain how we added shared context for support. Focus on the decisions.
```

You can also supply a repository URL with your topic.
The agent records the branch or commit used as evidence.
The source project stays separate from the site.

## What the command loads

The command identifies the SamperaLabs checkout from its installed source path.
It reads the root navigation and known editorial documents.
It includes site purpose, reader defaults, content storage, API fields, images, homepage rules, and deployment details.
It saves local work in the site's editorial drafts directory.
If the checkout is unavailable, supply `SAMPERALABS_ROOT` or its path when asked.

The first result contains a title, main claim, outline, evidence, and two visual concepts.
Review that direction before finished assets, unless you already requested their production.
Submission, publication, commits, and deployment remain separate requested actions.
Browser review also requires your explicit request.

## Installation

The versioned skill source is `src/docs/commands/new-post/`.
Run this command from any directory:

```text
node /Users/bsampera/Documents/projects/samperalabs/scripts/install-post-command.mjs
```

The installer creates links at:

- `~/.agents/skills/new-post`: Shared skill location and Codex user discovery.
- `~/.claude/skills/new-post`: Claude Code user discovery.
- `.Codex/skills/new-post`: Project skill activation used by the local setup.
- `.claude/skills/new-post`: Claude Code project discovery for this checkout.

The project links resolve relative to the repository.
The user links resolve to this checkout.
If the checkout moves, the existing user links can become unavailable.
The installer reports that condition without replacing the links.
If an existing link points elsewhere, the installer reports the conflict without replacing it.
Start a new agent session if the command does not appear in an open session.
No model turn or live article write is required to install the command.

## Maintained sources

- [commands/new-post/SKILL.md](commands/new-post/SKILL.md): Shared command instructions and input handling.
- [commands/new-post/agents/openai.yaml](commands/new-post/agents/openai.yaml): Codex command display metadata.
- [article-site-reference.md](article-site-reference.md): Site knowledge and article operations.
- [editorial-guide.md](editorial-guide.md): Writing and review decisions.
- [post-image-workflow.md](post-image-workflow.md): Visual concepts and production workflow.
- [../../scripts/install-post-command.mjs](../../scripts/install-post-command.mjs): Safe installation of the shared command links.

Discovery rules follow the [official Codex skill documentation](https://learn.chatgpt.com/docs/build-skills) and [Claude Code skill documentation](https://code.claude.com/docs/en/skills).
