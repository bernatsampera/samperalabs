// Screenshots of the hero concepts. Run from the repo root:
//   node design-preview/hero/shoot.mjs            (all three)
//   node design-preview/hero/shoot.mjs a-index    (one)
// Output: design-preview/hero/shots/<name>-<view>.png, shots/report.json, PASS/FAIL per page.
// Exit code 1 on any console error or page error.
import { chromium } from '../../node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const ALL = ['a-index', 'b-signal', 'c-route'];
const names = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const shots = join(here, 'shots');
await mkdir(shots, { recursive: true });

const VIEWS = [
  { view: 'desktop-idle', w: 1440, h: 900, q: null },
  { view: 'desktop-agents', w: 1440, h: 900, q: 'How do you build AI agents?' },
  { view: 'desktop-memory', w: 1440, h: 900, q: 'How should AI remember my work?' },
  { view: 'desktop-unsure', w: 1440, h: 900, q: 'What did you build and write?' },
  { view: 'laptop-idle', w: 1280, h: 720, q: null },
  { view: 'phone-idle', w: 390, h: 844, q: null },
  { view: 'phone-agents', w: 390, h: 844, q: 'How do you build AI agents?' },
];

const browser = await chromium.launch();
const report = [];
let failed = false;
for (const name of names) {
  const errors = [];
  for (const v of VIEWS) {
    const page = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${v.view}: ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`${v.view}: ${e.message}`));
    const url = pathToFileURL(join(here, `${name}.html`)).href + (v.q === null ? '?demo=0' : `?q=${encodeURIComponent(v.q)}`);
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(700);
    const h1 = await page.locator('h1').boundingBox();
    const dock = await page.locator('.dock').boundingBox();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) errors.push(`${v.view}: horizontal overflow`);
    const fits = await page.evaluate(() => document.querySelector('.hero').getBoundingClientRect().height <= innerHeight + 1);
    await page.screenshot({ path: join(shots, `${name}-${v.view}.png`) });
    report.push({ name, view: v.view, q: v.q, h1Top: Math.round(h1?.y ?? -1), dockTop: Math.round(dock?.y ?? -1), heroFits: fits, overflow });
    await page.close();
  }
  const ok = errors.length === 0;
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : '\n  ' + errors.join('\n  ')}`);
}
await browser.close();
await writeFile(join(shots, 'report.json'), JSON.stringify(report, null, 2));
for (const r of report) console.log(`${r.name} ${r.view}: hero fits viewport ${r.heroFits ? 'yes' : 'NO'}, dock at ${r.dockTop}px`);
process.exit(failed ? 1 : 0);
