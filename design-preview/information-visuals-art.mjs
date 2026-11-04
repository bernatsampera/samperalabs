// Each panel contains a title, a short description, and one wordless illustration.
export function drawInformationPanel(p, index, variant = 'people') {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1000;
  const c=canvas.getContext('2d');
  const ink='#263530',green='#61806c',light='#dce7dd',gray='#dce0dc',gold='#cea465',white='#fff';
  const circle=(x,y,r,fill)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill()};
  const box=(x,y,w,h,fill,r=12)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill()};
  const path=(pts,fill)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill()};
  const stroke=(pts,color=ink,width=6)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke()};
  const ellipse=(x,y,rx,ry,fill)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill()};
  const sheet=(x,y,w=90,h=112,color=white)=>{box(x,y,w,h,color,5);path([[x+w-20,y],[x+w,y+20],[x+w-20,y+20]],'#c6d4c8')};
  const token=(x,y,size=28,color=gold)=>{box(x-size/2,y-size/2,size,size,color,5)};
  const human=(x,y,scale=1,opacity=1)=>{
    c.save();c.globalAlpha=opacity;c.translate(x,y);c.scale(scale,scale);
    ellipse(0,180,75,12,'#e9ede7');circle(0,-35,36,'#b6cbb8');
    path([[-35,-57],[-29,-76],[9,-80],[31,-62],[29,-45],[5,-57],[-14,-47]],ink);
    box(-48,12,96,110,ink,27);stroke([[-24,115],[-28,174]],ink,21);stroke([[24,115],[30,174]],ink,21);
    c.restore();
  };
  const robot=(x,y,scale=1,opacity=1)=>{
    c.save();c.globalAlpha=opacity;c.translate(x,y);c.scale(scale,scale);
    ellipse(0,169,82,11,'#e9ede7');box(-60,-65,120,91,light,25);box(-49,-50,98,56,ink,17);
    circle(-19,-22,6,white);circle(19,-22,6,white);box(-48,41,96,82,green,19);
    stroke([[-23,124],[-23,160]],green,19);stroke([[23,124],[23,160]],green,19);
    c.restore();
  };
  const check=(x,y,size=35)=>{circle(x,y,size,green);stroke([[x-size*.4,y],[x-size*.08,y+size*.3],[x+size*.47,y-size*.3]],white,size*.12)};
  c.fillStyle=variant==='objects'?'#faf8f3':variant==='shapes'?'#f6f7fa':'#fafbf8';c.fillRect(0,0,1000,1000);
  c.strokeStyle='#dce1dc';c.lineWidth=2;c.strokeRect(1,1,998,998);
  c.fillStyle=ink;c.font='400 72px Geist';
  const titleSize=Math.min(72,72*864/c.measureText(p.title).width);c.font='400 '+titleSize+'px Geist';c.fillText(p.title,68,128);
  c.font='400 32px Geist';c.fillStyle='#727d76';let line='',y=199;
  for(const word of p.detail.split(' ')){const next=line?line+' '+word:word;if(c.measureText(next).width>850){c.fillText(line,68,y);line=word;y+=46}else line=next}if(line)c.fillText(line,68,y);
  // Everything below this point is drawn with figures, without words or labels.
  if(variant==='people'){
    if(index===0){
      human(290,640,1.25);robot(745,660,1.02);
      sheet(135,442,72,90,light);sheet(355,460,72,90,light);token(255,430,40);circle(402,605,19,green);
      box(465,502,180,110,white,32);path([[505,604],[490,628],[536,604]],white);token(555,556,35);
      stroke([[345,699],[416,662]],ink,20);
    }else if(index===1){
      human(310,650,1.2);robot(765,657,1.03);
      box(118,760,440,20,'#c2d0be',5);stroke([[160,780],[160,872]],'#c2d0be',9);stroke([[510,780],[510,872]],'#c2d0be',9);
      sheet(165,671,86,88,gray);sheet(205,684,86,75,light);sheet(250,697,86,62,white);
      stroke([[360,700],[480,654],[565,660]],ink,20);sheet(540,606,82,96,'#e9d6b4');stroke([[708,700],[622,657]],green,14);
    }else if(index===2){
      robot(220,630,1.05,.22);robot(780,630,1.05);
      box(398,690,204,135,light,9);path([[398,690],[442,648],[650,648],[602,690]],'#edf2e9');
      sheet(451,535,102,130,'#e6d0a9');check(555,668,28);
      stroke([[721,717],[611,690]],green,14);
    }else{
      human(285,660,1.14);robot(780,660,1.0);
      box(430,465,230,330,white,12);sheet(456,493,175,115,gray);sheet(456,639,175,115,light);
      stroke([[350,717],[428,681]],ink,20);check(640,734,35);
    }
  }else if(variant==='objects'){
    if(index===0){
      box(130,610,740,260,'#e3ecec',32);
      path([[340,611],[440,422],[523,516],[598,610]],'#b9cdd0');path([[440,422],[450,613],[598,610],[523,516]],'#d9e4e3');
      path([[340,611],[228,690],[397,844],[622,817],[762,657],[598,610]],'#7e9f9f');path([[450,613],[397,844],[622,817],[598,610]],'#99b8b4');
      stroke([[130,610],[870,610]],'#fff',5);circle(440,455,12,gold);
    }else if(index===1){
      for(let j=0;j<4;j++)for(let k=0;k<5;k++)sheet(165+k*135,425+j*100,72,78,j===1&&k===2?'#e7cda6':'#e6e4dc');
      c.save();c.beginPath();c.arc(505,574,128,0,Math.PI*2);c.clip();circle(505,574,128,'#fcfcf7');sheet(453,508,105,133,'#e7cda6');c.restore();
      c.beginPath();c.arc(505,574,132,0,Math.PI*2);c.strokeStyle=ink;c.lineWidth=13;c.stroke();stroke([[605,672],[741,808]],ink,33);
    }else if(index===2){
      ellipse(500,850,270,20,'#ebe5d9');
      path([[270,560],[500,481],[730,560],[500,650]],'#f0e9dc');path([[270,560],[500,650],[500,852],[270,756]],'#b8c7ae');path([[500,650],[730,560],[730,756],[500,852]],'#8fa487');
      path([[270,560],[160,485],[394,408],[500,481]],'#d7e0cb');path([[500,481],[635,410],[850,490],[730,560]],'#dce4d2');
      sheet(452,441,104,140,'#d4ae75');
    }else{
      ellipse(500,837,275,19,'#ebe5d9');
      box(240,510,520,290,'#d2d4c7',25);box(270,540,210,230,'#f1efdf',15);box(510,540,220,230,'#92ac92',15);
      c.save();c.translate(600,453);c.rotate(.12);box(-110,-95,220,190,'#d9bb8c',18);c.restore();
      stroke([[531,677],[568,709],[643,625]],'#fff',12);
    }
  }else{
    const blue='#647f9e',pale='#dce3ed',dark='#293b51';
    if(index===0){
      for(let j=0;j<8;j++)for(let k=0;k<12;k++){const x=177+k*58,y=435+j*51;circle(x,y,8+(j+k)%3,((j*7+k)%11===0)?blue:pale)}
      box(372,550,260,142,dark,71);circle(500,621,24,gold);
    }else if(index===1){
      for(let j=0;j<4;j++)for(let k=0;k<5;k++){const x=185+k*145,y=470+j*100;if(j===1&&k===2)continue;circle(x,y,22,pale)}
      c.save();c.translate(475,570);c.rotate(Math.PI/4);box(-76,-76,152,152,dark,20);c.restore();circle(475,570,30,gold);
      circle(475,470,17,gold);circle(620,570,17,gold);circle(330,570,17,gold);
    }else if(index===2){
      c.globalAlpha=.45;circle(300,628,157,pale);c.globalAlpha=1;circle(700,628,157,dark);
      box(290,598,420,61,'#c4d1df',30);circle(502,628,57,gold);circle(502,628,24,'#f8f4e8');
    }else{
      for(let j=0;j<3;j++)for(let k=0;k<3;k++){if(j===1&&k===1)continue;box(280+k*153,470+j*112,134,94,pale,12)}
      box(433,582,134,94,dark,12);
      c.save();c.translate(539,477);c.rotate(.18);box(-67,-47,134,94,gold,12);c.restore();
      stroke([[473,626],[495,644],[534,603]],'#fff',8);
    }
  }
  return canvas;
}
