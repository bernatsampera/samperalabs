// Direction B: Picture statistics. Renders the page from window.WORLD and window.GUIDED,
// and runs the story view (the MAAT chart). Motion grammar: a row moves and scales into
// the frame, the symbols count in, the row slides under a red pointer, the caption wipes.
(() => {
  'use strict';
  const G = window.GUIDED, WD = window.WORLD, ISO = window.ISO;
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = ym => { const [y, m] = ym.split('-').map(Number); return y * 12 + m - 1; };
  const fromIdx = i => MONTHS[i % 12] + ' ' + Math.floor(i / 12);
  const month = ym => fromIdx(monthIdx(ym));
  const sym = ISO.sym, ui = ISO.ui;
  const RM = matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- Tokens, read once from style.css ----------
  const cs = getComputedStyle(root);
  const tok = n => cs.getPropertyValue(n).trim();
  const ms = n => { const v = tok(n); return /ms$/.test(v) ? parseFloat(v) : parseFloat(v) * 1000; };
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
  const D = {tick: ms('--dur-tick'), quick: ms('--dur-quick'), fade: ms('--dur-fade'), count: ms('--dur-count'), stagger: ms('--stagger-count'), wipe: ms('--dur-wipe'), move: ms('--dur-move'), hop: ms('--dur-hop')};
  const E = {out: tok('--ease-out'), move: tok('--ease-move'), in: tok('--ease-in')};
  const bez = n => cubicBezier(...tok(n).match(/-?[\d.]+/g).map(Number));
  const EF = {out: bez('--ease-out'), move: bez('--ease-move')};

  // ---------- Data ----------
  const seasons = G.seasons.slice().sort((a, b) => a.id - b.id).map((s, si) => ({
    ...s, si, cls: 'p' + s.id,
    chapters: G.chapters.filter(c => c.season === s.id).sort((a, b) => a.date.localeCompare(b.date)),
  }));
  const latest = G.chapters.find(c => c.latest) || G.chapters[G.chapters.length - 1];
  const latestSi = seasons.findIndex(s => s.id === latest.season);
  const latestStep = seasons[latestSi].chapters.indexOf(latest) + 1;
  const total = seasons.reduce((n, s) => n + s.chapters.length, 0);
  const firstM = Math.min(...seasons.map(s => monthIdx(s.from)));
  const lastM = Math.max(...G.chapters.map(c => monthIdx(c.date)), ...seasons.filter(s => s.to).map(s => monthIdx(s.to)));
  const COLS = lastM - firstM + 2; // one column per month, plus "Now"
  const yearOf = i => Math.floor(i / 12);
  const range = s => {
    const a = monthIdx(s.from);
    if (!s.to) return 'Since ' + fromIdx(a);
    const b = monthIdx(s.to);
    return yearOf(a) === yearOf(b) ? `${MONTHS[a % 12]} to ${fromIdx(b)}` : `${fromIdx(a)} to ${fromIdx(b)}`;
  };
  const endDate = s => s.to ? month(s.to) : 'Now';
  const stepDateIdx = (s, step) => {
    if (step <= 0) return monthIdx(s.from);
    if (step > s.chapters.length) return s.to ? monthIdx(s.to) : monthIdx(s.chapters[s.chapters.length - 1].date);
    return monthIdx(s.chapters[step - 1].date);
  };
  const worldCh = id => { for (const j of WD.journeys) { const c = j.chapters.find(x => x.id === id); if (c) return c; } return null; };
  const readLink = c => {
    const w = worldCh(c.id);
    const art = c.article || (w && w.article);
    if (art) {
      const href = (w && w.article && w.article.href) || art.href || '#';
      return `<a class="read" href="${esc(href)}"><span>Read: ${esc(art.title)}</span>${ui('arrow')}</a>`;
    }
    return `<a class="read" href="#"><span>Read the full chapter</span>${ui('arrow')}</a>`;
  };
  const ARROW = ui('arrow', 'ui-fwd'), BACK = ui('back', 'ui-bwd');

  const keyHTML = (withNext, cls = '') => `<div class="key${cls ? ' ' + cls : ''}">
      <p class="key-item"><span class="key-mark">${sym('unit')}</span><span class="key-unit">1 symbol = 1 chapter</span></p>
      <p class="key-item"><span class="key-mark"><span class="key-bar"></span></span><span>Newest chapter</span></p>
      ${withNext ? `<p class="key-item"><span class="key-mark">${sym('question')}</span><span>Next, not written yet</span></p>` : ''}
    </div>`;

  // ---------- Direction bar ----------
  $('#dbar-back').insertAdjacentHTML('afterbegin', ui('back'));
  $('#dbar-name').insertAdjacentHTML('afterbegin', sym('heads'));

  // ---------- Home: one chart ----------
  function buildHome() {
    const p = WD.person;
    const research = WD.journeys.find(j => j.id === 'knowledge');
    const rows = seasons.map(s => {
      const set = s.chapters.map(c => `<span class="${c.latest ? 'is-new' : ''}">${sym(c.icon)}</span>`).join('');
      const newIdx = s.chapters.findIndex(c => c.latest);
      const bar = newIdx >= 0 ? `<span class="h-bar" style="left:calc(${newIdx} * (var(--sym-chart) + var(--sym-gap)))"></span>` : '';
      const note = newIdx >= 0 ? `<p class="h-note"><b>Newest:</b> ${esc(latest.title)}, <time>${month(latest.date)}</time></p>` : '';
      return `<li class="h-row ${s.cls}">
          <p class="h-plabel">${esc(s.name)}<small class="num">${range(s)}</small></p>
          <div class="h-syms"><span class="h-set" role="img" aria-label="${plural(s.chapters.length, 'chapter')}">${set}${bar}</span>${note}</div>
        </li>`;
    }).join('');
    const rc = research.chapters;
    const rNew = rc.findIndex(c => c.status === 'latest');
    const rNext = rc.find(c => c.status === 'next');
    const rDone = rc.filter(c => c.status !== 'next').length;
    const rSet = rc.map(c => sym(c.status === 'next' ? 'question' : c.icon)).join('');
    const rBar = rNew >= 0 ? `<span class="h-bar" style="left:calc(${rNew} * (var(--sym-chart) + var(--sym-gap)))"></span>` : '';
    $('#home-in').innerHTML = `
      <header class="h-head">
        <div>
          <h1 class="h-motto" id="h-motto">${esc(p.motto)}</h1>
          <p class="h-who">${sym('person')}<span><b>${esc(p.name)}</b>, ${esc(p.role)}. ${esc(p.line)}</span></p>
        </div>
        ${keyHTML(true)}
      </header>
      <div class="h-chart">
        <div class="h-group">
          <div class="h-glabel">
            <h2 class="h-jname">${esc(G.journey.name)}</h2>
            <p class="h-jmission">${esc(G.journey.mission)}</p>
            <p class="h-jcount"><b class="num">${total}</b> chapters in <b class="num">${seasons.length}</b> parts, since <time>${fromIdx(firstM)}</time></p>
            <a class="btn btn-primary" href="#story" data-act="home-enter">Enter ${esc(G.journey.name)}${ARROW}</a>
          </div>
          <ol class="h-rows" style="display:contents">${rows}</ol>
        </div>
        <div class="h-group pr">
          <div class="h-glabel">
            <h2 class="h-jname">${esc(research.name)}</h2>
            <p class="h-jmission">${esc(research.mission)}</p>
            <p class="h-jcount"><b class="num">${rDone}</b> chapters, <b class="num">1</b> next</p>
          </div>
          <div class="h-row">
            <p class="h-plabel">My own research<small class="num">Since ${month(rc[0].date)}</small></p>
            <div class="h-syms"><span class="h-set" role="img" aria-label="${plural(rDone, 'chapter')} and one next">${rSet}${rBar}</span>
              <p class="h-note"><b>Next:</b> ${esc(rNext.title)}</p></div>
          </div>
        </div>
        <div class="h-also">
          <h2>Also built</h2>
          <ul>${WD.products.map(pr => `<li><a class="link" href="${esc(pr.href)}" rel="noopener">${esc(pr.name)}${ui('out')}</a><span>${esc(pr.line)}</span></li>`).join('')}</ul>
        </div>
      </div>`;
  }

  // ---------- Story overview: the MAAT chart ----------
  const frame = $('#story-frame');
  let ov, live;
  function buildOverview() {
    const entries = seasons.map(s => {
      const a = monthIdx(s.from) - firstM;
      const b = s.to ? monthIdx(s.to) - firstM + 1 : COLS;
      const seen = {};
      const syms = s.chapters.map((c, ci) => {
        const m = monthIdx(c.date) - firstM;
        const k = seen[m] = (seen[m] ?? -1) + 1;
        return `<span class="e-sym" data-ci="${ci}" style="--m:${m};--k:${k}">${sym(c.icon)}</span>` + (c.latest ? `<span class="e-now" style="--m:${m}"></span>` : '');
      }).join('');
      return `<li class="entry ${s.cls}" data-si="${s.si}">
          <div class="e-label"><h3 class="e-name">${esc(s.name)}</h3><p class="e-meta"><span class="num">${range(s)}</span>, ${plural(s.chapters.length, 'chapter')}</p></div>
          <div class="e-plot" aria-hidden="true"><span class="e-span${s.to ? '' : ' open'}" style="--a:${a};--b:${b}"></span>${syms}</div>
          <button type="button" class="btn btn-secondary enter" data-act="enter" data-si="${s.si}" aria-label="Enter ${esc(s.name)}"><span>Enter</span>${ARROW}</button>
        </li>`;
    }).join('');
    const ticks = Array.from({length: COLS}, (_, i) => i === COLS - 1 ? '<span class="now">Now</span>' : `<span>${MONTHS[(firstM + i) % 12]}</span>`).join('');
    frame.innerHTML = `
      <div class="ov" id="ov">
        <div class="ov-in">
          <div class="ov-head">
            <h2 class="ov-q" id="ov-q" tabindex="-1">${esc(G.journey.mission)}</h2>
            <div class="ov-side">
              <p class="ov-meta">${esc(G.journey.name)}: <span class="num">${seasons.length}</span> parts, <span class="num">${total}</span> chapters, <span class="num">${fromIdx(firstM)}</span> to now</p>
              <p class="ov-context">${esc(G.journey.context)}</p>
              <div class="ov-actions">
                <button type="button" class="btn btn-primary" data-act="enter" data-si="0">Start the journey${ARROW}</button>
                <button type="button" class="btn btn-now" data-act="now">Jump to now</button>
              </div>
            </div>
          </div>
          <div class="ov-chart" style="--cols:${COLS}">
            <div class="ov-chart-head"><h3>The three parts, month by month</h3>${keyHTML(false, 'key-row')}</div>
            <ol class="ov-rows">${entries}</ol>
            <div class="ov-axis" aria-hidden="true"><span class="ov-axis-year num">${yearOf(firstM)}</span><div class="ov-ticks">${ticks}</div><span></span></div>
          </div>
        </div>
        <span class="ov-ptr" aria-hidden="true"></span>
      </div>
      <p class="sr-only" aria-live="polite" id="live"></p>`;
    ov = $('#ov');
    live = $('#live');
  }

  // ---------- Part view ----------
  let cur = null;
  let running = null;
  const setState = st => { frame.dataset.state = st; };
  const isVertMode = () => frame.clientWidth < 720 || frame.clientHeight < 560;

  function buildPart(si) {
    const s = seasons[si];
    const n = s.chapters.length + 2;
    const el = document.createElement('section');
    el.className = 'part ' + s.cls;
    el.setAttribute('aria-label', s.name);
    const stops = [`<button type="button" class="stop start" data-go="0" aria-label="Start, ${month(s.from)}"><span class="tick"></span><span class="lab"><b>Start</b><i>${month(s.from)}</i></span></button>`];
    s.chapters.forEach((c, i) => stops.push(`<button type="button" class="stop" data-go="${i + 1}" aria-label="Chapter ${i + 1}: ${esc(c.short)}, ${month(c.date)}${c.latest ? ', the newest chapter' : ''}">${sym(c.icon)}<span class="lab"><b>${esc(c.short)}</b><i>${month(c.date)}</i></span></button>`));
    stops.push(`<button type="button" class="stop end" data-go="${n - 1}" aria-label="Mission: ${esc(s.mission)}">${sym('flag')}<span class="lab"><b>Mission</b><i>${endDate(s)}</i></span></button>`);
    el.innerHTML = `
      <header class="pt-top">
        <button type="button" class="btn-quiet exit" data-act="exit">${BACK}<span class="exit-word">Overview</span><kbd aria-hidden="true">Esc</kbd></button>
        <p class="pt-name"><b>${esc(s.name)}</b><span class="num">${range(s)}</span></p>
        <div class="key"><p class="key-item"><span class="key-mark">${sym('unit')}</span><span class="key-unit">1 symbol = 1 chapter</span></p></div>
      </header>
      <div class="pt-row"><div class="pt-axis"></div><div class="pt-track"><span class="pt-rule"></span>${stops.join('')}<span class="pointer" aria-hidden="true"></span></div></div>
      <div class="stage"></div>
      <div class="wipe" aria-hidden="true"></div>
      <footer class="pt-foot">
        <button type="button" class="btn btn-secondary nav-prev" data-act="prev" aria-label="Previous step">${ui('chev-l', 'ui-bwd')}<span class="nav-word">Previous</span></button>
        <p class="pt-prog"><span class="s-label"></span><span class="tk-d num"></span></p>
        <button type="button" class="btn btn-primary nav-next" data-act="next" aria-label="Next step"><span>Next</span>${ui('chev-r', 'ui-fwd')}</button>
      </footer>`;
    frame.insertBefore(el, live);
    const L = {
      el, s, si, n, step: 0,
      top: $('.pt-top', el), name: $('.pt-name b', el), nameDate: $('.pt-name span', el), topKey: $('.pt-top .key', el), exitBtn: $('.exit', el),
      row: $('.pt-row', el), axis: $('.pt-axis', el), track: $('.pt-track', el), rule: $('.pt-rule', el), ptr: $('.pointer', el),
      stops: $$('.stop', el), stage: $('.stage', el), wipe: $('.wipe', el), foot: $('.pt-foot', el),
      prev: $('.nav-prev', el), next: $('.nav-next', el), label: $('.s-label', el), tkd: $('.tk-d', el),
    };
    layoutPart(L);
    return L;
  }

  function layoutPart(L) {
    const W = frame.clientWidth, H = frame.clientHeight, n = L.n;
    const vert = isVertMode();
    const phone = W < 720;
    L.vert = vert;
    L.el.classList.toggle('vert', vert);
    const set = (k, v) => L.el.style.setProperty(k, v);
    if (!vert) {
      const big = H >= 820;
      const topH = big ? 72 : 64, footH = big ? 88 : 76;
      // The reading position is the middle of the frame. The row slides so the current stop sits there,
      // and every stop stays inside the frame.
      const m = 96, R = W / 2;
      let gap = clamp(Math.floor((W / 2 - m) / (n - 1)), 128, 232);
      if (gap * (n - 1) > W - 2 * m) gap = Math.floor((W - 2 * m) / (n - 1));
      // One symbol unit per frame size. Never larger than its slot on the baseline.
      const S = Math.min(H >= 860 ? 136 : H >= 690 ? 100 : 68, gap - 20);
      const rowTop = topH + (big ? 34 : 20);
      const baseY = S + 12;
      const rowH = baseY + 10 + 20 + 62;
      const zoneTop = rowTop + rowH + (big ? 18 : 10);
      const zoneB = big ? 24 : 16;
      const zoneH = H - footH - zoneB - zoneTop;
      set('--zone-b', zoneB + 'px');
      L.xs = Array.from({length: n}, (_, k) => k * gap);
      const len = gap * (n - 1);
      const lo = Math.min(m, W - m - len), hi = Math.max(m, W - m - len);
      L.offFor = k => Math.round(clamp(R - L.xs[k], lo, hi));
      L.S = S;
      set('--top-h', topH + 'px'); set('--foot-h', footH + 'px');
      set('--row-top', rowTop + 'px'); set('--row-h', rowH + 'px'); set('--base-y', baseY + 'px');
      set('--s', S + 'px'); set('--rule-w', len + 'px'); set('--stop-w', Math.min(gap - 4, 2 * (m - 6)) + 'px');
      set('--zone-top', zoneTop + 'px');
      set('--plate', Math.round(clamp(zoneH, 150, 420)) + 'px');
      L.stage.style.left = L.stage.style.right = '';
      L.rule.style.top = L.rule.style.height = '';
      L.stops.forEach((b, k) => { b.style.setProperty('--x', L.xs[k]); b.style.removeProperty('--y'); });
    } else {
      const topH = phone ? 60 : 56, footH = phone ? 72 : 64;
      const S = phone ? 40 : 34;
      const rowTop = topH + (phone ? 18 : 12);
      const pitch = phone ? clamp(Math.floor((H * 0.36) / (n - 1)), 46, 58) : clamp(Math.floor((H - topH - footH - 30 - S) / (n - 1)), 38, 56);
      const ys = Array.from({length: n}, (_, k) => Math.round(S / 2 + k * pitch));
      const rowH = ys[n - 1] + S / 2;
      L.xs = ys; L.offFor = () => 0; L.S = S;
      const ptrX = phone ? 14 : 20, ruleX = ptrX + 10 + 6, symX = ruleX + 8 + 10;
      set('--top-h', topH + 'px'); set('--foot-h', footH + 'px');
      set('--row-top', rowTop + 'px'); set('--row-h', rowH + 'px'); set('--base-y', '0px');
      set('--s', S + 'px'); set('--rule-w', (ys[n - 1] - ys[0]) + 'px'); set('--stop-w', (phone ? W - 28 : 280) + 'px');
      set('--ptr-x', ptrX + 'px'); set('--rule-x', ruleX + 'px'); set('--sym-x', symX + 'px');
      set('--plate', (phone ? 56 : 52) + 'px');
      L.rule.style.top = ys[0] + 'px';
      if (phone) {
        set('--zone-top', (rowTop + rowH + 22) + 'px');
        L.stage.style.left = '14px'; L.stage.style.right = '14px';
      } else {
        set('--zone-top', (topH + 16) + 'px');
        L.stage.style.left = Math.min(330, Math.round(W * 0.4)) + 'px'; L.stage.style.right = '24px';
      }
      L.stops.forEach((b, k) => { b.style.setProperty('--y', ys[k]); b.style.removeProperty('--x'); });
    }
    applyRow(L, L.step);
  }

  const ptrT = (L, step) => L.vert ? `translateY(${L.xs[step] - L.S / 2}px)` : `translateX(${L.xs[step] - L.S / 2}px)`;
  const trackT = (L, step) => L.vert ? 'none' : `translateX(${L.offFor(step)}px)`;
  function applyRow(L, step) {
    L.track.style.transform = trackT(L, step);
    L.ptr.style.transform = ptrT(L, step);
    setCurrent(L, step);
  }
  function setCurrent(L, step) {
    L.stops.forEach((b, i) => {
      b.classList.toggle('current', i === step);
      if (i === step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }
  function updateControls(L, step) {
    L.prev.disabled = step === 0;
    L.next.disabled = step === L.n - 1;
  }
  // Progress label: "Start", "Chapter n of m", "Mission". Numbers and months tick.
  const progKind = (L, step) => step === 0 ? 'start' : step === L.n - 1 ? 'end' : 'ch';
  function writeProgress(L, step, nVal, dIdx) {
    const kind = progKind(L, step);
    if (kind === 'ch') {
      if (!L.label.querySelector('.tk')) L.label.innerHTML = `Chapter <b class="tk num"></b> of <span class="num">${L.s.chapters.length}</span>`;
      L.label.querySelector('.tk').textContent = nVal;
    } else L.label.textContent = kind === 'start' ? 'Start' : 'Mission';
    L.tkd.textContent = kind === 'end' ? range(L.s) : fromIdx(dIdx);
  }
  const bump = el => el.animate([{transform: 'translateY(40%)', opacity: 0.2}, {transform: 'none', opacity: 1}], {duration: D.tick, easing: E.out});
  // Returns a frame function that ticks the counters from one step to another over `dur` ms.
  function progressTicker(L, from, to, at, dur) {
    const kf = progKind(L, from), kt = progKind(L, to);
    const d0 = stepDateIdx(L.s, from), d1 = stepDateIdx(L.s, to);
    const ns = kf === 'ch' && kt === 'ch' ? range2(from, to) : [to];
    const ds = range2(d0, d1);
    let ni = -1, di = -1, done = false;
    if (kf !== kt) { writeProgress(L, to, to, d0); bump(L.label); }
    return t => {
      if (done) return;
      const p = t === Infinity ? 1 : EF.out(clamp((t - at) / dur, 0, 1));
      const a = Math.min(ns.length - 1, Math.floor(p * (ns.length - 1) + 1e-6));
      const b = Math.min(ds.length - 1, Math.floor(p * (ds.length - 1) + 1e-6));
      if (a !== ni || b !== di) {
        const nChanged = a !== ni && ni !== -1, dChanged = b !== di && di !== -1;
        ni = a; di = b;
        writeProgress(L, to, ns[a], ds[b]);
        const tk = L.label.querySelector('.tk');
        if (nChanged && tk) bump(tk);
        if (dChanged && kt !== 'end') bump(L.tkd);
      }
      if (p >= 1) done = true;
    };
  }
  function range2(a, b) { const out = []; const s = Math.sign(b - a) || 1; for (let v = a; s > 0 ? v <= b : v >= b; v += s) out.push(v); return out.length > 9 ? [a, ...out.slice(-8)] : out; }

  // ---------- Stage content ----------
  function stageEl(L, step) {
    const s = L.s;
    let html;
    if (step === 0) {
      const tally = s.chapters.map(() => sym('unit')).join('');
      html = `<div class="opener">
          <div class="cap-plate"><div class="cap-field tally" style="--n:${s.chapters.length}" role="img" aria-label="${plural(s.chapters.length, 'chapter')}">${tally}</div></div>
          <div>
            <h2 class="o-name" tabindex="-1">${esc(s.name)}</h2>
            <p class="o-mission"><b>Mission:</b> ${esc(s.mission)}</p>
            <p class="o-meta"><span class="num o-count">${plural(s.chapters.length, 'chapter')}</span>, <span class="num">${range(s).replace(/^Since/, 'since')}</span></p>
            ${s.chapters[0] ? `<button type="button" class="btn btn-secondary o-begin" data-act="next"><span>First chapter: ${esc(s.chapters[0].short)}</span>${ARROW}</button>` : ''}
          </div>
        </div>`;
    } else if (step === L.n - 1) {
      const nextS = seasons[s.si + 1];
      html = `<div class="endcap">
          <div class="cap-plate"><div class="cap-field">${sym('flag')}</div></div>
          <div>
            <h2 class="end-title" tabindex="-1">${esc(s.mission)}</h2>
            <p class="end-meta">The mission of this part. <span class="num">${plural(s.chapters.length, 'chapter')}</span>, <span class="num">${range(s).replace(/^Since/, 'since')}</span>.</p>
            <div class="end-actions">
              ${nextS ? `<button type="button" class="btn btn-primary" data-act="nextseason"><span>Next: ${esc(nextS.name)}</span>${ARROW}</button>` : ''}
              <button type="button" class="btn ${nextS ? 'btn-secondary' : 'btn-primary'}" data-act="exit">${BACK}<span>Back to overview</span></button>
            </div>
          </div>
        </div>`;
    } else {
      const c = s.chapters[step - 1];
      html = capHTML(c, step, s.chapters.length, {heading: 'h2', focus: true});
    }
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    const node = t.content.firstElementChild;
    node.dataset.step = step;
    return node;
  }
  function capHTML(c, n, m, o = {}) {
    const h = o.heading || 'h3';
    const isLatest = o.latest ?? !!c.latest;
    const icon = o.icon || c.icon;
    return `<article class="cap${o.cls ? ' ' + o.cls : ''}">
        <div class="cap-plate"><div class="cap-field">${sym(icon)}</div>${isLatest ? '<span class="cap-bar" aria-hidden="true"></span>' : ''}</div>
        <div class="cap-body">
          <div class="cap-main">
            <${h} class="c-title"${o.focus ? ' tabindex="-1"' : ''}>${esc(c.title)}</${h}>
            <p class="cap-meta">${o.meta || `<span class="num">Chapter ${n} of ${m}</span>, <time>${month(c.date)}</time>`}${isLatest ? ' <span class="here">You are here</span>' : ''}</p>
            <div class="cap-text">${c.simple.map(p => `<p>${esc(p)}</p>`).join('')}</div>
          </div>
          <div class="cap-side">
            <div class="learned"><h4>What I learned</h4><p>${esc(c.learned)}</p></div>
            ${o.noLink ? `<p class="cap-none">${esc(o.noLink)}</p>` : readLink(c)}
          </div>
        </div>
      </article>`;
  }

  // ---------- Transition runner (from flyover-2) ----------
  function run(T, frameFn, done) {
    const t0 = performance.now();
    let raf = 0, over = false;
    const anims = [];
    const end = interrupted => { if (over) return; over = true; cancelAnimationFrame(raf); if (interrupted) anims.forEach(a => { try { a.finish(); } catch (e) { /* removed */ } }); done(interrupted); };
    const tick = now => { const t = Math.min(T, now - t0); frameFn(t); if (t < T) raf = requestAnimationFrame(tick); else end(false); };
    raf = requestAnimationFrame(tick);
    const ctl = {anims, finish() { if (over) return; frameFn(T); end(true); }};
    running = ctl;
    return ctl;
  }
  // A new command first finishes whatever is moving. Chained runs (Jump to now) finish too.
  const finishRunning = () => { let guard = 0; while (running && guard++ < 5) { const r = running; running = null; r.finish(); } };

  const anim = (list, el, kf, o) => { if (el) list.push(el.animate(kf, o)); };
  function flipFrom(list, el, fromEl, o = {}) {
    const a = fromEl.getBoundingClientRect(), b = el.getBoundingClientRect();
    if (!a.width || !b.width || !b.height) return;
    const sx = a.width / b.width, sy = o.stretch ? a.height / b.height : sx;
    const base = o.base || '';
    list.push(el.animate([
      {transform: `translate(${(a.left - b.left).toFixed(1)}px, ${(a.top - b.top).toFixed(1)}px) ${base} scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`},
      {transform: base || 'none'},
    ], {duration: o.duration || D.move, delay: o.delay || 0, easing: o.easing || E.move, fill: 'backwards'}));
  }
  function flipTo(list, el, toEl, o = {}) {
    const a = toEl.getBoundingClientRect(), b = el.getBoundingClientRect();
    if (!a.width || !b.width || !b.height) return;
    const sx = a.width / b.width, sy = o.stretch ? a.height / b.height : sx;
    const base = o.base || '';
    list.push(el.animate([
      {transform: base || 'none'},
      {transform: `translate(${(a.left - b.left).toFixed(1)}px, ${(a.top - b.top).toFixed(1)}px) ${base} scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`},
    ], {duration: o.duration || D.move, delay: o.delay || 0, easing: o.easing || E.move, fill: 'forwards'}));
  }

  // The symbols count in, one by one, left to right (top to bottom on a phone).
  function countIn(L, at, list) {
    L.stops.forEach((b, i) => {
      const mark = b.querySelector('.sym, .tick');
      const d = at + i * D.stagger;
      list.push(mark.animate(L.vert
        ? [{clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-10px)'}, {clipPath: 'inset(0 0 0 0)', transform: 'none'}]
        : [{clipPath: 'inset(100% 0 0 0)', transform: 'translateY(16px)'}, {clipPath: 'inset(0 0 0 0)', transform: 'none'}],
      {duration: D.count, delay: d, easing: E.out, fill: 'backwards'}));
      const lab = b.querySelector('.lab');
      const base = L.vert ? 'translateY(-50%)' : '';
      list.push(lab.animate([{opacity: 0, transform: `${base} translateY(-6px)`}, {opacity: 1, transform: base || 'none'}], {duration: 420, delay: d + 150, easing: E.out, fill: 'backwards'}));
    });
    return at + (L.n - 1) * D.stagger + D.count;
  }
  function revealStage(node, at, list, skip) {
    const parts = [...node.querySelectorAll('.cap-plate, .c-title, .cap-meta, .cap-text, .cap-side, .o-name, .o-mission, .o-meta, .o-begin, .end-title, .end-meta, .end-actions')].filter(x => x !== skip);
    parts.forEach((p, i) => list.push(p.animate([{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'none'}], {duration: 520, delay: at + i * 50, easing: E.out, fill: 'backwards'})));
  }
  function chromeIn(L, at, list) {
    [L.top, L.foot].forEach(x => list.push(x.animate([{opacity: 0}, {opacity: 1}], {duration: 360, delay: at, easing: E.out, fill: 'backwards'})));
    list.push(L.axis.animate([{opacity: 0}, {opacity: 1}], {duration: 400, delay: at, easing: E.out, fill: 'backwards'}));
  }

  // Enter a part from the overview: the row moves and scales into the frame, then the symbols count in.
  function enterPart(si, opts = {}) {
    finishRunning();
    const reduce = RM.matches;
    const target = opts.target || 0;
    const L = buildPart(si);
    cur = L;
    L.step = target;
    setState('moving');
    updateControls(L, target);
    applyRow(L, target);
    writeProgress(L, target, target, stepDateIdx(L.s, target));
    const node = stageEl(L, target);
    L.stage.appendChild(node);
    const list = [];
    let T;
    const ovPtr = $('.ov-ptr', ov);
    if (reduce) {
      anim(list, L.el, [{opacity: 0}, {opacity: 1}], {duration: D.fade, easing: 'ease-out', fill: 'backwards'});
      anim(list, ov, [{opacity: 1}, {opacity: 0}], {duration: D.fade, easing: 'ease-out', fill: 'forwards'});
      L.el.classList.add('is-set');
      T = D.fade + 40;
    } else {
      const entry = $(`.entry[data-si="${si}"]`, ov);
      ov.classList.add('leaving');
      // The row: its rule and its name move and scale into place.
      flipFrom(list, L.rule, $('.e-span', entry), {stretch: true});
      const heading = $('.o-name', node);
      if (heading) flipFrom(list, heading, $('.e-name', entry), {duration: D.move + 80});
      else flipFrom(list, L.name, $('.e-name', entry));
      // The pointer arrives with the row when it ran there first (Jump to now).
      if (opts.fromRun && ovPtr) {
        flipFrom(list, L.ptr, ovPtr, {stretch: true, base: ptrT(L, target)});
        ovPtr.getAnimations().forEach(a => a.cancel());
      }
      // The chosen row hands over; the other rows drop away.
      $$('.e-name, .e-span', entry).forEach(x => anim(list, x, [{opacity: 0}, {opacity: 0}], {duration: D.move, fill: 'forwards'}));
      $$('.e-sym, .e-now, .e-meta, .enter', entry).forEach(x => anim(list, x, [{opacity: 1, transform: 'none'}, {opacity: 0, transform: 'translateY(-10px)'}], {duration: 220, easing: E.out, fill: 'forwards'}));
      const others = [...$$('.entry', ov).filter(e => e !== entry), $('.ov-head', ov), $('.ov-chart-head', ov), $('.ov-axis', ov)];
      others.forEach(x => {
        const dist = x.classList.contains('entry') ? Math.abs(Number(x.dataset.si) - si) : 2;
        anim(list, x, [{opacity: 1, transform: 'none'}, {opacity: 0, transform: 'translateY(56px)'}], {duration: 460, delay: (dist - 1) * 60, easing: E.in, fill: 'forwards'});
      });
      $$('.pt-top > :not(.pt-name), .pt-name span', L.el).forEach(x => anim(list, x, [{opacity: 0}, {opacity: 1}], {duration: 360, delay: D.move - 160, easing: E.out, fill: 'backwards'}));
      if (heading) anim(list, L.name, [{opacity: 0}, {opacity: 1}], {duration: 360, delay: D.move, easing: E.out, fill: 'backwards'});
      anim(list, L.foot, [{opacity: 0}, {opacity: 1}], {duration: 360, delay: D.move - 160, easing: E.out, fill: 'backwards'});
      anim(list, L.axis, [{opacity: 0}, {opacity: 1}], {duration: 400, delay: D.move - 240, easing: E.out, fill: 'backwards'});
      const tCount = Math.round(D.move * 0.66);
      const tDone = countIn(L, tCount, list);
      if (!opts.fromRun) anim(list, L.ptr, [{transform: `${ptrT(L, target)} scaleX(0)`}, {transform: `${ptrT(L, target)} scaleX(1)`}], {duration: 360, delay: tDone - 160, easing: E.out, fill: 'backwards'});
      revealStage(node, heading ? tDone - 380 : tDone - 300, list, heading);
      // The opener counts its chapters as the symbols arrive.
      const count = heading && $('.o-count', node);
      if (count) {
        const nC = L.s.chapters.length;
        for (let k = 1; k <= nC; k++) setTimeout(() => { if (count.isConnected && cur === L) { count.textContent = plural(k, 'chapter'); bump(count); } }, tCount + k * D.stagger + 120);
      }
      T = tDone + 420;
    }
    const ctl = run(T, () => {}, interrupted => {
      running = null;
      ov.classList.add('away');
      ov.inert = true;
      ov.style.opacity = '';
      ovPtr && ovPtr.getAnimations().forEach(a => a.cancel());
      L.el.classList.add('is-set');
      const count = $('.o-count', L.stage);
      if (count) count.textContent = plural(L.s.chapters.length, 'chapter');
      setState('idle');
      if (!interrupted) { announce(L); focusHeading(); }
      // Reset the overview so it is ready to rise again.
      requestAnimationFrame(() => $$('*', ov).concat(ov).forEach(x => x.getAnimations().forEach(a => a.cancel())));
    });
    ctl.anims.push(...list);
  }

  // Back to the overview: the row folds into its place, the other rows rise back.
  function exitPart() {
    if (!cur) return;
    finishRunning();
    const L = cur;
    cur = null;
    const reduce = RM.matches;
    $$('*', ov).concat(ov).forEach(x => x.getAnimations().forEach(a => a.cancel()));
    ov.classList.remove('away');
    ov.inert = false;
    requestAnimationFrame(() => ov.classList.remove('leaving'));
    setState('moving');
    const list = [];
    let T;
    if (reduce) {
      anim(list, L.el, [{opacity: 1}, {opacity: 0}], {duration: D.fade, easing: 'ease-in', fill: 'forwards'});
      anim(list, ov, [{opacity: 0}, {opacity: 1}], {duration: D.fade, easing: 'ease-out', fill: 'backwards'});
      T = D.fade + 40;
    } else {
      const entry = $(`.entry[data-si="${L.si}"]`, ov);
      L.el.classList.remove('is-set');
      [L.stage, L.foot, L.axis, L.ptr, ...$$('.pt-top > :not(.pt-name), .pt-name span', L.el), ...$$('.lab', L.el)].forEach(x => anim(list, x, [{opacity: 1}, {opacity: 0}], {duration: 200, easing: 'ease-in', fill: 'forwards'}));
      [...L.stops].reverse().forEach((b, i) => {
        const mark = b.querySelector('.sym, .tick');
        anim(list, mark, L.vert ? [{clipPath: 'inset(0 0 0 0)'}, {clipPath: 'inset(0 100% 0 0)'}] : [{clipPath: 'inset(0 0 0 0)'}, {clipPath: 'inset(100% 0 0 0)'}], {duration: 260, delay: i * 30, easing: E.in, fill: 'forwards'});
      });
      flipTo(list, L.rule, $('.e-span', entry), {stretch: true, delay: 140});
      flipTo(list, L.name, $('.e-name', entry), {delay: 140});
      $$('.e-name, .e-span', entry).forEach(x => anim(list, x, [{opacity: 0}, {opacity: 0}], {duration: 140 + D.move - 10}));
      $$('.e-sym, .e-now, .e-meta, .enter', entry).forEach(x => anim(list, x, [{opacity: 0}, {opacity: 1}], {duration: 360, delay: 140 + D.move - 180, easing: E.out, fill: 'backwards'}));
      const others = [...$$('.entry', ov).filter(e => e !== entry), $('.ov-head', ov), $('.ov-chart-head', ov), $('.ov-axis', ov)];
      others.forEach(x => {
        const dist = x.classList.contains('entry') ? Math.abs(Number(x.dataset.si) - L.si) : 2;
        anim(list, x, [{opacity: 0, transform: 'translateY(56px)'}, {opacity: 1, transform: 'none'}], {duration: 620, delay: 260 + (dist - 1) * 70, easing: E.out, fill: 'backwards'});
      });
      T = 140 + D.move + 40;
    }
    const ctl = run(T, () => {}, interrupted => {
      running = null;
      L.el.remove();
      $$('*', ov).concat(ov).forEach(x => x.getAnimations().forEach(a => a.cancel()));
      setState('idle');
      if (!interrupted) { announce(null); focusHeading(); }
    });
    ctl.anims.push(...list);
  }

  // Step inside a part: the pointer runs ahead, the row slides the target into the reading position,
  // the caption wipes in the part color, the counters tick.
  function goStep(target) {
    if (!cur) return;
    finishRunning();
    const L = cur;
    target = clamp(target, 0, L.n - 1);
    if (target === L.step) { focusHeading(); return; }
    const from = L.step, dir = target > from ? 1 : -1, reduce = RM.matches;
    L.step = target;
    setState('moving');
    updateControls(L, target);
    const old = [...L.stage.children];
    const node = stageEl(L, target);
    L.stage.appendChild(node);
    setCurrent(L, target);
    const list = [], tickers = [];
    let T;
    if (reduce) {
      old.forEach(o => anim(list, o, [{opacity: 1}, {opacity: 0}], {duration: 160, easing: 'ease-in', fill: 'forwards'}));
      anim(list, node, [{opacity: 0}, {opacity: 1}], {duration: 200, delay: 100, easing: 'ease-out', fill: 'backwards'});
      anim(list, L.track, [{opacity: 1}, {opacity: 0.15, offset: 0.4}, {opacity: 1}], {duration: 280, easing: 'ease-in-out'});
      setTimeout(() => { if (cur === L && L.step === target) { L.track.style.transform = trackT(L, target); L.ptr.style.transform = ptrT(L, target); } }, 110);
      writeProgress(L, target, target, stepDateIdx(L.s, target));
      T = 320;
    } else {
      const hops = Math.abs(target - from);
      const moveDur = Math.min(1300, D.move + 90 * (hops - 1));
      const t0 = trackT(L, from), t1 = trackT(L, target);
      const p0 = ptrT(L, from), p1 = ptrT(L, target);
      L.track.style.transform = t1;
      L.ptr.style.transform = p1;
      if (t0 !== t1) anim(list, L.track, [{transform: t0}, {transform: t1}], {duration: moveDur, easing: E.move});
      anim(list, L.ptr, [{transform: p0}, {transform: p1}], {duration: Math.min(560, 380 + 60 * hops), easing: E.out});
      wipe(L, old, node, dir, list);
      tickers.push(progressTicker(L, from, target, 60, moveDur - 120));
      T = Math.max(moveDur, 2 * D.wipe + 260);
    }
    const ctl = run(T, t => tickers.forEach(f => f(t)), interrupted => {
      running = null;
      old.forEach(o => o.remove());
      tickers.forEach(f => f(Infinity));
      L.track.style.transform = trackT(L, target);
      L.ptr.style.transform = ptrT(L, target);
      setState('idle');
      if (!interrupted) { announce(L); focusHeading(); }
    });
    ctl.anims.push(...list);
  }

  // The caption wipe: a plate in the part color covers the old caption and uncovers the new one.
  function wipe(L, old, node, dir, list) {
    const host = L.el.getBoundingClientRect();
    const rs = [...old, node].map(x => x.getBoundingClientRect()).filter(r => r.width && r.height);
    if (!rs.length) return;
    const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top));
    const r = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom));
    Object.assign(L.wipe.style, {left: (l - host.left) + 'px', top: (t - host.top) + 'px', width: (Math.min(r + 40, host.right) - l) + 'px', height: (b - t) + 'px'});
    const from = dir > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
    const to = dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
    anim(list, L.wipe, [{clipPath: from, easing: E.move}, {clipPath: 'inset(0 0 0 0)', offset: 0.5, easing: E.move}, {clipPath: to}], {duration: 2 * D.wipe});
    old.forEach(o => anim(list, o, [{visibility: 'visible'}, {visibility: 'hidden'}], {duration: 1, delay: D.wipe, fill: 'forwards'}));
    anim(list, node, [{visibility: 'hidden'}, {visibility: 'visible'}], {duration: 1, delay: D.wipe, fill: 'backwards'});
    [...node.children].filter(x => !x.classList.contains('cap-plate')).forEach(x => anim(list, x, [{transform: `translateX(${dir * 32}px)`}, {transform: 'none'}], {duration: D.wipe + 260, delay: D.wipe, easing: E.out, fill: 'backwards'}));
  }

  // From the mission end to the next part: the chart moves down one row.
  function switchPart(si, target = 0) {
    finishRunning();
    const prev = cur;
    const reduce = RM.matches;
    const L = buildPart(si);
    cur = L;
    L.step = target;
    setState('moving');
    updateControls(L, target);
    applyRow(L, target);
    writeProgress(L, target, target, stepDateIdx(L.s, target));
    const node = stageEl(L, target);
    L.stage.appendChild(node);
    const list = [];
    let T;
    if (reduce) {
      anim(list, L.el, [{opacity: 0}, {opacity: 1}], {duration: D.fade, easing: 'ease-out', fill: 'backwards'});
      L.el.classList.add('is-set');
      T = D.fade + 40;
    } else {
      const H = frame.clientHeight;
      anim(list, prev.el, [{opacity: 1, transform: 'none'}, {opacity: 0, transform: `translateY(${-Math.round(H * 0.16)}px)`}], {duration: 520, easing: E.in, fill: 'forwards'});
      anim(list, L.row, [{transform: `translateY(${Math.round(H * 0.5)}px)`}, {transform: 'none'}], {duration: D.move, delay: 120, easing: E.move, fill: 'backwards'});
      anim(list, L.rule, [{transform: 'scaleX(0.3)'}, {transform: 'none'}], {duration: D.move, delay: 120, easing: E.move, fill: 'backwards'});
      chromeIn(L, 360, list);
      const tDone = countIn(L, 120 + Math.round(D.move * 0.66), list);
      anim(list, L.ptr, [{transform: `${ptrT(L, target)} scaleX(0)`}, {transform: `${ptrT(L, target)} scaleX(1)`}], {duration: 360, delay: tDone - 160, easing: E.out, fill: 'backwards'});
      revealStage(node, tDone - 320, list);
      T = tDone + 380;
    }
    const ctl = run(T, () => {}, interrupted => {
      running = null;
      prev.el.remove();
      L.el.classList.add('is-set');
      setState('idle');
      if (!interrupted) { announce(L); focusHeading(); }
    });
    ctl.anims.push(...list);
  }

  // Jump to now: the red pointer runs along the rows to the newest symbol, then that row opens.
  function jumpNow() {
    if (cur) { if (cur.si === latestSi) goStep(latestStep); else switchPart(latestSi, latestStep); return; }
    finishRunning();
    if (RM.matches) { enterPart(latestSi, {target: latestStep}); return; }
    const ptr = $('.ov-ptr', ov);
    const host = ov.getBoundingClientRect();
    const pts = [];
    $$('.entry', ov).forEach((e, i) => {
      if (i > latestSi) return;
      const plot = $('.e-plot', e).getBoundingClientRect();
      let syms = $$('.e-sym', e).sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
      if (i === latestSi) syms = syms.slice(0, syms.findIndex(x => Number(x.dataset.ci) === latestStep - 1) + 1);
      syms.forEach((x, k) => { const r = x.getBoundingClientRect(); pts.push({x: r.left - host.left, y: plot.bottom - host.top - parseFloat(tok('--border-pointer')), w: r.width, row: i, first: k === 0}); });
    });
    if (!pts.length) { enterPart(latestSi, {target: latestStep}); return; }
    setState('moving');
    // Hop times: a short hop inside a row, a longer one down to the next row.
    const times = [0];
    pts.forEach((p, i) => { if (i) times.push(times[i - 1] + (p.first ? D.hop * 1.5 : D.hop)); });
    const hold = 60, Trun = times[times.length - 1] + hold + 120;
    Object.assign(ptr.style, {width: pts[0].w + 'px'});
    const kf = [{transform: `translate(${pts[0].x}px, ${pts[0].y}px) scaleX(0)`, opacity: 1, offset: 0, easing: E.out}];
    pts.forEach((p, i) => kf.push({transform: `translate(${p.x}px, ${p.y}px) scaleX(1)`, opacity: 1, offset: (times[i] + 120) / Trun, easing: E.out}));
    kf.push({transform: `translate(${pts[pts.length - 1].x}px, ${pts[pts.length - 1].y}px) scaleX(1)`, opacity: 1, offset: 1});
    const list = [ptr.animate(kf, {duration: Trun, fill: 'forwards'})];
    // Each symbol the pointer passes rises a little, as if counted.
    pts.forEach((p, i) => {
      const e = $$('.entry', ov)[p.row];
      const s = $$('.e-sym', e).sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)[pts.filter((q, j) => j < i && q.row === p.row).length];
      if (s) list.push(s.animate([{transform: 'none'}, {transform: 'translateY(-8px)'}, {transform: 'none'}], {duration: 360, delay: times[i] + 60, easing: E.out}));
    });
    const ctl = run(Trun, () => {}, () => {
      running = null;
      enterPart(latestSi, {target: latestStep, fromRun: true});
    });
    ctl.anims.push(...list);
  }

  function announce(L) {
    if (!L) { live.textContent = `Overview. ${G.journey.name}: ${G.journey.mission}`; return; }
    const s = L.s, st = L.step;
    if (st === 0) live.textContent = `${s.name}. Mission: ${s.mission}`;
    else if (st === L.n - 1) live.textContent = `${s.name}. The mission: ${s.mission}`;
    else { const c = s.chapters[st - 1]; live.textContent = `${s.name}, chapter ${st} of ${s.chapters.length}: ${c.title}` + (c.latest ? '. You are here.' : ''); }
  }
  function focusHeading() {
    const hs = cur ? $$('[tabindex="-1"]', cur.stage) : [$('#ov-q')];
    const h = hs[hs.length - 1];
    if (h) h.focus({preventScroll: true});
  }

  // ---------- Events ----------
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.closest('#story-frame, #card, #system')) {
      const id = a.getAttribute('href').slice(1);
      if (!id || !document.getElementById(id)) { e.preventDefault(); return; }
    }
    const b = e.target.closest('[data-act], .stop');
    if (!b) return;
    if (b.dataset.act === 'home-enter') {
      e.preventDefault();
      frame.scrollIntoView({behavior: RM.matches ? 'auto' : 'smooth', block: 'start'});
      setTimeout(() => focusHeading(), RM.matches ? 0 : 500);
      return;
    }
    if (b.dataset.act === 'replay') { replay(b.dataset.demo); return; }
    if (!frame.contains(b)) return;
    if (b.classList.contains('stop')) { goStep(Number(b.dataset.go)); return; }
    const act = b.dataset.act;
    if (act === 'enter') enterPart(Number(b.dataset.si));
    else if (act === 'now') jumpNow();
    else if (act === 'exit') exitPart();
    else if (act === 'prev') { if (cur) goStep(cur.step - 1); }
    else if (act === 'next') { if (cur) goStep(cur.step + 1); }
    else if (act === 'nextseason') { if (cur && seasons[cur.si + 1]) switchPart(cur.si + 1); }
  });
  const frameCovers = () => { const r = frame.getBoundingClientRect(); return Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) > innerHeight * 0.6; };
  addEventListener('keydown', e => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const t = document.activeElement;
    const inside = t && frame.contains(t);
    const onBody = !t || t === document.body || t === root;
    if (!inside && !(onBody && frameCovers())) return;
    const onControl = t && t.closest && t.closest('button, a, input, select, textarea, [role="button"]');
    const fwd = () => { if (cur) { if (cur.step < cur.n - 1) goStep(cur.step + 1); } else enterPart(0); };
    if (e.key === 'ArrowRight') { e.preventDefault(); fwd(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (cur && cur.step > 0) goStep(cur.step - 1); }
    else if (e.key === ' ' || e.key === 'Enter') { if (onControl) return; e.preventDefault(); fwd(); }
    else if (e.key === 'Escape' || e.key === 'Home') { e.preventDefault(); if (cur) exitPart(); }
    else if (e.key === 'End') { e.preventDefault(); jumpNow(); }
  });
  let rsT = 0, wasVert = null;
  addEventListener('resize', () => {
    clearTimeout(rsT);
    rsT = setTimeout(() => {
      if (!cur) return;
      finishRunning();
      if (isVertMode() !== cur.vert) {
        const si = cur.si, step = cur.step;
        cur.el.remove();
        cur = buildPart(si);
        cur.step = step;
        cur.el.classList.add('is-set');
        updateControls(cur, step);
        writeProgress(cur, step, step, stepDateIdx(cur.s, step));
        cur.stage.appendChild(stageEl(cur, step));
        layoutPart(cur);
      } else layoutPart(cur);
    }, 140);
  });

  window.story = {
    seasons, latestSi, latestStep,
    get view() { return cur ? 'season' : 'home'; },
    get season() { return cur ? cur.si : -1; },
    get step() { return cur ? cur.step : -1; },
    enter: si => enterPart(si), exit: exitPart, go: goStep, jumpNow,
  };

  // ---------- Chapter card section ----------
  function buildCards() {
    const doneC = G.chapters.find(c => c.id === 'maat-2');
    const doneS = seasons.find(s => s.id === doneC.season);
    const latS = seasons[latestSi];
    const research = WD.journeys.find(j => j.id === 'knowledge');
    const nextC = research.chapters.find(c => c.status === 'next');
    const card = (state, cls, html, cap) => `<figure class="cstate ${cls}" data-card-state="${state}">${html}<figcaption>${cap}</figcaption></figure>`;
    $('#cards').innerHTML = [
      card('done', doneS.cls, capHTML(doneC, doneS.chapters.indexOf(doneC) + 1, doneS.chapters.length, {cls: 'compact', meta: `${esc(doneS.name)}<br><span class="num">Chapter ${doneS.chapters.indexOf(doneC) + 1} of ${doneS.chapters.length}</span>, <time>${month(doneC.date)}</time>`}), 'A past chapter, with its article.'),
      card('latest', latS.cls, capHTML(latest, latestStep, latS.chapters.length, {cls: 'compact', meta: `${esc(latS.name)}<br><span class="num">Chapter ${latestStep} of ${latS.chapters.length}</span>, <time>${month(latest.date)}</time>`}), 'The newest chapter. The red bar marks where the work is now.'),
      card('next', 'pn', capHTML(nextC, 0, 0, {cls: 'compact', icon: 'question', latest: false, meta: `${esc(research.name)}<br>Next chapter, not written yet`, noLink: 'No article yet. This chapter is still in progress.'}), 'The next chapter. Gray means not yet.'),
    ].join('');
    const art = doneC.article;
    const w = worldCh(doneC.id);
    const href = (w && w.article && w.article.href) || '#';
    const l = cls => `<a class="read ${cls}" href="${esc(href)}" tabindex="-1"><span>Read: ${esc(art.title)}</span>${ui('arrow')}</a>`;
    $('#link-states').innerHTML = `
      <div><h3>The read link</h3><p>Copies with the state forced, so each look is visible at once.</p></div>
      <div>${l('')}<p>At rest: a 2 px underline.</p></div>
      <div>${l('is-hover')}<p>On hover: the underline grows to 4 px and the arrow moves.</p></div>
      <div>${l('is-focus')}<p>On keyboard focus: a 3 px blue ring.</p></div>`;
  }

  // ---------- System sheet ----------
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const lum = h => { const [r, g, b] = hexRGB(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const hexOf = v => { const s = tok(v); return s.startsWith('#') ? s.toUpperCase() : s; };

  function buildSystem() {
    const C = [
      {name: 'Ground', v: '--color-ground', on: '--color-ink', onName: 'Ink', use: 'The chart ground.', edge: true},
      {name: 'Ink', v: '--color-ink', on: '--color-on-ink', onName: 'White', use: 'Type, rules, chart furniture, my own research.'},
      {name: 'Red', v: '--color-red', on: '--color-on-ink', onName: 'White', use: 'Now: the pointer, the newest chapter, Jump to now.'},
      {name: 'Blue', v: '--color-blue', on: '--color-on-ink', onName: 'White', use: `Part 1, ${seasons[0].name}. The focus ring.`},
      {name: 'Green', v: '--color-green', on: '--color-on-ink', onName: 'White', use: `Part 2, ${seasons[1].name}.`},
      {name: 'Ochre', v: '--color-ochre', on: '--color-ink', onName: 'Ink', use: `Part 3, ${seasons[2].name}. Black text only.`},
      {name: 'Gray', v: '--color-gray', on: '--color-ink', onName: 'Ink', use: 'Not yet. A fill, never text.'},
      {name: 'Ink hover', v: '--color-ink-hover', on: '--color-on-ink', onName: 'White', use: 'A primary control under the pointer.'},
    ];
    const swatches = C.map(c => {
      const bg = hexOf(c.v), fg = hexOf(c.on);
      const r = ratio(bg, fg);
      return `<div class="sw"><div class="sw-chip${c.edge ? ' edge' : ''}" style="background:${bg};color:${fg}">Aa</div>
        <dl><dt>${c.name}</dt><dd class="num">${bg}</dd><dd>${esc(c.use)}</dd><dd class="ratio">${c.onName} on ${c.name.toLowerCase()}: <b>${r.toFixed(2)}:1</b> ${r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : 'large text only'}</dd></dl></div>`;
    }).join('');

    const T = [
      ['Display', '--size-display', '--lh-display', '700', WD.person.motto, 'h-motto', 'clamp(50, 6.3vw, 92)'],
      ['Headline', '--size-headline', '--lh-headline', '600', G.journey.mission, 'ov-q', 'clamp(34, 3.7vw, 56)'],
      ['Title', '--size-title', '--lh-title', '600', G.chapters[3].title, 'c-title', 'clamp(26, 2.3vw, 34)'],
      ['Row label', '--size-row', '--lh-row', '600', seasons[1].name, 'e-name', '22'],
      ['Body', '--size-body', '--lh-body', '400', G.chapters[2].simple[0], '', '19'],
      ['Label', '--size-label', '--lh-label', '500', `${G.chapters[2].short}, ${month(G.chapters[2].date)}`, '', '17'],
      ['Small', '--size-small', '--lh-small', '500', '1 symbol = 1 chapter', '', '15'],
    ];
    const typeRows = T.map(([role, size, lh, w, sample, cls, px]) => `<div class="type-row"><dl><dt>${role}</dt><dd>Jost ${w}</dd><dd class="num">${px} / ${tok(lh)}</dd></dl>
      <p class="type-sample" style="font:${w} var(${size})/var(${lh}) var(--font);${role === 'Display' || role === 'Headline' ? 'letter-spacing:-0.02em;' : ''}${role === 'Display' ? 'font-size:clamp(40px,4.4vw,64px);' : ''}">${esc(sample)}</p></div>`).join('');

    const spaces = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<div class="space-row"><b>--space-${i}</b><span class="num">${tok('--space-' + i)}</span><span class="space-bar" style="width:var(--space-${i})"></span></div>`).join('');

    const btnRow = (label, sub, cls, text, icon) => `<p class="lab-col">${label}<span>${sub}</span></p>` + ['', 'is-hover', 'is-focus', 'is-disabled'].map(st =>
      `<div><button type="button" class="btn ${cls} ${st}" tabindex="-1"${st === 'is-disabled' ? ' disabled' : ''}>${icon === 'back' ? BACK : ''}<span>${text}</span>${icon === 'fwd' ? ARROW : ''}</button></div>`).join('');
    const quietRow = `<p class="lab-col">Quiet<span>Text with an underline</span></p>` + ['', 'is-hover', 'is-focus', 'is-disabled'].map(st =>
      `<div><button type="button" class="btn-quiet ${st}${st === 'is-focus' ? ' btn' : ''}" tabindex="-1"${st === 'is-disabled' ? ' disabled' : ''} ${st === 'is-focus' ? 'style="height:44px;padding:0 2px;border:0;background:none;color:var(--color-ink)"' : ''}>${BACK}<span>Overview</span></button></div>`).join('');

    const icons = [...ISO.chapterIcons.map(n => [n, 'Chapter: ' + n]), ['person', 'Person'], ['unit', 'Key unit'], ['blank', 'Chapter: blank'], ['map', 'Chapter: map'], ['save', 'Chapter: save'], ['question', 'Not yet'], ['flag', 'Mission flag']];
    const iconColor = n => ({heads: 'var(--color-green)', brain: 'var(--color-green)', tree: 'var(--color-green)', photo: 'var(--color-blue)', files: 'var(--color-blue)', chat: 'var(--color-ochre)'}[n] || 'var(--color-ink)');
    const iconCells = icons.map(([n, label]) => `<div class="icon-cell" style="color:${iconColor(n)}">${sym(n)}<span style="color:var(--color-ink)"><b>${label.split(': ')[1] || label}</b>${label.startsWith('Chapter') ? '<br>chapter icon' : ''}</span></div>`).join('');
    const uiCells = [['arrow', 'Arrow'], ['back', 'Back'], ['chev-l', 'Chevron left'], ['chev-r', 'Chevron right'], ['flag', 'Flag'], ['out', 'Link out']].map(([n, l]) => `<div class="icon-cell">${ui(n)}<span><b>${l}</b><br>24 grid</span></div>`).join('');
    const grid48 = Array.from({length: 13}, (_, i) => `<line x1="${i * 4}" y1="0" x2="${i * 4}" y2="48"/><line x1="0" y1="${i * 4}" x2="48" y2="${i * 4}"/>`).join('');

    const M = [
      ['count', 'Count in', `--dur-count ${tok('--dur-count')}, --stagger-count ${tok('--stagger-count')}`, '--ease-out'],
      ['move', 'Row slide', `--dur-move ${tok('--dur-move')}`, '--ease-move'],
      ['wipe', 'Caption wipe', `--dur-wipe ${tok('--dur-wipe')} x 2`, '--ease-move'],
      ['tick', 'Counter tick', `--dur-tick ${tok('--dur-tick')}`, '--ease-out'],
      ['hop', 'Pointer run', `--dur-hop ${tok('--dur-hop')}`, '--ease-out'],
      ['fade', 'Reduced motion', `--dur-fade ${tok('--dur-fade')}`, 'ease-out'],
      ['drop', 'Rows drop away', '460ms', '--ease-in'],
    ];
    const demoBody = id => ({
      count: `<div class="mo-row">${['heads', 'brain', 'tree', 'chat'].map(n => sym(n)).join('')}</div>`,
      move: `<div class="mo-row" style="color:var(--color-blue)">${['files', 'photo', 'files', 'photo', 'files'].map(n => sym(n)).join('')}</div><span class="mo-bar"></span>`,
      wipe: `<div class="mo-wipe"><span>Gym owners can ask in plain words</span><i></i></div>`,
      tick: `<div class="mo-tick">Chapter&nbsp;<b>1</b>&nbsp;of 3,&nbsp;<span class="num">May 2026</span></div>`,
      hop: `<div class="mo-row" style="color:var(--color-ink)">${['blank', 'files', 'tree', 'map', 'save'].map(n => sym(n)).join('')}</div><span class="mo-bar"></span>`,
      fade: `<div class="mo-wipe" style="padding-left:0"><span>Chapter 2 of 3</span></div>`,
      drop: `<div class="mo-row" style="color:var(--color-ochre)">${['chat', 'chat', 'chat'].map(n => sym(n)).join('')}</div>`,
    }[id]);
    const motion = M.map(([id, name, d, e]) => `<div class="mo"><dl><dt>${name}</dt><dd>${d}</dd><dd>${e.startsWith('--') ? e + ': ' + tok(e) : e}</dd></dl><div class="mo-stage" data-demo="${id}" aria-hidden="true">${demoBody(id)}</div><button type="button" class="btn btn-secondary" data-act="replay" data-demo="${id}">Replay</button></div>`).join('');

    const BP = [['Phone', 390, 719, 'One column. The row stands up: a vertical path.'], ['Narrow', 720, 1079, 'Two columns in the home chart.'], ['Wide', 1080, 1440, 'Twelve columns. The row slides under the pointer.']];
    const bps = BP.map(([n, a, b, note]) => `<div class="bp-row"><b>${n}</b><span><span class="bp-bar" style="display:block;width:${Math.round(b / 1440 * 100)}%"></span><span class="num">${a} to ${b} px.</span> ${note}</span></div>`).join('');

    $('#sys').innerHTML = `
      <div class="grp" data-tokens="color"><h3>Color</h3><p class="grp-note">Few colors, each with one meaning. The ratio is measured from the tokens when the page loads.</p><div class="grp-body swatches">${swatches}</div></div>
      <div class="grp g-7" data-tokens="type"><h3>Type</h3><p class="grp-note">Jost, a Futura revival, for everything. Display tracking is -0.02em. Numbers in dates and counts are tabular.</p><div class="grp-body type-rows">${typeRows}</div></div>
      <div class="grp g-5" data-tokens="space"><h3>Space</h3><p class="grp-note">A 4 px step. Tight inside a group, wide between groups.</p><div class="grp-body space-rows">${spaces}</div></div>
      <div class="grp g-4" data-tokens="radius"><h3>Radius</h3><p class="grp-note">Square corners everywhere. No exception: the circles in symbols are geometry, not a radius.</p><div class="grp-body spec-rows">
        <div class="spec"><span class="spec-mark"><span class="r-sample"></span></span><span><b>--radius-control: 0</b>Buttons, inputs, tags.</span></div>
        <div class="spec"><span class="spec-mark"><span class="r-sample" style="background:var(--color-green)"></span></span><span><b>--radius-panel: 0</b>Plates, panels, fields.</span></div>
      </div></div>
      <div class="grp g-4" data-tokens="border"><h3>Border</h3><p class="grp-note">Rules, not boxes. Separation comes from rules, color fields, and space.</p><div class="grp-body spec-rows">
        <div class="spec"><span class="spec-mark"><span class="b-sample" style="height:var(--border-hair)"></span></span><span><b>Hair, 1 px</b>Between rows of a chart.</span></div>
        <div class="spec"><span class="spec-mark"><span class="b-sample" style="height:var(--border-rule)"></span></span><span><b>Rule, 2 px</b>Chart top, secondary control, what I learned.</span></div>
        <div class="spec"><span class="spec-mark"><span class="b-sample" style="height:var(--border-base);background:var(--color-green)"></span></span><span><b>Baseline, 8 px</b>The row of a part, in its color.</span></div>
        <div class="spec"><span class="spec-mark"><span class="b-sample" style="height:var(--border-pointer);background:var(--color-red)"></span></span><span><b>Pointer, 10 px</b>Under the current symbol.</span></div>
      </div></div>
      <div class="grp g-4" data-tokens="depth"><h3>Depth</h3><p class="grp-note">The world is flat. There are no shadows. Depth comes from color fields and white space.</p><div class="grp-body depth-demo">
        <div class="depth-ground"><b>Ground</b>White. The chart.</div>
        <div style="background:var(--color-green);color:var(--color-on-ink)"><b>Field</b>A part color. Plates and the wipe.</div>
        <div style="background:var(--color-ink);color:var(--color-on-ink)"><b>Mark</b>Ink. The primary control.</div>
      </div></div>
      <div class="grp g-8" data-tokens="button"><h3>Button</h3><p class="grp-note">Primary is a black fill. Jump to now is red. Secondary is a 2 px black rule. Quiet is text with an underline. Focus is a 3 px blue ring with an offset.</p>
        <div class="grp-body btn-grid"><span></span><p class="head">Default</p><p class="head">Hover</p><p class="head">Focus</p><p class="head">Disabled</p>
          ${btnRow('Primary', 'Black fill', 'btn-primary', 'Next', 'fwd')}
          ${btnRow('Now', 'Red fill', 'btn-now', 'Jump to now', '')}
          ${btnRow('Secondary', '2 px rule', 'btn-secondary', 'Previous', 'back')}
          ${quietRow}
        </div></div>
      <div class="grp g-4" data-tokens="link"><h3>Link</h3><p class="grp-note">Ink with an underline that grows on hover.</p><div class="grp-body link-demo">
        <p>The Admin Agent finds the answer and shows it as a table or a chart. <a class="link" href="#card">See the chapter card</a> for the full caption.</p>
        <p>${readLink(latest)}</p>
        <p class="cap-none">Standalone, with the arrow. It moves 4 px on hover.</p>
      </div></div>
      <div class="grp" data-tokens="icon"><h3>Icon</h3><p class="grp-note">Solid, flat silhouettes on one 48 unit grid. No outlines. Detail is cut out as white space. The six chapter icons keep their meaning: two figures, a brain, a hierarchy of squares, a picture frame, a speech block, a stack of documents.</p>
        <div class="grp-body"><div class="icon-set">${iconCells}</div>
          <div class="icon-sub"><h4>Interface marks, on a 24 unit grid</h4><div class="icon-set">${uiCells}</div></div>
          <div class="icon-sub"><h4>The construction grid: 48 units, a 4 unit module</h4><div class="icon-grid-demo">
            ${['brain', 'tree', 'heads'].map(n => `<div class="gridded" aria-hidden="true"><svg viewBox="0 0 48 48" style="fill:none;stroke:var(--color-gray);stroke-width:0.25">${grid48}</svg>${sym(n)}</div>`).join('')}
          </div></div></div></div>
      <div class="grp g-7" data-tokens="motion"><h3>Motion</h3><p class="grp-note">One grammar. A row moves and scales into the frame. The symbols count in. The row slides under a red pointer. The caption wipes in the part color. Counters tick. With reduced motion, every change is a short crossfade.</p><div class="grp-body motion-rows">${motion}</div></div>
      <div class="grp g-5" data-tokens="layout"><h3>Layout</h3><p class="grp-note">A strict modular grid. Labels on the left, symbols on the right.</p><div class="grp-body layout-draw">
        <div class="layout-cols" aria-hidden="true">${Array.from({length: 12}, (_, i) => `<i>${i + 1}</i>`).join('')}</div>
        <div class="layout-specs"><span><b>Columns:</b> 12</span><span><b>Max width:</b> <span class="num">${tok('--max-width')}</span></span><span><b>Gutter:</b> <span class="num">${tok('--gutter')}</span></span><span><b>Margin:</b> <span class="num">20 to 64px</span>, 4.4vw</span></div>
        <div class="bp">${bps}</div>
      </div></div>`;
    // Make the gridded demo symbols draw in ink, on top of the grid.
    $$('.gridded .sym').forEach(s => { s.style.position = 'absolute'; s.style.inset = '0'; s.style.width = '100%'; s.style.height = '100%'; });
  }

  // Motion demos: the same tokens as the story view.
  function replay(id) {
    const st = $(`.mo-stage[data-demo="${id}"]`);
    if (!st) return;
    st.getAnimations({subtree: true}).forEach(a => a.cancel());
    if (RM.matches || id === 'fade') {
      st.animate([{opacity: 0}, {opacity: 1}], {duration: D.fade, easing: 'ease-out'});
      return;
    }
    const syms = $$('.sym', st);
    if (id === 'count') syms.forEach((s, i) => s.animate([{clipPath: 'inset(100% 0 0 0)', transform: 'translateY(10px)'}, {clipPath: 'inset(0 0 0 0)', transform: 'none'}], {duration: D.count, delay: i * D.stagger, easing: E.out, fill: 'backwards'}));
    if (id === 'drop') syms.forEach((s, i) => s.animate([{opacity: 1, transform: 'none'}, {opacity: 0, transform: 'translateY(40px)', offset: 0.6}, {opacity: 0, transform: 'translateY(40px)', offset: 0.7}, {opacity: 1, transform: 'none'}], {duration: 1100, delay: i * 60, easing: E.in}));
    if (id === 'move') {
      const row = $('.mo-row', st), bar = $('.mo-bar', st);
      row.animate([{transform: 'none'}, {transform: 'translateX(-48px)'}, {transform: 'translateX(-48px)', offset: 0.8}, {transform: 'none'}], {duration: D.move * 2, easing: E.move});
      bar.animate([{transform: 'none'}, {transform: 'translateX(48px)', offset: 0.25}, {transform: 'none', offset: 0.5}, {transform: 'none'}], {duration: D.move * 2, easing: E.out});
    }
    if (id === 'hop') {
      const bar = $('.mo-bar', st);
      const kf = syms.map((s, i) => ({transform: `translateX(${i * 48}px)`, offset: i / (syms.length - 1), easing: E.out}));
      bar.animate(kf, {duration: D.hop * (syms.length - 1) * 1.4});
    }
    if (id === 'wipe') {
      const i = $('i', st), t = $('span', st);
      i.animate([{clipPath: 'inset(0 100% 0 0)', easing: E.move}, {clipPath: 'inset(0 0 0 0)', offset: 0.5, easing: E.move}, {clipPath: 'inset(0 0 0 100%)'}], {duration: D.wipe * 2});
      t.animate([{transform: 'translateX(24px)'}, {transform: 'none'}], {duration: D.wipe + 260, delay: D.wipe, easing: E.out, fill: 'backwards'});
    }
    if (id === 'tick') {
      const b = $('b', st), d = $('.num', st);
      const vals = [1, 2, 3], months = ['May 2026', 'Jun 2026', 'Jul 2026'];
      vals.forEach((v, k) => setTimeout(() => { b.textContent = v; d.textContent = months[k]; if (k) { bump(b); bump(d); } }, k * 220));
    }
  }

  // The home chart counts in once, the first time it is seen.
  function homeCount() {
    if (RM.matches) return;
    const sets = $$('#home .h-set');
    let i = 0;
    sets.forEach(set => $$('.sym', set).forEach(s => {
      s.animate([{clipPath: 'inset(100% 0 0 0)', transform: 'translateY(12px)'}, {clipPath: 'inset(0 0 0 0)', transform: 'none'}], {duration: D.count, delay: 120 + i * 40, easing: E.out, fill: 'backwards'});
      i++;
    }));
    $$('#home .h-bar').forEach(b => b.animate([{transform: 'scaleX(0)'}, {transform: 'none'}], {duration: 420, delay: 120 + i * 40, easing: E.out, fill: 'backwards'}));
  }

  // ---------- Init ----------
  buildHome();
  buildOverview();
  buildCards();
  buildSystem();
  setState('moving');
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); homeCount(); } }, {threshold: 0.2});
  io.observe($('#home'));
  Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]).then(() => {
    setState('idle');
  });
})();
