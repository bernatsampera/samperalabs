// A story page (/maat, /gcontext). Ported from the approved design-preview/design-system/clean/maat.html.
// The flow and motion are the accepted flyover-2 flow. Data comes from src/lib/stories, via StoryLayout.astro.
(() => {
  'use strict';
  const G = JSON.parse(document.getElementById('story-data').textContent);
  const root = document.documentElement;
  const $ = s => document.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = ym => { const [y, m] = ym.split('-').map(Number); return MONTHS[m - 1] + ' ' + y; };
  const monthIdx = ym => { const [y, m] = ym.split('-').map(Number); return y * 12 + m - 1; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

  // Easing: nothing linear.
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
  const cinematic = cubicBezier(.65, 0, .35, 1);
  const CINE = 'cubic-bezier(.65, 0, .35, 1)', OUT = 'cubic-bezier(.22, 1, .36, 1)', IN = 'cubic-bezier(.55, 0, .75, .2)';

  // ---------- Data ----------
  const PART = [{light: "#14141A", tint: "#F2F2F4", dark: "#14141A"}];
  const seasons = G.seasons.slice().sort((a, b) => a.id - b.id).map((s, si) => ({
    ...s, si, color: PART[si % PART.length],
    pale: '#FFFFFF',
    chapters: G.chapters.filter(c => c.season === s.id).sort((a, b) => a.date.localeCompare(b.date)),
  }));
  const totalChapters = seasons.reduce((n, s) => n + s.chapters.length, 0);
  const latest = G.chapters.find(c => c.latest) || G.chapters[G.chapters.length - 1];
  const latestSi = seasons.findIndex(s => s.id === latest.season);
  const latestStep = seasons[latestSi].chapters.indexOf(latest) + 1;
  const vars = s => `--light:${s.color.light};--tint:${s.color.tint};--dark:${s.color.dark};--pale:${s.pale}`;
  const dates = s => month(s.from) + ' to ' + (s.to ? month(s.to) : 'now');
  const ICON = name => `<svg viewBox="0 0 64 64" aria-hidden="true">${G.icons[name] || ''}</svg>`;
  const BACK = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  const CHEV_L = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const CHEV_R = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  const isPhone = () => innerWidth < 720;
  // Short landscape screens (a phone on its side): vertical path on the left, card on the right.
  const isSide = () => !isPhone() && innerHeight < 560;
  const isVert = () => isPhone() || isSide();
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');

  // Shared path geometry: the same normalized shape for the preview and the full path.
  const shape = n => Array.from({length: n}, (_, i) => ({u: n > 1 ? i / (n - 1) : 0, v: Math.sin(i * 1.3 + .55)}));
  function curve(P) {
    if (P.length < 2) return '';
    let d = `M${P[0].x.toFixed(1)} ${P[0].y.toFixed(1)}`;
    for (let k = 0; k < P.length - 1; k++) {
      const p0 = P[Math.max(k - 1, 0)], p1 = P[k], p2 = P[k + 1], p3 = P[Math.min(k + 2, P.length - 1)];
      const t = 1 / 6;
      d += `C${(p1.x + (p2.x - p0.x) * t).toFixed(1)} ${(p1.y + (p2.y - p0.y) * t).toFixed(1)} ${(p2.x - (p3.x - p1.x) * t).toFixed(1)} ${(p2.y - (p3.y - p1.y) * t).toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  // ---------- Start screen ----------
  const home = $('#home'), hMain = $('#h-main'), layersEl = $('#layers'), live = $('#live');
  // Overview: a simple timeline of the parts, then one card per part.
  let T = {first: 0, span: 1};
  const LANE_PAD = 10;
  let hoverBound = false;
  function buildHome() {
    const first = Math.min(...seasons.map(s => monthIdx(s.from)));
    const lastM = Math.max(monthIdx(latest.date), ...seasons.filter(s => s.to).map(s => monthIdx(s.to)));
    const span = lastM - first + 1;
    T = {first, span};
    const months = Array.from({length: span}, (_, i) => `<span class="m">${MONTHS[(first + i) % 12]}</span>`).join('');
    const lanes = seasons.map(s => `<div class="lane" data-si="${s.si}" style="${vars(s)}">
        <span class="lane-name"><i>${s.si + 1}</i>${esc(s.name)}</span>
        <svg class="lane-svg" aria-hidden="true"></svg>
      </div>`).join('');
    const cards = seasons.map(s => `<li class="entry" data-si="${s.si}" style="${vars(s)}">
        <p class="e-when"><i>${s.si + 1}</i>${dates(s)}</p>
        <h2 class="e-name">${esc(s.name)}</h2>
        <p class="e-mission">${esc(s.mission)}</p>
        <ol class="e-list">${s.chapters.map(c => `<li><b>${esc(c.short)}</b><span>${MONTHS[+c.date.slice(5) - 1]}</span></li>`).join('')}</ol>
        <div class="e-foot">
          <span class="e-count">${plural(s.chapters.length, 'chapter')}</span>
          <button type="button" class="enter" data-act="enter" data-si="${s.si}" aria-label="Open ${esc(s.name)}">Open</button>
        </div>
      </li>`).join('');
    hMain.innerHTML = `
      <section class="hero">
        <p class="eyebrow">${esc(G.journey.name)}, since ${month(seasons[0].from)}</p>
        <h1 class="h-title" id="home-title" tabindex="-1">${esc(G.journey.mission)}</h1>
        <p class="h-context">${esc(G.journey.context)}</p>
        <div class="h-actions">
          <button type="button" class="btn btn-ink" data-act="enter" data-si="0">Start from the beginning</button>
          <button type="button" class="btn btn-line" data-act="now" id="btn-now">Go to the newest chapter</button>
        </div>
      </section>
      <div class="chart" aria-label="Timeline of the ${seasons.length} parts">
        <div class="ruler" aria-hidden="true"><span></span><div class="months">${months}<span class="now">Now</span></div></div>
        <div class="lanes">${lanes}</div>
      </div>
      <ul class="seasons">${cards}</ul>`;
    if (!hoverBound) {
      hoverBound = true;
      const hot = si => hMain.querySelectorAll('.lane, .entry').forEach(e => e.classList.toggle('hot', e.dataset.si === si));
      hMain.addEventListener('mouseover', e => { const t = e.target.closest('.lane, .entry'); hot(t ? t.dataset.si : null); });
      hMain.addEventListener('mouseleave', () => hot(null));
    }
    drawMinis();
    document.fonts.ready.then(drawMinis);
  }
  function drawMinis() {
    const svgs = [...hMain.querySelectorAll('.lane-svg')];
    if (!svgs.length) return;
    const w = svgs[0].getBoundingClientRect().width, h = svgs[0].getBoundingClientRect().height || 36, y = h / 2;
    const X = (mi, f) => LANE_PAD + (mi + f) / T.span * (w - 2 * LANE_PAD);
    const XM = (ym, f) => X(monthIdx(ym) - T.first, f);
    const nowX = XM(latest.date, 1);
    svgs.forEach(svg => {
      const s = seasons[Number(svg.parentElement.dataset.si)];
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const col = s.color.light;
      let g = '';
      for (let i = 0; i < T.span; i++) g += `<line x1="${X(i, 0)}" y1="0" x2="${X(i, 0)}" y2="${h}" stroke="#E2E2E6" stroke-width="1"/>`;
      g += `<line x1="${nowX}" y1="0" x2="${nowX}" y2="${h}" stroke="#1D5BFF" stroke-width="1" opacity=".55"/>`;
      const xs = [XM(s.from, .05)];
      s.chapters.forEach(c => xs.push(Math.max(XM(c.date, .5), xs[xs.length - 1] + 12)));
      const lastX = xs[xs.length - 1];
      g += `<line x1="${xs[0]}" y1="${y}" x2="${lastX}" y2="${y}" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`;
      if (s.status !== 'done') g += `<line x1="${lastX + 8}" y1="${y}" x2="${nowX - 4}" y2="${y}" stroke="#9A9AA1" stroke-width="1.5" stroke-dasharray="1 5" stroke-linecap="round"/>`;
      xs.forEach((x, i) => {
        if (i === 0) g += `<circle cx="${x}" cy="${y}" r="3.5" fill="#FFFFFF" stroke="${col}" stroke-width="2"/>`;
        else g += `<circle cx="${x}" cy="${y}" r="4.5" fill="${col}" stroke="#F2F2F4" stroke-width="2"/>`;
      });
      svg.innerHTML = g;
    });
    const ms = hMain.querySelectorAll('.months .m');
    ms.forEach((m, i) => { m.style.left = X(i, 0) + 'px'; });
    const now = hMain.querySelector('.months .now');
    if (now) now.style.left = nowX + 'px';
  }

  // ---------- Season layer ----------
  function seasonMetrics(n) {
    const W = innerWidth, H = innerHeight, phone = isPhone();
    if (isSide()) {
      const top = 64, bar = 70, pathTop = top + 24;
      const gap = clamp((H - top - bar - 52) / Math.max(1, n - 1), 36, 64);
      const len = gap * (n - 1);
      return {phone, side: true, W, H, top, bar, axis: 'y', x: 46, y0: pathTop, len, amp: 7, zoneTop: top + 6, zoneLeft: Math.min(330, W * .42)};
    }
    if (phone) {
      const top = 64, bar = 70;
      const pathTop = top + 30;
      const avail = clamp(H * .26, 140, 240);
      const gap = clamp(avail / Math.max(1, n - 1), 44, 64);
      const len = gap * (n - 1);
      return {phone, W, H, top, bar, axis: 'y', x: 46, y0: pathTop, len, amp: 7, panLen: len, zoneTop: pathTop + len + 34};
    }
    const top = 80, bar = 88;
    const pathY = top + clamp(H * .2, 110, 200);
    const amp = 30;
    const x0 = clamp(W * .08, 80, 140), x1 = W - x0;
    const minGap = 230;
    const gap = Math.max(minGap, (x1 - x0) / Math.max(1, n - 1));
    const len = gap * (n - 1);
    return {phone, W, H, top, bar, axis: 'x', x0, x1, pathY, amp, len, pan: len > x1 - x0 + 1, zoneTop: pathY + amp + 110};
  }

  function buildSeason(si) {
    const s = seasons[si];
    const n = s.chapters.length + 1;
    const el = document.createElement('section');
    el.className = 'season on-dark' + (isVert() ? ' vert' : '') + (isSide() ? ' side' : '');
    el.setAttribute('style', vars(s));
    el.setAttribute('aria-label', s.name);
    el.dataset.si = si;
    const stops = [];
    stops.push(`<button type="button" class="stop start" data-go="0" aria-label="Start, ${month(s.from)}"><span class="dot"></span><span class="lab"><b>Start</b><i>${month(s.from)}</i></span></button>`);
    s.chapters.forEach((c, i) => {
      stops.push(`<button type="button" class="stop" data-go="${i + 1}" aria-label="Chapter ${i + 1}: ${esc(c.short)}, ${month(c.date)}"><span class="dot">${ICON(c.icon)}</span><span class="lab"><b>${esc(c.short)}</b><i>${month(c.date)}</i></span></button>`);
    });
    const dots = Array.from({length: n}, () => '<i></i>').join('');
    el.innerHTML = `
      <header class="s-top">
        <button type="button" class="exit" data-act="exit">${BACK}<span>Overview</span><kbd aria-hidden="true">Esc</kbd></button>
        <p class="s-tag"><span>${dates(s)}</span>${esc(s.name)}</p>
      </header>
      <div class="path-wrap"><div class="path-pan">
        <svg class="path-svg" aria-hidden="true"><path class="p-glow"/><path class="p-ahead"/><path class="p-done"/></svg>
        ${stops.join('')}
        <div class="marker" aria-hidden="true"></div>
      </div></div>
      <div class="stage"></div>
      <footer class="s-foot">
        <button type="button" class="nav-prev" data-act="prev" aria-label="Previous step">${CHEV_L}<span>Previous</span></button>
        <div class="s-prog"><span class="s-dots" aria-hidden="true">${dots}</span><span class="s-label"></span></div>
        <button type="button" class="nav-next" data-act="next" aria-label="Next step"><span>Next</span>${CHEV_R}</button>
      </footer>`;
    layersEl.appendChild(el);
    const L = {
      el, s, si, n, step: 0, D: 0,
      wrap: el.querySelector('.path-wrap'), pan: el.querySelector('.path-pan'), svg: el.querySelector('.path-svg'),
      pGlow: el.querySelector('.p-glow'), pAhead: el.querySelector('.p-ahead'), pDone: el.querySelector('.p-done'),
      marker: el.querySelector('.marker'), stops: [...el.querySelectorAll('.stop')], stage: el.querySelector('.stage'),
      prev: el.querySelector('.nav-prev'), next: el.querySelector('.nav-next'), dots: [...el.querySelectorAll('.s-dots i')], label: el.querySelector('.s-label'),
    };
    layoutSeason(L);
    return L;
  }

  function layoutSeason(L) {
    const m = seasonMetrics(L.n);
    L.m = m;
    const sh = shape(L.n);
    L.P = sh.map(p => m.axis === 'x'
      ? {x: m.x0 + p.u * m.len, y: m.pathY + m.amp * p.v}
      : {x: m.x + m.amp * p.v, y: m.y0 + p.u * m.len});
    const d = curve(L.P);
    [L.pGlow, L.pAhead, L.pDone].forEach(p => p.setAttribute('d', d));
    L.len = L.pDone.getTotalLength();
    // Distance along the path for each node.
    L.nodeD = [0];
    for (let k = 1; k < L.n; k++) {
      const tmp = document.createElementNS(NS, 'path');
      tmp.setAttribute('d', curve(L.P.slice(0, k + 1)));
      L.svg.appendChild(tmp);
      L.nodeD.push(tmp.getTotalLength());
      tmp.remove();
    }
    L.stops.forEach((b, i) => { b.style.setProperty('--x', L.P[i].x.toFixed(1)); b.style.setProperty('--y', L.P[i].y.toFixed(1)); });
    const panW = m.axis === 'x' ? m.x0 * 2 + m.len : m.W;
    L.pan.style.width = panW + 'px';
    L.svg.setAttribute('width', panW);
    L.svg.setAttribute('height', m.H);
    L.svg.setAttribute('viewBox', `0 0 ${panW} ${m.H}`);
    renderSeason(L);
    placeStage(L);
  }

  // Gentle pan only when the path is wider than the screen. Otherwise the camera never moves.
  function panFor(L, D) {
    const m = L.m;
    if (!m.pan) return 0;
    const p = L.pDone.getPointAtLength(clamp(D, 0, L.len));
    return clamp(m.W / 2 - p.x, m.W - (m.x0 * 2 + m.len), 0);
  }
  function renderSeason(L) {
    const D = clamp(L.D, 0, L.len);
    const Ds = D;
    L.pDone.style.strokeDasharray = `${Ds.toFixed(2)} ${(L.len + 20).toFixed(1)}`;
    L.pDone.style.visibility = Ds < .5 ? 'hidden' : '';
    const p = L.pDone.getPointAtLength(D);
    L.marker.style.transform = `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px)`;
    L.pan.style.transform = `translateX(${panFor(L, D).toFixed(1)}px)`;
    L.stops.forEach((b, i) => {
      const v = D >= L.nodeD[i] - 1;
      if (b.__v !== v) { b.__v = v; b.classList.toggle('visited', v); b.classList.toggle('ahead', !v); }
    });
  }
  function setRest(L, step, moving) {
    L.stops.forEach((b, i) => {
      const cur = !moving && i === step;
      b.classList.toggle('current', cur);
      if (cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    // The marker stays visible where it arrives.
    L.marker.classList.remove('hide');
  }
  function updateControls(L, step) {
    L.prev.disabled = step === 0;
    // On the last chapter, Next opens the following part.
    const nextS = step === L.n - 1 ? seasons[L.si + 1] : null;
    L.next.disabled = step === L.n - 1 && !nextS;
    L.next.querySelector('span').textContent = nextS ? `Next: ${nextS.name}` : 'Next';
    L.next.setAttribute('aria-label', nextS ? `Next part: ${nextS.name}` : 'Next chapter');
    L.dots.forEach((d, i) => { d.classList.toggle('on', i < step); d.classList.toggle('cur', i === step); });
    L.label.textContent = step === 0 ? 'Start' : `Chapter ${step} of ${L.s.chapters.length}`;
  }

  // ---------- Stage content ----------
  function stageEl(L, step) {
    const s = L.s;
    let html;
    if (step === 0) {
      html = `<div class="opener">
        <p class="o-kicker" data-st="0">${plural(s.chapters.length, 'chapter')}, ${dates(s)}</p>
        <h2 class="o-name" tabindex="-1" data-st="1">${esc(s.name)}</h2>
        <p class="o-mission" data-st="2">${esc(s.mission)}</p>
        <p class="o-meta" data-st="3">Press Next, or pick a point on the path.</p>
      </div>`;
    } else {
      const c = s.chapters[step - 1];
      html = `<article class="card"><span class="caret"></span><div class="card-in">
        <header class="band"><p>Chapter ${step} of ${s.chapters.length}, ${month(c.date)}</p><span class="ci">${ICON(c.icon)}</span></header>
        <h2 class="c-title" tabindex="-1">${esc(c.title)}</h2>
        <div class="c-main">
          <div class="c-simple">${c.simple.map(p => `<p>${esc(p)}</p>`).join('')}</div>
          ${c.article ? `<a class="read" href="${esc(c.article.href)}">Read the full chapter${CHEV_R}</a>` : ''}
        </div>
        <div class="c-side"><div class="learned"><p class="learned-lbl">What I learned</p><p>${esc(c.learned)}</p></div></div>
      </div></article>`;
    }
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    const node = t.content.firstElementChild;
    node.dataset.step = step;
    return node;
  }
  function placeStage(L, node) {
    node = node || L.stage.lastElementChild;
    if (!node) return;
    const m = L.m;
    if (m.side) {
      const left = m.zoneLeft, w = m.W - left - 24, maxH = m.H - m.bar - m.top - 14;
      node.style.left = left + 'px';
      node.style.top = m.zoneTop + 'px';
      node.style.width = w + 'px';
      const inner = node.querySelector('.card-in, .end-in');
      if (inner) inner.style.maxHeight = maxH + 'px';
      else node.style.maxHeight = maxH + 'px';
      return;
    }
    if (m.phone) {
      const inner = node.querySelector('.card-in, .end-in');
      if (inner) inner.style.maxHeight = Math.max(160, m.H - m.bar - m.zoneTop) + 'px';
      return;
    }
    const step = Number(node.dataset.step);
    const panX = panFor(L, L.nodeD[step]);
    const nodeX = L.P[step].x + panX;
    const zoneH = m.H - m.bar - 14 - m.zoneTop;
    if (node.classList.contains('opener')) {
      node.style.left = (L.P[0].x + panX - 24) + 'px';
      node.style.top = (m.zoneTop + 6) + 'px';
      return;
    }
    const w = node.offsetWidth;
    const left = clamp(nodeX - w / 2, 32, m.W - 32 - w);
    node.style.left = left + 'px';
    node.style.top = m.zoneTop + 'px';
    const inner = node.querySelector('.card-in, .end-in');
    if (inner) inner.style.maxHeight = zoneH + 'px';
    const caret = node.querySelector('.caret');
    if (caret) caret.style.left = clamp(nodeX - left, 34, w - 34) + 'px';
  }

  // ---------- Transition runner ----------
  let running = null;
  let cur = null; // the season layer in view, or null on the start screen
  function run(T, frame, done) {
    const t0 = performance.now();
    let raf = 0, over = false;
    const anims = [];
    const end = interrupted => { if (over) return; over = true; cancelAnimationFrame(raf); if (interrupted) anims.forEach(a => { try { a.finish(); } catch (e) { /* gone */ } }); done(interrupted); };
    const tick = now => { const t = Math.min(1, (now - t0) / T); frame(t * T); if (t < 1) raf = requestAnimationFrame(tick); else end(false); };
    raf = requestAnimationFrame(tick);
    const ctl = {anims, finish() { if (over) return; frame(T); end(true); }};
    running = ctl;
    return ctl;
  }
  const finishRunning = () => { if (running) { const r = running; running = null; r.finish(); } };
  const setState = (state) => { root.dataset.state = state; };
  function setView() {
    root.dataset.view = cur ? 'season' : 'home';
    root.dataset.season = cur ? String(cur.s.id) : '';
    root.dataset.step = cur ? String(cur.step) : '';
  }
  function announce(L) {
    if (!L) { live.textContent = `Overview. ${G.journey.name}: ${G.journey.mission}`; return; }
    const s = L.s, st = L.step;
    if (st === 0) live.textContent = `${s.name}. Mission: ${s.mission}`;
    else { const c = s.chapters[st - 1]; live.textContent = `${s.name}, chapter ${st} of ${s.chapters.length}: ${c.title}`; }
  }
  function focusHeading() {
    const h = cur ? cur.stage.querySelector('[tabindex="-1"]') : $('#home-title');
    if (h) h.focus({preventScroll: true});
  }
  function pulse(L, step) {
    const b = L.stops[step];
    b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse');
    setTimeout(() => b.classList.remove('pulse'), 950);
  }
  const travelTime = (a, b) => 900 + 140 * Math.max(0, Math.abs(b - a) - 1);

  // Stage swap: the old content fades out, the new one rises in at `at` ms.
  function swapStage(L, step, at, anims, reduce) {
    const old = [...L.stage.children];
    const node = stageEl(L, step);
    L.stage.appendChild(node);
    placeStage(L, node);
    old.forEach(o => anims.push(o.animate([{opacity: 1}, {opacity: 0, transform: 'translateY(8px)'}], {duration: reduce ? 150 : 200, easing: IN, fill: 'forwards'})));
    if (reduce) anims.push(node.animate([{opacity: 0}, {opacity: 1}], {duration: 200, delay: 150, easing: 'ease-out', fill: 'backwards'}));
    else if (node.classList.contains('opener')) {
      node.querySelectorAll('[data-st]').forEach(it => anims.push(it.animate([{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {duration: 560, delay: at + Number(it.dataset.st) * 130, easing: OUT, fill: 'backwards'})));
    } else {
      anims.push(node.animate([{opacity: 0, transform: isPhone() ? 'translateY(36px)' : 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {duration: 460, delay: at, easing: OUT, fill: 'backwards'}));
    }
    return old;
  }

  // Move inside a season: the marker travels, the card changes. The camera does not move.
  function goStep(target) {
    if (!cur) return;
    const L = cur;
    target = clamp(target, 0, L.n - 1);
    finishRunning();
    if (target === L.step) { pulse(L, target); focusHeading(); return; }
    const from = L.step;
    const reduce = reduceMQ.matches;
    L.step = target;
    setState('moving'); setView();
    updateControls(L, target);
    setRest(L, target, true);
    const D0 = L.D, D1 = L.nodeD[target];
    const dur = reduce ? 360 : travelTime(from, target);
    const T = reduce ? 380 : dur + 380;
    const anims = [];
    const old = swapStage(L, target, reduce ? 0 : Math.round(dur * .72), anims, reduce);
    let arrived = false;
    const ctl = run(T, ms => {
      if (reduce) { if (ms >= 150 && L.D !== D1) { L.D = D1; renderSeason(L); } }
      else { L.D = lerp(D0, D1, cinematic(clamp(ms / dur, 0, 1))); renderSeason(L); }
      if (!arrived && ms >= (reduce ? 150 : dur)) { arrived = true; setRest(L, target, false); if (!reduce) pulse(L, target); }
    }, interrupted => {
      running = null;
      L.D = D1; renderSeason(L);
      old.forEach(o => o.remove());
      setRest(L, target, false);
      setState('idle');
      if (!interrupted) { announce(L); focusHeading(); }
    });
    ctl.anims.push(...anims);
  }

  // Enter a season: the chosen entry grows into the full season. One move.
  function enterSeason(si, opts = {}) {
    finishRunning();
    const reduce = reduceMQ.matches;
    const target = opts.target || 0;
    const prev = cur;
    const L = buildSeason(si);
    cur = L;
    history.replaceState(null, '', '#part-' + L.s.id);
    L.step = target; L.D = 0;
    setState('moving'); setView();
    updateControls(L, target);
    setRest(L, 0, target > 0);
    if (target === 0) L.stage.appendChild(stageEl(L, 0)), placeStage(L);
    renderSeason(L);
    const anims = [];
    const fadeParts = [L.el.querySelector('.s-top'), L.el.querySelector('.s-foot')];
    const labs = [...L.el.querySelectorAll('.lab, .here-tag')];
    let enterT = 0;
    const W = innerWidth, H = innerHeight;
    if (reduce) {
      anims.push(L.el.animate([{opacity: 0}, {opacity: 1}], {duration: 260, easing: 'ease-out', fill: 'backwards'}));
      enterT = 0;
    } else if (!prev) {
      // From the start screen: clip from the entry card to full screen, path preview grows into the path.
      const li = hMain.querySelector(`.entry[data-si="${si}"]`);
      const r = li.getBoundingClientRect();
      const rad = isPhone() ? 16 : 20;
      anims.push(L.el.animate([
        {clipPath: `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px round ${rad}px)`},
        {clipPath: 'inset(0px 0px 0px 0px round 0px)'},
      ], {duration: 950, easing: CINE, fill: 'backwards'}));
      anims.push(L.wrap.animate([{opacity: 0, transform: 'translateY(24px) scale(.96)'}, {opacity: 1, transform: 'none'}], {duration: 800, delay: 250, easing: OUT, fill: 'backwards'}));
      labs.forEach(lb => anims.push(lb.animate([{opacity: 0}, {opacity: 1}], {duration: 420, delay: 720, easing: 'ease-out', fill: 'backwards'})));
      fadeParts.forEach(p => anims.push(p.animate([{opacity: 0, transform: 'translateY(-6px)'}, {opacity: 1, transform: 'none'}], {duration: 420, delay: 650, easing: OUT, fill: 'backwards'})));
      anims.push(home.animate([{transform: 'none', opacity: 1}, {transform: 'scale(.97)', opacity: .7}], {duration: 950, easing: CINE, fill: 'forwards'}));
      enterT = 950;
    } else {
      // From another season: the next season wipes in from the right.
      anims.push(L.el.animate([{clipPath: 'inset(0px 0px 0px 100%)'}, {clipPath: 'inset(0px 0px 0px 0%)'}], {duration: 850, easing: CINE, fill: 'backwards'}));
      anims.push(L.wrap.animate([{opacity: 0, transform: 'translateX(90px)'}, {opacity: 1, transform: 'none'}], {duration: 750, delay: 250, easing: OUT, fill: 'backwards'}));
      anims.push(prev.el.animate([{transform: 'none'}, {transform: 'translateX(-12%)'}], {duration: 850, easing: CINE, fill: 'forwards'}));
      enterT = 850;
    }
    if (target === 0 && !reduce) {
      L.stage.querySelectorAll('[data-st]').forEach(it => anims.push(it.animate([{opacity: 0, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}], {duration: 600, delay: enterT - 250 + Number(it.dataset.st) * 140, easing: OUT, fill: 'backwards'})));
    }
    // Optional travel straight to a chapter (Jump to now).
    let old = [];
    let dur = 0, T;
    const D1 = L.nodeD[target];
    if (target > 0) {
      dur = reduce ? 0 : travelTime(0, target);
      old = swapStage(L, target, reduce ? 0 : enterT + Math.round(dur * .72), anims, reduce);
      T = reduce ? 420 : enterT + dur + 420;
    } else T = reduce ? 300 : enterT + 700;
    let arrived = false;
    const ctl = run(T, ms => {
      if (target > 0) {
        if (reduce) { if (L.D !== D1) { L.D = D1; renderSeason(L); } }
        else { L.D = lerp(0, D1, cinematic(clamp((ms - enterT) / dur, 0, 1))); renderSeason(L); }
        if (!arrived && ms >= enterT + dur) { arrived = true; setRest(L, target, false); if (!reduce) pulse(L, target); }
      }
    }, interrupted => {
      running = null;
      L.D = D1; renderSeason(L);
      old.forEach(o => o.remove());
      if (prev) prev.el.remove();
      home.getAnimations().forEach(a => a.cancel());
      home.classList.add('away');
      home.inert = true;
      setRest(L, target, false);
      setState('idle');
      if (!interrupted) { announce(L); focusHeading(); }
    });
    ctl.anims.push(...anims);
  }

  // Back to the start screen: the season folds back into its entry.
  function exitHome() {
    if (!cur) return;
    finishRunning();
    const L = cur;
    const reduce = reduceMQ.matches;
    cur = null;
    history.replaceState(null, '', location.pathname);
    home.classList.remove('away');
    home.inert = false;
    setState('moving'); setView();
    const W = innerWidth, H = innerHeight;
    const li = hMain.querySelector(`.entry[data-si="${L.si}"]`);
    const r = li.getBoundingClientRect();
    const anims = [];
    let T;
    if (reduce) {
      anims.push(L.el.animate([{opacity: 1}, {opacity: 0}], {duration: 260, easing: 'ease-in', fill: 'forwards'}));
      T = 280;
    } else {
      const parts = [L.el.querySelector('.s-top'), L.el.querySelector('.s-foot'), L.stage, ...L.el.querySelectorAll('.lab, .here-tag, .marker')];
      parts.forEach(p => anims.push(p.animate([{opacity: 1}, {opacity: 0}], {duration: 220, easing: 'ease-in', fill: 'forwards'})));
      const rad = isPhone() ? 16 : 20;
      anims.push(L.el.animate([
        {clipPath: 'inset(0px 0px 0px 0px round 0px)'},
        {clipPath: `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px round ${rad}px)`},
      ], {duration: 800, delay: 120, easing: CINE, fill: 'forwards'}));
      anims.push(L.wrap.animate([{opacity: 1}, {opacity: 0}], {duration: 400, easing: 'ease-in', fill: 'forwards'}));
      anims.push(home.animate([{transform: 'scale(.97)', opacity: .7}, {transform: 'none', opacity: 1}], {duration: 900, easing: CINE, fill: 'backwards'}));
      T = 940;
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
    enterSeason(latestSi, {target: latestStep});
  }

  // ---------- Events ----------
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act], .stop');
    if (!b) return;
    if (b.classList.contains('stop')) { goStep(Number(b.dataset.go)); return; }
    const act = b.dataset.act;
    if (act === 'enter') enterSeason(Number(b.dataset.si));
    else if (act === 'now') jumpNow();
    else if (act === 'exit') exitHome();
    else if (act === 'prev') goStep(cur.step - 1);
    else if (act === 'next') { if (cur.step === cur.n - 1 && seasons[cur.si + 1]) enterSeason(cur.si + 1); else goStep(cur.step + 1); }
    else if (act === 'nextseason') { if (cur && seasons[cur.si + 1]) enterSeason(cur.si + 1); }
  });
  addEventListener('keydown', e => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const t = e.target;
    const onControl = t && t.closest && t.closest('button, a, input, select, textarea, [role="button"]');
    const fwd = () => { if (cur) { if (cur.step < cur.n - 1) goStep(cur.step + 1); else if (seasons[cur.si + 1]) enterSeason(cur.si + 1); } else enterSeason(0); };
    if (e.key === 'ArrowRight') { e.preventDefault(); fwd(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (cur && cur.step > 0) goStep(cur.step - 1); }
    else if (e.key === ' ' || e.key === 'Enter') { if (onControl) return; e.preventDefault(); fwd(); }
    else if (e.key === 'Escape' || e.key === 'Home') { if (cur) { e.preventDefault(); exitHome(); } }
    else if (e.key === 'End') { e.preventDefault(); jumpNow(); }
  });
  let rsT = 0, wasPhone = isPhone(), wasVert = isVert();
  addEventListener('resize', () => {
    clearTimeout(rsT);
    rsT = setTimeout(() => {
      finishRunning();
      if (isPhone() !== wasPhone || isVert() !== wasVert) {
        wasPhone = isPhone(); wasVert = isVert();
        buildHome();
        if (cur) { const si = cur.si, step = cur.step; cur.el.remove(); cur = buildSeason(si); cur.step = step; cur.D = cur.nodeD[step]; cur.stage.appendChild(stageEl(cur, step)); updateControls(cur, step); setRest(cur, step, false); }
      } else drawMinis();
      if (cur) { layoutSeason(cur); placeStage(cur); }
    }, 120);
  });

  // Test hook for scripts/site-design-e2e.mjs.
  window.story = {
    seasons, latestSi, latestStep,
    get view() { return cur ? 'season' : 'home'; },
    get season() { return cur ? cur.si : -1; },
    get step() { return cur ? cur.step : -1; },
    enter: si => enterSeason(si), exit: exitHome, go: goStep, jumpNow,
  };

  async function init() {
    setState('moving');
    try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* fonts optional */ }
    buildHome();
    setView();
    // A link to /<story>#part-N opens that part.
    const deep = seasons.findIndex(s => location.hash === '#part-' + s.id);
    if (deep >= 0) { setState('idle'); enterSeason(deep); return; }
    const items = [...hMain.querySelectorAll('.hero > *, .axis-row, .entry')];
    const anims = reduceMQ.matches ? [] : items.map((it, i) => it.animate([{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 600, delay: 80 + i * 70, easing: OUT, fill: 'backwards'}));
    const ctl = run(reduceMQ.matches ? 50 : 80 + items.length * 70 + 600, () => {}, () => { running = null; setState('idle'); announce(null); });
    ctl.anims.push(...anims);
  }
  init();
})();
