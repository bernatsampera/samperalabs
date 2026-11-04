// E2E check for the "Departure board" guided journey (departures.html).
// Run: node check-departures.mjs
// Output: screenshots in shots/departures/, one PASS or FAIL line per check, and the error count.
// Exit code 1 on any FAIL or any console or page error.
import { chromium } from '/Users/bsampera/Documents/projects/samperalabs/node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';

const NAME = 'departures';
const here = dirname(fileURLToPath(import.meta.url));
const pageFile = join(here, NAME + '.html');
const url = pathToFileURL(pageFile).href;
const shotDir = join(here, 'shots', NAME);
await mkdir(shotDir, {recursive: true});

const results = [];
const errors = [];
const check = (name, pass, detail) => {
  results.push({name, pass});
  console.log((pass ? 'PASS' : 'FAIL') + ': ' + name + (!pass && detail ? '\n    ' + String(detail).replace(/\n/g, '\n    ') : ''));
};

const browser = await chromium.launch();

async function open(contextOptions, label) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push('[' + label + '] console: ' + m.text()); });
  page.on('pageerror', e => errors.push('[' + label + '] page error: ' + e.message));
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
  return {context, page};
}
async function settle(page) {
  await page.waitForFunction(() => document.documentElement.dataset.settled === 'true', null, {timeout: 10000});
  await page.waitForTimeout(150);
}
const shot = (page, file) => page.screenshot({path: join(shotDir, file)});
const idx = page => page.evaluate(() => window.__journey.index);
const pad = n => String(n).padStart(2, '0');

async function scrollState(page) {
  return page.evaluate(() => {
    const d = document.documentElement, b = document.body;
    return {sh: d.scrollHeight, sw: d.scrollWidth, bsh: b.scrollHeight, bsw: b.scrollWidth, ih: innerHeight, iw: innerWidth, sy: scrollY, sx: scrollX};
  });
}
const scrollOk = s => s.sh <= s.ih + 1 && s.sw <= s.iw + 1 && s.bsh <= s.ih + 1 && s.bsw <= s.iw + 1 && s.sy === 0 && s.sx === 0;

// WCAG contrast of every visible text node against the first solid background behind it.
async function contrast(page) {
  return page.evaluate(() => {
    const parse = s => {
      const m = String(s).match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return {r: p[0], g: p[1], b: p[2], a: p[3] == null ? 1 : p[3]};
    };
    const lum = c => [c.r, c.g, c.b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const bgOf = el => {
      for (let e = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c && c.a >= 0.9) return c;
      }
      return parse(getComputedStyle(document.body).backgroundColor) || {r: 255, g: 255, b: 255, a: 1};
    };
    const skipped = el => {
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        if (e.getAttribute('aria-hidden') === 'true') return true;
        if (e.disabled) return true;
        const s = getComputedStyle(e);
        if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return true;
      }
      return false;
    };
    const out = [];
    const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (!el || seen.has(el) || el.closest('script, style')) continue;
      seen.add(el);
      if (skipped(el)) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue;
      if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
      const s = getComputedStyle(el);
      const fg = parse(s.color), bg = bgOf(el);
      const size = parseFloat(s.fontSize), weight = parseInt(s.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;
      const value = ratio(fg, bg);
      if (value < need) out.push({text: n.textContent.trim().slice(0, 60), fg: s.color, bg: 'rgb(' + bg.r + ', ' + bg.g + ', ' + bg.b + ')', ratio: +value.toFixed(2), need});
    }
    return out;
  });
}

// Is the heading of the current step on screen? (opener: the board itself)
async function headingInView(page) {
  return page.evaluate(() => {
    const t = window.__journey.steps[window.__journey.index];
    const el = t.type === 'opener' ? document.querySelector('#layer .oboard') : document.querySelector('#stage .panel h2');
    if (!el) return {ok: false, why: 'no heading'};
    const r = el.getBoundingClientRect();
    const ok = r.width > 0 && r.height > 0 && r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1;
    return {ok, why: JSON.stringify({top: r.top, bottom: r.bottom, left: r.left, right: r.right}), text: el.textContent.trim().slice(0, 80)};
  });
}

const contrastFails = [];
const scrollFails = [];
const viewFails = [];
async function audit(page, label) {
  const s = await scrollState(page);
  if (!scrollOk(s)) scrollFails.push(label + ' ' + JSON.stringify(s));
  const c = await contrast(page);
  c.forEach(f => contrastFails.push(label + ': "' + f.text + '" ' + f.fg + ' on ' + f.bg + ' = ' + f.ratio + ' (needs ' + f.need + ')'));
  const v = await headingInView(page);
  if (!v.ok) viewFails.push(label + ' ' + v.why);
}

/* ---------- 1. Desktop walk, 1440x900 ---------- */
{
  const {context, page} = await open({viewport: {width: 1440, height: 900}}, 'desktop');
  const s0 = await scrollState(page);
  check('desktop: document cannot scroll on load', scrollOk(s0), JSON.stringify(s0));

  const info = await page.evaluate(() => ({
    total: window.__journey.total,
    expected: 1 + window.GUIDED.seasons.reduce((a, s) => a + window.GUIDED.chapters.filter(c => c.season === s.id).length + 2, 0) + 1,
    steps: window.__journey.steps,
    latest: window.__journey.latestIndex,
    latestTitle: window.GUIDED.chapters.find(c => c.latest).title,
  }));

  await shot(page, 'step-01.png');
  await audit(page, 'step-01');
  let clicks = 0;
  let orderOk = true;
  let firstOpenerDone = false;
  let boardText = '';
  while (!(await page.locator('#next').isDisabled())) {
    const before = await idx(page);
    const target = before + 1;
    const isFirstOpener = !firstOpenerDone && info.steps[target].type === 'opener';
    const t0 = Date.now();
    await page.click('#next');
    clicks++;
    if (isFirstOpener) {
      firstOpenerDone = true;
      await page.waitForTimeout(Math.max(0, 650 - (Date.now() - t0)));
      await shot(page, 'opener-mid-1.png');
      await page.waitForTimeout(Math.max(0, 1400 - (Date.now() - t0)));
      await shot(page, 'opener-mid-2.png');
    }
    await settle(page);
    const now = await idx(page);
    if (now !== target) orderOk = false;
    if (isFirstOpener) {
      boardText = await page.evaluate(() => [...document.querySelectorAll('#layer .frow')].map(r => [...r.querySelectorAll('.flap .top .ch')].map(c => c.textContent || ' ').join('').trimEnd()).join(' | '));
    }
    await shot(page, 'step-' + pad(now + 1) + '.png');
    await audit(page, 'step-' + pad(now + 1));
    if (clicks > 60) break;
  }
  check('desktop: Next walks every step in order', orderOk && (await idx(page)) === info.total - 1);
  check('step count equals 1 + sum(chapters + 2) + 1 (' + info.expected + ')', info.total === info.expected && clicks + 1 === info.expected, 'total ' + info.total + ', expected ' + info.expected + ', clicks + 1 = ' + (clicks + 1));
  check('first opener board spells SEASON 01 and the mission', /^SEASON 01 \| INTERNAL AI TOOLS \| MISSION: /.test(boardText), boardText);

  // Previous goes back exactly one step.
  const atEnd = await idx(page);
  await page.click('#prev');
  await settle(page);
  check('Previous goes back one step', (await idx(page)) === atEnd - 1, 'from ' + atEnd + ' to ' + (await idx(page)));

  // ArrowRight advances.
  const beforeArrow = await idx(page);
  await page.keyboard.press('ArrowRight');
  await settle(page);
  check('ArrowRight advances one step', (await idx(page)) === beforeArrow + 1);

  // Back to start.
  await page.click('#start');
  await settle(page);
  check('"Back to start" returns to the intro', (await idx(page)) === 0);

  // Jump to now button from the intro.
  await page.click('#jump');
  await settle(page);
  const jumpIdx = await idx(page);
  const jumpTitle = page.locator('#stage .panel h2', {hasText: info.latestTitle});
  const jumpVisible = await jumpTitle.isVisible();
  const jumpView = await headingInView(page);
  check('"Jump to now" lands on the latest chapter and its title is visible', jumpIdx === info.latest && jumpVisible && jumpView.ok, 'index ' + jumpIdx + ', visible ' + jumpVisible + ', ' + jumpView.why);
  const hereBadge = await page.locator('#stage .here').isVisible();
  check('latest chapter shows "You are here"', hereBadge);
  await shot(page, 'jump-to-now.png');

  // Home goes back to the intro, End jumps to now.
  await page.keyboard.press('Home');
  await settle(page);
  check('Home key returns to the intro', (await idx(page)) === 0);
  await page.keyboard.press('End');
  await settle(page);
  const endIdx = await idx(page);
  const endVisible = await page.locator('#stage .panel h2', {hasText: info.latestTitle}).isVisible();
  check('End key lands on the latest chapter and its title is visible', endIdx === info.latest && endVisible);

  // Focus moves to the step heading after a transition.
  const focusTag = await page.evaluate(() => document.activeElement && document.activeElement.tagName + ':' + document.activeElement.textContent.trim().slice(0, 40));
  check('focus moves to the step heading after a transition', /^H2:/.test(focusTag || ''), focusTag);

  // Space advances when focus is on the heading; Enter on a focused button acts once.
  await page.keyboard.press('Home');
  await settle(page);
  await page.keyboard.press('Space');
  await settle(page);
  check('Space advances when focus is not on a control', (await idx(page)) === 1);
  await page.focus('#next');
  await page.keyboard.press('Enter');
  await settle(page);
  check('Enter on the focused Next button advances exactly one step', (await idx(page)) === 2);

  // Rapid clicks: a click during a transition finishes it and moves on.
  await page.keyboard.press('Home');
  await settle(page);
  for (let k = 0; k < 5; k++) { await page.click('#next'); await page.waitForTimeout(80); }
  await settle(page);
  const rapid = await page.evaluate(() => ({
    index: window.__journey.index,
    panels: document.querySelectorAll('#stage > .panel').length,
    boards: document.querySelectorAll('#layer > *').length,
    mx: window.__journey.markerX(),
    px: window.__journey.pointX(window.__journey.index),
  }));
  check('rapid Next clicks end on step 6 with one view and the marker in place', rapid.index === 5 && rapid.panels + rapid.boards === 1 && Math.abs(rapid.mx - rapid.px) <= 2, JSON.stringify(rapid));

  // Rapid click during the first opener: Next stays usable.
  await page.keyboard.press('Home');
  await settle(page);
  await page.click('#next');
  await page.waitForTimeout(500);
  await page.click('#next');
  await settle(page);
  check('Next during the opener transition moves on to the first chapter', (await idx(page)) === 2);

  check('desktop: no page scroll on any step', scrollFails.length === 0, scrollFails.join('\n'));
  check('desktop: step heading inside the viewport on every step', viewFails.length === 0, viewFails.join('\n'));
  await context.close();
}

/* ---------- 2. Phone, 390x844 ---------- */
{
  scrollFails.length = 0;
  viewFails.length = 0;
  const {context, page} = await open({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2}, 'phone');
  await shot(page, 'phone-intro.png');
  await audit(page, 'phone-intro');
  await page.click('#next');
  await settle(page);
  await shot(page, 'phone-opener.png');
  await audit(page, 'phone-opener');
  await page.click('#next');
  await settle(page);
  await shot(page, 'phone-chapter.png');
  await audit(page, 'phone-chapter');
  await page.click('#jump');
  await settle(page);
  await shot(page, 'phone-latest.png');
  await audit(page, 'phone-latest');
  const latestOk = await page.evaluate(() => window.__journey.index === window.__journey.latestIndex);
  const nextBox = await page.locator('#next').boundingBox();
  check('phone: no page scroll', scrollFails.length === 0, scrollFails.join('\n'));
  check('phone: step heading inside the viewport (intro, opener, chapter, latest)', viewFails.length === 0 && latestOk, viewFails.join('\n'));
  check('phone: Next button fully visible', !!nextBox && nextBox.y >= 0 && nextBox.y + nextBox.height <= 844 && nextBox.x >= 0 && nextBox.x + nextBox.width <= 390, JSON.stringify(nextBox));
  await context.close();
}

/* ---------- 3. Contrast on every audited step ---------- */
check('contrast: all visible text meets WCAG AA', contrastFails.length === 0, contrastFails.join('\n'));

/* ---------- 4. Reduced motion walk ---------- */
{
  const {context, page} = await open({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'}, 'reduced');
  const total = await page.evaluate(() => window.__journey.total);
  let clicks = 0;
  let slow = [];
  while (!(await page.locator('#next').isDisabled())) {
    const t0 = Date.now();
    await page.click('#next');
    await page.waitForFunction(() => document.documentElement.dataset.settled === 'true', null, {timeout: 5000});
    const ms = Date.now() - t0;
    clicks++;
    if (ms > 600) slow.push('step ' + (clicks + 1) + ': ' + ms + ' ms');
    if ((await idx(page)) === 2) { await page.waitForTimeout(100); await shot(page, 'reduced-step-03.png'); }
    if (clicks > 60) break;
  }
  check('reduced motion: walks all steps', clicks + 1 === total && (await idx(page)) === total - 1, 'clicks ' + clicks + ', total ' + total);
  check('reduced motion: each step settles in under 600 ms', slow.length === 0, slow.join(', '));
  await page.click('#jump');
  await settle(page);
  const ok = await page.evaluate(() => window.__journey.index === window.__journey.latestIndex);
  check('reduced motion: "Jump to now" lands on the latest chapter', ok);
  await context.close();
}

/* ---------- 5. No en dash or em dash in the page or this script ---------- */
{
  const bad = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
  const html = await readFile(pageFile, 'utf8');
  const self = await readFile(fileURLToPath(import.meta.url), 'utf8');
  check('no en dash or em dash characters in the page or the check', !bad.test(html) && !bad.test(self));
}

await browser.close();

console.log('Console/page errors: ' + errors.length);
errors.forEach(e => console.log('  ' + e));
const failed = results.filter(r => !r.pass).length;
console.log(failed ? failed + ' check(s) failed.' : 'All ' + results.length + ' checks passed.');
process.exit(failed || errors.length ? 1 : 0);
