// Screenshots of Hero D (the face made of context). Run from the repo root:
//   node design-preview/hero/face/shoot.mjs
// Output: design-preview/hero/face/shots/<view>.png and report.json. Exit 1 on any console or page error.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'shots');
await mkdir(shots, { recursive: true });
const extra = process.argv[2] ? '&' + process.argv[2].replace(/^[?&]/, '') : '';

const VIEWS = [
  { view: 'desktop-face', w: 1440, h: 900, q: 'demo=0' },
  { view: 'desktop-hover', w: 1440, h: 900, q: 'demo=0&hu=0.47&hv=0.41' },
  { view: 'desktop-zoom-eyes', w: 1440, h: 900, q: 'demo=0&zoom=2.4&u=0.5&v=0.41&hu=0.5&hv=0.41' },
  { view: 'desktop-zoom-mouth', w: 1440, h: 900, q: 'demo=0&zoom=4&u=0.5&v=0.585' },
  { view: 'laptop-face', w: 1280, h: 720, q: 'demo=0' },
  { view: 'phone-face', w: 390, h: 844, q: 'demo=0' },
];

const browser = await chromium.launch();
const errors = [];
const report = [];
for (const v of VIEWS) {
  const page = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${v.view}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`${v.view}: ${e.message}`));
  await page.goto(pathToFileURL(join(here, 'index.html')).href + '?' + v.q + extra);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.FaceDebug && document.querySelector('[data-count] b'), null, { timeout: 8000 }).catch(() => errors.push(`${v.view}: face did not build`));
  await page.waitForTimeout(400);
  const debug = await page.evaluate(() => window.FaceDebug || null);
  const dock = await page.locator('.dock').boundingBox();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflow) errors.push(`${v.view}: horizontal overflow`);
  const fits = await page.evaluate(() => document.querySelector('.hero').getBoundingClientRect().height <= innerHeight + 1);
  await page.screenshot({ path: join(shots, `${v.view}.png`) });
  report.push({ view: v.view, q: v.q, grid: debug ? `${debug.cols}x${debug.rows}` : null, chars: debug?.total ?? null, wall: debug?.wall ?? null, dockTop: Math.round(dock?.y ?? -1), heroFits: fits, overflow });
  await page.close();
}
await browser.close();
await writeFile(join(shots, 'report.json'), JSON.stringify(report, null, 2));
const ok = errors.length === 0;
console.log(`${ok ? 'PASS' : 'FAIL'} face${ok ? '' : '\n  ' + errors.join('\n  ')}`);
for (const r of report) console.log(`${r.view}: grid ${r.grid}, ${r.chars} chars, wall ${r.wall}, hero fits ${r.heroFits ? 'yes' : 'NO'}, dock at ${r.dockTop}px`);
process.exit(ok ? 0 : 1);
