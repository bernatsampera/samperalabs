// Screenshots of the lane draft (Hero F). Run from the repo root:
//   node design-preview/hero/flight-lane/shoot.mjs
// Output: design-preview/hero/flight-lane/shots/<view>.png and report.json. Exit 1 on any console or page error,
// horizontal overflow, a field off screen, a view that is not at the card it asked for, a click on a linked card
// that does not open its page, or a click on a card without a link that does not open its box.
// Needs the network once: Three.js comes from unpkg, Geist from Google Fonts. Other sites are stubbed.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'shots');
await mkdir(shots, { recursive: true });

// q: the URL params. at=<n> puts the camera at lane card n (0 is the first card of content.js).
// act: 'hover' moves the mouse onto the current card; 'click' clicks it. expect: 'page' (it has a link) or 'box'.
const VIEWS = [
  { view: 'desktop-portrait', w: 1440, h: 900, q: 'demo=0' },
  { view: 'desktop-fly-60', w: 1440, h: 900, q: 'demo=0&fly=60' },
  { view: 'desktop-fly-140', w: 1440, h: 900, q: 'demo=0&fly=140' },
  { view: 'desktop-at-0-who', w: 1440, h: 900, q: 'demo=0&at=0' },
  { view: 'desktop-at-1-career', w: 1440, h: 900, q: 'demo=0&at=1' },
  { view: 'desktop-at-2-maat', w: 1440, h: 900, q: 'demo=0&at=2' },
  { view: 'desktop-at-3-enabling-ai', w: 1440, h: 900, q: 'demo=0&at=3' },
  { view: 'desktop-at-3-hover', w: 1440, h: 900, q: 'demo=0&at=3', act: 'hover' },
  { view: 'desktop-at-2-click-opens-page', w: 1440, h: 900, q: 'demo=0&at=2', act: 'click', expect: 'page', url: 'https://samperalabs.com/maat' },
  { view: 'desktop-at-5-click-opens-box', w: 1440, h: 900, q: 'demo=0&at=5', act: 'click', expect: 'box' },
  { view: 'desktop-at-4-gcontext', w: 1440, h: 900, q: 'demo=0&at=4' },
  { view: 'desktop-at-4-between', w: 1440, h: 900, q: 'demo=0&at=4.5' },
  { view: 'desktop-at-11', w: 1440, h: 900, q: 'demo=0&at=11' },
  { view: 'desktop-at-18-last', w: 1440, h: 900, q: 'demo=0&at=18' },
  { view: 'desktop-at-2-no-around', w: 1440, h: 900, q: 'demo=0&at=2&stride=0' },
  { view: 'laptop-at-1', w: 1280, h: 720, q: 'demo=0&at=1' },
  { view: 'phone-portrait', w: 390, h: 844, q: 'demo=0' },
  { view: 'phone-at-1-career', w: 390, h: 844, q: 'demo=0&at=1' },
  { view: 'phone-at-5-click-opens-box', w: 390, h: 844, q: 'demo=0&at=5', act: 'click', expect: 'box' },
];

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
const report = [];
for (const v of VIEWS) {
  const page = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await page.route((u) => /^https?:/.test(u.href) && !/unpkg\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host), (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'stub' }));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${v.view}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`${v.view}: ${e.message}`));
  await page.goto(pathToFileURL(join(here, 'index.html')).href + '?' + v.q);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.FaceDebug, null, { timeout: 30000 }).catch(() => errors.push(`${v.view}: portrait did not build`));
  await page.waitForTimeout(900);
  const at = /(?:^|&)at=([\d.]+)/.exec(v.q);
  const current = await page.evaluate(() => window.FaceDebug.current || null);
  if (at && Number.isInteger(+at[1]) && (!current || current.index !== +at[1])) errors.push(`${v.view}: expected card ${at[1]}, at ${current ? current.index : 'none'}`);
  const debug = await page.evaluate(() => window.FaceDebug);
  const layout = await page.evaluate(() => {
    const field = document.querySelector('.field').getBoundingClientRect();
    return {
      fieldOnScreen: field.top >= 0 && field.bottom <= innerHeight && field.width > 0,
      overflow: document.documentElement.scrollWidth > innerWidth,
      hint: (document.querySelector('[data-hint]') || {}).textContent || '',
    };
  });
  if (!layout.fieldOnScreen) errors.push(`${v.view}: the field is off screen`);
  if (layout.overflow) errors.push(`${v.view}: horizontal overflow`);
  let boxOpen = null, wentTo = null;
  if (v.act && !current) errors.push(`${v.view}: no current card to ${v.act}`);
  if (v.act && current) {
    await page.mouse.move(current.screen.x, current.screen.y); await page.waitForTimeout(250);
    if (v.act === 'click') {
      await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(700);
      if (page.url().startsWith('file:')) boxOpen = await page.evaluate(() => !document.querySelector('[data-box]').hidden);
      else wentTo = page.url().replace(/\/$/, '');
      if (v.expect === 'page' && wentTo !== v.url) errors.push(`${v.view}: the click on a linked card went to ${wentTo || 'nowhere'}, not ${v.url}`);
      if (v.expect === 'box' && !boxOpen) errors.push(`${v.view}: the click on a card without a link did not open its box`);
    }
  }
  if (!wentTo) await page.screenshot({ path: join(shots, `${v.view}.png`) });
  report.push({ view: v.view, q: v.q, act: v.act || null, boxOpen, wentTo, ...debug, ...layout });
  await page.close();
}
await browser.close();
await writeFile(join(shots, 'report.json'), JSON.stringify(report, null, 2));
const ok = errors.length === 0;
console.log(`${ok ? 'PASS' : 'FAIL'} flight-lane${ok ? '' : '\n  ' + errors.join('\n  ')}`);
for (const r of report) {
  const c = r.current;
  console.log(`${r.view}: ${r.cards} cards (${r.lane} in the lane, ${r.around} around), ${c ? `at ${c.id} "${r.hint}"` : 'at the portrait'}${r.wentTo ? ', opened ' + r.wentTo : r.boxOpen === null ? '' : ', box ' + (r.boxOpen ? 'open' : 'CLOSED')}`);
}
process.exit(ok ? 0 : 1);
