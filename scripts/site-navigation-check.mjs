// HTTP integration check. Does not start a browser or call a model.
// Run with the local Astro server: node scripts/site-navigation-check.mjs http://127.0.0.1:4396
import {mkdir, writeFile} from 'node:fs/promises';
import {parse} from 'parse5';

const base = new URL(process.argv[2] || 'http://127.0.0.1:4396');
if (!['127.0.0.1', 'localhost'].includes(base.hostname)) throw new Error('Use a local server.');
const output = new URL('../tests/artifacts/site-navigation/', import.meta.url);
await mkdir(output, {recursive: true});
const results = [];
const check = (name, pass, detail = '') => { results.push({name, pass: Boolean(pass), detail}); console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}`); };
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const nodes = root => [root, ...(root.childNodes || []).flatMap(nodes)];
const cache = new Map();
async function page(path) {
  if (cache.has(path)) return cache.get(path);
  const response = await fetch(new URL(path, base), {signal: AbortSignal.timeout(30000)});
  const html = await response.text();
  const result = {status: response.status, html, nodes: nodes(parse(html)), url: response.url};
  cache.set(path, result);
  return result;
}
try {
  for (const path of ['/', '/work', '/writing', '/about', '/notes', '/things-i-like', '/maat', '/gcontext']) {
    const p = await page(path);
    check(`${path} responds`, p.status === 200, p.status);
    const headers = p.nodes.filter(n => n.tagName === 'header' && attr(n, 'class')?.split(' ').includes('site-nav'));
    check(`${path} has one shared header`, headers.length === 1);
    const links = headers.flatMap(nodes).filter(n => n.tagName === 'a').map(n => attr(n, 'href'));
    check(`${path} has the main destinations`, ['/', '/work', '/writing', '/about', 'mailto:info@samperalabs.com'].every(href => links.includes(href)));
    check(`${path} has one contact dialog`, p.nodes.filter(n => n.tagName === 'dialog' && attr(n, 'data-contact-modal') !== undefined).length === 1);
  }
  const home = await page('/');
  const data = JSON.parse(home.nodes.find(n => attr(n, 'id') === 'ask-data').childNodes.map(n => n.value || '').join(''));
  check('Landing has three visitor paths', data.samples.map(s => s.label).join('|') === 'Understand my work|Explore my ideas|About me');
  check('Landing keeps the portrait', home.nodes.some(n => attr(n, 'data-flight') !== undefined));
  // A page can respond while Vite returns 504 for its cached rendering library.
  const portraitScript = home.nodes.find(n => n.tagName === 'script' && attr(n, 'src')?.includes('/Flight.astro?astro&type=script'));
  if (portraitScript) {
    const scriptURL = new URL(attr(portraitScript, 'src'), base);
    const scriptResponse = await fetch(scriptURL);
    check('Portrait startup script loads', scriptResponse.ok, scriptResponse.status);
    const source = await scriptResponse.text();
    for (const [, dependency] of source.matchAll(/from ["']([^"']+)["']/g)) {
      const url = new URL(dependency, scriptURL);
      if (url.origin !== base.origin) continue;
      const response = await fetch(url, {signal: AbortSignal.timeout(15000)});
      check('Portrait dependency loads: ' + url.pathname, response.ok, response.status);
    }
  }

  check('Landing has recent writing', home.nodes.some(n => attr(n, 'id') === 'home-writing-title'));
  const actions = new Set();
  for (const [id, answer] of Object.entries(data.content)) {
    check(`${id} has a title and introduction`, Boolean(answer.title) && answer.blocks[0]?.kind === 'text');
    check(`${id} has a next action`, Boolean(answer.action?.href) || (id === 'contact' && answer.blocks.some(b => b.kind === 'form')));
    if (answer.action?.href.startsWith('/')) actions.add(answer.action.href);
    const response = await fetch(new URL('/api/ask', base), {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({open: id})});
    const decision = await response.json();
    check(`${id} opens without a model call`, response.ok && decision.outcome === 'shown' && decision.experience?.id === id && decision.source !== 'jev');
    check(`${id} has two valid related questions`, decision.followUps?.length === 2 && decision.followUps.every(f => data.content[f.id]));
  }
  for (const path of actions) check(`Next action ${path} responds`, (await page(path)).status === 200);
  const writing = await page('/writing');
  const articleLinks = [...new Set(writing.nodes.filter(n => n.tagName === 'a').map(n => attr(n, 'href')).filter(h => h?.startsWith('/posts/')))];
  check('Writing has published articles', articleLinks.length > 0, articleLinks.length);
  check('Writing links to Notes', writing.nodes.some(n => attr(n, 'href') === '/notes'));
  check('About links to Things I Like', (await page('/about')).nodes.some(n => attr(n, 'href') === '/things-i-like'));
  const latest = data.content.articles.blocks.find(b => b.kind === 'list').articles;
  check('Jev article choices match Writing', latest.every(a => articleLinks.includes(`/posts/${a.slug}`)));
  for (const path of articleLinks) {
    const p = await page(path);
    check(`Published article ${path} responds`, p.status === 200);
    check(`${path} retains shared navigation`, p.nodes.some(n => n.tagName === 'header' && attr(n, 'class')?.includes('site-nav')));
  }
  for (const [path, project] of [['/posts/how-we-built-the-maat-admin-agent', '/maat'], ['/posts/why-ai-agents-need-a-global-context', '/gcontext']]) {
    check(`${path} links to its project`, (await page(path)).nodes.some(n => n.tagName === 'a' && attr(n, 'href') === project));
  }
  await writeFile(new URL('home.html', output), home.html);
} catch (error) {
  check('HTTP check completed', false, error.message);
} finally {
  const report = {date: new Date().toISOString(), base: base.origin, scope: 'HTTP pages, links, answer data, and direct topic API. No browser or model calls.', results};
  await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2) + '\n');
  const failed = results.filter(r => !r.pass);
  console.log(`${results.length - failed.length}/${results.length} checks passed. Report: ${new URL('report.json', output).pathname}`);
  if (failed.length) process.exitCode = 1;
}
