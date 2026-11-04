// The user's approved copy. The month is a current calendar label, not a revision date.
export function portfolioCards(date = new Date()) {
  const month=new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric'}).format(date);
  return [
    {intro:true,month,label:'',title:'The biggest bottleneck in AI ('+month+')',detail:'How to structure and maintain information so AI agents can find and understand it.'},
    {image:'context',label:'',title:'AI needs context',detail:"The user using the agent knows what it's working on, what happened before, and why certain decisions were made. The agent needs access to that information too."},
    {image:'structure',label:'',title:'Context needs Structure',detail:"What's the most efficient way to store context and information so the agent can properly do the actions it needs to do?"},
    {image:'maintaining',label:'',title:'Pruning and maintaining Information',detail:'How to decide where information belongs, what needs to be updated and what is no longer useful'}
  ];
}

export function drawPortfolioPanel(p, images) {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1200;
  const c=canvas.getContext('2d');
  function lines(value,x,y,width,size,leading,color,weight=400){
    c.font=weight+' '+size+'px Geist';c.fillStyle=color;
    let line='';
    for(const word of value.split(' ')){
      const next=line?line+' '+word:word;
      if(line&&c.measureText(next).width>width){c.fillText(line,x,y);line=word;y+=leading}else line=next;
    }
    if(line)c.fillText(line,x,y);
    return y;
  }
  if(p.intro){
    c.fillStyle='#26372e';c.fillRect(0,0,1200,1200);
    c.fillStyle='#f2f1e8';c.font='400 104px Geist';c.fillText('The biggest',88,205);
    const title='bottleneck in AI',date='('+p.month+')';
    let titleSize=91,dateSize=47;
    c.font='400 '+titleSize+'px Geist';let titleWidth=c.measureText(title).width;
    c.font='400 '+dateSize+'px Geist';const dateWidth=c.measureText(date).width;
    if(titleWidth+dateWidth+26>1024){titleSize*= (1024-dateWidth-26)/titleWidth;c.font='400 '+titleSize+'px Geist';titleWidth=c.measureText(title).width;}
    c.fillStyle='#f2f1e8';c.font='400 '+titleSize+'px Geist';c.fillText(title,88,324);
    c.fillStyle='#bccbbd';c.font='400 '+dateSize+'px Geist';c.fillText(date,88+titleWidth+26,324);
    lines(p.detail,88,565,990,61,86,'#dce7d9');
    // A quiet opening page, with no image or additional copy.
    c.fillStyle='#7a927d';c.fillRect(88,1015,84,5);
  }else{
    c.fillStyle='#f7f7f2';c.fillRect(0,0,1200,1200);
    const titleBottom=lines(p.title,76,142,1048,74,89,'#26372e');
    const bodyBottom=lines(p.detail,76,titleBottom+80,1048,37,53,'#68736b');
    const imageTop=Math.max(400,bodyBottom+45),imageBottom=1148;
    const image=images[p.image];
    const scale=Math.min(1090/image.naturalWidth,(imageBottom-imageTop)/image.naturalHeight);
    const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
    c.drawImage(image,(1200-width)/2,imageTop+(imageBottom-imageTop-height)/2,width,height);
  }
  return canvas;
}
