// Map scroll distance to camera distance without stopping at panel boundaries.
// Harmonic slopes keep the curve strictly increasing and avoid overshoot.
export function createReadingCurve(knots) {
  const slopes=knots.slice(1).map((p,i)=>(p.y-knots[i].y)/(p.x-knots[i].x));
  const tangents=knots.map((p,i)=>{
    if(i===0)return slopes[0];
    if(i===knots.length-1)return slopes.at(-1);
    const left=slopes[i-1],right=slopes[i];
    const h0=p.x-knots[i-1].x,h1=knots[i+1].x-p.x;
    return (3*(h0+h1))/((2*h1+h0)/left+(h1+2*h0)/right);
  });
  return value=>{
    if(value<=knots[0].x)return knots[0].y;
    if(value>=knots.at(-1).x)return knots.at(-1).y;
    const i=knots.findIndex((p,j)=>j<knots.length-1&&value<knots[j+1].x);
    const a=knots[i],b=knots[i+1],h=b.x-a.x,t=(value-a.x)/h;
    return (2*t*t*t-3*t*t+1)*a.y+(t*t*t-2*t*t+t)*h*tangents[i]+(-2*t*t*t+3*t*t)*b.y+(t*t*t-t*t)*h*tangents[i+1];
  };
}

export function withReadingZone(source) {
  const replace=(from,to)=>{if(!source.includes(from))throw new Error('Missing renderer anchor: '+from.slice(0,70));source=source.replace(from,to)};
  replace('STEER = 0.16','STEER = 0');
  replace('uDim: { value: 1 }','uDim: { value: 1 }, uQuiet: { value: 0 }');
  replace('  const uniforms = {', `  const readingWeights=new Float32Array(N);
  geo.setAttribute('aRead',new THREE.InstancedBufferAttribute(readingWeights,1));
  const uniforms = {`);
  replace('attribute vec2 aSlot;', 'attribute float aRead; attribute vec2 aSlot;');
  replace('vBias = uBlur', 'vFade = mix(vFade, 1.0, aRead);\n        vNear = mix(vNear, 1.0, aRead);\n        vBias = uBlur');
  replace('uniform sampler2D uMap;', 'uniform float uQuiet; uniform sampler2D uMap;');
  replace('gl_FragColor = vec4(c * a, a);', 'if (vKind < 0.5) a *= 1.0-0.72*uQuiet;\n        else a *= 1.0-0.6*uQuiet*(1.0-vNear);\n        gl_FragColor = vec4(c * a, a);');
  replace('  let grow = -1;', `
  const readingLane=cells.filter(c=>c.kind===2).sort((a,b)=>a.d-b.d);
  const curveFactory=${createReadingCurve.toString()};
  const ENTRY=420, STRIDE_SCROLL=1100, READ_SPAN=640;
  const maxTravel=ENTRY+(readingLane.length-1)*STRIDE_SCROLL+READ_SPAN+430;
  let travel=0,targetTravel=0,readingCurve=null,readingCentre=0;
  function measureReadingZone(){
    const top=88,bottom=frame.dockTop-34;
    const side=Math.max(100,Math.min(W-44,bottom-top,700));
    readingCentre=(top+bottom)/2;
    const knots=[{x:0,y:0}];
    readingLane.forEach((c,i)=>{
      const h=CELL*(c.d/D0)*c.full;
      c.readEntry=ENTRY+i*STRIDE_SCROLL;c.readEnd=c.readEntry+READ_SPAN;
      const depth=h*H/(2*tanHalf*side);
      knots.push({x:c.readEntry,y:c.d-depth/0.82},{x:c.readEnd,y:c.d-depth/0.97});
    });
    knots.push({x:maxTravel,y:MAXD});
    readingCurve=curveFactory(knots);
  }
  measureReadingZone();
  function placeReadingPanels(){
    let focus=0;
    for(const c of readingLane){
      const approach=smooth(travel,c.readEntry-300,c.readEntry);
      const departure=1-smooth(travel,c.readEnd,c.readEnd+310);
      const weight=approach*departure;
      readingWeights[c.i]=weight;focus=Math.max(focus,weight);
      const depth=c.d-dist,k=c.d/D0;
      const naturalX=c.x*k,naturalY=(c.y+Y0)*k;
      const centreY=(H/2-readingCentre)*2*depth*tanHalf/H;
      c.screenWorldX=naturalX*(1-weight)+lat.x*weight;
      c.screenWorldY=naturalY*(1-weight)+(lat.y+centreY)*weight;
      vP.set(c.screenWorldX,c.screenWorldY,-c.d);vS.set(c.h,c.h,1);
      mesh.setMatrixAt(c.i,m4.compose(vP,q,vS));
    }
    uniforms.uQuiet.value=focus;
    geo.attributes.aRead.needsUpdate=true;mesh.instanceMatrix.needsUpdate=true;
  }
  let grow = -1;`);
  const a=source.indexOf('  function push(px, ndc)'),b=source.indexOf('  function ndcOf',a);
  if(a<0||b<a)throw Error('Missing continuous input function');
  source=source.slice(0,a)+`  function push(px) {
    targetTravel=Math.max(0,Math.min(maxTravel,targetTravel+px*1.05));
  }
`+source.slice(b);
  replace('if (smooth(dz, c.h * 1.1, c.h * 2.6) < 0.35) continue;', 'if (smooth(dz, c.h * 1.1, c.h * 2.6) < 0.35 && readingWeights[c.i]<0.5) continue;');
  replace('(c.x * k - lat.x)', '((c.screenWorldX ?? c.x*k) - lat.x)');
  replace('((c.y + Y0) * k - lat.y)', '((c.screenWorldY ?? (c.y+Y0)*k) - lat.y)');
  replace('const back = () => { closeBox(); tDist = 0; tLat.x = 0; tLat.y = 0; };','const back = () => { closeBox(); targetTravel=0; tLat.x=0; tLat.y=0; };');
  replace("const stops=[0,...lane.map(c=>c.d*0.90)];", "const stops=[0,...readingLane.map(c=>(c.readEntry+c.readEnd)/2)];");
  replace('Math.abs(a.d*.90-dist)<Math.abs(b.d*.90-dist)', 'Math.abs((a.readEntry+a.readEnd)/2-travel)<Math.abs((b.readEntry+b.readEnd)/2-travel)');
  replace('tDist=e.detail>0?(stops.find(s=>s>tDist+2)??stops.at(-1)):([...stops].reverse().find(s=>s<tDist-2)??0);','targetTravel=e.detail>0?(stops.find(s=>s>targetTravel+2)??stops.at(-1)):([...stops].reverse().find(s=>s<targetTravel-2)??0);');
  replace('tDist>=stops.at(-1)-1','targetTravel>=stops.at(-1)-1');
  replace('e.deltaY < 0 && tDist <= 0','e.deltaY < 0 && targetTravel <= 0');
  replace('e.deltaY > 0 && tDist >= MAXD','e.deltaY > 0 && targetTravel >= maxTravel');
  replace('dy < 0 && tDist <= 0','dy < 0 && targetTravel <= 0');
  replace('dy > 0 && tDist >= MAXD','dy > 0 && targetTravel >= maxTravel');
  replace('    dist += (tDist - dist) * k;', `    travel+=(targetTravel-travel)*(reduced?1:0.18);
    if(Math.abs(targetTravel-travel)<0.01)travel=targetTravel;
    tDist=readingCurve(travel);dist=tDist;
    dist += (tDist - dist) * k;`);
  replace('    uniforms.uShift.value =', '    placeReadingPanels();\n    uniforms.uShift.value =');
  replace('    grow = -1; place(', '    measureReadingZone();\n    grow = -1; place(');
  return source;
}
