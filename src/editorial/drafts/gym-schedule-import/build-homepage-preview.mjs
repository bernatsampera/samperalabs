import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const root = new URL('../../../../', import.meta.url);
const here = new URL('./', import.meta.url);
const read = (path) => fs.readFile(new URL(path, root), 'utf8');
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const metadata = JSON.parse(await fs.readFile(new URL('metadata.json', here), 'utf8'));
const presentationCode = await transform(await read('src/lib/postPresentation.ts'), { loader: 'ts', format: 'esm' });
const { getPostPresentation } = await import(`data:text/javascript;base64,${Buffer.from(presentationCode.code).toString('base64')}`);
const presentation = getPostPresentation(metadata.slug);
if (!presentation) throw new Error('The article has no homepage scene.');
const scene = (await read('src/components/home/schedule-scene.svg')).replaceAll('__SCENE_ID__', `essay-${metadata.slug}`);
const css = await read('src/assets/styles/home.css');
const script = await transform(await read('src/scripts/home.ts'), { loader: 'ts', format: 'esm' });
const fontBytes = await fs.readFile(new URL('node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2', root));
const font = fontBytes.toString('base64');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Local homepage preview: gym schedule import</title>
<style>
@font-face{font-family:Poppins;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:400;font-display:swap}
:root{--font-sans:Poppins,sans-serif}body{margin:0;font-family:var(--font-sans)}
${css}
.preview-note{max-width:1160px;margin:0 auto;padding:32px 24px;color:#52525b;font-size:14px}
.preview-note h1{color:#18181b;font-size:24px}.home-notebook{max-width:1160px;margin:auto;padding:0 24px}
.preview-end{min-height:60svh;padding:36px 24px;color:#52525b}
</style></head><body>
<header class="preview-note"><h1>Local homepage preview</h1><p>Scroll to turn the schedule picture into a table, then editable classes.</p><p>The complete result remains visible with reduced motion or no JavaScript.</p></header>
<main class="home-notebook"><div class="home-body"><div class="writing-sections">
<section id="essay-${escape(metadata.slug)}" class="home-post home-post-feature" data-home-section aria-labelledby="preview-title">
<div class="home-post-grid"><div class="home-post-copy"><h2 id="preview-title">${escape(metadata.title)}</h2>
<span class="post-date">Local draft · For review</span><p class="home-post-summary">${escape(presentation.summary)}</p>
<a class="home-read" href="article.md">Read the local draft</a></div>
<figure class="home-scene home-scene-schedule-import" data-home-scene>${scene}<figcaption class="schedule-scene-caption">${escape(presentation.caption)}</figcaption></figure></div>
</section></div></div></main>
<footer class="preview-end">Illustrative classes. The times cover schedule setup only.</footer>
<script type="module">${script.code}</script></body></html>`;
await fs.writeFile(new URL('homepage-preview.html', here), html);
console.log(`Local preview: ${fileURLToPath(new URL('homepage-preview.html', here))}`);
