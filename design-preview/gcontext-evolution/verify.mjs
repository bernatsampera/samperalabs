import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const drafts = path.join(root, 'src/editorial/drafts/gcontext-evolution');
const html = fs.readFileSync(path.join(here, 'review.html'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(drafts, 'stories.json'), 'utf8'));
const sources = JSON.parse(fs.readFileSync(path.join(drafts, 'sources.json'), 'utf8'));
const failures = [];
const requireCheck = (ok, description) => { if (!ok) failures.push(description); };
const excluded = '/Users/bsampera/Documents/maat';
const ids = new Set();
const anchors = [];
const labels = [];
const scripts = [];
let renderedStories = 0;

function visit(node) {
  const attrs = Object.fromEntries((node.attrs || []).map(a => [a.name, a.value]));
  if (attrs.id) {
    requireCheck(!ids.has(attrs.id), `Duplicate element ID: ${attrs.id}`);
    ids.add(attrs.id);
  }
  if (attrs.href?.startsWith('#')) anchors.push(attrs.href.slice(1));
  if (node.tagName === 'label') labels.push(attrs.for);
  if (attrs['data-story']) renderedStories++;
  if (node.tagName === 'script') {
    requireCheck(!attrs.src, 'Unexpected external script');
    scripts.push((node.childNodes || []).map(n => n.value || '').join(''));
  }
  if (['img', 'iframe', 'link'].includes(node.tagName)) {
    requireCheck(!attrs.src && !attrs.href, 'Unexpected external resource');
  }
  for (const child of node.childNodes || []) visit(child);
}
visit(parse(html));
for (const id of anchors) requireCheck(ids.has(id), `Missing anchor: ${id}`);
for (const id of labels) requireCheck(ids.has(id), `Missing control for label: ${id}`);
for (const script of scripts) {
  try { new vm.Script(script); } catch (error) { failures.push(`Inline script syntax: ${error.message}`); }
}
requireCheck(renderedStories === data.stories.length, 'Rendered story count differs from source');
requireCheck(data.stories.length === 12, 'Expected twelve story candidates');
requireCheck(new Set(data.stories.map(s => s.id)).size === data.stories.length, 'Duplicate story ID');
for (const story of data.stories) {
  requireCheck(data.eras.some(e => e.id === story.era), `Missing era for ${story.id}`);
  requireCheck(story.article.length >= 3, `Incomplete article direction: ${story.id}`);
  for (const id of story.sources) requireCheck(Boolean(sources[id]), `Missing source: ${id}`);
}

const documentHashes = {};
for (const [id, source] of Object.entries(sources)) {
  for (const p of [source.path, source.repo, source.project].filter(Boolean)) {
    requireCheck(p !== excluded && !p.startsWith(excluded + '/'), `Excluded source: ${id}`);
  }
  try {
    if (source.path) {
      requireCheck(fs.existsSync(source.path), `Source does not exist: ${id}`);
      if (source.kind === 'Document') {
        const resolved = fs.realpathSync(source.path);
        requireCheck(resolved !== excluded && !resolved.startsWith(excluded + '/'), `Excluded source target: ${id}`);
        if (resolved !== excluded && !resolved.startsWith(excluded + '/')) {
          documentHashes[id] = crypto.createHash('sha256').update(fs.readFileSync(source.path)).digest('hex');
        }
      }
    }
    if (source.repo) {
      execFileSync('git', ['cat-file', '-e', source.commit + (source.file ? ':' + source.file : '')], {cwd: source.repo, stdio: 'pipe'});
    }
  } catch (error) { failures.push(`Source reference failed: ${id}: ${error.message}`); }
}

for (const file of [path.join(drafts,'stories.json'), path.join(drafts,'research.md'), path.join(here,'review.html')]) {
  requireCheck(!/[\u2013\u2014]/.test(fs.readFileSync(file,'utf8')), `Long dash found: ${path.basename(file)}`);
}
for (const index of [path.join(drafts,'index.md'), path.join(here,'index.md')]) {
  for (const match of fs.readFileSync(index,'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    if (/^https?:/.test(match[1])) continue;
    const target = path.resolve(path.dirname(index), match[1]);
    if (target === path.join(here, 'verification.json')) continue;
    requireCheck(fs.existsSync(target), `Broken index link: ${match[1]}`);
  }
}

const base = `http://127.0.0.1:${process.env.GCONTEXT_REVIEW_PORT || 50532}`;
const http = [];
for (const [route, method, expected] of [['/','GET',200],['/review.html','HEAD',200],['/sources.json','GET',404],['/','POST',405]]) {
  try {
    const response = await fetch(base + route, { method });
    http.push({ route, method, expected, actual: response.status });
    requireCheck(response.status === expected, `HTTP status differs: ${method} ${route}`);
    if (route === '/' && method === 'GET') requireCheck(await response.text() === html, 'Served HTML differs from saved artifact');
  } catch (error) { failures.push(`HTTP request failed: ${error.message}`); }
}
const result = {
  checkedAt: new Date().toISOString(),
  passed: failures.length === 0,
  stories: renderedStories,
  sourceReferences: Object.keys(sources).length,
  htmlSha256: crypto.createHash('sha256').update(html).digest('hex'),
  documentHashes,
  checks: ['Story completeness', 'Source files and Git objects', 'Excluded source paths', 'HTML IDs and anchors', 'Form labels', 'Inline script syntax', 'No external resources', 'Index links', 'Local HTTP delivery'],
  http,
  browser: 'Not run. Not authorized.',
  limits: 'Static and HTTP checks do not verify visual layout, browser storage, downloads, or historical performance claims.',
  failures,
};
fs.writeFileSync(path.join(here,'verification.json'), JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed: result.passed, stories: result.stories, sources: result.sourceReferences, failures},null,2));
if (failures.length) process.exitCode = 1;
