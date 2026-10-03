const $=selector=>document.querySelector(selector);
const media=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=media.matches;
let selected='context';
let progress=0;
let playing=false;
let raf=0;
let started=0;
let origin=0;
const duration=6000;
const posts={
 context:{meta:'01 / AI context / An idea',title:'A new chat.<br>Not a<br><em>blank slate.</em>',description:'Your agent forgets the setup. You explain it again. What if the useful context stayed?',read:'Read the idea',time:'5 min read',notes:['setup.md','decisions.md','last-task.md'],folder:'context/',sub:'KNOWLEDGE THAT STAYS',resultLabel:'NEXT CHAT',result:'“I know your setup.”',before:'all in your head.',after:'the conversation ends. the knowledge stays.',captions:['01 / Useful knowledge, scattered.','02 / Give that knowledge a home.','03 / Start the next chat with context.'],alt:'Useful context moves from scattered notes to the next chat.'},
 learning:{meta:'02 / Agent memory / An experiment',title:'One correction.<br>Does it<br><em>remember?</em>',description:'Fixing one answer is easy. The real test comes tomorrow, when you ask the agent again.',read:'Explore the experiment',time:'12 min read',notes:['wrong term','your correction','preferred term'],folder:'memory/',sub:'A CORRECTION TO REUSE',resultLabel:'NEXT SESSION',result:'“The corrected term.”',before:'a mistake, then a fix.',after:'a new session. the correction comes with it.',captions:['01 / A mistake. Your correction.','02 / Save the preferred term.','03 / Check the next session.'],alt:'A correction becomes saved memory and reaches the next session.'}
};
const clamp=(x,min=0,max=1)=>Math.max(min,Math.min(max,x));
const mix=(a,b,t)=>a+(b-a)*t;
// Closed-form damped spring. Each scene is a pure function of timeline position.
function spring(time,start,speed=15){const t=Math.max(0,time-start)*speed;return t===0?0:1-Math.exp(-.72*t)*(Math.cos(1.7*t)+(.72/1.7)*Math.sin(1.7*t));}
function smooth(time,start,end){const x=clamp((time-start)/(end-start));return x*x*(3-2*x);}
function transform(id,x,y,rotation=0,scale=1){$(id).setAttribute('transform',`translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${rotation.toFixed(3)}) scale(${scale.toFixed(4)})`);}
// renderAt(t) also supports a reproducible, paused frame for design review.
function renderAt(t){
 progress=clamp(t);
 const p=posts[selected];
 const gather=spring(progress,.16,14);
 const complete=smooth(progress,.43,.59);
 const deliver=spring(progress,.64,15);
 const emergence=smooth(progress,.58,.74);
 const positions=[[112,108,-14],[338,87,12],[368,235,-9]];
 positions.forEach(([x,y,angle],i)=>{
   const s=spring(progress,.13+i*.043,15);
   transform('#note'+i,mix(x,251+i*8,s),mix(y,177+i*6,s),mix(angle,-3+i*3,s),mix(1,.74,s));
   $('#note'+i).style.opacity=String(1-smooth(progress,.37+i*.023,.53+i*.023));
 });
 transform('#folder',234,170+28*(1-gather),0,.87+.13*gather);
 $('#folder').style.opacity=String(smooth(progress,.21,.42));
 transform('#seal',421,197-23*(1-gather),-10*(1-gather),Math.max(.001,complete));
 $('#seal').style.opacity=String(complete);
 $('#route').style.strokeDashoffset=String(1-smooth(progress,.59,.81));
 $('#route').style.opacity=String(emergence);
 transform('#result',mix(435,428,deliver),mix(310,278,deliver),mix(9,-3,deliver),.88+.12*deliver);
 $('#result').style.opacity=String(emergence);
 $('#before').style.opacity=String(1-smooth(progress,.16,.37));
 $('#after').style.opacity=String(smooth(progress,.72,.9));
 $('#orbit').style.opacity=String(mix(.9,.3,smooth(progress,.2,.7)));
 const phase=progress<.28?0:progress<.72?1:2;
 $('#caption').textContent=p.captions[phase];
 $('#phase').textContent=['THE PROBLEM','WHAT CHANGES','THE RESULT'][phase];
 $('#timeline').value=String(Math.round(progress*1000));
 $('#time').textContent=(progress*6).toFixed(1)+' / 6s';
 document.querySelectorAll('[data-time]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===phase)));
}
window.seek=t=>{pause();renderAt(t)};
function syncPlay(){const b=$('#play');b.textContent=reduced?'Static':playing?'Pause Ⅱ':progress>=1?'Replay ↺':'Play ▷';b.setAttribute('aria-label',reduced?'Animation disabled':playing?'Pause animation':progress>=1?'Replay animation':'Play animation');}
function pause(){playing=false;cancelAnimationFrame(raf);syncPlay();}
function frame(now){if(!playing)return;renderAt(origin+(now-started)/duration);if(progress>=1){pause();return}raf=requestAnimationFrame(frame)}
function play(){if(reduced)return;cancelAnimationFrame(raf);if(progress>=1)renderAt(0);origin=progress;started=performance.now();playing=true;syncPlay();raf=requestAnimationFrame(frame)}
function motionMode(value){reduced=value;document.body.classList.toggle('static',reduced);$('#motion-toggle').textContent=reduced?'Enable motion':'Reduce motion';$('#motion-toggle').setAttribute('aria-pressed',String(reduced));$('#play').disabled=reduced;$('#timeline').disabled=reduced;document.querySelectorAll('[data-time]').forEach(b=>b.disabled=reduced);pause();if(reduced)renderAt(1);syncPlay();}
function choose(id){
 pause();selected=id;const p=posts[id];
 $('#post-meta').textContent=p.meta;$('#post-title').innerHTML=p.title;$('#description').textContent=p.description;
 $('#read').innerHTML=p.read+' <span class="arrow" aria-hidden="true">↗</span>';$('#read').href='ideas.html#'+id;$('#reading-time').textContent=p.time;
 document.querySelectorAll('.note-label').forEach((node,i)=>node.textContent=p.notes[i]);
 $('#folder-label').textContent=p.folder;$('#folder-sub').textContent=p.sub;$('#result-label').textContent=p.resultLabel;$('#result-line').textContent=p.result;$('#before-label').textContent=p.before;$('#after-label').textContent=p.after;$('#scene-title').textContent=p.alt;$('#scene-desc').textContent=p.alt+' Use the controls below to pause or inspect the three stages.';
 document.querySelectorAll('[data-post]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.post===id)));
 renderAt(reduced?1:0);if(!reduced)play();
}
document.querySelectorAll('[data-post]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.post)));
document.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>{pause();renderAt(Number(b.dataset.time));syncPlay()}));
$('#timeline').addEventListener('input',e=>{pause();renderAt(Number(e.target.value)/1000);syncPlay()});
$('#play').addEventListener('click',()=>playing?pause():play());
$('#motion-toggle').addEventListener('click',()=>{motionMode(!reduced);if(!reduced){renderAt(0);play()}});
media.addEventListener('change',e=>motionMode(e.matches));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
$('#notes').addEventListener('click',e=>{e.preventDefault();pause();$('#dialog').showModal()});
$('#close').addEventListener('click',()=>$('#dialog').close());
motionMode(reduced);choose('context');
