# SamperaLabs article operations

This reference supplies the site facts needed by the shared `new-post` command.
Read the linked implementation only for the operation being performed.
If the implementation differs from this reference, report the difference before a remote write.

## Site and reader

SamperaLabs is Bernat Sampera's personal site at https://samperalabs.com.
It presents essays about building AI and software, project explanations, notes, and Things I Like.
Blog ideas and experiments lead the site.
The portfolio is secondary.
The default article reader builds AI products.
Bernat owns the ideas, opinions, personal experience, and final text.
AI assists with evidence, structure, wording, and visuals.

Use the topic and intended reader supplied for the current article.
Use collective language for verified team work.
Do not invent outcomes, motives, evaluations, or internal implementation details.
Label fictional and simplified examples.

The site uses Astro 5, React 19, Tailwind CSS, and SQLite.
Use Poppins for interface text and diagram labels.
Use Georgia for article prose.
Keep code in monospace.
Preserve the approved reading layout and existing article URLs.

## What a post is

A normal post is a database record with Markdown content.
Its public URL is `/posts/<slug>`.
Public reads exclude drafts and deleted posts.
The title, author, description, publication date, tags, optional image, and status belong to the database record.
The article layout supplies the page title, byline, heading anchors, contents, and code presentation.
Use H2 for main article sections and H3 for real subsections.
Do not add an H1 that repeats the page title inside the content.

The production database is `/app/data/content.db` in a persistent Docker volume.
Development reads the live content service over HTTPS.
Development writes can therefore change production content.
There is no isolated local content database used by the application.
The working copy under `scripts/manage-sqlite/` is for manual maintenance only.
Do not replace the production database to publish a post.

Local files under `src/editorial/drafts/` are editorial sources.
They do not automatically create posts or preview routes.
The `maatBrainDraft.ts` helper is currently unused by public routes.
For local review, use a local artifact with the reading styles or an explicitly requested local preview route.
Do not publish to obtain a preview.

Two existing posts have source-managed public text:

- `your-ai-agent-deserves-its-own-repo`
- `analyzing-open-deep-research`

Their Markdown revisions override database content and descriptions in public reads.
The database still controls their existence, status, URL, and other metadata.
Saving their admin content does not replace the source revision.
Do not add new posts to the revision map as a publication shortcut.

## Known files

All paths below are relative to the SamperaLabs root.

| Operation | File |
| --- | --- |
| Writing criteria | `src/docs/editorial-guide.md` |
| Draft request and review | `src/docs/new-essay-prompt.md` |
| Evidence from another project | `src/docs/project-story-brief.md` |
| Images, comics, and motion | `src/docs/post-image-workflow.md` |
| Local editorial sources | `src/editorial/drafts/index.md` |
| Source override rules | `src/editorial/revisions/index.md` |
| Source override map | `src/lib/postRevisions.ts` |
| Shared public reads | `src/lib/publicPostStore.ts` |
| Content database implementations | `src/lib/db.ts` |
| Post create and list API | `src/pages/api/posts/index.ts` |
| Post read and update API | `src/pages/api/posts/[id].ts` |
| Post lookup by slug | `src/pages/api/posts/slug/[slug].ts` |
| Image upload API | `src/pages/api/upload-image.ts` |
| Article rendering | `src/pages/posts/[slug].astro` |
| Reading layout | `src/layouts/BlogLayout.astro` |
| Curated homepage selection | `src/pages/index.astro` |
| Homepage descriptions and scene types | `src/lib/postPresentation.ts` |
| Homepage visual compositions | `src/components/home/PostScene.astro` |
| Homepage motion controller | `src/scripts/home.ts` |
| Homepage styles | `src/assets/styles/home.css` |
| Interactive component registry | `src/lib/interactiveEssays.ts` |
| RSS endpoint | `src/pages/rss.xml.js` |
| Sitemap integration | `src/integrations/sitemap.ts` and `src/integrations/postUrls.ts` |
| Locked layout decisions | `design-preview/decisions.md` |

## Content API

The base URL comes from `BLOG_REMOTE_URL` when set.
The default is `https://samperalabs.com`.
All `/api/posts*` requests require `Authorization: Bearer <BLOG_API_KEY>`.
Load credentials from the site's ignored `.env` file into the process.
Never print credentials or put them in command arguments, article files, or Git.
Use structured request bodies with actual newlines.

| Request | Purpose |
| --- | --- |
| `GET /api/posts?limit=100&offset=0` | List admin records, including drafts. Follow pagination when needed. |
| `GET /api/posts/slug/<slug>` | Check the exact slug, including draft and deleted records. |
| `GET /api/posts/<id>` | Read a record before or after a write. |
| `POST /api/posts` | Create a record. |
| `PATCH /api/posts/<id>` | Update supplied fields on that record. |

The create body accepts `title`, `author`, `description`, `content`, `slug`, `tags`, `status`, `pub_date`, `image_url`, and `image_alt`.
Use `author: "Bernat Sampera"` unless the author supplies another value.
Reuse appropriate existing tags.
Always supply status explicitly.
The create API defaults to `published` when status is omitted.
It also supplies the current date when `pub_date` is omitted.
Keep the local publication date undecided until the author requests publication or supplies a date.
A requested remote draft receives an API date, which can be revised at publication.

For a requested remote draft:

1. Check the intended slug for a collision.
2. Create with `status: "draft"`.
3. Verify the returned ID, slug, and draft status.
4. Save the ID in local review notes for later updates.

For requested publication:

1. Finish the reviewed article and check every asset URL.
2. Read and save the existing record before updating it.
3. Check that it did not change since the review or backup.
4. Update the saved draft ID with `status: "published"` and the agreed metadata.
5. If no record exists, create with `status: "published"` only when publication is already authorized.
6. Read the result again to check its status, slug, and content.
7. Check `/posts/<slug>` and `/rss.xml` through HTTP.

Preserve an existing article's slug and date unless the author requests changes.
If a request times out after a write, read by slug or ID before retrying.
Do not create a second post or overwrite a collision to resolve uncertainty.
If credentials are unavailable, finish the local work and report the missing access.

## Images and homepage

Keep draft assets, prompts, captions, and alt text with the local article work.
Generated screenshots and charts must not represent real product evidence.
Follow the image workflow for two distinct concepts and comparison with recent posts.

For requested remote submission, images can use the existing upload API.
Send `multipart/form-data` with `image` and optional `postId` to `POST /api/upload-image`.
The route accepts image types up to 10 MB and returns `imageUrl`.
An upload is a remote write and needs authorization within the article request.
Check the returned URL before using it.

Alternatively, put approved static assets in `public/images/`.
Their URLs are `/images/<filename>` after a site deployment.
Deploy and check those files before publishing content that references them.
Update the root navigation when adding a static asset.

Publishing does not automatically add a post to the curated homepage.
The homepage uses `featuredSlugs` in `src/pages/index.astro`.
Change that selection when the author requests homepage inclusion.
The same selected records supply both homepage sections and sidebar links.
A post can use a text preview without animation.
Do not create empty visual space for it.

For a requested homepage scene, add the specific composition and scene metadata.
The shared controller reads each SVG element's `data-motion`, `data-start`, `data-end`, `data-x`, and `data-y` values.
Existing motion operations are `draw`, `reveal`, and `leave`.
Keep section dimensions stable during scroll.
Supply a complete static scene for reduced motion and unavailable JavaScript.
Do not copy another scene's composition and timing only to change its labels.

## Commits and deployment

Database publication and site deployment are separate operations.
A content update appears at request time without a code deployment.
Static images, homepage selection, scenes, and source-managed revisions need a deployment.
The sitemap is a build artifact.
Check its listed sitemap after publication rather than assuming a database write refreshed it.

The Git remote is `https://github.com/bernatsampera/samperalabs.git`.
Production tracks `main`.
Coolify builds the site with Nixpacks and starts the Astro Node server.
Pushing `main` starts an automatic deployment.
A push therefore needs authorization for deployment, as well as the requested Git work.

Known installation details, checked during the 4 October 2026 release:

- VPS: `178.156.132.116`, SSH user `root`, local key `~/.ssh/hetzni`.
- Coolify application UUID: `g08c40g44o88s8wwc488w0k8`, application ID `14`.
- Application name: `samperalabs`, repository branch: `main`.
- Coolify and database containers: `coolify` and `coolify-db`.
- PostgreSQL deployment records: `application_deployment_queues` in database `coolify`, user `coolify`.
- The deployment table stores `application_id` as text. Use `'14'` in an SQL filter.

For an authorized code release:

1. Check the working tree and the exact changes to release.
2. Run `npm run build`, applicable lint checks, and `git diff --check`.
3. Run existing tests when the change requires them. Do not add unit tests after implementation.
4. Commit the requested scope. Never include `.env`, database copies, or private run data.
5. Push the release to `origin main` when deployment is authorized.
6. Read Coolify's latest deployment record for this application and the pushed commit.
7. Wait for `finished`. If it reports `failed`, inspect the deployment error before another action.
8. Check that the running application container uses the pushed commit as its image tag.
9. Check the live page, assets, and relevant RSS response through HTTP.

An authenticated SSH query can read the deployment table without an interactive browser:

```sql
SELECT deployment_uuid, status, commit, updated_at
FROM application_deployment_queues
WHERE application_id = '14'
ORDER BY id DESC
LIMIT 3;
```

Pass this query as an argument to `docker exec coolify-db psql -U coolify -d coolify -c` over SSH.
Use proper shell quoting for the remote arguments.
Do not expose the database or read unrelated configuration secrets.
Do not queue a duplicate deployment when the push already started one.
If the automatic deployment does not start, report that condition before changing deployment configuration.
Keep the persistent content volume intact.
Do not run cleanup or deletion commands during publication.

Run browser review only when explicitly requested.
Report browser checks as not run otherwise.
Keep meaningful check results and publication IDs in local review notes.
Do not treat a queued deployment as a completed release.
