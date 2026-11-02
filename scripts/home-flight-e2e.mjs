// E2E proof for the home hero (the portrait you fly into) on a running site.
// Run: node scripts/home-flight-e2e.mjs [base URL, default http://127.0.0.1:4399]
// It blocks /api/ask, so it never calls the real Jev. Artifacts: tests/artifacts/home-flight/*.png and report.json.
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] || 'http://127.0.0.1:4399';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'tests/artifacts/home-flight');
await mkdir(out, { recursive: true });
const results = [];
const check = (name, pass, detail) => { results.push({ name, pass: !!pass, detail: detail ?? null }); console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${!pass && detail ? '  (' + JSON.stringify(detail) + ')' : ''}`); };

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'phone', width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 2 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !(m.text().startsWith('Failed to load resource') && m.location().url.includes('/api/ask'))) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  let freeQuestions = 0, opens = 0;
  await page.route('**/api/ask**', (r) => { const b = JSON.parse(r.request().postData() || '{}'); if (b.open) opens++; else freeQuestions++; r.abort(); });
  await page.goto(base + '/');
  const built = await page.waitForFunction(() => window.FaceDebug, null, { timeout: 30000 }).then(() => true).catch(() => false);
  check(`${vp.name}: the portrait builds`, built);
  await page.waitForTimeout(1200);
  const layout = await page.evaluate(() => ({
    header: !!document.querySelector('header.site-nav'),
    name: document.querySelector('.flight-name')?.getBoundingClientRect().toJSON(),
    links: [...document.querySelectorAll('.flight-links a')].map((a) => a.getAttribute('href')),
    field: document.querySelector('.ask-input')?.getBoundingClientRect().toJSON(),
    chips: document.querySelectorAll('.ask-chips .pill').length,
    frame: window.FaceDebug?.frame,
  }));
  check(`${vp.name}: no site header`, !layout.header);
  check(`${vp.name}: the name is on screen, top left`, layout.name && layout.name.top >= 0 && layout.name.left < vp.width / 2, layout.name);
  check(`${vp.name}: the four links are there`, layout.links.join(' ') === '/#work /writing /about mailto:info@samperalabs.com', layout.links);
  check(`${vp.name}: the field and the chips are on screen`, layout.field && layout.field.bottom <= vp.height && layout.chips >= 3, layout.field);
  check(`${vp.name}: the face sits above the chips`, layout.frame && layout.frame.chin <= layout.frame.chipsTop, layout.frame);
  await page.screenshot({ path: join(out, `${vp.name}-1-portrait.png`) });

  // Fly: a wheel (or a drag on a phone) moves the camera, not the page.
  if (vp.name === 'desktop') {
    await page.mouse.move(vp.width / 2, vp.height / 2);
    for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(60); }
  } else {
    const cdp = await page.context().newCDPSession(page);
    for (let i = 0; i < 4; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 500 }] });
      for (let y = 500; y >= 300; y -= 20) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
  }
  await page.waitForTimeout(1500);
  const flown = await page.evaluate(() => ({ back: document.querySelector('.flight').classList.contains('in'), nameHidden: getComputedStyle(document.querySelector('.flight-name')).visibility === 'hidden', scrollY }));
  check(`${vp.name}: scrolling flies in, the name leaves, the page stays put`, flown.back && flown.nameHidden && flown.scrollY < 3, flown);
  await page.screenshot({ path: join(out, `${vp.name}-2-flying.png`) });

  // A chip opens a prepared answer: the hero leaves, the answer shows above the field.
  await page.locator('.ask-chips .pill').first().click();
  await page.waitForTimeout(1500);
  const answer = await page.evaluate(() => ({ state: document.querySelector('[data-ask]').dataset.state, stage: getComputedStyle(document.querySelector('.ask-stage')).display, text: document.querySelector('[data-answer]').innerText.length }));
  check(`${vp.name}: a chip shows an answer and hides the hero`, answer.state === 'answer' && answer.stage === 'none' && answer.text > 20, answer);
  await page.screenshot({ path: join(out, `${vp.name}-3-answer.png`) });

  // Back: the browser back button returns to the hero.
  await page.goBack(); await page.waitForTimeout(1500);
  const back = await page.evaluate(() => ({ state: document.querySelector('[data-ask]').dataset.state, stage: getComputedStyle(document.querySelector('.ask-stage')).display }));
  check(`${vp.name}: back returns to the hero`, back.state === 'landing' && back.stage !== 'none', back);
  await page.screenshot({ path: join(out, `${vp.name}-4-back.png`) });

  check(`${vp.name}: no console errors`, errors.length === 0, errors);
  check(`${vp.name}: no free question reaches Jev (topic opens are blocked too)`, freeQuestions === 0, { freeQuestions, opens });
  await page.close();
}
await browser.close();
await writeFile(join(out, 'report.json'), JSON.stringify({ base, date: new Date().toISOString(), results }, null, 2));
const ok = results.every((r) => r.pass);
console.log(ok ? 'PASS home-flight' : 'FAIL home-flight');
process.exit(ok ? 0 : 1);
