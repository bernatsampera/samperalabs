// Direction A: Survey sheet.
// Every journey is a surveyed map sheet. One seeded height field is the whole territory:
// the home index map, the MAAT sheet, the three part sheets and the card sheet are windows into it.
// One camera grammar moves between them: zoom into a sheet, pan along the route, zoom back out.
(() => {
  'use strict';
  const WD = window.WORLD, G = window.GUIDED;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = ym => { const [y, m] = ym.split('-').map(Number); return y * 12 + m - 1; };
  const month = ym => { const [y, m] = ym.split('-').map(Number); return MONTHS[m - 1] + ' ' + y; };
  const pad2 = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const slug = s => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const RM = matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- Tokens: every timing and easing is read from style.css ----------
  const CS = getComputedStyle(root);
  const tok = n => CS.getPropertyValue(n).trim();
  const tms = n => parseFloat(tok(n)) || 0;
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t;
    return x => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 40; i++) { const v = sx(t); if (Math.abs(v - x) < 1e-6) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      return sy(t);
    };
  }
  const bez = n => {
    const m = /cubic-bezier\(([^)]+)\)/.exec(tok(n));
    const v = m ? m[1].split(',').map(Number) : [.65, 0, .35, 1];
    return {fn: cubicBezier(...v), css: `cubic-bezier(${v.join(', ')})`};
  };
  const EM = bez('--ease-move'), EO = bez('--ease-out'), EI = bez('--ease-in');
  const DUR = {
    cue: tms('--dur-cue'), roll: tms('--dur-roll'), cardOut: tms('--dur-card-out'), cardIn: tms('--dur-card-in'),
    step: tms('--dur-step'), stepExtra: tms('--dur-step-extra'), enter: tms('--dur-enter'), jump: tms('--dur-jump'),
    draw: tms('--dur-draw'), drawStagger: tms('--dur-draw-stagger'), exit: tms('--dur-exit'), fly: tms('--dur-fly'),
    fade: tms('--dur-fade'), label: tms('--dur-label'),
  };

  // ---------- Content ----------
  const TONES = ['forest', 'lake', 'ochre'];
  const parts = G.seasons.slice().sort((a, b) => a.id - b.id).map((s, si) => ({
    ...s, si, slug: slug(s.name), tone: TONES[si % TONES.length],
    chapters: G.chapters.filter(c => c.season === s.id).sort((a, b) => a.date.localeCompare(b.date)),
  }));
  const latest = G.chapters.find(c => c.latest) || G.chapters[G.chapters.length - 1];
  const latestSi = parts.findIndex(p => p.id === latest.season);
  const latestStep = parts[latestSi].chapters.indexOf(latest) + 1;
  const totalChapters = parts.reduce((n, p) => n + p.chapters.length, 0);
  const worldChapter = id => { for (const j of WD.journeys) for (const c of j.chapters) if (c.id === id) return c; return null; };
  const articleOf = c => { const w = worldChapter(c.id); return (w && w.article) || null; };
  const sameYear = (a, b) => a.slice(0, 4) === b.slice(0, 4);
  const spanText = p => p.to ? (sameYear(p.from, p.to) ? `${MONTHS[+p.from.slice(5) - 1]} to ${month(p.to)}` : `${month(p.from)} to ${month(p.to)}`) : `Since ${month(p.from)}`;
  const isOpen = p => !p.to;
  const T0 = Math.min(...parts.map(p => monthIdx(p.from)));
  const T1 = Math.max(monthIdx(latest.date), ...parts.filter(p => p.to).map(p => monthIdx(p.to)));
  const TSPAN = T1 - T0 + 1;
  const mName = i => MONTHS[i % 12];
  const KNOW = WD.journeys.find(j => j.id === 'knowledge');
  const MAATW = WD.journeys.find(j => j.id === 'maat');

  // ---------- Icons (authored on a 24 grid, one stroke weight) ----------
  const ICONS = {
    heads: '<circle cx="8" cy="8.5" r="3"/><circle cx="16" cy="8.5" r="3"/><path d="M2.5 19.5c.6-3.6 2.8-5.5 5.5-5.5s4.9 1.9 5.5 5.5M13.6 14.4c.7-.3 1.5-.4 2.4-.4 2.7 0 4.9 1.9 5.5 5.5"/>',
    brain: '<path d="M12 5v14M12 5.5C11 4 9 3.6 7.6 4.6 6 4.4 4.6 5.8 4.9 7.4 3.4 8.3 3.2 10.4 4.3 11.6 3.3 13 3.7 15 5.2 15.8 5.2 17.6 6.8 19 8.6 18.6 9.6 19.8 11.2 19.6 12 18.6M12 5.5c1-1.5 3-1.9 4.4-.9 1.6-.2 3 1.2 2.7 2.8 1.5.9 1.7 3 .6 4.2 1 1.4.6 3.4-.9 4.2 0 1.8-1.6 3.2-3.4 2.8-1 1.2-2.6 1-3.4 0M8 9.5h4M12 13.5h4"/>',
    tree: '<rect x="9.5" y="2.5" width="5" height="4"/><rect x="3" y="17.5" width="5" height="4"/><rect x="9.5" y="17.5" width="5" height="4"/><rect x="16" y="17.5" width="5" height="4"/><path d="M12 6.5V17.5M5.5 17.5V12h13v5.5"/>',
    photo: '<path d="M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4"/><rect x="6.5" y="7" width="11" height="10"/><path d="m6.5 15 3.5-3.5 2.5 2.5 2-2 3 3"/><circle cx="14.6" cy="9.8" r="1"/>',
    chat: '<path d="M3 4h18v12H11l-5 4v-4H3Z"/><path d="M7 8.5h10M7 12h6"/>',
    files: '<path d="M6.5 3.5h8l3 3v11h-11Z"/><path d="M14.5 3.5v3h3M3.5 7v13.5H14M9 10.5h6M9 13.5h6"/>',
    question: '<path d="M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.2V15"/><path d="M12 18.2v.3"/><path d="M3.5 3.5h17v17h-17Z" stroke-dasharray="2.2 2.2"/>',
    save: '<path d="M4 4h13l3 3v13H4Z"/><path d="M8 4v5h8V4M8 20v-6h8v6"/>',
    blank: '<rect x="4" y="4" width="16" height="16"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2Z"/><path d="M9 4v14M15 6v14"/>',
  };
  const ico = (name, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.blank}</svg>`;
  const ARROW = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  const BACK = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>';
  const CHEV_L = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const CHEV_R = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  const FLAG = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V3"/><path d="M6 4h12l-3 4 3 4H6"/></svg>';
  const OUT_ARROW = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  // Map signs.
  const SIGN = {
    trig: '<svg class="sign" viewBox="0 0 24 24" aria-hidden="true"><path class="s-tri" d="M12 3.2 21.2 19.6H2.8Z"/><circle class="s-dot" cx="12" cy="14" r="2"/></svg>',
    start: '<svg class="sign" viewBox="0 0 24 24" aria-hidden="true"><circle class="s-ring" cx="12" cy="12" r="6.2"/><circle class="s-dot" cx="12" cy="12" r="2"/></svg>',
    summit: '<svg class="sign" viewBox="0 0 24 24" aria-hidden="true"><path class="s-peak" d="M12 8.6 19.8 21H4.2Z"/><path class="s-pole" d="M12 9V1.8"/><path class="s-flag" d="M12.4 2.2h7l-2 2.4 2 2.4h-7Z"/></svg>',
    unsurveyed: '<svg class="sign" viewBox="0 0 24 24" aria-hidden="true"><path class="s-tri s-open" d="M12 3.2 21.2 19.6H2.8Z"/></svg>',
  };
  const NORTH = '<svg class="north" viewBox="0 0 28 44" aria-hidden="true"><path class="n-l" d="M14 3 6 31l8-5Z"/><path class="n-r" d="M14 3l8 28-8-5Z"/><path class="n-n" d="M9.6 42V35l8.8 7v-7"/></svg>';

  // ---------- Terrain: seeded height field ----------
  const GX = new Float32Array(64), GY = new Float32Array(64);
  for (let i = 0; i < 64; i++) { GX[i] = Math.cos(i / 64 * Math.PI * 2); GY[i] = Math.sin(i / 64 * Math.PI * 2); }
  function hi(ix, iy, s) {
    let h = Math.imul(ix | 0, 0x27d4eb2d) ^ Math.imul(iy | 0, 0x165667b1) ^ Math.imul(s | 0, 0x9e3779b1);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function gnoise(x, y, s) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10), uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    let h = hi(ix, iy, s) & 63; const n00 = GX[h] * fx + GY[h] * fy;
    h = hi(ix + 1, iy, s) & 63; const n10 = GX[h] * (fx - 1) + GY[h] * fy;
    h = hi(ix, iy + 1, s) & 63; const n01 = GX[h] * fx + GY[h] * (fy - 1);
    h = hi(ix + 1, iy + 1, s) & 63; const n11 = GX[h] * (fx - 1) + GY[h] * (fy - 1);
    const a = n00 + (n10 - n00) * ux, b = n01 + (n11 - n01) * ux;
    return a + (b - a) * uy;
  }
  function fbm(x, y, s, oct) {
    let sum = 0, amp = 1, norm = 0, f = 1;
    for (let o = 0; o < oct; o++) { sum += amp * gnoise(x * f + o * 17.3, y * f - o * 9.1, s + o * 101); norm += amp; amp *= .5; f *= 2.03; }
    return sum / norm;
  }
  const LAKE = .2, DELTA = .034;
  const LAKES = [];
  function height(x, y) {
    const wx = fbm(x * .055 + 5.2, y * .055 + 1.3, 11, 2) * 5;
    const wy = fbm(x * .055 - 3.7, y * .055 + 8.9, 23, 2) * 5;
    let h = .53 + fbm((x + wx) / 9.5, (y + wy) / 9.5, 7, 5) * 1.3;
    for (let i = 0; i < LAKES.length; i++) {
      const L = LAKES[i], dx = x - L[0], dy = y - L[1], d2 = (dx * dx + dy * dy) / (L[2] * L[2]);
      if (d2 < 7) h -= L[3] * Math.exp(-d2 * 1.5);
    }
    return h;
  }
  function forestF(x, y, h) {
    const f = fbm(x / 4.4 + 31.7, y / 4.4 - 12.4, 303, 3);
    return Math.min(f - .1, (h - LAKE - .045) * 3, (.7 - h) * 3);
  }

  // Grid sampling, then marching squares with joined polylines.
  function sample(R, cell) {
    const nx = Math.ceil(R.w / cell) + 1, ny = Math.ceil(R.h / cell) + 1, N = nx * ny;
    const H = new Float32Array(N), F = new Float32Array(N), K = new Float32Array(N), S = new Float32Array(N);
    for (let j = 0; j < ny; j++) {
      const y = R.y + j * cell;
      for (let i = 0; i < nx; i++) {
        const x = R.x + i * cell, h = height(x, y), k = j * nx + i;
        H[k] = h; F[k] = forestF(x, y, h); K[k] = LAKE - h;
      }
    }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      const hx = (H[j * nx + Math.min(i + 1, nx - 1)] - H[j * nx + Math.max(i - 1, 0)]) / (2 * cell);
      const hy = (H[Math.min(j + 1, ny - 1) * nx + i] - H[Math.max(j - 1, 0) * nx + i]) / (2 * cell);
      S[k] = K[k] > 0 ? -1 : (hx + hy) * .7071;
    }
    return {nx, ny, x0: R.x, y0: R.y, cell, H, F, K, S};
  }
  function iso(g, v, level, pad) {
    const {nx, ny, x0, y0, cell} = g;
    const PV = level - 1;
    const val = (i, j) => (i < 0 || j < 0 || i >= nx || j >= ny) ? PV : v[j * nx + i];
    const W = nx + 2;
    const pts = new Map(), adj = new Map();
    const pt = (i, j, vert, a, b) => {
      const id = ((j + 1) * W + (i + 1)) * 2 + vert;
      if (!pts.has(id)) {
        const t = (level - a) / (b - a);
        pts.set(id, vert ? [x0 + i * cell, y0 + (j + t) * cell] : [x0 + (i + t) * cell, y0 + j * cell]);
      }
      return id;
    };
    const link = (p, q) => {
      let a = adj.get(p); if (!a) adj.set(p, a = []); a.push(q);
      let b = adj.get(q); if (!b) adj.set(q, b = []); b.push(p);
    };
    const lo = pad ? -1 : 0, hiI = pad ? nx : nx - 1, hiJ = pad ? ny : ny - 1;
    for (let j = lo; j < hiJ; j++) for (let i = lo; i < hiI; i++) {
      const a = val(i, j), b = val(i + 1, j), c = val(i + 1, j + 1), d = val(i, j + 1);
      const cs = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      if (cs === 0 || cs === 15) continue;
      const T = () => pt(i, j, 0, a, b), Rr = () => pt(i + 1, j, 1, b, c), B = () => pt(i, j + 1, 0, d, c), L = () => pt(i, j, 1, a, d);
      switch (cs) {
        case 1: case 14: link(L(), B()); break;
        case 2: case 13: link(B(), Rr()); break;
        case 3: case 12: link(L(), Rr()); break;
        case 4: case 11: link(T(), Rr()); break;
        case 6: case 9: link(T(), B()); break;
        case 7: case 8: link(L(), T()); break;
        case 5: case 10: {
          const mid = (a + b + c + d) / 4 > level;
          const aroundAC = (cs === 5) === mid;
          if (aroundAC) { link(L(), T()); link(B(), Rr()); } else { link(T(), Rr()); link(L(), B()); }
          break;
        }
      }
    }
    const used = new Set(), lines = [];
    const walk = start => {
      const line = [pts.get(start)];
      used.add(start);
      let prev = -1, curN = start, closed = false;
      for (;;) {
        const nb = adj.get(curN);
        const nxt = nb[0] !== prev ? nb[0] : nb[1];
        if (nxt === undefined) break;
        if (used.has(nxt)) { if (nxt === start) closed = true; break; }
        used.add(nxt); line.push(pts.get(nxt)); prev = curN; curN = nxt;
      }
      line.closed = closed;
      lines.push(line);
    };
    for (const [id, nb] of adj) if (nb.length === 1 && !used.has(id)) walk(id);
    for (const id of adj.keys()) if (!used.has(id)) walk(id);
    return lines;
  }
  function chaikin(line) {
    const n = line.length;
    if (n < 3) return line;
    const out = [];
    if (!line.closed) out.push(line[0]);
    const m = line.closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const p = line[i], q = line[(i + 1) % n];
      out.push([p[0] * .75 + q[0] * .25, p[1] * .75 + q[1] * .25], [p[0] * .25 + q[0] * .75, p[1] * .25 + q[1] * .75]);
    }
    if (!line.closed) out.push(line[n - 1]);
    out.closed = line.closed;
    return out;
  }
  const lineLen = l => { let s = 0; for (let i = 1; i < l.length; i++) s += Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]); return s; };
  function toD(lines, prec) {
    const f = v => v.toFixed(prec);
    let d = '';
    for (const l0 of lines) {
      const l = chaikin(l0);
      d += 'M' + f(l[0][0]) + ' ' + f(l[0][1]);
      for (let i = 1; i < l.length; i++) d += 'L' + f(l[i][0]) + ' ' + f(l[i][1]);
      if (l.closed) d += 'Z';
    }
    return d;
  }
  // Build the drawing for one region. m: contour multiplier (1 = every level, 5 = index only).
  function terrain(R, cell, m, opts = {}) {
    const g = sample(R, cell);
    const prec = cell < .15 ? 3 : 2;
    const minL = cell * 5;
    const keep = l => (l.closed ? l.length >= 6 : l.length >= 4) && lineLen(l) > minL;
    const minF = opts.minFill || minL;
    const keepF = l => l.length >= 6 && lineLen(l) > minF;
    const out = {R, cell, index: [], minor: []};
    out.lake = toD(iso(g, g.K, 0, true).filter(keepF), prec);
    out.forest = toD(iso(g, g.F, 0, true).filter(keepF), prec);
    out.shade1 = toD(iso(g, g.S, .045, true).filter(keepF), prec);
    out.shade2 = toD(iso(g, g.S, .13, true).filter(keepF), prec);
    let max = -Infinity; for (let i = 0; i < g.H.length; i++) if (g.H[i] > max) max = g.H[i];
    const step = DELTA * m;
    let rank = 0;
    for (let n = Math.ceil((LAKE + .004) / step); n * step < max; n++) {
      const lv = n * step;
      const isIndex = Math.round(lv / DELTA) % 5 === 0;
      const lines = iso(g, g.H, lv, false).filter(keep);
      if (!lines.length) continue;
      if (isIndex || !opts.minor) out.index.push({lv, d: toD(lines, prec), major: isIndex});
      else { lines.forEach(l => out.minor.push({r: rank, d: toD([l], prec)})); rank++; }
    }
    out.ranks = rank;
    return out;
  }
  const levelFor = k => k >= 60 ? 1 : k >= 15 ? 5 : 10;
  const gridFor = k => [1, 2, 5, 10, 20].find(g => g * k >= 110) || 20;
  let uid = 0;
  function terrainSVG(t, grid, extra = '') {
    const id = 'h' + (++uid);
    const R = t.R, ex = typeof extra === 'function' ? extra(id) : extra;
    let gd = '';
    for (let x = Math.ceil(R.x / grid) * grid; x <= R.x + R.w; x += grid) gd += `M${x} ${R.y.toFixed(2)}V${(R.y + R.h).toFixed(2)}`;
    for (let y = Math.ceil(R.y / grid) * grid; y <= R.y + R.h; y += grid) gd += `M${R.x.toFixed(2)} ${y}H${(R.x + R.w).toFixed(2)}`;
    const html = `<defs><pattern id="${id}" class="hatch-pat" patternUnits="userSpaceOnUse" width="8" height="8"><rect class="hatch-ln" x="0" y="0" width="1" height="8"/></pattern></defs>
      <g class="t-fill"><path class="f-sh1" d="${t.shade1}"/><path class="f-sh2" d="${t.shade2}"/><path class="f-forest" d="${t.forest}"/><path class="f-forest-edge" d="${t.forest}"/><path class="f-lake" d="${t.lake}"/></g>
      <path class="t-grid" d="${gd}"/>
      <g class="t-ct">${t.minor.map(c => `<path class="ct mn" pathLength="1" data-r="${c.r}" d="${c.d}"/>`).join('')}${t.index.map(c => `<path class="ct ${c.major ? 'ix' : 'mj'}" d="${c.d}"/>`).join('')}</g>
      <path class="f-shore" d="${t.lake}"/>
      ${ex}`;
    return {html, patId: id};
  }

  // ---------- World layout (km). The MAAT sheet holds one sub-sheet per part. ----------
  const STOP_D = 4;
  const SHEETS = [];
  {
    const yo = [2.5, 0, 4];
    let x = 0;
    parts.forEach((p, i) => { const n = p.chapters.length + 2; const w = (n - 1) * STOP_D + 6; SHEETS.push({x, y: yo[i % 3], w, h: 12}); x += w + 2; });
  }
  const bbox = rs => { const x = Math.min(...rs.map(r => r.x)), y = Math.min(...rs.map(r => r.y)); return {x, y, w: Math.max(...rs.map(r => r.x + r.w)) - x, h: Math.max(...rs.map(r => r.y + r.h)) - y}; };
  const MAATBOX = bbox(SHEETS);
  const MAAT_H = {x: MAATBOX.x - 3, y: MAATBOX.y - 4.5, w: MAATBOX.w + 6, h: MAATBOX.h + 18};
  SHEETS.forEach((R, i) => LAKES.push([R.x + R.w * .6, R.y + (i % 2 ? 11.6 : .4), 2.5, .56]));
  LAKES.push([MAATBOX.x + MAATBOX.w + 7, 2, 2.9, .6], [16, 23, 3.3, .6], [-6, 15, 2.6, .58], [40, -9, 2.6, .56], [MAATBOX.x + MAATBOX.w + 24, 15, 2.3, .56], [50, 27, 2.4, .56], [96, 4, 2.2, .55], [210, 112, 2.8, .6], [236, 104, 2.4, .56]);
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const cat = (p0, p1, p2, p3, t) => {
    const t2 = t * t, t3 = t2 * t;
    return [0, 1].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3));
  };
  // A route through stops, with one gentle bend between each pair. Returns a dense polyline.
  function makeRoute(stops, wig, seed) {
    const rnd = mulberry(seed);
    const C = [], at = [];
    stops.forEach((p, s) => {
      at.push(C.length); C.push(p);
      if (s < stops.length - 1) {
        const q = stops[s + 1], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, o = (rnd() - .5) * 2 * wig;
        C.push([(p[0] + q[0]) / 2 - dy / L * o, (p[1] + q[1]) / 2 + dx / L * o]);
      }
    });
    const P = [], nodeAt = [], N = 22;
    for (let k = 0; k < C.length - 1; k++) {
      if (at.includes(k)) nodeAt.push(P.length);
      const p0 = C[Math.max(k - 1, 0)], p1 = C[k], p2 = C[k + 1], p3 = C[Math.min(k + 2, C.length - 1)];
      for (let i = 0; i < N; i++) P.push(cat(p0, p1, p2, p3, i / N));
    }
    nodeAt.push(P.length); P.push(C[C.length - 1]);
    const cum = [0];
    for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    return {stops, P, cum, total: cum[cum.length - 1], nodeD: nodeAt.map(i => cum[i]), d: 'M' + P.map(p => p[0].toFixed(4) + ' ' + p[1].toFixed(4)).join('L')};
  }
  function pointAt(R, D) {
    D = clamp(D, 0, R.total);
    let lo = 0, hi2 = R.cum.length - 1;
    while (hi2 - lo > 1) { const mid = (lo + hi2) >> 1; if (R.cum[mid] <= D) lo = mid; else hi2 = mid; }
    const span = R.cum[hi2] - R.cum[lo] || 1, t = (D - R.cum[lo]) / span;
    return [lerp(R.P[lo][0], R.P[hi2][0], t), lerp(R.P[lo][1], R.P[hi2][1], t)];
  }
  const partStops = si => {
    const R = SHEETS[si], n = parts[si].chapters.length + 2;
    return Array.from({length: n}, (_, s) => [R.x + 3 + s * STOP_D, R.y + R.h / 2 + 1.9 * Math.sin(s * 1.25 + .6 + si * 1.7)]);
  };
  const WROUTE = parts.map((p, si) => makeRoute(partStops(si), .75, 40 + si));
  // The unsurveyed ground of an open part: beyond its newest chapter.
  const unsurveyed = si => {
    const p = parts[si];
    if (!isOpen(p)) return null;
    const R = SHEETS[si], st = WROUTE[si].stops, a = st[st.length - 2][0] + STOP_D * .3;
    return {x: a, y: R.y, w: R.x + R.w - a, h: R.h};
  };
  const surveyedD = si => isOpen(parts[si]) ? WROUTE[si].nodeD[WROUTE[si].nodeD.length - 2] : WROUTE[si].total;

  // Camera: world center (x, y) at the middle of a view, k px per km.
  const w2s = (V, cam, x, y) => [(x - cam.x) * cam.k + V.w / 2, (y - cam.y) * cam.k + V.h / 2];
  function fitCam(V, box, Z) {
    const k = Math.min(Z.w / box.w, Z.h / box.h);
    return {k, x: box.x + box.w / 2 - (Z.x + Z.w / 2 - V.w / 2) / k, y: box.y + box.h / 2 - (Z.y + Z.h / 2 - V.h / 2) / k};
  }
  function applyCam(V, cam) {
    const vw = V.w / cam.k, vh = V.h / cam.k;
    V.svg.setAttribute('viewBox', `${(cam.x - vw / 2).toFixed(4)} ${(cam.y - vh / 2).toFixed(4)} ${vw.toFixed(4)} ${vh.toFixed(4)}`);
    V.svg.style.setProperty('--k', cam.k.toFixed(4));
    if (V.pat) V.pat.setAttribute('patternTransform', `scale(${(1 / cam.k).toFixed(5)}) rotate(45)`);
  }
  const visibleRect = (V, cam, pad = 0) => ({x: cam.x - V.w / 2 / cam.k - pad, y: cam.y - V.h / 2 / cam.k - pad, w: V.w / cam.k + 2 * pad, h: V.h / cam.k + 2 * pad});
  // One continuous zoom and pan between two cameras. With different scales it zooms about the
  // fixed point of the two views; with the same scale it pans and dips out a little.
  function camLerp(A, B, t, dip = 0) {
    const la = Math.log(A.k), lb = Math.log(B.k);
    if (Math.abs(la - lb) > .02) {
      const k = Math.exp(lerp(la, lb, t));
      const fx = (A.x * A.k - B.x * B.k) / (A.k - B.k), fy = (A.y * A.k - B.y * B.k) / (A.k - B.k);
      return {k, x: fx - (fx - A.x) * A.k / k, y: fy - (fy - A.y) * A.k / k};
    }
    return {k: Math.exp(lerp(la, lb, t) - dip * Math.sin(Math.PI * t)), x: lerp(A.x, B.x, t), y: lerp(A.y, B.y, t)};
  }
  const rectOf = (V, cam, R) => { const a = w2s(V, cam, R.x, R.y), b = w2s(V, cam, R.x + R.w, R.y + R.h); return {l: a[0], t: a[1], r: b[0], b: b[1]}; };
  const lerpRect = (a, b, t) => ({l: lerp(a.l, b.l, t), t: lerp(a.t, b.t, t), r: lerp(a.r, b.r, t), b: lerp(a.b, b.b, t)});
  const clipInset = (V, r) => `inset(${Math.max(0, r.t).toFixed(1)}px ${Math.max(0, V.w - r.r).toFixed(1)}px ${Math.max(0, V.h - r.b).toFixed(1)}px ${Math.max(0, r.l).toFixed(1)}px)`;
  const routeSVG = (R, D, cls = '') => `<g class="rt ${cls}"><path class="rt-case" d="${R.d}"/><path class="rt-ahead" d="${R.d}"/><path class="rt-done" d="${R.d}" style="stroke-dasharray:${D.toFixed(4)} ${(R.total + 1).toFixed(3)}"/></g>`;

  // Terrain cache: part sheets are computed once per mode, in idle time when possible.
  const tCache = new Map();
  const cachedTerrain = (key, fn) => { if (!tCache.has(key)) tCache.set(key, fn()); return tCache.get(key); };

  // ======================================================================
  // Story frame
  // ======================================================================
  const frame = $('#story-frame'), clipEl = frame.querySelector('.sf-clip'), live = $('#sf-live');
  const V0 = {w: 0, h: 0};
  let MODE = 'desk';
  function measure() { V0.w = frame.clientWidth; V0.h = frame.clientHeight; MODE = V0.w < 720 ? 'phone' : V0.h < 560 ? 'side' : 'desk'; }
  const FULL = () => ({l: 0, t: 0, r: V0.w, b: V0.h});
  const setState = s => { frame.dataset.state = s; };
  const setFace = (el, f) => { el.style.setProperty('--fl', f.l + 'px'); el.style.setProperty('--ft', f.t + 'px'); el.style.setProperty('--fr', (V0.w - f.r) + 'px'); el.style.setProperty('--fb', (V0.h - f.b) + 'px'); };
  let running = null, cur = null, OV = null;
  function run(T, onFrame, done) {
    const t0 = performance.now();
    let raf = 0, over = false;
    const anims = [];
    const end = interrupted => { if (over) return; over = true; cancelAnimationFrame(raf); if (interrupted) anims.forEach(a => { try { a.finish(); } catch (e) { /* gone */ } }); done(interrupted); };
    const tick = now => { const ms = Math.min(T, now - t0); onFrame(ms); if (ms < T) raf = requestAnimationFrame(tick); else end(false); };
    raf = requestAnimationFrame(tick);
    const ctl = {anims, finish() { if (over) return; onFrame(T); end(true); }};
    running = ctl;
    return ctl;
  }
  const finishRunning = () => { if (running) { const r = running; running = null; r.finish(); } };
  const fadeAll = (els, from, to, o) => els.filter(Boolean).map(e => e.animate([{opacity: from}, {opacity: to}], o));

  // Rolling slots: a fixed tabular slot whose value slides up (forward) or down (back).
  function roll(el, val, dir, anims, instant) {
    if (el.dataset.v === val) return;
    el.dataset.v = val;
    const old = [...el.children];
    const nu = document.createElement('span');
    nu.textContent = val;
    el.appendChild(nu);
    if (instant || RM.matches || !old.length) { old.forEach(o => o.remove()); return; }
    old.forEach(o => {
      o.setAttribute('aria-hidden', 'true');
      const a = o.animate([{transform: 'translateY(0)'}, {transform: `translateY(${-115 * dir}%)`}], {duration: DUR.roll, easing: EO.css, fill: 'forwards'});
      a.onfinish = a.oncancel = () => o.remove();
      anims.push(a);
    });
    anims.push(nu.animate([{transform: `translateY(${115 * dir}%)`}, {transform: 'none'}], {duration: DUR.roll, easing: EO.css, fill: 'backwards'}));
  }
  function rollDigits(el, str, dir, anims, instant) {
    while (el.children.length < str.length) { const s = document.createElement('span'); s.className = 'roll d'; el.appendChild(s); }
    [...el.children].forEach((s, i) => roll(s, str[i] || '', dir, anims, instant));
  }

  // ---------- Overview: the MAAT sheet with one sub-sheet per part ----------
  function ovMetrics() {
    const W = V0.w, H = V0.h;
    if (MODE === 'phone') {
      const face = {l: 10, t: 128, r: W - 10, b: H - 168};
      return {face, Z: {x: face.l + 14, y: face.t + 16, w: face.r - face.l - 28, h: 84}, list: true};
    }
    if (MODE === 'side') {
      const face = {l: 16, t: 70, r: W - 16, b: H - 64};
      return {face, Z: {x: face.l + 24, y: face.t + 10, w: face.r - face.l - 48, h: Math.max(60, (face.b - face.t) * .34)}, list: true};
    }
    const short = H < 800;
    const face = {l: 34, t: short ? 128 : 148, r: W - 34, b: H - (short ? 118 : 138)};
    const plateH = short ? 128 : 154;
    return {face, plateH, Z: {x: face.l + 40, y: face.t + (short ? 22 : 32), w: face.r - face.l - 80, h: face.b - face.t - (short ? 22 : 32) - plateH - 22}};
  }
  function timeStrip(compact) {
    const yrs = [...new Set(Array.from({length: TSPAN}, (_, i) => Math.floor((T0 + i) / 12)))].join(' to ');
    const rows = parts.map(p => {
      const a = monthIdx(p.from) - T0, b = (p.to ? monthIdx(p.to) : T1) - T0 + 1;
      return `<div class="ts-row tone-${p.tone}"><span class="ts-name"><b>${p.si + 1}</b>${compact ? '' : `<span>${esc(p.name)}</span>`}</span><span class="ts-track"><span class="ts-bar${p.to ? '' : ' open'}" style="left:${a / TSPAN * 100}%;width:${(b - a) / TSPAN * 100}%"></span></span></div>`;
    }).join('');
    const segs = Array.from({length: TSPAN}, (_, i) => `<i class="${i % 2 ? 'w' : 'b'}"></i>`).join('');
    const labs = Array.from({length: TSPAN}, (_, i) => `<span style="left:${(i + .5) / TSPAN * 100}%">${mName(T0 + i)}</span>`).join('');
    return `<div class="tstrip${compact ? ' compact' : ''}" role="img" aria-label="Time scale: ${parts.map(p => `${p.name}, ${spanText(p)}`).join('; ')}">
      ${rows}
      <div class="ts-row ts-scale"><span class="ts-name">${compact ? '' : 'Time scale'}</span><span class="ts-track"><span class="ts-segs">${segs}</span><span class="ts-now"><span>Now</span></span></span></div>
      <div class="ts-row ts-months"><span class="ts-name">${yrs}</span><span class="ts-track">${labs}</span></div>
    </div>`;
  }
  const LEGEND_SIGNS = `
    <li><svg class="lg-route" viewBox="0 0 40 12" aria-hidden="true"><path class="c" d="M2 6h36"/><path class="d" d="M2 6h36"/></svg>Surveyed route</li>
    <li><svg class="lg-route" viewBox="0 0 40 12" aria-hidden="true"><path class="c" d="M2 6h36"/><path class="a" d="M2 6h36"/></svg>Route ahead</li>
    <li>${SIGN.trig}Chapter point</li>
    <li>${SIGN.summit}Mission</li>
    <li><span class="sw-hatch" aria-hidden="true"></span>Unsurveyed ground</li>
    <li><span class="sw-here" aria-hidden="true"></span>You are here</li>`;
  function sheetsSVG(pat, opts = {}) {
    return parts.map((p, si) => {
      const R = SHEETS[si], U = unsurveyed(si);
      return `<g class="ss tone-${p.tone}">
        ${U ? `<rect class="uns-base" x="${U.x}" y="${U.y}" width="${U.w}" height="${U.h}"/><rect class="uns" x="${U.x}" y="${U.y}" width="${U.w}" height="${U.h}" fill="url(#${pat})"/><path class="uns-lim" d="M${U.x} ${U.y}V${U.y + U.h}"/>` : ''}
        <rect class="ss-case" x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h}"/><rect class="ss-line" x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h}"/>
        ${opts.routes === false ? '' : routeSVG(WROUTE[si], surveyedD(si))}
      </g>`;
    }).join('');
  }
  const markHTML = (si, i, n, numbers) => {
    const p = parts[si], kind = i === 0 ? 'start' : i === n - 1 ? 'end' : 'trig';
    const c = p.chapters[i - 1];
    return `<span class="mk mk-${kind}${c && c.latest ? ' mk-here' : ''}${kind === 'end' && isOpen(p) ? ' open' : ''}" data-si="${si}" data-i="${i}">${SIGN[kind === 'end' ? 'summit' : kind]}${kind === 'trig' && numbers ? `<b>${i}</b>` : ''}</span>`;
  };

  function buildOverview() {
    const m = ovMetrics();
    const V = {w: V0.w, h: V0.h};
    const cam = fitCam(V, MAATBOX, m.Z);
    const el = document.createElement('div');
    el.className = 'layer ov mode-' + MODE + (MODE === 'desk' && V0.h < 800 ? ' short' : '');
    setFace(el, m.face);
    const vis = visibleRect(V, cam, 1.5);
    const t = cachedTerrain(`ov:${V.w}x${V.h}`, () => terrain(vis, 7 / cam.k, levelFor(cam.k), {minFill: 70 / cam.k}));
    const svg = terrainSVG(t, gridFor(cam.k), pat => sheetsSVG(pat));
    const numbers = MODE === 'desk';
    const marks = parts.map((p, si) => WROUTE[si].stops.map((s, i) => markHTML(si, i, WROUTE[si].stops.length, numbers)).join('')).join('');
    const entries = parts.map((p, si) => {
      const nw = p.chapters[p.chapters.length - 1];
      return `<li class="entry tone-${p.tone}" data-si="${si}">
        <p class="e-no" aria-hidden="true">${si + 1}</p>
        <div class="e-body">
          <h3 class="e-name">${esc(p.name)}</h3>
          <p class="e-mission">${esc(p.mission)}</p>
          <p class="e-meta">${spanText(p)}, ${plural(p.chapters.length, 'chapter')}</p>
          <p class="e-new">${nw.latest ? `<span class="here-dot" aria-hidden="true"></span>You are here: ${esc(nw.short)}` : `Newest: ${esc(nw.short)}, ${month(nw.date)}`}</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm enter" data-act="enter" data-si="${si}" aria-label="Enter ${esc(p.name)}">Enter${ARROW}</button>
      </li>`;
    }).join('');
    el.innerHTML = `
      <svg class="terrain" aria-hidden="true" preserveAspectRatio="none">${svg.html}</svg>
      <div class="ov-marks" aria-hidden="true">${marks}</div>
      <div class="ov-hits" aria-hidden="true">${parts.map((p, si) => `<div class="ss-hit" data-act="enter" data-si="${si}"></div>`).join('')}</div>
      <div class="ov-tags chrome" aria-hidden="true">${parts.map((p, si) => `<span class="ov-tag tone-${p.tone}" data-si="${si}">${si + 1}</span>`).join('')}</div>
      <div class="bands chrome" aria-hidden="true"><i class="b-t"></i><i class="b-b"></i><i class="b-l"></i><i class="b-r"></i></div>
      <div class="neat chrome" aria-hidden="true"><i class="n-out"></i><i class="n-in"></i></div>
      <header class="m-top ov-top chrome">
        <p class="sheet-title">${esc(G.journey.name)}</p>
        <h2 class="ov-h" tabindex="-1">${esc(G.journey.mission)}</h2>
        <p class="ov-sub">${plural(parts.length, 'part')}, ${plural(totalChapters, 'chapter')}</p>
        <div class="ov-act">
          <button type="button" class="btn btn-primary" data-act="enter" data-si="0">Start the journey${ARROW}</button>
          <button type="button" class="btn btn-secondary" data-act="now"><span class="here-dot" aria-hidden="true"></span>Jump to now</button>
        </div>
        ${MODE === 'desk' ? NORTH : ''}
      </header>
      <ul class="entries chrome">${entries}</ul>
      <footer class="m-bot ov-bot chrome">
        ${timeStrip(MODE !== 'desk')}
        ${MODE === 'desk' ? `<ul class="legend-signs">${LEGEND_SIGNS}</ul>` : ''}
      </footer>`;
    clipEl.prepend(el);
    const O = {el, m, rest: cam, cam, V, svg: el.querySelector('svg.terrain')};
    O.V.svg = O.svg;
    O.V.pat = O.svg.querySelector('.hatch-pat');
    O.marks = $$('.mk', el).map(s => ({el: s, p: WROUTE[+s.dataset.si].stops[+s.dataset.i]}));
    O.tags = $$('.ov-tag', el);
    O.hits = $$('.ss-hit', el);
    O.entries = $$('.entry', el);
    O.chrome = $$('.chrome', el);
    O.heading = $('.ov-h', el);
    renderOv(O, cam);
    if (!m.list) {
      // Each plate hangs under its sheet, like a sheet label on an index map.
      const ul = $('.entries', el);
      ul.classList.add('placed');
      O.entries.forEach((li, si) => {
        const r = rectOf(V, cam, SHEETS[si]);
        const w = Math.max(r.r - r.l, 250);
        const left = Math.min(r.l, m.face.r - 14 - w);
        li.style.left = left + 'px'; li.style.top = (r.b + 12) + 'px'; li.style.width = w + 'px';
      });
    } else {
      const ul = $('.entries', el);
      ul.style.top = (m.Z.y + m.Z.h + (MODE === 'side' ? 12 : 18)) + 'px';
    }
    return O;
  }
  function renderOv(O, cam) {
    O.cam = cam;
    applyCam(O.V, cam);
    for (const mk of O.marks) { const q = w2s(O.V, cam, mk.p[0], mk.p[1]); mk.el.style.transform = `translate(${q[0].toFixed(1)}px, ${q[1].toFixed(1)}px)`; }
    O.tags.forEach((tg, si) => { const q = w2s(O.V, cam, SHEETS[si].x, SHEETS[si].y); tg.style.transform = `translate(${q[0].toFixed(1)}px, ${q[1].toFixed(1)}px)`; });
    O.hits.forEach((h, si) => { const r = rectOf(O.V, cam, SHEETS[si]); h.style.transform = `translate(${r.l.toFixed(1)}px, ${r.t.toFixed(1)}px)`; h.style.width = (r.r - r.l).toFixed(1) + 'px'; h.style.height = (r.b - r.t).toFixed(1) + 'px'; });
  }

  // ---------- Part sheet ----------
  function pvMetrics(n) {
    const W = V0.w, H = V0.h;
    if (MODE === 'phone') {
      const face = {l: 8, t: 58, r: W - 8, b: H - 68};
      const y0 = face.t + 34, gap = clamp((H * .27) / Math.max(1, n - 1), 44, 62);
      const sy = Array.from({length: n}, (_, s) => y0 + s * gap);
      return {face, vert: true, k: 64, sx: 40, sy, panel: {l: 10, r: W - 10, t: sy[n - 1] + 40, b: face.b - 8}};
    }
    if (MODE === 'side') {
      const face = {l: 10, t: 54, r: W - 10, b: H - 62};
      const y0 = face.t + 26, gap = clamp((face.b - face.t - 52) / Math.max(1, n - 1), 32, 62);
      const sy = Array.from({length: n}, (_, s) => y0 + s * gap);
      const pl = Math.round(clamp(W * .4, 300, 380));
      return {face, vert: true, k: 64, sx: 40, sy, panel: {l: pl, r: W - 14, t: face.t + 8, b: face.b - 8}};
    }
    const short = H < 800;
    const face = {l: 34, t: short ? 62 : 70, r: W - 34, b: H - (short ? 80 : 88)};
    const pw = Math.round(clamp(W * .31, 360, 460)), gap = short ? 14 : 20;
    const panel = {l: face.r - gap - pw, t: face.t + gap, r: face.r - gap, b: face.b - gap};
    const ul = face.l, uw = panel.l - gap - ul;
    return {face, panel, vert: false, k: clamp(uw * .4 / STOP_D, 40, 170), T: {x: ul + uw * .34, y: (face.t + face.b) / 2}};
  }
  function camAt(L, D, k) {
    if (L.m.vert) return L.camStatic;
    k = k || L.m.k;
    const p = pointAt(L.route, D);
    return {k, x: p[0] - (L.m.T.x - L.V.w / 2) / k, y: p[1] - (L.m.T.y - L.V.h / 2) / k};
  }
  function partRegion(L) {
    const rs = [SHEETS[L.si]];
    if (L.m.vert) rs.push(visibleRect(L.V, L.camStatic, .5));
    else L.route.stops.forEach((s, i) => rs.push(visibleRect(L.V, camAt(L, L.route.nodeD[i], L.m.k * .8), .5)));
    const b = bbox(rs);
    return {x: b.x - 1, y: b.y - 1, w: b.w + 2, h: b.h + 2};
  }
  const stopKind = (L, i) => i === 0 ? 'start' : i === L.n - 1 ? 'end' : 'trig';
  const stopDate = (p, i, n) => i === 0 ? p.from : i === n - 1 ? (p.to || latest.date) : p.chapters[i - 1].date;
  const stopName = (p, i, n) => i === 0 ? 'Start' : i === n - 1 ? 'Mission' : p.chapters[i - 1].short;

  function buildPart(si) {
    const p = parts[si], n = p.chapters.length + 2;
    const L = {si, p, n, step: 0, D: 0, V: {w: V0.w, h: V0.h}};
    const m = L.m = pvMetrics(n);
    if (m.vert) {
      const R = SHEETS[si];
      const cx = R.x + 1.4 + (L.V.w / 2 - m.sx) / m.k, cy = R.y + 1.2 + (L.V.h / 2 - m.sy[0]) / m.k;
      L.camStatic = {k: m.k, x: cx, y: cy};
      const ws = m.sy.map((y, s) => [L.camStatic.x + (m.sx + 5 * Math.sin(s * 1.9 + si) - L.V.w / 2) / m.k, L.camStatic.y + (y - L.V.h / 2) / m.k]);
      L.route = makeRoute(ws, .12, 70 + si);
    } else L.route = WROUTE[si];
    const desk = !m.vert;
    const grid = gridFor(m.k);
    const t = cachedTerrain(`pv:${si}:${MODE}:${L.V.w}x${L.V.h}`, () => terrain(partRegion(L), 8 / m.k, 1, {minor: true}));
    L.ranks = t.ranks;
    const U = unsurveyed(si);
    const svg = terrainSVG(t, grid, pat => `${U && desk ? `<rect class="uns-base" x="${U.x}" y="${U.y - 6}" width="${U.w + 14}" height="${U.h + 12}"/><rect class="uns" x="${U.x}" y="${U.y - 6}" width="${U.w + 14}" height="${U.h + 12}" fill="url(#${pat})"/><path class="uns-lim" d="M${U.x} ${U.y - 6}V${U.y + U.h + 6}"/>` : ''}
      ${U && !desk ? (() => { const a = L.route.stops[n - 2], b = L.route.stops[n - 1]; const y = (a[1] + b[1]) / 2 + .1; return `<rect class="uns" x="${a[0] - 3}" y="${y}" width="9" height="${b[1] - y + 1.2}" fill="url(#${pat})"/><path class="uns-lim" d="M${a[0] - 3} ${y}H${a[0] + 6}"/>`; })() : ''}
      ${routeSVG(L.route, 0, 'pv-rt').replace('</g>', desk ? `<path class="rt-surv" d="${L.route.d}" style="stroke-dasharray:${surveyedD(si).toFixed(4)} ${(L.route.total + 1).toFixed(3)}"/></g>` : '</g>')}`);
    const el = document.createElement('div');
    el.className = `layer pv tone-${p.tone} mode-${MODE}${MODE === 'desk' && V0.h < 800 ? ' short' : ''}`;
    el.setAttribute('aria-label', p.name);
    el.dataset.si = si;
    setFace(el, m.face);
    const rows = p.chapters.map((c, i) => `<li><button type="button" class="lg-row stop" data-go="${i + 1}" aria-label="Chapter ${i + 1}: ${esc(c.short)}, ${month(c.date)}${c.latest ? ', you are here' : ''}"><span class="lg-sym">${SIGN.trig}<b>${i + 1}</b></span><span class="lg-name">${esc(c.short)}${c.latest ? '<span class="lg-here">You are here</span>' : ''}</span><span class="lg-date">${month(c.date)}</span></button></li>`).join('');
    const uns = U ? `<li class="lg-uns"><span class="lg-sym">${SIGN.unsurveyed}</span><span class="lg-name">Next chapter: not yet surveyed</span><span class="sw-hatch" aria-hidden="true"></span></li>` : '';
    const pts = L.route.stops.map((s, i) => {
      const kind = stopKind(L, i), c = p.chapters[i - 1];
      const nextY = L.route.stops[Math.min(i + 1, n - 1)][1], prevY = L.route.stops[Math.max(i - 1, 0)][1];
      const side = desk ? ((nextY + prevY) / 2 < s[1] - .2 ? 'b' : 't') : 'r';
      const a11y = desk ? 'tabindex="-1" aria-hidden="true"' : `aria-label="${i === 0 ? 'Start' : i === n - 1 ? 'Mission: ' + esc(p.mission) : `Chapter ${i}: ${esc(c.short)}`}, ${month(stopDate(p, i, n))}${c && c.latest ? ', you are here' : ''}"`;
      return `<button type="button" class="pt stop ${kind}${c && c.latest ? ' is-latest' : ''}" data-go="${i}" ${a11y}>
        <span class="pt-sym">${SIGN[kind === 'end' ? 'summit' : kind]}</span>
        <span class="pt-lab lab-${side}" data-side="${side}">${kind === 'trig' ? `<b class="pt-n">${i}</b>` : ''}<span class="pt-name">${esc(stopName(p, i, n))}</span><i>${kind === 'end' && isOpen(p) ? 'open' : month(stopDate(p, i, n))}</i>${c && c.latest && !desk ? '<span class="pt-here">You are here</span>' : ''}</span>
        ${c && c.latest && desk ? `<span class="pt-here lab-${side === 'b' ? 't' : 'b'}">You are here</span>` : ''}
      </button>`;
    }).join('');
    const M0 = monthIdx(p.from), M1 = monthIdx(p.to || latest.date), MN = M1 - M0 + 1;
    const segs = Array.from({length: MN}, (_, i) => `<i class="${i % 2 ? 'w' : 'b'}"></i>`).join('');
    const mlabs = Array.from({length: MN}, (_, i) => `<span style="left:${(i + .5) / MN * 100}%">${mName(M0 + i)}</span>`).join('');
    const ticks = p.chapters.map((c, i) => `<span class="sc-tick" style="left:${(monthIdx(c.date) - M0 + .5) / MN * 100}%"><b>${i + 1}</b></span>`).join('');
    el.innerHTML = `
      <svg class="terrain" aria-hidden="true" preserveAspectRatio="none">${svg.html}</svg>
      <aside class="legend chrome" aria-label="Legend: chapters on this sheet">
        <div class="lg-top">
          <p class="lg-title">Chapters on this sheet</p>
          <ol class="lg-list">${rows}${uns}</ol>
          <div class="lg-ends">
            <button type="button" class="lg-row stop start" data-go="0" aria-label="Start, ${month(p.from)}"><span class="lg-sym">${SIGN.start}</span><span class="lg-name">Start</span><span class="lg-date">${month(p.from)}</span></button>
            <button type="button" class="lg-row stop end" data-go="${n - 1}" aria-label="Mission: ${esc(p.mission)}"><span class="lg-sym">${SIGN.summit}</span><span class="lg-name">Mission</span></button>
          </div>
        </div>
        <div class="stage"></div>
        ${desk ? locatorHTML(si) : ''}
      </aside>
      <div class="pv-marks">${pts}<span class="marker" aria-hidden="true"></span></div>
      <div class="bands chrome" aria-hidden="true"><i class="b-t"></i><i class="b-b"></i><i class="b-l"></i><i class="b-r"></i></div>
      <div class="neat chrome" aria-hidden="true"><i class="n-out"></i><i class="n-in"></i></div>
      <div class="coords chrome" aria-hidden="true"></div>
      <header class="m-top pv-top chrome">
        <button type="button" class="btn btn-secondary btn-sm exit" data-act="exit">${BACK}<span>Overview</span><kbd>Esc</kbd></button>
        <p class="pv-title"><span class="pv-region">${esc(p.name)}</span><span class="pv-sheetno">${esc(G.journey.name)}, sheet ${si + 1} of ${parts.length}</span></p>
        <p class="pv-ref"><span>Point</span><a class="q-link pv-ref-a" href="#maat"></a></p>
        ${desk ? NORTH : ''}
      </header>
      <footer class="m-bot pv-bot chrome">
        <button type="button" class="btn btn-secondary nav-prev" data-act="prev" aria-label="Previous step">${CHEV_L}<span>Previous</span></button>
        <div class="pv-scale" aria-hidden="true">
          <div class="sc-bar"><span class="sc-segs">${segs}</span><span class="sc-done"></span>${ticks}</div>
          <div class="sc-labs">${mlabs}</div>
        </div>
        <p class="pv-date"><span class="roll w-mon"></span>&nbsp;<span class="roll-digits"></span></p>
        <p class="pv-prog"><span class="roll w-word"></span><span class="pg-num">&nbsp;<span class="roll-digits"></span> of ${pad2(p.chapters.length)}</span></p>
        <button type="button" class="btn btn-primary nav-next" data-act="next" aria-label="Next step"><span>Next</span>${CHEV_R}</button>
      </footer>`;
    clipEl.appendChild(el);
    Object.assign(L, {
      el, svg: el.querySelector('svg.terrain'), stage: el.querySelector('.stage'), legend: el.querySelector('.legend'),
      marks: el.querySelector('.pv-marks'), marker: el.querySelector('.marker'), pts: $$('.pt', el), rows: $$('.lg-row', el),
      prev: el.querySelector('.nav-prev'), next: el.querySelector('.nav-next'), chrome: $$('.chrome', el), labels: $$('.pt-lab, .pt-here', el),
      rDone: el.querySelector('.pv-rt .rt-done'), rSurv: el.querySelector('.rt-surv'), rt: el.querySelector('.pv-rt'), mn: $$('.ct.mn', el),
      rWord: el.querySelector('.w-word'), rNum: el.querySelector('.pg-num .roll-digits'), progNum: el.querySelector('.pg-num'),
      rMon: el.querySelector('.w-mon'), rYr: el.querySelector('.pv-date .roll-digits'), scDone: el.querySelector('.sc-done'),
      ref: el.querySelector('.pv-ref-a'), coordsEl: desk ? el.querySelector('.coords') : null, grid, M0, MN,
    });
    L.V.svg = L.svg;
    L.V.pat = L.svg.querySelector('.hatch-pat');
    L.autoPanel = MODE === 'phone';
    L.legend.style.cssText = L.autoPanel
      ? `left:${m.panel.l}px;bottom:${L.V.h - m.panel.b}px;width:${m.panel.r - m.panel.l}px;max-height:${m.panel.b - m.panel.t}px`
      : `left:${m.panel.l}px;top:${m.panel.t}px;width:${m.panel.r - m.panel.l}px;height:${m.panel.b - m.panel.t}px`;
    L.legend.classList.toggle('roomy', m.panel.b - m.panel.t > 660);
    L.cx = []; L.cy = [];
    return L;
  }
  // The sheet locator: where this sheet sits in the MAAT series, as printed in a map margin.
  function locatorHTML(si) {
    const B = MAATBOX, s = 150 / B.w;
    const r = SHEETS.map((R, i) => `<rect class="loc-s${i === si ? ' on' : ''}" x="${((R.x - B.x) * s).toFixed(1)}" y="${((R.y - B.y) * s).toFixed(1)}" width="${(R.w * s).toFixed(1)}" height="${(R.h * s).toFixed(1)}"/><text x="${((R.x - B.x) * s + 4).toFixed(1)}" y="${((R.y - B.y) * s + 12).toFixed(1)}">${i + 1}</text>`).join('');
    return `<div class="lg-loc"><svg viewBox="-2 -2 154 ${(B.h * s + 4).toFixed(1)}" aria-hidden="true">${r}</svg><p>Sheet ${si + 1} of ${parts.length} in the ${esc(G.journey.name)} series. Each sheet is one part of the journey.</p></div>`;
  }
  function renderCoords(L, cam) {
    const m = L.m, g = L.grid, vr = visibleRect(L.V, cam), xs = [], ys = [];
    for (let x = Math.ceil(vr.x / g) * g; x <= vr.x + vr.w; x += g) { const s = (x - cam.x) * cam.k + L.V.w / 2; if (s > m.face.l + 18 && s < m.face.r - 18) xs.push([x, s]); }
    for (let y = Math.ceil(vr.y / g) * g; y <= vr.y + vr.h; y += g) { const s = (y - cam.y) * cam.k + L.V.h / 2; if (s > m.face.t + 12 && s < m.face.b - 12) ys.push([y, s]); }
    const need = (pool, cls, cnt) => { while (pool.length < cnt) { const e = document.createElement('span'); e.className = cls; L.coordsEl.appendChild(e); pool.push(e); } };
    need(L.cx, 'cx', xs.length * 2); need(L.cy, 'cy', ys.length * 2);
    L.cx.forEach((e, i) => {
      const it = xs[i >> 1];
      if (!it) { e.style.display = 'none'; return; }
      e.style.display = '';
      const v = String(600 + Math.round(it[0]));
      if (e.textContent !== v) e.textContent = v;
      e.style.transform = `translate(${it[1].toFixed(1)}px, ${(i & 1 ? m.face.b + 19 : m.face.t - 18).toFixed(1)}px)`;
    });
    L.cy.forEach((e, i) => {
      const it = ys[i >> 1];
      if (!it) { e.style.display = 'none'; return; }
      e.style.display = '';
      const v = String(400 - Math.round(it[0]));
      if (e.textContent !== v) e.textContent = v;
      e.style.transform = `translate(${(i & 1 ? m.face.r + 17 : m.face.l - 17).toFixed(1)}px, ${it[1].toFixed(1)}px)`;
    });
  }
  function renderPart(L, cam, D) {
    L.cam = cam; L.D = D;
    applyCam(L.V, cam);
    L.rDone.style.strokeDasharray = `${D.toFixed(4)} ${(L.route.total + 1).toFixed(3)}`;
    L.marks.style.setProperty('--s', clamp(cam.k / L.m.k, .5, 1).toFixed(3));
    const mp = pointAt(L.route, D), q = w2s(L.V, cam, mp[0], mp[1]);
    L.marker.style.transform = `translate(${q[0].toFixed(1)}px, ${q[1].toFixed(1)}px)`;
    L.pts.forEach((b, i) => {
      const s = L.route.stops[i], r = w2s(L.V, cam, s[0], s[1]);
      b.style.transform = `translate(${r[0].toFixed(1)}px, ${r[1].toFixed(1)}px)`;
      const v = D >= L.route.nodeD[i] - .01;
      if (b.__v !== v) { b.__v = v; b.classList.toggle('visited', v); }
    });
    if (L.coordsEl) renderCoords(L, cam);
  }
  const scaleFrac = (L, step) => step === 0 ? 0 : step === L.n - 1 ? 1 : (monthIdx(L.p.chapters[step - 1].date) - L.M0 + .5) / L.MN;
  function updateControls(L, step, anims, instant, dir, delay = 0, dur = 0) {
    L.prev.disabled = step === 0;
    L.next.disabled = step === L.n - 1;
    const ch = step > 0 && step < L.n - 1;
    roll(L.rWord, step === 0 ? 'Start' : ch ? 'Chapter' : 'Mission', dir, anims, instant);
    rollDigits(L.rNum, pad2(ch ? step : 0), dir, anims, instant);
    L.progNum.classList.toggle('off', !ch);
    const ym = stopDate(L.p, step, L.n);
    roll(L.rMon, MONTHS[+ym.slice(5) - 1], dir, anims, instant);
    rollDigits(L.rYr, ym.slice(0, 4), dir, anims, instant);
    L.rows.forEach(r => { const on = +r.dataset.go === step; r.classList.toggle('cur', on); if (on) r.setAttribute('aria-current', 'step'); else r.removeAttribute('aria-current'); });
    const w0 = L.scDone.style.width || '0%', w1 = (scaleFrac(L, step) * 100).toFixed(2) + '%';
    L.scDone.style.width = w1;
    if (!instant && !RM.matches && w0 !== w1) anims.push(L.scDone.animate([{width: w0}, {width: w1}], {duration: dur, delay, easing: EM.css, fill: 'backwards'}));
  }
  // At rest every visible point label must be fully readable: flip it, or hide it.
  const OPP = {t: 'b', b: 't', r: 'l', l: 'r'};
  const setSide = (el, s) => { el.classList.remove('lab-t', 'lab-b', 'lab-r', 'lab-l'); el.classList.add('lab-' + s); };
  function fitLabels(L) {
    const fr = frame.getBoundingClientRect(), m = L.m, pan = m.panel;
    const area = {l: m.face.l + 2, t: m.face.t + 2, r: m.face.r - 2, b: m.face.b - 2};
    const rel = el => { const r = el.getBoundingClientRect(); return {l: r.left - fr.left, t: r.top - fr.top, r: r.right - fr.left, b: r.bottom - fr.top}; };
    const panTop = L.autoPanel ? L.legend.getBoundingClientRect().top - fr.top : pan.t;
    const hit = (r, q) => !(r.r <= q.l || r.l >= q.r || r.b <= q.t || r.t >= q.b);
    const P = {l: pan.l, r: pan.r, t: panTop, b: pan.b};
    const ok = r => r.l >= area.l && r.t >= area.t && r.r <= area.r && r.b <= area.b && !hit(r, P);
    L.pts.forEach(b => {
      const lab = b.querySelector('.pt-lab'), here = b.querySelector(':scope > .pt-here');
      b.classList.remove('lab-off');
      if (here) here.classList.remove('off');
      const s = rel(b.querySelector('.pt-sym')), cx = (s.l + s.r) / 2, cy = (s.t + s.b) / 2;
      const inMap = cx > area.l && cx < area.r && cy > area.t && cy < area.b && !(cx > P.l && cx < P.r && cy > P.t && cy < P.b);
      const pref = lab.dataset.side;
      if (!inMap) { setSide(lab, pref); b.classList.add('lab-off'); return; }
      const order = [...new Set([pref, OPP[pref], 'r', 'l', 't', 'b'])];
      const found = order.find(sd => { setSide(lab, sd); return ok(rel(lab)); });
      if (!found) { setSide(lab, pref); b.classList.add('lab-off'); return; }
      if (here) {
        const lr = rel(lab);
        const hs = found === 't' ? ['b'] : found === 'b' ? ['t'] : ['b', 't'];
        const hf = hs.find(sd => { setSide(here, sd); const r = rel(here); return ok(r) && !hit(r, lr); });
        if (!hf) here.classList.add('off');
      }
    });
  }
  const unfitLabels = L => L.pts.forEach(b => b.classList.remove('lab-off'));
  const setCue = (L, i, on) => { L.pts[i].classList.toggle('cue', on); L.rows.forEach(r => r.classList.toggle('cue', on && +r.dataset.go === i)); };
  function setRest(L, step) { L.pts.forEach((b, i) => b.classList.toggle('current', i === step)); }
  function pulse(L, step) {
    if (RM.matches) return;
    const b = L.pts[step];
    b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse');
    setTimeout(() => b.classList.remove('pulse'), 950);
  }

  // ---------- Stage: the step content inside the legend panel ----------
  function stageEl(L, step) {
    const p = L.p, n = L.n;
    let html;
    if (step === 0) {
      html = `<div class="op">
        <h2 class="op-name" tabindex="-1">${esc(p.name)}</h2>
        <p class="op-mission">${esc(p.mission)}</p>
        <dl class="facts">
          <div><dt>Surveyed</dt><dd>${spanText(p)}</dd></div>
          <div><dt>Chapters</dt><dd>${p.chapters.length}</dd></div>
          <div><dt>Ground ahead</dt><dd>${isOpen(p) ? 'Unsurveyed' : 'Fully surveyed'}</dd></div>
        </dl>
        <button type="button" class="btn btn-primary" data-act="next">Go to chapter 1${ARROW}</button>
      </div>`;
    } else if (step === n - 1) {
      const nx = parts[p.si + 1];
      html = `<div class="en">
        <p class="en-sign" aria-hidden="true">${SIGN.summit}</p>
        <h2 class="en-title" tabindex="-1">${esc(p.mission)}</h2>
        <p class="en-meta">${spanText(p)}, ${plural(p.chapters.length, 'chapter')}${isOpen(p) ? ' so far' : ''}.</p>
        <p class="en-note">${isOpen(p) ? 'The ground between the newest chapter and this question is not yet surveyed.' : 'Every chapter of this part is surveyed.'}</p>
        <div class="en-act">
          ${nx ? `<button type="button" class="btn btn-primary" data-act="nextseason">Next: ${esc(nx.name)}${ARROW}</button>` : ''}
          <button type="button" class="btn btn-secondary" data-act="exit">${BACK}Back to overview</button>
        </div>
      </div>`;
    } else html = cardHTML(p.chapters[step - 1], step, {here: true});
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    const node = t.content.firstElementChild;
    node.dataset.step = step;
    return node;
  }
  function cardHTML(c, num, o = {}) {
    const art = o.article !== undefined ? o.article : articleOf(c);
    const next = o.state === 'next';
    const status = next ? 'Unsurveyed' : c.latest || o.state === 'latest' ? 'Latest survey' : 'Surveyed';
    return `<article class="cc${next ? ' is-next' : ''}">
      <header class="cc-head">
        <span class="cc-num${next ? ' open' : ''}" aria-hidden="true">${next ? SIGN.unsurveyed : SIGN.trig}<b>${num}</b></span>
        <${o.tag || 'h2'} class="c-title"${o.noFocus ? '' : ' tabindex="-1"'}>${esc(c.title)}</${o.tag || 'h2'}>
        <span class="cc-ico" aria-hidden="true">${ico(c.icon, 'ico ico-ch')}</span>
      </header>
      ${(c.latest || o.state === 'latest') && o.here !== false ? '<p class="here">You are here</p>' : ''}
      <div class="cc-simple">${c.simple.map(s => `<p>${esc(s)}</p>`).join('')}</div>
      <div class="cc-learned"><p class="cc-lbl">${next ? 'What I will test' : 'What I learned'}</p><p class="cc-lt">${esc(o.learned || c.learned)}</p></div>
      <dl class="prov">
        <div><dt>Date</dt><dd>${c.date === 'next' ? 'Next' : month(c.date)}</dd></div>
        <div class="pv-src"><dt>Source</dt><dd>${art ? `<a class="q-link a-arrow${o.linkCls ? ' ' + o.linkCls : ''}" href="${esc(art.href)}">${esc(art.title)}${ARROW}</a>` : 'No article yet'}</dd></div>
        <div><dt>Status</dt><dd>${status}</dd></div>
      </dl>
    </article>`;
  }
  function swapStage(L, step, o) {
    const old = [...L.stage.children];
    const off = `translateY(${L.stage.clientHeight + 12}px)`;
    const h0 = L.autoPanel ? L.stage.offsetHeight : 0;
    const node = stageEl(L, step);
    L.stage.appendChild(node);
    if (L.autoPanel) {
      const h1 = node.offsetHeight;
      L.stage.style.height = h1 + 'px';
      if (!o.reduce && h0 !== h1) o.anims.push(L.stage.animate([{height: h0 + 'px'}, {height: h1 + 'px'}], {duration: DUR.cardIn, delay: o.at, easing: EO.css, fill: 'backwards'}));
    }
    old.forEach(e => {
      e.setAttribute('aria-hidden', 'true'); e.inert = true;
      o.anims.push(e.animate(o.reduce ? [{opacity: 1}, {opacity: 0}] : [{transform: 'none'}, {transform: off}], {duration: o.reduce ? 150 : DUR.cardOut, delay: o.reduce ? 0 : o.outAt, easing: EI.css, fill: 'forwards'}));
    });
    o.anims.push(node.animate(o.reduce ? [{opacity: 0}, {opacity: 1}] : [{transform: off}, {transform: 'none'}], {duration: o.reduce ? 200 : DUR.cardIn, delay: o.reduce ? 120 : o.at, easing: EO.css, fill: 'backwards'}));
    return old;
  }

  // ---------- Named states ----------
  function stateId() {
    if (!cur) return 'maat';
    const s = cur.step;
    if (s === 0) return `maat/${cur.p.slug}`;
    if (s === cur.n - 1) return `maat/${cur.p.slug}/mission`;
    return `maat/${slug(cur.p.chapters[s - 1].short)}`;
  }
  function parseHash(h) {
    h = decodeURIComponent((h || '').replace(/^#/, ''));
    if (h === 'maat') return {view: 'home'};
    if (!h.startsWith('maat/')) return null;
    const rest = h.slice(5);
    for (const p of parts) {
      const n = p.chapters.length + 2;
      if (rest === p.slug) return {si: p.si, step: 0};
      if (rest === p.slug + '/mission') return {si: p.si, step: n - 1};
      const ci = p.chapters.findIndex(c => slug(c.short) === rest);
      if (ci >= 0) return {si: p.si, step: ci + 1};
    }
    return null;
  }
  function setHash() {
    const id = stateId();
    if (cur) { cur.ref.textContent = id; cur.ref.setAttribute('href', '#' + id); }
    if (location.hash !== '#' + id) { try { history.replaceState(null, '', '#' + id); } catch (e) { /* file URLs may refuse */ } }
  }
  function announce() {
    if (!cur) { live.textContent = `Overview. ${G.journey.name}: ${G.journey.mission}`; return; }
    const s = cur.p, st = cur.step;
    if (st === 0) live.textContent = `${s.name}. Mission: ${s.mission}`;
    else if (st === cur.n - 1) live.textContent = `${s.name}. The mission: ${s.mission}`;
    else { const c = s.chapters[st - 1]; live.textContent = `${s.name}, chapter ${st} of ${s.chapters.length}: ${c.title}` + (c.latest ? '. You are here.' : ''); }
  }
  function focusHeading() {
    const h = cur ? [...cur.stage.querySelectorAll('[tabindex="-1"]')].pop() : OV.heading;
    if (h) h.focus({preventScroll: true});
  }

  // ---------- Transitions ----------
  // Contours draw in by elevation, the lowest first.
  function drawIn(L, at, anims) {
    L.mn.forEach(pth => anims.push(pth.animate([{strokeDashoffset: '1'}, {strokeDashoffset: '0'}], {duration: DUR.draw, delay: at + Number(pth.dataset.r) * DUR.drawStagger, easing: EO.css, fill: 'backwards'})));
    return at + L.ranks * DUR.drawStagger + DUR.draw;
  }
  function revealPart(L, at, anims) {
    const chromeT = at;
    anims.push(...fadeAll(L.chrome.filter(c => c !== L.legend), 0, 1, {duration: 380, delay: chromeT, easing: EO.css, fill: 'backwards'}));
    anims.push(L.legend.animate([{clipPath: 'inset(0 -60px 100% -60px)', transform: 'translateY(-14px)'}, {clipPath: 'inset(0 -60px -60px -60px)', transform: 'none'}], {duration: DUR.cardIn, delay: chromeT + 40, easing: EO.css, fill: 'backwards'}));
    anims.push(L.marker.animate([{opacity: 0}, {opacity: 1}], {duration: 360, delay: chromeT, easing: EO.css, fill: 'backwards'}));
    if (L.m.vert) anims.push(...fadeAll([L.rt, ...L.pts], 0, 1, {duration: 360, delay: chromeT - 120, easing: EO.css, fill: 'backwards'}));
    const labT = chromeT + DUR.label;
    anims.push(...fadeAll(L.labels, 0, 1, {duration: 320, delay: labT, easing: EO.css, fill: 'backwards'}));
    return labT + 320;
  }
  function enterPart(si, opts = {}) {
    finishRunning();
    const target = opts.target || 0;
    if (cur && cur.si === si) { goStep(target); return; }
    const reduce = RM.matches, from = cur;
    measure();
    const L = buildPart(si);
    cur = L; L.step = target;
    setState('moving');
    const anims = [];
    updateControls(L, target, anims, true, 1);
    L.stage.appendChild(stageEl(L, target));
    const D1 = L.route.nodeD[target], B = camAt(L, D1);
    OV.el.style.visibility = ''; OV.el.inert = true; OV.el.setAttribute('aria-hidden', 'true');
    let T, onFrame;
    if (reduce) {
      renderPart(L, B, D1);
      anims.push(L.el.animate([{opacity: 0}, {opacity: 1}], {duration: DUR.fade, easing: 'ease-out', fill: 'backwards'}));
      if (from) anims.push(from.el.animate([{opacity: 1}, {opacity: 0}], {duration: DUR.fade, easing: 'ease-in', fill: 'forwards'}));
      T = DUR.fade + 40; onFrame = () => {};
    } else {
      const fly = !!from;
      const A = fly ? from.cam : OV.cam;
      const Tz = fly ? DUR.fly : target ? DUR.jump : DUR.enter;
      const full = FULL();
      let dip = 0;
      if (fly) {
        const dist = Math.hypot(A.x - B.x, A.y - B.y);
        dip = clamp(Math.log(B.k * dist * 1.3 / V0.w), .3, 1.6);
        anims.push(...fadeAll([...from.chrome, ...from.labels, from.marker], 1, 0, {duration: 240, easing: EI.css, fill: 'forwards'}));
        anims.push(...fadeAll(OV.chrome, 0, 0, {duration: Tz, fill: 'both'}));
      } else {
        anims.push(...fadeAll(OV.chrome, 1, 0, {duration: 240, easing: EI.css, fill: 'forwards'}));
      }
      if (L.rSurv) anims.push(L.rSurv.animate([{opacity: fly ? 0 : 1}, {opacity: 0}], {duration: Tz * .45, delay: Tz * .25, easing: 'linear', fill: 'backwards'}));
      const drawAt = Tz * .6;
      const drawEnd = drawIn(L, drawAt, anims);
      const labEnd = revealPart(L, Tz * .8, anims);
      anims.push(L.stage.lastElementChild.animate([{transform: `translateY(${L.stage.clientHeight + 12}px)`}, {transform: 'none'}], {duration: DUR.cardIn, delay: Tz * .86, easing: EO.css, fill: 'backwards'}));
      T = Math.max(drawEnd, labEnd, Tz * .86 + DUR.cardIn);
      onFrame = ms => {
        const e = EM.fn(clamp(ms / Tz, 0, 1));
        const cam = camLerp(A, B, e, dip);
        if (ms >= Tz && !L.fitted) { L.fitted = true; renderPart(L, B, D1); fitLabels(L); }
        renderOv(OV, cam);
        const Dm = target ? lerp(0, D1, EM.fn(clamp((ms - Tz * .3) / (Tz * .7), 0, 1))) : 0;
        L.svg.style.setProperty('--rs', lerp(.7, 1, smooth(.2, 1, e)).toFixed(3));
        renderPart(L, cam, Dm);
        L.el.style.clipPath = clipInset(L.V, lerpRect(rectOf(L.V, cam, SHEETS[si]), full, smooth(.45, 1, e)));
        if (fly) {
          renderPart(from, cam, from.D);
          from.el.style.clipPath = clipInset(from.V, lerpRect(full, rectOf(from.V, cam, SHEETS[from.si]), smooth(0, .5, e)));
        }
      };
    }
    const ctl = run(T, onFrame, interrupted => {
      running = null;
      L.svg.style.removeProperty('--rs');
      renderPart(L, B, D1);
      L.el.style.clipPath = '';
      if (from) from.el.remove();
      OV.el.style.visibility = 'hidden';
      OV.el.getAnimations({subtree: true}).forEach(a => a.cancel());
      renderOv(OV, OV.rest);
      setRest(L, target);
      fitLabels(L);
      setState('idle');
      setHash();
      if (!interrupted) { announce(); focusHeading(); }
    });
    ctl.anims.push(...anims);
  }
  function exitPart() {
    if (!cur) return;
    finishRunning();
    const L = cur, reduce = RM.matches;
    cur = null;
    setState('moving');
    OV.el.style.visibility = ''; OV.el.inert = false; OV.el.removeAttribute('aria-hidden');
    const anims = [];
    let T, onFrame = () => {};
    if (reduce) {
      anims.push(L.el.animate([{opacity: 1}, {opacity: 0}], {duration: DUR.fade, easing: 'ease-in', fill: 'forwards'}));
      T = DUR.fade + 40;
    } else {
      const A = L.cam, B = OV.rest, Tz = DUR.exit, full = FULL();
      anims.push(...fadeAll([...L.chrome, ...L.labels, L.marker], 1, 0, {duration: 220, easing: EI.css, fill: 'forwards'}));
      anims.push(...fadeAll([L.svg.querySelector('.t-ct')], 1, .55, {duration: 360, easing: 'ease-out', fill: 'forwards'}));
      anims.push(...fadeAll(OV.chrome, 0, 1, {duration: 380, delay: Tz * .72, easing: EO.css, fill: 'backwards'}));
      anims.push(L.el.animate([{opacity: 1}, {opacity: 0}], {duration: 220, delay: Tz - 140, easing: 'ease-in', fill: 'forwards'}));
      if (L.rSurv) anims.push(L.rSurv.animate([{opacity: 0}, {opacity: 1}], {duration: Tz * .4, delay: Tz * .3, easing: 'linear', fill: 'both'}));
      T = Tz + 100;
      onFrame = ms => {
        const e = EM.fn(clamp(ms / Tz, 0, 1));
        const cam = camLerp(A, B, e);
        renderOv(OV, cam);
        renderPart(L, cam, L.D);
        L.el.style.clipPath = clipInset(L.V, lerpRect(full, rectOf(L.V, cam, SHEETS[L.si]), smooth(0, .55, e)));
      };
    }
    const ctl = run(T, onFrame, interrupted => {
      running = null;
      L.el.remove();
      OV.el.getAnimations({subtree: true}).forEach(a => a.cancel());
      renderOv(OV, OV.rest);
      setState('idle');
      setHash();
      if (!interrupted) { announce(); focusHeading(); }
    });
    ctl.anims.push(...anims);
  }
  function goStep(target) {
    if (!cur) return;
    const L = cur;
    target = clamp(target, 0, L.n - 1);
    finishRunning();
    if (target === L.step) { pulse(L, target); focusHeading(); return; }
    const from = L.step, reduce = RM.matches, dir = target > from ? 1 : -1;
    L.step = target;
    setState('moving');
    const anims = [];
    const cue = reduce ? 0 : DUR.cue;
    const dur = reduce ? 0 : DUR.step + DUR.stepExtra * Math.max(0, Math.abs(target - from) - 1);
    setCue(L, target, true);
    unfitLabels(L);
    updateControls(L, target, anims, reduce, dir, cue, dur);
    const swapAt = cue + Math.min(dur * .5, DUR.cardOut * .8);
    const old = swapStage(L, target, {at: swapAt, outAt: cue, anims, reduce});
    const D0 = L.D, D1 = L.route.nodeD[target];
    const dip = L.m.vert ? 0 : Math.min(.24, .07 + .05 * (Math.abs(target - from) - 1));
    const T = reduce ? 340 : Math.max(cue + dur + 80, swapAt + DUR.cardIn);
    let arrived = false;
    const ctl = run(T, ms => {
      if (reduce) { if (ms >= 120 && L.D !== D1) renderPart(L, camAt(L, D1), D1); return; }
      const t = clamp((ms - cue) / dur, 0, 1);
      const Dm = lerp(D0, D1, EM.fn(t));
      const Dc = lerp(D0, D1, EM.fn(clamp((t - .06) / .94, 0, 1)));
      renderPart(L, camAt(L, Dc, L.m.k * Math.exp(-dip * Math.sin(Math.PI * t))), Dm);
      if (!arrived && t >= 1) { arrived = true; setRest(L, target); fitLabels(L); pulse(L, target); }
    }, interrupted => {
      running = null;
      renderPart(L, camAt(L, D1), D1);
      old.forEach(o => o.remove());
      setCue(L, target, false);
      setRest(L, target);
      fitLabels(L);
      setState('idle');
      setHash();
      if (!interrupted) { announce(); focusHeading(); }
    });
    ctl.anims.push(...anims);
  }
  function jumpNow() {
    if (cur && cur.si === latestSi) { goStep(latestStep); return; }
    enterPart(latestSi, {target: latestStep});
  }
  function openInstant(si, step) {
    measure();
    const L = buildPart(si);
    cur = L; L.step = step;
    updateControls(L, step, [], true, 1);
    L.stage.appendChild(stageEl(L, step));
    renderPart(L, camAt(L, L.route.nodeD[step]), L.route.nodeD[step]);
    setRest(L, step);
    fitLabels(L);
    OV.el.style.visibility = 'hidden'; OV.el.inert = true; OV.el.setAttribute('aria-hidden', 'true');
  }

  // ---------- Events ----------
  frame.addEventListener('click', e => {
    const b = e.target.closest('[data-act], .stop');
    if (!b || !frame.contains(b)) return;
    if (b.classList.contains('stop')) { goStep(Number(b.dataset.go)); return; }
    const act = b.dataset.act;
    if (act === 'enter') enterPart(Number(b.dataset.si));
    else if (act === 'now') jumpNow();
    else if (act === 'exit') exitPart();
    else if (act === 'prev') { if (cur) goStep(cur.step - 1); }
    else if (act === 'next') { if (cur) goStep(cur.step + 1); else enterPart(0); }
    else if (act === 'nextseason') { if (cur && parts[cur.si + 1]) enterPart(cur.si + 1); }
  });
  addEventListener('keydown', e => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const a = document.activeElement;
    const inFrame = a && frame.contains(a);
    if (!inFrame) {
      if (a && a !== document.body && a !== root) return;
      const r = frame.getBoundingClientRect();
      if (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) < innerHeight * .6) return;
    }
    const onControl = a && a.closest && a.closest('button, a, input, select, textarea, [role="button"]');
    const fwd = () => { if (cur) { if (cur.step < cur.n - 1) goStep(cur.step + 1); } else enterPart(0); };
    if (e.key === 'ArrowRight') { e.preventDefault(); fwd(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (cur && cur.step > 0) goStep(cur.step - 1); }
    else if (e.key === ' ' || e.key === 'Enter') { if (onControl) return; e.preventDefault(); fwd(); }
    else if (e.key === 'Escape' || e.key === 'Home') { if (cur) { e.preventDefault(); exitPart(); } }
    else if (e.key === 'End') { e.preventDefault(); jumpNow(); }
  });
  addEventListener('hashchange', () => {
    const h = parseHash(location.hash);
    if (!h) return;
    if (h.view === 'home') { if (cur) exitPart(); return; }
    if (cur && cur.si === h.si) goStep(h.step); else enterPart(h.si, {target: h.step});
  });

  window.story = {
    seasons: parts, latestSi, latestStep,
    get view() { return cur ? 'season' : 'home'; },
    get season() { return cur ? cur.si : -1; },
    get step() { return cur ? cur.step : -1; },
    enter: si => enterPart(si), exit: exitPart, go: goStep, jumpNow,
  };

  function rebuildStory() {
    finishRunning();
    const keep = cur ? {si: cur.si, step: cur.step} : null;
    if (cur) cur.el.remove();
    cur = null;
    if (OV) OV.el.remove();
    measure();
    OV = buildOverview();
    if (keep) { openInstant(keep.si, keep.step); setHash(); }
  }
  function initStory() {
    measure();
    OV = buildOverview();
    const h = parseHash(location.hash);
    if (h && h.si !== undefined) {
      openInstant(h.si, h.step);
      setHash();
      requestAnimationFrame(() => frame.scrollIntoView({block: 'start', behavior: 'instant'}));
    } else if (h) requestAnimationFrame(() => frame.scrollIntoView({block: 'start', behavior: 'instant'}));
    setState('idle');
    // Prepare the part sheets while the page is quiet.
    const idle = window.requestIdleCallback || (f => setTimeout(f, 200));
    parts.forEach((p, si) => idle(() => {
      if (running) return;
      const m = pvMetrics(p.chapters.length + 2);
      if (m.vert) return;
      const L = {si, p, n: p.chapters.length + 2, V: {w: V0.w, h: V0.h}, m, route: WROUTE[si]};
      cachedTerrain(`pv:${si}:${MODE}:${V0.w}x${V0.h}`, () => terrain(partRegion(L), 8 / m.k, 1, {minor: true}));
    }));
  }

  // ======================================================================
  // Static sheets: shared margin coordinates
  // ======================================================================
  function marginCoords(box, V, cam, face, g, sides = 'tblr') {
    const vr = visibleRect(V, cam);
    let h = '';
    for (let x = Math.ceil(vr.x / g) * g; x <= vr.x + vr.w; x += g) {
      const s = (x - cam.x) * cam.k + V.w / 2;
      if (s < 22 || s > V.w - 22) continue;
      if (sides.includes('t')) h += `<span class="cx" style="transform:translate(${(face.l + s).toFixed(1)}px, ${(face.t - 18).toFixed(1)}px)">${600 + Math.round(x)}</span>`;
      if (sides.includes('b')) h += `<span class="cx" style="transform:translate(${(face.l + s).toFixed(1)}px, ${(face.b + 19).toFixed(1)}px)">${600 + Math.round(x)}</span>`;
    }
    for (let y = Math.ceil(vr.y / g) * g; y <= vr.y + vr.h; y += g) {
      const s = (y - cam.y) * cam.k + V.h / 2;
      if (s < 16 || s > V.h - 16) continue;
      if (sides.includes('l')) h += `<span class="cy" style="transform:translate(${(face.l - 17).toFixed(1)}px, ${(face.t + s).toFixed(1)}px)">${400 - Math.round(y)}</span>`;
      if (sides.includes('r')) h += `<span class="cy" style="transform:translate(${(face.r + 17).toFixed(1)}px, ${(face.t + s).toFixed(1)}px)">${400 - Math.round(y)}</span>`;
    }
    box.innerHTML = h;
  }
  const invRect = (V, cam, r) => ({x: cam.x + (r.x - V.w / 2) / cam.k, y: cam.y + (r.y - V.h / 2) / cam.k, w: r.w / cam.k, h: r.h / cam.k});
  const placeAbs = (el, r) => { el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; if (r.w != null) el.style.width = r.w + 'px'; if (r.h != null) el.style.height = r.h + 'px'; };

  // ======================================================================
  // Home: the sheet index map
  // ======================================================================
  const homeSec = $('#home');
  function buildHome() {
    const nw = latest;
    const kDone = KNOW.chapters.filter(c => c.status !== 'next');
    const kNew = KNOW.chapters.find(c => c.status === 'latest') || kDone[kDone.length - 1];
    const kNext = KNOW.chapters.find(c => c.status === 'next');
    const [bjj, indo] = WD.products;
    homeSec.innerHTML = `
      <div class="sh">
        <header class="sh-top hm-top">
          <h1 class="motto">${esc(WD.person.motto)}</h1>
          <div class="sh-top-r">
            <p class="sh-desig">Sheet index<br><span>samperalabs.com</span></p>
            ${NORTH}
          </div>
        </header>
        <div class="sh-face hm-face">
          <svg class="terrain" aria-hidden="true" preserveAspectRatio="none"></svg>
          <div class="hm-marks" aria-hidden="true"></div>
          <div class="hm-sheet s-maat" aria-hidden="true"><span class="hm-no">1</span></div>
          <div class="hm-sheet s-know" aria-hidden="true"><span class="hm-no">2</span></div>
          <div class="hm-regions"></div>
          <div class="plate hm-plate p-maat">
            <h2 class="pl-title">${esc(G.journey.name)}</h2>
            <p class="pl-mission">${esc(G.journey.mission)}</p>
            <ol class="pl-parts">${parts.map(p => `<li class="tone-${p.tone}"><span class="pl-key" aria-hidden="true"></span><span class="pl-rg">${esc(p.name)}</span><span class="pl-dt">${spanText(p)}</span></li>`).join('')}</ol>
            <p class="pl-meta"><b>${plural(totalChapters, 'chapter')}</b> in ${plural(parts.length, 'part')}. <span class="here-dot" aria-hidden="true"></span>Newest: ${esc(nw.title)}, ${month(nw.date)}.</p>
            <a class="btn btn-primary hm-enter" href="#story">Enter ${esc(G.journey.name)}${ARROW}</a>
          </div>
          <div class="plate hm-plate p-know">
            <h2 class="pl-title">${esc(KNOW.name)}</h2>
            <p class="pl-mission">${esc(KNOW.mission)}</p>
            <p class="pl-meta"><b>${plural(kDone.length, 'chapter')}</b>. Newest: ${esc(kNew.title)}, ${month(kNew.date)}.</p>
            <p class="pl-next"><span class="sw-hatch" aria-hidden="true"></span>Next, not yet surveyed: ${esc(kNext.title)}</p>
          </div>
          ${[bjj, indo].map((pr, i) => `<a class="hm-small s-${pr.id}" href="${esc(pr.href)}" target="_blank" rel="noopener"><span class="hm-no" aria-hidden="true">${i + 3}</span><span class="plate sm-plate"><span class="sm-name">${esc(pr.name)}${OUT_ARROW}</span><span class="sm-line">${esc(pr.line)}</span></span></a>`).join('')}
        </div>
        <footer class="sh-imp hm-imp">
          <div class="imp-who"><p class="imp-name">${esc(WD.person.name)}</p><p class="imp-role">${esc(WD.person.role)}</p></div>
          <p class="imp-line">${esc(WD.person.line)}</p>
          <div class="imp-scale">${timeStrip(true)}</div>
          <ul class="legend-signs">${LEGEND_SIGNS}</ul>
        </footer>
        <div class="sh-coords" aria-hidden="true"></div>
      </div>`;
    homeSec.querySelector('.hm-enter').addEventListener('click', e => {
      e.preventDefault();
      frame.scrollIntoView({block: 'start', behavior: RM.matches ? 'auto' : 'smooth'});
      setTimeout(() => { if (!cur && OV) OV.heading.focus({preventScroll: true}); }, RM.matches ? 0 : 700);
    });
    layoutHome();
  }
  function layoutHome() {
    const face = $('.hm-face', homeSec), sh = $('.sh', homeSec);
    const Wf = face.clientWidth, desk = Wf >= 1000, pad = desk ? 32 : 12;
    const asp = MAAT_H.w / MAAT_H.h;
    const pm = $('.p-maat', homeSec), pk = $('.p-know', homeSec);
    const sm = $$('.hm-small', homeSec);
    let maat, know, plM, plK, smalls, Hf;
    if (desk) {
      const mw = Math.round(Wf * .5), mh = Math.round(mw / asp);
      maat = {x: pad, y: pad, w: mw, h: mh};
      const kw = Math.round(Wf * .255), kh = Math.round(mh * .78);
      know = {x: maat.x + mw, y: pad + Math.round(mh * .14), w: kw, h: kh};
      plM = {x: maat.x + 24, y: maat.y + Math.round(mh * .6), w: Math.min(500, Math.round(mw * .7))};
      plK = {x: know.x + 18, y: know.y + Math.round(kh * .46), w: kw - 36};
      const sx = know.x + kw + 40, sw = Wf - sx;
      smalls = [{x: sx, y: pad, w: sw, h: 150}, {x: sx, y: pad + 150 + 28, w: sw, h: 150}];
      [pm, pk].forEach((p, i) => placeAbs(p, i ? plK : plM));
      Hf = Math.max(plM.y + pm.offsetHeight, plK.y + pk.offsetHeight, maat.y + mh) + pad + 8;
    } else {
      const w = Wf - pad * 2;
      let y = pad;
      maat = {x: pad, y, w, h: Math.round(w / asp)}; y += maat.h;
      plM = {x: pad + 10, y: y - 26, w: w - 20}; placeAbs(pm, plM); y = plM.y + pm.offsetHeight + 22;
      know = {x: pad, y, w, h: Math.round(w * .44)}; y += know.h;
      plK = {x: pad + 10, y: y - 26, w: w - 20}; placeAbs(pk, plK); y = plK.y + pk.offsetHeight + 22;
      const two = w >= 520, sw = two ? (w - 14) / 2 : w;
      smalls = [{x: pad, y, w: sw, h: 140}, two ? {x: pad + sw + 14, y, w: sw, h: 140} : {x: pad, y: y + 154, w: sw, h: 140}];
      Hf = smalls[1].y + 140 + pad;
    }
    face.style.height = Hf + 'px';
    placeAbs($('.s-maat', homeSec), maat);
    placeAbs($('.s-know', homeSec), know);
    sm.forEach((a, i) => placeAbs(a, smalls[i]));
    const V = {w: Wf, h: Hf};
    const k = maat.w / MAAT_H.w;
    const cam = {k, x: MAAT_H.x + MAAT_H.w / 2 - (maat.x + maat.w / 2 - V.w / 2) / k, y: MAAT_H.y + MAAT_H.h / 2 - (maat.y + maat.h / 2 - V.h / 2) / k};
    // The knowledge journey: six points across its sheet, the last one in unsurveyed ground.
    const KR = invRect(V, cam, know);
    const kn = KNOW.chapters.length;
    const kst = KNOW.chapters.map((c, i) => [KR.x + KR.w * (.1 + .8 * i / (kn - 1)), KR.y + KR.h * (desk ? .26 : .36) + KR.h * .1 * Math.sin(i * 1.4 + .3)]);
    const KRT = makeRoute(kst, .5, 91);
    const kDoneD = KRT.nodeD[KNOW.chapters.findIndex(c => c.status === 'next') - 1];
    const ku = {x: (kst[kn - 2][0] + kst[kn - 1][0]) / 2, y: KR.y, w: KR.x + KR.w - (kst[kn - 2][0] + kst[kn - 1][0]) / 2, h: KR.h};
    const vis = visibleRect(V, cam, 1);
    const t = cachedTerrain(`home:${Wf}x${Hf}`, () => terrain(vis, 7 / k, levelFor(k), {minFill: 90 / k}));
    const svgEl = $('.hm-face svg.terrain', homeSec);
    const svg = terrainSVG(t, gridFor(k), pat => `${sheetsSVG(pat)}
      <rect class="uns-base" x="${ku.x}" y="${ku.y}" width="${ku.w}" height="${ku.h}"/><rect class="uns" x="${ku.x}" y="${ku.y}" width="${ku.w}" height="${ku.h}" fill="url(#${pat})"/><path class="uns-lim" d="M${ku.x} ${ku.y}V${ku.y + ku.h}"/>
      ${routeSVG(KRT, kDoneD)}`);
    svgEl.innerHTML = svg.html;
    const HV = {w: V.w, h: V.h, svg: svgEl, pat: svgEl.querySelector('.hatch-pat')};
    applyCam(HV, cam);
    // Marks.
    const numbers = desk;
    let mk = parts.map((p, si) => WROUTE[si].stops.map((s, i) => markHTML(si, i, WROUTE[si].stops.length, numbers)).join('')).join('');
    mk += KNOW.chapters.map((c, i) => `<span class="mk mk-trig${c.status === 'latest' ? ' here-k' : ''}${c.status === 'next' ? ' mk-open' : ''}" data-k="${i}">${c.status === 'next' ? SIGN.unsurveyed : SIGN.trig}${numbers ? `<b>${i + 1}</b>` : ''}</span>`).join('');
    const mkBox = $('.hm-marks', homeSec);
    mkBox.innerHTML = mk;
    $$('.mk', mkBox).forEach(s => {
      const p = s.dataset.k != null ? kst[+s.dataset.k] : WROUTE[+s.dataset.si].stops[+s.dataset.i];
      const q = w2s(V, cam, p[0], p[1]);
      s.style.transform = `translate(${q[0].toFixed(1)}px, ${q[1].toFixed(1)}px)`;
    });
    // Region names of the three parts, on plates.
    $('.hm-regions', homeSec).innerHTML = parts.map((p, si) => {
      const r = rectOf(V, cam, SHEETS[si]);
      return `<span class="rg-lab tone-${p.tone}" style="left:${(r.l + 7).toFixed(1)}px;top:${(r.t + 7).toFixed(1)}px;max-width:${(r.r - r.l - 14).toFixed(0)}px">${esc(p.name)}</span>`;
    }).join('');
    // Margin coordinates.
    const fr = face.getBoundingClientRect(), sr = sh.getBoundingClientRect();
    marginCoords($('.sh-coords', homeSec), V, cam, {l: fr.left - sr.left, t: fr.top - sr.top, r: fr.right - sr.left, b: fr.bottom - sr.top}, gridFor(k), desk ? 'tblr' : 'lr');
  }

  // ======================================================================
  // Chapter card section
  // ======================================================================
  const cardSec = $('#card');
  function buildCards() {
    const pDone = parts.find(p => p.chapters.some(c => c.article)) ;
    const done = G.chapters.find(c => c.id === 'maat-2') || pDone.chapters[0];
    const dPart = parts.find(p => p.id === done.season), dNum = dPart.chapters.indexOf(done) + 1;
    const lPart = parts[latestSi];
    const nxt = KNOW.chapters.find(c => c.status === 'next');
    const nNum = KNOW.chapters.indexOf(nxt) + 1;
    const test = (nxt.sections || []).find(s => /test/i.test(s.h));
    const art = articleOf(done);
    cardSec.innerHTML = `
      <div class="sh">
        <header class="sh-top cd-top">
          <h2 id="card-h" class="sec-title">Chapter card</h2>
          <p class="sec-line">The legend panel in its three states. A past chapter, the newest chapter, and the next one, which still sits in unsurveyed ground.</p>
        </header>
        <div class="sh-face cd-face">
          <svg class="terrain" aria-hidden="true" preserveAspectRatio="none"></svg>
          <div class="cd-row">
            <figure class="cd" data-card-state="done"><div class="panel">${cardHTML(done, dNum, {noFocus: true, tag: 'h3'})}</div><figcaption class="cd-cap">Past chapter: ${esc(dPart.name)}, chapter ${dNum} of ${dPart.chapters.length}</figcaption></figure>
            <figure class="cd" data-card-state="latest"><div class="panel">${cardHTML(latest, latestStep, {noFocus: true, tag: 'h3'})}</div><figcaption class="cd-cap">Newest chapter: ${esc(lPart.name)}, chapter ${latestStep} of ${lPart.chapters.length}</figcaption></figure>
            <figure class="cd" data-card-state="next"><div class="panel">${cardHTML(nxt, nNum, {noFocus: true, tag: 'h3', state: 'next', article: null, learned: test ? test.p : nxt.learned})}</div><figcaption class="cd-cap">Next chapter: ${esc(KNOW.name)}, chapter ${nNum}, not yet surveyed</figcaption></figure>
          </div>
        </div>
        <footer class="sh-imp cd-links">
          <p class="lk-title">Source link</p>
          <div class="lk-row">
            <div class="lk"><p class="lk-name">Default</p><a class="q-link a-arrow" href="${esc(art.href)}">${esc(art.title)}${ARROW}</a></div>
            <div class="lk"><p class="lk-name">Hover (forced copy)</p><a class="q-link a-arrow is-hover" href="${esc(art.href)}" tabindex="-1">${esc(art.title)}${ARROW}</a></div>
            <div class="lk"><p class="lk-name">Keyboard focus (forced copy)</p><a class="q-link a-arrow is-focus" href="${esc(art.href)}" tabindex="-1">${esc(art.title)}${ARROW}</a></div>
          </div>
        </footer>
      </div>`;
    layoutCards();
  }
  function layoutCards() {
    const face = $('.cd-face', cardSec);
    const V = {w: face.clientWidth, h: face.clientHeight};
    const k = clamp(V.w / 46, 14, 34);
    const cam = {k, x: 228, y: 112};
    const nx = $('[data-card-state="next"]', cardSec);
    const fr = face.getBoundingClientRect(), nr = nx.getBoundingClientRect();
    const r = {x: nr.left - fr.left - 26, y: -40, w: nr.width + 52, h: V.h + 80};
    if (V.w < 720) { r.x = -40; r.y = nr.top - fr.top - 22; r.w = V.w + 80; r.h = nr.height + 44; }
    const U = invRect(V, cam, r);
    const t = cachedTerrain(`card:${V.w}x${V.h}`, () => terrain(visibleRect(V, cam, 1), 7 / k, levelFor(k), {minFill: 90 / k}));
    const svgEl = $('svg.terrain', face);
    svgEl.innerHTML = terrainSVG(t, gridFor(k), pat => `<rect class="uns-base" x="${U.x}" y="${U.y}" width="${U.w}" height="${U.h}"/><rect class="uns" x="${U.x}" y="${U.y}" width="${U.w}" height="${U.h}" fill="url(#${pat})"/>`).html;
    applyCam({w: V.w, h: V.h, svg: svgEl, pat: svgEl.querySelector('.hatch-pat')}, cam);
  }

  // ======================================================================
  // System sheet: conventional signs
  // ======================================================================
  const sysSec = $('#system');
  const hexOf = v => { const s = tok(v); if (/^#/.test(s)) return s.toUpperCase(); const m = s.match(/\d+(\.\d+)?/g); return m ? '#' + m.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join('').toUpperCase() : s; };
  const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  function buildSystem() {
    const C = [
      ['Paper', '--color-paper', 'Map ground, margins, panels', '--color-ink', '--color-paper', 'Ink on paper'],
      ['Ink', '--color-ink', 'Type, neatlines, grid, signs', '--color-paper', '--color-ink', 'Paper on ink'],
      ['Ink, second', '--color-ink-soft', 'Second text on paper', '--color-ink-soft', '--color-paper', 'On paper'],
      ['Trail red', '--color-trail', 'Route, marker, You are here, primary action', '--color-paper', '--color-trail', 'Paper on red'],
      ['Trail red, deep', '--color-trail-deep', 'Primary hover, red text', '--color-trail-deep', '--color-paper', 'On paper'],
      ['Lake fill', '--color-lake-fill', 'Lakes, tint of part 2', '--color-lake-ink', '--color-lake-fill', 'Lake ink on fill'],
      ['Lake line', '--color-lake-line', 'Shorelines, focus ring', '--color-lake-line', '--color-paper', 'On paper'],
      ['Lake ink', '--color-lake-ink', 'Missions (water names), part 2', '--color-lake-ink', '--color-paper', 'On paper'],
      ['Contour', '--color-contour', 'Contour lines', '--color-ink', '--color-contour', 'Ink on contour'],
      ['Index contour', '--color-contour-index', 'Every fifth contour', '--color-ink', '--color-contour-index', 'Ink on index'],
      ['Ochre fill', '--color-ochre-fill', 'Tint of part 3', '--color-ochre-ink', '--color-ochre-fill', 'Ochre ink on fill'],
      ['Ochre ink', '--color-ochre-ink', 'Part 3 names', '--color-ochre-ink', '--color-paper', 'On paper'],
      ['Forest fill', '--color-forest-fill', 'Forest, tint of part 1', '--color-forest-ink', '--color-forest-fill', 'Forest ink on fill'],
      ['Forest ink', '--color-forest-ink', 'Part 1 names', '--color-forest-ink', '--color-paper', 'On paper'],
      ['Hillshade 1', '--color-shade-1', 'Slopes away from the light', '--color-ink', '--color-shade-1', 'Ink on shade'],
      ['Hillshade 2', '--color-shade-2', 'Steep slopes', '--color-ink', '--color-shade-2', 'Ink on shade'],
      ['Hatch', '--color-hatch', 'Unsurveyed ground, lines only', '--color-hatch', '--color-paper', 'Graphic, not text'],
    ];
    const colors = C.map(([n, v, use, fg, bg, pl]) => {
      const r = ratio(hexOf(fg), hexOf(bg));
      return `<li class="col">
        <span class="col-sw" style="background:var(${v})"></span>
        <span class="col-name">${n}<span class="col-hex">${hexOf(v)}</span></span>
        <span class="col-use">${use}</span>
        <span class="col-pair" style="background:var(${bg});color:var(${r < 4.5 ? '--color-ink' : fg})">${pl}</span>
        <span class="col-ratio">${r.toFixed(1)} : 1</span>
      </li>`;
    }).join('');
    const ch = G.chapters.find(c => c.id === 'maat-2');
    const TYPES = [
      ['Display', 'Fira Sans Extra Condensed 700', 't-display', WD.person.motto],
      ['Sheet title', 'Fira Sans Condensed 700', 't-sheet', G.journey.name],
      ['Region name', 'Fira Sans Condensed 600, spaced capitals', 't-region', parts[1].name],
      ['Mission', 'Fira Sans 400 italic, lake ink', 't-mission', G.journey.mission],
      ['Chapter name', 'Fira Sans 600', 't-heading', ch.title],
      ['Body', 'Fira Sans 400', 't-body', ch.simple[0]],
      ['Label', 'Fira Sans 500, tabular figures', 't-label', 'Chapter 02 of 03, Jun 2026'],
      ['Margin figures', 'Fira Sans 500, tabular figures', 't-margin', '612  614  616  618'],
    ];
    const types = TYPES.map(([r, f, c, s]) => `<li class="ty"><p class="ty-meta"><b>${r}</b><span>${f}</span><span class="ty-size" data-for="${c}"></span></p><p class="ty-s ${c}">${esc(s)}</p></li>`).join('');
    const SP = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const space = SP.map(i => `<li><span class="sp-name">--space-${i}</span><span class="sp-bar" style="width:var(--space-${i})"></span><span class="sp-val">${tok('--space-' + i)}</span></li>`).join('');
    const icons = ['heads', 'brain', 'tree', 'photo', 'chat', 'files'].map(n => `<li>${ico(n, 'ico ico-lg')}<span>${n}</span></li>`).join('')
      + [['arrow', ARROW], ['back', BACK], ['chevron left', CHEV_L], ['chevron right', CHEV_R], ['flag', FLAG]].map(([n, s]) => `<li>${s.replace('class="ico"', 'class="ico ico-lg"')}<span>${n}</span></li>`).join('')
      + [['triangulation point', SIGN.trig], ['start', SIGN.start], ['mission summit', SIGN.summit], ['unsurveyed point', SIGN.unsurveyed]].map(([n, s]) => `<li class="ic-sign">${s}<span>${n}</span></li>`).join('');
    const btn = (cls, label, st) => `<button type="button" class="btn ${cls}${st === 'hover' ? ' is-hover' : st === 'focus' ? ' is-focus' : ''}"${st === 'disabled' ? ' disabled' : ' tabindex="-1"'}>${label}</button>`;
    const states = ['default', 'hover', 'focus', 'disabled'];
    const buttons = [['btn-primary', `Start the journey${ARROW}`, 'Primary'], ['btn-secondary', `${BACK}Back to overview`, 'Secondary'], ['btn-quiet', 'Read the article', 'Quiet']]
      .map(([c, l, n]) => `<tr><th scope="row">${n}</th>${states.map(s => `<td>${btn(c, l, s)}</td>`).join('')}</tr>`).join('');
    const MOT = [
      ['cue', '--dur-cue', '--ease-out', 'The next label lights before the camera moves.'],
      ['step', '--dur-step', '--ease-move', 'The camera pans along the route. The red line extends.'],
      ['enter', '--dur-enter', '--ease-move', 'A sub-sheet zooms to fill the frame.'],
      ['draw', '--dur-draw', '--ease-out', 'Contours draw in by elevation, --dur-draw-stagger apart.'],
      ['card', '--dur-card-in', '--ease-out', 'The card leaves into the margin (--dur-card-out, --ease-in). The new card rises.'],
      ['roll', '--dur-roll', '--ease-out', 'Numbers roll in their fixed slots.'],
      ['fade', '--dur-fade', 'linear', 'Reduced motion: every change is a short crossfade.'],
    ];
    const motion = MOT.map(([id, d, e, txt]) => `<li class="mo" data-demo="${id}">
      <div class="mo-meta"><p class="mo-tok"><b>${d}</b> ${tok(d)}</p><p class="mo-ease">${e === 'linear' ? 'linear' : `${e} ${tok(e)}`}</p><p class="mo-txt">${txt}</p></div>
      <div class="mo-demo" aria-hidden="true">${demoHTML(id)}</div>
      <button type="button" class="btn btn-quiet mo-play" data-demo="${id}">Replay</button>
    </li>`).join('');
    sysSec.innerHTML = `
      <div class="sh">
        <header class="sh-top sy-top">
          <h2 id="system-h" class="sec-title">Conventional signs</h2>
          <p class="sec-line">The design system of the survey sheet. Every value is a custom property in style.css, named by its role.</p>
        </header>
        <div class="sh-face sy-face">
          <div class="sy-grid">
            <section class="sg sg-color" data-tokens="color"><h3 class="sg-h">Colour</h3><p class="sg-note">The printed colours of the sheet. Ratios are measured from the tokens.</p><ul class="cols">${colors}</ul></section>
            <section class="sg sg-type" data-tokens="type"><h3 class="sg-h">Type</h3><p class="sg-note">Fira Sans family. Chapter names upright, missions in italic like water names, part names in spaced capitals like regions.</p><ul class="tys">${types}</ul></section>
            <section class="sg" data-tokens="space"><h3 class="sg-h">Space</h3><ul class="sps">${space}</ul></section>
            <section class="sg" data-tokens="radius"><h3 class="sg-h">Radius</h3>
              <ul class="rads"><li><span class="rd rd-0"></span><b>--radius-sheet</b> ${tok('--radius-sheet')}<span>Sheets, panels, plates</span></li><li><span class="rd rd-c"></span><b>--radius-control</b> ${tok('--radius-control')}<span>Buttons and fields</span></li><li><span class="rd rd-m"></span><b>Marker</b> circle<span>Only the position marker is round</span></li></ul></section>
            <section class="sg" data-tokens="border"><h3 class="sg-h">Border</h3>
              <ul class="bds"><li><span class="bd bd-neat"></span><b>Neatline</b> ${tok('--rule-neat-outer')} and ${tok('--rule-neat-inner')}, ${tok('--neat-gap')} apart<span>Map face, legend panel</span></li><li><span class="bd bd-rule"></span><b>--rule-control</b> ${tok('--rule-control')}<span>Secondary button</span></li><li><span class="bd bd-hair"></span><b>--rule-hair</b> ${tok('--rule-hair')}<span>Plates, grid, dividers</span></li><li><span class="bd bd-focus"></span><b>--focus-ring</b> ${tok('--focus-ring')}<span>Lake blue, offset ${tok('--focus-offset')}</span></li></ul></section>
            <section class="sg" data-tokens="depth"><h3 class="sg-h">Depth</h3><p class="sg-rule">The map is flat. Only the legend panel lifts, with one soft shadow.</p>
              <div class="dps"><div class="dp dp-0"><b>Level 0</b><span>Map face. No shadow.</span></div><div class="dp dp-1"><b>Level 1</b><span>Legend panel. ${tok('--shadow-panel')}</span></div></div></section>
            <section class="sg sg-btn" data-tokens="button"><h3 class="sg-h">Buttons</h3>
              <table class="bt"><thead><tr><th></th>${states.map(s => `<th scope="col">${s[0].toUpperCase() + s.slice(1)}</th>`).join('')}</tr></thead><tbody>${buttons}</tbody></table></section>
            <section class="sg" data-tokens="link"><h3 class="sg-h">Links</h3>
              <p class="lk-inline">Each chapter names its source. The second chapter comes from <a class="q-link" href="${esc(articleOf(ch).href)}">${esc(articleOf(ch).title)}</a>, one step away.</p>
              <p><a class="q-link a-arrow" href="${esc(articleOf(ch).href)}">Read the full chapter${ARROW}</a></p></section>
            <section class="sg sg-icon" data-tokens="icon"><h3 class="sg-h">Icons and signs</h3><p class="sg-note">One 24 grid, one 1.75 stroke, square ends. Signs are filled geometry.</p><ul class="ics">${icons}</ul></section>
            <section class="sg sg-motion" data-tokens="motion"><h3 class="sg-h">Motion</h3><p class="sg-note">One grammar: zoom into a sheet, pan along the route, zoom back out. Nothing moves in a straight line at constant speed.</p><ul class="mos">${motion}</ul></section>
            <section class="sg sg-layout" data-tokens="layout"><h3 class="sg-h">Layout</h3>
              <div class="ly-cols" aria-hidden="true">${Array.from({length: 12}, (_, i) => `<span>${i + 1}</span>`).join('')}</div>
              <p class="ly-note"><b>--max-w</b> ${tok('--max-w')}, <b>--cols</b> ${tok('--cols')}, <b>--gutter</b> ${tok('--gutter')}, sheet margin <b>--margin-sheet</b> ${tok('--margin-sheet')}.</p>
              <ul class="bps">
                <li><b>Phone</b><span>under 720 px wide</span>Vertical route, card as a bottom panel.</li>
                <li><b>Short landscape</b><span>under 560 px tall</span>Route at the side, card at the right.</li>
                <li><b>Laptop</b><span>under 800 px tall</span>Compact margins and type.</li>
                <li><b>Desktop</b><span>from 720 px wide</span>Map face with the legend panel at the right.</li>
              </ul></section>
          </div>
        </div>
      </div>`;
    $$('.ty-size', sysSec).forEach(s => { const e = $('.' + s.dataset.for, sysSec); const cs = getComputedStyle(e); s.textContent = `${Math.round(parseFloat(cs.fontSize))} / ${Math.round(parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2)} px`; });
    sysSec.addEventListener('click', e => { const b = e.target.closest('.mo-play'); if (b) playDemo(b.dataset.demo); });
  }
  function demoHTML(id) {
    if (id === 'cue' || id === 'step') return `<svg class="dm-route" viewBox="0 0 220 40"><path class="c" d="M10 26 C60 6 120 40 210 18"/><path class="a" d="M10 26 C60 6 120 40 210 18"/><path class="d" pathLength="1" d="M10 26 C60 6 120 40 210 18"/></svg><span class="dm-lab">2 The Brain</span><span class="dm-dot"></span>`;
    if (id === 'enter') return `<span class="dm-sheet"></span><span class="dm-full"></span>`;
    if (id === 'draw') return `<svg class="dm-ct" viewBox="0 0 220 44">${[0, 1, 2, 3, 4].map(i => `<path pathLength="1" d="M4 ${36 - i * 7} C60 ${20 - i * 6} 120 ${44 - i * 7} 216 ${24 - i * 5}"/>`).join('')}</svg>`;
    if (id === 'card') return `<span class="dm-slot"><span class="dm-card a">Chapter 1</span><span class="dm-card b">Chapter 2</span></span>`;
    if (id === 'roll') return `<span class="dm-roll"><span>Chapter <span class="roll-digits"><span class="roll d" data-v="0"><span>0</span></span><span class="roll d" data-v="1"><span>1</span></span></span> of 03</span></span>`;
    return `<span class="dm-x"><span class="a">Overview</span><span class="b">Chapter 1</span></span>`;
  }
  let demoN = 1;
  function playDemo(id) {
    const box = $(`.mo[data-demo="${id}"] .mo-demo`, sysSec);
    if (!box) return;
    box.getAnimations({subtree: true}).forEach(a => a.cancel());
    const reduce = RM.matches;
    const fade = el => el.animate([{opacity: 0}, {opacity: 1}], {duration: DUR.fade, easing: 'linear'});
    if (reduce && id !== 'fade') { fade(box); return; }
    if (id === 'cue' || id === 'step') {
      const lab = $('.dm-lab', box), d = $('.d', box), dot = $('.dm-dot', box), path = $('.c', box);
      const cue = id === 'cue' ? DUR.cue * 4 : DUR.cue;
      lab.animate([{background: 'var(--color-trail)', color: 'var(--color-paper)'}, {background: 'var(--color-trail)', color: 'var(--color-paper)'}], {duration: cue + DUR.step, easing: 'linear'});
      d.animate([{strokeDashoffset: '1'}, {strokeDashoffset: '0'}], {duration: DUR.step, delay: cue, easing: EM.css, fill: 'backwards'});
      const L = path.getTotalLength(), K = 24;
      const svg = $('svg', box), sc = svg.getBoundingClientRect().width / 220;
      const frames = Array.from({length: K + 1}, (_, i) => { const p = path.getPointAtLength(L * i / K); return {transform: `translate(${(p.x * sc).toFixed(1)}px, ${(p.y * sc).toFixed(1)}px)`}; });
      dot.animate(frames, {duration: DUR.step, delay: cue, easing: EM.css, fill: 'both'});
    } else if (id === 'enter') {
      $('.dm-full', box).animate([{clipPath: 'inset(30% 58% 38% 18%)'}, {clipPath: 'inset(0 0 0 0)'}], {duration: DUR.enter, easing: EM.css, fill: 'backwards'});
    } else if (id === 'draw') {
      $$('path', box).forEach((p, i) => p.animate([{strokeDashoffset: '1'}, {strokeDashoffset: '0'}], {duration: DUR.draw, delay: i * DUR.drawStagger * 4, easing: EO.css, fill: 'backwards'}));
    } else if (id === 'card') {
      $('.dm-card.a', box).animate([{transform: 'none'}, {transform: 'translateY(110%)'}], {duration: DUR.cardOut, easing: EI.css, fill: 'forwards'});
      $('.dm-card.b', box).animate([{transform: 'translateY(110%)'}, {transform: 'none'}], {duration: DUR.cardIn, delay: DUR.cardOut * .6, easing: EO.css, fill: 'backwards'});
    } else if (id === 'roll') {
      demoN = demoN % 3 + 1;
      rollDigits($('.roll-digits', box), pad2(demoN), 1, [], false);
    } else {
      const a = $('.dm-x .a', box), b = $('.dm-x .b', box);
      a.animate([{opacity: 1}, {opacity: 0}], {duration: DUR.fade, easing: 'linear', fill: 'forwards'});
      b.animate([{opacity: 0}, {opacity: 1}], {duration: DUR.fade, easing: 'linear', fill: 'backwards'});
    }
  }

  // ======================================================================
  // Init
  // ======================================================================
  let lastW = 0, lastH = 0;
  async function init() {
    try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* fonts optional */ }
    buildHome();
    buildCards();
    buildSystem();
    initStory();
    lastW = innerWidth; lastH = frame.clientHeight;
  }
  let rsT = 0;
  addEventListener('resize', () => {
    clearTimeout(rsT);
    rsT = setTimeout(() => {
      if (innerWidth === lastW && frame.clientHeight === lastH) return;
      lastW = innerWidth; lastH = frame.clientHeight;
      layoutHome();
      layoutCards();
      rebuildStory();
    }, 160);
  });
  init();
})();
