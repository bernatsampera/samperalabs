// Approved portfolio sequence with continuous scrolling and non-clickable pieces.
export function startFlight(THREE, { root, stage, photo, content }) {

  const P = new URLSearchParams(location.search);
  const num = (k, d) => (P.has(k) ? +P.get(k) : d);
  const D0 = 100, PH = 72;                           // the portrait plane, the portrait height in world units
  const HAIR = 0.12, CHIN = 0.74;                    // where the hair top and the chin sit in the photo (0 top, 1 bottom), measured
  const SCALE = num('scale', 0.74);                  // the bust height, as a share of the screen height
  const GRID = num('grid', 96), CELL = PH / GRID;    // halftone cells: fine, for the detail of the face
  const STRIDE = num('stride', 13);                  // one cell in this many is a card; the rest are filler dots
  const MAXD = 550;      // world units per scroll px, end of the flight, how much the cursor steers
  const LANE_STEP = 120, LANE_Z0 = 130;               // the lane: spacing in depth, where it starts; its radius follows the view width
  const SLOT = 1200, ACOLS = 2;                        // card atlas
  const RED = 0.125, DS = 0.34, DK = 0.58;           // the mask, measured on the photo
  const DUST = num('dust', 240);                      // dots around the bust
  const DRIFT = num('drift', 1);                      // 0 switches the idle motion off
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Content comes in one of two shapes. Chapters (content.js since 18:18): one lane, chapter by chapter, an opener card
  // then the pieces, and nothing else is shown. Legacy: pieces by face part, regions, and a story lane.
  const fromChapters = (chs) => {
    const pieces = {}, story = [];
    chs.forEach((ch, n) => {
      pieces[ch.id] = [{ opener: n + 1, label: `Part ${n + 1}`, title: ch.name, body: ch.question, detail: ch.question }, ...ch.pieces];
      pieces[ch.id].forEach((_, i) => story.push(`${ch.id}:${i}`));
    });
    return { pieces, story, regions: [], skin: chs[0].id, laneOnly: true };
  };
  const C = content.chapters ? fromChapters(content.chapters) : content;
  const laneOnly = true;

  const hero = stage;
  const host = stage.querySelector('[data-flight-figure]');
  const backBtn = stage.querySelector('[data-back]');

  const dockEl = root.querySelector('.ask-dock');
  const chipsEl = dockEl.querySelector('.ask-chips');

  // ---------- the frame: the bust between the top of the page and the dock ----------
  let W = 1, H = 1, fov = 40, tanHalf = Math.tan(20 * Math.PI / 180), Y0 = 0, vh = PH, vw = PH, frame = {};
  function fit() {
    W = host.clientWidth; H = host.clientHeight;
    const hr = host.getBoundingClientRect(), dr = dockEl.getBoundingClientRect(), cr = chipsEl.getBoundingClientRect();
    const top = 40, bottom = Math.max(top + 120, cr.top - hr.top - 8);    // the face band: from under the top edge to above the chips
    const hp = Math.min(SCALE * H, (bottom - top) / (CHIN - HAIR), W);    // the portrait height in px
    let pt = (top + bottom) / 2 - (HAIR + CHIN) / 2 * hp;                  // the portrait top: the face centred in the band
    pt = Math.max(pt, dr.top - hr.top + 40 - hp);                          // and the shoulders always reach into the dock band
    const cy = pt + hp / 2;
    vh = PH * H / hp; vw = vh * W / H;                                     // the view in world units at the portrait plane
    fov = 2 * Math.atan(vh / (2 * D0)) * 180 / Math.PI;
    tanHalf = Math.tan(fov / 2 * Math.PI / 180);
    Y0 = (H / 2 - cy) * vh / H;                                            // the whole field shifts up by this, in world units at the portrait plane
    frame = { w: W, h: H, portrait: Math.round(hp), hair: Math.round(pt + HAIR * hp), chin: Math.round(pt + CHIN * hp), dockTop: Math.round(dr.top - hr.top), chipsTop: Math.round(cr.top - hr.top), fov: +fov.toFixed(1), y0: +Y0.toFixed(2) };
    if (window.FaceDebug) window.FaceDebug.frame = frame;
  }
  fit();

  // ---------- the pieces, and the cards drawn for them ----------
  const list = [];
  for (const cat of Object.keys(C.pieces)) C.pieces[cat].forEach((p, i) => list.push({ ...p, id: `${cat}:${i}`, cat }));
  const byId = new Map(list.map((p, i) => [p.id, i]));
  const AROWS = Math.ceil(list.length / ACOLS);
  const atlas = document.createElement('canvas'); atlas.width = SLOT * ACOLS; atlas.height = SLOT * AROWS;
  const a = atlas.getContext('2d');
  function drawCard(p,x,y) { a.clearRect(x,y,SLOT,SLOT); a.drawImage(p.art,x,y,SLOT,SLOT); }
  list.forEach((p, i) => drawCard(p, (i % ACOLS) * SLOT, Math.floor(i / ACOLS) * SLOT));

  // ---------- the portrait: a halftone of the photo ----------
  const G = 240;
  const off = document.createElement('canvas'); off.width = G; off.height = G;
  const o = off.getContext('2d', { willReadFrequently: true });
  o.drawImage(photo, 0, 0, G, G);
  const d = o.getImageData(0, 0, G, G).data;
  const lum = new Float32Array(G * G), inside = new Uint8Array(G * G);
  for (let k = 0; k < G * G; k++) {
    const R = d[k * 4], Gc = d[k * 4 + 1], B = d[k * 4 + 2];
    const L = (0.2126 * R + 0.7152 * Gc + 0.0722 * B) / 255, dk = 1 - L;
    lum[k] = L; inside[k] = ((R - B) / 255 >= RED && dk >= DS) || dk >= DK ? 1 : 0;
  }
  // A bust is one solid span per row: between the first and the last figure cell of a row, everything is figure.
  // So the light skin at the jaw, the chin and the lit cheek stays in, however close it is to the wall.
  const at0 = (x, y) => (x < 0 || y < 0 || x >= G || y >= G ? 0 : inside[y * G + x]);
  const solid = new Uint8Array(G * G);   // the thresholded mask without lone specks
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) if (inside[y * G + x] && at0(x - 1, y) + at0(x + 1, y) + at0(x, y - 1) + at0(x, y + 1) >= 2) solid[y * G + x] = 1;
  const clean = new Uint8Array(G * G);
  for (let y = 0; y < G; y++) {
    let x0 = -1, x1 = -1;
    for (let x = 0; x < G; x++) if (solid[y * G + x]) { if (x0 < 0) x0 = x; x1 = x; }
    if (x0 >= 0) for (let x = x0; x <= x1; x++) clean[y * G + x] = 1;
  }
  const cellSample = (u0, v0, u1, v1) => {
    let L = 0, n = 0, inn = 0;
    const gx0 = Math.floor(u0 * G), gx1 = Math.max(gx0 + 1, Math.ceil(u1 * G)), gy0 = Math.floor(v0 * G), gy1 = Math.max(gy0 + 1, Math.ceil(v1 * G));
    for (let gy = gy0; gy < gy1 && gy < G; gy++) for (let gx = gx0; gx < gx1 && gx < G; gx++) { const k = gy * G + gx; L += lum[k]; n++; inn += clean[k]; }
    return { L: L / n, inside: inn / n >= 0.5 };
  };
  const regionOf = (u, v) => C.regions.find((r) => r.shape(u, v)) || null;
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  const cells = [], occ = new Uint8Array(GRID * GRID);
  for (let row = 0; row < GRID; row++) for (let col = 0; col < GRID; col++) {
    const s = cellSample(col / GRID, row / GRID, (col + 1) / GRID, (row + 1) / GRID);
    if (!s.inside) continue;
    occ[row * GRID + col] = 1;
    const u = (col + .5) / GRID, v = (row + .5) / GRID;
    const x = (col + .5 - GRID / 2) * CELL, y = (GRID / 2 - row - .5) * CELL;
    const reg = regionOf(u, v);
    // even the lightest skin keeps a visible dot and a light gray, so the bust reads as one body on the white page
    const dark = Math.pow(Math.min(1, Math.max(0, (1 - s.L - 0.14) / 0.7)), 0.85);
    cells.push({ x, y, ox: x, oy: y, row, col, tone: 0.8 - dark * 0.76, hs: 0.5 + 0.5 * Math.pow(dark, 0.8), cat: reg ? reg.cat : C.skin, kind: 0, piece: 0, d: 0, full: 1, h: 0, ring: 9, mv: null });
  }
  // the edge of the bust: ring 0 touches the outside, ring 1 touches ring 0, and so on. Beyond the photo counts as inside,
  // so the shoulders cut by the bottom of the photo do not count as an edge.
  const occAt = (r, c) => (r < 0 || c < 0 || r >= GRID || c >= GRID ? 1 : occ[r * GRID + c]);
  const ringOf = new Uint8Array(GRID * GRID).fill(9);
  for (const c of cells) { let out = 0; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (!occAt(c.row + dr, c.col + dc)) out = 1; if (out) ringOf[c.row * GRID + c.col] = 0; }
  for (let ring = 1; ring <= 2; ring++) for (const c of cells) {
    if (ringOf[c.row * GRID + c.col] < 9) continue;
    let near = 0; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const r = c.row + dr, cc = c.col + dc; if (r >= 0 && cc >= 0 && r < GRID && cc < GRID && ringOf[r * GRID + cc] === ring - 1) near = 1; }
    if (near) ringOf[c.row * GRID + c.col] = ring;
  }
  for (const c of cells) c.ring = ringOf[c.row * GRID + c.col];
  // the lane: the story, one card after another in depth, from the centre of the screen outwards
  const laneY = -Y0, LANE_R = Math.min(6, vw * 0.04);   // narrow screens get a narrower lane, so the cards come straight at you
  const centre = cells.filter((c) => Math.hypot(c.x, c.y - laneY) < LANE_R).sort((p, q) => Math.hypot(p.x, p.y - laneY) - Math.hypot(q.x, q.y - laneY));
  const every = Math.max(1, Math.floor(centre.length / C.story.length));
  C.story.forEach((id, i) => { const c = centre[Math.min(centre.length - 1, i * every)]; c.kind = 2; c.d = LANE_Z0 + i * LANE_STEP; c.piece = byId.get(id); c.full = 3.6 * (list[c.piece].size ?? 1); });
  // the other cards: one cell in STRIDE, with its part's pieces; everything else is a filler dot
  // a piece with weight 2 appears twice as often among the cards of its part; size scales its card
  const draw = (cat) => { const arr = C.pieces[cat]; let total = 0; for (const p of arr) total += p.weight ?? 1; let r = rnd() * total; for (let k = 0; k < arr.length; k++) { r -= arr[k].weight ?? 1; if (r <= 0) return k; } return arr.length - 1; };
  let n = 0;
  for (const c of cells) {
    if (c.kind === 2) continue;
    c.d = D0 * (1.3 + 15 * Math.pow(rnd(), 1.3));   // some lie beyond the end of the flight, so the field never empties
    if (!laneOnly && n++ % STRIDE === 0) {
      const k = draw(c.cat), p = C.pieces[c.cat][k];
      c.kind = 1; c.piece = byId.get(`${c.cat}:${k}`); c.full = (1.9 + rnd() * 1.1) * (p.size ?? 1);
    } else { c.piece = byId.get(`${c.cat}:0`); }
  }
  // the dust: light dots around the bust, outside its edge, at their own depths. Fillers: they fade in the flight.
  const skin = byId.get(`${C.skin}:0`);
  const insideAt = (x, y) => { const col = Math.floor(x / CELL + GRID / 2), row = Math.floor(GRID / 2 - y / CELL); return occAt(row, col) === 1 && row >= 0 && row < GRID && col >= 0 && col < GRID; };
  for (let k = 0, tries = 0; k < DUST && tries < DUST * 40; tries++) {
    const x = (rnd() - 0.5) * vw * 0.96, y = (rnd() - 0.5) * vh * 0.96 - Y0;
    let near = 0; for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2 && !near; dx++) if (insideAt(x + dx * CELL, y + dy * CELL)) near = 1;
    if (near) continue;
    cells.push({ x, y, ox: x, oy: y, row: -1, col: -1, tone: 0.7 + rnd() * 0.16, hs: 0.3 + rnd() * 0.3, cat: C.skin, kind: 0, piece: skin, d: D0 * (1.3 + 12.2 * Math.pow(rnd(), 1.3)), full: 1, h: 0, ring: 5, mv: null });
    k++;
  }
  // the motion at rest: one slow wave runs along the outline (neighbours move together), each piece adds a small
  // wobble of its own, a few pieces on the edge fly further on their own slow loops, and the dust drifts alone.
  const drifting = [];
  for (const c of cells) {
    if (c.ring > 2 && c.ring !== 5) continue;
    const dust = c.ring === 5, flier = c.ring === 0 && rnd() < 0.08;
    const amp = dust ? 0.6 + rnd() * 0.9 : flier ? 2.5 + rnd() * 3 : [0.7 + rnd() * 0.6, 0.35 + rnd() * 0.35, 0.15 + rnd() * 0.2][c.ring];
    c.mv = { a: amp * CELL, f: flier ? 0.03 + rnd() * 0.03 : 0.08 + rnd() * 0.05, p: rnd() * 6.283, ph: dust || flier ? rnd() * 6.283 : c.oy * 0.33 + c.ox * 0.21, own: dust || flier ? 1 : 0.25 };
    drifting.push(c);
  }
  cells.sort((p, q) => q.d - p.d);   // far first: painter's order, no depth buffer needed
  const N = cells.length;

  // ---------- the scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(W, H); renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = 'face';
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, W / H, 1, 6000);

  const tex = new THREE.CanvasTexture(atlas);
  tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = true;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex.colorSpace = THREE.NoColorSpace; tex.needsUpdate = true;

  const geo = new THREE.PlaneGeometry(1, 1);
  const aSlot = new Float32Array(N * 2), aTone = new Float32Array(N), aKind = new Float32Array(N), aId = new Float32Array(N);
  cells.forEach((c, i) => { aSlot[i * 2] = c.piece % ACOLS; aSlot[i * 2 + 1] = Math.floor(c.piece / ACOLS); aTone[i] = c.tone; aKind[i] = c.kind; aId[i] = i; c.i = i; });
  geo.setAttribute('aSlot', new THREE.InstancedBufferAttribute(aSlot, 2));
  geo.setAttribute('aTone', new THREE.InstancedBufferAttribute(aTone, 1));
  geo.setAttribute('aKind', new THREE.InstancedBufferAttribute(aKind, 1));
  geo.setAttribute('aId', new THREE.InstancedBufferAttribute(aId, 1));
  const readingWeights=new Float32Array(N);
  geo.setAttribute('aRead',new THREE.InstancedBufferAttribute(readingWeights,1));
  const uniforms = { uMap: { value: tex }, uGrid: { value: new THREE.Vector2(ACOLS, AROWS) }, uShift: { value: 1 }, uBlur: { value: 1 }, uSlot: { value: SLOT }, uFill: { value: 1 }, uHover: { value: -1 }, uDim: { value: 1 }, uCutout: { value: 0 }, uQuiet: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: `
      attribute float aRead; attribute vec2 aSlot; attribute float aTone; attribute float aKind; attribute float aId;
      uniform vec2 uGrid; uniform float uBlur; uniform float uSlot; uniform float uHover;
      varying vec2 vUv; varying vec2 vLocal; varying float vFade; varying float vTone; varying float vBias; varying float vNear; varying float vKind; varying float vHover; varying float vRead;
      void main() {
        vec4 mv = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        float s = length(instanceMatrix[1].xyz);
        float d = -mv.z;
        vFade = smoothstep(s * 1.1, s * 2.6, d);                  // dissolve just before the piece would fill the screen
        vNear = 1.0 - smoothstep(s * 3.5, s * 16.0, d);           // close enough to read: the card shows its own ink
        vRead = aRead; vFade = mix(vFade, 1.0, aRead);
        vNear = mix(vNear, 1.0, aRead);
        vBias = uBlur * pow(smoothstep(40.0, 1400.0, d), 0.75) * 4.0;   // far pieces are soft, near pieces sharp
        vec2 pad = vec2(0.5 * exp2(vBias) / uSlot + 0.002);
        vec2 inset = mix(pad, 1.0 - pad, uv);
        vUv = vec2((aSlot.x + inset.x) / uGrid.x, 1.0 - (aSlot.y + 1.0 - inset.y) / uGrid.y);
        vLocal = uv; vTone = aTone; vKind = aKind;
        vHover = abs(aId - uHover) < 0.5 ? 1.0 : 0.0;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      precision highp float;
      uniform float uQuiet; uniform float uCutout; uniform sampler2D uMap; uniform float uShift; uniform float uFill; uniform float uDim;
      varying vec2 vUv; varying vec2 vLocal; varying float vFade; varying float vTone; varying float vBias; varying float vNear; varying float vKind; varying float vHover; varying float vRead;
      void main() {
        vec4 sampleColor = texture2D(uMap, vUv, vBias);
        vec3 c = sampleColor.rgb;
        // far away a piece is exactly the tone of its cell of the portrait; a card lets the tone go as it comes near
        float shift = vKind < 0.5 ? 1.0 : uShift * (1.0 - vNear);
        c = mix(c, vec3(vTone), shift);
        if (vKind < 0.5) c = mix(c, vec3(1.0), 0.5 * (1.0 - uFill) / 0.55);   // flying, the face dots turn light: background, behind the cards
        float edge = min(min(vLocal.x, 1.0 - vLocal.x), min(vLocal.y, 1.0 - vLocal.y));
           // the card under the cursor: an ink edge
        float a = vFade * (vKind < 0.5 ? uFill : 1.0) * uDim;
        if (vKind > 0.5) a *= mix(1.0, 0.78 + 0.22*vNear, 1.0-uShift);
        if (vKind < 0.5) a *= 1.0-0.995*uQuiet;
        else a *= 1.0-0.9*uQuiet*(1.0-vNear);
        if (vKind > 0.5) a *= mix(1.0, sampleColor.a * smoothstep(0.5, 0.9, vRead), uCutout);
        gl_FragColor = vec4(c * a, a);
      }`,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.frustumCulled = false;
  scene.add(mesh);

  // ---------- placement: at the portrait every piece is its halftone dot; flying in, the cards grow to full size ----------
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), vS = new THREE.Vector3(), vP = new THREE.Vector3();
  const setCell = (c) => { const k = c.d / D0; vP.set(c.x * k, (c.y + Y0) * k, -c.d); vS.set(c.h, c.h, 1); mesh.setMatrixAt(c.i, m4.compose(vP, q, vS)); };

  const readingLane=cells.filter(c=>c.kind===2).sort((a,b)=>a.d-b.d);
  const curveFactory=function createReadingCurve(knots) {
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
};
  const ENTRY=420, STRIDE_SCROLL=1100, READ_SPAN=640;
  const maxTravel=ENTRY+(readingLane.length-1)*STRIDE_SCROLL+READ_SPAN+430;
  let travel=0,targetTravel=0,readingCurve=null,readingCentre=0;
  function measureReadingZone(){
    const top=88,bottom=frame.chipsTop-24;
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
  let grow = -1;
  function place(g) {
    if (Math.abs(g - grow) < 0.002) return;
    grow = g;
    for (let i = 0; i < N; i++) {
      const c = cells[i], dot = c.hs * 0.94;
      c.h = CELL * (c.d / D0) * (c.kind ? dot + (c.full - dot) * g : dot);
      setCell(c);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  /** The idle motion: the drifting pieces move on their slow loops. */
  function drift(t) {
    for (const c of drifting) {
      const m = c.mv, w = t * m.f * 6.283, p = m.p * m.own;
      c.x = c.ox + m.a * (0.75 * Math.sin(w + m.ph + p) + 0.35 * Math.sin(w * 1.73 + m.p));
      c.y = c.oy + m.a * 0.8 * (0.75 * Math.cos(w * 0.87 + m.ph * 1.4 + p) + 0.35 * Math.cos(w * 1.31 + m.p));
      setCell(c);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  // ---------- flight ----------
  const smooth = (v, lo, hi) => { const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo))); return t * t * (3 - 2 * t); };
  let dist = 0, tDist = 0, lat = { x: 0, y: 0 }, tLat = { x: 0, y: 0 }, flying = false, dim = 1, tDim = 1;
  function setFlying(on) {
    if (on === flying) return;
    flying = on;
    hero.classList.toggle('in', on); if (backBtn) backBtn.hidden = !on;
  }
  function push(px) {
    targetTravel=Math.max(0,Math.min(maxTravel,targetTravel+px*1.05));
  }
  function ndcOf(e) { const r = renderer.domElement.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) }; }

  // ---------- input ----------
  // A scroll anywhere on the hero flies: over the dots, the name, the chips or the field.
  const cv = renderer.domElement;
  root.addEventListener('wheel', (e) => {
    if (root.dataset.state === 'answer' || scrollY > 2) return;   // an answer is open, or the page has scrolled past the hero
    if (e.target.closest && e.target.closest('.ask-menu')) return;  // the topics menu scrolls itself
    if (e.deltaY < 0 && targetTravel <= 0) return;             // at the portrait, scrolling up scrolls the page
    if (e.deltaY > 0 && targetTravel >= maxTravel) return;          // at the end, scrolling down scrolls the page
    e.preventDefault();
    push(e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1), ndcOf(e));
  }, { passive: false });
  // Escape returns to the portrait when the question field is not active.
  const back = () => { targetTravel=0; tLat.x=0; tLat.y=0; };
  if (backBtn) backBtn.addEventListener('click', back);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (document.activeElement !== dockEl.querySelector('input')) back(); } });

  let ty0 = null;

  cv.addEventListener('touchstart', (e) => { if (e.touches.length === 1) ty0 = e.touches[0].clientY; }, { passive: true });
  cv.addEventListener('touchmove', (e) => { if (ty0 === null || e.touches.length !== 1) return; const y = e.touches[0].clientY; const dy = ty0 - y; if ((dy < 0 && targetTravel <= 0) || (dy > 0 && targetTravel >= maxTravel)) return; e.preventDefault(); push(dy * 1.6, null); ty0 = y; }, { passive: false });
  cv.addEventListener('touchend', () => { ty0 = null; });

  if (P.has('fly')) { tDist = dist = Math.min(MAXD, Math.max(0, num('fly', 0))); tLat.x = lat.x = num('sx', 0); tLat.y = lat.y = num('sy', 0); }

  const t0 = performance.now();
  const alive = DRIFT > 0 && !reduced;
  // Draw only while the hero is on screen and the landing view shows it.
  let onScreen = true;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(stage);
  function tick() {
    if (!onScreen || root.dataset.state === 'answer' || !host.offsetWidth) { requestAnimationFrame(tick); return; }
    const k = reduced ? 1 : 0.1;
    travel+=(targetTravel-travel)*(reduced?1:0.18);
    if(Math.abs(targetTravel-travel)<0.01)travel=targetTravel;
    tDist=readingCurve(travel);dist=tDist;
    dist += (tDist - dist) * k; lat.x += (tLat.x - lat.x) * k; lat.y += (tLat.y - lat.y) * k; dim += (tDim - dim) * (reduced ? 1 : 0.15);
    if (Math.abs(tDist - dist) < 0.05) dist = tDist;
    camera.position.set(lat.x, lat.y, -dist);
    place(smooth(dist, 0, 90));
    if (alive) drift((performance.now() - t0) / 1000);
    placeReadingPanels();
    uniforms.uCutout.value=smooth(dist,0,85);
    uniforms.uShift.value = 1 - 0.88 * smooth(dist, 0, 520);   // the tint of the portrait lets go as you fly in
    uniforms.uFill.value = 1 - 0.55 * smooth(dist, 40, 400);       // the filler dots stay: you fly through the face, they pass and dissolve like the cards
    uniforms.uDim.value = dim;

    setFlying(dist > 6);


    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  place(0);
  window.FaceDebug = { dots: N, cards: cells.filter((c) => c.kind).length, lane: cells.filter((c) => c.kind === 2).length, pieces: list.length, atlas: `${atlas.width}x${atlas.height}`, grid: GRID, frame, drifting: drifting.length, dust: cells.filter((c) => c.ring === 5).length, alive, sample: () => drifting.slice(0, 8).map((c) => +(c.x - c.ox).toFixed(3)) };
  tick();

  addEventListener('resize', () => {
    fit();
    renderer.setSize(W, H); camera.aspect = W / H; camera.fov = fov; camera.updateProjectionMatrix();
    measureReadingZone();
    grow = -1; place(smooth(dist, 0, 220));
  });
}
