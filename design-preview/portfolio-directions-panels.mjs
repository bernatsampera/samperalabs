export const directions=['editorial','poster','split'];
export const directionNames={editorial:'A / Editorial',poster:'B / Poster',split:'C / Split'};
export function directionCards(variant){
 const intro={intro:true,label:'',title:'The biggest bottleneck in AI',detail:'Structuring and maintaining information that agents can find and understand.'};
 const copy={
 editorial:[['AI needs context','The agent needs the intent, history and decisions you already have.'],['Context needs structure','Information should be easy to find and ready to use.'],['Prune and maintain','Keep what matters. Update what changes. Remove what no longer helps.']],
 poster:[['More than a question','Give the agent the context behind the task.'],['Give context structure','Help the agent find what it needs.'],['Keep information useful','Review it. Update it. Prune it.']],
 split:[['What is missing?','The information you already have.'],['Can it find it?','Structure context around the work the agent needs to do.'],['Is it still useful?','Decide what stays, what changes and what goes.']]
 };
 return [intro,...copy[variant].map(([title,detail],i)=>({label:'',title,detail,image:['context','structure','maintaining'][i]}))];
}
export function drawDirectionPanel(p,images,variant){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1200;const c=canvas.getContext('2d');
 const ink='#252926',muted='#626961';
 // Extend the picture's own edge pixels behind the layout. There is no inset image background.
 function backdrop(image,x,y,w,h){
  const sw=image.naturalWidth,sh=image.naturalHeight;
  const rect=(sx,sy,ww,hh,dx,dy,dw,dh)=>{if(dw>0&&dh>0)c.drawImage(image,sx,sy,ww,hh,dx,dy,dw,dh)};
  rect(0,0,1,1,0,0,x,y);rect(sw-1,0,1,1,x+w,0,1200-x-w,y);
  rect(0,sh-1,1,1,0,y+h,x,1200-y-h);rect(sw-1,sh-1,1,1,x+w,y+h,1200-x-w,1200-y-h);
  rect(0,0,sw,1,x,0,w,y);rect(0,sh-1,sw,1,x,y+h,w,1200-y-h);
  rect(0,0,1,sh,0,y,x,h);rect(sw-1,0,1,sh,x+w,y,1200-x-w,h);
  c.drawImage(image,x,y,w,h);
 }
 function lines(s,x,y,width,size,leading,color=ink,family='Geist'){
  c.font='400 '+size+'px '+family;c.fillStyle=color;let line='';
  for(const word of s.split(' ')){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>width){c.fillText(line,x,y);line=word;y+=leading}else line=next}
  if(line)c.fillText(line,x,y);return y;
 }
 c.fillStyle='#f5f4ef';c.fillRect(0,0,1200,1200);
 if(p.intro){
  if(variant==='editorial'){
   lines('The biggest bottleneck in AI',80,245,1010,135,145,ink,'Georgia');
   lines(p.detail,85,835,900,44,62,muted);
  }else if(variant==='poster'){
   lines('The biggest bottleneck in AI',65,190,1070,146,151,ink);
   lines('Making information usable.',72,1020,1000,48,62,muted);
  }else{
   lines('The biggest bottleneck in AI',80,190,660,108,119,ink);
   c.fillStyle='#d5dbcf';c.fillRect(80,815,6,212);
   lines(p.detail,116,858,910,45,64,muted);
  }
  return canvas;
 }
 const image=images[p.image];
 if(variant==='editorial'){
  backdrop(image,0,400,1200,800);
  const bottom=lines(p.title,74,123,1050,91,100,ink,'Georgia');
  lines(p.detail,78,bottom+73,1000,39,54,muted);
 }else if(variant==='poster'){
  backdrop(image,0,0,1200,800);
  const bottom=lines(p.title,70,915,1060,92,96,ink);
  lines(p.detail,74,bottom+65,1050,36,48,muted);
 }else{
  backdrop(image,505,375,690,460);
  const bottom=lines(p.title,64,300,435,88,99,ink);
  lines(p.detail,68,bottom+86,380,39,56,muted);
 }
 return canvas;
}
