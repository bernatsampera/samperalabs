import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {withReadingZone} from './information-reading-zone.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));const require=createRequire(root+'/package.json');const {build}=require('esbuild');
const sharp=require('sharp');
const imageSources={};
for(const name of ['context','structure','maintaining']){
  const bytes=await sharp(root+'/design-preview/portfolio-fragments-assets/'+name+'.png').resize({width:1400,withoutEnlargement:true}).webp({quality:90}).toBuffer();
  imageSources[name]='data:image/webp;base64,'+bytes.toString('base64');
}
const old=fs.readFileSync(root+'/design-preview/work-flight.html','utf8');
const fonts=old.match(/@font-face\{[^}]+\}/g).join('\n');const portrait=JSON.parse(old.match(/const assets=(\{[^\n]+\});/)[1]).portrait;
let renderer=fs.readFileSync(root+'/src/components/flight/flight.js','utf8');
const start=renderer.indexOf('  function drawCard('),end=renderer.indexOf('  list.forEach',start);
renderer=renderer.slice(0,start)+'  function drawCard(p,x,y) { a.drawImage(p.art,x,y,SLOT,SLOT); }\n'+renderer.slice(end);
renderer=renderer.replace('const SLOT = 384','const SLOT = 1200').replace('MAXD = 1380, STEER = 0.5','MAXD = 550, STEER = 0.16').replace('LANE_STEP = 46','LANE_STEP = 120').replace('ACOLS = 8','ACOLS = 2').replace('smooth(dist, 0, 220)','smooth(dist, 0, 90)');
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
  let ty0 = null;
`);
renderer=renderer.replace('if (open >= 0) closeBox();                           // a deliberate scroll closes the box and carries on', 'if (open >= 0) return;');
renderer=renderer.replace('  let ty0 = null;', `  root.addEventListener('flight-visuals',e=>{
    closeBox();
    list.forEach((p,i)=>{Object.assign(p,e.detail[i]);drawCard(p,(i%ACOLS)*SLOT,Math.floor(i/ACOLS)*SLOT)});
    tex.needsUpdate=true;
  });
  let ty0 = null;`);
renderer=renderer.replace('    setFlying(dist > 6);', `
    setFlying(dist > 6);
    root.querySelector('#prev').disabled=dist<1;
    root.querySelector('#next').disabled=tDist>=stops.at(-1)-1;
    const hint=dist>6?'Scroll at your own pace.':'Scroll into the face.';
    if(chipsEl.textContent!==hint)chipsEl.textContent=hint;
`);
renderer=withReadingZone(renderer);
// Fade the portrait field continuously while the foreground is readable.
renderer=renderer.replace('1.0-0.72*uQuiet','1.0-0.995*uQuiet').replace('1.0-0.6*uQuiet','1.0-0.9*uQuiet');
// Keep dots intact at the portrait, then reveal only the alpha of each fragment.
renderer=renderer.replace('uDim: { value: 1 }','uDim: { value: 1 }, uCutout: { value: 0 }');
renderer=renderer.replace('uniform sampler2D uMap;', 'uniform float uCutout; uniform sampler2D uMap;');
renderer=renderer.replace('vec3 c = texture2D(uMap, vUv, vBias).rgb;', 'vec4 sampleColor = texture2D(uMap, vUv, vBias);\n        vec3 c = sampleColor.rgb;');
renderer=renderer.replace('if (vHover > 0.5 && edge < 0.012) c = vec3(0.078, 0.078, 0.102);','');
renderer=renderer.replace('gl_FragColor = vec4(c * a, a);', 'if (vKind > 0.5) a *= mix(1.0, sampleColor.a, uCutout);\n        gl_FragColor = vec4(c * a, a);');
renderer=renderer.replace('    uniforms.uShift.value =', '    uniforms.uCutout.value=smooth(dist,0,85);\n    uniforms.uShift.value =');
renderer=renderer.replace('a.drawImage(p.art,x,y,SLOT,SLOT);','a.clearRect(x,y,SLOT,SLOT); a.drawImage(p.art,x,y,SLOT,SLOT);');
// Show only the piece inside its reading window. Keep the portrait intact at entry.
renderer=renderer.replaceAll('varying float vHover;', 'varying float vHover; varying float vRead;');
renderer=renderer.replace('vFade = mix(vFade, 1.0, aRead);', 'vRead = aRead; vFade = mix(vFade, 1.0, aRead);');
renderer=renderer.replace('sampleColor.a, uCutout)', 'sampleColor.a * smoothstep(0.5, 0.9, vRead), uCutout)');
renderer=renderer.replace('const c = cells[i]; if (!c.kind) continue;', 'const c = cells[i]; if (!c.kind) continue; if (dist >= 85 && readingWeights[c.i] <= 0.5) continue;');

// The pieces are read through scrolling. Remove pointer actions from the canvas.
const pointerStart=renderer.indexOf('  let hoverCard = -1;');
const pointerEnd=renderer.indexOf('  // Esc and',pointerStart);
if(pointerStart<0||pointerEnd<0)throw new Error('Missing pointer input anchors');
renderer=renderer.slice(0,pointerStart)+renderer.slice(pointerEnd);

const code=`import * as THREE from 'three';
import {directions,directionNames,portfolioCards,drawPortfolioPanel} from './design-preview/portfolio-focus-panels.mjs';\n${renderer}\n
let variant='signal';const pieces=portfolioCards(variant);const artwork={};
const imageSources=${JSON.stringify(imageSources)};
async function init(){
  await Promise.all([document.fonts.load('400 104px Geist'),document.fonts.load('700 104px Geist'),document.fonts.load('650 104px Geist'),document.fonts.load('italic 90px Instrument')]);
  const images={};
  await Promise.all(Object.entries(imageSources).map(async([name,src])=>{const image=new Image();image.src=src;await image.decode();images[name]=image}));
  directions.forEach(v=>{artwork[v]=portfolioCards(v).map(p=>drawPortfolioPanel(p,images,v))});pieces.forEach((p,i)=>{p.art=artwork[variant][i];p.size=1.2});
  const root=document.querySelector('[data-root]'),stage=document.querySelector('[data-stage]');
const photo=new Image();photo.src=${JSON.stringify(portrait)};await photo.decode();
startFlight(THREE,{root,stage,photo,content:{pieces:{knowledge:pieces},story:pieces.map((_,i)=>'knowledge:'+i),regions:[],skin:'knowledge',laneOnly:true}});
const fire=n=>root.dispatchEvent(new CustomEvent('flight-step',{detail:n}));document.querySelector('#next').onclick=()=>fire(1);document.querySelector('#prev').onclick=()=>fire(-1);
const gallery=document.querySelector('#reading');document.querySelector('#read').onclick=()=>{gallery.showModal()};document.querySelector('#close-reading').onclick=()=>gallery.close();
document.querySelectorAll('[data-direction]').forEach(button=>button.onclick=()=>{
 variant=button.dataset.direction;
 document.querySelectorAll('[data-direction]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 root.dispatchEvent(new CustomEvent('flight-visuals',{detail:portfolioCards(variant).map((p,i)=>({...p,art:artwork[variant][i]}))}));
});
function refreshGallery(){
  const host=document.querySelector('#reading-content');host.replaceChildren();
  for(let i=0;i<4;i++){
 const row=document.createElement('article');row.className='comparison-grid';
 directions.forEach(v=>{const p=portfolioCards(v)[i];const figure=document.createElement('figure');const caption=document.createElement('figcaption');caption.textContent=directionNames[v];const image=new Image();image.src=artwork[v][i].toDataURL();image.alt=p.title+'. '+p.detail;figure.append(caption,image);row.append(figure)});host.append(row);
 }
}
refreshGallery();
if(matchMedia('(prefers-reduced-motion: reduce)').matches)gallery.showModal();
}
init().catch(e=>{document.querySelector('#failure').hidden=false;console.error(e)});
`;
const result=await build({stdin:{contents:code,resolveDir:root,sourcefile:'information-flight.js',loader:'js'},bundle:true,write:false,minify:true,format:'iife',target:'es2022',legalComments:'none'});
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Information: Signal, Between, Reveal</title><style>
${fonts}
*{box-sizing:border-box}body{margin:0;background:#fafbfa;color:#232b26;font:15px Geist,Arial,sans-serif;overflow:hidden}button{font:inherit;cursor:pointer;color:inherit}button:focus-visible{outline:3px solid #61816b;outline-offset:4px}button{background:#fafbfa;border:1px solid #d4dcd5;border-radius:30px;padding:10px 17px}button:hover{border-color:#627b69}button:disabled{opacity:.35;cursor:default}header{position:absolute;top:26px;left:4vw;right:4vw;display:flex;justify-content:space-between;align-items:start;z-index:5;pointer-events:none}header button{pointer-events:auto;font-size:12px}.name{font:italic clamp(45px,6vw,95px)/.9 Instrument,Georgia,serif;margin:0;transition:opacity .3s}.name span{display:block}.tagline{font-size:13px;color:#7a837c;max-width:200px;line-height:1.6;margin-top:20px}.hero{height:100svh;position:relative;overflow:hidden}.figure{position:absolute;inset:0}.face{position:absolute;inset:0;width:100%!important;height:100%!important;touch-action:pan-y}.in .name,.in .tagline{opacity:0;pointer-events:none}.ask-dock{position:absolute;bottom:25px;left:50%;transform:translateX(-50%);width:min(690px,92vw);z-index:7}.ask-chips{text-align:center;margin-bottom:15px;font-size:12px;color:#7a837c;min-height:18px}.controls{display:flex;gap:8px;justify-content:center;align-items:center;background:#fafbfaf0;border:1px solid #dce1dc;border-radius:40px;padding:8px}.controls button{border:0;background:transparent;font-size:12px;white-space:nowrap}.controls #next{background:#263c2d;color:white}.controls #inspect{border:1px solid #d4dcd5}.back{position:absolute;left:4vw;top:30px;z-index:6;font-size:12px}.back[hidden]{display:none}.note{position:absolute;left:4vw;bottom:28px;color:#98a099;font-size:10px;max-width:140px;line-height:1.5;pointer-events:none}.box{position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:min(940px,94vw);max-height:88svh;overflow:auto;background:white;border:1px solid #d8dfd9;border-radius:20px;z-index:12;display:grid;grid-template-columns:1.3fr 1fr;padding:25px;gap:25px;box-shadow:0 20px 90px #20302818}.box[hidden]{display:none}.box img{width:100%;height:auto}.box-content{align-self:center;padding:30px 10px}.box h2{font-size:29px;font-weight:500;line-height:1.1;letter-spacing:-1px}.box p{line-height:1.7;color:#7a837c;font-size:14px}.box .label{color:#50735c;font-size:12px}.close{position:absolute;right:14px;top:14px;width:34px;height:34px;padding:0;border:0;font-size:22px}.box a[hidden]{display:none}dialog{width:min(1000px,94vw);max-height:90svh;border:1px solid #d8dfd9;border-radius:20px;padding:35px;color:inherit;background:#fafbfa}dialog::backdrop{background:#eef2eedb;backdrop-filter:blur(8px)}dialog h1{font:italic 48px Instrument,Georgia,serif;margin:10px 0 30px}#reading-content{display:grid;grid-template-columns:1fr 1fr;gap:30px}#reading-content article{border-top:1px solid #d8dfd9;padding-top:20px}#reading-content h2{font-size:22px;font-weight:500}#reading-content img{width:100%}#reading-content p{font-size:14px;line-height:1.7;color:#7a837c}#failure{position:absolute;left:10%;top:40%;width:80%;background:white;padding:20px;z-index:30}
@media(max-width:800px){header{top:20px}.name{font-size:53px}.tagline{font-size:11px;max-width:150px}.note{display:none}.ask-dock{bottom:18px}.controls{gap:0;padding:5px}.controls button{padding:10px;font-size:10px}.ask-chips{font-size:10px}.box{grid-template-columns:1fr;gap:0;padding:18px}.box img{max-height:42svh;object-fit:contain}.box-content{padding:0 10px}.box h2{font-size:23px}.box p{font-size:12px}.back{top:20px;font-size:10px}#reading-content{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}

.version-tools{display:flex;align-items:center;gap:10px;pointer-events:auto}.version-switch{display:flex;gap:2px;border:1px solid #d4dcd5;padding:4px;border-radius:30px;background:#fafbfa}.version-switch button{border:0;background:transparent;padding:8px 11px}.version-switch button[aria-pressed=true]{background:#263c2d;color:white}#reading{width:min(1350px,96vw)}#reading-content{display:block}.comparison{margin-bottom:38px}.comparison-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.comparison-grid figure{margin:0}.comparison-grid figcaption{font-size:13px;color:#7a837c;margin:5px 0 14px}.comparison-grid img{border:1px solid #dce1dc}.comparison h2{margin:10px 0 24px}@media(max-width:800px){.version-tools{gap:5px}.version-switch button{padding:7px 9px;font-size:11px}.version-switch button span{display:none}.version-tools #read{padding:9px 10px;font-size:10px}.name{font-size:44px}.comparison-grid{grid-template-columns:1fr}#reading{padding:22px}.comparison-grid figcaption{margin-top:20px}}
#reading{width:min(1300px,96vw)}#reading-content{display:grid;grid-template-columns:1fr 1fr;gap:24px}#reading-content article{border:0;padding:0}#reading-content img{display:block;width:100%;height:auto;border-radius:4px}@media(max-width:800px){#reading-content{grid-template-columns:1fr}}
body,.hero,header,button,.controls{background:#fff}.note{display:none}#reading{background:#fff}#reading-content article,#reading-content img{background:transparent;border:0}.box{background:transparent;border:0;box-shadow:none;grid-template-columns:1fr;width:min(900px,94vw);padding:0;overflow:visible}.box img{height:72svh;max-height:72svh;object-fit:contain}.box-content{padding:0;text-align:center}.box-content p,.box-content h2{display:none}.close{background:#fff;right:0;top:0}@media(max-width:800px){.box img{height:auto;max-height:65svh}.box{padding:0}}
#reading-content{display:block}#reading-content .comparison-grid{margin-bottom:35px}header{background:transparent}.version-switch{background:#fff}.version-switch button[aria-pressed=true]{background:#17191b}.controls #next{background:#17191b}.comparison-grid img{border:0}@media(max-width:800px){header{left:3vw;right:3vw}.version-tools{max-width:65vw}.version-switch button{padding:7px}.name{font-size:36px}}
</style></head><body><main class="hero" data-root data-stage data-state="landing"><header><div><h1 class="name"><span>Bernat</span><span>Sampera</span></h1></div><div class="version-tools"><nav class="version-switch" aria-label="Design version"><button data-direction="signal" aria-pressed="true">A<span> Signal</span></button><button data-direction="between" aria-pressed="false">B<span> Between</span></button><button data-direction="reveal" aria-pressed="false">C<span> Reveal</span></button></nav><button id="read">Compare</button></div></header><button class="back" data-back hidden>Back to the face</button><div class="figure" data-flight-figure role="img" aria-label="Bernat's portrait contains four information pieces. Scroll or use Next to fly into it."></div>
<section class="box" data-box hidden role="dialog" aria-modal="true" aria-labelledby="box-title"><button class="close" data-box-close aria-label="Close detail">×</button><img data-box-art alt=""><div class="box-content"><p class="label" data-box-label></p><h2 id="box-title" data-box-title></h2><p data-box-body></p><a data-box-cta hidden></a><button data-box-close>Continue exploring</button></div></section>
<div class="ask-dock"><div class="ask-chips">Scroll into the face.</div><div class="controls"><button id="prev" disabled>Previous</button><button id="next">Next</button></div></div><p class="note">Local concept preview.</p><p id="failure" hidden>The 3D preview could not start. WebGL must be available.</p></main>
<dialog id="reading" aria-labelledby="reading-title"><button class="close" id="close-reading" aria-label="Close reading view">×</button><h1 id="reading-title">The biggest bottleneck in AI</h1><div id="reading-content"></div></dialog>
<script>${result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
fs.writeFileSync(root+'/design-preview/portfolio-focus.html',html);
console.log('Built standalone portfolio-focus.html with the site portrait renderer, the opening card and three illustrated cards, and embedded assets.');
