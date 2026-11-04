import { chromium } from '/Users/bsampera/Documents/projects/samperalabs/node_modules/playwright-core/index.mjs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'shots');
await mkdir(shots, { recursive: true });

let browser;
const errors = [];
function check(passed, label) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
  if (!passed) process.exitCode = 1;
}

function url(name, query = '') {
  return `${pathToFileURL(join(here, name)).href}${query}`;
}

async function openPage(viewport, target, name, fullPage = false) {
  const page = await browser.newPage({ viewport });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`CONSOLE ${target}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`PAGE ${target}: ${error.message}`));
  await page.goto(target, { waitUntil: 'load' });
  await page.screenshot({ path: join(shots, name), fullPage });
  return page;
}

try {
  browser = await chromium.launch({ headless: true });
  const desktop = { width: 1440, height: 900 };
  const mobile = { width: 390, height: 844 };

  let page = await openPage(desktop, url('home.html'), 'home-desktop-first.png');
  await page.screenshot({ path: join(shots, 'home-desktop-full.png'), fullPage: true });
  await page.close();

  page = await openPage(desktop, url('story.html', '?w=maat'), 'story-maat-desktop-first.png');
  const latestTitle = page.locator('.newest-card h2');
  const latestBox = await latestTitle.boundingBox();
  const latestVisible = Boolean(latestBox && latestBox.y >= 0 && latestBox.y + latestBox.height <= desktop.height);
  console.log(`${latestVisible ? 'PASS' : 'FAIL'} newest chapter title is inside the viewport`);

  const firstTitleText = await page.locator('.chapter-page').first().locator('h2').textContent();
  const firstControl = page.locator('.first-page-control');
  const controlExists = await firstControl.count() === 1;
  if (controlExists) {
    await firstControl.click();
    await page.waitForTimeout(700);
  }
  const firstTitleBox = await page.locator('.chapter-page').first().locator('h2').boundingBox();
  const firstVisible = Boolean(firstTitleBox && firstTitleBox.y >= 0 && firstTitleBox.y + firstTitleBox.height <= desktop.height);
  console.log(`${controlExists ? 'PASS' : 'FAIL'} back to the first chapter control exists`);
  console.log(`${firstVisible ? 'PASS' : 'FAIL'} first chapter title is inside the viewport after click: ${firstTitleText?.trim()}`);

  const tab = page.locator('.bookmark-tabs a').nth(1);
  await tab.hover();
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(shots, 'story-maat-tabs-hover.png') });
  const tabsFit = await page.locator('.bookmark-tabs a').evaluateAll((tabs) => tabs.every((link) => {
    const box = link.getBoundingClientRect();
    return box.left >= 0 && box.right <= innerWidth && box.height >= 44;
  }));
  check(tabsFit, 'desktop bookmark tabs fit inside the viewport');
  const titleFits = await tab.locator('.tab-title').evaluate((label) => label.scrollWidth <= label.clientWidth && getComputedStyle(label).whiteSpace === 'nowrap');
  check(titleFits, 'hovered bookmark title fits on one line');
  const gutterClear = await tab.evaluate((link) => link.getBoundingClientRect().left >= document.querySelector('#main').getBoundingClientRect().right);
  check(gutterClear, 'expanded bookmark stays outside the story text');
  await page.mouse.move(10, 10);
  await tab.focus();
  await page.waitForTimeout(250);
  check(await tab.locator('.tab-title').evaluate((label) => getComputedStyle(label).opacity === '1' && label.scrollWidth <= label.clientWidth), 'keyboard focus reveals the bookmark title');

  await page.goto(url('story.html', '?w=maat'), { waitUntil: 'load' });
  await page.locator('.detail-toggle').first().click();
  await page.locator('.chapter-page').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(shots, 'story-maat-deep-detail.png') });
  await page.close();

  page = await openPage(desktop, url('story.html', '?w=gcontext'), 'story-gcontext-desktop-first.png');
  await page.close();
  page = await openPage(mobile, url('home.html'), 'home-mobile-first.png');
  check(await page.evaluate(() => {
    const motto = document.querySelector('.motto').getBoundingClientRect();
    const nextPage = document.querySelector('.world-page').getBoundingClientRect();
    return nextPage.top - motto.bottom < 65;
  }), 'mobile next page follows closely after the motto');
  await page.close();
  page = await openPage(mobile, url('story.html', '?w=maat'), 'story-maat-mobile-first.png');
  await page.close();

  errors.forEach((error) => console.error(error));
  console.log(`Console and page errors: ${errors.length}`);
  if (errors.length) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
