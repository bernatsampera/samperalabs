// Homepage composition check. Verifies the layout rules against a running site.
// Usage: node scripts/home-layout-e2e.mjs [url]   Default url: http://localhost:4321/
// Artifacts: tests/artifacts/home-layout/latest/report.json and PNG screenshots.
//
// Failure modes checked:
//   F1  Rail content and post grid do not share one top line.
//   F2  A post title and its figure card do not share one top line.
//   F3  Card contents (drawing, caption text, controls text) have different left edges.
//   F4  Rail text (year, month, link, portfolio link) and the header name have different left edges.
//   F5  The two desktop gutters differ (rail to copy, copy to card).
//   F6  A homepage text size is off the type scale (12, 14, 16, 18, or display 30 to 48).
//   F7  A vertical gap in the copy or card is off the spacing scale, or the button is closer than 32px to the summary.
//   F8  The stylesheet uses a literal font-size, or a margin, padding, or gap value off the scale.
//   F9  The post composition is wider than 1440px on a wide screen.
//   F10 The card column is not 7/5 of the copy column.
//   F11 The phone layout overflows horizontally.
//   F12 Phone rail text edges differ (year, month, link, portfolio link).
//   F13 The read button does not sit on the card's bottom edge on desktop.
//   F14 A feature card has no caption.
import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const url = process.argv[2] ?? 'http://localhost:4321/';
const outDir = join(root, 'tests/artifacts/home-layout/latest');
const typeScale = [12, 14, 16, 18];
const spaceScale = [0, 8, 16, 24, 32, 48, 64];
const tolerance = 1;
const failures = [];
const fail = (code, message, data) => failures.push({ code, message, data });
const near = (a, b) => Math.abs(a - b) <= tolerance;

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

// F8: stylesheet audit, independent of the browser.
const css = await readFile(join(root, 'src/assets/styles/home.css'), 'utf8');
const literalFontSizes = [...css.matchAll(/font-size:\s*(\d+)px/g)].map((m) => Number(m[1]));
if (literalFontSizes.length) fail('F8', 'Literal font-size values in home.css', literalFontSizes);
const offScale = [];
for (const m of css.matchAll(/^\s*(margin[a-z-]*|padding[a-z-]*|gap|row-gap|column-gap):\s*([^;]+);/gm)) {
  // Border compensation inside calc(var(...) - 1px) keeps text on the edge and is not spacing.
  const value = m[2].replace(/calc\([^()]*var\([^()]*\)[^()]*\)/g, '');
  for (const px of value.matchAll(/(-?\d+)px/g)) {
    if (!spaceScale.includes(Math.abs(Number(px[1])))) offScale.push(`${m[1]}: ${m[2].trim()}`);
  }
}
if (offScale.length) fail('F8', 'Spacing values off the scale in home.css', offScale);

const measureSource = `
  const rect = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { top: b.top, left: b.left, right: b.right, bottom: b.bottom, width: b.width, height: b.height };
  };
  const textRect = (el) => {
    if (!el) return null;
    const range = document.createRange();
    range.selectNodeContents(el);
    return rect(range);
  };
  const size = (el) => (el ? parseFloat(getComputedStyle(el).fontSize) : null);
`;

// Desktop measurements at 1920 x 1080.
const desktop = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await desktop.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const d = await page.evaluate(
  (source) =>
    new Function(
      source +
        `
    const features = [...document.querySelectorAll('.home-post-feature')].map((section) => ({
      id: section.id,
      grid: rect(section.querySelector('.home-post-grid')),
      copy: rect(section.querySelector('.home-post-copy')),
      title: rect(section.querySelector('h2')),
      date: rect(section.querySelector('.post-date')),
      summary: rect(section.querySelector('.home-post-summary')),
      button: rect(section.querySelector('.home-read')),
      panel: rect(section.querySelector('.home-scene-panel')),
      svg: rect(section.querySelector('.home-scene svg')),
      caption: rect(section.querySelector('.home-scene-caption')),
      captionText: textRect(section.querySelector('.home-scene-caption')),
      captionLength: (section.querySelector('.home-scene-caption')?.textContent ?? '').trim().length,
      controls: rect(section.querySelector('[data-scene-controls]')),
      controlsHint: textRect(section.querySelector('[data-scene-hint]')),
      sizes: {
        title: size(section.querySelector('h2')),
        date: size(section.querySelector('.post-date')),
        summary: size(section.querySelector('.home-post-summary')),
        button: size(section.querySelector('.home-read')),
        caption: size(section.querySelector('.home-scene-caption')),
        controls: size(section.querySelector('[data-scene-controls]')),
      },
    }));
    const link = document.querySelector('.rail-month > a');
    return {
      header: rect(document.querySelector('.site-header')),
      headerName: textRect(document.querySelector('.identity')),
      rail: rect(document.querySelector('.home-rail')),
      railFirst: rect(document.querySelector('.home-rail > *')),
      workLinkText: textRect(document.querySelector('.rail-work-link b')),
      year: textRect(document.querySelector('.rail-year > h2')),
      month: textRect(document.querySelector('.rail-month > h3')),
      linkText: textRect(link),
      railSizes: {
        year: size(document.querySelector('.rail-year > h2')),
        month: size(document.querySelector('.rail-month > h3')),
        link: size(link),
        workLabel: size(document.querySelector('.rail-work-link small')),
        workTitle: size(document.querySelector('.rail-work-link b')),
      },
      features,
    };`
    )(),
  measureSource
);

const first = d.features[0];
if (!first) fail('F2', 'No feature section found');
if (first && !near(d.railFirst.top, first.grid.top))
  fail('F1', 'Rail content and post grid tops differ', { rail: d.railFirst.top, grid: first.grid.top });
for (const f of d.features) {
  if (!near(f.title.top, f.panel.top))
    fail('F2', `Title and card tops differ in ${f.id}`, { title: f.title.top, panel: f.panel.top });
  if (!f.captionLength) fail('F14', `No caption in ${f.id}`);
  const lefts = { svg: f.svg.left, caption: f.captionText?.left, hint: f.controlsHint?.left };
  if (Object.values(lefts).some((v) => v !== null && v !== undefined && !near(v, f.svg.left)))
    fail('F3', `Card content left edges differ in ${f.id}`, lefts);
  const ratio = f.panel.width / f.copy.width;
  if (Math.abs(ratio - 7 / 5) > 0.02)
    fail('F10', `Card to copy width ratio is not 7:5 in ${f.id}`, { copy: f.copy.width, panel: f.panel.width, ratio });
  if (!near(f.button.bottom, f.panel.bottom))
    fail('F13', `Button bottom and card bottom differ in ${f.id}`, { button: f.button.bottom, panel: f.panel.bottom });
  const gaps = { titleToDate: f.date.top - f.title.bottom, dateToSummary: f.summary.top - f.date.bottom };
  if (f.caption) gaps.svgToCaption = f.caption.top - f.svg.bottom;
  if (f.caption && f.controls) gaps.captionToControls = f.controls.top - f.caption.bottom;
  for (const [name, gap] of Object.entries(gaps)) {
    if (!spaceScale.some((s) => near(gap, s))) fail('F7', `Gap ${name} off the scale in ${f.id}`, gap);
  }
  const summaryToButton = f.button.top - f.summary.bottom;
  if (summaryToButton < 32 - tolerance)
    fail('F7', `Button closer than 32px to the summary in ${f.id}`, summaryToButton);
  for (const [name, px] of Object.entries(f.sizes)) {
    if (px === null) continue;
    const ok = name === 'title' ? px >= 30 && px <= 48 : typeScale.some((s) => near(px, s));
    if (!ok) fail('F6', `Text size ${name} off the scale in ${f.id}`, px);
  }
}
if (first && first.grid.width > 1440 + tolerance) fail('F9', 'Post composition wider than 1440px', first.grid.width);
const railEdges = {
  headerName: d.headerName.left,
  workLink: d.workLinkText.left,
  year: d.year.left,
  month: d.month.left,
  link: d.linkText.left,
};
if (Object.values(railEdges).some((v) => !near(v, d.year.left))) fail('F4', 'Rail text left edges differ', railEdges);
if (first) {
  const railToCopy = first.copy.left - d.rail.right;
  const copyToCard = first.panel.left - first.copy.right;
  if (!near(railToCopy, copyToCard)) fail('F5', 'Desktop gutters differ', { railToCopy, copyToCard });
}
for (const [name, px] of Object.entries(d.railSizes)) {
  if (px !== null && !typeScale.some((s) => near(px, s))) fail('F6', `Rail text size ${name} off the scale`, px);
}

await page.screenshot({ path: join(outDir, 'desktop-1920.png') });
// Every scene in its final state (reduced motion), one picture per section.
const finalCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
const finalPage = await finalCtx.newPage();
await finalPage.goto(url, { waitUntil: 'networkidle' });
for (const f of d.features) {
  await finalPage
    .locator(`#${f.id} .home-post-grid`)
    .screenshot({ path: join(outDir, `scene-final-${f.id.replace('essay-', '')}.png`) });
}
await finalCtx.close();
// The first scene in the middle of timed playback, to catch clipping during motion.
if (first) {
  await page.click(`#${first.id} [data-scene-play]`);
  await page.waitForTimeout(1400);
  const clip = await page.evaluate((id) => {
    const b = document.querySelector(`#${id} .home-post-grid`).getBoundingClientRect();
    return { x: b.left, y: b.top, width: b.width, height: b.height };
  }, first.id);
  await page.screenshot({ path: join(outDir, 'scene-mid-play.png'), clip });
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(300);
await page.screenshot({ path: join(outDir, 'desktop-1440.png') });
await desktop.close();

// Phone measurements at 390 x 844.
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const phonePage = await phone.newPage();
await phonePage.goto(url, { waitUntil: 'networkidle' });
await phonePage.waitForTimeout(300);
await phonePage.screenshot({ path: join(outDir, 'phone-390.png') });
await phonePage.click('.home-index > summary');
await phonePage.waitForTimeout(200);
const m = await phonePage.evaluate(
  (source) =>
    new Function(
      source +
        `
    return {
      scrollWidth: document.documentElement.scrollWidth,
      edges: {
        workLink: textRect(document.querySelector('.rail-work-link b')).left,
        year: textRect(document.querySelector('.rail-year > h2')).left,
        month: textRect(document.querySelector('.rail-month > h3')).left,
        link: textRect(document.querySelector('.rail-month > a')).left,
        title: textRect(document.querySelector('.home-post h2')).left,
      },
    };`
    )(),
  measureSource
);
if (m.scrollWidth > 390) fail('F11', 'Phone layout overflows horizontally', m.scrollWidth);
if (Object.values(m.edges).some((v) => !near(v, m.edges.year))) fail('F12', 'Phone rail text edges differ', m.edges);
await phonePage.screenshot({ path: join(outDir, 'phone-390-index-open.png') });
await phonePage
  .locator('.home-post-feature .home-scene-panel')
  .first()
  .screenshot({ path: join(outDir, 'phone-390-card.png') });
await phone.close();
await browser.close();

const report = {
  url,
  checkedAt: new Date().toISOString(),
  passed: failures.length === 0,
  failures,
  desktop: d,
  phone: m,
};
await writeFile(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(failures.length ? `FAILED ${failures.length} check(s)` : 'PASSED all 14 checks');
for (const f of failures) console.log(`${f.code} ${f.message}`, JSON.stringify(f.data));
console.log(`Artifacts: ${outDir}`);
process.exit(failures.length ? 1 : 0);
