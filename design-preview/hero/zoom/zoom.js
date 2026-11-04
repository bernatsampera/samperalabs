(() => {
// Hero E: the face that is its content.
// Each part of the face is typeset at rest with its own section: title and lines, in small type, repeated like
// wallpaper and clipped to the silhouette. The skin between the parts carries the general lines. The photo is
// painted into the ink: light where the skin is light, bold where the hair and the sweater are dark.
// Zooming is a pure camera zoom. No letter ever moves. The only change as you get close is the ink: the light
// and dark of the photo even out into plain text, the copy under the cursor keeps full ink and its neighbours
// fade a little. Scroll back out and the ink returns to the photo. There is no click.
// URL params: layout=grid|flow, fs (text size), s u v (start camera), open=<id> (start inside a part), hr=<id>, demo=0.

document.getElementById('nav').outerHTML = window.Hero.NAV;
document.getElementById('dock').outerHTML = window.Hero.DOCK;
window.Hero.initDock({ onText: () => {}, onSubmit: () => {} });

const P = new URLSearchParams(location.search);
const num = (k, d) => (P.has(k) ? +P.get(k) : d);
const FS = num('fs', 7);                            // text size at rest, figure px
const LAYOUT = P.get('layout') === 'flow' ? 'flow' : 'grid';   // how each part repeats its section
const LEAD = 1.0;                                   // line height at rest: tight, so the texture has no gaps
const RED = 0.125, DS = 0.34, DK = 0.58;           // the mask, measured on the photo: warm skin, or dark hair and sweater
const D0 = 0.38, D1 = 0.72, MIN = 0.14, GAM = 0.7; // ink opacity follows darkness
const MEDIUM_AT = 0.3, BOLD_AT = 0.6;              // darker than these: medium, then bold letters
const CLEAR_FROM = 1.15;                           // the ink starts to clear above this scale
const S_OPEN = 2.3, MAX = 5.5;                     // clear text at this scale, times the part's depth
const FAMILY = "Geist, 'Helvetica Neue', Arial, sans-serif";
const ATL = 64;                                    // glyph size in the atlas
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const hero = document.querySelector('.hero');
const cv = document.querySelector('canvas.face');
const ctx = cv.getContext('2d');
const whereEl = document.querySelector('[data-where]');
const whereText = whereEl.querySelector('span');
const hintEl = document.querySelector('[data-hint]');
const backBtn = document.querySelector('[data-back]');
const DEFS = window.FaceContent.regions;
const POOL = window.FaceContent.pool.join('  ') + '  ';
const HINT_IDLE = 'Scroll into the face to read it.';
const HINT_OPEN = 'Scroll down or press Esc to come back.';

let W = 0, H = 0, dpr = 1;
let atlas = null;
let letters = [];   // { x, y (baseline), gRest, gText, a0, aText, reg, copy }
let regs = [];      // per part: { def, sOpen, t, copies: Map(copyId -> bbox), focus: copyId }
let general = [];   // letters of the skin between the parts
let cam = { s: 1, x: 0, y: 0 }, target = { s: 1, x: 0, y: 0 };
let hoverReg = -1, dirty = true;

const smooth = (v, a, b) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
function regionOf(u, v) { for (let i = 0; i < DEFS.length; i++) if (DEFS[i].shape(u, v)) return i; return -1; }

const img = new Image();
img.onload = async () => {
  await Promise.all([400, 500, 700].map((w) => document.fonts.load(`${w} ${ATL}px Geist`))).catch(() => {});
  atlas = buildAtlas();
  build(); startFromParams(); requestAnimationFrame(loop);
};
img.src = window.FacePhoto;

/** One canvas with every glyph at three weights. Letters are drawn from it with drawImage, which is fast. */
function buildAtlas() {
  const set = new Set(POOL + '?');
  for (const d of DEFS) for (const b of d.blocks) for (const ch of b.title + b.lines.join('')) set.add(ch);
  const chars = [...set].filter((c) => c !== ' ');
  const weights = [400, 500, 700], padX = 6, cellH = Math.ceil(ATL * 1.3), WIDTH = 2048;
  const c = document.createElement('canvas').getContext('2d');
  const entries = [];
  for (const w of weights) { c.font = `${w} ${ATL}px ${FAMILY}`; for (const ch of chars) { const adv = c.measureText(ch).width; entries.push({ w, ch, adv, sw: Math.ceil(adv) + 2 * padX, sh: cellH }); } }
  let x = 0, y = 0;
  for (const e of entries) { if (x + e.sw > WIDTH) { x = 0; y += cellH; } e.sx = x; e.sy = y; x += e.sw; }
  const cvs = document.createElement('canvas'); cvs.width = WIDTH; cvs.height = y + cellH;
  const a = cvs.getContext('2d'); a.fillStyle = '#14141A'; a.textBaseline = 'alphabetic';
  const glyphs = {}; for (const w of weights) glyphs[w] = new Map();
  for (const e of entries) { a.font = `${e.w} ${ATL}px ${FAMILY}`; a.fillText(e.ch, e.sx + padX, e.sy + ATL); glyphs[e.w].set(e.ch, e); }
  c.font = `400 ${ATL}px ${FAMILY}`;
  const space = c.measureText(' ').width;
  return { cvs, glyphs, padX, cellH, space, get(w, ch) { return glyphs[w].get(ch) || glyphs[w].get('?'); } };
}
function advance(w, ch, fs) { return (ch === ' ' ? atlas.space : atlas.get(w, ch).adv) * fs / ATL; }
function textWidth(text, w, fs) { let x = 0; for (const ch of text) x += advance(w, ch, fs); return x; }
function glyph(g, x, baseline, fs) { const k = fs / ATL; ctx.drawImage(atlas.cvs, g.sx, g.sy, g.sw, g.sh, x - atlas.padX * k, baseline - ATL * k, g.sw * k, g.sh * k); }

function build() {
  const r = cv.getBoundingClientRect();
  W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);

  // Sample the photo on a fine grid and mask the wall out.
  const G = 200;
  const off = document.createElement('canvas'); off.width = G; off.height = G;
  const o = off.getContext('2d', { willReadFrequently: true });
  o.drawImage(img, 0, 0, G, G);
  const d = o.getImageData(0, 0, G, G).data;
  const dark = new Float32Array(G * G), inside = new Uint8Array(G * G);
  for (let k = 0; k < G * G; k++) {
    const R = d[k * 4], Gc = d[k * 4 + 1], B = d[k * 4 + 2];
    const dk = 1 - (0.2126 * R + 0.7152 * Gc + 0.0722 * B) / 255;
    dark[k] = dk;
    inside[k] = ((R - B) / 255 >= RED && dk >= DS) || dk >= DK ? 1 : 0;
  }
  const at = (x, y) => (x < 0 || y < 0 || x >= G || y >= G ? 0 : inside[y * G + x]);
  const clean = new Uint8Array(inside);
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    const n = at(x - 1, y) + at(x + 1, y) + at(x, y - 1) + at(x, y + 1);
    if (!inside[y * G + x] && n >= 3) clean[y * G + x] = 1;
    if (inside[y * G + x] && n === 0) clean[y * G + x] = 0;
  }
  const sample = (x, y) => { const gx = Math.min(G - 1, Math.max(0, Math.floor(x / W * G))), gy = Math.min(G - 1, Math.max(0, Math.floor(y / H * G))); const k = gy * G + gx; return { inside: clean[k] === 1, dark: dark[k] }; };
  const inkOf = (dk) => { const t = Math.min(1, Math.max(0, (dk - D0) / (D1 - D0))); return { a: MIN + (1 - MIN) * Math.pow(t, GAM), w: t > BOLD_AT ? 700 : t > MEDIUM_AT ? 500 : 400 }; };

  // The box of every part, from the mask.
  const boxes = DEFS.map(() => ({ x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }));
  for (let gy = 0; gy < G; gy++) for (let gx = 0; gx < G; gx++) {
    if (!clean[gy * G + gx]) continue;
    const ri = regionOf((gx + .5) / G, (gy + .5) / G); if (ri < 0) continue;
    const b = boxes[ri], x = gx / G * W, y = gy / G * H;
    b.x0 = Math.min(b.x0, x); b.y0 = Math.min(b.y0, y); b.x1 = Math.max(b.x1, x + W / G); b.y1 = Math.max(b.y1, y + H / G);
  }

  letters = []; general = [];
  const LH = FS * LEAD, rows = Math.ceil(H / LH);
  const baselineOf = (row) => row * LH + FS * 0.8, centerOf = (row) => row * LH + LH * 0.5;

  // Each part: its section (title in medium, lines in regular), repeated over its box.
  // layout=grid: one item per row, in aligned columns, like a small typeset page.
  // layout=flow: the items run on across each row, like a paragraph. Denser, so the face reads better.
  regs = DEFS.map((def, ri) => {
    const seq = def.blocks.flatMap((b) => [{ text: b.title, w: 500, a: 1 }, ...b.lines.map((l) => ({ text: l, w: 400, a: 0.85 }))]);
    const b = boxes[ri];
    const row0 = Math.floor(b.y0 / LH), row1 = Math.ceil(b.y1 / LH);
    const copies = new Map();
    const put = (x, baseline, cy, ch, item, copy) => {
      const adv = advance(item.w, ch, FS);
      if (ch === ' ') return adv;
      const cx = x + adv / 2, s = sample(cx, cy);
      if (s.inside && regionOf(cx / W, cy / H) === ri) {
        const ink = inkOf(s.dark);
        letters.push({ x, y: baseline, gRest: atlas.get(ink.w, ch), gText: atlas.get(item.w, ch), a0: ink.a, aText: item.a, reg: ri, copy });
        const cb = copies.get(copy) || { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
        cb.x0 = Math.min(cb.x0, x); cb.y0 = Math.min(cb.y0, baseline - FS); cb.x1 = Math.max(cb.x1, x + adv); cb.y1 = Math.max(cb.y1, baseline);
        copies.set(copy, cb);
      }
      return adv;
    };
    if (LAYOUT === 'flow') {
      let k = 0, pos = 0;
      for (let row = row0; row <= row1; row++) {
        const cy = centerOf(row), baseline = baselineOf(row);
        for (let x = b.x0; x < b.x1;) {
          const item = seq[k % seq.length], text = item.text + '   ';
          x += put(x, baseline, cy, text[pos], item, `${Math.floor(k / seq.length)}`);
          if (++pos >= text.length) { pos = 0; k++; }
        }
      }
    } else {
      const colW = Math.max(...seq.map((it) => textWidth(it.text, it.w, FS))) + FS * 1.2;
      for (let row = row0; row <= row1; row++) {
        const k = row - row0, item = seq[k % seq.length], block = Math.floor(k / seq.length);
        const cy = centerOf(row), baseline = baselineOf(row);
        for (let c = 0, x0 = b.x0; x0 < b.x1; c++, x0 += colW) {
          let x = x0;
          for (const ch of item.text) x += put(x, baseline, cy, ch, item, `${c}:${block}`);
        }
      }
    }
    return { def, sOpen: S_OPEN * (def.depth || 1), t: 0, copies, focus: null };
  });

  // The skin between the parts: the general lines, flowing across every row.
  let pi = 0;
  for (let row = 0; row < rows; row++) {
    const cy = centerOf(row), baseline = baselineOf(row);
    let x = 0;
    while (x < W) {
      const ch = POOL[pi++ % POOL.length];
      const adv = advance(400, ch, FS);
      if (ch !== ' ') {
        const cx = x + adv / 2, s = sample(cx, cy);
        if (s.inside && regionOf(cx / W, cy / H) < 0) { const ink = inkOf(s.dark); general.push({ x, y: baseline, gRest: atlas.get(ink.w, ch), a0: ink.a }); }
      }
      x += adv;
    }
  }

  window.FaceDebug = { letters: letters.length + general.length, regions: regs.map((r) => ({ id: r.def.id, letters: letters.filter((l) => l.reg === regs.indexOf(r)).length, copies: r.copies.size, sOpen: +r.sOpen.toFixed(2) })) };
  setCamera(1, W / 2, H / 2, true);
}

function clampCam(s, x, y) {
  if (s <= 1.001) return { s: 1, x: W / 2, y: H / 2 };
  const hx = W / (2 * s), hy = H / (2 * s);
  return { s, x: Math.min(W - hx, Math.max(hx, x)), y: Math.min(H - hy, Math.max(hy, y)) };
}
function setCamera(s, x, y, jump = false) {
  target = clampCam(s, x, y);
  if (jump || reduced) cam = { ...target };
  const zoomed = target.s > 1.05;
  cv.classList.toggle('zoomed', zoomed);
  hero.classList.toggle('in', zoomed);
  backBtn.hidden = !zoomed;
  hintEl.textContent = zoomed ? HINT_OPEN : HINT_IDLE;
  dirty = true;
}
function zoomAt(s1, q) {
  s1 = Math.min(MAX, Math.max(1, s1));
  const s0 = target.s;
  if (!q) return setCamera(s1, W / 2, H / 2);
  const px = (q.x - W / 2) / s0 + target.x, py = (q.y - H / 2) / s0 + target.y;
  setCamera(s1, px - (q.x - W / 2) / s1, py - (q.y - H / 2) / s1);
}
function pt(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
function toImage(q) { return { x: (q.x - W / 2) / cam.s + cam.x, y: (q.y - H / 2) / cam.s + cam.y }; }

/** The part the camera looks at, and inside it the copy nearest the focus point. */
function activeRegion() { return regionOf(target.x / W, target.y / H); }
function focusCopy(r) {
  let best = null, bd = 1e9;
  for (const [id, b] of r.copies) {
    const dx = Math.max(b.x0 - target.x, 0, target.x - b.x1), dy = Math.max(b.y0 - target.y, 0, target.y - b.y1);
    const d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = id; }
  }
  return best;
}

function setHover(ri) {
  if (ri === hoverReg) return;
  hoverReg = ri; dirty = true;
  if (ri >= 0) { whereEl.classList.add('on'); whereText.textContent = `${DEFS[ri].part}: ${DEFS[ri].label}`; }
  else { whereEl.classList.remove('on'); whereText.textContent = ''; }
}

function draw() {
  const { s, x, y } = cam;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (W / 2 - x * s), dpr * (H / 2 - y * s));
  const x0 = x - W / (2 * s) - FS * 2, x1 = x + W / (2 * s) + FS, y0 = y - H / (2 * s) - FS, y1 = y + H / (2 * s) + FS * 2;
  const maxT = Math.max(0, ...regs.map((r) => r.t));
  const dim = hoverReg >= 0 && s < CLEAR_FROM;

  // The skin: the photo, always. It recedes a little while a part is clear.
  const ga = (dim ? 0.55 : 1) * (1 - 0.35 * maxT);
  for (const l of general) {
    if (l.x < x0 || l.x > x1 || l.y < y0 || l.y > y1) continue;
    ctx.globalAlpha = l.a0 * ga; glyph(l.gRest, l.x, l.y, FS);
  }
  // The parts: photo ink at rest, plain text ink when clear. Same letters, same places.
  for (const l of letters) {
    if (l.x < x0 || l.x > x1 || l.y < y0 || l.y > y1) continue;
    const r = regs[l.reg], t = r.t;
    const tint = dim && l.reg !== hoverReg ? 0.55 : 1;
    const rest = l.a0 * tint * (1 - 0.35 * maxT * (1 - t));
    const near = l.copy === r.focus ? 1 : 0.55;
    const a = rest + (l.aText * near - rest) * t;
    if (a < 0.01) continue;
    ctx.globalAlpha = a;
    glyph(t < 0.5 ? l.gRest : l.gText, l.x, l.y, FS);
  }
  ctx.globalAlpha = 1;
}

function loop() {
  const k = reduced ? 1 : 0.12;
  const ds = Math.abs(Math.log(target.s) - Math.log(cam.s)), dx = target.x - cam.x, dy = target.y - cam.y;
  if (ds > 0.002 || Math.hypot(dx, dy) > 0.1) {
    cam.s = Math.exp(Math.log(cam.s) + (Math.log(target.s) - Math.log(cam.s)) * k);
    cam.x += dx * k; cam.y += dy * k; dirty = true;
  } else if (cam.s !== target.s || cam.x !== target.x || cam.y !== target.y) { cam = { ...target }; dirty = true; }
  // The ink of the part under the camera clears with the zoom, and returns as the camera leaves.
  const active = activeRegion();
  regs.forEach((r, ri) => {
    const tt = ri === active ? smooth(cam.s, CLEAR_FROM, r.sOpen * 0.9) : 0;
    const nt = reduced ? tt : r.t + (tt - r.t) * 0.15;
    if (Math.abs(nt - r.t) > 0.0005) { r.t = nt; dirty = true; } else if (r.t !== tt) { r.t = tt; dirty = true; }
    if (ri === active) { const f = focusCopy(r); if (f !== r.focus) { r.focus = f; dirty = true; } }
  });
  if (dirty) { draw(); dirty = false; }
  requestAnimationFrame(loop);
}

function startFromParams() {
  const open = P.get('open'), hr = P.get('hr');
  if (open) {
    const ri = DEFS.findIndex((d) => d.id === open);
    if (ri >= 0) {
      let cx = 0, cy = 0, n = 0;
      for (const l of letters) if (l.reg === ri) { cx += l.x; cy += l.y; n++; }
      setCamera(regs[ri].sOpen, cx / n, cy / n, true); regs[ri].t = 1; regs[ri].focus = focusCopy(regs[ri]);
    }
  }
  if (P.has('s')) setCamera(num('s', 1), num('u', .5) * W, num('v', .5) * H, true);
  if (hr) setHover(DEFS.findIndex((d) => d.id === hr));
}

// The scroll goes in and out. Up zooms toward the cursor. Down zooms out; at the face it lets the page scroll.
cv.addEventListener('wheel', (e) => {
  if (e.deltaY > 0 && target.s <= 1.001) return;
  e.preventDefault();
  zoomAt(target.s * Math.exp(-e.deltaY * 0.0022), pt(e));
}, { passive: false });
cv.addEventListener('mousemove', (e) => { if (cam.s >= CLEAR_FROM) return setHover(-1); const p = toImage(pt(e)); setHover(regionOf(p.x / W, p.y / H)); });
cv.addEventListener('mouseleave', () => setHover(-1));
backBtn.addEventListener('click', () => zoomAt(1));
addEventListener('keydown', (e) => { if (e.key === 'Escape') zoomAt(1); });

// Touch: two fingers pinch in and out.
const touches = new Map(); let pinch = null;
cv.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; touches.set(e.pointerId, pt(e)); if (touches.size === 2) { const [a, b] = [...touches.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: target.s }; } });
cv.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'touch' || !touches.has(e.pointerId)) return;
  touches.set(e.pointerId, pt(e));
  if (pinch && touches.size === 2) { const [a, b] = [...touches.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); zoomAt(pinch.s * d / pinch.d, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }); e.preventDefault(); }
}, { passive: false });
const endTouch = (e) => { touches.delete(e.pointerId); if (touches.size < 2) pinch = null; };
cv.addEventListener('pointerup', endTouch); cv.addEventListener('pointercancel', endTouch);

let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (atlas) { build(); setHover(-1); } }, 150); });
})();
