---
name: new-post
description: Prepare a SamperaLabs article from a written file, local repository, repository URL, or folder and the author's intended topic. Use for a new post or an article revision. Load the site's editorial and publication guidance before work.
---

# Prepare a SamperaLabs post

Accept a source path or repository URL followed by the author's topic and optional directions.
Use the same workflow in Codex and Claude Code.

## Locate the site and input

Record the invocation directory before changing directories.
Resolve relative input paths against that directory.
Accept quoted paths that contain spaces.
Keep the source project separate from the SamperaLabs site.

Resolve this skill's actual filesystem path through any symlinks.
The SamperaLabs root is four directories above this skill directory.
For a configured alternate checkout, use `SAMPERALABS_ROOT`.
Confirm that its `package.json` names `@bernatsampera/samperalabs`.
If neither location is available, request the site path.
Do not search the whole computer for it.

Read the site's `index.md` before searching or changing site files.
Load these known documents from the site root:

- [../../article-site-reference.md](../../article-site-reference.md): Site purpose, storage, API, asset delivery, homepage, and release procedure.
- [../../editorial-guide.md](../../editorial-guide.md): Reader benefit, author ownership, writing modes, structure, and review.
- [../../new-essay-prompt.md](../../new-essay-prompt.md): Draft preparation, output requirements, and publication boundaries.
- [../../post-image-workflow.md](../../post-image-workflow.md): Distinct visual concepts, evidence, image production, and motion.

Use the actual document contents, not a remembered summary.
For repository or folder input, also read [../../project-story-brief.md](../../project-story-brief.md).
Read [../../interactive-essay-prompt.md](../../interactive-essay-prompt.md) only when an interactive article component is requested.

## Read the source

For a `.txt`, Markdown, or other readable text file, read the complete file.
Default to presentation only when it contains a finished article.
Use draft from evidence when it contains notes or raw material.
An explicit author mode takes precedence.
Preserve the original file unless the author requests changes to it.

For a local repository or folder, read its instructions and root `index.md` first, if present.
Follow its linked indexes to the relevant feature.
Use `rg` only when the indexes do not cover the feature.
Read relevant implementation, documentation, and existing verification records.
Keep the source project read-only unless the author separately requests changes there.
Do not run its application or tests only to collect article evidence without checking its instructions and the requested scope.

For a repository URL, use available Git or repository tools to inspect it.
Use an existing checkout when the author supplies one.
Otherwise, create a separate local checkout if access permits.
Record the branch or commit used as evidence.
Do not push to the source repository.
If access fails, request a local path or the relevant source material.

Focus inspection on the author's topic.
Separate implementation facts from observed behavior and the author's reasons.
Exclude credentials, customer records, and private procedures from public examples.
Ask for missing personal judgments when they affect the article.

## Prepare a reviewable direction

Return the reader benefit, main claim, proposed title, and section outline.
For project stories, use the problem, available tools, decisions, and resulting capabilities as the default sequence.
Adapt the sequence to the author's direction.
Record evidence paths and the limits of each important claim.
Propose two distinct visual concepts with placement, purpose, captions, and source needs.
Compare composition and drawing style with recent available posts.
For motion, state what stays fixed, what changes, and the static fallback.
Do not reuse boxes, arrows, chat panels, or successive highlights by default.

Ask only for facts or choices that materially affect the result.
Combine those questions in one review request.
Honor selections and authorization already given in this session.
If the author requests a complete draft immediately, prepare it within that scope.
Keep unresolved facts in separate review notes.

## Prepare the article and assets

Save agreed local work under `src/editorial/drafts/` in the SamperaLabs site.
Use a unique slug for the article, metadata, and review notes.
Keep generated prompts and editable diagram sources with the local work.
Update the affected indexes when files are added, removed, or renamed.
Use the [ASD-STE100 skill by danyuchn](https://github.com/danyuchn/asd-ste100-skill) for technical prose.
Read the [project copy](../../../../.agents/skills/asd-ste100/SKILL.md) before writing or editing technical prose.
Keep the author's voice, facts, uncertainty, and decisions.
Do not repeat the page title as an H1 inside the published body.
Do not use a local Markdown file or a source override to create a new public post.

Return the complete article with images in place, metadata, source notes, and remaining review issues.
Prepare `deploy.json` with the local image filenames and any approved homepage code file hashes.
Use [../../deploy-post-command.md](../../deploy-post-command.md) for the manifest format.
Keep release preparation local. Creating this manifest does not authorize publication.
Do not open a browser unless the author explicitly requests browser review.
Use available non-browser checks for files, links, image dimensions, and build output.
Report browser checks as not run when they are not authorized.

## Submit or release only within the request

Creating this article does not authorize a remote draft, publication, a commit, a push, or deployment.
Previous release authorization for another article does not authorize this article's release.
Draft approval alone does not authorize publication.
When the author requests publication or deployment, use [../deploy-post/SKILL.md](../deploy-post/SKILL.md).
Use the site reference for remote draft submission or release failures that need diagnosis.
Do not ask again for an action already authorized for this article.
Finish the concrete local result before requesting a release decision.
Report the post ID, status, URL, relevant commits, deployment status, and actual checks after an authorized release.
