export function portfolioCards(){return [
 {intro:true,label:'',title:'The biggest bottleneck in AI',detail:'Structuring and maintaining information that agents can find and understand.'},
 {image:'context',label:'',title:'AI needs context',detail:'The agent needs the intent, history and decisions you already have.'},
 {image:'structure',label:'',title:'Context needs structure',detail:'Information should be easy to find and ready to use.'},
 {image:'maintaining',label:'',title:'Prune and maintain',detail:'Keep what matters. Update what changes. Remove what no longer helps.'}
]}
export function drawPortfolioPanel(p,images){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1200;
 const c=canvas.getContext('2d');
 // Leave the surface transparent. Only text and the cutout figure have pixels.
 function text(s,x,y,width,size,leading,color='#202326'){
  c.font='400 '+size+'px Geist';c.fillStyle=color;let line='';
  for(const word of s.split(' ')){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>width){c.fillText(line,x,y);line=word;y+=leading}else line=next}
  if(line)c.fillText(line,x,y);return y;
 }
 if(p.intro){
  text('The biggest',40,270,1120,126,136);
  text('bottleneck in AI',40,410,1120,126,136);
  text(p.detail,48,650,980,49,70,'#5b6268');
 }else{
  const end=text(p.title,40,185,1030,105,113);
  text(p.detail,48,end+85,990,44,62,'#5b6268');
  const image=images[p.image];const w=p.image==='structure'?1050:1100;
  const h=w*image.naturalHeight/image.naturalWidth;
  c.drawImage(image,(1200-w)/2,1140-h,w,h);
 }
 return canvas;
}
