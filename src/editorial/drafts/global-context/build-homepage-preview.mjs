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
const scene = (await read('src/components/home/global-context-scene.svg')).replaceAll('__SCENE_ID__', `essay-${metadata.slug}`);
const css = await read('src/assets/styles/home.css');
const script = await transform(await read('src/scripts/home.ts'), { loader: 'ts', format: 'esm' });
const fontBytes = await fs.readFile(new URL('node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2', root));
const font = fontBytes.toString('base64');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Local homepage preview: global context</title>
<script>if(new URLSearchParams(location.search).has('capture')){history.scrollRestoration='manual';scrollTo(0,0);document.documentElement.className='capture';addEventListener('load',()=>scrollTo(0,0))}</script>
<style>
@font-face{font-family:Poppins;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:400;font-display:swap}
:root{--font-sans:Poppins,sans-serif}body{margin:0;font-family:var(--font-sans)}
${css}
.preview-note{max-width:1160px;margin:0 auto;padding:32px 24px;color:#52525b;font-size:14px}
.preview-note h1{color:#18181b;font-size:24px}.home-notebook{max-width:1160px;margin:auto;padding:0 24px}
.preview-end{min-height:60svh;padding:36px 24px;color:#52525b}
.capture body{position:fixed;inset:0;width:600px;height:460px;overflow:hidden;background:#fafafa}
.capture :is(.preview-note,.home-post-copy,.home-scene-caption,.home-scene-controls,.preview-end){display:none!important}
.capture .home-notebook{width:600px;max-width:none;margin:0;padding:0}
.capture .home-post{min-height:0;padding:0;border:0}
.capture .home-post-grid{display:block}
.capture .home-scene{width:600px;padding:0}
</style></head><body>
<header class="preview-note"><h1>Local homepage preview</h1><p>Scroll to follow one price question from the map to the Sales drawer.</p><p>The complete result remains visible with reduced motion or no JavaScript.</p></header>
<main class="home-notebook"><div class="home-body"><div class="writing-sections">
<section id="essay-${escape(metadata.slug)}" class="home-post home-post-feature" data-home-section aria-labelledby="preview-title">
<div class="home-post-grid"><div class="home-post-copy"><h2 id="preview-title">${escape(metadata.title)}</h2>
<span class="post-date">Local draft · For review</span><p class="home-post-summary">${escape(presentation.summary)}</p>
<a class="home-read" href="article.md">Read the local draft</a></div>
<figure class="home-scene home-scene-global-context" data-home-scene>${scene}<figcaption class="home-scene-caption">${escape(presentation.caption)}</figcaption></figure></div>
</section></div></div></main>
<footer class="preview-end">A fictional example. Only the Sales drawer opens.</footer>
<script type="module">
const capture = new URLSearchParams(location.search).get('capture');
if (capture === null) {
${script.code}
} else if (capture !== 'static') {
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const progress = clamp(Number(capture));
  for (const element of document.querySelectorAll('[data-motion]')) {
    const start = Number(element.dataset.start ?? 0);
    const end = Number(element.dataset.end ?? 1);
    const fraction = clamp((progress - start) / Math.max(0.001, end - start));
    const eased = fraction * fraction * (3 - 2 * fraction);
    if (element.dataset.motion === 'draw') {
      element.style.strokeDasharray = '1';
      element.style.strokeDashoffset = String(1 - eased);
    } else {
      const leaving = element.dataset.motion === 'leave';
      const offset = leaving ? eased : 1 - eased;
      element.style.opacity = String(leaving ? 1 - eased : eased);
      element.style.transform = 'translate(' + Number(element.dataset.x ?? 0) * offset + 'px, ' + Number(element.dataset.y ?? 0) * offset + 'px)';
    }
  }
}
</script></body></html>`;
await fs.writeFile(new URL('homepage-preview.html', here), html);
console.log(`Local preview: ${fileURLToPath(new URL('homepage-preview.html', here))}`);
