import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {withReadingZone} from './information-reading-zone.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));const require=createRequire(root+'/package.json');const {build}=require('esbuild');
const old=fs.readFileSync(root+'/design-preview/work-flight.html','utf8');
const fonts=old.match(/@font-face\{[^}]+\}/g).join('\n');const portrait=JSON.parse(old.match(/const assets=(\{[^\n]+\});/)[1]).portrait;
let renderer=fs.readFileSync(root+'/src/components/flight/flight.js','utf8');
const start=renderer.indexOf('  function drawCard('),end=renderer.indexOf('  list.forEach',start);
renderer=renderer.slice(0,start)+'  function drawCard(p,x,y) { a.drawImage(p.art,x,y,SLOT,SLOT); }\n'+renderer.slice(end);
renderer=renderer.replace('const SLOT = 384','const SLOT = 1000').replace('MAXD = 1380, STEER = 0.5','MAXD = 550, STEER = 0.16').replace('LANE_STEP = 46','LANE_STEP = 120').replace('ACOLS = 8','ACOLS = 4').replace('smooth(dist, 0, 220)','smooth(dist, 0, 90)');
renderer=renderer.replace("box.querySelector('[data-box-label]').textContent = p.label;", "box.querySelector('[data-box-art]').src = p.art.toDataURL(); box.querySelector('[data-box-art]').alt = p.title; box.querySelector('[data-box-label]').textContent = p.label;");


// Wheel and touch movement use the original continuous flight, without snap points.
// A small distance-based opacity change makes approaching panels clearer.
renderer=renderer.replace('gl_FragColor = vec4(c * a, a);', 'if (vKind > 0.5) a *= mix(1.0, 0.78 + 0.22*vNear, 1.0-uShift);\n        gl_FragColor = vec4(c * a, a);');
renderer=renderer.replace('  let ty0 = null;', `
  const lane=cells.filter(c=>c.kind===2).sort((a,b)=>a.d-b.d);
  const stops=[0,...lane.map(c=>c.d*0.90)];
  const nearestPanel=()=>lane.reduce((a,b)=>Math.abs(a.d*.90-dist)<Math.abs(b.d*.90-dist)?a:b);
  root.addEventListener('flight-step',e=>{
    closeBox();
    tDist=e.detail>0?(stops.find(s=>s>tDist+2)??stops.at(-1)):([...stops].reverse().find(s=>s<tDist-2)??0);
    tLat.x=0;tLat.y=0;
  });
  root.addEventListener('flight-open',()=>{if(dist>8)openBox(nearestPanel().i)});
  let ty0 = null;
`);
renderer=renderer.replace('if (open >= 0) closeBox();                           // a deliberate scroll closes the box and carries on', 'if (open >= 0) return;');
renderer=renderer.replace('  let ty0 = null;', `  root.addEventListener('flight-visuals',e=>{
    closeBox();
    list.forEach((p,i)=>{p.art=e.detail[i];drawCard(p,(i%ACOLS)*SLOT,Math.floor(i/ACOLS)*SLOT)});
    tex.needsUpdate=true;
  });
  let ty0 = null;`);
renderer=renderer.replace('    setFlying(dist > 6);', `
    setFlying(dist > 6);
    root.querySelector('#prev').disabled=dist<1;
    root.querySelector('#next').disabled=tDist>=stops.at(-1)-1;
    root.querySelector('#inspect').disabled=dist<=8;
    const hint=dist>6?'Scroll at your own pace.':'Scroll into the face.';
    if(chipsEl.textContent!==hint)chipsEl.textContent=hint;
`);
renderer=withReadingZone(renderer);
const code=`import * as THREE from 'three';
import {drawInformationPanel} from './design-preview/information-visuals-art.mjs';\n${renderer}\n
const pieces=[
{label:'The question',title:'Beyond the question',detail:'A question carries only part of what you know. I focus on the intent, history, and decisions that help an agent understand the work.'},
{label:'The approach',title:'Useful context',detail:'I organise information so an agent can find what the task needs. The aim is useful context, without loading everything into every conversation.'},
{label:'Across sessions',title:'Knowledge that lasts',detail:'A session can end without losing what the work taught us. I explore how reviewed decisions remain available to the next task and agent.'},
{label:'gcontext',title:'Keeping it current',detail:'Information changes as the work changes. With gcontext, I research how agents find, review, and update knowledge so it stays useful across sessions.'}
];
let variant='objects';
const variants=['people','objects','shapes'];
const artwork=Object.fromEntries(variants.map(v=>[v,[]]));
async function init(){await Promise.all([document.fonts.load('400 66px Geist'),document.fonts.load('italic 90px Instrument')]);variants.forEach(v=>{artwork[v]=pieces.map((p,i)=>drawInformationPanel(p,i,v))});pieces.forEach((p,i)=>{p.art=artwork[variant][i];p.size=1.2});const root=document.querySelector('[data-root]'),stage=document.querySelector('[data-stage]');
const photo=new Image();photo.src=${JSON.stringify(portrait)};await photo.decode();
startFlight(THREE,{root,stage,photo,content:{pieces:{knowledge:pieces},story:pieces.map((_,i)=>'knowledge:'+i),regions:[],skin:'knowledge',laneOnly:true}});
const fire=n=>root.dispatchEvent(new CustomEvent('flight-step',{detail:n}));document.querySelector('#next').onclick=()=>fire(1);document.querySelector('#prev').onclick=()=>fire(-1);document.querySelector('#inspect').onclick=()=>root.dispatchEvent(new CustomEvent('flight-open'));
const gallery=document.querySelector('#reading');document.querySelector('#read').onclick=()=>{gallery.showModal()};document.querySelector('#close-reading').onclick=()=>gallery.close();
function refreshGallery(){
  const host=document.querySelector('#reading-content');host.replaceChildren();
  pieces.forEach((p,i)=>{
    const row=document.createElement('article');row.className='comparison';
    const h=document.createElement('h2');h.textContent=p.title;row.append(h);
    const grid=document.createElement('div');grid.className='comparison-grid';
    variants.forEach(v=>{const f=document.createElement('figure');const image=new Image();image.src=artwork[v][i].toDataURL();image.alt=p.title+' ('+v+' version)';const caption=document.createElement('figcaption');caption.textContent={people:'A / People',objects:'B / Objects',shapes:'C / Shapes'}[v];f.append(caption,image);grid.append(f)});
    row.append(grid);host.append(row);
  });
}
refreshGallery();
document.querySelectorAll('[data-variant]').forEach(button=>button.addEventListener('click',()=>{
  variant=button.dataset.variant;
  document.querySelectorAll('[data-variant]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  root.dispatchEvent(new CustomEvent('flight-visuals',{detail:artwork[variant]}));
  document.querySelector('#variant-status').textContent={people:'A / People',objects:'B / Objects',shapes:'C / Shapes'}[variant];
}));
if(matchMedia('(prefers-reduced-motion: reduce)').matches)gallery.showModal();
}
init().catch(e=>{document.querySelector('#failure').hidden=false;console.error(e)});
`;
const result=await build({stdin:{contents:code,resolveDir:root,sourcefile:'information-flight.js',loader:'js'},bundle:true,write:false,minify:true,format:'iife',target:'es2022',legalComments:'none'});
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inside the information, portrait flight</title><style>
${fonts}
*{box-sizing:border-box}body{margin:0;background:#fafbfa;color:#232b26;font:15px Geist,Arial,sans-serif;overflow:hidden}button{font:inherit;cursor:pointer;color:inherit}button:focus-visible{outline:3px solid #61816b;outline-offset:4px}button{background:#fafbfa;border:1px solid #d4dcd5;border-radius:30px;padding:10px 17px}button:hover{border-color:#627b69}button:disabled{opacity:.35;cursor:default}header{position:absolute;top:26px;left:4vw;right:4vw;display:flex;justify-content:space-between;align-items:start;z-index:5;pointer-events:none}header button{pointer-events:auto;font-size:12px}.name{font:italic clamp(45px,6vw,95px)/.9 Instrument,Georgia,serif;margin:0;transition:opacity .3s}.name span{display:block}.tagline{font-size:13px;color:#7a837c;max-width:200px;line-height:1.6;margin-top:20px}.hero{height:100svh;position:relative;overflow:hidden}.figure{position:absolute;inset:0}.face{position:absolute;inset:0;width:100%!important;height:100%!important;touch-action:pan-y}.in .name,.in .tagline{opacity:0;pointer-events:none}.ask-dock{position:absolute;bottom:25px;left:50%;transform:translateX(-50%);width:min(690px,92vw);z-index:7}.ask-chips{text-align:center;margin-bottom:15px;font-size:12px;color:#7a837c;min-height:18px}.controls{display:flex;gap:8px;justify-content:center;align-items:center;background:#fafbfaf0;border:1px solid #dce1dc;border-radius:40px;padding:8px}.controls button{border:0;background:transparent;font-size:12px;white-space:nowrap}.controls #next{background:#263c2d;color:white}.controls #inspect{border:1px solid #d4dcd5}.back{position:absolute;left:4vw;top:30px;z-index:6;font-size:12px}.back[hidden]{display:none}.note{position:absolute;left:4vw;bottom:28px;color:#98a099;font-size:10px;max-width:140px;line-height:1.5;pointer-events:none}.box{position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:min(940px,94vw);max-height:88svh;overflow:auto;background:white;border:1px solid #d8dfd9;border-radius:20px;z-index:12;display:grid;grid-template-columns:1.3fr 1fr;padding:25px;gap:25px;box-shadow:0 20px 90px #20302818}.box[hidden]{display:none}.box img{width:100%;height:auto}.box-content{align-self:center;padding:30px 10px}.box h2{font-size:29px;font-weight:500;line-height:1.1;letter-spacing:-1px}.box p{line-height:1.7;color:#7a837c;font-size:14px}.box .label{color:#50735c;font-size:12px}.close{position:absolute;right:14px;top:14px;width:34px;height:34px;padding:0;border:0;font-size:22px}.box a[hidden]{display:none}dialog{width:min(1000px,94vw);max-height:90svh;border:1px solid #d8dfd9;border-radius:20px;padding:35px;color:inherit;background:#fafbfa}dialog::backdrop{background:#eef2eedb;backdrop-filter:blur(8px)}dialog h1{font:italic 48px Instrument,Georgia,serif;margin:10px 0 30px}#reading-content{display:grid;grid-template-columns:1fr 1fr;gap:30px}#reading-content article{border-top:1px solid #d8dfd9;padding-top:20px}#reading-content h2{font-size:22px;font-weight:500}#reading-content img{width:100%}#reading-content p{font-size:14px;line-height:1.7;color:#7a837c}#failure{position:absolute;left:10%;top:40%;width:80%;background:white;padding:20px;z-index:30}
@media(max-width:800px){header{top:20px}.name{font-size:53px}.tagline{font-size:11px;max-width:150px}.note{display:none}.ask-dock{bottom:18px}.controls{gap:0;padding:5px}.controls button{padding:10px;font-size:10px}.ask-chips{font-size:10px}.box{grid-template-columns:1fr;gap:0;padding:18px}.box img{max-height:42svh;object-fit:contain}.box-content{padding:0 10px}.box h2{font-size:23px}.box p{font-size:12px}.back{top:20px;font-size:10px}#reading-content{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}

.version-tools{display:flex;align-items:center;gap:10px;pointer-events:auto}.version-switch{display:flex;gap:2px;border:1px solid #d4dcd5;padding:4px;border-radius:30px;background:#fafbfa}.version-switch button{border:0;background:transparent;padding:8px 11px}.version-switch button[aria-pressed=true]{background:#263c2d;color:white}#reading{width:min(1350px,96vw)}#reading-content{display:block}.comparison{margin-bottom:38px}.comparison-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.comparison-grid figure{margin:0}.comparison-grid figcaption{font-size:13px;color:#7a837c;margin:5px 0 14px}.comparison-grid img{border:1px solid #dce1dc}.comparison h2{margin:10px 0 24px}@media(max-width:800px){.version-tools{gap:5px}.version-switch button{padding:7px 9px;font-size:11px}.version-switch button span{display:none}.version-tools #read{padding:9px 10px;font-size:10px}.name{font-size:44px}.comparison-grid{grid-template-columns:1fr}#reading{padding:22px}.comparison-grid figcaption{margin-top:20px}}
</style></head><body><main class="hero" data-root data-stage data-state="landing"><header><div><h1 class="name"><span>Bernat</span><span>Sampera</span></h1></div><div class="version-tools"><nav class="version-switch" aria-label="Visual version"><button data-variant="people" aria-pressed="false" aria-label="Version A, People">A<span> People</span></button><button data-variant="objects" aria-pressed="true" aria-label="Version B, Objects">B<span> Objects</span></button><button data-variant="shapes" aria-pressed="false" aria-label="Version C, Shapes">C<span> Shapes</span></button></nav><button id="read">Compare all</button></div></header><button class="back" data-back hidden>Back to the face</button><div class="figure" data-flight-figure role="img" aria-label="Bernat's portrait contains four information panels. Scroll or use Next to fly into it."></div>
<section class="box" data-box hidden role="dialog" aria-modal="true" aria-labelledby="box-title"><button class="close" data-box-close aria-label="Close detail">×</button><img data-box-art alt=""><div class="box-content"><p class="label" data-box-label></p><h2 id="box-title" data-box-title></h2><p data-box-body></p><a data-box-cta hidden></a><button data-box-close>Back to the flight</button></div></section>
<div class="ask-dock"><div class="ask-chips">Scroll into the face.</div><div class="controls"><button id="prev" disabled>Previous</button><button id="inspect" disabled>Take a closer look</button><button id="next">Next</button></div></div><p class="note"><span id="variant-status" role="status">B / Objects</span><br>Local concept preview.</p><p id="failure" hidden>The 3D preview could not start. WebGL must be available.</p></main>
<dialog id="reading" aria-labelledby="reading-title"><button class="close" id="close-reading" aria-label="Close reading view">×</button><h1 id="reading-title">Three wordless visual directions.</h1><div id="reading-content"></div></dialog>
<script>${result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
fs.writeFileSync(root+'/design-preview/information-visuals.html',html);
console.log('Built standalone information-visuals.html with the site portrait renderer, four panels in three visual versions, and embedded assets.');
