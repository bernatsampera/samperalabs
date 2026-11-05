import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {parse} from 'parse5';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here,'../..');
const draftRoot = path.join(root,'src/editorial/drafts/gcontext-evolution');
const metadata = JSON.parse(fs.readFileSync(path.join(draftRoot,'metadata.json'),'utf8'));
const directions = JSON.parse(fs.readFileSync(path.join(draftRoot,'stories.json'),'utf8'));
const sources = JSON.parse(fs.readFileSync(path.join(draftRoot,'sources.json'),'utf8'));
const failures = [];
const assert = (value, message) => {if (!value) failures.push(message);};
const base = process.env.GCONTEXT_JOURNEY_ORIGIN || 'http://127.0.0.1:50533';
const routes = [];
const articles = [];
const inspect = (html) => {
  const nodes=[];
  function walk(n){ if(n.tagName)nodes.push({tag:n.tagName,attrs:Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value])),node:n});for(const c of n.childNodes||[])walk(c);}
  walk(parse(html));return nodes;
};
const hasClass = (n,c) => (n.attrs.class||'').split(/\s+/).includes(c);
const textOf = (node) => (node.value||'')+(node.childNodes||[]).map(textOf).join('');
async function page(route,expected=200){
  const response=await fetch(base+route);const html=await response.text();
  routes.push({route,status:response.status,bytes:Buffer.byteLength(html)});
  assert(response.status===expected,`${route}: expected ${expected}, received ${response.status}`);
  if(route.includes('gcontext-')&&expected===200)assert(response.headers.get('x-robots-tag')==='noindex, nofollow',`${route}: noindex header missing`);
  return {html,nodes:inspect(html)};
}

let typecheck=false;
try{
  execFileSync(path.join(root,'node_modules/.bin/tsc'),['--noEmit','--skipLibCheck','--resolveJsonModule','--esModuleInterop','--moduleResolution','bundler','--module','esnext','--target','es2022','src/editorial/drafts/gcontext-evolution/journey.ts','src/lib/stories/visuals.ts'],{cwd:root,stdio:'pipe'});
  typecheck=true;
}catch(error){failures.push('Focused TypeScript check failed: '+String(error.stdout||error.message));}

const journey=await page('/design-preview/gcontext-journey');
const cards=journey.nodes.filter(n=>hasClass(n,'work-card'));
const steps=journey.nodes.filter(n=>hasClass(n,'work-step'));
assert(cards.length===6,'Expected six connected journey cards');
assert(journey.nodes.filter(n=>hasClass(n,'time-lane')).length===3,'Expected three timeline lanes');
const mainEntries=metadata.filter(m=>m.main);
assert(steps.map(s=>s.attrs.id).join(',')===mainEntries.map(m=>m.id).join(','),'Main path order differs from the narrative');
assert(metadata.filter(m=>!m.main).length===6,'Expected six optional experiments');
assert(journey.nodes.filter(n=>n.attrs['data-example-stage']).map(n=>n.attrs['data-example-stage']).join(',')==='find,select,keep,update,review,reuse','The illustrative example does not follow all six steps');
for(const branch of journey.nodes.filter(n=>hasClass(n,'story-branches')))assert(!('open' in branch.attrs),'Optional experiments must start collapsed');
assert(journey.nodes.filter(n=>hasClass(n,'route-read')).length===1,'Expected one progress path');
assert(journey.nodes.filter(n=>hasClass(n,'finish-check')).length===1,'Expected one journey finish marker');
for(const part of ['1','2','3'])assert(steps.find(n=>n.attrs['data-part']===part)?.attrs['data-side']==='left',`Part ${part} does not begin on the left`);
const ids=new Set(journey.nodes.map(n=>n.attrs.id).filter(Boolean));
for(const n of journey.nodes.filter(n=>n.attrs.href?.startsWith('#')))assert(ids.has(n.attrs.href.slice(1)),`Missing journey anchor ${n.attrs.href}`);
const previewCounts=[];
for(const m of metadata){
  const old=directions.stories.find(s=>s.id===m.id);assert(Boolean(old),`Missing research story ${m.id}`);
  const body=fs.readFileSync(path.join(draftRoot,m.article),'utf8');
  assert(!/[\u2013\u2014]/.test(body+m.description+m.title),`Long dash in ${m.id}`);
  assert(!/the article should|this article should|\bTODO\b|\bTBD\b/.test(body),`Editorial placeholder in ${m.id}`);
  assert(!/\b(I|my|we|our)\b/i.test(body+m.description),`First-person voice remains in ${m.id}`);
  assert(m.status==='draft'&&m.publicationDate===null,`Draft status differs: ${m.id}`);
  for(const id of m.sources)assert(Boolean(sources[id]),`Missing source ${id}`);
  const route='/design-preview/gcontext-article?story='+m.id;
  assert(journey.nodes.some(n=>n.tag==='a'&&n.attrs.href===route),`Missing journey or branch link for ${m.id}`);
  const pageResult=await page(route);
  assert(pageResult.nodes.some(n=>n.tag==='h1'&&textOf(n.node)===m.title),`Incorrect article heading for ${m.id}`);
  assert(pageResult.nodes.some(n=>hasClass(n,'reading-back')&&n.attrs.href==='/design-preview/gcontext-journey#'+m.returnTo),`Missing journey return for ${m.id}`);
  const nextLinks=pageResult.nodes.filter(n=>hasClass(n,'next-experiment'));
  const next=m.main?mainEntries[mainEntries.findIndex(entry=>entry.id===m.id)+1]:undefined;
  assert(nextLinks.length===(next?1:0),`Incorrect continuation for ${m.id}`);
  if(next)assert(textOf(nextLinks[0].node).length>0&&pageResult.nodes.some(n=>n.tag==='a'&&n.attrs.href==='/design-preview/gcontext-article?story='+next.id),`Incorrect next main article for ${m.id}`);
  const articleIds=new Set(pageResult.nodes.map(n=>n.attrs.id).filter(Boolean));
  for(const n of pageResult.nodes.filter(n=>n.attrs.href?.startsWith('#')))assert(articleIds.has(n.attrs.href.slice(1)),`Missing article anchor ${m.id}: ${n.attrs.href}`);
  articles.push({id:m.id,words:body.split(/\s+/).length,sha256:crypto.createHash('sha256').update(body).digest('hex')});
  const before=old.preview.split(/\s+/).length,after=m.description.split(/\s+/).length;
  previewCounts.push({id:m.id,before,after});assert(after<=35,`Preview exceeds 35 words: ${m.id}`);
}
await page('/design-preview/gcontext-article?story=missing',404);
const maat=await page('/maat');
assert(maat.nodes.filter(n=>hasClass(n,'work-card')).length===5,'MAAT card count changed');
assert(!maat.nodes.some(n=>n.attrs.href?.includes('/design-preview/gcontext')),'gcontext draft links appeared on MAAT');
assert(!maat.nodes.some(n=>hasClass(n,'story-branches')||hasClass(n,'story-example')),'Optional narrative elements appeared on MAAT');
for(const filename of ['gcontext-journey.astro','gcontext-article.astro']){
  const text=fs.readFileSync(path.join(root,'src/pages/design-preview',filename),'utf8');
  assert(/if \(import\.meta\.env\.PROD\) return new Response\(null, \{status:404\}\)/.test(text),`Missing production guard in ${filename}`);
}
const journeyRoute=fs.readFileSync(path.join(root,'src/pages/design-preview/gcontext-journey.astro'),'utf8');
assert(journeyRoute.includes("import StoryLayout from '~/layouts/StoryLayout.astro'"),'Preview must use the shared StoryLayout');
const result={checkedAt:new Date().toISOString(),passed:failures.length===0,typecheck,journeyCards:cards.length,articles,previewCounts,routes,
  productionGuard:'Checked in route source. No production server was started.',
  browser:'Not run. Not authorized.',
  limits:'HTTP checks confirm rendered content and links. They do not verify browser layout, scrolling, or animation.',failures};
fs.writeFileSync(path.join(here,'journey-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:result.passed,cards:cards.length,articles:articles.length,typecheck,failures},null,2));
if(failures.length)process.exitCode=1;
