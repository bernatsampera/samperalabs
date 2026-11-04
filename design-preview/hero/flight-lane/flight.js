// Hero F, the lane draft: the portrait you fly into.
// Thousands of dots make a halftone of the portrait. Each dot sits on the line from the camera through its cell,
// at its own depth and scaled by that depth, so the field projects into one flat face. Most dots are fillers:
// they give the face its detail and fade out as you fly. The rest are cards. ONE LANE of them carries the cards of
// content.js in order, the main five first. Around the lane, one cell in STRIDE is a smaller copy of one of the
// same cards, at a random depth: the face breaks into a whole field of cards, and the lane runs through it.
// At the portrait a card is its halftone dot, tinted to the tone of its cell, so nothing betrays it. Scrolling
// flies the camera forward: the dots fade, the cards grow into white cards, the lane cards slide into the lane
// and come toward you one after another, the cards around fly past and dissolve. A lane card is read when it is
// about 40% of the screen width. A card under the cursor gets an ink edge. A click on a card with a link opens that page; a card without a link opens its box.
// The lane runs through the free space: beside the name on a wide screen, under it on a phone, above the chips.
// Every card is as tall as its text. The card look (paper, rounded corners, hairline, float shadow) is drawn by
// the shader, so it stays crisp at any size. The text is drawn once into an atlas: see drawCard below.
// The first view (the frame of the bust, the name, the dock) is a copy of ../flight at 18:24, without its idle drift.
// To change WHAT is shown, and in which order: content.js.
// Classic script: window.startFlight(THREE) is called by the module that imports Three.js.
// URL params: at=<lane card index, fractions allowed> (the camera at that card's reading distance), fly=<distance>,
// stride (one cell in this many is a card around the lane; 0 for none), grid, scale, demo=0.
window.startFlight = (THREE) => {
  document.getElementById('dock').outerHTML = window.Hero.DOCK;
  window.Hero.initDock({ onText: () => {}, onSubmit: () => {} });

  const P = new URLSearchParams(location.search);
  const num = (k, d) => (P.has(k) ? +P.get(k) : d);
  const D0 = 100, PH = 72;                           // the portrait plane, the portrait height in world units
  const HAIR = 0.12, CHIN = 0.74;                    // where the hair top and the chin sit in the photo (0 top, 1 bottom), measured
  const SCALE = num('scale', 0.74);                  // the bust height, as a share of the screen height
  const GRID = num('grid', 96), CELL = PH / GRID;    // halftone cells: fine, for the detail of the face
  const STRIDE = num('stride', 13);                  // one cell in this many is a card around the lane; the rest are filler dots
  const SPEED = 0.55;                                // world units per scroll px
  const Z0 = 170, STEP = 64, FULLW = 4.5, GROW = 90; // the lane: depth of the first card, depth between cards, card width in cells, flight distance over which the cards grow
  const AROUND = [0.45, 0.75];                       // the cards around the lane: their width, as a share of a lane card's
  const INNER = 0.76;                                // the card's share of its quad's width (the margin around it holds the shadow)
  const SLOT_W = 768, SLOT_H = 614, ACOLS = 5;       // the atlas: one slot per card, plus the dot in slot 0; a card uses the top of its slot
  const MAX_ASPECT = 1.9;                            // the widest a short card gets (width over height)
  const RED = 0.125, DS = 0.34, DK = 0.58;           // the mask, measured on the photo
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = window.FaceContent;

  const hero = document.querySelector('.hero');
  const host = document.querySelector('.figure');
  const backBtn = document.querySelector('[data-back]');
  const box = document.querySelector('[data-box]');
  const dockEl = document.querySelector('.dock');
  const chipsEl = dockEl.querySelector('.chips');
  const introEl = document.querySelector('.intro');
  const hintEl = document.querySelector('[data-hint]');
  const HINT = hintEl ? hintEl.textContent : '';

  // ---------- the frame: the bust between the top of the page and the dock (as in ../flight), and the lane ----------
  let W = 1, H = 1, fov = 40, tanHalf = Math.tan(20 * Math.PI / 180), Y0 = 0, vh = PH, frame = {};
  let fRead = 0.4, laneX = 0, laneY = 0.2;           // a card is read at this share of the screen width; the lane, in clip space (x right, y up)
  function fit() {
    W = host.clientWidth; H = host.clientHeight;
    const hr = host.getBoundingClientRect(), dr = dockEl.getBoundingClientRect(), cr = chipsEl.getBoundingClientRect(), ir = introEl.getBoundingClientRect();
    const top = 40, bottom = Math.max(top + 120, cr.top - hr.top - 8);    // the face band: from under the top edge to above the chips
    const hp = Math.min(SCALE * H, (bottom - top) / (CHIN - HAIR), W);    // the portrait height in px
    let pt = (top + bottom) / 2 - (HAIR + CHIN) / 2 * hp;                  // the portrait top: the face centred in the band
    pt = Math.max(pt, dr.top - hr.top + 40 - hp);                          // and the shoulders always reach into the dock band
    const cy = pt + hp / 2;
    vh = PH * H / hp;                                                      // the view height in world units at the portrait plane
    fov = 2 * Math.atan(vh / (2 * D0)) * 180 / Math.PI;
    tanHalf = Math.tan(fov / 2 * Math.PI / 180);
    Y0 = (H / 2 - cy) * vh / H;                                            // the whole field shifts up by this, in world units at the portrait plane
    // The lane: beside the name when there is room for a card there, else under the name. Always above the chips.
    fRead = W < 600 ? 0.85 : W < 1000 ? 0.55 : 0.4;
    const cardW = fRead * W, introR = ir.right - hr.left, introB = ir.bottom - hr.top;
    let lx, ly;
    if (W - introR - 24 >= cardW * 1.3) { lx = (introR + W) / 2; ly = (top + bottom) / 2; }
    else { lx = W / 2; ly = (introB + 16 + bottom) / 2; }
    laneX = (lx - W / 2) / (W / 2); laneY = (H / 2 - ly) / (H / 2);
    frame = { w: W, h: H, portrait: Math.round(hp), hair: Math.round(pt + HAIR * hp), chin: Math.round(pt + CHIN * hp), dockTop: Math.round(dr.top - hr.top), chipsTop: Math.round(cr.top - hr.top), fov: +fov.toFixed(1), y0: +Y0.toFixed(2), lane: { x: +laneX.toFixed(2), y: +laneY.toFixed(2), read: fRead } };
    if (window.FaceDebug) window.FaceDebug.frame = frame;
  }
  fit();

  // ---------- the cards, in flight order ----------
  const list = C.cards.map((p, i) => ({ ...p, id: `${i}:${(p.title || '').slice(0, 24)}` }));
  const NC = list.length;

  // ---------- the atlas: the text of every card, drawn once ----------
  // A card is designed at 500 px wide and drawn at SLOT_W, so a card read at about 500 px is crisp. Each card is as
  // tall as its text (p.frac: the share of the slot it uses, from the top). The shape (paper, corners, hairline,
  // shadow) is not here: the shader draws it, so it stays sharp at any size.
  const AROWS = Math.ceil((NC + 1) / ACOLS);
  const atlas = document.createElement('canvas'); atlas.width = SLOT_W * ACOLS; atlas.height = SLOT_H * AROWS;
  const a = atlas.getContext('2d');
  const FAM = "Geist, 'Helvetica Neue', Arial, sans-serif";
  const INK = '#14141A', GRAPHITE = '#3C3C43', SLATE = '#5F5F67', PAPER = '#FFFFFF', ACCENT = '#1D5BFF', RULE = '#E2E2E6';
  const S = SLOT_W / 500, px = (v) => v * S;
  const font = (w, size) => `${w} ${px(size)}px ${FAM}`;
  const wrap = (text, f, maxW, maxLines) => {
    a.font = f; const out = []; let line = '';
    for (const w of String(text).split(' ')) { const t = line ? line + ' ' + w : w; if (a.measureText(t).width <= maxW || !line) line = t; else { out.push(line); line = w; } }
    if (line) out.push(line);
    if (out.length > maxLines) { out.length = maxLines; let l = out[maxLines - 1]; while (l.length && a.measureText(l + '…').width > maxW) l = l.slice(0, -1); out[maxLines - 1] = l + '…'; }
    return out;
  };
  /** Draws lines of text from `top`, one line box of `lh` each. Returns the bottom. */
  const lines = (arr, f, color, size, x, top, lh) => { a.font = f; a.fillStyle = color; let y = top; for (const l of arr) { a.fillText(l, x, y + (lh - px(size)) / 2 + px(size) * 0.78); y += lh; } return y; };
  const chevron = (x, cy, h) => { a.strokeStyle = ACCENT; a.lineWidth = px(1.6); a.lineCap = 'round'; a.lineJoin = 'round'; a.beginPath(); a.moveTo(x, cy - h / 2); a.lineTo(x + h / 2, cy); a.lineTo(x, cy + h / 2); a.stroke(); };
  /** Draws one card into its slot: label, title, body or list, link. Returns the height of the card, in atlas px. */
  function drawCard(p, x0, y0) {
    a.fillStyle = PAPER; a.fillRect(x0, y0, SLOT_W, SLOT_H);
    const pad = px(32), x = x0 + pad, w = SLOT_W - 2 * pad;
    a.fillStyle = SLATE; a.font = font(500, 14); a.fillText(p.label || '', x, y0 + pad + px(14) * 0.8);
    a.letterSpacing = `${px(-0.4)}px`;
    let y = y0 + pad + px(20) + px(10);
    y = lines(wrap(p.title, font(500, 30), w, 3), font(500, 30), INK, 30, x, y, px(36));
    a.letterSpacing = '0px';
    if (p.body) { y += px(8); y = lines(wrap(p.body, font(400, 17), w, 3), font(400, 17), GRAPHITE, 17, x, y, px(27)); }
    if (p.list) {
      // rows of when and what, in two columns, a hairline between the rows
      y += px(14);
      a.font = font(400, 15); const col = Math.max(...p.list.map((r) => a.measureText(r.when).width)) + px(20), rh = px(30);
      p.list.slice(0, 7).forEach((r, i) => {
        if (i) { a.fillStyle = RULE; a.fillRect(x, y, w, Math.max(1, px(1))); }
        a.fillStyle = SLATE; a.font = font(400, 15); a.fillText(r.when, x, y + rh / 2 + px(15) * 0.36);
        a.fillStyle = GRAPHITE; a.font = font(400, 16); a.fillText(wrap(r.what, font(400, 16), w - col, 1)[0], x + col, y + rh / 2 + px(16) * 0.36);
        y += rh;
      });
    }
    if (p.href) {
      const t = p.cta || 'Open'; a.fillStyle = ACCENT; a.font = font(500, 15);
      y += px(20); const by = y + px(15) * 0.8; a.fillText(t, x, by);
      chevron(x + a.measureText(t).width + px(8), by - px(5), px(9)); y += px(20);
    }
    return Math.min(SLOT_H, Math.max(SLOT_W / MAX_ASPECT, y - y0 + pad));
  }
  a.fillStyle = '#808080'; a.fillRect(0, 0, SLOT_W, SLOT_H);   // slot 0: the filler dot (its tone comes from the portrait)
  list.forEach((p, i) => { const s = i + 1; p.frac = drawCard(p, (s % ACOLS) * SLOT_W, Math.floor(s / ACOLS) * SLOT_H) / SLOT_H; });

  // ---------- the portrait: a halftone of the photo ----------
  const G = 240;
  const off = document.createElement('canvas'); off.width = G; off.height = G;
  const o = off.getContext('2d', { willReadFrequently: true });
  o.drawImage(window.FacePhotoImage, 0, 0, G, G);
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
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  const cells = [];
  for (let row = 0; row < GRID; row++) for (let col = 0; col < GRID; col++) {
    const s = cellSample(col / GRID, row / GRID, (col + 1) / GRID, (row + 1) / GRID);
    if (!s.inside) continue;
    const x = (col + .5 - GRID / 2) * CELL, y = (GRID / 2 - row - .5) * CELL;
    // even the lightest skin keeps a visible dot and a light gray, so the bust reads as one body on the white page
    const dark = Math.pow(Math.min(1, Math.max(0, (1 - s.L - 0.14) / 0.7)), 0.85);
    cells.push({ x, y, tone: 0.8 - dark * 0.76, hs: 0.5 + 0.5 * Math.pow(dark, 0.8), kind: 0, lane: false, slot: 0, card: -1, frac: 1, full: 1, d: 0, h: 0, w: 0, px: 0, py: 0 });
  }
  // The lane: its cards take the cells nearest to where the lane crosses the portrait, one after another in depth.
  const cx0 = laneX * D0 * tanHalf * (W / H), cy0 = laneY * D0 * tanHalf - Y0;
  const lane = cells.slice().sort((p, q) => Math.hypot(p.x - cx0, p.y - cy0) - Math.hypot(q.x - cx0, q.y - cy0)).slice(0, NC);
  lane.forEach((c, i) => { c.kind = 1; c.lane = true; c.card = i; c.slot = i + 1; c.frac = list[i].frac; c.full = FULLW; c.d = Z0 + i * STEP; });
  // Around the lane: one cell in STRIDE is a smaller copy of one of the cards, at a random depth. The rest are filler dots.
  let n = 0;
  for (const c of cells) {
    if (c.kind) continue;
    c.d = D0 * (1.3 + 12.2 * Math.pow(rnd(), 1.3));
    if (STRIDE > 0 && n++ % STRIDE === 0) { const k = Math.floor(rnd() * NC); c.kind = 1; c.card = k; c.slot = k + 1; c.frac = list[k].frac; c.full = FULLW * (AROUND[0] + rnd() * (AROUND[1] - AROUND[0])); }
  }
  cells.sort((p, q) => q.d - p.d);   // far first: painter's order, no depth buffer needed
  cells.forEach((c, i) => { c.i = i; });
  const N = cells.length, cardCells = cells.filter((c) => c.kind);

  // Where each lane card sits once it is a card (the flight lerps it there from its dot on the ray), and where it is read.
  let MAXD = 1000;
  function layLane() {
    const asp = W / H;
    lane.forEach((c, i) => {
      const w = CELL * (c.d / D0) * FULLW;
      c.read = w / (2 * fRead * tanHalf * asp);                                              // the distance from the camera at which the card is read
      const sx = laneX + 0.12 * Math.sin(0.9 * i + 0.6), sy = laneY + 0.05 * Math.cos(1.3 * i);   // on the lane, with a gentle stagger so the next card peeks out beside the current one
      c.lx = sx * c.read * tanHalf * asp; c.ly = sy * c.read * tanHalf;
    });
    const last = lane[NC - 1]; MAXD = last.d - last.read;
  }
  layLane();

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
  const aSlot = new Float32Array(N * 2), aTone = new Float32Array(N), aKind = new Float32Array(N), aId = new Float32Array(N), aFrac = new Float32Array(N);
  cells.forEach((c, i) => { aSlot[i * 2] = c.slot % ACOLS; aSlot[i * 2 + 1] = Math.floor(c.slot / ACOLS); aTone[i] = c.tone; aKind[i] = c.kind; aId[i] = i; aFrac[i] = c.frac; });
  geo.setAttribute('aSlot', new THREE.InstancedBufferAttribute(aSlot, 2));
  geo.setAttribute('aTone', new THREE.InstancedBufferAttribute(aTone, 1));
  geo.setAttribute('aKind', new THREE.InstancedBufferAttribute(aKind, 1));
  geo.setAttribute('aId', new THREE.InstancedBufferAttribute(aId, 1));
  geo.setAttribute('aFrac', new THREE.InstancedBufferAttribute(aFrac, 1));
  const uniforms = {
    uMap: { value: tex }, uGrid: { value: new THREE.Vector2(ACOLS, AROWS) }, uSlot: { value: new THREE.Vector2(SLOT_W, SLOT_H) },
    uShift: { value: 1 }, uBlur: { value: 1 }, uFill: { value: 1 }, uHover: { value: -1 }, uDim: { value: 1 },
    uGrow: { value: 0 }, uInner: { value: INNER }, uTan: { value: tanHalf }, uAsp: { value: W / H }, uRead: { value: fRead },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: `
      attribute vec2 aSlot; attribute float aTone; attribute float aKind; attribute float aId; attribute float aFrac;
      uniform float uBlur; uniform float uHover; uniform float uGrow; uniform float uInner; uniform float uTan; uniform float uAsp; uniform float uRead;
      varying vec2 vLocal; varying vec2 vSlot; varying float vFade; varying float vTone; varying float vBias; varying float vNear; varying float vKind; varying float vHover; varying float vAspect; varying float vMg; varying float vFrac;
      void main() {
        vec4 mv = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        float sx = length(instanceMatrix[0].xyz), sy = length(instanceMatrix[1].xyz);
        float mg = 0.5 * (1.0 - uInner) * uGrow * (aKind > 0.5 ? 1.0 : 0.0);   // the shadow margin, as a share of the quad width
        float cw = sx * (1.0 - 2.0 * mg);                                        // the width of the card itself
        float d = -mv.z;
        float f = cw / (2.0 * d * uTan * uAsp);                                  // the share of the screen width the card takes
        vFade = 1.0 - smoothstep(uRead * 1.35, uRead * 2.1, f);                  // read, then dissolve before it fills the screen
        vNear = smoothstep(uRead * 0.22, uRead * 0.55, f);                       // close enough to read: the card shows its own ink
        vBias = uBlur * pow(smoothstep(40.0, 1400.0, d), 0.75) * 4.0;           // far pieces are soft, near pieces sharp
        vLocal = uv; vSlot = aSlot; vTone = aTone; vKind = aKind; vAspect = sx / sy; vMg = mg; vFrac = aFrac;
        vHover = abs(aId - uHover) < 0.5 ? 1.0 : 0.0;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uMap; uniform vec2 uGrid; uniform vec2 uSlot; uniform float uShift; uniform float uFill; uniform float uDim; uniform float uGrow;
      varying vec2 vLocal; varying vec2 vSlot; varying float vFade; varying float vTone; varying float vBias; varying float vNear; varying float vKind; varying float vHover; varying float vAspect; varying float vMg; varying float vFrac;
      const vec3 INK = vec3(0.078, 0.078, 0.102);
      const vec3 RULE = vec3(0.886, 0.886, 0.902);
      void main() {
        float card = step(0.5, vKind);
        // the card inside its quad, in units of the quad height, centred. The margin is the same on all four sides.
        float m = vMg * vAspect;
        vec2 p = (vLocal - 0.5) * vec2(vAspect, 1.0);
        vec2 he = vec2(0.5 * vAspect - m, 0.5 - m);
        float r = 0.03 * vAspect * uGrow * card;                        // the corner radius: 3% of the card width
        vec2 q = abs(p) - he + r;
        float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
        float aa = max(fwidth(sd), 1e-4);
        float shape = 1.0 - smoothstep(-aa, aa, sd);
        // the text: the top vFrac of the card's slot, inset a little against bleeding from the slots around it
        vec2 cuv = clamp(vec2((vLocal.x - 0.5) / (1.0 - 2.0 * vMg), (vLocal.y - 0.5) / (1.0 - 2.0 * m)) + 0.5, 0.0, 1.0);
        vec2 pad = 0.5 * exp2(vBias) / uSlot + 0.002;
        float fx = mix(pad.x, 1.0 - pad.x, cuv.x);
        float fy = mix(pad.y, vFrac - pad.y, 1.0 - cuv.y);
        vec2 tuv = vec2((vSlot.x + fx) / uGrid.x, 1.0 - (vSlot.y + fy) / uGrid.y);
        vec3 c = texture2D(uMap, tuv, vBias).rgb;
        // far away a piece is exactly the tone of its cell of the portrait; a card lets the tone go as it comes near
        float shift = card < 0.5 ? 1.0 : uShift * (1.0 - vNear);
        c = mix(c, vec3(vTone), shift);
        // the hairline, ink under the cursor
        float line = smoothstep(-aa * 2.5, -aa * 0.5, sd) * card * uGrow * (1.0 - shift);
        c = mix(c, vHover > 0.5 ? INK : RULE, line);
        // the float shadow: soft, a little below the card
        vec2 qs = abs(p - vec2(0.0, -0.018 * vAspect)) - he + r;
        float sds = length(max(qs, 0.0)) + min(max(qs.x, qs.y), 0.0) - r;
        float shadow = (1.0 - smoothstep(-0.02 * vAspect, 0.075 * vAspect, sds)) * 0.2 * card * uGrow * (1.0 - shape) * (1.0 - shift);
        float aC = shape * vFade * mix(uFill, 1.0, card) * uDim;
        float aS = shadow * vFade * uDim;
        gl_FragColor = vec4(c * aC + INK * aS, aC + aS);
      }`,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.frustumCulled = false;
  scene.add(mesh);

  // ---------- placement: at the portrait every piece is its halftone dot on its ray; flying in, the cards grow, and the lane cards slide into the lane ----------
  const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), vS = new THREE.Vector3(), vP = new THREE.Vector3();
  let grow = -1;
  function place(g) {
    if (Math.abs(g - grow) < 0.002) return;
    grow = g; uniforms.uGrow.value = g;
    for (let i = 0; i < N; i++) {
      const c = cells[i], k = c.d / D0, dotSize = CELL * k * c.hs * 0.94, rx = c.x * k, ry = (c.y + Y0) * k;
      if (c.kind) {
        const wFull = CELL * k * c.full, hFull = wFull * c.frac * SLOT_H / SLOT_W, mg = (1 - INNER) / 2 * g;
        c.w = dotSize + (wFull - dotSize) * g; c.h = dotSize + (hFull - dotSize) * g;
        c.px = c.lane ? rx + (c.lx - rx) * g : rx; c.py = c.lane ? ry + (c.ly - ry) * g : ry;
        const qw = c.w / (1 - 2 * mg), margin = mg * qw;
        vP.set(c.px, c.py, -c.d); vS.set(qw, c.h + 2 * margin, 1);
      } else {
        c.h = c.w = dotSize;
        vP.set(rx, ry, -c.d); vS.set(dotSize, dotSize, 1);
      }
      mesh.setMatrixAt(i, m4.compose(vP, qt, vS));
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  // ---------- flight ----------
  const smooth = (v, lo, hi) => { const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo))); return t * t * (3 - 2 * t); };
  let dist = 0, tDist = 0, flying = false, dim = 1, tDim = 1;
  function setFlying(on) {
    if (on === flying) return;
    flying = on;
    hero.classList.toggle('in', on); backBtn.hidden = !on;
  }
  function push(px) { tDist = Math.min(MAXD, Math.max(0, tDist + px * SPEED)); }
  function ndcOf(e) { const r = renderer.domElement.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) }; }
  const shareOf = (c) => c.w / (2 * (c.d - dist) * tanHalf * camera.aspect);   // the share of the screen width a card takes now

  /** The lane card the visitor is at: the first one ahead that is not yet dissolving. */
  function currentCard() { for (const c of lane) if (c.d > dist && shareOf(c) < fRead * 1.7) return c; return null; }
  /** The card under a screen point, by the same projection the camera uses. Lane cards and the cards around. */
  function pick(ndc) {
    let best = -1, bd = 1e9;
    if (ndc.y < 1 - 2 * frame.dockTop / H) return -1;   // on the dock band: nothing to pick
    for (const c of cardCells) {
      const dz = c.d - dist; if (dz <= 0 || dz >= bd || shareOf(c) > fRead * 1.7) continue;
      const sx = c.px / (dz * tanHalf * camera.aspect), sy = c.py / (dz * tanHalf);
      const hx = c.w / 2 / (dz * tanHalf * camera.aspect), hy = c.h / 2 / (dz * tanHalf);
      if (Math.abs(ndc.x - sx) <= hx && Math.abs(ndc.y - sy) <= hy) { best = c.i; bd = dz; }
    }
    return best;
  }

  // ---------- the box: one card, opened ----------
  let open = -1;
  function openBox(i) {
    const p = list[cells[i].card];
    box.querySelector('[data-box-label]').textContent = p.label || '';
    box.querySelector('[data-box-title]').textContent = p.title;
    box.querySelector('[data-box-body]').textContent = p.detail || p.body || (p.list ? p.list.map((r) => `${r.when}: ${r.what}`).join('\n') : '');
    const cta = box.querySelector('[data-box-cta]');
    cta.hidden = !p.href; if (p.href) { cta.href = p.href; cta.textContent = p.cta || 'Open'; }
    box.hidden = false; open = i; tDim = 0.28; hero.classList.add('open');
    box.querySelector('[data-box-close]').focus();
  }
  function closeBox() { if (open < 0) return; box.hidden = true; open = -1; tDim = 1; hero.classList.remove('open'); }
  box.querySelectorAll('[data-box-close]').forEach((b) => b.addEventListener('click', closeBox));

  // A link on this site opens in the same tab; a link to another site opens in a new tab; mailto opens the mail app.
  function go(href) {
    window.FaceDebug.went = href;
    let u; try { u = new URL(href, location.href); } catch { return; }
    if (u.protocol === 'mailto:' || u.host === location.host || u.host === 'samperalabs.com') location.href = u.href;
    else window.open(u.href, '_blank', 'noopener');
  }

  // ---------- input ----------
  // A scroll anywhere on the hero flies: over the dots, the name, the chips or the field.
  const cv = renderer.domElement;
  hero.addEventListener('wheel', (e) => {
    if (open >= 0) closeBox();                           // a deliberate scroll closes the box and carries on
    if (e.deltaY < 0 && tDist <= 0) return;             // at the portrait, scrolling up scrolls the page
    if (e.deltaY > 0 && tDist >= MAXD) return;          // at the end, scrolling down scrolls the page
    e.preventDefault();
    push(e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1));
  }, { passive: false });
  let hoverCard = -1;
  cv.addEventListener('mousemove', (e) => {
    const i = dist > 8 && open < 0 ? pick(ndcOf(e)) : -1;
    if (i !== hoverCard) { hoverCard = i; uniforms.uHover.value = i; cv.style.cursor = i >= 0 ? 'pointer' : ''; }
  });
  cv.addEventListener('mouseleave', () => { hoverCard = -1; uniforms.uHover.value = -1; cv.style.cursor = ''; });
  let down = null;
  cv.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
  cv.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
    down = null;
    if (open >= 0) return closeBox();
    if (dist <= 8) return;
    const i = pick(ndcOf(e)); if (i < 0) return;
    const p = list[cells[i].card];
    if (p.href) go(p.href); else openBox(i);   // a card with a link opens its page; a card without one opens its box
  });
  const back = () => { closeBox(); tDist = 0; };
  backBtn.addEventListener('click', back);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (open >= 0) closeBox(); else if (document.activeElement !== dockEl.querySelector('[data-field]')) back(); } });
  let ty0 = null;
  cv.addEventListener('touchstart', (e) => { if (e.touches.length === 1) ty0 = e.touches[0].clientY; }, { passive: true });
  cv.addEventListener('touchmove', (e) => { if (ty0 === null || e.touches.length !== 1) return; const y = e.touches[0].clientY; const dy = ty0 - y; if ((dy < 0 && tDist <= 0) || (dy > 0 && tDist >= MAXD)) return; e.preventDefault(); push(dy * 1.6); ty0 = y; }, { passive: false });
  cv.addEventListener('touchend', () => { ty0 = null; });

  // Start inside the flight: at=<card> puts the camera at that lane card's reading distance (at=3.5: halfway to the next).
  const readAt = (c) => c.d - c.read;
  const atOf = (v) => { const i = Math.max(0, Math.min(NC - 1, Math.floor(v))), j = Math.min(NC - 1, i + 1); return Math.min(MAXD, readAt(lane[i]) + (readAt(lane[j]) - readAt(lane[i])) * (v - i)); };
  if (P.has('fly')) tDist = dist = Math.min(MAXD, Math.max(0, num('fly', 0)));
  if (P.has('at')) tDist = dist = atOf(num('at', 0));

  // ---------- the readout: where you are, for the intro line and for the screenshots ----------
  let current = -2;
  function track() {
    const c = currentCard(), i = c ? c.card : -1;
    if (i !== current) {
      current = i;
      if (hintEl) hintEl.textContent = i < 0 || dist <= 6 ? HINT : `${list[i].label}, ${i + 1} of ${NC}`;
    }
    if (!c) { window.FaceDebug.current = null; return; }
    const dz = c.d - dist;
    window.FaceDebug.current = { index: i, id: list[i].id, share: +shareOf(c).toFixed(2), screen: { x: Math.round(W / 2 * (1 + c.px / (dz * tanHalf * camera.aspect))), y: Math.round(H / 2 * (1 - c.py / (dz * tanHalf))) } };
  }

  function tick() {
    const k = reduced ? 1 : 0.1;
    dist += (tDist - dist) * k; dim += (tDim - dim) * (reduced ? 1 : 0.15);
    if (Math.abs(tDist - dist) < 0.05) dist = tDist;
    camera.position.set(0, 0, -dist);
    place(smooth(dist, 0, GROW));
    uniforms.uShift.value = 1 - 0.88 * smooth(dist, 0, 320);   // the tint of the portrait lets go as you fly in
    uniforms.uFill.value = 1 - smooth(dist, 40, 240);          // the filler dots fade; the cards remain
    uniforms.uDim.value = dim;
    setFlying(dist > 6);
    track();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  place(0);
  window.FaceDebug = { dots: N, cards: cardCells.length, lane: NC, around: cardCells.length - NC, atlas: `${atlas.width}x${atlas.height}`, grid: GRID, frame, maxd: Math.round(MAXD), order: lane.map((c) => ({ id: list[c.card].id, z: Math.round(c.d), readAt: Math.round(readAt(c)), aspect: +(SLOT_W / (c.frac * SLOT_H)).toFixed(2) })), current: null };
  tick();

  addEventListener('resize', () => {
    fit(); layLane();
    renderer.setSize(W, H); camera.aspect = W / H; camera.fov = fov; camera.updateProjectionMatrix();
    uniforms.uTan.value = tanHalf; uniforms.uAsp.value = W / H; uniforms.uRead.value = fRead;
    grow = -1; place(smooth(dist, 0, GROW));
  });
};
