export const directions=['impact','question','margin'];
export const directionNames={impact:'A / Impact',question:'B / Questions',margin:'C / In the margins'};
const pruning={image:'maintaining',title:'Prune and maintain',detail:'Keep what matters. Update what changes. Remove what no longer helps.'};
export function portfolioCards(version='impact'){
 const copy={
 impact:[['AI needs context','The task is new to the agent. The history should not be.'],['Context needs structure','If the agent has to search everything, what did we actually give it?']],
 question:[['What did you leave out?','You know why the work took this direction. Can the agent find out?'],['Where would it look?','The information exists. The next problem is making it possible to find.']],
 margin:[['Beyond the prompt','Your request is only the surface. The agent needs access to what came before.'],['Give information a place','Decide where information belongs before asking an agent to find it.']]
 }[version];
 return [{intro:true,title:'The biggest bottleneck in AI',detail:'Structuring and maintaining information that agents can find and understand.'},...copy.map(([title,detail],i)=>({image:i?'structure':'context',title,detail})),{...pruning}].map(p=>({...p,label:''}));
}
export function drawPortfolioPanel(p,images,version='impact'){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1200;const c=canvas.getContext('2d');
 function line(s,x,y,size=80,weight=400,align='left',serif=false){
  c.font=(serif?'italic ':weight+' ')+size+'px '+(serif?'Instrument':'Geist');c.textAlign=align;c.fillStyle='#151719';c.fillText(s,x,y);
 }
 function paragraph(s,x,y,width=650,size=42,align='left'){
  c.font='400 '+size+'px Geist';c.fillStyle='#353a3e';c.textAlign=align;let row='';
  for(const word of s.split(' ')){const next=row?row+' '+word:word;if(row&&c.measureText(next).width>width){c.fillText(row,x,y);row=word;y+=size*1.4}else row=next;}if(row)c.fillText(row,x,y);
 }
 function figure(x,y,w,h){const img=images[p.image];const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight);const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;c.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);}
 if(version==='impact'){
  if(p.intro){line('The biggest',55,265,89);line('bottleneck',45,438,174,700);line('in AI',1110,575,125,400,'right');paragraph(p.detail,385,805,710,48);}
  else if(p.image==='context'){line('AI needs',50,195,96);line('context',42,365,190,700);figure(415,425,760,720);paragraph(p.detail,55,635,370,44);}
  else if(p.image==='structure'){line('Context needs',55,205,90);line('structure',45,375,172,700);figure(0,440,810,640);paragraph(p.detail,835,620,310,42);}
  else{line('Prune',55,205,168,700);line('and maintain',60,325,96);figure(0,375,850,760);paragraph(p.detail,835,555,310,43);}
 }else if(version==='question'){
  if(p.intro){line('The biggest',600,280,100,400,'center',true);line('bottleneck',600,445,165,650,'center');line('in AI',600,570,108,400,'center',true);paragraph(p.detail,600,800,790,47,'center');}
  else{
   const rows=p.image==='context'?['What did you','leave out?']:p.image==='structure'?['Where would','it look?']:['Prune','and maintain'];
   line(rows[0],600,180,100,400,'center',true);line(rows[1],600,312,128,700,'center');figure(170,340,860,580);paragraph(p.detail,600,1005,900,43,'center');
  }
 }else{
  if(p.intro){line('The biggest',95,310,100);line('bottleneck',95,445,133,700);line('in AI',95,570,112,400,'left',true);paragraph(p.detail,545,840,610,44);}
  else{
   const right=p.image==='structure';const tx=right?65:650;
   figure(right?530:-60,220,710,840);
   const rows=p.image==='context'?['Beyond','the prompt']:p.image==='structure'?['Give information','a place']:['Prune','and maintain'];
   line(rows[0],tx,370,p.image==='structure'?57:85,400,'left',true);line(rows[1],tx,475,p.image==='maintaining'?66:80,700);
   paragraph(p.detail,tx,615,right?430:475,41);
  }
 }
 return canvas;
}
