import { chromium } from '/Users/bsampera/Documents/projects/samperalabs/node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'shots');
await mkdir(shots, { recursive: true });

const errors = [];
const results = [];
const browser = await chromium.launch({ headless: true });

async function makePage(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`CONSOLE ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`PAGE ${error.message}`));
  return page;
}

async function open(page, file, query = '') {
  await page.goto(`${pathToFileURL(join(here, file)).href}${query}`, { waitUntil: 'load' });
  await page.waitForTimeout(700);
}

const desktop = await makePage(1440, 900);
await open(desktop, 'home.html');
await desktop.screenshot({ path: join(shots, 'home-desktop-first.png') });
await desktop.screenshot({ path: join(shots, 'home-desktop-full.png'), fullPage: true });
await desktop.locator('.town-building').nth(1).focus();
const tagCheck = await desktop.locator('#building-tag').isVisible();
results.push(`${tagCheck ? 'PASS' : 'FAIL'}: building focus shows a chapter title tag`);
await desktop.screenshot({ path: join(shots, 'home-building-focus.png') });
await desktop.locator('.bernat-boat').click();
await desktop.waitForTimeout(900);
const boatCheck = await desktop.locator('.log-copy h2').evaluate((element) => {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= innerHeight;
});
results.push(`${boatCheck ? 'PASS' : 'FAIL'}: Bernat boat opens the captain's log`);

await open(desktop, 'story.html', '?w=maat');
await desktop.screenshot({ path: join(shots, 'story-maat-desktop-first.png') });
const latestCheck = await desktop.locator('.chapter.latest h2').evaluate((element) => {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= window.innerHeight;
});
results.push(`${latestCheck ? 'PASS' : 'FAIL'}: newest MAAT chapter title is inside the viewport after load`);

const firstTitle = desktop.locator('.chapter').first().locator('h2');
const controlExists = await desktop.locator('#first-control').count() === 1;
if (controlExists) {
  await desktop.locator('#first-control').click();
  await desktop.waitForTimeout(900);
}
const firstCheck = controlExists && await firstTitle.evaluate((element) => {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= window.innerHeight;
});
results.push(`${firstCheck ? 'PASS' : 'FAIL'}: first chapter control exists and brings the first title into the viewport`);

await open(desktop, 'story.html', '?w=gcontext');
await desktop.screenshot({ path: join(shots, 'story-gcontext-desktop-first.png') });
await desktop.locator('.chapter.latest .chest-button').click();
await desktop.waitForTimeout(350);
await desktop.screenshot({ path: join(shots, 'story-gcontext-deep-open.png') });
await desktop.locator('.chapter.next').scrollIntoViewIfNeeded();
await desktop.screenshot({ path: join(shots, 'story-gcontext-fog.png') });
const nextCheck = await desktop.locator('.chapter').last().evaluate((element) => element.classList.contains('next') && element.textContent.includes('To be continued'));
results.push(`${nextCheck ? 'PASS' : 'FAIL'}: gcontext ends with the unfinished chapter`);
await desktop.screenshot({ path: join(shots, 'story-gcontext-full.png'), fullPage: true });
await desktop.close();

const mobile = await makePage(390, 844);
await open(mobile, 'home.html');
await mobile.screenshot({ path: join(shots, 'home-mobile-first.png') });
await open(mobile, 'story.html', '?w=maat');
await mobile.screenshot({ path: join(shots, 'story-maat-mobile-first.png') });
await mobile.close();

await browser.close();
for (const result of results) console.log(result);
for (const error of errors) console.error(error);
console.log(`Console and page error count: ${errors.length}`);
if (results.some((result) => result.startsWith('FAIL')) || errors.length) process.exitCode = 1;
