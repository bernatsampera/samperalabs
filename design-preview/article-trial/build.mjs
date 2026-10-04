import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const source = read('src/editorial/revisions/your-ai-agent-deserves-its-own-repo.md');
const font = readFileSync(new URL('node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2', root)).toString('base64');
const fontMedium = readFileSync(new URL('node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2', root)).toString('base64');
const fontCSS = `@font-face{font-family:Poppins;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:400} @font-face{font-family:Poppins;src:url(data:font/woff2;base64,${fontMedium}) format('woff2');font-weight:500 700}`;
const svg = read('design-preview/article-trial/context-path.svg').replace('<style>', `<style>${fontCSS}`);
const layoutCSS = read('src/layouts/BlogLayout.astro').split('<style is:global>')[1].split('</style>')[0];
const shellCSS = read('src/assets/styles/content-shell.css');
const headings = [];
const renderer = new marked.Renderer();
renderer.heading = ({tokens, depth}) => {
  const text = renderer.parser.parseInline(tokens);
  const id = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/ +/g, '-');
  headings.push({text, depth, id});
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};
let article = marked.parse(source, {renderer});
const insertion = '<h3 id="give-each-file-a-clear-purpose">';
if (!article.includes(insertion)) throw new Error('Article placement changed. Review the diagram position.');
const figure = `<figure id="trial-figure">${svg}<figcaption>Concept diagram. The index points to a procedure. The procedure identifies the service knowledge needed for this task.</figcaption></figure>`;
article = article.replace(insertion, figure + insertion);
const comicData = readFileSync(new URL('session-context-comic-v2.png', import.meta.url)).toString('base64');
const comic = `<figure id="trial-comic"><img src="data:image/png;base64,${comicData}" alt="First chat: a person says, Here's how our billing works. The AI replies, Got it. New chat: the AI asks, How does your billing work? The person looks tired." width="1254" height="1254"><figcaption>Illustration. Explaining the same setup again.</figcaption></figure>`;
const openingEnd = article.indexOf('</p>');
if (openingEnd < 0) throw new Error('Article opening missing. Review the comic position.');
article = article.slice(0, openingEnd + 4) + comic + article.slice(openingEnd + 4);
const contents = `<ol class="reading-contents-list">${headings.map(({text, id, depth}) => `<li class="depth-${depth}"><a data-reading-link href="#${id}">${text}</a></li>`).join('')}</ol>`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Article trial | Your AI Agent Deserves Its Own Repo</title>
<style>${fontCSS}
:root{--font-sans:Poppins,Arial,sans-serif;--font-reading:Georgia,serif}*{box-sizing:border-box}body{margin:0;font-family:var(--font-sans)}a{color:inherit}button{font:inherit;cursor:pointer}a:focus-visible,button:focus-visible{outline:2px solid #18181b;outline-offset:4px}
${shellCSS}${layoutCSS}
.review-bar{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 24px;padding:12px 20px;background:#18181b;color:white;font-size:12px}.review-bar a{color:white;text-underline-offset:4px}.review-bar button{background:white;color:#18181b;border:0;border-radius:3px;padding:8px 12px;min-height:36px}.site-label{padding:25px 40px;border-bottom:1px solid #e4e4e7;font-weight:600;font-size:15px}.reading-paper{padding-top:0}.reading-head{padding-top:54px}.reading-rail{margin-top:54px}.reading-contents-list .depth-3{margin-left:12px!important;border-left:1px solid #d4d4d8;background:white!important}.depth-3 a{font-size:12px!important;font-weight:400!important}.reading-prose pre{background:#f4f4f5;padding:22px;overflow:auto;line-height:1.6;font-size:16px}.reading-prose pre code{background:none!important;font-size:inherit!important}.reading-page .reading-prose figure{margin:40px 0;padding:28px 0 22px;border-block:1px solid #e4e4e7;scroll-margin-top:75px}.reading-prose figure svg{display:block;width:100%;max-width:420px;height:auto;margin:auto}.reading-page .reading-prose figcaption{max-width:420px;margin:20px auto 0;text-align:left;font-size:13px}.reading-page .reading-prose figure[hidden]{display:none}.review-end{font:14px/1.7 var(--font-sans);margin:48px 0;color:#52525b;border-top:1px solid #e4e4e7;padding-top:24px}body.phone-preview{max-width:375px;margin:auto;border-inline:1px solid #e4e4e7}.phone-preview .content-shell{padding-inline:20px}.phone-preview .content-shell-grid{display:block}.phone-preview .reading-rail{display:none}.phone-preview .reading-mobile-contents{display:block}.phone-preview .reading-prose{font-size:18px}.phone-preview .reading-head h1{font-size:35px}.phone-preview .site-label{padding:20px}.phone-preview .review-bar{position:static}.phone-preview .reading-paper{max-width:100%}@media(max-width:600px){.site-label{padding:20px}.review-bar{position:static}.reading-head{padding-top:32px}}
.reading-page .reading-prose #trial-comic{border:0;padding:0;margin:30px 0 36px}.reading-page .reading-prose #trial-comic img{width:100%;max-width:550px;height:auto;margin:0 auto}.reading-page .reading-prose #trial-comic figcaption{max-width:550px;margin-top:14px}\n</style></head><body>
<div class="review-bar"><span>Local article trial</span><a href="#trial-comic">Jump to comic</a><a href="#trial-figure">Jump to diagram</a><button id="compare-comic" type="button" aria-pressed="false">Hide comic</button><button id="compare" type="button" aria-pressed="false">Hide diagram</button><button id="phone" type="button" aria-pressed="false">Phone width</button></div>
<div class="site-label">Bernat Sampera</div>
<main class="reading-page content-shell content-shell-grid has-contents"><aside class="reading-rail"><nav aria-label="On this page"><p class="contents-label">On this page</p>${contents}</nav></aside><article class="reading-paper"><header class="reading-head"><h1>Your AI Agent Deserves Its Own Repo</h1><p class="reading-author">Written by Bernat Sampera</p></header><details class="reading-mobile-contents"><summary>On this page</summary><nav aria-label="On this page">${contents}</nav></details><div class="reading-prose">${article}</div><footer class="review-end">Review point: does the comic add useful humor? Does the diagram make the path through the files clear? The article wording is unchanged. This local copy uses the site's reading styles.</footer></article></main>
<script>
document.getElementById('compare-comic').addEventListener('click',function(){const figure=document.getElementById('trial-comic');figure.hidden=!figure.hidden;this.textContent=figure.hidden?'Show comic':'Hide comic';this.setAttribute('aria-pressed',String(figure.hidden));});
document.getElementById('compare').addEventListener('click',function(){const figure=document.getElementById('trial-figure');figure.hidden=!figure.hidden;this.textContent=figure.hidden?'Show diagram':'Hide diagram';this.setAttribute('aria-pressed',String(figure.hidden));});
document.getElementById('phone').addEventListener('click',function(){const active=document.body.classList.toggle('phone-preview');this.textContent=active?'Desktop width':'Phone width';this.setAttribute('aria-pressed',String(active));});
</script></body></html>`;
writeFileSync(new URL('index.html', import.meta.url), html);
writeFileSync(new URL('context-path-export.svg', import.meta.url), svg);
console.log(`Built ${fileURLToPath(new URL('index.html', import.meta.url))}`);
