// E2E check for the design-system direction pages.
// Run from the repo root:
//   node design-preview/design-system/check.mjs                 (all directions and the compare page)
//   node design-preview/design-system/check.mjs a-survey        (one direction)
//   node design-preview/design-system/check.mjs --compare       (the compare page only)
// Output: shots/<dir>/*.png, shots/<dir>/report.json, shots/report.json, PASS/FAIL lines.
// Exit code 1 on any FAIL or any console or page error.
//
// Page contract (every direction page follows it):
//   #home, #story, #card, #system sections.
//   #story-frame: the working story view. data-state="idle|moving".
//   window.story = {seasons, latestSi, latestStep, view, season, step, enter, exit, go, jumpNow}.
//   Hooks inside #story-frame: .entry[data-si] .enter, [data-act="now"], .stop[data-go], .stop.end,
//   .nav-prev, .nav-next, [data-act="exit"], [data-act="nextseason"], .stage [tabindex="-1"],
//   .c-title, .here, [aria-live].
//   #card: [data-card-state="done"], [data-card-state="latest"], [data-card-state="next"].
//   #system: [data-tokens="color|type|space|radius|border|depth|button|link|icon|motion|layout"].
//   Text over artwork that the DOM cannot see (SVG terrain, images, gradients) states its real
//   backing color with data-contrast-bg="#rrggbb" on the text element or an ancestor.
import { chromium } from '../../node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { mkdir, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const ALL = ['a-survey', 'b-isotype', 'c-exhibition'];
const args = process.argv.slice(2);
const compareOnly = args.length === 1 && args[0] === '--compare';
const dirs = compareOnly ? [] : (args.filter(a => !a.startsWith('--')).length ? args.filter(a => !a.startsWith('--')) : ALL);
const runCompare = compareOnly || args.length === 0;

const BANNED_FONTS = ['Fraunces', 'Playfair', 'Cormorant', 'Lora', 'Crimson', 'Newsreader', 'Syne', 'Space Grotesk', 'Space Mono', 'IBM Plex', 'DM Sans', 'DM Serif', 'Outfit', 'Plus Jakarta', 'Instrument Sans', 'Nunito', 'Poppins'];
const DASHES = new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']');
const TOKEN_GROUPS = ['color', 'type', 'space', 'radius', 'border', 'depth', 'button', 'link', 'icon', 'motion', 'layout'];

// Visible text elements under a root. viewportOnly also drops text outside the viewport.
const VISIBLE_TEXT = `((rootSel, viewportOnly) => {
  const root = document.querySelector(rootSel);
  const out = [];
  if (!root) return out;
  const seen = new Set();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    if (el.closest('script, style, title, [aria-hidden="true"], [hidden], .sr-only, [aria-live]')) continue;
    if (el.closest('button:disabled, [aria-disabled="true"]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (viewportOnly && (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth)) continue;
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
})`;

const CONTRAST = `((rootSel, viewportOnly) => {
  const els = (${VISIBLE_TEXT})(rootSel, viewportOnly);
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const cx = cv.getContext('2d', {willReadFrequently: true});
  const rgba = s => {
    if (!s || s === 'none' || s === 'transparent' || s.startsWith('url(')) return null;
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = 'rgba(1, 2, 3, 0.5)';
    cx.fillStyle = s;
    if (cx.fillStyle === 'rgba(1, 2, 3, 0.5)' && !/^rgba\\(1, 2, 3/.test(s)) return null;
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const over = (top, base) => [0, 1, 2].map(i => top[i] * top[3] + base[i] * (1 - top[3]));
  let unverified = 0;
  const background = el => {
    const stack = [];
    let base = null, img = false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const stated = e.getAttribute('data-contrast-bg');
      if (stated) { base = rgba(stated).slice(0, 3); break; }
      const s = getComputedStyle(e);
      if (s.backgroundImage && s.backgroundImage !== 'none') img = true;
      const c = rgba(s.backgroundColor);
      if (c && c[3] > 0) { stack.push(c); if (c[3] >= 0.99) break; }
    }
    if (!base) {
      if (img) unverified++;
      base = [255, 255, 255];
      if (stack.length && stack[stack.length - 1][3] >= 0.99) base = stack.pop().slice(0, 3);
    }
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  };
  const fails = [];
  for (const el of els) {
    const cs = getComputedStyle(el);
    const fg = rgba(el instanceof SVGElement ? cs.fill : cs.color);
    if (!fg || fg[3] === 0) continue;
    const bg = background(el);
    const solid = over(fg, bg);
    const rr = ratio(solid, bg);
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10) || 400;
    const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
    if (rr < need) fails.push({text: el.textContent.trim().slice(0, 60), ratio: Math.round(rr * 100) / 100, need, fg: solid.map(Math.round).join(','), bg: bg.map(Math.round).join(',')});
  }
  return {checked: els.length, fails, unverified};
})`;

const browser = await chromium.launch();
const summary = {};
let anyFail = false;

for (const dir of dirs) {
  const r = await runDir(dir);
  summary[dir] = r;
  if (r.failed || r.errors.length) anyFail = true;
}
if (runCompare) {
  const r = await runCompare_();
  summary.compare = r;
  if (r.failed || r.errors.length) anyFail = true;
}
await browser.close();

const reportPath = join(here, 'shots', 'report.json');
let prev = {};
try { prev = JSON.parse(await readFile(reportPath, 'utf8')); } catch (e) { /* first run */ }
await mkdir(join(here, 'shots'), {recursive: true});
await writeFile(reportPath, JSON.stringify({...prev, ...Object.fromEntries(Object.entries(summary).map(([k, v]) => [k, {when: v.when, pass: v.results.length - v.failed, fail: v.failed, errors: v.errors.length}]))}, null, 2));
console.log('\nSUMMARY');
for (const [k, v] of Object.entries(summary)) console.log(`  ${k}: ${v.results.length - v.failed} PASS, ${v.failed} FAIL, ${v.errors.length} console/page errors`);
process.exit(anyFail ? 1 : 0);

// ---------------------------------------------------------------------------

async function runDir(dir) {
  const out = join(here, 'shots', dir);
  await mkdir(out, {recursive: true});
  const file = join(here, dir, 'index.html');
  const results = [], errors = [], contrastLog = [];
  const check = (name, pass, detail) => {
    results.push({name, pass: !!pass, detail: detail ?? null});
    console.log(`${pass ? 'PASS' : 'FAIL'} [${dir}]: ${name}${!pass && detail ? '  (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : ''}`);
  };
  const finish = async () => {
    const failed = results.filter(r => !r.pass).length;
    const rep = {page: `${dir}/index.html`, when: new Date().toISOString(), results, errors, contrastFailures: contrastLog};
    await writeFile(join(out, 'report.json'), JSON.stringify(rep, null, 2));
    return {...rep, failed};
  };
  if (!existsSync(file)) { check('page exists', false, file); return finish(); }
  const url = pathToFileURL(file).href;

  // Static checks on the direction's files.
  {
    const files = await listFiles(join(here, dir));
    const dashed = [], banned = [];
    for (const f of files) {
      if (!['.html', '.css', '.js', '.mjs', '.md', '.svg', '.json'].includes(extname(f))) continue;
      const t = await readFile(f, 'utf8');
      if (DASHES.test(t)) dashed.push(f.slice(here.length + 1));
      for (const name of BANNED_FONTS) {
        const re = new RegExp(`(font-family[^;{}]*|family=)[^;{}]*\\b${name.replace(' ', '[ +]')}\\b`, 'i');
        if (re.test(t)) banned.push(`${f.slice(here.length + 1)}: ${name}`);
      }
      if (/font-family[^;{}]*['"]Inter['"]|family=Inter\b/i.test(t)) banned.push(`${f.slice(here.length + 1)}: Inter`);
    }
    check('no en dash or em dash characters in the direction files', dashed.length === 0, dashed.join(', '));
    check('no default or retired faces (Fraunces, Nunito, Poppins, Inter, Space Grotesk, ...)', banned.length === 0, banned.join(', '));
  }

  const open = async (opts, label) => {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`[${label}] pageerror: ${e.message}`));
    await page.goto(url);
    try { await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))])); } catch (e) { /* ignore */ }
    await settle(page);
    return {ctx, page};
  };
  const settle = async page => {
    try {
      await page.waitForFunction(() => window.story && document.querySelector('#story-frame')?.dataset.state === 'idle', null, {timeout: 15000});
    } catch (e) { errors.push('story frame never reached data-state="idle"'); }
    await page.waitForTimeout(150);
  };
  const state = page => page.evaluate(() => ({view: window.story.view, season: window.story.season, step: window.story.step}));
  const toFrame = page => page.evaluate(() => document.getElementById('story-frame').scrollIntoView({block: 'start', behavior: 'instant'}));
  const frameShot = async (page, name) => { await toFrame(page); await page.locator('#story-frame').screenshot({path: join(out, name)}); };
  const sectionShot = (page, sel, name) => page.locator(sel).screenshot({path: join(out, name)});
  const contrast = async (page, sel, where, viewportOnly) => {
    const r = await page.evaluate(([src, s, v]) => eval(src)(s, v), [CONTRAST, sel, !!viewportOnly]);
    r.fails.forEach(f => contrastLog.push({where, ...f}));
    if (r.unverified) contrastLog.push({where, note: `${r.unverified} text elements sit on a background image or gradient without data-contrast-bg`});
    return r.fails.length;
  };
  const overflow = page => page.evaluate(() => ({ok: document.documentElement.scrollWidth <= innerWidth + 1, detail: `page width ${document.documentElement.scrollWidth} vs viewport ${innerWidth}`}));
  const frameFits = page => page.evaluate(() => {
    const f = document.getElementById('story-frame');
    const r = f.getBoundingClientRect();
    const ok = f.scrollHeight <= f.clientHeight + 1 && f.scrollWidth <= f.clientWidth + 1 && r.height >= Math.min(600, innerHeight) - 1 && r.height <= innerHeight + 1;
    return {ok, detail: `frame ${Math.round(r.width)}x${Math.round(r.height)}, content ${f.scrollWidth}x${f.scrollHeight}, viewport ${innerWidth}x${innerHeight}`};
  });
  const onlyThisSeason = page => page.evaluate(src => {
    const si = window.story.season;
    const others = window.story.seasons.filter((s, i) => i !== si).map(s => s.name);
    const texts = eval(src)('#story-frame', true).map(e => e.textContent.trim());
    const leaks = texts.filter(t => !/^Next/.test(t) && others.some(n => t.includes(n)));
    return {ok: leaks.length === 0, detail: `leaks ${JSON.stringify(leaks)}`};
  }, VISIBLE_TEXT);
  const headingIs = (page, text) => page.evaluate(text => {
    const hs = [...document.querySelectorAll('#story-frame .stage [tabindex="-1"]')].filter(h => getComputedStyle(h).visibility !== 'hidden');
    const h = hs[hs.length - 1];
    if (!h) return {ok: false, detail: 'no heading in .stage'};
    const r = h.getBoundingClientRect();
    let op = 1;
    for (let e = h; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
    const f = document.getElementById('story-frame').getBoundingClientRect();
    const inView = r.width > 0 && r.top >= f.top - 1 && r.bottom <= f.bottom + 1 && r.left >= f.left - 1 && r.right <= f.right + 1;
    return {ok: h.textContent.trim() === text && inView && op > 0.99, detail: `heading "${h.textContent.trim()}", opacity ${op.toFixed(2)}`};
  }, text);
  const latestOk = page => page.evaluate(() => {
    const s = window.story;
    const c = window.GUIDED.chapters.find(x => x.latest);
    const hs = [...document.querySelectorAll('#story-frame .stage .c-title')];
    const h = hs[hs.length - 1];
    const here = document.querySelector('#story-frame .stage .here');
    const f = document.getElementById('story-frame').getBoundingClientRect();
    const r = h && h.getBoundingClientRect();
    const ok = s.view === 'season' && s.season === s.latestSi && s.step === s.latestStep && h && h.textContent.trim() === c.title && here && r.top >= f.top - 1 && r.bottom <= f.bottom + 1;
    return {ok: !!ok, detail: `view ${s.view}, season ${s.season}, step ${s.step}, heading "${h && h.textContent.trim()}", here ${!!here}`};
  });
  const clickIn = (page, sel) => page.locator(`#story-frame ${sel}:visible`).first().click();
  const isDisabled = (page, sel) => page.locator(`#story-frame ${sel}:visible`).first().isDisabled();
  const pad = n => String(n).padStart(2, '0');

  // ---------- Desktop 1440x900 ----------
  {
    const {ctx, page} = await open({viewport: {width: 1440, height: 900}}, 'desktop');
    let cf = 0;
    const api = await page.evaluate(() => !!(window.story && window.story.seasons && typeof window.story.enter === 'function'));
    check('window.story API exists', api);
    if (!api) { await ctx.close(); return finish(); }
    const seasons = await page.evaluate(() => window.story.seasons.map(s => ({name: s.name, n: s.chapters.length, titles: s.chapters.map(c => c.title)})));

    // Home section.
    await page.evaluate(() => document.getElementById('home').scrollIntoView({block: 'start', behavior: 'instant'}));
    await page.waitForTimeout(900);
    await page.screenshot({path: join(out, 'home-viewport.png')});
    await sectionShot(page, '#home', 'home.png');
    cf += await contrast(page, '#home', 'desktop home', false);
    const homeText = await page.evaluate(() => document.getElementById('home').innerText);
    const need = ['Everything is information.', 'MAAT', 'AI has no memory', 'BJJGym', 'IndoEuroMap'];
    check('home section shows the motto, MAAT, AI has no memory, BJJGym, IndoEuroMap', need.every(t => homeText.includes(t)), need.filter(t => !homeText.includes(t)).join(', '));

    // Story overview.
    await toFrame(page);
    await settle(page);
    await frameShot(page, 'story-overview.png');
    cf += await contrast(page, '#story-frame', 'desktop story overview', true);
    let fit = await frameFits(page);
    check('desktop: story frame fills the viewport and has no inner scroll (overview)', fit.ok, fit.detail);
    check('story overview shows three entries', await page.evaluate(() => document.querySelectorAll('#story-frame .entry').length === 3));

    const walk = [], scroll = [], leak = [];
    for (let si = 0; si < seasons.length; si++) {
      await toFrame(page);
      await clickIn(page, `.entry[data-si="${si}"] .enter`);
      if (si === 0) {
        await page.waitForTimeout(300);
        await page.locator('#story-frame').screenshot({path: join(out, 'enter-mid-1.png')});
        await page.waitForTimeout(350);
        await page.locator('#story-frame').screenshot({path: join(out, 'enter-mid-2.png')});
      }
      await settle(page);
      let st = await state(page);
      if (st.view !== 'season' || st.season !== si || st.step !== 0) walk.push(`enter ${si}: ${JSON.stringify(st)}`);
      const n = seasons[si].n;
      let steps = 1;
      const snap = async name => {
        await frameShot(page, name);
        cf += await contrast(page, '#story-frame', `desktop ${name}`, true);
        const f = await frameFits(page);
        if (!f.ok) scroll.push(`${name}: ${f.detail}`);
        const o = await onlyThisSeason(page);
        if (!o.ok) leak.push(`${name}: ${o.detail}`);
      };
      await snap(`s${si + 1}-opener.png`);
      while (!(await isDisabled(page, '.nav-next'))) {
        const before = (await state(page)).step;
        await clickIn(page, '.nav-next');
        if (si === 1 && before === 1) {
          await page.waitForTimeout(450);
          await page.locator('#story-frame').screenshot({path: join(out, 'step-mid.png')});
        }
        await settle(page);
        st = await state(page);
        if (st.step !== before + 1) walk.push(`s${si + 1}: Next from ${before} went to ${st.step}`);
        steps++;
        if (st.step >= 1 && st.step <= n) {
          const h = await headingIs(page, seasons[si].titles[st.step - 1]);
          if (!h.ok) walk.push(`s${si + 1} chapter ${st.step}: ${h.detail}`);
          await snap(`s${si + 1}-ch${pad(st.step)}.png`);
        } else await snap(`s${si + 1}-end.png`);
        if (steps > 20) break;
      }
      if (steps !== n + 2) walk.push(`s${si + 1}: ${steps} steps, expected ${n + 2}`);
      if (si === 0) await page.keyboard.press('Escape');
      else if (si === 1) await clickIn(page, '[data-act="exit"]');
      else await clickIn(page, '.stage [data-act="exit"]');
      await settle(page);
      st = await state(page);
      if (st.view !== 'home') walk.push(`exit from s${si + 1}: view ${st.view}`);
    }
    check('desktop: each entry opens its part and Next walks every step (opener, chapters, mission)', walk.length === 0, walk.join('; '));
    check('desktop: no inner scroll in the story frame on any step', scroll.length === 0, scroll.join('; '));
    check('desktop: no other part is visible inside an open part', leak.length === 0, leak.join('; '));

    await toFrame(page);
    await clickIn(page, '.entry[data-si="1"] .enter');
    await settle(page);
    await clickIn(page, '.stop[data-go="3"]');
    await settle(page);
    let st = await state(page);
    let h = await headingIs(page, seasons[1].titles[2]);
    check('clicking a stop goes to that chapter', st.step === 3 && h.ok, `${JSON.stringify(st)} ${h.detail}`);
    await clickIn(page, '.stop[data-go="1"]');
    await settle(page);
    check('clicking an earlier stop travels back to it', (await state(page)).step === 1);
    await clickIn(page, '.nav-prev');
    await settle(page);
    check('Previous goes back one step', (await state(page)).step === 0);
    check('Previous is disabled on the opener', await isDisabled(page, '.nav-prev'));
    await page.keyboard.press('ArrowRight');
    await settle(page);
    check('ArrowRight advances one step', (await state(page)).step === 1);
    check('focus moves to the step heading after a transition', await page.evaluate(() => !!document.activeElement && document.activeElement.matches('#story-frame .stage [tabindex="-1"]')));
    const liveText = await page.evaluate(() => [...document.querySelectorAll('#story-frame [aria-live]')].map(e => e.textContent).join(' '));
    check('aria-live region announces the step', liveText.includes(seasons[1].name) && /chapter 1 of 3/i.test(liveText), liveText);
    const words = await page.evaluate(src => eval(src)('#story-frame', true).map(e => e.textContent.trim()).filter(t => /^(done|ongoing)$/i.test(t) || /\bseasons?\b/i.test(t)), VISIBLE_TEXT);
    check('no "season", "done", or "ongoing" in visible story text', words.length === 0, words.join(' | '));
    await clickIn(page, '.nav-next');
    await page.waitForTimeout(120);
    await clickIn(page, '.nav-next');
    await settle(page);
    check('two quick Next clicks finish the first move and move on', (await state(page)).step === 3);
    await clickIn(page, '.stop.end');
    await settle(page);
    await clickIn(page, '.stage [data-act="nextseason"]');
    await page.waitForTimeout(420);
    await page.locator('#story-frame').screenshot({path: join(out, 'next-part-mid.png')});
    await settle(page);
    st = await state(page);
    check('the mission end opens the next part at its opener', st.view === 'season' && st.season === 2 && st.step === 0, JSON.stringify(st));
    await page.keyboard.press('Home');
    await settle(page);
    check('Home key returns to the overview', (await state(page)).view === 'home');

    await toFrame(page);
    await clickIn(page, '[data-act="now"]');
    await page.waitForTimeout(450);
    await page.locator('#story-frame').screenshot({path: join(out, 'jump-mid-1.png')});
    const mid = await page.evaluate(() => document.getElementById('story-frame').dataset.state);
    await page.waitForTimeout(650);
    await page.locator('#story-frame').screenshot({path: join(out, 'jump-mid-2.png')});
    await settle(page);
    await frameShot(page, 'jump-end.png');
    let lv = await latestOk(page);
    check('"Jump to now" lands on the newest chapter with "You are here"', lv.ok, lv.detail);
    check('"Jump to now" is one moving sequence, not a cut', mid === 'moving', mid);
    cf += await contrast(page, '#story-frame', 'desktop latest', true);
    await page.keyboard.press('Escape');
    await settle(page);
    await page.keyboard.press('End');
    await settle(page);
    lv = await latestOk(page);
    check('End key on the overview lands on the newest chapter', lv.ok, lv.detail);

    // Chapter card and system sheet.
    await page.evaluate(() => document.getElementById('card').scrollIntoView({block: 'start', behavior: 'instant'}));
    await page.waitForTimeout(900);
    await sectionShot(page, '#card', 'card.png');
    cf += await contrast(page, '#card', 'desktop card', false);
    const cards = await page.evaluate(() => ['done', 'latest', 'next'].filter(s => !document.querySelector(`#card [data-card-state="${s}"]`)));
    check('chapter card shows done, latest, and next states', cards.length === 0, 'missing ' + cards.join(', '));
    await page.evaluate(() => document.getElementById('system').scrollIntoView({block: 'start', behavior: 'instant'}));
    await page.waitForTimeout(900);
    await sectionShot(page, '#system', 'system.png');
    cf += await contrast(page, '#system', 'desktop system', false);
    const groups = await page.evaluate(g => g.filter(x => !document.querySelector(`#system [data-tokens="${x}"]`)), TOKEN_GROUPS);
    check('system sheet shows every token group (color, type, space, radius, border, depth, button, link, icon, motion, layout)', groups.length === 0, 'missing ' + groups.join(', '));
    const of = await overflow(page);
    check('desktop: no horizontal page overflow', of.ok, of.detail);
    check(`desktop: contrast AA on all visible text (${cf} failures)`, cf === 0, contrastLog.filter(f => f.ratio && f.where.startsWith('desktop')).slice(0, 8).map(f => `${f.where}: "${f.text}" ${f.ratio}<${f.need}`).join('; '));
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({path: join(out, 'page-full.png'), fullPage: true});
    await ctx.close();
  }

  // ---------- Laptop 1280x720 ----------
  {
    const {ctx, page} = await open({viewport: {width: 1280, height: 720}}, 'laptop');
    let cf = 0;
    await toFrame(page);
    await frameShot(page, 'laptop-overview.png');
    cf += await contrast(page, '#story-frame', 'laptop overview', true);
    let fit = await frameFits(page);
    const fits = [fit.ok ? '' : 'overview: ' + fit.detail];
    await clickIn(page, '.entry[data-si="1"] .enter');
    await settle(page);
    await clickIn(page, '.nav-next');
    await settle(page);
    await clickIn(page, '.nav-next');
    await settle(page);
    await frameShot(page, 'laptop-chapter.png');
    cf += await contrast(page, '#story-frame', 'laptop chapter', true);
    fit = await frameFits(page);
    fits.push(fit.ok ? '' : 'chapter: ' + fit.detail);
    const h = await headingIs(page, (await page.evaluate(() => window.story.seasons[1].chapters[1].title)));
    check('laptop 1280x720: story frame fits with no inner scroll, chapter heading in view', fits.every(f => !f) && h.ok, fits.filter(Boolean).join('; ') + ' ' + h.detail);
    check(`laptop: contrast AA (${cf} failures)`, cf === 0, contrastLog.filter(f => f.ratio && f.where.startsWith('laptop')).slice(0, 6).map(f => `${f.where}: "${f.text}" ${f.ratio}<${f.need}`).join('; '));
    await ctx.close();
  }

  // ---------- Phone 390x844 ----------
  {
    const {ctx, page} = await open({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2}, 'phone');
    let cf = 0;
    const pf = [];
    await page.evaluate(() => document.getElementById('home').scrollIntoView({block: 'start', behavior: 'instant'}));
    await page.waitForTimeout(900);
    await page.screenshot({path: join(out, 'm-home-viewport.png')});
    await sectionShot(page, '#home', 'm-home.png');
    cf += await contrast(page, '#home', 'phone home', false);
    const snap = async name => {
      await frameShot(page, name);
      cf += await contrast(page, '#story-frame', 'phone ' + name, true);
      const f = await frameFits(page);
      if (!f.ok) pf.push(`${name}: ${f.detail}`);
    };
    await toFrame(page);
    await snap('m-overview.png');
    const entriesVisible = await page.evaluate(() => { const f = document.getElementById('story-frame').getBoundingClientRect(); return [...document.querySelectorAll('#story-frame .entry')].every(e => { const r = e.getBoundingClientRect(); return r.top >= f.top - 1 && r.bottom <= f.bottom + 1; }); });
    await clickIn(page, '.entry[data-si="1"] .enter');
    await settle(page);
    await snap('m-opener.png');
    await clickIn(page, '.nav-next');
    await settle(page);
    await snap('m-chapter.png');
    const stopsClear = await page.evaluate(() => {
      const f = document.getElementById('story-frame').getBoundingClientRect();
      const stage = [...document.querySelectorAll('#story-frame .stage > *')].pop();
      const s = stage ? stage.getBoundingClientRect() : null;
      const bad = [...document.querySelectorAll('#story-frame .stop')].filter(b => {
        const r = b.getBoundingClientRect();
        const overlaps = s && !(r.bottom <= s.top + 1 || r.top >= s.bottom - 1 || r.right <= s.left + 1 || r.left >= s.right - 1);
        return r.top < f.top - 1 || r.bottom > f.bottom + 1 || overlaps;
      });
      return {ok: bad.length === 0, detail: `${bad.length} stops hidden or under the card`};
    });
    await clickIn(page, '.stop.end');
    await settle(page);
    await snap('m-end.png');
    await clickIn(page, '[data-act="exit"]');
    await settle(page);
    const back = (await state(page)).view === 'home';
    await toFrame(page);
    await clickIn(page, '[data-act="now"]');
    await settle(page);
    await snap('m-latest.png');
    const lv = await latestOk(page);
    await page.evaluate(() => document.getElementById('card').scrollIntoView({block: 'start', behavior: 'instant'}));
    await page.waitForTimeout(900);
    await sectionShot(page, '#card', 'm-card.png');
    cf += await contrast(page, '#card', 'phone card', false);
    await page.evaluate(() => document.getElementById('system').scrollIntoView({block: 'start', behavior: 'instant'}));
    await page.waitForTimeout(900);
    await sectionShot(page, '#system', 'm-system.png');
    cf += await contrast(page, '#system', 'phone system', false);
    const of = await overflow(page);
    check('phone: story frame fits the viewport with no inner scroll on every step', pf.length === 0, pf.join('; '));
    check('phone: all three entries fit in the overview', entriesVisible);
    check('phone: every stop stays visible and clear of the chapter card', stopsClear.ok, stopsClear.detail);
    check('phone: exit returns to the overview, and "Jump to now" lands on the newest chapter', back && lv.ok, lv.detail);
    check('phone: no horizontal page overflow', of.ok, of.detail);
    check(`phone: contrast AA on all visible text (${cf} failures)`, cf === 0, contrastLog.filter(f => f.ratio && f.where.startsWith('phone')).slice(0, 8).map(f => `${f.where}: "${f.text}" ${f.ratio}<${f.need}`).join('; '));
    await ctx.close();
  }

  // ---------- Reduced motion ----------
  {
    const {ctx, page} = await open({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'}, 'reduced');
    let slow = 0;
    const timed = async fn => { const t0 = Date.now(); await fn(); await settle(page); if (Date.now() - t0 > 1000) slow++; };
    await toFrame(page);
    await timed(() => clickIn(page, '.entry[data-si="0"] .enter'));
    let steps = 1;
    while (!(await isDisabled(page, '.nav-next'))) {
      await timed(() => clickIn(page, '.nav-next'));
      steps++;
      if (steps > 20) break;
    }
    const n = await page.evaluate(() => window.story.seasons[0].chapters.length + 2);
    check(`reduced motion: Next walks all ${n} steps of the first part`, steps === n, `walked ${steps}`);
    await timed(() => page.keyboard.press('Escape'));
    check('reduced motion: Escape returns to the overview', (await state(page)).view === 'home');
    await timed(() => page.keyboard.press('End'));
    await frameShot(page, 'reduced-latest.png');
    const lv = await latestOk(page);
    check('reduced motion: End lands on the newest chapter', lv.ok, lv.detail);
    check('reduced motion: every change settles in under 1 s', slow === 0, `${slow} slow changes`);
    await ctx.close();
  }

  const unver = contrastLog.filter(f => f.note);
  if (unver.length) console.log(`NOTE [${dir}]: ${unver.length} views have text on images or gradients without data-contrast-bg. Check them by eye.`);
  check(`no console errors or page errors (${errors.length})`, errors.length === 0, errors.slice(0, 5).join(' | '));
  return finish();
}

async function runCompare_() {
  const out = join(here, 'shots');
  const results = [], errors = [], contrastLog = [];
  const check = (name, pass, detail) => {
    results.push({name, pass: !!pass, detail: detail ?? null});
    console.log(`${pass ? 'PASS' : 'FAIL'} [compare]: ${name}${!pass && detail ? '  (' + detail + ')' : ''}`);
  };
  const file = join(here, 'index.html');
  const t = await readFile(file, 'utf8');
  check('compare page: no en dash or em dash characters', !DASHES.test(t));
  for (const [vw, vh, label] of [[1600, 1000, 'desktop'], [390, 844, 'phone']]) {
    const ctx = await browser.newContext({viewport: {width: vw, height: vh}});
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') errors.push(`[compare ${label}] console: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`[compare ${label}] pageerror: ${e.message}`));
    await page.goto(pathToFileURL(file).href);
    await page.waitForLoadState('load');
    await page.evaluate(() => Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.complete ? null : new Promise(r => { i.onload = i.onerror = r; }); })));
    await page.waitForTimeout(400);
    const r = await page.evaluate(([src]) => eval(src)('body', false), [CONTRAST]);
    r.fails.forEach(f => contrastLog.push({where: label, ...f}));
    const broken = await page.evaluate(() => [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src')));
    check(`compare ${label}: every screenshot loads`, broken.length === 0, broken.slice(0, 5).join(', '));
    check(`compare ${label}: contrast AA (${r.fails.length} failures)`, r.fails.length === 0, r.fails.slice(0, 5).map(f => `"${f.text}" ${f.ratio}<${f.need}`).join('; '));
    const of = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
    check(`compare ${label}: no horizontal page overflow`, of);
    await page.screenshot({path: join(out, `compare-${label}.png`), fullPage: false});
    await ctx.close();
  }
  check(`compare: no console errors or page errors (${errors.length})`, errors.length === 0, errors.slice(0, 5).join(' | '));
  const failed = results.filter(r => !r.pass).length;
  return {page: 'index.html', when: new Date().toISOString(), results, errors, contrastFailures: contrastLog, failed};
}

async function listFiles(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) out.push(...await listFiles(p));
    else out.push(p);
  }
  return out;
}
