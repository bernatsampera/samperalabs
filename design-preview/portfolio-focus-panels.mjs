export const directions=['signal','between','reveal'];
export const directionNames={signal:'A / Signal',between:'B / Between',reveal:'C / Reveal'};
export function portfolioCards(version='signal'){
 const details={
 signal:'You should not have to explain the whole story every time you ask an agent to act.',
 between:'What happened before this prompt? The agent needs a way to find out.',
 reveal:'You know why a decision was made. Without that context, the agent has to guess.'
 };
 return [
 {intro:true,title:'The biggest bottleneck in AI',detail:'Structuring and maintaining information that agents can find and understand.'},
 {image:'context',title:'AI needs context',detail:details[version]},
 {image:'structure',title:'Context needs structure',detail:'The information exists. The next problem is making it possible to find.'},
 {image:'maintaining',title:'Prune and maintain',detail:'Keep what matters. Update what changes. Remove what no longer helps.'}
 ].map(p=>({...p,label:''}));
}
export function drawPortfolioPanel(p,images,version='signal'){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1200;const c=canvas.getContext('2d');
 function line(s,y,size=90,weight=400,x=600){
  c.font=weight+' '+size+'px Geist';c.textAlign='center';c.fillStyle='#151719';
  const width=c.measureText(s).width;if(width>1080)c.font=weight+' '+(size*1080/width)+'px Geist';
  c.fillText(s,x,y);
 }
 function paragraph(s,y,width=900,size=43){
  c.font='400 '+size+'px Geist';c.fillStyle='#353a3e';c.textAlign='center';let row='';
  for(const word of s.split(' ')){const next=row?row+' '+word:word;if(row&&c.measureText(next).width>width){c.fillText(row,600,y);row=word;y+=size*1.4}else row=next;}if(row)c.fillText(row,600,y);
 }
 function figure(y,w,h){const img=images[p.image];const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight);const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;c.drawImage(img,600-iw/2,y+(h-ih)/2,iw,ih);}
 const heading=p.image==='context'?['AI needs','context']:p.image==='structure'?['Context needs','structure']:['Prune','and maintain'];
 if(version==='signal'){
  // A tight title, a large figure, and a separate reading line.
  if(p.intro){line('The biggest',290,82);line('bottleneck',450,171,700);line('in AI',565,106);paragraph(p.detail,815,820,47);}
  else{line(heading[0],165,77);line(heading[1],306,p.image==='maintaining'?112:149,700);figure(345,920,570);paragraph(p.detail,1015,940,44);}
 }else if(version==='between'){
  // The figure completes the space between the two parts of the title.
  if(p.intro){line('The biggest',230,82);line('bottleneck',400,166,700);line('in AI',830,112,700);paragraph(p.detail,980,880,44);}
  else{line(heading[0],165,92);figure(210,920,560);line(heading[1],885,p.image==='maintaining'?111:150,700);paragraph(p.detail,1010,960,43);}
 }else{
  // The object comes first. Type becomes the base of the composition.
  if(p.intro){line('The biggest',360,82);line('bottleneck in AI',500,126,700);paragraph(p.detail,730,820,47);}
  else{figure(65,1010,620);line(heading[0],795,72);line(heading[1],930,p.image==='maintaining'?111:150,700);paragraph(p.detail,1040,960,43);}
 }
 return canvas;
}
