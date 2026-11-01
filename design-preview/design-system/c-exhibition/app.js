(() => {
  'use strict';
  const G = window.GUIDED, WD = window.WORLD;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const ym = d => d.split('-').map(Number);
  const monthLong = d => { const [y, m] = ym(d); return MONTH[m - 1] + ' ' + y; };
  const monthShort = d => { const [y, m] = ym(d); return MON[m - 1] + ' ' + y; };
  const monthIdx = d => { const [y, m] = ym(d); return y * 12 + m - 1; };
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

  // ---------- Tokens, read once from style.css ----------
  const css = getComputedStyle(root);
  const tok = name => css.getPropertyValue(name).trim();
  const msTok = name => parseFloat(tok(name)) || 0;
  const DUR = {flood: msTok('--dur-flood'), walk: msTok('--dur-walk'), extra: msTok('--dur-walk-extra'), roll: msTok('--dur-roll'), set: msTok('--dur-set'), stagger: msTok('--dur-stagger'), fade: msTok('--dur-fade')};
  const EASE = {move: tok('--ease-move'), out: tok('--ease-out'), in: tok('--ease-in'), fade: tok('--ease-fade')};
  const PARALLAX = parseFloat(tok('--parallax-far')) || .14;
  function bezier(str) {
    const n = (str.match(/[\d.]+/g) || [.65, 0, .35, 1]).map(Number);
    const [x1, y1, x2, y2] = n;
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
  const easeMove = bezier(EASE.move);
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- Icons: crisp, square caps, one line weight ----------
  const ICONS = {
    heads: '<circle cx="13" cy="16" r="6"/><circle cx="35" cy="16" r="6"/><path d="M4 41v-5a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v5M26 41v-5a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v5"/>',
    brain: '<path d="M10 31C5 29 3 23 6 18C8 12 15 9 21 10C26 7 34 8 38 12C43 15 45 21 42 26C40 29 36 30 33 29C30 32 24 34 18 33C15 33 12 33 10 31Z"/><path d="M33 29C38 29 41 32 39 35C37 37 32 37 30 34M27 33L29 41"/><path d="M25 10C23 14 27 16 25 21M13 26C18 23 23 25 29 22M9 20C12 19 14 22 17 21M33 16C36 15 38 18 41 17"/>',
    tree: '<rect x="20" y="5" width="8" height="8"/><rect x="8" y="21" width="8" height="8"/><rect x="32" y="21" width="8" height="8"/><rect x="2" y="37" width="8" height="8"/><rect x="14" y="37" width="8" height="8"/><rect x="26" y="37" width="8" height="8"/><rect x="38" y="37" width="8" height="8"/><path d="M24 13v4M12 17h24M12 17v4M36 17v4M12 29v4M6 33h12M6 33v4M18 33v4M36 29v4M30 33h12M30 33v4M42 33v4"/>',
    photo: '<path d="M18 11l6-5 6 5"/><rect x="6" y="11" width="36" height="29"/><circle cx="17" cy="20" r="3"/><path d="M6 35l10-9 7 6 6-5 13 10"/>',
    chat: '<path d="M6 8h36v25H22l-9 8v-8H6Z"/><path d="M13 17h22M13 24h14"/>',
    files: '<path d="M14 6h17l7 7v21"/><path d="M8 13h17l7 7v22H8Z"/><path d="M25 13v7h7M13 30h14M13 36h10"/>',
  };
  const UI = {
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    back: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
    chevL: '<path d="M15 5l-7 7 7 7"/>',
    chevR: '<path d="M9 5l7 7-7 7"/>',
    flag: '<path d="M6 22V3M6 4h13l-3.5 4.5L19 13H6"/>',
    ext: '<path d="M7 17L17 7M9 7h8v8"/>',
    up: '<path d="M12 20V5M6 11l6-6 6 6"/>',
  };
  const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 48 48" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const ui = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${UI[name]}</svg>`;
  const HERE = '<svg class="ico-here" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2Z"/></svg>';
  const ARROW = ui('arrow', 'ico-fwd'), BACK = ui('back', 'ico-bwd');

  // ---------- Data ----------
  const seasons = G.seasons.slice().sort((a, b) => a.id - b.id).map((s, si) => ({
    ...s, si,
    chapters: G.chapters.filter(c => c.season === s.id).sort((a, b) => a.date.localeCompare(b.date)),
  }));
  const latest = G.chapters.find(c => c.latest) || G.chapters[G.chapters.length - 1];
  const latestSi = seasons.findIndex(s => s.id === latest.season);
  const latestStep = seasons[latestSi].chapters.indexOf(latest) + 1;
  const totalChapters = seasons.reduce((n, s) => n + s.chapters.length, 0);
  const worldMaat = WD.journeys.find(j => j.id === 'maat');
  const worldK = WD.journeys.find(j => j.id === 'knowledge');
  const articleFor = c => {
    if (!c.article) return null;
    const w = worldMaat && worldMaat.chapters.find(x => x.id === c.id);
    return {title: c.article.title, href: (w && w.article && w.article.href) || '#card'};
  };
  const datesLong = s => {
    if (!s.to) return 'Since ' + monthLong(s.from);
    const [y1, m1] = ym(s.from), [y2, m2] = ym(s.to);
    return y1 === y2 ? `${MONTH[m1 - 1]} to ${MONTH[m2 - 1]} ${y2}` : `${monthLong(s.from)} to ${monthLong(s.to)}`;
  };
  const datesShort = s => {
    if (!s.to) return 'Since ' + monthShort(s.from);
    const [y1, m1] = ym(s.from), [y2, m2] = ym(s.to);
    return y1 === y2 ? `${MON[m1 - 1]} to ${MON[m2 - 1]} ${y2}` : `${monthShort(s.from)} to ${monthShort(s.to)}`;
  };
  const rgbHex = c => {
    const m = c.match(/\d+(\.\d+)?/g);
    if (!m) return c;
    return '#' + m.slice(0, 3).map(v => Math.round(+v).toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  // =====================================================================
  // Home: the entrance wall
  // =====================================================================
  function renderHome() {
    const P = WD.person;
    const parts = seasons.map(s => `<li class="paint-${s.si + 1}"><i></i>${esc(s.name)}<span>${plural(s.chapters.length, 'chapter')}</span></li>`).join('');
    $('#ent-grid').innerHTML = `
      <h1 class="ent-title t-display" id="home-title">${esc(P.motto)}</h1>
      <div class="ent-credit">
        <p class="credit">${esc(P.name)}, ${esc(P.role)}</p>
        <p class="intro">${esc(P.line)}</p>
        <p class="intro-more">${esc(P.mottoLong)}</p>
      </div>
      <div class="ent-maat">
        <h2>${esc(G.journey.name)}</h2>
        <p class="m-mission">${esc(G.journey.mission)}</p>
        <ol class="m-parts" aria-label="Three galleries">${parts}</ol>
        <p class="m-newest">Newest chapter, <time datetime="${latest.date}">${monthLong(latest.date)}</time>: <b>${esc(latest.title)}</b></p>
        <a class="btn btn-primary" href="#story" id="enter-maat">Enter ${esc(G.journey.name)}${ARROW}</a>
      </div>
      <div class="ent-door" aria-hidden="true"><i class="d1"></i><i class="d2"></i><i class="d3"></i><i class="d4"></i></div>
      <figure class="ent-plan">
        ${homePlanSVG()}
        <figcaption>Floor plan. ${esc(G.journey.name)} is the main gallery, in three rooms. ${esc(worldK.name)} is the second gallery. The two vitrines in the corridor link out.</figcaption>
      </figure>`;
    $('#enter-maat').addEventListener('click', () => {
      requestAnimationFrame(() => { const h = $('#ov-title'); if (h && !cur) h.focus({preventScroll: true}); });
    });
  }

  function homePlanSVG() {
    const hexOf = v => tok(v).toUpperCase();
    const PAINT = [1, 2, 3].map(i => ({bg: hexOf(`--paint-${i}`), fg: hexOf(`--paint-${i}-ink`)}));
    const INK = hexOf('--color-ink'), FLOOR = hexOf('--color-floor'), WALL = hexOf('--color-panel'), BOX = hexOf('--color-blackbox'), ONBOX = hexOf('--color-on-blackbox');
    const X0 = 8, X1 = 552, YT = 60, YM = 262, YC = 342, YB = 486;
    const counts = seasons.map(s => s.chapters.length + 2);
    const sum = counts.reduce((a, b) => a + b, 0);
    const xs = [X0];
    counts.forEach(c => xs.push(xs[xs.length - 1] + (X1 - X0) * c / sum));
    const wrap = (text, max) => {
      const words = text.split(' '), lines = [''];
      words.forEach(w => { const l = lines[lines.length - 1]; if (l && (l + ' ' + w).length > max) lines.push(w); else lines[lines.length - 1] = l ? l + ' ' + w : w; });
      return lines;
    };
    let fills = '', text = '';
    seasons.forEach((s, i) => {
      const x = xs[i], w = xs[i + 1] - xs[i], p = PAINT[i];
      fills += `<rect x="${x}" y="${YT}" width="${w}" height="${YM - YT}" fill="${p.bg}"/>`;
      const max = Math.floor((w - 28) / 8.2);
      const lines = wrap(s.name, max);
      text += `<g fill="${p.fg}" data-contrast-bg="${p.bg}">
        <text class="pl-num" x="${x + 16}" y="${YT + 42}">${s.si + 1}</text>
        ${lines.map((l, k) => `<text class="pl-name" x="${x + 16}" y="${YT + 70 + k * 19}">${esc(l)}</text>`).join('')}
        <text class="pl-meta" x="${x + 16}" y="${YT + 76 + lines.length * 19}">${plural(s.chapters.length, 'chapter')}</text>
      </g>`;
      if (i === latestSi) {
        const tx = x + 14, ty = YM - 48;
        text += `<g data-contrast-bg="${hexOf('--color-now')}"><rect x="${tx}" y="${ty}" width="104" height="26" fill="${hexOf('--color-now')}" stroke="${INK}" stroke-width="2"/><path d="M${tx + 10} ${ty + 7}l6 11h-12Z" fill="${INK}"/><text class="pl-name" x="${tx + 21}" y="${ty + 18}" fill="${INK}">You are here</text></g>`;
      }
    });
    fills += `<rect x="${X0}" y="${YM}" width="${X1 - X0}" height="${YC - YM}" fill="${FLOOR}"/>`;
    fills += `<rect x="${X0}" y="${YC}" width="${200 - X0}" height="${YB - YC}" fill="${FLOOR}"/>`;
    fills += `<rect x="200" y="${YC}" width="${X1 - 200}" height="${YB - YC}" fill="${BOX}"/>`;
    const kDone = worldK.chapters.filter(c => c.status !== 'next').length;
    text += `<g fill="${ONBOX}" data-contrast-bg="${BOX}">
      <text class="pl-big" x="220" y="${YC + 38}">${esc(worldK.name)}</text>
      <text class="pl-meta" x="220" y="${YC + 62}">${esc(worldK.mission)}</text>
      <text class="pl-meta" x="220" y="${YC + 82}">${plural(kDone, 'chapter')}, the next one in preparation</text>
    </g>`;
    const vit = WD.products.map((p, i) => {
      const vx = 236 + i * 168, vy = YM + 22;
      return `<g class="pl-vit"><a href="${esc(p.href)}" target="_blank" rel="noopener" aria-label="${esc(p.name)}: ${esc(p.line)} Opens in a new tab.">
        <rect class="ring" x="${vx - 7}" y="${vy - 7}" width="${150}" height="48"/>
        <rect class="case" x="${vx}" y="${vy}" width="34" height="34"/><rect class="glass" x="${vx + 7}" y="${vy + 7}" width="20" height="20"/>
        <g fill="${INK}" data-contrast-bg="${FLOOR}"><text class="pl-name" x="${vx + 44}" y="${vy + 15}">${esc(p.name)}</text><text class="pl-meta" x="${vx + 44}" y="${vy + 33}">Vitrine, links out</text></g>
      </a></g>`;
    }).join('');
    text += `<g fill="${INK}" data-contrast-bg="${FLOOR}"><text class="pl-name" x="24" y="${YC + 40}">Entrance hall</text></g>`;
    text += `<g fill="${INK}" data-contrast-bg="${WALL}"><text class="pl-call" x="${X0}" y="26">${esc(G.journey.name)}</text><text class="pl-meta" x="${X0}" y="46">Main gallery, ${plural(seasons.length, 'room')}, ${plural(totalChapters, 'chapter')}</text><text class="pl-name" x="150" y="${YB + 34}">Entrance</text></g>`;
    // Walls, with door gaps.
    const L = (x1, y1, x2, y2, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${w}"/>`;
    let walls = '';
    walls += L(X0 - 4, YT, X1 + 4, YT, 8) + L(X0, YT, X0, YB, 8) + L(X1, YT, X1, YB, 8);
    walls += L(X0 - 4, YB, 70, YB, 8) + L(140, YB, X1 + 4, YB, 8);
    xs.slice(1, -1).forEach(x => { walls += L(x, YT, x, YM - 62, 5) + L(x, YM - 22, x, YM, 5); });
    let bx = X0;
    seasons.forEach((s, i) => { const c = (xs[i] + xs[i + 1]) / 2; walls += L(bx, YM, c - 20, YM, 5); bx = c + 20; });
    walls += L(bx, YM, X1, YM, 5);
    walls += L(200, YC, 236, YC, 5) + L(284, YC, X1, YC, 5) + L(200, YC, 200, YB, 5);
    const arrow = `<path d="M105 ${YB + 42}V${YB - 4}M96 ${YB + 6}l9-10 9 10" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="square"/>`;
    return `<svg viewBox="0 0 560 ${YB + 48}" role="group" aria-label="Floor plan of the exhibition">${fills}<g class="pl-wall">${walls}</g>${text}${vit}${arrow}</svg>`;
  }

  // =====================================================================
  // Story: the exhibition you walk through
  // =====================================================================
  const frame = $('#story-frame'), ovEl = $('#ov'), layersEl = $('#layers'), live = $('#live');
  let cur = null;      // the part layer in view, or null on the floor plan
  let running = null;  // the transition in progress
  const isPhone = () => frame.clientWidth < 720;
  const isSide = () => !isPhone() && frame.clientHeight < 560;
  const setState = s => { frame.dataset.state = s; };

  // ---------- Overview: the MAAT floor plan ----------
  function buildOverview() {
    const first = Math.min(...seasons.map(s => monthIdx(s.from)));
    const last = Math.max(monthIdx(latest.date), ...seasons.filter(s => s.to).map(s => monthIdx(s.to)));
    const span = last - first + 1;
    const pct = m => (m - first) / span * 100;
    const months = Array.from({length: span}, (_, i) => `<span style="left:${((i + .5) / span * 100).toFixed(2)}%">${MON[(first + i) % 12]}</span>`).join('');
    const rows = seasons.map(s => {
      const a = pct(monthIdx(s.from)), b = s.to ? pct(monthIdx(s.to) + 1) : 100;
      return `<p class="who">${esc(s.name)}<span>${datesShort(s)}</span></p><div class="track"><i class="bar paint-${s.si + 1}" style="left:${a.toFixed(2)}%;width:${(b - a).toFixed(2)}%"></i></div>`;
    }).join('');
    const entries = seasons.map(s => {
      const n = s.chapters.length;
      const newest = s.chapters[n - 1];
      const isNow = newest && newest.latest;
      const newLine = !newest ? '' : isNow
        ? `<span class="here sm">${HERE}You are here</span> <b>${esc(newest.short)}</b>, <time datetime="${newest.date}">${monthShort(newest.date)}</time>`
        : `${s.to ? 'Last' : 'Newest'} chapter: <b>${esc(newest.short)}</b>, <time datetime="${newest.date}">${monthShort(newest.date)}</time>`;
      const cells = ['<i></i>'].concat(s.chapters.map((c, i) => c.latest ? `<i class="now">${HERE}</i>` : `<i>${i + 1}</i>`), [`<i>${ui('flag')}</i>`]).join('');
      return `<li class="entry paint-${s.si + 1}" data-si="${s.si}" style="flex:${n + 2} 1 0">
        <div class="e-head"><span class="e-num" aria-hidden="true">${s.si + 1}</span><h3 class="e-name">${esc(s.name)}</h3></div>
        <p class="e-mission">${esc(s.mission)}</p>
        <p class="e-meta">${datesLong(s)}, ${plural(n, 'chapter')}</p>
        <p class="e-new">${newLine}</p>
        <div class="e-foot">
          <span class="e-rooms" aria-hidden="true">${cells}</span>
          <button type="button" class="btn btn-primary btn-sm enter" data-act="enter" data-si="${s.si}" aria-label="Enter ${esc(s.name)}">Enter${ARROW}</button>
        </div>
      </li>`;
    }).join('');
    ovEl.innerHTML = `
      <header class="ov-head">
        <div>
          <h2 class="ov-title" id="ov-title" tabindex="-1">${esc(G.journey.mission)}</h2>
          <p class="ov-context">${esc(G.journey.context)}</p>
          <div class="ov-actions">
            <button type="button" class="btn btn-secondary" data-act="enter" data-si="0">Start the journey${ARROW}</button>
            <button type="button" class="btn btn-now" data-act="now">${HERE}Jump to now</button>
          </div>
        </div>
        <div class="ov-dates">
          <p class="dates-line"><b>${esc(G.journey.name)}</b><span>On view since <time datetime="${seasons[0].from}">${monthLong(seasons.map(s => s.from).sort()[0])}</time>. Newest room: <time datetime="${latest.date}">${monthLong(latest.date)}</time>.</span></p>
          <div class="strip"><span></span><div class="ruler" aria-hidden="true">${months}</div>${rows}<span></span><p class="nowlab">Now</p><i class="nowline" aria-hidden="true"></i></div>
        </div>
      </header>
      <div class="plan" id="plan">
        <ol class="galleries" aria-label="Galleries">${entries}</ol>
        <div class="corridor"><p>${ui('up')}Entrance</p></div>
        <svg class="plan-walls" aria-hidden="true"></svg>
      </div>`;
  }

  // The plan walls are drawn over the painted galleries, with door gaps.
  function drawPlanWalls() {
    const plan = $('#plan');
    if (!plan || ovEl.classList.contains('away')) return;
    const svg = plan.querySelector('.plan-walls');
    const pr = plan.getBoundingClientRect();
    const items = $$('.entry', plan);
    const R = items.map(e => { const r = e.getBoundingClientRect(); return {l: r.left - pr.left, t: r.top - pr.top, r: r.right - pr.left, b: r.bottom - pr.top, el: e}; });
    if (!R.length || R[0].r - R[0].l < 2) return;
    const row = R.length < 2 || Math.abs(R[0].t - R[1].t) < 2;
    const Lx = Math.min(...R.map(r => r.l)), Rx = Math.max(...R.map(r => r.r)), Ty = Math.min(...R.map(r => r.t)), By = Math.max(...R.map(r => r.b));
    const O = 8, P = 5, h = O / 2;
    const ln = (x1, y1, x2, y2, w) => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="${w}"/>`;
    let g = ln(Lx, Ty + h, Rx, Ty + h, O) + ln(Lx + h, Ty, Lx + h, By, O) + ln(Rx - h, Ty, Rx - h, By, O);
    if (row) {
      // Each gallery opens to the corridor under its Enter button.
      let x = Lx;
      R.forEach(r => {
        const b = r.el.querySelector('.enter').getBoundingClientRect();
        const g0 = b.left - pr.left - 10, g1 = b.right - pr.left + 10;
        g += ln(x, By - h, g0, By - h, O);
        x = g1;
      });
      g += ln(x, By - h, Rx, By - h, O);
      R.slice(0, -1).forEach(r => {
        const H = r.b - r.t, d0 = r.t + H * .5, d1 = d0 + Math.min(64, H * .2);
        g += ln(r.r, r.t, r.r, d0, P) + ln(r.r, d1, r.r, r.b, P);
      });
    } else {
      g += ln(Lx, By - h, Lx + 18, By - h, O) + ln(Lx + 74, By - h, Rx, By - h, O);
      R.slice(0, -1).forEach(r => { g += ln(r.l, r.b, r.l + 18, r.b, P) + ln(r.l + 74, r.b, r.r, r.b, P); });
    }
    svg.setAttribute('viewBox', `0 0 ${pr.width.toFixed(1)} ${pr.height.toFixed(1)}`);
    svg.innerHTML = g;
  }

  // ---------- Part layer: the gallery elevation ----------
  function buildPart(si) {
    const s = seasons[si];
    const n = s.chapters.length + 2;
    const next = seasons[si + 1];
    const el = document.createElement('section');
    el.className = `part paint-${si + 1}` + (isSide() ? ' side' : '');
    el.setAttribute('aria-label', s.name);
    el.dataset.si = si;
    const rooms = Array.from({length: n}, (_, i) => {
      if (i === 0) return `<div class="room" data-i="0"></div>`;
      if (i === n - 1) return `<div class="room end" data-i="${i}"><span class="r-num r-flag"><span class="r-digit">${ui('flag')}</span></span></div>`;
      const c = s.chapters[i - 1];
      return `<div class="room" data-i="${i}"><span class="r-num"><span class="r-digit">${i}</span></span><div class="r-obj">${icon(c.icon)}</div></div>`;
    }).join('');
    const doors = Array.from({length: n + 1}, (_, j) => {
      const cls = j === 0 ? 'd-in' : j === n ? (next ? `d-next paint-${si + 2}` : 'd-in') : '';
      return `<div class="door ${cls}"><div class="far"><i></i></div></div>`;
    }).join('');
    const sign = next ? `<p class="door-sign">Next: ${esc(next.name)}${ARROW}</p>` : '';
    const stops = Array.from({length: n}, (_, i) => {
      if (i === 0) return `<li><button type="button" class="stop start" data-go="0" aria-label="Start, ${monthLong(s.from)}"><span class="cell"></span><span class="s-lab">Start</span></button></li>`;
      if (i === n - 1) return `<li><button type="button" class="stop end" data-go="${i}" aria-label="Mission: ${esc(s.mission)}"><span class="cell">${ui('flag')}</span><span class="s-lab">Mission</span></button></li>`;
      const c = s.chapters[i - 1];
      return `<li><button type="button" class="stop" data-go="${i}" aria-label="Room ${i}: ${esc(c.short)}, ${monthLong(c.date)}${c.latest ? ', you are here' : ''}"><span class="cell">${i}${c.latest ? `<span class="nowtag">${HERE}</span>` : ''}</span><span class="s-lab">${esc(c.short)}</span>${c.latest ? `<span class="here sm s-here" aria-hidden="true">${HERE}You are here</span>` : ''}</button></li>`;
    }).join('');
    el.innerHTML = `
      <div class="p-trackwrap"><div class="p-track" aria-hidden="true">${rooms}${doors}${sign}</div></div>
      <header class="p-top">
        <button type="button" class="btn btn-secondary btn-sm exit" data-act="exit">${BACK}<span>Floor plan</span><kbd aria-hidden="true">Esc</kbd></button>
        <p class="p-name">${esc(s.name)}<span>${datesShort(s)}</span></p>
        <p class="p-maat">${esc(G.journey.name)}</p>
      </header>
      <div class="stage"></div>
      <footer class="p-floor">
        <span class="marker" aria-hidden="true"></span>
        ${si === latestSi ? `<div class="p-floortrack" aria-hidden="true"><p class="here floor-here">${HERE}You are here</p></div>` : ''}
        <button type="button" class="btn btn-secondary nav-prev" data-act="prev" aria-label="Previous step">${ui('chevL', 'ico-bwd')}<span>Previous</span></button>
        <nav class="p-plan" aria-label="Rooms of ${esc(s.name)}"><ol class="p-stops">${stops}</ol><p class="p-count"></p></nav>
        <button type="button" class="btn btn-primary nav-next" data-act="next" aria-label="Next step"><span>Next</span>${ui('chevR', 'ico-fwd')}</button>
      </footer>`;
    layersEl.appendChild(el);
    const L = {
      el, s, si, n, next, step: 0, pos: 0, lit: -1,
      wrap: $('.p-trackwrap', el), track: $('.p-track', el), rooms: $$('.room', el), doors: $$('.door', el).map(d => ({el: d, far: $('.far', d)})),
      sign: $('.door-sign', el), ftrack: $('.p-floortrack', el), top: $('.p-top', el), floor: $('.p-floor', el), stage: $('.stage', el), marker: $('.marker', el),
      stops: $$('.stop', el), prev: $('.nav-prev', el), nextBtn: $('.nav-next', el), count: $('.p-count', el),
    };
    layoutPart(L);
    return L;
  }

  function metrics(L) {
    const W = frame.clientWidth, H = frame.clientHeight;
    const phone = W < 720, side = !phone && H < 560;
    const topH = phone ? 66 : side ? 54 : Math.round(clamp(H * .078, 56, 74));
    const floorH = phone ? 128 : side ? 84 : Math.round(clamp(H * .17, 112, 156));
    const floorY = H - floorH;
    const Wr = phone ? W - 20 : side ? W * .9 : Math.round(W * .84);
    const x0 = (W - Wr) / 2;
    const dw = phone ? 16 : side ? 56 : Math.round(clamp(W * .072, 76, 120));
    const dh = phone ? Math.round(Math.min(200, (floorY - topH) * .36)) : Math.round((floorY - topH) * (side ? .7 : .64));
    const pad = dw / 2 + (phone ? 12 : Math.round(clamp(W * .046, 28, 72)));
    const cx0 = x0 + pad, cw = Wr - 2 * pad;
    const numEl = L && L.el.querySelector('.room:not(.end) .r-num');
    const numH = numEl ? numEl.offsetHeight : 90;
    const numTop = topH + (phone ? 2 : Math.round(clamp(H * .016, 6, 20)));
    const bodyTop = numTop + numH + (phone ? 10 : Math.round(clamp(H * .024, 12, 26)));
    const bodyBottom = floorY - (phone ? 26 : 30);
    const gutter = phone ? 0 : Math.round(clamp(W * .035, 28, 56));
    const panelW = phone ? cw : side ? Math.round(cw * .6) : Math.min(620, Math.round(cw * .58));
    const objCol = phone ? 0 : cw - panelW - gutter;
    const objW = phone || side ? 0 : Math.round(Math.min(objCol, 300, (bodyBottom - bodyTop) * .48));
    const labelW = phone ? cw : Math.round(Math.min(objCol, 290));
    return {W, H, phone, side, topH, floorH, floorY, Wr, x0, dw, dh, pad, cx0, cw, numTop, numH, bodyTop, bodyBottom, gutter, panelW, objCol, objW, labelW};
  }

  function layoutPart(L) {
    L.el.classList.toggle('side', isSide());
    const m = metrics(L);
    L.m = m;
    L.top.style.height = m.topH + 'px';
    L.floor.style.height = m.floorH + 'px';
    L.track.style.width = (m.x0 * 2 + m.Wr * L.n) + 'px';
    L.rooms.forEach((r, i) => {
      r.style.left = (m.x0 + i * m.Wr) + 'px';
      r.style.width = m.Wr + 'px';
      r.style.height = m.floorY + 'px';
      const num = $('.r-num', r);
      if (num) { num.style.left = m.pad + 'px'; num.style.top = m.numTop + 'px'; }
      const obj = $('.r-obj', r);
      if (obj) {
        obj.style.display = m.objW > 60 ? '' : 'none';
        obj.style.left = (m.pad + m.panelW + m.gutter) + 'px';
        obj.style.top = m.bodyTop + 'px';
        obj.style.width = obj.style.height = m.objW + 'px';
      }
    });
    L.doors.forEach((d, j) => {
      const s = d.el.style;
      s.left = (m.x0 + j * m.Wr - m.dw / 2) + 'px';
      s.top = (m.floorY - m.dh) + 'px';
      s.width = m.dw + 'px';
      s.height = m.dh + 'px';
    });
    if (L.sign) {
      L.sign.style.display = m.phone ? 'none' : '';
      const sw = L.sign.offsetWidth, sh = L.sign.offsetHeight;
      L.sign.style.left = (m.x0 + L.n * m.Wr + m.dw / 2 - sw) + 'px';
      L.sign.style.top = (m.floorY - m.dh - sh - 18) + 'px';
    }
    if (L.ftrack) $('.floor-here', L.ftrack).style.left = (m.x0 + latestStep * m.Wr + m.pad) + 'px';
    renderPart(L);
    [...L.stage.children].forEach(node => placeStage(L, node));
  }

  function renderPart(L) {
    const m = L.m, pos = L.pos;
    L.track.style.transform = `translateX(${(-pos * m.Wr).toFixed(2)}px)`;
    if (L.ftrack) L.ftrack.style.transform = L.track.style.transform;
    // The far wall seen through each doorway moves slower than the doorway frame.
    L.doors.forEach((d, j) => {
      const cx = m.x0 + j * m.Wr - pos * m.Wr;
      d.far.style.transform = `translateX(${(-(cx - m.W / 2) * PARALLAX).toFixed(2)}px)`;
    });
    const lit = clamp(Math.round(pos), 0, L.n - 1);
    if (L.lit !== lit) { L.lit = lit; L.stops.forEach((b, i) => b.classList.toggle('lit', i === lit)); }
  }

  function updateControls(L, step) {
    L.prev.disabled = step === 0;
    L.nextBtn.disabled = step === L.n - 1;
    L.count.textContent = step === 0 ? 'Start' : step === L.n - 1 ? 'Mission' : `Chapter ${step} of ${L.s.chapters.length}`;
    L.stops.forEach((b, i) => {
      b.classList.toggle('current', i === step);
      if (i === step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }

  // ---------- Stage content: wall text for one room ----------
  function chapterCard(c, step, total, opts = {}) {
    const art = articleFor(c);
    const status = c.latest ? '<i class="now"></i>Newest chapter' : '<i></i>Past chapter';
    return `
      <article class="panel" aria-label="Wall text">
        ${c.latest ? `<p class="here" data-ln>${HERE}You are here</p>` : ''}
        <h${opts.h || 2} class="c-title"${opts.noFocus ? '' : ' tabindex="-1"'} data-ln>${esc(c.title)}</h${opts.h || 2}>
        <div class="c-simple">${c.simple.map(p => `<p data-ln>${esc(p)}</p>`).join('')}</div>
        <p class="c-learned" data-ln><b>What I learned:</b> ${esc(c.learned)}</p>
      </article>
      <aside class="label" aria-label="Object label">
        <p class="l-title" data-ln>${esc(c.short)}</p>
        <p class="l-date" data-ln>Room ${step} of ${total}, <time datetime="${c.date}">${monthLong(c.date)}</time></p>
        <p class="l-article" data-ln>${art ? `<a class="link-go${opts.linkCls ? ' ' + opts.linkCls : ''}" href="${esc(art.href)}">${esc(art.title)}${ui('arrow')}</a>` : 'No article yet'}</p>
        <p class="l-status" data-ln>${status}</p>
      </aside>`;
  }
  function stageEl(L, step) {
    const s = L.s;
    let html;
    if (step === 0) {
      const firstC = s.chapters[0];
      html = `<div class="opener">
        <h2 class="o-name" tabindex="-1" data-ln>${esc(s.name)}</h2>
        <p class="o-mission" data-ln>${esc(s.mission)}</p>
        <p class="o-meta" data-ln><span>${datesLong(s)}</span><span>${plural(s.chapters.length, 'chapter')}</span>${firstC ? `<span>First room: ${esc(firstC.short)}${ui('arrow')}</span>` : ''}</p>
      </div>`;
    } else if (step === L.n - 1) {
      html = `<div class="endwall">
        <h2 class="end-title" tabindex="-1" data-ln>${esc(s.mission)}</h2>
        <p class="end-meta" data-ln>The mission of ${esc(s.name)}. ${datesLong(s)}, ${plural(s.chapters.length, 'chapter')}.</p>
        <div class="end-actions" data-ln>
          ${L.next ? `<button type="button" class="btn btn-primary" data-act="nextseason"><span>Next: ${esc(L.next.name)}</span>${ARROW}</button>` : ''}
          <button type="button" class="btn btn-secondary" data-act="exit">${BACK}<span>Back to the floor plan</span></button>
        </div>
      </div>`;
    } else {
      html = `<div class="c-card">${chapterCard(s.chapters[step - 1], step, s.chapters.length)}</div>`;
    }
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    const node = t.content.firstElementChild;
    node.dataset.step = step;
    return node;
  }

  function placeStage(L, node) {
    const m = L.m, step = Number(node.dataset.step);
    node.style.transform = '';
    if (node.classList.contains('opener')) {
      node.style.left = m.cx0 + 'px';
      node.style.width = Math.min(m.cw, 980) + 'px';
      const h = node.offsetHeight;
      const room = m.floorY - m.topH;
      node.style.top = Math.round(m.topH + Math.max(12, (room - h) * (m.phone ? .5 : .44))) + 'px';
    } else if (node.classList.contains('endwall')) {
      node.style.left = m.cx0 + 'px';
      node.style.width = Math.min(m.cw, m.phone ? m.cw : 900) + 'px';
      node.style.top = m.bodyTop + 'px';
    } else {
      const panel = $('.panel', node), label = $('.label', node);
      node.style.left = m.cx0 + 'px';
      node.style.top = m.bodyTop + 'px';
      node.style.width = m.cw + 'px';
      panel.style.width = m.panelW + 'px';
      label.style.width = m.labelW + 'px';
      if (m.phone) {
        label.style.left = '0px';
        label.style.top = (panel.offsetHeight + 12) + 'px';
        node.style.height = (panel.offsetHeight + 12 + label.offsetHeight) + 'px';
      } else if (m.side || m.objW <= 60) {
        label.style.left = (m.panelW + m.gutter) + 'px';
        label.style.top = '0px';
        node.style.height = Math.max(panel.offsetHeight, label.offsetHeight) + 'px';
      } else {
        label.style.left = (m.panelW + m.gutter) + 'px';
        label.style.top = (m.objW + 18) + 'px';
        node.style.height = Math.max(panel.offsetHeight, m.objW + 18 + label.offsetHeight) + 'px';
      }
      // Never run into the floor: lift the card if the room is short.
      const over = m.bodyTop + node.offsetHeight - m.bodyBottom;
      if (over > 0) node.style.top = Math.max(m.topH + 6, m.bodyTop - over) + 'px';
      if (m.side) panel.style.maxHeight = (m.bodyBottom - m.topH - 10) + 'px';
    }
    if (L.pos !== step) node.style.transform = `translateX(${((step - L.pos) * m.Wr).toFixed(1)}px)`;
  }
  const ride = (L, node) => { node.style.transform = `translateX(${((Number(node.dataset.step) - L.pos) * L.m.Wr).toFixed(2)}px)`; };

  // ---------- Motion pieces ----------
  // Wall text sets line by line: each line wipes in from the left.
  function setLines(node, at, anims, reduce) {
    if (reduce) { anims.push(node.animate([{opacity: 0}, {opacity: 1}], {duration: DUR.fade, delay: at, easing: EASE.fade, fill: 'backwards'})); return at + DUR.fade; }
    const lines = $$('[data-ln]', node);
    lines.forEach((el, i) => anims.push(el.animate([
      {opacity: 0, clipPath: 'inset(0 100% 0 0)'},
      {opacity: 1, clipPath: 'inset(0 0% 0 0)'},
    ], {duration: DUR.set, delay: at + i * DUR.stagger, easing: EASE.out, fill: 'backwards'})));
    return at + Math.max(0, lines.length - 1) * DUR.stagger + DUR.set;
  }
  // The room number rolls up into its slot.
  function rollNumber(L, step, at, anims) {
    const d = L.rooms[step] && $('.r-digit', L.rooms[step]);
    if (d) anims.push(d.animate([{transform: 'translateY(112%)'}, {transform: 'none'}], {duration: DUR.roll, delay: at, easing: EASE.out, fill: 'backwards'}));
  }
  const walkTime = (a, b) => DUR.walk + DUR.extra * Math.max(0, Math.abs(b - a) - 1);

  function run(T, frameFn, done) {
    const t0 = performance.now();
    let raf = 0, over = false;
    const anims = [];
    const end = interrupted => { if (over) return; over = true; cancelAnimationFrame(raf); if (interrupted) anims.forEach(a => { try { a.finish(); } catch (e) { /* removed */ } }); done(interrupted); };
    const tick = now => { const t = Math.min(1, (now - t0) / T); frameFn(t * T); if (t < 1) raf = requestAnimationFrame(tick); else end(false); };
    raf = requestAnimationFrame(tick);
    const ctl = {anims, finish() { if (over) return; frameFn(T); end(true); }};
    running = ctl;
    return ctl;
  }
  const finishRunning = () => { if (running) { const r = running; running = null; r.finish(); } };

  function announce(L) {
    if (!L) { live.textContent = `Floor plan. ${G.journey.name}: ${G.journey.mission}`; return; }
    const s = L.s, st = L.step;
    if (st === 0) live.textContent = `${s.name}. ${s.mission}`;
    else if (st === L.n - 1) live.textContent = `${s.name}. Mission: ${s.mission}`;
    else { const c = s.chapters[st - 1]; live.textContent = `${s.name}, chapter ${st} of ${s.chapters.length}: ${c.title}` + (c.latest ? '. You are here.' : ''); }
  }
  function focusHeading() {
    const node = cur && cur.stage.lastElementChild;
    const h = node ? $('[tabindex="-1"]', node) : $('#ov-title');
    if (h) h.focus({preventScroll: true});
  }
  const rectIn = el => {
    const f = frame.getBoundingClientRect(), r = el.getBoundingClientRect();
    return `inset(${(r.top - f.top).toFixed(1)}px ${(f.right - r.right).toFixed(1)}px ${(f.bottom - r.bottom).toFixed(1)}px ${(r.left - f.left).toFixed(1)}px)`;
  };

  // ---------- Step: walk to another room ----------
  function goStep(target) {
    if (!cur) return;
    const L = cur;
    target = clamp(target, 0, L.n - 1);
    finishRunning();
    if (target === L.step) { focusHeading(); return; }
    const from = L.step, reduce = reduceMQ.matches;
    L.step = target;
    setState('moving');
    updateControls(L, target);
    L.marker.classList.add('walk');
    const anims = [];
    const old = [...L.stage.children];
    const node = stageEl(L, target);
    L.stage.appendChild(node);
    placeStage(L, node);
    const p0 = L.pos, p1 = target;
    let T, dur = 0;
    if (reduce) {
      old.forEach(o => anims.push(o.animate([{opacity: 1}, {opacity: 0}], {duration: 140, easing: EASE.fade, fill: 'forwards'})));
      anims.push(L.wrap.animate([{opacity: 1}, {opacity: 0, offset: .4}, {opacity: 1}], {duration: 320, easing: EASE.fade}));
      const endAt = setLines(node, 130, anims, true);
      T = Math.max(340, endAt + 20);
    } else {
      dur = walkTime(from, target);
      rollNumber(L, target, dur * .58, anims);
      const endAt = setLines(node, dur * .62, anims, false);
      T = Math.max(dur, endAt) + 20;
    }
    const ctl = run(T, ms => {
      if (reduce) { if (ms >= 130 && L.pos !== p1) { L.pos = p1; renderPart(L); node.style.transform = ''; old.forEach(o => o.style.visibility = 'hidden'); } return; }
      L.pos = lerp(p0, p1, easeMove(clamp(ms / dur, 0, 1)));
      renderPart(L);
      old.forEach(o => ride(L, o));
      ride(L, node);
    }, interrupted => {
      running = null;
      L.pos = p1; renderPart(L);
      old.forEach(o => o.remove());
      node.style.transform = '';
      L.marker.classList.remove('walk');
      setState('idle');
      if (!interrupted) { announce(L); focusHeading(); }
    });
    ctl.anims.push(...anims);
  }

  // ---------- Enter: the gallery opens and its paint floods the frame ----------
  function enterPart(si, opts = {}) {
    finishRunning();
    const reduce = reduceMQ.matches;
    const target = opts.target || 0;
    const prev = cur;
    const L = buildPart(si);
    cur = L;
    L.step = target; L.pos = 0;
    setState('moving');
    updateControls(L, target);
    renderPart(L);
    const anims = [];
    let enterT = 0, endAt = 0;
    if (target === 0) { const n0 = stageEl(L, 0); L.stage.appendChild(n0); placeStage(L, n0); }
    if (reduce) {
      anims.push(L.el.animate([{opacity: 0}, {opacity: 1}], {duration: DUR.fade, easing: EASE.fade, fill: 'backwards'}));
      enterT = 0;
    } else if (!prev) {
      const from = rectIn(ovEl.querySelector(`.entry[data-si="${si}"]`));
      anims.push(L.el.animate([{clipPath: from}, {clipPath: 'inset(0px 0px 0px 0px)'}], {duration: DUR.flood, easing: EASE.move, fill: 'backwards'}));
      anims.push(L.wrap.animate([{opacity: 0, transform: 'translateX(56px)'}, {opacity: 1, transform: 'none'}], {duration: 640, delay: DUR.flood * .36, easing: EASE.out, fill: 'backwards'}));
      anims.push(L.floor.animate([{transform: 'translateY(100%)'}, {transform: 'none'}], {duration: 620, delay: DUR.flood * .42, easing: EASE.out, fill: 'backwards'}));
      anims.push(L.top.animate([{opacity: 0}, {opacity: 1}], {duration: 420, delay: DUR.flood * .58, easing: EASE.fade, fill: 'backwards'}));
      enterT = DUR.flood;
    } else {
      // The next gallery's paint floods across from the right-hand doorway.
      const door = prev.doors[prev.n].el;
      const from = rectIn(door);
      anims.push(L.el.animate([{clipPath: from}, {clipPath: 'inset(0px 0px 0px 0px)'}], {duration: DUR.flood * .92, easing: EASE.move, fill: 'backwards'}));
      anims.push(L.wrap.animate([{opacity: 0, transform: 'translateX(72px)'}, {opacity: 1, transform: 'none'}], {duration: 640, delay: DUR.flood * .4, easing: EASE.out, fill: 'backwards'}));
      [prev.wrap, prev.stage].forEach(p => anims.push(p.animate([{transform: 'none'}, {transform: 'translateX(-6%)'}], {duration: DUR.flood * .92, easing: EASE.move, fill: 'forwards'})));
      [...prev.floor.children].forEach(p => anims.push(p.animate([{opacity: 1}, {opacity: 0}], {duration: 200, easing: EASE.fade, fill: 'forwards'})));
      [...L.floor.children].forEach(p => anims.push(p.animate([{opacity: 0}, {opacity: 1}], {duration: 300, delay: DUR.flood * .5, easing: EASE.fade, fill: 'backwards'})));
      enterT = DUR.flood * .92;
    }
    if (target === 0) {
      endAt = setLines(L.stage.lastElementChild, reduce ? 0 : enterT * .66, anims, reduce);
    }
    // Jump to now: after the flood, one continuous walk through the doorways.
    let old = [], node = null, dur = 0;
    if (target > 0) {
      // The gallery title stays on its wall while you walk past it.
      if (!reduce) {
        const n0 = stageEl(L, 0);
        L.stage.appendChild(n0);
        placeStage(L, n0);
        setLines(n0, enterT * .5, anims, false);
        old.push(n0);
      }
      node = stageEl(L, target);
      L.stage.appendChild(node);
      placeStage(L, node);
      if (reduce) endAt = setLines(node, 0, anims, true);
      else {
        dur = walkTime(0, target);
        rollNumber(L, target, enterT + dur * .58, anims);
        endAt = setLines(node, enterT + dur * .62, anims, false);
      }
    }
    const T = Math.max(reduce ? DUR.fade + 20 : enterT + dur, endAt) + 20;
    const ctl = run(T, ms => {
      if (target > 0) {
        if (reduce) { if (L.pos !== target) { L.pos = target; renderPart(L); node.style.transform = ''; } return; }
        L.pos = lerp(0, target, easeMove(clamp((ms - enterT) / dur, 0, 1)));
        renderPart(L);
        old.forEach(o => ride(L, o));
        ride(L, node);
      }
    }, interrupted => {
      running = null;
      L.pos = target; renderPart(L);
      if (node) node.style.transform = '';
      old.forEach(o => o.remove());
      if (prev) prev.el.remove();
      ovEl.classList.add('away');
      ovEl.inert = true;
      setState('idle');
      if (!interrupted) { announce(L); focusHeading(); }
    });
    ctl.anims.push(...anims);
  }

  // ---------- Exit: the paint folds back into its gallery on the plan ----------
  function exitHome() {
    if (!cur) return;
    finishRunning();
    const L = cur, reduce = reduceMQ.matches;
    cur = null;
    ovEl.classList.remove('away');
    ovEl.inert = false;
    setState('moving');
    drawPlanWalls();
    const anims = [];
    let T;
    if (reduce) {
      anims.push(L.el.animate([{opacity: 1}, {opacity: 0}], {duration: DUR.fade, easing: EASE.fade, fill: 'forwards'}));
      T = DUR.fade + 20;
    } else {
      [L.top, L.stage, L.wrap].forEach(p => anims.push(p.animate([{opacity: 1}, {opacity: 0}], {duration: 220, easing: EASE.in, fill: 'forwards'})));
      anims.push(L.floor.animate([{transform: 'none'}, {transform: 'translateY(100%)'}], {duration: 420, easing: EASE.in, fill: 'forwards'}));
      const to = rectIn(ovEl.querySelector(`.entry[data-si="${L.si}"]`));
      anims.push(L.el.animate([{clipPath: 'inset(0px 0px 0px 0px)'}, {clipPath: to}], {duration: 820, delay: 120, easing: EASE.move, fill: 'forwards'}));
      T = 960;
    }
    const ctl = run(T, () => {}, interrupted => {
      running = null;
      L.el.remove();
      setState('idle');
      if (!interrupted) { announce(null); focusHeading(); }
    });
    ctl.anims.push(...anims);
  }

  function jumpNow() {
    if (cur && cur.si === latestSi) { goStep(latestStep); return; }
    enterPart(latestSi, {target: latestStep});
  }

  // ---------- Events ----------
  frame.addEventListener('click', e => {
    const b = e.target.closest('[data-act], .stop');
    if (!b || !frame.contains(b) || b.disabled) return;
    if (b.classList.contains('stop')) { goStep(Number(b.dataset.go)); return; }
    const act = b.dataset.act;
    if (act === 'enter') enterPart(Number(b.dataset.si));
    else if (act === 'now') jumpNow();
    else if (act === 'exit') exitHome();
    else if (act === 'prev') goStep(cur.step - 1);
    else if (act === 'next') goStep(cur.step + 1);
    else if (act === 'nextseason') { if (cur && seasons[cur.si + 1]) enterPart(cur.si + 1); }
  });
  const frameCovers = () => {
    const r = frame.getBoundingClientRect();
    return (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / innerHeight > .6;
  };
  document.addEventListener('keydown', e => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const t = e.target;
    const inFrame = t && t.nodeType === 1 && frame.contains(t);
    const onBody = t === document.body || t === root;
    if (!inFrame && !(onBody && frameCovers())) return;
    const onControl = t.closest && t.closest('button, a, input, select, textarea, [role="button"]');
    const fwd = () => { if (cur) { if (cur.step < cur.n - 1) goStep(cur.step + 1); } else enterPart(0); };
    if (e.key === 'ArrowRight') { e.preventDefault(); fwd(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (cur && cur.step > 0) goStep(cur.step - 1); }
    else if (e.key === ' ' || e.key === 'Enter') { if (onControl) return; e.preventDefault(); fwd(); }
    else if (e.key === 'Escape' || e.key === 'Home') { if (cur) { e.preventDefault(); exitHome(); } }
    else if (e.key === 'End') { e.preventDefault(); jumpNow(); }
  });
  let rsT = 0, lastMode = '';
  const mode = () => (isPhone() ? 'p' : 'd') + (isSide() ? 's' : '');
  addEventListener('resize', () => {
    clearTimeout(rsT);
    rsT = setTimeout(() => {
      finishRunning();
      drawPlanWalls();
      if (cur) {
        if (mode() !== lastMode) {
          const si = cur.si, step = cur.step;
          cur.el.remove();
          cur = buildPart(si);
          cur.step = step; cur.pos = step;
          const n0 = stageEl(cur, step);
          cur.stage.appendChild(n0);
          updateControls(cur, step);
          layoutPart(cur);
        } else layoutPart(cur);
      }
      lastMode = mode();
    }, 120);
  });

  window.story = {
    seasons, latestSi, latestStep,
    get view() { return cur ? 'season' : 'home'; },
    get season() { return cur ? cur.si : -1; },
    get step() { return cur ? cur.step : -1; },
    enter: si => enterPart(si), exit: exitHome, go: goStep, jumpNow,
  };

  // =====================================================================
  // Card: three states of the wall text
  // =====================================================================
  function renderCards() {
    const done = G.chapters.find(c => c.id === 'maat-2') || G.chapters.find(c => !c.latest && c.article);
    const dS = seasons.find(s => s.id === done.season);
    const dStep = dS.chapters.indexOf(done) + 1;
    const lS = seasons[latestSi];
    const nx = worldK.chapters.find(c => c.status === 'next');
    const nIdx = worldK.chapters.indexOf(nx) + 1;
    $('#exhibits').innerHTML = `
      <figure class="exhibit" data-card-state="done">
        <div class="ex-wall paint-${dS.si + 1}">
          <p class="ex-num" aria-hidden="true">${dStep}</p>
          <p class="ex-gal">${esc(dS.name)}</p>
          ${chapterCard(done, dStep, dS.chapters.length, {h: 3, noFocus: true})}
        </div>
        <div class="ex-floor" aria-hidden="true"></div>
        <figcaption>A past chapter, with its article link</figcaption>
      </figure>
      <figure class="exhibit" data-card-state="latest">
        <div class="ex-wall paint-${lS.si + 1}">
          <p class="ex-num" aria-hidden="true">${latestStep}</p>
          <p class="ex-gal">${esc(lS.name)}</p>
          ${chapterCard(latest, latestStep, lS.chapters.length, {h: 3, noFocus: true})}
        </div>
        <div class="ex-floor" aria-hidden="true"></div>
        <figcaption>The newest chapter, with You are here</figcaption>
      </figure>
      <figure class="exhibit" data-card-state="next">
        <div class="ex-wall unpainted">
          <p class="ex-num" aria-hidden="true">${nIdx}</p>
          <p class="ex-gal">${esc(worldK.name)}</p>
          <div class="prep"><p>The wall text goes here when the chapter opens.</p></div>
          <div class="plain-label">
            <h3 class="l-title">${esc(nx.title)}</h3>
            <p class="l-date">Room ${nIdx}, next</p>
            <p class="l-simple">${nx.simple.map(esc).join(' ')}</p>
            <p class="l-status"><i class="open"></i>In preparation</p>
          </div>
        </div>
        <div class="ex-floor" aria-hidden="true"></div>
        <figcaption>The next chapter: an unpainted room in preparation</figcaption>
      </figure>`;
    const art = articleFor(done);
    const link = cls => `<a class="link-go ${cls}" href="${esc(art.href)}">${esc(art.title)}${ui('arrow')}</a>`;
    $('#linkstates').innerHTML = `
      <div><p>Article link, default</p>${link('')}</div>
      <div><p>Article link, hover (forced copy)</p>${link('is-hover')}</div>
      <div><p>Article link, keyboard focus (forced copy)</p>${link('is-focus')}</div>`;
  }

  // =====================================================================
  // System: the installation sheet
  // =====================================================================
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lumOf = hex => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); };
  const ratioOf = (a, b) => { const [x, y] = [lumOf(a), lumOf(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  function renderSheet() {
    const sname = i => seasons[i] ? seasons[i].name : '';
    const COLORS = [
      ['Gallery white', '--color-wall', '--color-ink', 'Walls and page ground'],
      ['Panel white', '--color-panel', '--color-ink', 'Mounted wall text and labels'],
      ['Floor gray', '--color-floor', '--color-ink', 'Floor band, controls at the floor'],
      ['Primer', '--color-primer', '--color-ink', 'Unpainted wall, a room in preparation'],
      ['Ink', '--color-ink', '--color-panel', 'Wall text, rules, plan walls, primary fill'],
      ['Ink 2', '--color-ink-2', '--color-wall', 'Secondary text on white and gray'],
      ['Teal wall', '--paint-1', '--paint-1-ink', sname(0)],
      ['Teal, soft text', '--paint-1', '--paint-1-ink-2', 'Secondary text on teal'],
      ['Teal beyond', '--paint-1-deep', '--paint-1-ink', 'Doorway: the room beyond'],
      ['Vermilion wall', '--paint-2', '--paint-2-ink', sname(1) + '. Secondary text stays white'],
      ['Vermilion beyond', '--paint-2-deep', '--paint-2-ink', 'Doorway: the room beyond'],
      ['Sun wall', '--paint-3', '--paint-3-ink', sname(2)],
      ['Sun, soft text', '--paint-3', '--paint-3-ink-2', 'Secondary text on sun'],
      ['Sun beyond', '--paint-3-deep', '--paint-3-ink', 'Doorway: the room beyond'],
      ['Here plate', '--color-now', '--color-ink', 'You are here: the newest chapter only'],
      ['Now plate', '--color-now-plate', '--color-now', 'Jump to now, on every ground'],
      ['Black box', '--color-blackbox', '--color-on-blackbox', 'Second gallery on the plan'],
    ];
    const chips = COLORS.map(([name, bg, fg, role]) => {
      const a = tok(bg).toUpperCase(), b = tok(fg).toUpperCase();
      const r = ratioOf(a, b);
      return `<div class="chip"><div class="swatch" style="background:var(${bg});color:var(${fg})"><b>Aa</b><span>Wall text</span></div>
        <dl><dt>${esc(name)}</dt><dd>${bg} ${a}</dd><dd>Text ${b}</dd><dd class="ratio">${r.toFixed(2)} : 1, ${r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large only' : 'not for text'}</dd><dd>${esc(role)}</dd></dl></div>`;
    }).join('');

    const c2 = seasons[1].chapters[1] || G.chapters[0];
    const TYPES = [
      ['Display', 'Wall title. Archivo 800, width 116, tracking -0.03em', 't-display', esc(WD.person.motto)],
      ['Gallery title', 'Opener wall. Archivo 800, width 116', 'o-name', esc(seasons[1].name)],
      ['Room number', 'Archivo 800, width 125', 'r-num static', '3'],
      ['Section head', 'Archivo 800, width 116', 't-head', 'Wall text and object labels'],
      ['Wall title', 'Panel heading. Archivo 700, width 116', 'c-title', esc(c2.title)],
      ['Lead', 'Intro wall text. Archivo 500, width 100', 't-lead', esc(WD.person.line)],
      ['Wall text', 'Archivo 400, width 100', 'ts-wall', esc(c2.simple[0])],
      ['Label strong', 'Object label title. Archivo 700, width 80', 'l-title', esc(c2.short)],
      ['Label', 'Object label line. Archivo 500, width 80', 't-label', `Room 2 of 3, ${monthLong(c2.date)}. No article yet`],
      ['Control', 'Buttons. Archivo 650, width 92', 'ts-control', 'Jump to now'],
    ];
    const types = TYPES.map(([role, face, cls, sample], i) => `<div class="typerow"><dl><dt>${role}</dt><dd>${face}</dd><dd class="tsize" data-for="ts${i}"></dd></dl><p class="sample ${cls}" id="ts${i}">${sample}</p></div>`).join('');

    const spaces = Array.from({length: 10}, (_, i) => `--space-${i + 1}`).map(v => `<li><span>${v} ${tok(v)}</span><i style="width:var(${v})"></i></li>`).join('');

    const btnRow = (label, cls, ground, text, extra = '') => {
      const g = ground ? ` on-paint ${ground}` : '';
      const b = (state, dis) => `<div class="${g}"><button type="button" class="btn ${cls} ${state}"${dis ? ' disabled' : ''} tabindex="-1">${extra}${text}</button></div>`;
      return `<div class="rl${g}">${label}</div>${b('')}${b('is-hover')}${b('is-focus')}${b('', true)}`;
    };
    const buttons = `<div class="btngrid-wrap"><div class="btngrid">
      <div class="h"></div><div class="h">Default</div><div class="h">Hover</div><div class="h">Focus</div><div class="h">Disabled</div>
      ${btnRow('Primary, on white', 'btn-primary', '', `Enter MAAT${ARROW}`)}
      ${btnRow('Primary, on paint', 'btn-primary', 'paint-1', `Enter${ARROW}`)}
      ${btnRow('Primary, on sun', 'btn-primary', 'paint-3', `Enter${ARROW}`)}
      ${btnRow('Secondary', 'btn-secondary', '', `Start the journey${ARROW}`)}
      ${btnRow('Secondary, on paint', 'btn-secondary', 'paint-2', `${BACK}Floor plan`)}
      ${btnRow('Quiet', 'btn-quiet', '', 'Back to the floor plan')}
      ${btnRow('Jump to now', 'btn-now', '', 'Jump to now', HERE)}
      ${btnRow('Jump to now, on paint', 'btn-now', 'paint-2', 'Jump to now', HERE)}
    </div></div>`;

    const lc = G.chapters.find(c => c.id === 'maat-3') || G.chapters[0];
    const la = articleFor(lc) || {title: lc.title, href: '#card'};
    const icons = Object.keys(ICONS).map((k, i) => `<figure><div class="ib paint-${(i % 3) + 1}">${icon(k)}</div><figcaption>${k}</figcaption></figure>`).join('')
      + [['arrow', 'Arrow'], ['back', 'Back'], ['chevL', 'Chevron left'], ['chevR', 'Chevron right'], ['flag', 'Flag, mission'], ['ext', 'Links out'], ['up', 'Entrance']].map(([k, n]) => `<figure><div class="ib small ground-light">${ui(k)}</div><figcaption>${n}</figcaption></figure>`).join('')
      + `<figure><div class="ib small ground-light"><span class="here" style="height:auto;padding:6px">${HERE}</span></div><figcaption>You are here, newest chapter</figcaption></figure>`
      + `<figure><div class="ib small ground-light" style="background:var(--color-floor)"><span class="marker" style="position:static;margin:0"></span></div><figcaption>Visitor, on the floor</figcaption></figure>`;

    const MOTIONS = [
      ['flood', 'Enter: paint floods in', `--dur-flood ${tok('--dur-flood')}, --ease-move`, 'The gallery on the plan opens to fill the frame.', '<i class="fl"></i>'],
      ['walk', 'Step: walk to the next room', `--dur-walk ${tok('--dur-walk')}, +${tok('--dur-walk-extra')} per extra room, --ease-move`, 'Doorways pass faster than the far wall behind them.', '<span class="wk"><i></i><i></i><i></i></span><span class="floor"></span>'],
      ['roll', 'The room number rolls in', `--dur-roll ${tok('--dur-roll')}, --ease-out`, 'Starts as the walk slows down.', '<span class="rn"><span>2</span></span>'],
      ['set', 'Wall text sets line by line', `--dur-set ${tok('--dur-set')}, --dur-stagger ${tok('--dur-stagger')}, --ease-out`, 'Each line wipes in from the left.', '<span class="st"><i></i><i></i><i></i></span>'],
      ['fade', 'Reduced motion: crossfade', `--dur-fade ${tok('--dur-fade')}, --ease-fade`, 'No travel. Every change ends in under 1 second.', '<span class="cf">Crossfade</span>'],
    ];
    const motions = MOTIONS.map(([k, name, toks, note, demo]) => `<div class="motion"><dl><dt>${name}</dt><dd>${toks}</dd><dd>${note}</dd></dl><div class="mdemo" data-demo="${k}" aria-hidden="true">${demo}</div><button type="button" class="btn btn-secondary btn-sm" data-replay="${k}">Replay<span class="sr-only">: ${name}</span></button></div>`).join('');

    const bps = [[0, '0'], [390, '390', 'phone'], [720, '720', 'laptop'], [1280, '1280', ''], [1440, '1440', 'desktop'], [1600, '1600', '']];
    const bpHtml = bps.map(([x, t, n]) => `<span style="left:${(x / 1600 * 96 + 2).toFixed(2)}%">${t}<em>${n || '&nbsp;'}</em></span>`).join('');

    $('#sheet').innerHTML = `
      <div class="sys-row" data-tokens="color"><h3>Color</h3><p>Gallery white, one painted wall per part, black wall text. The ratio is measured from the tokens.</p><div class="sys-body"><div class="chips">${chips}</div></div></div>
      <div class="sys-row" data-tokens="type"><h3>Type</h3><p>Archivo only, in three widths: wide for numbers and titles, normal for wall text, condensed for labels.</p><div class="sys-body"><div class="typerows">${types}</div></div></div>
      <div class="sys-row" data-tokens="space"><h3>Space</h3><p>One scale for every gap. Tight inside a label, generous between rooms.</p><div class="sys-body"><ol class="scale">${spaces}</ol></div></div>
      <div class="sys-row" data-tokens="radius"><h3>Radius</h3><p>Walls and panels are square. Controls take 2 px. No pills, no rounded cards.</p><div class="sys-body"><div class="specimens">
        <div class="specimen"><div class="shape" style="border-radius:var(--radius-none);background:var(--paint-1)"></div><b>--radius-none 0</b><span>Walls, panels, labels, plan</span></div>
        <div class="specimen"><div class="shape" style="border-radius:var(--radius-none);background:var(--color-panel);box-shadow:var(--shadow-mounted)"></div><b>--radius-none 0</b><span>Mounted panel</span></div>
        <div class="specimen"><button type="button" class="btn btn-primary" tabindex="-1">Enter${ARROW}</button><b>--radius-control ${tok('--radius-control')}</b><span>Every control</span></div>
      </div></div></div>
      <div class="sys-row" data-tokens="border"><h3>Border</h3><p>Lines are architecture: rules, the floor line, plan walls.</p><div class="sys-body"><ol class="scale">
        <li><span>--border-rule ${tok('--border-rule')}</span><i style="height:var(--border-rule)"></i></li>
        <li><span>--border-focus ${tok('--border-focus')}</span><i style="height:var(--border-focus)"></i></li>
        <li><span>--border-floor ${tok('--border-floor')}</span><i style="height:var(--border-floor)"></i></li>
        <li><span>--border-partition ${tok('--border-partition')}</span><i style="height:var(--border-partition)"></i></li>
        <li><span>--border-plan ${tok('--border-plan')}</span><i style="height:var(--border-plan)"></i></li>
      </ol></div></div>
      <div class="sys-row" data-tokens="depth"><h3>Depth</h3><p>The world is flat. Only a mounted panel has a shadow: one offset with one soft blur.</p><div class="sys-body"><div class="depthrow">
        <div class="dwall paint-1"><p class="cap">Wall: flat</p></div>
        <div class="dwall paint-1"><div class="panel">Mounted panel</div><p class="cap">--shadow-mounted: 0 14px 26px</p></div>
        <div class="dwall ground-light" style="background:var(--color-floor)"><p class="cap">Floor: flat</p></div>
      </div></div></div>
      <div class="sys-row" data-tokens="button"><h3>Button</h3><p>Rectangles with a 2 px radius. Black on white, white on paint. Focus is a 3 px ring in the wall's text color.</p><div class="sys-body">${buttons}</div></div>
      <div class="sys-row" data-tokens="link"><h3>Link</h3><p>Links are underlined. The underline grows on hover.</p><div class="sys-body"><div class="linkdemo">
        <div><p class="cap">Inline, in a sentence</p><p>Each chapter links to its article, for example <a class="link" href="${esc(la.href)}">${esc(la.title)}</a>, one step away.</p></div>
        <div><p class="cap">Standalone, with an arrow</p><p><a class="link-go" href="${esc(la.href)}">${esc(la.title)}${ui('arrow')}</a></p></div>
      </div></div></div>
      <div class="sys-row" data-tokens="icon"><h3>Icon</h3><p>Drawn on a square grid with square caps and one line weight. The six chapter objects, then the controls.</p><div class="sys-body"><div class="icons">${icons}</div></div></div>
      <div class="sys-row" data-tokens="motion"><h3>Motion</h3><p>One grammar: the paint floods, you walk, the number rolls, the text sets. Nothing linear.</p><div class="sys-body"><div class="motions">${motions}</div></div></div>
      <div class="sys-row" data-tokens="layout"><h3>Layout</h3><p>Twelve columns on a 1360 px wall. The gallery view is always one screen tall.</p><div class="sys-body"><div class="layoutdraw">
        <div class="cols" aria-hidden="true">${'<i></i>'.repeat(12)}<b><span>12 columns</span><span>gutter ${tok('--layout-gutter')}</span><span>max ${tok('--layout-max')}</span></b></div>
        <div class="bps" aria-hidden="true"><i class="rail"></i>${bpHtml}</div>
        <p class="layoutfacts"><span><b>Max width</b> ${tok('--layout-max')}</span><span><b>Margin</b> 16 to 40 px</span><span><b>Gutter</b> 24 px, 16 px on phone</span><span><b>Phone</b> under 720 px: one column</span><span><b>Short landscape</b> under 560 px tall: side mode</span></p>
      </div></div></div>`;

    $$('.tsize').forEach(dd => {
      const el = document.getElementById(dd.dataset.for);
      const s = getComputedStyle(el);
      const fs = parseFloat(s.fontSize), lh = parseFloat(s.lineHeight);
      dd.textContent = `${Math.round(fs)} px / ${isNaN(lh) ? 'normal' : Math.round(lh) + ' px'}`;
    });
    $('#sheet').addEventListener('click', e => {
      const b = e.target.closest('[data-replay]');
      if (b) demo(b.dataset.replay);
    });
  }

  function demo(k) {
    const box = $(`.mdemo[data-demo="${k}"]`);
    if (!box) return;
    const reduce = reduceMQ.matches;
    box.getAnimations({subtree: true}).forEach(a => a.cancel());
    if (reduce || k === 'fade') {
      const el = box.firstElementChild;
      el.animate([{opacity: 0}, {opacity: 1}], {duration: DUR.fade, easing: EASE.fade});
      return;
    }
    if (k === 'flood') $('.fl', box).animate([{clipPath: 'inset(32% 44% 32% 44%)'}, {clipPath: 'inset(0 0 0 0)'}], {duration: DUR.flood, easing: EASE.move});
    if (k === 'walk') $('.wk', box).animate([{transform: 'translateX(0)'}, {transform: 'translateX(-33.333%)'}], {duration: DUR.walk, easing: EASE.move});
    if (k === 'roll') $('.rn span', box).animate([{transform: 'translateY(112%)'}, {transform: 'none'}], {duration: DUR.roll, easing: EASE.out});
    if (k === 'set') $$('.st i', box).forEach((el, i) => el.animate([{opacity: 0, clipPath: 'inset(0 100% 0 0)'}, {opacity: 1, clipPath: 'inset(0 0 0 0)'}], {duration: DUR.set, delay: i * DUR.stagger * 2, easing: EASE.out, fill: 'backwards'}));
  }

  // =====================================================================
  // Init
  // =====================================================================
  async function init() {
    setState('moving');
    renderHome();
    buildOverview();
    renderCards();
    renderSheet();
    try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* fonts optional */ }
    drawPlanWalls();
    lastMode = mode();
    requestAnimationFrame(() => { drawPlanWalls(); setState('idle'); announce(null); });
  }
  init();
})();
