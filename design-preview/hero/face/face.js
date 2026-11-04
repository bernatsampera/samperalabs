(() => {
// Hero D: a face made of context.
// The portrait is sampled into a grid of monospace cells. Each cell shows one character of the site text,
// in ink at an opacity that follows the darkness of the photo. From far away the letters are texture and
// the texture is the face. Scroll or click toward a point and the letters become lines you can read.
// The mask: the wall is a neutral gray, the skin is warm (more red than blue), hair and sweater are near black.
// A cell is part of the figure when it is warm and not light, or when it is dark.
// URL params for tuning and screenshots: fs (font px), r (warmth), ds (skin darkness), dk (dark cut),
// min (lightest ink), d0 d1 g (darkness curve), zoom u v (start camera), hu hv (start hover), demo=0 (no dock demo).

document.getElementById('nav').outerHTML = window.Hero.NAV;
document.getElementById('dock').outerHTML = window.Hero.DOCK;
window.Hero.initDock({ onText: () => {}, onSubmit: () => {} });

const P = new URLSearchParams(location.search);
const num = (k, d) => (P.has(k) ? +P.get(k) : d);
const FS = num('fs', 6.5);
const RED = num('r', 0.125), DS = num('ds', 0.34), DK = num('dk', 0.58);
const D0 = num('d0', 0.42), D1 = num('d1', 0.72), MIN = num('min', 0.12), GAM = num('g', 0.8);
const BOLD_Q = num('bq', 12); // cells this dark or darker use bold type: more ink, deeper shadows
const LEVELS = [1, 2.4, 4];
const MAX = 5.5;
const FONT = `${FS}px ui-monospace, Menlo, Consolas, monospace`;
const FONT_BOLD = `bold ${FS}px ui-monospace, Menlo, Consolas, monospace`;
const ACCENT = '#1D5BFF';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const cv = document.querySelector('canvas.face');
const ctx = cv.getContext('2d');
const whereEl = document.querySelector('[data-where]');
const whereText = whereEl.querySelector('span');
const countEl = document.querySelector('[data-count]');
const backBtn = document.querySelector('[data-back]');
const REG = window.FaceFragments.regions;
const IDLE = 'Scroll into the face to read it.';

let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, CW = 0, CH = 0;
let grid = [], cells = [], buckets = [];
let cam = { s: 1, x: 0, y: 0 }, target = { s: 1, x: 0, y: 0 };
let hoverFid = -1, dirty = true, total = 0;

const img = new Image();
img.onload = () => { build(); startFromParams(); requestAnimationFrame(loop); };
img.src = window.FacePhoto;

function regionOf(u, v) {
  for (let i = 0; i < REG.length; i++) if (REG[i].test(u, v)) return i;
  return REG.length - 1;
}

function build() {
  const r = cv.getBoundingClientRect();
  W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = FONT;
  CW = ctx.measureText('0').width; CH = FS;
  cols = Math.floor(W / CW); rows = Math.floor(H / CH);

  // Sample the photo at one pixel per cell.
  const off = document.createElement('canvas'); off.width = cols; off.height = rows;
  const o = off.getContext('2d', { willReadFrequently: true });
  o.drawImage(img, 0, 0, cols, rows);
  const d = o.getImageData(0, 0, cols, rows).data;

  const darkOf = new Float32Array(cols * rows), inside = new Uint8Array(cols * rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = (y * cols + x) * 4, R = d[i], G = d[i + 1], B = d[i + 2];
    const dark = 1 - (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255;
    const warm = (R - B) / 255;
    darkOf[y * cols + x] = dark;
    inside[y * cols + x] = (warm >= RED && dark >= DS) || dark >= DK ? 1 : 0;
  }
  // Cleanup: fill one-cell holes inside the figure, drop lone specks on the wall.
  const at = (x, y) => (x < 0 || y < 0 || x >= cols || y >= rows ? 0 : inside[y * cols + x]);
  const clean = new Uint8Array(inside);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const n = at(x - 1, y) + at(x + 1, y) + at(x, y - 1) + at(x, y + 1);
    if (!inside[y * cols + x] && n >= 3) clean[y * cols + x] = 1;
    if (inside[y * cols + x] && n === 0) clean[y * cols + x] = 0;
  }

  grid = new Array(cols * rows);
  let wallCount = 0;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const k = y * cols + x, dark = darkOf[k], isIn = clean[k] === 1;
    if (!isIn) wallCount++;
    let a = 0;
    if (isIn) { const t = Math.min(1, Math.max(0, (dark - D0) / (D1 - D0))); a = MIN + (1 - MIN) * Math.pow(t, GAM); }
    grid[k] = { col: x, row: y, a, reg: isIn ? regionOf((x + .5) / cols, (y + .5) / rows) : -1, ch: '', fid: -1, q: 0 };
  }

  // Flow each region's lines through its cells, in reading order. One empty cell between lines.
  let fid = 0; total = 0;
  REG.forEach((rg, ri) => {
    const list = grid.filter((c) => c.reg === ri);
    if (!list.length) return;
    let li = 0, pos = 0, text = rg.lines[0], prev = null;
    for (const c of list) {
      // A gap in the row (another region sits in between): leave one space so words do not glue.
      if (prev && prev.row === c.row && c.col - prev.col > 1) { c.ch = ' '; prev = c; continue; }
      prev = c;
      if (pos >= text.length) { li = (li + 1) % rg.lines.length; text = rg.lines[li]; pos = 0; fid++; continue; }
      c.ch = text[pos++]; c.fid = fid;
      if (c.ch !== ' ') total++;
    }
    fid++;
  });
  cells = grid.filter((c) => c.ch && c.ch !== ' ');
  buckets = Array.from({ length: 17 }, () => []);
  for (const c of cells) { c.q = Math.max(1, Math.round(c.a * 16)); buckets[c.q].push(c); }

  countEl.innerHTML = `<b>${total.toLocaleString('en-US')}</b> characters of context`;
  window.FaceDebug = { cols, rows, total, cells: cells.length, wall: Math.round((wallCount / (cols * rows)) * 100) + '%' };
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
  backBtn.hidden = !zoomed;
  dirty = true;
}

/** Zoom to scale s1 and keep the canvas point q (css px) under the cursor. */
function zoomAt(s1, q) {
  s1 = Math.min(MAX, Math.max(1, s1));
  const s0 = target.s;
  if (!q) return setCamera(s1, W / 2, H / 2);
  const px = (q.x - W / 2) / s0 + target.x, py = (q.y - H / 2) / s0 + target.y;
  setCamera(s1, px - (q.x - W / 2) / s1, py - (q.y - H / 2) / s1);
}

function pt(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
function cellAt(q) {
  const x = (q.x - W / 2) / cam.s + cam.x, y = (q.y - H / 2) / cam.s + cam.y;
  const col = Math.floor(x / CW), row = Math.floor(y / CH);
  if (col < 0 || row < 0 || col >= cols || row >= rows) return null;
  return grid[row * cols + col];
}

function setHover(cell) {
  const fid = cell && cell.reg >= 0 ? cell.fid : -1;
  if (fid !== hoverFid) { hoverFid = fid; dirty = true; }
  if (cell && cell.reg >= 0) { whereEl.classList.add('on'); whereText.textContent = REG[cell.reg].label; }
  else { whereEl.classList.remove('on'); whereText.textContent = IDLE; }
}

function draw() {
  const { s, x, y } = cam;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (W / 2 - x * s), dpr * (H / 2 - y * s));
  ctx.font = FONT; ctx.textBaseline = 'alphabetic';
  const c0 = Math.max(0, Math.floor((x - W / (2 * s)) / CW) - 1), c1 = Math.min(cols - 1, Math.ceil((x + W / (2 * s)) / CW) + 1);
  const r0 = Math.max(0, Math.floor((y - H / (2 * s)) / CH) - 1), r1 = Math.min(rows - 1, Math.ceil((y + H / (2 * s)) / CH) + 1);
  const base = FS * 0.78;
  // Zoomed in, the lightest lines rise toward a readable gray.
  const floorQ = Math.round(Math.min(1, Math.max(0, (s - 1) / 2)) * 7);
  for (let q = 1; q <= 16; q++) {
    const b = buckets[q]; if (!b.length) continue;
    ctx.font = q >= BOLD_Q ? FONT_BOLD : FONT;
    ctx.fillStyle = `rgba(20,20,26,${(Math.max(q, floorQ) / 16).toFixed(3)})`;
    for (const c of b) {
      if (c.col < c0 || c.col > c1 || c.row < r0 || c.row > r1 || c.fid === hoverFid) continue;
      ctx.fillText(c.ch, c.col * CW, c.row * CH + base);
    }
  }
  if (hoverFid >= 0) {
    ctx.font = FONT; ctx.fillStyle = ACCENT;
    for (const c of cells) if (c.fid === hoverFid) ctx.fillText(c.ch, c.col * CW, c.row * CH + base);
  }
}

function loop() {
  const k = 0.16;
  const ds = Math.abs(Math.log(target.s) - Math.log(cam.s)), dx = target.x - cam.x, dy = target.y - cam.y;
  if (ds > 0.002 || Math.hypot(dx, dy) > 0.1) {
    cam.s = Math.exp(Math.log(cam.s) + (Math.log(target.s) - Math.log(cam.s)) * k);
    cam.x += dx * k; cam.y += dy * k;
    dirty = true;
  } else if (cam.s !== target.s || cam.x !== target.x || cam.y !== target.y) { cam = { ...target }; dirty = true; }
  if (dirty) { draw(); dirty = false; }
  requestAnimationFrame(loop);
}

function startFromParams() {
  if (P.has('zoom')) setCamera(num('zoom', 1), num('u', .5) * W, num('v', .5) * H, true);
  if (P.has('hu')) { const col = Math.floor(num('hu', .5) * cols), row = Math.floor(num('hv', .5) * rows); setHover(grid[row * cols + col]); }
  else setHover(null);
}

// Pointer: hover colours one line blue and names the region. Click steps through the zoom levels.
cv.addEventListener('mousemove', (e) => setHover(cellAt(pt(e))));
cv.addEventListener('mouseleave', () => setHover(null));
cv.addEventListener('click', (e) => {
  const next = LEVELS.find((l) => l > target.s * 1.15);
  if (next === undefined) zoomAt(1); else zoomAt(next, pt(e));
});
// Wheel: up zooms in toward the cursor. Down zooms out, and once at the face it lets the page scroll.
cv.addEventListener('wheel', (e) => {
  if (e.deltaY > 0 && target.s <= 1.001) return;
  e.preventDefault();
  zoomAt(target.s * Math.exp(-e.deltaY * 0.0022), pt(e));
}, { passive: false });
backBtn.addEventListener('click', () => zoomAt(1));
addEventListener('keydown', (e) => { if (e.key === 'Escape') zoomAt(1); });

let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (img.complete) { build(); setHover(null); } }, 150); });
})();
