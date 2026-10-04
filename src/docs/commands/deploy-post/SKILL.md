---
name: deploy-post
description: Publish or update an approved SamperaLabs article with its images, optional homepage code release, and live checks. Use when the author requests post publication or invokes deploy-post.
---

# Deploy a SamperaLabs post

Use the prepared draft folder name as the input.
Resolve this skill's real path through its symlink.
The site root is four directories above this skill directory.
Use `SAMPERALABS_ROOT` for an alternate checkout.

The article must have `article.md`, `metadata.json`, and `deploy.json`.
Use the author's approved text and images.
Do not repeat the editorial investigation or review for an approved draft.
Do not open a browser unless the author requests it.

Run from the site:

```text
npm run deploy-post -- <draft-folder> --check
npm run deploy-post -- <draft-folder>
```

For new static images or homepage code, use:

```text
npm run deploy-post -- <draft-folder> --release-code
```

The author must explicitly authorize a commit, push, and code deployment before you use `--release-code`.
An author invocation that includes `--release-code` supplies that authorization for the declared files.
Honor authorization already supplied in the current session.
Ordinary publication requests authorize the content API write, not an unrelated code release.

The script performs the release and records its result.
It skips builds and deployments for content-only updates.
It checks image delivery, article content, the RSS feed, and the sitemap.
It refuses unknown slug collisions and unrelated staged files.
It stops when an approved code file changes.
On a failure, read the saved `publication.json` and the error before you retry.
Do not replace the script with improvised API calls during a normal release.

Return the article link, post ID, and code deployment result.
Report browser checks as not run unless the author requested them.

- [../../deploy-post-command.md](../../deploy-post-command.md): Command usage, manifest format, and release boundaries.
- [failure-modes.md](failure-modes.md): Failure conditions defined before implementation, for release diagnosis.
