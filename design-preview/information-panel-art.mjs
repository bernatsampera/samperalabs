// Three visual treatments share the same four questions.
export function drawInformationPanel(p, index, variant = 'paper') {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1000;
  const c = canvas.getContext('2d');
  const ink = '#252a29', muted = '#7d8581', green = '#436953';
  const backgrounds = {paper: '#faf9f5', type: '#f5f7f4', windows: '#f5f7f9'};
  const bg = backgrounds[variant];
  const text = (s,x,y,size=32,color=ink,align='left',font='Geist') => {
    c.fillStyle=color;c.textAlign=align;c.font='400 '+size+'px '+font;c.fillText(s,x,y);c.textAlign='left';
  };
  const box = (x,y,w,h,fill='#fff',stroke='#dbe0da',radius=12) => {
    c.beginPath();c.roundRect(x,y,w,h,radius);c.fillStyle=fill;c.fill();
    if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}
  };
  const line = (x,y,x2,y2,color='#dce1db',width=3) => {
    c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();
  };
  const dot=(x,y,r,color)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill()};
  const paper=(x,y,w,h,angle,title,sub='',fill='#fff')=>{
    c.save();c.translate(x,y);c.rotate(angle);box(0,0,w,h,fill,'#d9ddd4',4);
    text(title,30,58,36);if(sub)text(sub,30,103,25,muted);
    c.restore();
  };
  const windowFrame=(x,y,w,h,label)=>{box(x,y,w,h,'#fff','#cfd9df',20);line(x,y+45,x+w,y+45,'#e0e6e8',2);dot(x+22,y+22,4,'#b5c2c8');text(label,x+40,y+29,17,'#89999f')};
  c.fillStyle=bg;c.fillRect(0,0,1000,1000);
  c.strokeStyle='#dce1dc';c.lineWidth=3;c.strokeRect(1.5,1.5,997,997);
  text(String(index+1).padStart(2,'0'),64,65,23,muted);
  text({paper:'Paper',type:'Type',windows:'Windows'}[variant],936,65,23,muted,'right');
  p.lines.forEach((s,n)=>{
    c.font='400 61px Geist';
    const size=Math.min(61,61*872/Math.max(1,c.measureText(s).width));
    text(s,64,149+n*68,size);
  });

  if(variant==='paper') {
    if(index===0){
      paper(235,370,505,290,-.09,'History');
      paper(220,430,510,290,.08,'Decisions');
      paper(190,510,600,285,-.015,'Intent');
      box(290,665,500,123,'#e8eee4','#b7c5b1',6);
      text('Your question',540,742,43,green,'center');
    } else if(index===1){
      c.globalAlpha=.3;paper(130,400,350,330,-.08,'Other work');paper(510,425,340,320,.09,'Old plans');c.globalAlpha=1;
      paper(265,440,480,365,-.025,'For this task','','#edf2e7');
      text('Intent',320,574,42,green);text('History',320,648,42,green);text('Decisions',320,722,42,green);
      box(628,395,105,48,'#d1ddc7','#b6c6ad',4);
    } else if(index===2){
      c.globalAlpha=.22;paper(145,405,450,250,-.06,'A conversation');c.globalAlpha=1;
      paper(330,515,480,285,.045,'A decision','','#ecf1e5');
      text('Worth keeping.',383,693,38,green);
      text('The chat passes. This stays.',500,854,29,muted,'center');
    } else {
      paper(220,405,550,385,-.02,'A stored decision');
      text('Earlier understanding',270,554,34,muted);line(265,544,690,544,'#a9b2aa',3);
      box(265,594,475,100,'#e5eddd',null,3);text('Revised understanding',287,657,32,green);
      text('Review before replacing.',500,849,29,muted,'center');
    }
  } else if(variant==='type') {
    if(index===0){
      text('intent',135,474,105,'#bbc8bc');text('history',375,601,116,'#c9d3c9');text('decisions',130,748,112,'#a9bda9');
      box(300,534,440,118,'#253a2c',null,59);text('Your question',520,608,45,'#fff','center');
    } else if(index===1){
      text('everything',500,453,112,'#d4dcd2','center');
      text('what matters',500,631,108,green,'center');
      text('for this task',500,717,46,muted,'center');
    } else if(index===2){
      text('conversation',500,453,88,'#d8ded6','center');text('conversation',500,535,88,'#e7ebe5','center');
      text('decision',500,691,140,green,'center');
      text('still here',500,777,37,muted,'center');
    } else {
      text('what we knew',500,478,79,'#a6b2a7','center');line(210,454,795,454,'#8d9f8e',4);
      text('what we know',500,667,84,green,'center');
      text('review the change',500,763,34,muted,'center');
    }
  } else {
    if(index===0){
      box(140,365,720,440,'#e6edf0',null,24);
      text('Intent',200,437,36,'#91a3ad');text('History',620,520,36,'#91a3ad');text('Decisions',205,752,36,'#91a3ad');
      windowFrame(245,475,510,195,'The visible part');text('Your question',500,596,47,'#345665','center');
    } else if(index===1){
      box(140,365,720,440,'#e8eef1',null,24);
      const names=['Intent','Reference','History','Old plan','Decision','Other work'];
      names.forEach((t,n)=>text(t,185+(n%2)*345,440+Math.floor(n/2)*140,30,'#a2b1b9'));
      c.save();c.beginPath();c.arc(500,590,155,0,Math.PI*2);c.clip();c.fillStyle='#fff';c.fillRect(300,400,400,400);
      text('For this task',500,535,25,'#7f929d','center');text('The relevant',500,594,36,'#345665','center');text('knowledge',500,641,36,'#345665','center');c.restore();
      c.beginPath();c.arc(500,590,155,0,Math.PI*2);c.strokeStyle='#9cb1bd';c.lineWidth=3;c.stroke();
    } else if(index===2){
      c.globalAlpha=.42;windowFrame(125,390,355,310,'Previous session');c.globalAlpha=1;
      windowFrame(520,390,355,310,'Next session');
      box(245,570,510,133,'#dce8ec','#9fb6c2',12);text('A decision',500,652,49,'#345665','center');
      text('Available to both.',500,808,32,muted,'center');
    } else {
      windowFrame(165,385,670,410,'Review a knowledge update');
      box(205,475,590,105,'#f0f2f3',null,8);text('Earlier understanding',245,540,33,'#9aa8ae');
      box(205,600,590,105,'#e4edf0',null,8);text('Revised understanding',245,665,33,'#345665');
      text('Accept the change',500,758,28,'#345665','center');
    }
  }
  if(index===3){text('My ongoing research: gcontext',64,931,28,green)}
  else if(index===1){text('I build the context around the task.',64,931,27,green)}
  else{text('Information behind the work',64,931,23,muted)}
  return canvas;
}
