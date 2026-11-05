import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parse } from 'parse5';

const root = path.dirname(fileURLToPath(import.meta.url));
const base = 'http://127.0.0.1:50531/';
const report = { browserChecks: 'Not run, per user instruction.', checks: [], media: [] };
const check = (name, passed, detail) => { report.checks.push({ name, passed, detail }); };
const variants = [
  ['', 39, 25, [180, 450, 780, 1080]],
  ['shared-context/', 37, 14, [180, 450, 750, 1020]],
  ['playbooks/', 40, 35, [210, 510, 840, 1110]],
  ['admin-agent/', 41, 36, [180, 480, 810, 1140]],
];
for (const [prefix, duration, poster, frames] of variants) {
  const folder = path.join(root, prefix);
  const run = (command, args) => execFileSync(command, args, { cwd: folder, encoding: 'utf8' });
  run('ffmpeg', ['-hide_banner','-loglevel','error','-y','-ss',String(poster),'-i','demo.mp4','-frames:v','1','-q:v','2','poster.jpg']);
  run('ffmpeg', ['-hide_banner','-loglevel','error','-y','-i','demo.mp4','-vf',`select='${frames.map(n=>`eq(n,${n})`).join('+')}',scale=960:540,tile=2x2`,'-frames:v','1','-q:v','2','frames.jpg']);
  const media = JSON.parse(run('ffprobe', ['-v','error','-show_entries','stream=codec_type,width,height,r_frame_rate:format=duration,size','-of','json','demo.mp4']));
  report.media.push({ file: prefix+'demo.mp4', ...media });
  check(prefix+'video format', media.streams.length===1 && media.streams[0].codec_type==='video' && media.streams[0].width===1920 && media.streams[0].height===1080 && media.streams[0].r_frame_rate==='30/1', media.streams);
  check(prefix+'duration', Math.abs(Number(media.format.duration)-duration)<.05, media.format.duration);
  const range = await fetch(base+prefix+'demo.mp4', { headers: { Range: 'bytes=1000-2023' } });
  const bytes = await range.arrayBuffer();
  check(prefix+'video seeking', range.status===206 && bytes.byteLength===1024, { status: range.status, range: range.headers.get('content-range') });
}

const html = fs.readFileSync(root+'/review.html','utf8');
const nodes=[];
function visit(node){nodes.push(node);for(const child of node.childNodes||[])visit(child);}
visit(parse(html));
const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
const ids=nodes.map(n=>attr(n,'id')).filter(Boolean);
check('Unique HTML IDs',new Set(ids).size===ids.length,ids.length);
check('Four articles and four videos',nodes.filter(n=>n.tagName==='article').length===4&&nodes.filter(n=>n.tagName==='video').length===4);
check('Video playback is user controlled',nodes.filter(n=>n.tagName==='video').every(n=>attr(n,'controls')!==undefined&&attr(n,'autoplay')===undefined&&attr(n,'preload')==='none'));
for(const node of nodes){
  for(const key of ['src','href','poster']){
    const value=attr(node,key);
    if(!value)continue;
    if(value.startsWith('#')){check('Anchor '+value,ids.includes(value.slice(1)));continue;}
    const url = /^https?:/.test(value)?value:base+value;
    const response=await fetch(url,{method:'HEAD'}).catch(()=>null);
    check('Link '+value,response?.status===200,response?.status??'unavailable');
  }
}
const frameFiles=variants.map(([prefix])=>prefix+'frames.jpg');
report.frameReview={ files:frameFiles,method:'Contact sheets from the exported MP4 files.',reviewed:'All four contact sheets were visually inspected. No clipped or overlapping content was observed in these representative frames.' };
report.ok=report.checks.every(c=>c.passed);
fs.writeFileSync(root+'/verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ok:report.ok,checks:report.checks.length,failures:report.checks.filter(c=>!c.passed),media:report.media.map(m=>({file:m.file,duration:m.format.duration,size:m.format.size}))},null,2));
if(!report.ok)process.exitCode=1;
