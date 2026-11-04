// E2E proof for the "Flyover map" guided journey (flyover.html).
// Run: node check-flyover.mjs
// Output: screenshots in shots/flyover/, a report in shots/flyover/report.json,
// PASS/FAIL lines, and the error count. Exit code 1 on any FAIL or any page error.
import { chromium } from '/Users/bsampera/Documents/projects/samperalabs/node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'shots', 'flyover');
await mkdir(out, {recursive: true});
const pageUrl = pathToFileURL(join(here, 'flyover.html')).href;

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
  await page.waitForFunction(() => document.documentElement.dataset.state === 'idle' && window.flyover, null, {timeout: 15000});
  await page.waitForTimeout(150);
}
const index = page => page.evaluate(() => window.flyover.index);
const shot = (page, name) => page.screenshot({path: join(out, name)});
const pad = n => String(n).padStart(2, '0');

async function noScroll(page) {
  return page.evaluate(() => {
    const d = document.documentElement, b = document.body;
    const sh = Math.max(d.scrollHeight, b.scrollHeight), sw = Math.max(d.scrollWidth, b.scrollWidth);
    return {ok: sh <= innerHeight + 1 && sw <= innerWidth + 1, detail: `scroll ${sw}x${sh} vs viewport ${innerWidth}x${innerHeight}`};
  });
}

// WCAG contrast of every visible text node against the first solid background behind it.
async function contrast(page, where) {
  const fails = await page.evaluate(() => {
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
      let base = [251, 244, 230]; // paper map behind everything
      if (stack.length && stack[stack.length - 1][3] >= 0.99) base = stack.pop().slice(0, 3);
      for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
      return base;
    };
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
      const cs = getComputedStyle(el);
      const fg = parse(el instanceof SVGElement ? cs.fill : cs.color);
      if (!fg) continue;
      const bg = background(el);
      const fgSolid = over(fg, bg);
      const rr = ratio(fgSolid, bg);
      const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;
      if (rr < need) out.push({text: el.textContent.trim().slice(0, 60), ratio: Math.round(rr * 100) / 100, need, fg: fgSolid.map(Math.round).join(','), bg: bg.map(Math.round).join(',')});
    }
    return out;
  });
  fails.forEach(f => contrastLog.push({where, ...f}));
  return fails;
}

async function latestVisible(page) {
  return page.evaluate(() => {
    const latest = window.GUIDED.chapters.find(c => c.latest);
    const h = document.querySelector('#panels .card-title');
    if (!h) return {ok: false, detail: 'no chapter heading'};
    const r = h.getBoundingClientRect();
    let op = 1;
    for (let e = h; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
    const inView = r.width > 0 && r.height > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth;
    const ok = h.textContent.trim() === latest.title && inView && op > 0.99 && window.flyover.index === window.flyover.latestIndex;
    return {ok, detail: `heading "${h.textContent.trim()}", opacity ${op}, box ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`};
  });
}

// ---------- 1 to 4: desktop 1440x900 ----------
let desktopSteps = 0;
let expected = 0;
{
  const {ctx, page} = await open({viewport: {width: 1440, height: 900}}, 'desktop');
  expected = await page.evaluate(() => 1 + window.GUIDED.seasons.reduce((n, s) => n + window.GUIDED.chapters.filter(c => c.season === s.id).length + 2, 0) + 1);
  const ns0 = await noScroll(page);
  check('desktop: document cannot scroll at load', ns0.ok, ns0.detail);

  let scrollFails = [];
  let contrastFailCount = 0;
  let n = 1;
  await shot(page, `step-${pad(n)}.png`);
  contrastFailCount += (await contrast(page, `desktop step ${n}`)).length;
  let openerMid = false;
  while (!(await page.locator('#btn-next').isDisabled())) {
    const before = await index(page);
    await page.click('#btn-next');
    const after = await page.evaluate(() => window.flyover.steps[window.flyover.index].type);
    if (after === 'opener' && !openerMid) {
      openerMid = true;
      await page.waitForTimeout(500);
      await shot(page, 'opener-mid-1.png');
      await page.waitForTimeout(600);
      await shot(page, 'opener-mid-2.png');
    }
    await settle(page);
    n++;
    if ((await index(page)) !== before + 1) scrollFails.push(`Next from ${before} did not land on ${before + 1}`);
    await shot(page, `step-${pad(n)}.png`);
    const ns = await noScroll(page);
    if (!ns.ok) scrollFails.push(`step ${n}: ${ns.detail}`);
    contrastFailCount += (await contrast(page, `desktop step ${n}`)).length;
    if (n > 60) break;
  }
  desktopSteps = n;
  check('desktop: Next walks every step without page scroll', scrollFails.length === 0, scrollFails.join('; '));
  check(`step count equals 1 + sum(chapters + 2) + 1 (${expected})`, n === expected, `walked ${n}`);
  check('desktop: opener mid-transition frames saved', openerMid);
  check('desktop: Next is disabled on the final step', await page.locator('#btn-next').isDisabled());

  // 3: navigation
  const atEnd = await index(page);
  await page.click('#btn-prev');
  await settle(page);
  check('Previous goes back one step', (await index(page)) === atEnd - 1, `from ${atEnd} to ${await index(page)}`);

  await page.click('#btn-start');
  await settle(page);
  check('Back to start returns to the intro', (await index(page)) === 0);
  check('Previous is disabled on the intro', await page.locator('#btn-prev').isDisabled());

  await page.keyboard.press('ArrowRight');
  await settle(page);
  check('ArrowRight advances one step', (await index(page)) === 1, `index ${await index(page)}`);

  await page.keyboard.press('Home');
  await settle(page);
  check('Home returns to the intro', (await index(page)) === 0);

  await page.click('#btn-now');
  await page.waitForTimeout(700);
  await shot(page, 'jump-mid.png');
  const midState = await page.evaluate(() => document.documentElement.dataset.state);
  await settle(page);
  await shot(page, 'jump-end.png');
  const lv1 = await latestVisible(page);
  check('"Jump to now" button lands on the latest chapter, title visible', lv1.ok, lv1.detail);
  check('"Jump to now" is a flight, not a cut (still moving at 700 ms)', midState === 'moving', `state ${midState}`);
  contrastFailCount += (await contrast(page, 'desktop latest (jump)')).length;

  await page.keyboard.press('Home');
  await settle(page);
  await page.keyboard.press('End');
  await settle(page);
  const lv2 = await latestVisible(page);
  check('End key lands on the latest chapter, title visible', lv2.ok, lv2.detail);

  await page.keyboard.press('Home');
  await settle(page);
  await page.click('#btn-next');
  await page.waitForTimeout(120);
  await page.click('#btn-next');
  await settle(page);
  check('Two quick Next clicks finish the first transition and move on (index 2)', (await index(page)) === 2, `index ${await index(page)}`);

  const focus = await page.evaluate(() => document.activeElement && document.activeElement.matches('#panels [tabindex="-1"]'));
  check('Focus moves to the step heading after a transition', focus);
  const liveText = await page.evaluate(() => document.querySelector('#live').textContent);
  check('aria-live region announces the step', /Season 1, chapter 1 of/.test(liveText), liveText);

  check(`desktop: contrast AA on all visible text on every step (${contrastFailCount} failures)`, contrastFailCount === 0,
    contrastLog.filter(f => f.where.startsWith('desktop')).slice(0, 6).map(f => `${f.where}: "${f.text}" ${f.ratio}<${f.need}`).join('; '));
  await ctx.close();
}

// ---------- 5: phone 390x844 ----------
{
  const {ctx, page} = await open({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2}, 'phone');
  const fails = [];
  let cf = 0;
  const stepShot = async name => {
    const ns = await noScroll(page);
    if (!ns.ok) fails.push(`${name}: ${ns.detail}`);
    await shot(page, name);
    cf += (await contrast(page, 'phone ' + name)).length;
  };
  await stepShot('mobile-intro.png');
  await page.click('#btn-next');
  await settle(page);
  await stepShot('mobile-opener.png');
  await page.click('#btn-next');
  await settle(page);
  await stepShot('mobile-chapter.png');
  const chapterType = await page.evaluate(() => window.flyover.steps[window.flyover.index].type);
  await page.click('#btn-now');
  await settle(page);
  await stepShot('mobile-latest.png');
  const lv = await latestVisible(page);
  check('phone: no page scroll on intro, opener, chapter, latest', fails.length === 0, fails.join('; '));
  check('phone: walk reaches a chapter, then Jump to now lands on the latest chapter', chapterType === 'chapter' && lv.ok, lv.detail);
  check(`phone: contrast AA on all visible text (${cf} failures)`, cf === 0,
    contrastLog.filter(f => f.where.startsWith('phone')).slice(0, 6).map(f => `${f.where}: "${f.text}" ${f.ratio}<${f.need}`).join('; '));
  await ctx.close();
}

// ---------- 6: reduced motion ----------
{
  const {ctx, page} = await open({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'}, 'reduced');
  let n = 1;
  let slow = 0;
  while (!(await page.locator('#btn-next').isDisabled())) {
    const t0 = Date.now();
    await page.click('#btn-next');
    await settle(page);
    if (Date.now() - t0 > 1200) slow++;
    n++;
    if ((await index(page)) === 1) await shot(page, 'reduced-opener.png');
    if (n > 60) break;
  }
  check(`reduced motion: Next walks all ${expected} steps`, n === expected, `walked ${n}`);
  check('reduced motion: every step settles fast (crossfade, no flight)', slow === 0, `${slow} slow steps`);
  await page.keyboard.press('End');
  await settle(page);
  await shot(page, 'reduced-latest.png');
  const lv = await latestVisible(page);
  check('reduced motion: End lands on the latest chapter', lv.ok, lv.detail);
  const ns = await noScroll(page);
  check('reduced motion: no page scroll', ns.ok, ns.detail);
  await ctx.close();
}

await browser.close();

// ---------- copy rule: no en dash or em dash ----------
{
  const bad = [];
  for (const f of ['flyover.html', 'check-flyover.mjs']) {
    const text = await readFile(join(here, f), 'utf8');
    const dashes = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
    if (dashes.test(text)) bad.push(f);
  }
  check('no en dash or em dash characters in flyover.html or check-flyover.mjs', bad.length === 0, bad.join(', '));
}

// ---------- 7: errors and report ----------
check(`no console errors or page errors (${errors.length})`, errors.length === 0, errors.slice(0, 5).join(' | '));
const failed = results.filter(r => !r.pass).length;
console.log(`\n${results.length - failed} PASS, ${failed} FAIL, ${errors.length} console/page errors, ${desktopSteps} desktop steps`);
await writeFile(join(out, 'report.json'), JSON.stringify({
  page: 'flyover.html', when: new Date().toISOString(), expectedSteps: expected, desktopSteps,
  results, errors, contrastFailures: contrastLog,
}, null, 2));
process.exit(failed || errors.length ? 1 : 0);
