# Release failures to prevent

Record these failure conditions before implementation.

- A missing or wrong credential must stop the release before publication.
- A draft path outside this site must not expose another project's files.
- A slug collision must not overwrite an unrelated article.
- A failed or uncertain API write must not create a second record on retry.
- Missing images must stop publication before readers receive broken links.
- Private storage URLs must not become public article image URLs.
- Cached image failures must not hide newly deployed files.
- A code release without explicit commit authorization must stop before a commit.
- Unrelated staged files must not enter the release commit.
- A failed build, push, or deployment must stop before article publication.
- A deployment for another commit must not count as a successful release.
- A published article update must keep its existing slug and date.
- A changed remote record must stop before an overwrite.
- The sitemap must keep its existing URLs when the release adds one URL.
- Errors and receipts must not expose credentials.

Use a read-only command check for this already published article.
Use non-browser checks by default.
Do not create unit tests after implementation.
