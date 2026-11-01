// Screenshots of Hero F (the portrait you fly into). Run from the repo root:
//   node design-preview/hero/flight/shoot.mjs
// Output: design-preview/hero/flight/shots/<view>.png and report.json. Exit 1 on any console or page error,
// or when the name leaves the screen, the field leaves the screen, the face does not sit between the top and the
// chips, or the edge pieces do not drift when motion is allowed.
// Needs the network once: Three.js comes from unpkg, the fonts from Google Fonts.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'shots');
await mkdir(shots, { recursive: true });

// act: 'hover' moves the mouse to the middle of the screen; 'click' clicks there (opens the card under it).
// motion: the page runs without reduced motion, and the edge pieces must drift.
const VIEWS = [
  { view: 'desktop-portrait', w: 1440, h: 900, q: 'demo=0' },
  { view: 'desktop-fly-80', w: 1440, h: 900, q: 'demo=0&fly=80' },
  { view: 'desktop-fly-200', w: 1440, h: 900, q: 'demo=0&fly=200' },
  { view: 'desktop-fly-200-hover', w: 1440, h: 900, q: 'demo=0&fly=200', act: 'hover' },
  { view: 'desktop-fly-200-box', w: 1440, h: 900, q: 'demo=0&fly=200', act: 'click' },
  { view: 'desktop-fly-450', w: 1440, h: 900, q: 'demo=0&fly=450' },
  { view: 'desktop-fly-450-hair', w: 1440, h: 900, q: 'demo=0&fly=450&sy=14' },
  { view: 'desktop-fly-900', w: 1440, h: 900, q: 'demo=0&fly=900' },
  { view: 'desktop-alive', w: 1440, h: 900, q: 'demo=0', motion: true },
  { view: 'desktop-name-playfair', w: 1440, h: 900, q: 'demo=0&name=playfair' },
  { view: 'desktop-name-geist', w: 1440, h: 900, q: 'demo=0&name=geist' },
  { view: 'laptop-portrait', w: 1280, h: 720, q: 'demo=0' },
  { view: 'wide-portrait', w: 1920, h: 1080, q: 'demo=0' },
  { view: 'phone-portrait', w: 390, h: 844, q: 'demo=0' },
  { view: 'phone-fly-200-box', w: 390, h: 844, q: 'demo=0&fly=200', act: 'click' },
];

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
const report = [];
for (const v of VIEWS) {
  const page = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 2, reducedMotion: v.motion ? 'no-preference' : 'reduce' });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${v.view}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`${v.view}: ${e.message}`));
  await page.goto(pathToFileURL(join(here, 'index.html')).href + '?' + v.q);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.FaceDebug, null, { timeout: 30000 }).catch(() => errors.push(`${v.view}: portrait did not build`));
  await page.waitForTimeout(900);
  let boxOpen = null;
  if (v.act) {
    await page.mouse.move(v.w / 2, v.h / 2); await page.waitForTimeout(250);
    if (v.act === 'click') { await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(700); boxOpen = await page.evaluate(() => !document.querySelector('[data-box]').hidden); if (!boxOpen) errors.push(`${v.view}: the click did not open a card`); }
  }
  let moved = null;
  if (v.motion) {
    const s1 = await page.evaluate(() => window.FaceDebug.sample());
    await page.waitForTimeout(600);
    const s2 = await page.evaluate(() => window.FaceDebug.sample());
    moved = s1.some((x, i) => x !== s2[i]);
    if (!moved) errors.push(`${v.view}: the edge pieces do not drift`);
  }
  const debug = await page.evaluate(() => { const d = window.FaceDebug; if (!d) return null; const { sample, ...rest } = d; return rest; });
  const layout = await page.evaluate(() => {
    const r = (s) => document.querySelector(s).getBoundingClientRect();
    const name = r('.name-text'), field = r('.field'), chips = r('.chips');
    return {
      nameSize: getComputedStyle(document.querySelector('.name')).fontSize,
      nameOnScreen: name.left >= 0 && name.right <= innerWidth && name.top >= 0,
      nameWidth: Math.round(name.width),
      fieldOnScreen: field.top >= 0 && field.bottom <= innerHeight && field.width > 0,
      chipsOnScreen: chips.top >= 0 && chips.bottom <= innerHeight && chips.width > 0,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  if (!layout.nameOnScreen) errors.push(`${v.view}: the name leaves the screen (${layout.nameWidth}px at ${layout.nameSize})`);
  if (!layout.fieldOnScreen) errors.push(`${v.view}: the field is off screen`);
  if (!layout.chipsOnScreen) errors.push(`${v.view}: the chips are off screen`);
  if (layout.overflow) errors.push(`${v.view}: horizontal overflow`);
  const f = debug && debug.frame;
  if (f && (f.chin > f.chipsTop || f.hair < 24)) errors.push(`${v.view}: the face does not sit between the top and the chips (hair ${f.hair}, chin ${f.chin}, chips ${f.chipsTop})`);
  await page.screenshot({ path: join(shots, `${v.view}.png`) });
  report.push({ view: v.view, q: v.q, act: v.act || null, boxOpen, moved, ...(debug || {}), ...layout });
  await page.close();
}
await browser.close();
await writeFile(join(shots, 'report.json'), JSON.stringify(report, null, 2));
const ok = errors.length === 0;
console.log(`${ok ? 'PASS' : 'FAIL'} flight${ok ? '' : '\n  ' + errors.join('\n  ')}`);
for (const r of report) {
  const f = r.frame || {};
  console.log(`${r.view}: ${r.dots} dots, ${r.cards} cards (${r.lane} lane), drifting ${r.drifting} (dust ${r.dust}), name ${r.nameSize}, portrait ${f.portrait}px (hair ${f.hair}, chin ${f.chin}, chips ${f.chipsTop}, fov ${f.fov})${r.boxOpen === null ? '' : ', box ' + (r.boxOpen ? 'open' : 'CLOSED')}${r.moved === null ? '' : ', moves ' + (r.moved ? 'yes' : 'NO')}`);
}
process.exit(ok ? 0 : 1);
