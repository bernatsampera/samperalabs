// Screenshots of Hero E (the face that opens). Run from the repo root:
//   node design-preview/hero/zoom/shoot.mjs
// Output: design-preview/hero/zoom/shots/<view>.png and report.json. Exit 1 on any console or page error.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'shots');
await mkdir(shots, { recursive: true });

const VIEWS = [
  { view: 'desktop-face', w: 1440, h: 900, q: 'demo=0' },
  { view: 'desktop-hover-eyes', w: 1440, h: 900, q: 'demo=0&hr=eyes' },
  { view: 'desktop-mid-eyes', w: 1440, h: 900, q: 'demo=0&s=1.7&u=0.5&v=0.405' },
  { view: 'desktop-open-eyes', w: 1440, h: 900, q: 'demo=0&open=eyes' },
  { view: 'desktop-open-hair', w: 1440, h: 900, q: 'demo=0&open=hair' },
  { view: 'desktop-open-nose', w: 1440, h: 900, q: 'demo=0&open=nose' },
  { view: 'desktop-open-shoulders', w: 1440, h: 900, q: 'demo=0&open=shoulders' },
  { view: 'flow-face', w: 1440, h: 900, q: 'demo=0&layout=flow' },
  { view: 'flow-open-eyes', w: 1440, h: 900, q: 'demo=0&layout=flow&open=eyes' },
  { view: 'flow-open-hair', w: 1440, h: 900, q: 'demo=0&layout=flow&open=hair' },
  { view: 'laptop-face', w: 1280, h: 720, q: 'demo=0' },
  { view: 'phone-face', w: 390, h: 844, q: 'demo=0' },
  { view: 'phone-open-eyes', w: 390, h: 844, q: 'demo=0&open=eyes' },
];

const browser = await chromium.launch();
const errors = [];
const report = [];
for (const v of VIEWS) {
  const page = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${v.view}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`${v.view}: ${e.message}`));
  await page.goto(pathToFileURL(join(here, 'index.html')).href + '?' + v.q);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.FaceDebug, null, { timeout: 10000 }).catch(() => errors.push(`${v.view}: face did not build`));
  await page.waitForTimeout(600);
  const debug = await page.evaluate(() => window.FaceDebug || null);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflow) errors.push(`${v.view}: horizontal overflow`);
  const fits = await page.evaluate(() => document.querySelector('.hero').getBoundingClientRect().height <= innerHeight + 1);
  const fig = await page.locator('.figure').boundingBox();
  const dock = await page.locator('.dock').boundingBox();
  await page.screenshot({ path: join(shots, `${v.view}.png`) });
  report.push({ view: v.view, q: v.q, letters: debug?.letters ?? null, regions: debug?.regions ?? null, heroFits: fits, overflow, figure: fig ? Math.round(fig.height) : null, dockTop: dock ? Math.round(dock.y) : null });
  await page.close();
}
await browser.close();
await writeFile(join(shots, 'report.json'), JSON.stringify(report, null, 2));
const ok = errors.length === 0;
console.log(`${ok ? 'PASS' : 'FAIL'} zoom${ok ? '' : '\n  ' + errors.join('\n  ')}`);
for (const r of report) console.log(`${r.view}: ${r.letters} letters, figure ${r.figure}px, dock at ${r.dockTop}px, hero fits ${r.heroFits ? 'yes' : 'NO'}${r.regions ? ', open ' + r.regions.map((g) => `${g.id} ${g.sOpen} (${g.copies} copies)`).join(', ') : ''}`);
process.exit(ok ? 0 : 1);
