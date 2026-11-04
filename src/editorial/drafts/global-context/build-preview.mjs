// Builds preview.html from article.md with the reading layout prose styles.
// Run from the site root: node src/editorial/drafts/global-context/build-preview.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const dir = dirname(fileURLToPath(import.meta.url));
const meta = JSON.parse(readFileSync(join(dir, 'metadata.json'), 'utf8'));
const body = marked.parse(readFileSync(join(dir, 'article.md'), 'utf8'));

const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const toc = [];
const html = body.replace(/<h([23])>(.*?)<\/h\1>/g, (_, level, text) => {
  const id = slug(text);
  toc.push({ level, text, id });
  return `<h${level} id="${id}">${text}</h${level}>`;
});
const contents = toc
  .map((h) => `<a href="#${h.id}" class="l${h.level}">${h.text}</a>`)
  .join('\n');

writeFileSync(join(dir, 'preview.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${meta.title} (local preview)</title>
<style>
  body { margin: 0; background: #fff; font-family: Poppins, "Helvetica Neue", Arial, sans-serif; }
  .wrap { display: grid; grid-template-columns: 1fr; gap: 56px; max-width: 1080px; margin: 0 auto; padding: 40px 24px 96px; }
  @media (min-width: 761px) { .wrap { grid-template-columns: 220px minmax(0, 700px); } }
  .rail { display: none; }
  @media (min-width: 761px) { .rail { display: block; position: sticky; top: 40px; align-self: start; margin-top: 150px; font-size: 13px; line-height: 1.4; } }
  .rail a { display: block; color: #686868; text-decoration: none; padding: 5px 0; }
  .rail a.l3 { padding-left: 14px; font-size: 12px; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: #686868; margin-bottom: 12px; }
  .badge { font-size: 12px; color: #9a6b1f; background: #f6ead2; display: inline-block; padding: 4px 10px; border-radius: 99px; }
  h1.title { font-size: 40px; line-height: 1.15; letter-spacing: -.03em; margin: 18px 0 14px; color: #171717; }
  .desc { font-size: 19px; color: #555; line-height: 1.5; margin: 0 0 8px; }
  .by { font-size: 13px; color: #686868; margin-bottom: 40px; }
  .prose { font-family: Georgia, serif; font-size: 20px; line-height: 1.8; color: #303030; overflow-wrap: break-word; }
  .prose p { margin: 0 0 24px; }
  .prose :is(h2,h3) { font-family: Poppins, "Helvetica Neue", Arial, sans-serif; color: #171717; font-weight: 600; letter-spacing: -.025em; line-height: 1.3; margin: 2em 0 .8em; }
  .prose h2 { font-size: 29px; font-weight: 550; margin: 39px 0 21px; text-decoration: underline; text-decoration-color: #d4d4d8; text-decoration-thickness: 3px; text-underline-offset: 5px; text-decoration-skip-ink: none; }
  .prose h3 { font-size: 25px; }
  .prose :is(ul,ol) { margin: 1.2em 0; padding-left: 1.4em; }
  .prose li { margin-bottom: .4em; }
  .prose blockquote { border-left: 3px solid #d4d4d8; color: #3f3f46; font-size: 1.15em; padding-left: 22px; margin: 32px 0; }
  .prose img { display: block; max-width: 100%; height: auto; margin: 35px auto; }
  .prose figure { margin: 35px 0; }
  .prose figcaption { font: 12px/1.6 Poppins, "Helvetica Neue", Arial, sans-serif; text-align: center; color: #686868; margin-top: 12px; }
  .prose table { display: block; width: 100%; overflow-x: auto; border-collapse: collapse; font-size: .85em; margin: 30px 0; }
  .prose :is(th,td) { padding: 12px 16px; border-bottom: 1px solid #ddd; text-align: left; }
  @media (max-width: 600px) { .prose { font-size: 18px; } h1.title { font-size: 32px; } }
</style></head>
<body><div class="wrap">
<nav class="rail"><div class="label">Contents</div>${contents}</nav>
<main>
<span class="badge">Local preview. Not published.</span>
<h1 class="title">${meta.title}</h1>
<p class="desc">${meta.description}</p>
<div class="by">${meta.author}</div>
<article class="prose">${html}</article>
</main></div></body></html>
`);
console.log(`preview.html: ${toc.length} headings`);
