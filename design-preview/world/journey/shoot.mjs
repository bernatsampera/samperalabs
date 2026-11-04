// E2E check for "The Journey" mockup. Run: node shoot.mjs
// Output: screenshots in shots/ and PASS/FAIL lines. Exit code 1 on any FAIL.
import { chromium } from '/Users/bsampera/Documents/projects/samperalabs/node_modules/playwright-core/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
await mkdir(join(here, 'shots'), {recursive: true});
const errors = [];
const results = [];
const check = (name, pass, detail) => { results.push((pass ? 'PASS' : 'FAIL') + ': ' + name); if (!pass && detail) console.log('  ' + name + ':', detail); };

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1440, height: 900}});
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(e.message));

const open = async url => {
  const [file, query = ''] = url.split('?');
  await page.goto(pathToFileURL(join(here, file)).href + (query ? '?' + query : ''));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
};
const shot = (name, fullPage = false) => page.screenshot({path: join(here, 'shots', name + '.png'), fullPage});
const inView = selector => page.locator(selector).first().evaluate(el => {
  const r = el.getBoundingClientRect();
  return r.top >= 0 && r.bottom <= innerHeight;
});

// Visible copy rules: no tool name outside chapter k-5, no old island words.
const badWords = [];
const textRules = async () => {
  const found = await page.evaluate(() => {
    const copy = document.body.cloneNode(true);
    copy.querySelectorAll('script, style, [aria-hidden="true"], [hidden], [data-chapter="k-5"]').forEach(e => e.remove());
    const chapterK5 = location.pathname.endsWith('chapter.html') && new URLSearchParams(location.search).get('c') === 'k-5';
    const words = chapterK5 ? /where i work|chest|island|sail|knowledge for ai/gi : /gcontext|where i work|chest|island|sail|knowledge for ai/gi;
    return copy.textContent.match(words) || [];
  });
  badWords.push(...found.map(w => w + ' on ' + page.url().split('/').pop()));
};

// WCAG contrast for every visible text node against its first solid background.
const contrastFails = [];
const contrast = async () => {
  const fails = await page.evaluate(() => {
    const rgb = s => (s.match(/[\d.]+/g) || []).map(Number);
    const lum = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const background = el => {
      for (let e = el; e; e = e.parentElement) {
        const s = getComputedStyle(e);
        const c = rgb(s.backgroundColor);
        if (c.length >= 3 && (c[3] === undefined || c[3] > 0.9)) return c;
      }
      return [255, 255, 255];
    };
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const el = node.parentElement;
      if (!node.textContent.trim() || el.closest('[aria-hidden="true"], [hidden], .sr-only, .skip, script, style')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const s = getComputedStyle(el);
      const size = parseFloat(s.fontSize);
      const large = size >= 24 || (size >= 18.66 && Number(s.fontWeight) >= 700);
      const value = ratio(rgb(s.color), background(el));
      if (value < (large ? 3 : 4.5)) out.push(`"${node.textContent.trim().slice(0, 30)}" ${value.toFixed(2)}`);
    }
    return [...new Set(out)];
  });
  contrastFails.push(...fails.map(f => f + ' on ' + page.url().split('/').pop()));
};
const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

// Desktop
await open('home.html');
await shot('home-desktop-first');
await shot('home-desktop-full', true);
await textRules(); await contrast();
check('home: MAAT card comes first and is the larger card', await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.journey-card')];
  const area = el => { const r = el.getBoundingClientRect(); return r.width * r.height; };
  const nameSize = el => parseFloat(getComputedStyle(el.querySelector('.card-name')).fontSize);
  return cards[0].dataset.id === 'maat' && cards.slice(1).every(c => nameSize(cards[0]) > nameSize(c) && area(cards[0]) >= area(c) * 0.9);
}));
await page.locator('.principle button').nth(1).click();
check('home: a principle opens on click', await page.locator('#principle-2').isVisible());
await shot('home-principle-open');

await open('story.html?w=maat');
await shot('story-maat-desktop-first');
await textRules(); await contrast();
check('story: newest MAAT chapter title is in view after load', await inView('.jr-step.is-now h2'));
check('story: the timeline shows a date for every chapter', await page.evaluate(() => {
  const links = [...document.querySelectorAll('[data-index]')];
  return links.length === document.querySelectorAll('.jr-step').length && links.every(a => a.querySelector('time').textContent.trim());
}));
await page.locator('#first-control').click();
await page.waitForTimeout(1200);
check('story: "Start at the beginning" shows the first chapter title', await inView('.jr-step:first-child h2'));
await shot('story-maat-beginning');
const firstTitle = (await page.locator('.jr-step:first-child h2').textContent()).trim();
await page.locator('.jr-step:first-child .full-chapter').click();
await page.waitForLoadState('load');
check('story: "Read the full chapter" opens the matching chapter page', page.url().includes('chapter.html?w=maat&c=maat-1') && (await page.locator('h1').textContent()).trim() === firstTitle);
await page.locator('.back-journey').click();
await page.waitForLoadState('load');
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
check('chapter: "Back to the journey" returns to the same chapter', page.url().endsWith('story.html?w=maat#maat-1') && await inView('#maat-1 h2'));

await open('story.html?w=knowledge');
await shot('story-knowledge-desktop-first');
await textRules(); await contrast();
check('story: newest chapter of the second journey is in view after load', await inView('.jr-step.is-now h2'));

await open('chapter.html?w=maat&c=maat-4');
await shot('chapter-maat-4-desktop-first');
await shot('chapter-maat-4-desktop-full', true);
await open('chapter.html?w=knowledge&c=k-5');
await shot('chapter-knowledge-5-desktop-first');
const pages = await page.evaluate(() => WORLD.journeys.flatMap(j => j.chapters.map(c => `chapter.html?w=${j.id}&c=${c.id}`)));
for (const url of pages) { await open(url); await textRules(); await contrast(); }

// Mobile
await page.setViewportSize({width: 390, height: 844});
const mobileOverflow = [];
for (const [url, name] of [['home.html', 'home-mobile-first'], ['story.html?w=maat', 'story-maat-mobile-first'], ['chapter.html?w=maat&c=maat-4', 'chapter-maat-4-mobile-first']]) {
  await open(url);
  await shot(name);
  await textRules(); await contrast();
  if (!await noOverflow()) mobileOverflow.push(url);
}
await open('story.html?w=maat');
check('mobile story: newest chapter title is in view after load', await inView('.jr-step.is-now h2'));

check('mobile: no page scrolls sideways', mobileOverflow.length === 0, mobileOverflow);
check('copy: no tool name outside its chapter, no island words', badWords.length === 0, badWords);
check('contrast: all visible text meets WCAG AA', contrastFails.length === 0, contrastFails);
check('zero console errors and page errors', errors.length === 0, errors);
await browser.close();
results.forEach(r => console.log(r));
console.log('Console and page errors: ' + errors.length);
if (results.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
