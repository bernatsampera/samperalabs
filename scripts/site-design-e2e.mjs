// Clean design system check. Verifies the real site against design-preview/design-system/DESIGN.md.
// Usage: node scripts/site-design-e2e.mjs [base]   Default base: http://localhost:4322
// Artifacts: tests/artifacts/site-design/latest/report.json and PNG screenshots.
//
// Failure modes checked:
//   F1  A page returns an error status, or logs a console error or a page error.
//   F2  Interface or article text renders in a family other than Geist.
//   F3  Code in an article loses its monospace font.
//   F4  A page scrolls sideways (desktop 1440, phone 390).
//   F5  Home or a story page shows a middle dot, an en dash or an em dash.
//   F6  A link does not use the blue accent (#1D5BFF), or the nav has more than one solid pill.
//   F7  A nav pill is not 36px high.
//   F8  The home column is not 900px wide on desktop.
//   F9  A home story section does not show one card per part, each linking to /<story>#part-N.
//   F10 A story page (/maat, /gcontext): the overview does not show one card per part, Open does not enter a part,
//       Next does not show a chapter, a chapter link is not an article URL, Escape does not return,
//       or /<story>#part-2 does not open part 2.
//   F11 Phone home: the nav shows, or the hero links do not.
//   F12 /writing lists no articles, or an article URL that exists locally does not answer 200.
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const base = (process.argv[2] ?? 'http://localhost:4322').replace(/\/$/, '');
const outDir = join(root, 'tests/artifacts/site-design/latest');
const ACCENT = 'rgb(29, 91, 255)';
const STORIES = [{ slug: 'maat', section: '#work', parts: 3 }, { slug: 'gcontext', section: '#gcontext', parts: 3 }];
const failures = [];
const passes = [];
const check = (code, ok, message, data) => (ok ? passes : failures).push({ code, message, ...(ok ? {} : { data }) });

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

async function open(path, viewport, name) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const res = await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  check('F1', res && res.status() === 200, `${name}: status 200`, res && res.status());
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check('F4', overflow <= 0, `${name}: no sideways scroll`, overflow);
  return { ctx, page, errors };
}
const family = (page, sel) => page.$eval(sel, (el) => getComputedStyle(el).fontFamily).catch(() => null);
const shot = (page, file, full = true) => page.screenshot({ path: join(outDir, file), fullPage: full });
const done = async ({ ctx, errors }, name) => { check('F1', errors.length === 0, `${name}: no console errors`, errors); await ctx.close(); };

// Home, desktop.
{
  const s = await open('/', { width: 1440, height: 900 }, 'home desktop');
  const { page } = s;
  await page.evaluate(() => document.querySelectorAll('[data-appear]').forEach((el) => el.classList.add('in')));
  check('F2', /Geist/.test(await family(page, 'h1')), 'home: h1 uses Geist', await family(page, 'h1'));
  check('F2', await page.evaluate(() => document.fonts.check('500 16px "Geist Variable"')), 'home: Geist font file loaded');
  const text = await page.evaluate(() => document.body.innerText);
  check('F5', !/[·–—]/.test(text), 'home: no middle dots or long dashes', text.match(/.{0,30}[·–—].{0,30}/g));
  const pills = await page.$$eval('.site-nav .pill', (els) => els.map((e) => ({ t: e.textContent.trim(), h: e.getBoundingClientRect().height, solid: e.classList.contains('solid') })));
  check('F7', pills.length > 0 && pills.every((p) => Math.round(p.h) === 36), 'home: nav pills are 36px high', pills);
  check('F6', pills.filter((p) => p.solid).length === 1, 'home: one solid pill in the nav', pills);
  const links = await page.$$eval('main .link', (els) => els.map((e) => getComputedStyle(e).color));
  const dayLinks = await page.$$eval('main .work .link', (els) => els.map((e) => getComputedStyle(e).color));
  check('F6', dayLinks.length > 0 && dayLinks.every((c) => c === 'rgb(29, 91, 255)'), 'home: links use the accent', links);
  const col = await page.$eval('#work .col', (e) => e.getBoundingClientRect().width);
  check('F8', Math.round(col) === 900, 'home: column is 900px', col);
  for (const st of STORIES) {
    const parts = await page.$$eval(`${st.section} .part`, (els) => els.map((e) => e.getAttribute('href')));
    check('F9', parts.length === st.parts && parts.every((h, i) => h === `/${st.slug}#part-${i + 1}`), `home: ${st.slug} part cards link to /${st.slug}#part-N`, parts);
    const read = await page.$eval(`${st.section} .work-head .link`, (a) => a.getAttribute('href')).catch(() => null);
    check('F9', read === `/${st.slug}`, `home: ${st.slug} "Read the story" opens /${st.slug}`, read);
  }
  await shot(page, 'home-desktop.png');
  await page.screenshot({ path: join(outDir, 'home-desktop-top.png') });
  await done(s, 'home desktop');
}

// Home, phone.
{
  const s = await open('/', { width: 390, height: 844 }, 'home phone');
  const { page } = s;
  await page.evaluate(() => document.querySelectorAll('[data-appear]').forEach((el) => el.classList.add('in')));
  check('F11', !(await page.isVisible('.site-nav')), 'phone home: nav is hidden');
  check('F11', await page.isVisible('.hero-links'), 'phone home: hero links show');
  await shot(page, 'home-phone.png');
  await done(s, 'home phone');
}

// The story pages share one flow.
for (const st of STORIES) {
  const s = await open(`/${st.slug}`, { width: 1440, height: 900 }, `/${st.slug} desktop`);
  const { page } = s;
  await page.waitForFunction(() => document.documentElement.dataset.state === 'idle');
  const text = await page.evaluate(() => document.body.innerText);
  check('F5', !/[·–—]/.test(text), `/${st.slug}: no middle dots or long dashes`, text.match(/.{0,30}[·–—].{0,30}/g));
  check('F2', /Geist/.test(await family(page, '.h-title')), `/${st.slug}: title uses Geist`, await family(page, '.h-title'));
  check('F10', (await page.$$('.entry')).length === st.parts, `/${st.slug}: one card per part`);
  await shot(page, `${st.slug}-overview.png`, false);
  await page.click('.entry[data-si="1"] .enter');
  await page.waitForFunction(() => window.story.view === 'season' && document.documentElement.dataset.state === 'idle');
  check('F10', (await page.evaluate(() => window.story.season)) === 1, `/${st.slug}: Open enters part 2`);
  check('F10', page.url().endsWith('#part-2'), `/${st.slug}: URL follows the open part`, page.url());
  await shot(page, `${st.slug}-part-opener.png`, false);
  await page.click('.nav-next');
  await page.waitForFunction(() => window.story.step === 1 && document.documentElement.dataset.state === 'idle');
  check('F10', await page.isVisible('.card .c-title'), `/${st.slug}: Next shows a chapter card`);
  await page.click('.nav-next');
  await page.waitForFunction(() => window.story.step === 2 && document.documentElement.dataset.state === 'idle');
  const read = await page.$eval('.card .read', (a) => ({ href: a.getAttribute('href'), color: getComputedStyle(a).color })).catch(() => null);
  check('F10', !!read && /^\/posts\/[a-z0-9-]+$/.test(read.href), `/${st.slug}: chapter link is an article URL`, read);
  check('F6', !!read && read.color === ACCENT, `/${st.slug}: chapter link uses the accent`, read);
  await shot(page, `${st.slug}-chapter.png`, false);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.story.view === 'home' && document.documentElement.dataset.state === 'idle');
  check('F10', true, `/${st.slug}: Escape returns to the overview`);
  const all = await page.evaluate(() => window.story.seasons.flatMap((x) => x.chapters).filter((c) => c.article).map((c) => c.article.href));
  check('F10', all.every((h) => /^\/posts\/[a-z0-9-]+$/.test(h)), `/${st.slug}: every chapter link is an article URL`, all);
  await done(s, `/${st.slug} desktop`);

  const d = await open(`/${st.slug}#part-2`, { width: 1440, height: 900 }, `/${st.slug} deep link`);
  await d.page.waitForFunction(() => window.story && window.story.view === 'season' && document.documentElement.dataset.state === 'idle');
  check('F10', (await d.page.evaluate(() => window.story.season)) === 1, `/${st.slug}#part-2 opens part 2`);
  await done(d, `/${st.slug} deep link`);

  const p = await open(`/${st.slug}`, { width: 390, height: 844 }, `/${st.slug} phone`);
  await p.page.waitForFunction(() => document.documentElement.dataset.state === 'idle');
  await shot(p.page, `${st.slug}-phone.png`, false);
  await p.page.evaluate(() => window.story.jumpNow());
  await p.page.waitForFunction(() => window.story.view === 'season' && document.documentElement.dataset.state === 'idle');
  await shot(p.page, `${st.slug}-phone-now.png`, false);
  await done(p, `/${st.slug} phone`);
}

// Writing: the list of articles.
{
  const s = await open('/writing', { width: 1440, height: 900 }, 'writing desktop');
  const posts = await s.page.$$eval('.post', (els) => els.map((e) => e.getAttribute('href')));
  check('F12', posts.length > 0, '/writing lists articles', posts.length);
  for (const href of posts) {
    const r = await s.page.request.get(base + href, { maxRedirects: 0 });
    check('F12', r.status() === 200, `article ${href} answers 200`, r.status());
  }
  await shot(s.page, 'writing-desktop.png');
  await done(s, 'writing desktop');
}

// An article and the about page.
for (const [path, name, file] of [['/posts/analyzing-open-deep-research', 'article desktop', 'article-desktop.png'], ['/about', 'about desktop', 'about-desktop.png']]) {
  const s = await open(path, { width: 1440, height: 900 }, name);
  check('F2', /Geist/.test(await family(s.page, 'h1')), `${name}: h1 uses Geist`, await family(s.page, 'h1'));
  if (path.startsWith('/posts')) {
    check('F2', /Geist/.test(await family(s.page, '.reading-prose p')), `${name}: prose uses Geist`, await family(s.page, '.reading-prose p'));
    const mono = await family(s.page, '.reading-prose pre');
    check('F3', mono === null || /mono|Menlo|SFMono/i.test(mono), `${name}: code stays monospace`, mono);
  }
  await shot(s.page, file);
  await done(s, name);
}
{
  const s = await open('/posts/analyzing-open-deep-research', { width: 390, height: 844 }, 'article phone');
  await shot(s.page, 'article-phone.png', false);
  await done(s, 'article phone');
}

await browser.close();
const report = { when: new Date().toISOString(), base, pass: passes.length, fail: failures.length, failures, passes };
await writeFile(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(`site-design: ${passes.length} passed, ${failures.length} failed. Report: ${join(outDir, 'report.json')}`);
for (const f of failures) console.log(`  ${f.code} ${f.message}: ${JSON.stringify(f.data)}`);
process.exit(failures.length ? 1 : 0);
