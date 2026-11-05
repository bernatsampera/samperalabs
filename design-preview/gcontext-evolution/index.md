# gcontext evolution review

- [../../src/pages/design-preview/gcontext-journey.astro](../../src/pages/design-preview/gcontext-journey.astro): Local journey route that uses the same renderer as MAAT.
- [../../src/pages/design-preview/gcontext-article.astro](../../src/pages/design-preview/gcontext-article.astro): Local article route that uses the site's reading layout and returns to the journey.
- [verify-journey.mjs](verify-journey.mjs): Repeats the TypeScript, content, route, and rendered HTML checks without a browser.
- [journey-verification.json](journey-verification.json): Saved results for the journey, twelve articles, and unchanged MAAT rendering.

- [review.html](review.html): Self-contained review of twelve story candidates with article directions, sources, and local review notes.
- [build.mjs](build.mjs): Builds the original research review and refreshes article metadata from the current six-step narrative.
- [serve.mjs](serve.mjs): Serves only the review page on local port 50532.
- [verification.json](verification.json): Saved non-browser checks for source references, HTML structure, scripts, links, and local HTTP delivery.
- [verify.mjs](verify.mjs): Repeats the file, source, HTML, and HTTP checks and saves their results.
- [../../src/editorial/drafts/gcontext-evolution/index.md](../../src/editorial/drafts/gcontext-evolution/index.md): Research method, proposed stories, source references, and limits.

Run `node design-preview/gcontext-evolution/build.mjs` from the project root to rebuild the page.

Run `node design-preview/gcontext-evolution/serve.mjs` from the project root to serve it.

With the server active, run `node design-preview/gcontext-evolution/verify.mjs` to repeat the non-browser checks.

Review URL: http://127.0.0.1:50532/

Journey URL: http://127.0.0.1:50533/design-preview/gcontext-journey

Run `npm run dev -- --host 127.0.0.1 --port 50533` from the project root to serve the journey and articles.

Run `node design-preview/gcontext-evolution/verify-journey.mjs` with that server active to repeat the non-browser checks.

The page stores review notes in browser storage. Export review downloads the choices and notes as JSON. The page sends no notes to a server. It needs no external resources.

The artifact is a content review. It does not replace the live gcontext page. Browser checks were not run.
