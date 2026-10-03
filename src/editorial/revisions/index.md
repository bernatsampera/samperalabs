# Public article revisions

- [your-ai-agent-deserves-its-own-repo.md](your-ai-agent-deserves-its-own-repo.md): Combined article about context organization, runtime loading, and reusable agent work.
- [analyzing-open-deep-research.md](analyzing-open-deep-research.md): Expanded research architecture analysis with the original code examples.
- [../../lib/postRevisions.ts](../../lib/postRevisions.ts): Explicit public content and summary overrides for these two article slugs.
- [../../lib/publicPostStore.ts](../../lib/publicPostStore.ts): Read-only public post view with metadata recalculated after revisions.

These Markdown files have no frontmatter. Public pages use them only when the database contains a published, non-deleted post with the matching slug. The database still supplies the title, author, publication date, tags, images, and status. Other article URLs keep their original content.

Edit these files to change public text. Edit the descriptions in postRevisions.ts to change public summaries. Admin APIs and forms read the stored database version. The admin form shows a notice for these two articles. Saving database text does not replace a source revision. Remove the corresponding revision entry to return that article to database content.

The homepage, article routes, RSS, and post preview images use the same public view. The sitemap reads database URLs only. These changes do not write to production content.
