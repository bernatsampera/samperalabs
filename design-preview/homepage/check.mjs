// E2E proof for the home page options in design-preview/homepage/.
// Run all:  node design-preview/homepage/check.mjs
// Run one:  node design-preview/homepage/check.mjs b
// Output: screenshots in shots/<option>/, a report in shots/<option>/report.json,
// a summary in shots/report.json, PASS/FAIL lines, and exit code 1 on any FAIL.
//
// Each option must have:
//   [data-panel="maat"]    the MAAT block, with the mission text in [data-maat-mission]
//   a[data-enter]          links into the story view (flyover-2.html)
//   [data-panel="memory"]  the "AI has no memory" block, with no links
import { chromium } from '/Users/bsampera/Documents/projects/samperalabs/node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const OPTIONS = [
  {id: 'a', file: 'a-stack.html', name: 'Stack'},
  {id: 'b', file: 'b-columns.html', name: 'Two columns'},
  {id: 'c', file: 'c-overview.html', name: 'Overview first'},
  {id: 'd', file: 'd-scenes.html', name: 'Guided scenes'},
];
const only = process.argv[2];
const run = only ? OPTIONS.filter(o => o.id === only) : OPTIONS;
if (!run.length) { console.error(`Unknown option "${only}". Use one of: ${OPTIONS.map(o => o.id).join(', ')}`); process.exit(2); }

const DESKTOP = {viewport: {width: 1440, height: 900}, deviceScaleFactor: 1};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
const browser = await chromium.launch();
const summary = [];

// Visible text in the viewport: skip aria-hidden, hidden, sr-only, zero-size, invisible, off-screen.
const VISIBLE_TEXT = `(() => {
  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    if (el.closest('script, style, [aria-hidden="true"], [hidden], .sr-only, .skip')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    let op = 1, hidden = false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const s = getComputedStyle(e);
      op *= parseFloat(s.opacity);
      if (s.visibility === 'hidden' || s.display === 'none') hidden = true;
    }
    if (hidden || op < 0.05) continue;
    // Skip text covered by another element (a sticky bar or a stacked scene).
    const cx = Math.min(innerWidth - 1, Math.max(0, r.left + Math.min(r.width, 40) / 2));
    const cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const hit = document.elementFromPoint(cx, cy);
    if (hit && !el.contains(hit) && !hit.contains(el)) continue;
    out.push(el);
  }
  return out;
})()`;

const CONTRAST = `(src) => {
  const els = eval(src);
  const parse = s => {
    const m = /rgba?\\(([^)]+)\\)/.exec(s || '');
    if (!m) return null;
    const p = m[1].split(/[\\s,/]+/).filter(Boolean).map(Number);
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
    const fg = parse(cs.color);
    if (!fg) continue;
    let op = 1;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
    const bg = background(el);
    const fgSolid = over([fg[0], fg[1], fg[2], fg[3] * op], bg);
    const rr = ratio(fgSolid, bg);
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10) || 400;
    const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
    if (rr < need) res.push({text: el.textContent.trim().replace(/\\s+/g, ' ').slice(0, 60), ratio: Math.round(rr * 100) / 100, need, fg: fgSolid.map(Math.round).join(','), bg: bg.map(Math.round).join(',')});
  }
  return res;
}`;

for (const opt of run) {
  const out = join(here, 'shots', opt.id);
  await mkdir(out, {recursive: true});
  const url = pathToFileURL(join(here, opt.file)).href;
  const results = [];
  const errors = [];
  const contrastLog = [];
  const check = (name, pass, detail) => {
    results.push({name, pass: !!pass, detail: detail ?? null});
    console.log(`  ${pass ? 'PASS' : 'FAIL'}: ${name}${!pass && detail ? '  (' + detail + ')' : ''}`);
  };
  console.log(`\nOption ${opt.id.toUpperCase()}: ${opt.name} (${opt.file})`);

  async function open(ctxOptions, label) {
    const ctx = await browser.newContext(ctxOptions);
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`[${label}] pageerror: ${e.message}`));
    const resp = await page.goto(url).catch(e => { errors.push(`[${label}] goto: ${e.message}`); return null; });
    if (!resp && !(await page.content()).includes('data-panel')) return {ctx, page, ok: false};
    await page.waitForFunction(() => document.documentElement.dataset.state === 'idle', null, {timeout: 15000})
      .catch(() => errors.push(`[${label}] page never reached data-state="idle"`));
    await page.waitForTimeout(200);
    return {ctx, page, ok: true};
  }

  async function contrastScan(page, where) {
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.floor((await page.evaluate(() => innerHeight)) * 0.7);
    const seen = new Set();
    for (let y = 0; y <= total; y += step) {
      await page.evaluate(top => window.scrollTo({top, behavior: 'instant'}), y);
      await page.waitForTimeout(120);
      const fails = await page.evaluate(`(${CONTRAST})(${JSON.stringify(VISIBLE_TEXT)})`);
      for (const f of fails) {
        const key = f.text + f.fg + f.bg;
        if (seen.has(key)) continue;
        seen.add(key);
        contrastLog.push({where, scrollY: y, ...f});
      }
    }
    await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
    await page.waitForTimeout(150);
    return seen.size;
  }

  async function firstScreen(page) {
    return page.evaluate(() => {
      const panel = document.querySelector('[data-panel="maat"]');
      const mission = document.querySelector('[data-maat-mission]');
      const nameHit = [...document.querySelectorAll('h1, h2, p, a, span')].find(e => e.textContent.trim() === 'Bernat Sampera' || e.textContent.includes('Bernat Sampera'));
      const nr = nameHit ? nameHit.getBoundingClientRect() : null;
      const pr = panel ? panel.getBoundingClientRect() : null;
      const mr = mission ? mission.getBoundingClientRect() : null;
      return {
        name: !!nr && nr.top >= 0 && nr.bottom <= innerHeight,
        panelTop: pr ? Math.round(pr.top) : null,
        missionBottom: mr ? Math.round(mr.bottom) : null,
        vh: innerHeight,
      };
    });
  }

  async function overflow(page) {
    return page.evaluate(() => {
      const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
      return {ok: sw <= innerWidth + 1, detail: `scrollWidth ${sw} vs ${innerWidth}`};
    });
  }

  async function enterStory(page, label, {expectCover}) {
    const before = errors.length;
    const link = page.locator('a[data-enter]').first();
    await link.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const href = await link.getAttribute('href');
    await link.click();
    let coverSeen = false;
    if (expectCover) {
      await page.waitForTimeout(300);
      coverSeen = await page.evaluate(() => !!document.querySelector('.guided-cover')).catch(() => false);
      if (coverSeen) await page.screenshot({path: join(out, `${label}-transition.png`)}).catch(() => {});
    }
    await page.waitForURL(/flyover-2\.html/, {timeout: 6000}).catch(() => {});
    const arrived = /flyover-2\.html/.test(page.url());
    let ready = false;
    if (arrived) {
      ready = await page.waitForFunction(() => window.flyover2 && document.documentElement.dataset.state === 'idle', null, {timeout: 15000}).then(() => true).catch(() => false);
      await page.waitForTimeout(200);
      await page.screenshot({path: join(out, `${label}-story.png`)});
    }
    return {href, arrived, ready, coverSeen, newErrors: errors.length - before};
  }

  // Desktop
  {
    const {ctx, page, ok} = await open(DESKTOP, 'desktop');
    check('desktop: page loads', ok);
    if (ok) {
      await page.screenshot({path: join(out, 'desktop-first.png')});
      await page.screenshot({path: join(out, 'desktop-full.png'), fullPage: true});
      const fs = await firstScreen(page);
      check('desktop: name visible on the first screen', fs.name);
      check('desktop: MAAT mission fully visible on the first screen (1440x900)', fs.missionBottom !== null && fs.missionBottom <= fs.vh, `mission bottom ${fs.missionBottom}px, viewport ${fs.vh}px`);
      const of = await overflow(page);
      check('desktop: no horizontal scroll', of.ok, of.detail);

      const facts = await page.evaluate(() => {
        const enter = [...document.querySelectorAll('a[data-enter]')];
        const memory = document.querySelector('[data-panel="memory"]');
        const text = document.body.innerText;
        return {
          enterCount: enter.length,
          enterHrefs: [...new Set(enter.map(a => a.getAttribute('href')))],
          memoryLinks: memory ? memory.querySelectorAll('a').length : -1,
          memorySoon: memory ? /coming soon/i.test(memory.textContent) : false,
          principles: window.WORLD.principles.filter(p => text.includes(p.title)).length,
          products: [...document.querySelectorAll('a[target="_blank"]')].map(a => a.getAttribute('href')),
          seasons: window.GUIDED.seasons.filter(s => text.includes(s.name)).length,
        };
      });
      check('links: at least one "Enter" link into the story view', facts.enterCount > 0, `${facts.enterCount}`);
      check('links: every "Enter" link opens flyover-2.html', facts.enterHrefs.every(h => h.endsWith('world/journey/guided/flyover-2.html')), facts.enterHrefs.join(', '));
      check('"AI has no memory": no links, and a "coming soon" note', facts.memoryLinks === 0 && facts.memorySoon, `links ${facts.memoryLinks}, soon ${facts.memorySoon}`);
      check('all 5 principles shown', facts.principles === 5, `${facts.principles} of 5`);
      check('all 3 MAAT seasons named', facts.seasons === 3, `${facts.seasons} of 3`);
      check('BJJGym and IndoEuroMap link out in a new tab', ['https://bjjgym.com', 'https://indoeuromap.com'].every(h => facts.products.includes(h)), facts.products.join(', '));

      const cf = await contrastScan(page, 'desktop');
      check(`desktop: WCAG AA contrast on all text (${cf} failures)`, cf === 0,
        contrastLog.filter(f => f.where === 'desktop').slice(0, 5).map(f => `"${f.text}" ${f.ratio}<${f.need}`).join('; '));

      const e = await enterStory(page, 'desktop', {expectCover: true});
      check('desktop: "Enter" plays the guided move (cover grows from the panel)', e.coverSeen);
      check('desktop: "Enter" opens the story view, and it is ready', e.arrived && e.ready, `arrived ${e.arrived}, ready ${e.ready}`);
      check('desktop: story view has zero console errors after the move', e.newErrors === 0, `${e.newErrors} new errors`);
    }
    await ctx.close();
  }

  // Phone
  {
    const {ctx, page, ok} = await open(PHONE, 'phone');
    check('phone: page loads', ok);
    if (ok) {
      await page.screenshot({path: join(out, 'phone-first.png')});
      await page.screenshot({path: join(out, 'phone-full.png'), fullPage: true});
      const fs = await firstScreen(page);
      check('phone: name visible on the first screen', fs.name);
      check('phone: MAAT block starts on the first screen (390x844)', fs.panelTop !== null && fs.panelTop < fs.vh - 60, `panel top ${fs.panelTop}px, viewport ${fs.vh}px`);
      const of = await overflow(page);
      check('phone: no horizontal scroll', of.ok, of.detail);
      const cf = await contrastScan(page, 'phone');
      check(`phone: WCAG AA contrast on all text (${cf} failures)`, cf === 0,
        contrastLog.filter(f => f.where === 'phone').slice(0, 5).map(f => `"${f.text}" ${f.ratio}<${f.need}`).join('; '));
      const e = await enterStory(page, 'phone', {expectCover: true});
      check('phone: "Enter" opens the story view, and it is ready', e.arrived && e.ready, `arrived ${e.arrived}, ready ${e.ready}`);
    }
    await ctx.close();
  }

  // Reduced motion: no intro, no cover, the link navigates at once.
  {
    const {ctx, page, ok} = await open({...DESKTOP, reducedMotion: 'reduce'}, 'reduced');
    if (ok) {
      await page.screenshot({path: join(out, 'reduced-first.png')});
      const e = await enterStory(page, 'reduced', {expectCover: false});
      const cover = e.coverSeen;
      check('reduced motion: "Enter" navigates at once, with no cover', e.arrived && !cover, `arrived ${e.arrived}`);
    }
    await ctx.close();
  }

  check(`zero console errors and page errors (${errors.length})`, errors.length === 0, errors.slice(0, 5).join(' | '));
  const failed = results.filter(r => !r.pass).length;
  await writeFile(join(out, 'report.json'), JSON.stringify({option: opt, when: new Date().toISOString(), results, errors, contrastFailures: contrastLog}, null, 2));
  summary.push({id: opt.id, file: opt.file, passed: results.length - failed, failed, errors: errors.length});
}

await browser.close();
await writeFile(join(here, 'shots', only ? `report-${only}.json` : 'report.json'), JSON.stringify({when: new Date().toISOString(), summary}, null, 2));
console.log('\nSummary');
for (const s of summary) console.log(`  ${s.id.toUpperCase()} ${s.file}: ${s.passed} passed, ${s.failed} failed, ${s.errors} errors`);
process.exit(summary.some(s => s.failed || s.errors) ? 1 : 0);
