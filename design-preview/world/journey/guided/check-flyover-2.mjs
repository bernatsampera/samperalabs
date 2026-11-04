// E2E proof for "Flyover v2" (flyover-2.html): start screen, one season at a time.
// Run: node check-flyover-2.mjs
// Output: screenshots in shots/flyover-2/, a report in shots/flyover-2/report.json,
// PASS/FAIL lines, and the error count. Exit code 1 on any FAIL or any page error.
import { chromium } from '/Users/bsampera/Documents/projects/samperalabs/node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'shots', 'flyover-2');
await mkdir(out, {recursive: true});
const pageUrl = pathToFileURL(join(here, 'flyover-2.html')).href;

const results = [];
const errors = [];
const contrastLog = [];
const check = (name, pass, detail) => {
  results.push({name, pass: !!pass, detail: detail ?? null});
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${!pass && detail ? '  (' + detail + ')' : ''}`);
};

const browser = await chromium.launch();

async function open(contextOptions, label) {
  const ctx = await browser.newContext(contextOptions);
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${label}] pageerror: ${e.message}`));
  await page.goto(pageUrl);
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
  return {ctx, page};
}
async function settle(page) {
  await page.waitForFunction(() => document.documentElement.dataset.state === 'idle' && window.flyover2, null, {timeout: 15000});
  await page.waitForTimeout(150);
}
const state = page => page.evaluate(() => ({view: window.flyover2.view, season: window.flyover2.season, step: window.flyover2.step}));
const shot = (page, name) => page.screenshot({path: join(out, name)});
const pad = n => String(n).padStart(2, '0');

async function noScroll(page) {
  return page.evaluate(() => {
    const d = document.documentElement, b = document.body;
    const sh = Math.max(d.scrollHeight, b.scrollHeight), sw = Math.max(d.scrollWidth, b.scrollWidth);
    return {ok: sh <= innerHeight + 1 && sw <= innerWidth + 1, detail: `scroll ${sw}x${sh} vs viewport ${innerWidth}x${innerHeight}`};
  });
}

// Visible text: skip aria-hidden, hidden, the live region, disabled controls, zero-size, invisible, and off-screen.
const VISIBLE_TEXT = `(() => {
  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    if (el.closest('script, style, [aria-hidden="true"], [hidden], .sr-only, #live')) continue;
    if (el.closest('button:disabled, [aria-disabled="true"]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    let op = 1, hidden = false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const s = getComputedStyle(e);
      op *= parseFloat(s.opacity);
      if (s.visibility === 'hidden' || s.display === 'none') hidden = true;
    }
    if (hidden || op < 0.05) continue;
    out.push(el);
  }
  return out;
})()`;

async function contrast(page, where) {
  const fails = await page.evaluate(src => {
    const els = eval(src);
    const parse = s => {
      const m = /rgba?\(([^)]+)\)/.exec(s || '');
      if (!m) return null;
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]];
    };
    const lum = c => c.slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const over = (top, base) => [0, 1, 2].map(i => top[i] * top[3] + base[i] * (1 - top[3]));
    const background = el => {
      const stack = [];
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c && c[3] > 0) { stack.push(c); if (c[3] >= 0.99) break; }
      }
      let base = [251, 244, 230];
      if (stack.length && stack[stack.length - 1][3] >= 0.99) base = stack.pop().slice(0, 3);
      for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
      return base;
    };
    const res = [];
    for (const el of els) {
      const cs = getComputedStyle(el);
      const fg = parse(el instanceof SVGElement ? cs.fill : cs.color);
      if (!fg) continue;
      const bg = background(el);
      const fgSolid = over(fg, bg);
      const rr = ratio(fgSolid, bg);
      const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10) || 400;
      const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
      if (rr < need) res.push({text: el.textContent.trim().slice(0, 60), ratio: Math.round(rr * 100) / 100, need, fg: fgSolid.map(Math.round).join(','), bg: bg.map(Math.round).join(',')});
    }
    return res;
  }, VISIBLE_TEXT);
  fails.forEach(f => contrastLog.push({where, ...f}));
  return fails.length;
}

// Inside a season view: only that season is on screen.
async function onlyThisSeason(page) {
  return page.evaluate(src => {
    const si = window.flyover2.season;
    const others = window.flyover2.seasons.filter((s, i) => i !== si).map(s => s.name);
    const texts = eval(src).map(e => e.textContent.trim());
    const leaks = texts.filter(t => !t.startsWith('Next: ') && others.some(n => t.includes(n)));
    const layers = document.querySelectorAll('#layers .season').length;
    const homeHidden = getComputedStyle(document.getElementById('home')).visibility === 'hidden';
    return {ok: leaks.length === 0 && layers === 1 && homeHidden, detail: `leaks ${JSON.stringify(leaks)}, layers ${layers}, home hidden ${homeHidden}`};
  }, VISIBLE_TEXT);
}

async function headingIs(page, text) {
  return page.evaluate(text => {
    const h = document.querySelector('#layers .season .stage [tabindex="-1"]');
    if (!h) return {ok: false, detail: 'no heading'};
    const r = h.getBoundingClientRect();
    let op = 1;
    for (let e = h; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
    const inView = r.width > 0 && r.height > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth;
    return {ok: h.textContent.trim() === text && inView && op > 0.99, detail: `heading "${h.textContent.trim()}", opacity ${op.toFixed(2)}, top ${Math.round(r.top)}`};
  }, text);
}
async function latestOk(page) {
  return page.evaluate(() => {
    const f = window.flyover2;
    const c = window.GUIDED.chapters.find(x => x.latest);
    const h = document.querySelector('#layers .season .stage .c-title');
    const here = document.querySelector('#layers .season .stage .here');
    const r = h && h.getBoundingClientRect();
    const ok = f.view === 'season' && f.season === f.latestSi && f.step === f.latestStep && h && h.textContent.trim() === c.title && here
      && r.top >= 0 && r.bottom <= innerHeight && r.width > 0;
    return {ok, detail: `view ${f.view}, season ${f.season}, step ${f.step}, heading "${h && h.textContent.trim()}"`};
  });
}

const fails = {scroll: [], season: [], walk: []};
let cf = 0;

// ---------- Desktop 1440x900 ----------
{
  const {ctx, page} = await open({viewport: {width: 1440, height: 900}}, 'desktop');
  const seasons = await page.evaluate(() => window.flyover2.seasons.map(s => ({name: s.name, n: s.chapters.length, titles: s.chapters.map(c => c.title)})));
  let ns = await noScroll(page);
  if (!ns.ok) fails.scroll.push('home: ' + ns.detail);
  await shot(page, 'home.png');
  cf += await contrast(page, 'desktop home');
  check('desktop: start screen shows three season entries and a time strip', await page.evaluate(() => document.querySelectorAll('.entry').length === 3 && !!document.querySelector('.strip .s-bar')));

  for (let si = 0; si < seasons.length; si++) {
    await page.click(`.entry[data-si="${si}"] .enter`);
    if (si === 0) {
      await page.waitForTimeout(320);
      await shot(page, 'entry-mid-1.png');
      await page.waitForTimeout(380);
      await shot(page, 'entry-mid-2.png');
    }
    await settle(page);
    let st = await state(page);
    if (st.view !== 'season' || st.season !== si || st.step !== 0) fails.walk.push(`enter ${si}: ${JSON.stringify(st)}`);
    const n = seasons[si].n;
    let steps = 1;
    const snap = async name => {
      await shot(page, name);
      cf += await contrast(page, `desktop ${name}`);
      ns = await noScroll(page);
      if (!ns.ok) fails.scroll.push(`${name}: ${ns.detail}`);
      const only = await onlyThisSeason(page);
      if (!only.ok) fails.season.push(`${name}: ${only.detail}`);
    };
    await snap(`s${si + 1}-opener.png`);
    while (!(await page.locator('#layers .season .nav-next').isDisabled())) {
      const before = (await state(page)).step;
      await page.click('#layers .season .nav-next');
      await settle(page);
      st = await state(page);
      if (st.step !== before + 1) fails.walk.push(`season ${si + 1}: Next from ${before} went to ${st.step}`);
      steps++;
      if (st.step >= 1 && st.step <= n) {
        const h = await headingIs(page, seasons[si].titles[st.step - 1]);
        if (!h.ok) fails.walk.push(`season ${si + 1} chapter ${st.step}: ${h.detail}`);
        await snap(`s${si + 1}-ch${pad(st.step)}.png`);
      } else await snap(`s${si + 1}-end.png`);
      if (steps > 20) break;
    }
    if (steps !== n + 2) fails.walk.push(`season ${si + 1}: ${steps} steps, expected ${n + 2}`);
    // Exit three different ways.
    if (si === 0) await page.keyboard.press('Escape');
    else if (si === 1) await page.click('#layers .season .exit');
    else await page.click('#layers .season .stage [data-act="exit"]');
    await settle(page);
    st = await state(page);
    if (st.view !== 'home') fails.walk.push(`exit from season ${si + 1}: view ${st.view}`);
  }
  check('desktop: each season enters from the start screen and Next walks all its steps (opener, chapters, mission)', fails.walk.length === 0, fails.walk.join('; '));
  check('Escape, "All seasons", and "Back to all seasons" return to the start screen', !fails.walk.some(f => f.startsWith('exit')));
  check('no other season is visible inside a season view', fails.season.length === 0, fails.season.join('; '));

  // Clicking a stop.
  await page.click('.entry[data-si="1"] .enter');
  await settle(page);
  await page.click('#layers .season .stop[data-go="3"]');
  await settle(page);
  let st = await state(page);
  let h = await headingIs(page, seasons[1].titles[2]);
  check('clicking a stop goes to that chapter', st.step === 3 && h.ok, `${JSON.stringify(st)} ${h.detail}`);
  await page.click('#layers .season .stop[data-go="1"]');
  await settle(page);
  check('clicking an earlier stop travels back to it', (await state(page)).step === 1);

  await page.click('#layers .season .nav-prev');
  await settle(page);
  check('Previous goes back one step', (await state(page)).step === 0);
  check('Previous is disabled on the season opener', await page.locator('#layers .season .nav-prev').isDisabled());
  await page.keyboard.press('ArrowRight');
  await settle(page);
  check('ArrowRight advances one step', (await state(page)).step === 1);
  const focusOk = await page.evaluate(() => document.activeElement && document.activeElement.matches('#layers .season .stage [tabindex="-1"]'));
  check('focus moves to the step heading after a transition', focusOk);
  const liveText = await page.evaluate(() => document.querySelector('#live').textContent);
  check('aria-live region announces the step', /The company brain, chapter 1 of 3/.test(liveText), liveText);

  // The marker stays visible on the chapter it arrived at (it does not fade or slide to a corner).
  const marker = await page.evaluate(() => {
    const m = document.querySelector('#layers .season .marker').getBoundingClientRect();
    const d = document.querySelector('#layers .season .stop[data-go="1"] .dot').getBoundingClientRect();
    const op = getComputedStyle(document.querySelector('#layers .season .marker')).opacity;
    const dist = Math.hypot((m.left + m.width / 2) - (d.left + d.width / 2), (m.top + m.height / 2) - (d.top + d.height / 2));
    return {ok: +op > 0.9 && dist < 6, detail: `opacity ${op}, distance ${dist.toFixed(1)}px`};
  });
  check('the marker stays visible on the chapter it arrived at', marker.ok, marker.detail);

  // No season names, numbers, or status words in visible text.
  const words = await page.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode, t = n.textContent.trim();
      if (!t || n.parentElement.closest('script, style, [aria-hidden="true"], [hidden]')) continue;
      if (/^(done|ongoing)$/i.test(t) || /\bseason\b|still open|mission complete/i.test(t)) out.push(t);
    }
    return out;
  });
  check('no "season", "done", "ongoing", or status words in visible text', words.length === 0, words);

  // Two quick clicks finish the first move and continue.
  await page.click('#layers .season .nav-next');
  await page.waitForTimeout(120);
  await page.click('#layers .season .nav-next');
  await settle(page);
  check('two quick Next clicks finish the first move and move on', (await state(page)).step === 3);

  // Enter the next season from the mission end.
  await page.click('#layers .season .stop.end');
  await settle(page);
  await page.click('#layers .season .stage [data-act="nextseason"]');
  await page.waitForTimeout(420);
  await shot(page, 'next-season-mid.png');
  await settle(page);
  st = await state(page);
  check('"Enter the next season" opens the next season at its opener', st.view === 'season' && st.season === 2 && st.step === 0, JSON.stringify(st));
  const only = await onlyThisSeason(page);
  check('after "Enter the next season", only the new season is on screen', only.ok, only.detail);

  await page.keyboard.press('Home');
  await settle(page);
  check('Home key returns to the start screen', (await state(page)).view === 'home');

  // Jump to now from the start screen: one sequence into Season 3, then to the newest chapter.
  await page.click('#btn-now');
  await page.waitForTimeout(500);
  await shot(page, 'jump-mid-1.png');
  await page.waitForTimeout(800);
  await shot(page, 'jump-mid-2.png');
  const midState = await page.evaluate(() => document.documentElement.dataset.state);
  await settle(page);
  await shot(page, 'jump-end.png');
  let lv = await latestOk(page);
  check('"Jump to now" lands on the newest chapter with "You are here"', lv.ok, lv.detail);
  check('"Jump to now" is one moving sequence, not a cut (still moving at 1.3 s)', midState === 'moving', midState);
  cf += await contrast(page, 'desktop latest');

  await page.keyboard.press('Escape');
  await settle(page);
  await page.keyboard.press('End');
  await settle(page);
  lv = await latestOk(page);
  check('End key on the start screen lands on the newest chapter', lv.ok, lv.detail);

  await page.keyboard.press('Escape');
  await settle(page);
  await page.click('.entry[data-si="0"] .enter');
  await settle(page);
  await page.keyboard.press('End');
  await settle(page);
  lv = await latestOk(page);
  check('End key inside another season lands on the newest chapter', lv.ok, lv.detail);
  await ctx.close();
}

// ---------- Phone 390x844 ----------
{
  const {ctx, page} = await open({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2}, 'phone');
  const pf = [];
  let pcf = 0;
  const snap = async name => {
    const ns = await noScroll(page);
    if (!ns.ok) pf.push(`${name}: ${ns.detail}`);
    await shot(page, name);
    pcf += await contrast(page, 'phone ' + name);
  };
  await snap('mobile-home.png');
  const entriesVisible = await page.evaluate(() => [...document.querySelectorAll('.entry')].every(e => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0; }));
  await page.click('.entry[data-si="1"] .enter');
  await settle(page);
  await snap('mobile-opener.png');
  const pathVisible = await page.evaluate(() => [...document.querySelectorAll('#layers .season .stop')].every(b => { const r = b.getBoundingClientRect(); const sheet = document.querySelector('#layers .season .stage > *').getBoundingClientRect(); return r.top >= 0 && r.bottom <= sheet.top + 1; }));
  await page.click('#layers .season .nav-next');
  await settle(page);
  await snap('mobile-chapter.png');
  const pathVisibleCard = await page.evaluate(() => [...document.querySelectorAll('#layers .season .stop')].every(b => { const r = b.getBoundingClientRect(); const sheet = document.querySelector('#layers .season .stage > *').getBoundingClientRect(); return r.top >= 0 && r.bottom <= sheet.top + 1; }));
  await page.click('#layers .season .stop.end');
  await settle(page);
  await snap('mobile-end.png');
  const only = await onlyThisSeason(page);
  await page.click('#layers .season .exit');
  await settle(page);
  const backHome = (await state(page)).view === 'home';
  await page.click('.top-now');
  await settle(page);
  await snap('mobile-latest.png');
  const lv = await latestOk(page);
  check('phone: no page scroll on start, opener, chapter, mission, latest', pf.length === 0, pf.join('; '));
  check('phone: all three season entries fit on the start screen', entriesVisible);
  check('phone: the whole season path stays visible above the sheet (opener and chapter)', pathVisible && pathVisibleCard);
  check('phone: only the entered season is on screen, and "All seasons" returns home', only.ok && backHome, only.detail);
  check('phone: "Jump to now" lands on the newest chapter', lv.ok, lv.detail);
  check(`phone: contrast AA on all visible text (${pcf} failures)`, pcf === 0,
    contrastLog.filter(f => f.where.startsWith('phone')).slice(0, 6).map(f => `${f.where}: "${f.text}" ${f.ratio}<${f.need}`).join('; '));
  await ctx.close();
}

check('desktop: no page scroll on any screen', fails.scroll.length === 0, fails.scroll.join('; '));
check(`desktop: contrast AA on all visible text on every screen (${cf} failures)`, cf === 0,
  contrastLog.filter(f => f.where.startsWith('desktop')).slice(0, 6).map(f => `${f.where}: "${f.text}" ${f.ratio}<${f.need}`).join('; '));

// ---------- Reduced motion ----------
{
  const {ctx, page} = await open({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'}, 'reduced');
  let slow = 0;
  const timed = async fn => { const t0 = Date.now(); await fn(); await settle(page); if (Date.now() - t0 > 1000) slow++; };
  await timed(() => page.click('.entry[data-si="0"] .enter'));
  await shot(page, 'reduced-opener.png');
  let steps = 1;
  while (!(await page.locator('#layers .season .nav-next').isDisabled())) {
    await timed(() => page.click('#layers .season .nav-next'));
    steps++;
    if (steps > 20) break;
  }
  const n = await page.evaluate(() => window.flyover2.seasons[0].chapters.length + 2);
  check(`reduced motion: Next walks all ${n} steps of Season 1`, steps === n, `walked ${steps}`);
  await timed(() => page.keyboard.press('Escape'));
  check('reduced motion: Escape returns to the start screen', (await state(page)).view === 'home');
  await timed(() => page.keyboard.press('End'));
  await shot(page, 'reduced-latest.png');
  const lv = await latestOk(page);
  check('reduced motion: End lands on the newest chapter', lv.ok, lv.detail);
  check('reduced motion: every change settles fast (crossfades, no travel)', slow === 0, `${slow} slow changes`);
  const ns = await noScroll(page);
  check('reduced motion: no page scroll', ns.ok, ns.detail);
  await ctx.close();
}

await browser.close();

{
  const bad = [];
  const dashes = new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']');
  for (const f of ['flyover-2.html', 'check-flyover-2.mjs']) if (dashes.test(await readFile(join(here, f), 'utf8'))) bad.push(f);
  check('no en dash or em dash characters in flyover-2.html or check-flyover-2.mjs', bad.length === 0, bad.join(', '));
}

check(`no console errors or page errors (${errors.length})`, errors.length === 0, errors.slice(0, 5).join(' | '));
const failed = results.filter(r => !r.pass).length;
console.log(`\n${results.length - failed} PASS, ${failed} FAIL, ${errors.length} console/page errors`);
await writeFile(join(out, 'report.json'), JSON.stringify({page: 'flyover-2.html', when: new Date().toISOString(), results, errors, contrastFailures: contrastLog}, null, 2));
process.exit(failed || errors.length ? 1 : 0);
