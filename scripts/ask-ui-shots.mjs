// Visual proof for the Ask Jev component on /ask-preview, with a FAKE Jev (never the real one).
// Run: node scripts/ask-ui-shots.mjs
// Artifacts: tests/artifacts/ask-ui/latest/*.png and report.json (console errors, states reached).

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'tests/artifacts/ask-ui/latest');
await mkdir(out, { recursive: true });
const IDS = ['who', 'now', 'projects', 'maat', 'memory', 'gcontext', 'agents', 'principles', 'tools', 'work', 'articles', 'bjjgym', 'indoeuromap', 'contact', 'site'];
const PORT = 4397;

// Fake Jev: keyword routing, with a short delay so the reading state is visible.
const spread = (main) => {
  const rest = IDS.filter((id) => !(id in main));
  const left = 1 - Object.values(main).reduce((a, b) => a + b, 0);
  return { ...main, ...Object.fromEntries(rest.map((id, i) => [id, (left / rest.length) * (0.6 + (i % 4) * 0.27) / 1.005])) };
};
const norm = (p) => { const s = Object.values(p).reduce((a, b) => a + b, 0); return Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v / s])); };
const reply = (scope, probs) => {
  const p = norm(probs);
  const choice = Object.entries(p).sort((a, b) => b[1] - a[1])[0][0];
  return { model: 'fake-jev', answers: { scope: { type: 'noul', noul: scope }, experience: { type: 'choice', choice, confidence: 0.9, probabilities: p } } };
};
const fake = createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    const s = (JSON.parse(raw || '{}').state ?? '').toLowerCase();
    let body;
    if (s.includes('weather')) body = reply(0.03, spread({ who: 0.5 }));
    else if (s.includes('agents') && s.includes('maat')) body = reply(0.92, spread({ agents: 0.44, maat: 0.41 }));
    else if (s.includes('gcontext')) body = reply(0.95, spread({ gcontext: 0.9 }));
    else if (s.includes('project')) body = reply(0.96, spread({ projects: 0.91 }));
    else if (s.includes('written')) body = reply(0.94, spread({ articles: 0.88 }));
    else if (s.includes('think')) body = reply(0.93, spread({ principles: 0.86 }));
    else body = reply(0.9, spread({ who: 0.84 }));
    setTimeout(() => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); }, 800);
  });
});
await new Promise((r) => fake.listen(0, '127.0.0.1', r));
const FAKE = `http://127.0.0.1:${fake.address().port}`;

const dev = spawn(join(root, 'node_modules/.bin/astro'), ['dev', '--port', String(PORT), '--host', '127.0.0.1'], {
  cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, JEV_BASE_URL: FAKE, JEV_API_KEY: 'ui-fake-key-not-real', ASK_TRACK: 'off', ASK_RATE_LIMIT: '200' },
});
let log = '';
dev.stdout.on('data', (d) => (log += d));
dev.stderr.on('data', (d) => (log += d));
const BASE = `http://127.0.0.1:${PORT}`;

const report = { when: new Date().toISOString(), realJevCalls: 0, states: [], consoleErrors: [] };
let browser;
try {
  let status = null;
  for (let i = 0; i < 240 && !status; i++) {
    try { const r = await fetch(`${BASE}/api/ask`); if (r.ok) status = await r.json(); } catch { /* not ready */ }
    if (!status) await new Promise((r) => setTimeout(r, 500));
  }
  if (!status || status.jevBaseUrl !== FAKE) throw new Error(`SAFETY STOP: the dev server does not point at the fake Jev (${JSON.stringify(status)}).`);

  browser = await chromium.launch();
  const hideToolbar = (page) => page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' }).catch(() => {});
  const shoot = async (page, name, full = false) => { await hideToolbar(page); await page.screenshot({ path: join(out, `${name}.png`), fullPage: full }); report.states.push(name); };
  const watch = (page, label) => {
    page.on('console', (m) => { if (m.type() === 'error') report.consoleErrors.push(`[${label}] ${m.text()}`); });
    page.on('pageerror', (e) => report.consoleErrors.push(`[${label}] ${e.message}`));
  };
  const askQ = async (page, q, name, { reading = false, full = true } = {}) => {
    await page.fill('#ask-q', q);
    await page.press('#ask-q', 'Enter');
    if (reading) { await page.waitForTimeout(650); await shoot(page, `${name}-reading`); }
    await page.waitForFunction(() => document.querySelector('.ans.show'), null, { timeout: 15000 });
    await page.waitForTimeout(3200);
    await shoot(page, name);
    if (full) await shoot(page, `${name}-full`, true);
  };

  // Desktop
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page, 'desktop');
  await page.goto(`${BASE}/ask-preview`);
  await page.waitForFunction(() => document.querySelector('[data-ask]')?.dataset.ready === 'true');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await shoot(page, 'd-landing');
  // The quiet browse list: open it with the arrow key in the empty field, then pick a topic.
  await page.focus('#ask-q');
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(400);
  await shoot(page, 'd-menu');
  report.menuItems = await page.evaluate(() => document.querySelectorAll('[data-menu] button').length);
  await page.click('[data-menu] button[data-open="articles"]');
  await page.waitForFunction(() => document.querySelector('.ans.show .b-list'), null, { timeout: 15000 });
  await page.waitForTimeout(1800);
  await shoot(page, 'd-menu-articles');
  await askQ(page, 'Show me your projects', 'd-projects', { reading: true });
  await page.click('[data-signal]');
  await page.waitForTimeout(500);
  await shoot(page, 'd-projects-why');
  await askQ(page, 'What is gcontext?', 'd-gcontext');
  await askQ(page, 'What have you written?', 'd-articles');
  await askQ(page, 'How do you think about AI?', 'd-principles');
  await askQ(page, 'Tell me about your agents at MAAT', 'd-did-you-mean', { full: false });
  await askQ(page, 'What is the weather in Barcelona?', 'd-blocked', { full: false });
  await askQ(page, 'Who are you?', 'd-who');
  await page.click('[data-reset]');
  await page.waitForTimeout(1600);
  await shoot(page, 'd-start-over');
  // The door into the MAAT story
  await page.goto(`${BASE}/ask-preview?q=maat`);
  await page.waitForFunction(() => document.querySelector('.ans.show a[data-door]'), null, { timeout: 15000 });
  await page.waitForTimeout(2000);
  await shoot(page, 'd-maat');
  await page.click('a[data-door]');
  await page.waitForTimeout(300);
  await shoot(page, 'd-door-mid');
  await page.waitForURL(/maat\.html/, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await shoot(page, 'd-door-story');
  report.doorUrl = page.url();

  // Review page: every answer in one place (no Jev, and no comment is typed, so comments.json stays as it is)
  const review = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(review, 'review');
  await review.goto(`${BASE}/ask-review`);
  await review.waitForFunction(() => document.documentElement.dataset.ready === 'true', null, { timeout: 15000 });
  await review.evaluate(() => document.fonts.ready);
  await review.waitForTimeout(500);
  await shoot(review, 'r-review');
  await shoot(review, 'r-review-full', true);
  report.reviewItems = await review.evaluate(() => document.querySelectorAll('.rv-item').length);

  // The real home page: the Ask component is the hero, the stories follow below.
  const home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(home, 'home');
  await home.goto(`${BASE}/`);
  await home.waitForFunction(() => document.querySelector('[data-ask]')?.dataset.ready === 'true', null, { timeout: 20000 });
  await home.evaluate(() => document.fonts.ready);
  await home.waitForTimeout(800);
  await shoot(home, 'h-landing');
  await home.evaluate(() => window.scrollTo(0, innerHeight));
  await home.waitForTimeout(1200);
  await shoot(home, 'h-below');
  await home.evaluate(() => window.scrollTo(0, 0));
  await askQ(home, 'Show me your projects', 'h-projects', { full: false });

  // Phone
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  watch(phone, 'phone');
  await phone.goto(`${BASE}/ask-preview`);
  await phone.waitForFunction(() => document.querySelector('[data-ask]')?.dataset.ready === 'true');
  await phone.evaluate(() => document.fonts.ready);
  await phone.waitForTimeout(600);
  await shoot(phone, 'p-landing');
  await askQ(phone, 'Show me your projects', 'p-projects');
  await askQ(phone, 'How do you think about AI?', 'p-principles', { full: false });
} catch (error) {
  report.error = error.message;
  console.error(error.message);
} finally {
  if (browser) await browser.close();
  dev.kill('SIGTERM');
  fake.close();
}
await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(`States: ${report.states.length}. Console errors: ${report.consoleErrors.length}. Real Jev calls: 0.${report.error ? ` Error: ${report.error}` : ''}`);
if (report.consoleErrors.length) console.log(report.consoleErrors.slice(0, 8).join('\n'));
process.exit(report.error || report.consoleErrors.length ? 1 : 0);
