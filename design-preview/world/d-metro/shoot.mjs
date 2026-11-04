import { chromium } from '/Users/bsampera/Documents/projects/samperalabs/node_modules/playwright-core/index.mjs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const folder = path.dirname(fileURLToPath(import.meta.url));
const shots = path.join(folder, 'shots');
await mkdir(shots, { recursive: true });

const errors = [];
let browser;
let failures = 0;

async function checkCollisions(page, size) {
  const overlaps = await page.evaluate(() => {
    const selector = '[data-collision], .map-heading, .map-legend, .line-message';
    const boxes = [...document.querySelectorAll(selector)].map(el => {
      const r = el.getBoundingClientRect();
      return { name: el.dataset.collision || el.className, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    });
    const found = [];
    boxes.forEach((a, i) => boxes.slice(i + 1).forEach(b => {
      if (Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
          Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)) found.push(a.name + ' overlaps ' + b.name);
    }));
    return found;
  });
  if (!overlaps.length) console.log('PASS: home collision check at ' + size);
  overlaps.forEach(pair => { console.log('FAIL: home ' + size + ': ' + pair); failures++; });
  const trackOverlaps = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll('[data-collision]')].map(el => ({
      name: el.dataset.collision, rect: el.getBoundingClientRect()
    }));
    const hits = new Set();
    document.querySelectorAll('.map-track').forEach(track => {
      const matrix = track.getScreenCTM();
      const radius = Number(track.getAttribute('stroke-width')) * matrix.a / 2;
      for (let length = 0; length <= track.getTotalLength(); length += 2) {
        const p = track.getPointAtLength(length).matrixTransform(matrix);
        boxes.forEach(({name, rect: r}) => {
          if (p.x + radius > r.left && p.x - radius < r.right &&
              p.y + radius > r.top && p.y - radius < r.bottom) hits.add(name);
        });
      }
    });
    return [...hits];
  });
  if (!trackOverlaps.length) console.log('PASS: home labels clear all tracks at ' + size);
  trackOverlaps.forEach(name => { console.log('FAIL: home ' + size + ': track overlaps ' + name); failures++; });
}

async function checkTrain(page, size) {
  const parked = await page.evaluate(() => {
    const a = document.querySelector('.chapter.latest .station-node').getBoundingClientRect();
    const b = document.querySelector('#train-marker').getBoundingClientRect();
    return Math.abs(a.x + a.width / 2 - b.x - b.width / 2) < 1 &&
      Math.abs(a.y + a.height / 2 - b.y - b.height / 2) < 1;
  });
  console.log((parked ? 'PASS' : 'FAIL') + ': train parks at newest station at ' + size);
  if (!parked) failures++;
}

function watch(page, name) {
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`${name} console: ${message.text()}`);
  });
  page.on('pageerror', error => errors.push(`${name} page: ${error.message}`));
}

async function openPage(page, file, query = '') {
  await page.goto(`${pathToFileURL(path.join(folder, file)).href}${query}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
}

try {
  browser = await chromium.launch({ headless: true });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  watch(desktop, 'desktop');
  await openPage(desktop, 'home.html');
  await checkCollisions(desktop, '1440x900');
  await desktop.screenshot({ path: path.join(shots, 'home-desktop-first.png') });
  await desktop.screenshot({ path: path.join(shots, 'home-desktop-full.png'), fullPage: true });

  await openPage(desktop, 'story.html', '?w=maat');
  await checkTrain(desktop, '1440x900');
  await desktop.screenshot({ path: path.join(shots, 'story-maat-desktop-first.png') });
  const latestVisible = await desktop.locator('.chapter.latest .station-sign').evaluate(element => {
    const box = element.getBoundingClientRect();
    return box.top >= 0 && box.bottom <= window.innerHeight;
  });
  console.log(`${latestVisible ? 'PASS' : 'FAIL'}: newest MAAT chapter title is inside the viewport after load`);
  if (!latestVisible) failures++;

  const firstButton = desktop.getByRole('button', { name: 'Go to the first station' });
  const firstControlExists = await firstButton.count() === 1;
  console.log(`${firstControlExists ? 'PASS' : 'FAIL'}: back to the first chapter control exists`);
  if (!firstControlExists) failures++;
  if (firstControlExists) {
    await firstButton.click();
    await desktop.waitForTimeout(1100);
  }
  const firstVisible = await desktop.locator('.chapter:first-child .station-sign').evaluate(element => {
    const box = element.getBoundingClientRect();
    return box.top >= 0 && box.bottom <= window.innerHeight;
  });
  console.log(`${firstVisible ? 'PASS' : 'FAIL'}: first MAAT chapter title is inside the viewport after the control click`);
  if (!firstVisible) failures++;

  await openPage(desktop, 'story.html', '?w=gcontext');
  await desktop.screenshot({ path: path.join(shots, 'story-gcontext-desktop-first.png') });
  await desktop.locator('.chapter.latest .detail-toggle').click();
  await desktop.locator('.chapter.latest .deep-detail').scrollIntoViewIfNeeded();
  await desktop.screenshot({ path: path.join(shots, 'story-gcontext-deep-open.png') });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  watch(mobile, 'mobile');
  await openPage(mobile, 'home.html');
  await checkCollisions(mobile, '390x844');
  await mobile.screenshot({ path: path.join(shots, 'home-mobile-first.png') });
  await mobile.screenshot({ path: path.join(shots, 'home-mobile-full.png'), fullPage: true });
  await openPage(mobile, 'story.html', '?w=maat');
  await checkTrain(mobile, '390x844');
  await mobile.screenshot({ path: path.join(shots, 'story-maat-mobile-first.png') });

  console.log(`Console and page errors: ${errors.length}`);
  errors.forEach(error => console.log(error));
  if (errors.length || failures) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
