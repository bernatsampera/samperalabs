# Deploy a post

Use the approved local draft folder name.
The command handles images, publication, and live checks.
It uses the known content API and Coolify deployment.
It does not repeat the article investigation.

```text
npm run deploy-post -- gym-schedule-import --check
npm run deploy-post -- gym-schedule-import --release-code
```

`--check` is read-only.
`--release-code` authorizes a commit, push, and deployment for the declared article files.
Without that option, the command can publish content-only changes.
It stops if new images or changed homepage files need deployment.
Builds run only when files need a code release.

In Codex, use `$deploy-post gym-schedule-import --release-code`.
In Claude Code, use `/deploy-post gym-schedule-import --release-code`.
The agent uses the same script.
Install the skill with `node scripts/install-deploy-post-command.mjs`.

## Prepared files

Each draft needs `article.md`, `metadata.json`, and `deploy.json`.
Metadata follows the existing new-post format.
Keep the publication date empty until publication.
For an existing post, the script preserves its date and slug.

Example manifest:

```json
{
  "assets": [
    { "file": "comic.png" },
    { "file": "product.jpg" }
  ],
  "homepage": false,
  "code_files": []
}
```

Declare all local images used in the article.
The filenames must match the Markdown image links.
The script copies new images into `public/images/` with content hashes in their filenames.
It preserves verified image URLs from the previous receipt when the image bytes match.
It avoids the upload API's private storage URLs.

For a homepage animation, set `homepage` to `true`.
Declare the approved code files as objects with `path` and `sha256`.
Calculate each SHA-256 value from the approved file bytes.
The script checks these values before staging files.
Allowed code paths are homepage Astro and SVG components, `home.css`, `postPresentation.ts`, and `src/pages/index.astro`.
Keep credentials and private source notes outside the release selection.
The command stages new image and scene links in the root index without staging unrelated index edits.

## Release result

The command saves `publication.json` beside the article.
The receipt records the post ID, public image URLs, commit, deployment, and checks.
It allows a stopped code deployment to resume.
For an uncertain create response, the script reads by slug and compares the saved content hash before it adopts a record.
It does not overwrite an unknown existing post.
For an update, the receipt saves the previous remote record before the write.

The release order is: check the prepared files, deploy changed assets and code, publish the article, then check public delivery.
The script updates the generated sitemap after publication when the build preceded the database write.
It keeps the existing sitemap URLs and saves a backup inside the site container.
The next normal build includes the published record through the standard sitemap integration.

Credentials come from the site's ignored `.env` file.
`BLOG_API_KEY` authorizes the content API.
`BLOG_REMOTE_URL` defaults to `https://samperalabs.com`.
The default SSH target is `root@178.156.132.116` with `~/.ssh/hetzni`.
Use `POST_RELEASE_SSH_TARGET` or `POST_RELEASE_SSH_KEY` to replace those connection settings.
The configured Coolify application is `g08c40g44o88s8wwc488w0k8`, application ID `14`.

Do not create an automation or publish without an author request.
The command does not add unit tests or run browser checks.

- [commands/deploy-post/SKILL.md](commands/deploy-post/SKILL.md): Agent command and publication authorization rules.
- [../../scripts/deploy-post.mjs](../../scripts/deploy-post.mjs): Deterministic release script.
- [../../scripts/install-deploy-post-command.mjs](../../scripts/install-deploy-post-command.mjs): Shared Codex and Claude Code skill installer.
- [article-site-reference.md](article-site-reference.md): Site operations for failures that need diagnosis.
