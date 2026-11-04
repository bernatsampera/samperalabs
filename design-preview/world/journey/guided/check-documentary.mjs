// E2E check for the "Documentary" guided journey. Run: node check-documentary.mjs
// Output: screenshots in shots/documentary/ and one PASS or FAIL line per check.
// Exit code 1 on any FAIL or any console or page error.
import { chromium } from '/Users/bsampera/Documents/projects/samperalabs/node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const shotDir = join(here, 'shots', 'documentary');
await mkdir(shotDir, {recursive: true});
const pageUrl = pathToFileURL(join(here, 'documentary.html')).href;

// Expected content, read from data.js
const sandbox = {window: {}};
vm.runInNewContext(await readFile(join(here, 'data.js'), 'utf8'), sandbox);
const DATA = sandbox.window.GUIDED;
const expectedCount = 1 + DATA.seasons.reduce((n, s) => n + DATA.chapters.filter(c => c.season === s.id).length + 2, 0) + 1;
const latestChapter = DATA.chapters.find(c => c.latest);

let failures = 0;
const errors = [];
const check = (name, pass, detail) => {
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}`);
  if (!pass) { failures++; if (detail !== undefined) console.log('    ' + (typeof detail === 'string' ? detail : JSON.stringify(detail))); }
};

async function openPage(browser, label, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${label}] pageerror: ${e.message}`));
  await page.goto(pageUrl);
  await page.evaluate(() => document.fonts.ready);
  await idle(page);
  return {context, page};
}

async function idle(page) {
  await page.waitForFunction(() => document.body.dataset.state === 'idle' && window.__doc && !window.__doc.busy, null, {timeout: 15000});
  await page.waitForTimeout(150);
}

const shot = (page, name) => page.screenshot({path: join(shotDir, `${name}.png`)});
const index = page => page.evaluate(() => window.__doc.index);

async function noScroll(page) {
  const m = await page.evaluate(() => ({
    sh: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    sw: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    ih: innerHeight, iw: innerWidth,
  }));
  return {ok: m.sh <= m.ih + 1 && m.sw <= m.iw + 1, m};
}

// WCAG contrast of every visible text element in the active scene and the dock.
function contrastAudit() {
  const parse = s => {
    const m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (p.length < 3 || p.some(Number.isNaN)) return null;
    return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1};
  };
  const lum = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const scenes = document.querySelectorAll('#stage .scene');
  const roots = [scenes[scenes.length - 1], document.querySelector('#dock')].filter(Boolean);
  const fails = [];
  let checked = 0;
  for (const root of roots) {
    for (const el of [root, ...root.querySelectorAll('*')]) {
      const hasText = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      if (el.closest('button:disabled, [aria-disabled="true"]')) continue;
      if (el.closest('.sr-only')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility !== 'visible' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
      const fg = parse(cs.color);
      let op = 1, bg = null, bgEl = null;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const s = getComputedStyle(n);
        op *= parseFloat(s.opacity);
        const b = parse(s.backgroundColor);
        if (s.backgroundColor && !b) { fails.push({text: el.textContent.trim().slice(0, 50), error: 'unparsable background ' + s.backgroundColor}); break; }
        if (b && b.a >= 0.999) { bg = b; bgEl = n; break; }
      }
      if (!fg) { fails.push({text: el.textContent.trim().slice(0, 50), error: 'unparsable color ' + cs.color}); continue; }
      if (!bg) bg = {r: 255, g: 255, b: 255, a: 1};
      const a = fg.a * op;
      const mix = {r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a)};
      const l1 = lum(mix), l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;
      checked++;
      if (ratio < need) {
        fails.push({text: el.textContent.trim().slice(0, 50), color: cs.color, bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})`, bgEl: bgEl && bgEl.className, ratio: +ratio.toFixed(2), need});
      }
    }
  }
  return {checked, fails};
}

async function audit(page, label, bucket) {
  const res = await page.evaluate(contrastAudit);
  bucket.checked += res.checked;
  res.fails.forEach(f => bucket.fails.push({step: label, ...f}));
}

const headingFocused = page => page.evaluate(() => {
  const scenes = document.querySelectorAll('#stage .scene');
  const h = scenes[scenes.length - 1] && scenes[scenes.length - 1].querySelector('h1');
  return !!h && document.activeElement === h;
});
const liveText = page => page.evaluate(() => document.querySelector('#live').textContent.trim());
const headingText = page => page.evaluate(() => {
  const h = document.querySelector('#stage .scene h1');
  return h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
});
const titleVisible = (page, title) => page.evaluate(t => {
  const h = document.querySelector('#stage .scene h1');
  if (!h || h.textContent.replace(/\s+/g, ' ').trim() !== t) return false;
  const r = h.getBoundingClientRect();
  const cs = getComputedStyle(h);
  return cs.visibility === 'visible' && r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth;
}, title);

const browser = await chromium.launch();

// 1. Desktop 1440x900: full walk
{
  const {context, page} = await openPage(browser, 'desktop', {viewport: {width: 1440, height: 900}});
  const contrast = {checked: 0, fails: []};
  const scrollFails = [], focusFails = [], liveFails = [], indexFails = [];

  let ns = await noScroll(page);
  check('desktop: document cannot scroll on load', ns.ok, ns.m);
  const count = await page.evaluate(() => window.__doc.count);
  check(`desktop: step count is ${expectedCount} (1 + seasons x (chapters + 2) + 1)`, count === expectedCount, `got ${count}`);
  check('desktop: Previous is disabled on the intro', await page.locator('#bPrev').isDisabled());

  await shot(page, 'step-01');
  await audit(page, 'step-01', contrast);
  if (!(await headingFocused(page))) focusFails.push(1);
  let lastLive = await liveText(page);
  if (!lastLive) liveFails.push(1);

  for (let i = 1; i < count; i++) {
    const t0 = Date.now();
    await page.click('#bNext');
    if (i === 1) {
      await page.waitForTimeout(Math.max(0, 450 - (Date.now() - t0)));
      await shot(page, 'opener-mid-1');
      await page.waitForTimeout(Math.max(0, 1300 - (Date.now() - t0)));
      await shot(page, 'opener-mid-2');
    }
    await idle(page);
    const label = `step-${String(i + 1).padStart(2, '0')}`;
    if ((await index(page)) !== i) indexFails.push(i);
    await shot(page, label);
    ns = await noScroll(page);
    if (!ns.ok) scrollFails.push({label, ...ns.m});
    await audit(page, label, contrast);
    if (!(await headingFocused(page))) focusFails.push(i + 1);
    const lt = await liveText(page);
    if (!lt || lt === lastLive) liveFails.push(i + 1);
    lastLive = lt;
  }
  check('desktop: Next walks every step in order', indexFails.length === 0, indexFails);
  check('desktop: document cannot scroll on any step', scrollFails.length === 0, scrollFails);
  check('desktop: focus moves to the step heading after each step', focusFails.length === 0, focusFails);
  check('desktop: live region announces each new step', liveFails.length === 0, liveFails);
  check('desktop: Next is disabled on the final step', await page.locator('#bNext').isDisabled());

  await page.click('#bPrev');
  await idle(page);
  check('desktop: Previous goes back one step', (await index(page)) === count - 2, await index(page));

  await page.click('#bStart');
  await idle(page);
  check('desktop: Back to start returns to the intro', (await index(page)) === 0, await index(page));

  await page.keyboard.press('End');
  await idle(page);
  const latestIdx = await page.evaluate(() => window.__doc.latest);
  check('desktop: End key lands on the latest chapter', (await index(page)) === latestIdx && await titleVisible(page, latestChapter.title), {index: await index(page), heading: await headingText(page)});
  check('desktop: "You are here" is visible on the latest chapter', await page.locator('#stage .scene .here').isVisible() && (await page.locator('#stage .scene .here').textContent()).includes('You are here'));

  await page.keyboard.press('ArrowRight');
  await idle(page);
  check('desktop: ArrowRight advances', (await index(page)) === latestIdx + 1, await index(page));

  await page.keyboard.press('ArrowLeft');
  await idle(page);
  check('desktop: ArrowLeft goes back', (await index(page)) === latestIdx, await index(page));

  await page.keyboard.press('Home');
  await idle(page);
  check('desktop: Home returns to the intro', (await index(page)) === 0, await index(page));

  const tj = Date.now();
  await page.click('#bNow');
  await page.waitForTimeout(Math.max(0, 520 - (Date.now() - tj)));
  await shot(page, 'jump-mid');
  await idle(page);
  check('desktop: Jump to now button lands on the latest chapter', (await index(page)) === latestIdx && await titleVisible(page, latestChapter.title), {index: await index(page), heading: await headingText(page)});

  await page.keyboard.press('Home');
  await idle(page);
  await page.keyboard.press('Enter');
  await idle(page);
  check('desktop: Enter on the heading goes next', (await index(page)) === 1, await index(page));

  await page.keyboard.press('Home');
  await idle(page);
  await page.click('#bNext');
  await page.waitForTimeout(220);
  await page.click('#bNext');
  await idle(page);
  const scenesInDom = await page.evaluate(() => document.querySelectorAll('#stage section.scene').length);
  check('desktop: a click during the opener finishes it and moves on', (await index(page)) === 2 && scenesInDom === 1, {index: await index(page), scenesInDom});

  await page.keyboard.press('Home');
  await idle(page);
  await page.click('#stage [data-act="begin"]');
  await idle(page);
  check('desktop: "Begin the journey" opens season 1', (await index(page)) === 1, await index(page));

  console.log(`    contrast: ${contrast.checked} text elements checked on ${count} steps`);
  contrast.fails.forEach(f => console.log('    contrast failure: ' + JSON.stringify(f)));
  check('desktop: all visible text meets WCAG AA contrast', contrast.fails.length === 0);
  await context.close();
}

// 2. Phone 390x844: short walk
{
  const {context, page} = await openPage(browser, 'phone', {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  const contrast = {checked: 0, fails: []};
  const scrollFails = [];
  const fits = async label => {
    const r = await page.evaluate(() => {
      const d = document.querySelector('#dock').getBoundingClientRect();
      const h = document.querySelector('#stage .scene h1').getBoundingClientRect();
      const inside = b => b.top >= 0 && b.left >= 0 && b.bottom <= innerHeight + 0.5 && b.right <= innerWidth + 0.5;
      return {dock: inside(d), heading: inside(h)};
    });
    return {label, ...r};
  };
  const visit = async label => {
    await shot(page, label);
    const ns = await noScroll(page);
    if (!ns.ok) scrollFails.push({label, ...ns.m});
    await audit(page, label, contrast);
    return fits(label);
  };
  const f1 = await visit('phone-intro');
  await page.click('#bNext'); await idle(page);
  const f2 = await visit('phone-opener');
  await page.click('#bNext'); await idle(page);
  const f3 = await visit('phone-chapter');
  check('phone: dock and chapter title are inside the viewport', f3.dock && f3.heading, f3);
  await page.click('#bNow'); await idle(page);
  const f4 = await visit('phone-latest');
  const latestIdx = await page.evaluate(() => window.__doc.latest);
  check('phone: Jump to now lands on the latest chapter', (await index(page)) === latestIdx && await titleVisible(page, latestChapter.title), await headingText(page));
  check('phone: dock and heading fit on intro, opener, and latest', [f1, f2, f4].every(f => f.dock && f.heading), [f1, f2, f4]);
  check('phone: document cannot scroll', scrollFails.length === 0, scrollFails);
  contrast.fails.forEach(f => console.log('    contrast failure: ' + JSON.stringify(f)));
  check('phone: all visible text meets WCAG AA contrast', contrast.fails.length === 0);
  await context.close();
}

// 3. Reduced motion: full walk
{
  const {context, page} = await openPage(browser, 'reduced', {viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
  const count = await page.evaluate(() => window.__doc.count);
  check('reduced motion: step count matches', count === expectedCount, count);
  const order = [], slow = [], scrollFails = [];
  for (let i = 1; i < count; i++) {
    const t0 = Date.now();
    await page.click('#bNext');
    await page.waitForFunction(() => document.body.dataset.state === 'idle', null, {timeout: 5000});
    const ms = Date.now() - t0;
    if (ms > 900) slow.push({step: i + 1, ms});
    await page.waitForTimeout(100);
    order.push(await index(page));
    const ns = await noScroll(page);
    if (!ns.ok) scrollFails.push(i + 1);
    if (i === 1) await shot(page, 'reduced-opener');
    if (i === 2) await shot(page, 'reduced-chapter');
  }
  check('reduced motion: Next walks every step', order.every((v, k) => v === k + 1), order);
  check('reduced motion: every step settles fast (crossfade only)', slow.length === 0, slow);
  check('reduced motion: document cannot scroll', scrollFails.length === 0, scrollFails);
  await page.keyboard.press('Home'); await idle(page);
  await page.keyboard.press('End'); await idle(page);
  const latestIdx = await page.evaluate(() => window.__doc.latest);
  check('reduced motion: End lands on the latest chapter', (await index(page)) === latestIdx && await titleVisible(page, latestChapter.title), await headingText(page));
  await context.close();
}

await browser.close();

// 4. Copy rule: no en dash or em dash in the page or this script
{
  const DASHES = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']');
  const bad = [];
  for (const f of ['documentary.html', 'check-documentary.mjs']) {
    const src = await readFile(join(here, f), 'utf8');
    if (DASHES.test(src)) bad.push(f);
  }
  check('copy: no en dash or em dash characters in the page or the check', bad.length === 0, bad);
}

errors.forEach(e => console.log('    ' + e));
console.log(`Errors: ${errors.length}`);
check('no console errors or page errors', errors.length === 0);
console.log(failures === 0 ? 'RESULT: PASS' : `RESULT: FAIL (${failures} failed)`);
process.exit(failures === 0 ? 0 : 1);
