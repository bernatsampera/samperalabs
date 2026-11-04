import { chromium } from '/Users/bsampera/Documents/projects/samperalabs/node_modules/playwright-core/index.mjs';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = process.cwd();
const shots = path.join(root, 'shots');
await mkdir(shots, { recursive: true });
const errors = [];
const checks = [];
function check(passed, label) {
  checks.push(passed);
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
}
const browser = await chromium.launch({ headless: true });

async function pageAt(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', error => errors.push(`page: ${error.message}`));
  return page;
}

async function openLocal(page, file, query = '') {
  const url = `${pathToFileURL(path.join(root, file)).href}${query}`;
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

let page = await pageAt(1440, 900);
await openLocal(page, 'home.html');
check(await page.locator('.product-star').evaluateAll(elements => elements.every(element => {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= innerHeight;
})), 'both product stars are inside the first viewport');
check(await page.locator('.constellation-link[data-id="maat"] .constellation-dot').count() === await page.evaluate(() => WORLD.workspaces.find(item => item.id === 'maat').chapters.length), 'MAAT shows one star per chapter');
await page.screenshot({ path: path.join(shots, 'home-desktop-first.png') });
await page.screenshot({ path: path.join(shots, 'home-desktop-full.png'), fullPage: true });
await page.close();

page = await pageAt(1440, 900);
await openLocal(page, 'story.html', '?w=maat');
await page.screenshot({ path: path.join(shots, 'story-maat-desktop-first.png') });
const latestVisible = await page.locator('.chapter-card.latest h2').evaluate(element => {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= innerHeight;
});
check(latestVisible, 'newest chapter title is inside the viewport');
check(await page.locator('.story-controls').evaluate(element => {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= innerHeight;
}), 'story controls are visible after load');
const firstButton = page.getByRole('button', { name: 'Start from the first star' });
const firstControlExists = await firstButton.count() === 1;
await firstButton.click();
await page.waitForTimeout(1100);
const firstVisible = await page.locator('.chapter-card').first().locator('h2').evaluate(element => {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= innerHeight;
});
check(firstControlExists && firstVisible, 'first chapter control exists and shows the first title');
await page.locator('.chapter-card').first().getByRole('button', { name: 'Look through the telescope' }).click();
await page.waitForTimeout(250);
await page.screenshot({ path: path.join(shots, 'story-maat-deep-detail.png') });
await page.close();

page = await pageAt(1440, 900);
await openLocal(page, 'story.html', '?w=gcontext');
await page.screenshot({ path: path.join(shots, 'story-gcontext-desktop-first.png') });
await page.close();

page = await pageAt(390, 844);
await openLocal(page, 'home.html');
await page.screenshot({ path: path.join(shots, 'home-mobile-first.png') });
await page.close();

page = await pageAt(390, 844);
await openLocal(page, 'story.html', '?w=maat');
check(await page.locator('.chapter-card.latest h2').evaluate(element => {
  const rect = element.getBoundingClientRect();
  const controls = document.querySelector('.constellation-panel').getBoundingClientRect();
  return rect.top >= controls.bottom && rect.bottom <= innerHeight;
}), 'mobile newest title is visible below the sticky chart');
await page.screenshot({ path: path.join(shots, 'story-maat-mobile-first.png') });
await page.close();

await browser.close();
errors.forEach(error => console.error(error));
console.log(`Console and page errors: ${errors.length}`);
if (errors.length || checks.some(passed => !passed)) process.exitCode = 1;
