const media=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=media.matches;
let queued=false;
const $=s=>document.querySelector(s);
const clamp=x=>Math.min(1,Math.max(0,x));
const mix=(a,b,t)=>a+(b-a)*t;
function smooth(t,a,b){const x=clamp((t-a)/(b-a));return x*x*(3-2*x)}
function spring(t,a,speed=16){const x=Math.max(0,t-a)*speed;return x?1-Math.exp(-.78*x)*(Math.cos(1.65*x)+(.78/1.65)*Math.sin(1.65*x)):0}
function move(id,x,y,r=0,s=1){$(id).setAttribute('transform',`translate(${x} ${y}) rotate(${r}) scale(${s})`)}
function opacity(id,n){$(id).style.opacity=String(clamp(n))}
function contextFrame(t){
 const collect=spring(t,.1,16);
 [[112,108,-14],[338,87,12],[368,235,-9]].forEach(([x,y,r],i)=>{const s=spring(t,.10+i*.04,17);move('#c-note'+i,mix(x,251+i*8,s),mix(y,177+i*6,s),mix(r,-3+i*3,s),mix(1,.74,s));opacity('#c-note'+i,1-smooth(t,.36+i*.02,.53+i*.02))});
 move('#c-folder',234,170+28*(1-collect),0,.87+.13*collect);opacity('#c-folder',smooth(t,.18,.39));
 const complete=smooth(t,.43,.59);move('#c-seal',421,197-23*(1-collect),-10*(1-collect),Math.max(.001,complete));opacity('#c-seal',complete);
 $('#c-route').style.strokeDashoffset=String(1-smooth(t,.55,.8));opacity('#c-route',smooth(t,.53,.68));
 const delivery=spring(t,.60,16);move('#c-result',mix(435,428,delivery),mix(310,278,delivery),mix(9,-3,delivery),.88+.12*delivery);opacity('#c-result',smooth(t,.58,.72));
 opacity('#c-before',1-smooth(t,.14,.32));opacity('#c-after',smooth(t,.74,.91));opacity('#c-orbit',mix(.9,.3,smooth(t,.2,.7)));
 const phase=t<.27?0:t<.72?1:2;
 $('#context-caption').textContent=['Useful knowledge starts in scattered notes.','Save the context where your agent can find it.','The next chat starts with the knowledge you saved.'][phase];$('#context-phase').textContent='0'+(phase+1);$('#context-progress').style.transform=`scaleX(${t})`;
}
function learningFrame(t){
 $('#l-strike').style.strokeDashoffset=String(1-smooth(t,.04,.2));
 const correct=spring(t,.10,18);move('#l-correction',0,10*(1-correct));opacity('#l-correction',smooth(t,.1,.23));
 opacity('#l-memory',smooth(t,.30,.50));
 const next=spring(t,.55,15);move('#l-next',145,255+30*(1-next),2*(1-next));opacity('#l-next',smooth(t,.52,.70));
 opacity('#l-check',smooth(t,.76,.89));opacity('#l-conclusion',smooth(t,.82,.96));
 const phase=t<.27?0:t<.72?1:2;
 $('#learning-caption').textContent=['The first answer uses the wrong term.','Your correction becomes a saved preference.','The next session uses the term you chose.'][phase];$('#learning-phase').textContent='0'+(phase+1);$('#learning-progress').style.transform=`scaleX(${t})`;
}
const sections=[...document.querySelectorAll('.chapter')];
function update(){
 queued=false;
 const anchor=innerWidth<=850?145:100;
 let active=0;
 sections.forEach((section,i)=>{
  const rect=section.getBoundingClientRect();
  const content=section.querySelector('.chapter-content');
  // If the screen is too short, use normal flow instead of a clipped sticky section.
  const fits=content.offsetHeight+anchor+15<=innerHeight;
  section.classList.toggle('free-flow',!fits);
  const travel=Math.max(1,section.offsetHeight-content.offsetHeight);
  const t=reduced?1:fits?clamp((anchor+innerHeight*.08-rect.top)/travel):clamp((innerHeight*.75-rect.top)/(innerHeight*.65));
  if(i===0)contextFrame(t);else learningFrame(t);
  if(rect.top<=innerHeight*.45)active=i;
 });
 document.querySelectorAll('[data-chapter]').forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 $('#current').textContent='0'+(active+1);
 const end=sections.at(-1).offsetTop+sections.at(-1).offsetHeight-innerHeight;
 $('#page-progress').style.transform=`scaleX(${clamp(scrollY/Math.max(1,end))})`;
}
function requestUpdate(){if(!queued){queued=true;requestAnimationFrame(update)}}
function setMotion(value){reduced=value;document.body.classList.toggle('reduce',reduced);$('#motion').textContent=reduced?'Enable motion':'Reduce motion';$('#motion').setAttribute('aria-pressed',String(reduced));requestUpdate()}
$('#motion').addEventListener('click',()=>setMotion(!reduced));
media.addEventListener('change',e=>setMotion(e.matches));
window.addEventListener('scroll',requestUpdate,{passive:true});
window.addEventListener('resize',requestUpdate,{passive:true});
window.addEventListener('pageshow',requestUpdate);
setMotion(reduced);update();
