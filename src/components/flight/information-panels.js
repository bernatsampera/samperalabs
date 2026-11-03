export function portfolioCards(){
 return [
 {intro:true,title:'The biggest bottleneck in AI',detail:'Structuring and maintaining information that agents can find and understand.'},
 {image:'context',title:'AI needs context',detail:'You should not have to explain the whole story every time you ask an agent to act.'},
 {image:'structure',title:'Context needs structure',detail:'The information exists. The next problem is making it possible to find.'},
 {image:'maintaining',title:'Prune and maintain',detail:'Keep what matters. Update what changes. Remove what no longer helps.'}
 ].map(p=>({...p,label:''}));
}
export function drawPortfolioPanel(p,images){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1200;const c=canvas.getContext('2d');
 function line(s,y,size=90,weight=400,x=600){
  c.font=weight+' '+size+'px "Geist Variable"';c.textAlign='center';c.fillStyle='#151719';
  const width=c.measureText(s).width;if(width>1080)c.font=weight+' '+(size*1080/width)+'px "Geist Variable"';
  c.fillText(s,x,y);
 }
 function paragraph(s,y,width=900,size=43){
  c.font='400 '+size+'px "Geist Variable"';c.fillStyle='#353a3e';c.textAlign='center';let row='';
  for(const word of s.split(' ')){const next=row?row+' '+word:word;if(row&&c.measureText(next).width>width){c.fillText(row,600,y);row=word;y+=size*1.4}else row=next;}if(row)c.fillText(row,600,y);
 }
 function figure(y,w,h){const img=images[p.image];const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight);const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;c.drawImage(img,600-iw/2,y+(h-ih)/2,iw,ih);}
 const heading=p.image==='context'?['AI needs','context']:p.image==='structure'?['Context needs','structure']:['Prune','and maintain'];

  // A tight title, a large figure, and a separate reading line.
  if(p.intro){line('The biggest',290,82);line('bottleneck',450,171,700);line('in AI',565,106);paragraph(p.detail,815,820,47);}
  else{line(heading[0],165,77);line(heading[1],306,p.image==='maintaining'?112:149,700);figure(345,920,570);paragraph(p.detail,1015,940,44);}

 return canvas;
}
