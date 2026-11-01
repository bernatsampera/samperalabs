// E2E proof for the home page question box: /api/ask and the local /ask-lab page.
// It NEVER calls the real Jev or the real Umami: it starts fake servers, and the Astro dev server gets a fake key
// and the fake addresses. Before any question, it stops if the server points anywhere else.
// Run: npm run ask:e2e
// Artifacts: tests/artifacts/ask-jev/latest/report.json and PNG screenshots of /ask-lab.
// The failure list it covers: design-preview/home-experiences/product.md ("Ask endpoint: how it can fail").

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'tests/artifacts/ask-jev/latest');
await mkdir(outDir, { recursive: true });

const FAKE_KEY = 'e2e-fake-key-not-real';
const DEV_PORT = 4398;
const RATE_LIMIT = 60;
const TIMEOUT_MS = 1500;
const IDS = ['who', 'now', 'projects', 'maat', 'memory', 'gcontext', 'agents', 'principles', 'tools', 'work', 'articles', 'bjjgym', 'indoeuromap', 'contact', 'site'];

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass: !!pass, detail: detail ?? null });
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${!pass && detail ? `  (${typeof detail === 'string' ? detail : JSON.stringify(detail)})` : ''}`);
};

// ---------- Fake Jev ----------
const jevRequests = [];
const seenStates = new Map();
const spread = (main) => {
  const rest = IDS.filter((id) => !(id in main));
  const left = 1 - Object.values(main).reduce((a, b) => a + b, 0);
  return { ...main, ...Object.fromEntries(rest.map((id) => [id, left / rest.length])) };
};
const answer = (scope, probabilities, choice) => ({
  model: 'fake-jev',
  answers: {
    scope: { type: 'noul', noul: scope },
    experience: { type: 'choice', choice: choice ?? Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0][0], confidence: 0.9, probabilities },
  },
});
const CLEAR = answer(0.95, spread({ projects: 0.9 }));

function fakeJev(req, res) {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', async () => {
    let body = null;
    try { body = JSON.parse(raw); } catch { /* recorded as null */ }
    jevRequests.push({ path: req.url, auth: req.headers.authorization, body });
    const state = (body?.state ?? '').toLowerCase();
    const count = (seenStates.get(state) ?? 0) + 1;
    seenStates.set(state, count);
    const send = (status, payload) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(typeof payload === 'string' ? payload : JSON.stringify(payload));
    };
    if (state.includes('slow')) { await new Promise((r) => setTimeout(r, TIMEOUT_MS * 2)); return send(200, CLEAR); }
    if (state.includes('five hundred')) return send(500, { error: 'boom' });
    if (state.includes('unauthorized')) return send(401, { error: 'bad key' });
    if (state.includes('broken json')) return send(200, 'not json{');
    if (state.includes('unknown choice')) return send(200, answer(0.9, { ...spread({ projects: 0.8 }), pizza: 0 }, 'pizza'));
    if (state.includes('bad sum')) return send(200, answer(0.9, Object.fromEntries(IDS.map((id) => [id, 0.04]))));
    if (state.includes('retry then ok')) return count === 1 ? send(503, { error: 'busy' }) : send(200, CLEAR);
    if (state.includes('off topic')) return send(200, answer(0.04, spread({ who: 0.7 })));
    if (state.includes('close')) return send(200, answer(0.9, spread({ projects: 0.45, maat: 0.4 })));
    if (state.includes('flat')) return send(200, answer(0.9, spread({})));
    if (state.includes('clear')) return send(200, CLEAR);
    return send(200, answer(0.9, spread({ who: 0.8 })));
  });
}
const fake = createServer(fakeJev);
await new Promise((r) => fake.listen(0, '127.0.0.1', r));
const FAKE_URL = `http://127.0.0.1:${fake.address().port}`;

// ---------- Fake Umami ----------
const umamiEvents = [];
let umamiSlow = false;
const umami = createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', async () => {
    let body = null;
    try { body = JSON.parse(raw); } catch { /* recorded as null */ }
    umamiEvents.push({ path: req.url, ua: req.headers['user-agent'], xff: req.headers['x-forwarded-for'], body });
    if (umamiSlow) await new Promise((r) => setTimeout(r, 3000));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{}');
  });
});
await new Promise((r) => umami.listen(0, '127.0.0.1', r));
const UMAMI_URL = `http://127.0.0.1:${umami.address().port}`;
const events = (name) => umamiEvents.filter((e) => e.body?.payload?.name === name);
const eventData = (name) => events(name).map((e) => e.body.payload.data);
async function waitForEvents(count, ms = 3000) {
  const until = Date.now() + ms;
  while (umamiEvents.length < count && Date.now() < until) await new Promise((r) => setTimeout(r, 50));
  return umamiEvents.length;
}

// ---------- Astro dev server ----------
let serverLog = '';
function startDev(extraEnv) {
  const child = spawn(join(root, 'node_modules/.bin/astro'), ['dev', '--port', String(DEV_PORT), '--host', '127.0.0.1'], {
    cwd: root,
    env: {
      ...process.env, JEV_BASE_URL: FAKE_URL, JEV_API_KEY: FAKE_KEY, JEV_TIMEOUT_MS: String(TIMEOUT_MS), ASK_RATE_LIMIT: String(RATE_LIMIT),
      ASK_TRACK: 'on', UMAMI_HOST: UMAMI_URL, ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => (serverLog += d));
  child.stderr.on('data', (d) => (serverLog += d));
  return child;
}
async function stopDev(child) {
  if (child.exitCode !== null) return;
  child.kill('SIGTERM');
  await new Promise((r) => { child.once('exit', r); setTimeout(r, 5000); });
}
const BASE = `http://127.0.0.1:${DEV_PORT}`;
async function waitForStatus() {
  const until = Date.now() + 120000;
  while (Date.now() < until) {
    try {
      const r = await fetch(`${BASE}/api/ask`);
      if (r.ok) return await r.json();
    } catch { /* not ready */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}
const post = async (body, raw = false) => {
  const r = await fetch(`${BASE}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: `${BASE}/`, 'User-Agent': 'Mozilla/5.0 (e2e)' },
    body: raw ? body : JSON.stringify(body),
  });
  let data = null;
  try { data = await r.json(); } catch { /* empty */ }
  return { status: r.status, data };
};

let dev = startDev({});
let browser;
let qPosts = 0; // POSTs with "q" that pass input checks: they count toward the rate limit
const ask = async (q) => { qPosts++; return post({ q }); };
const jevDelta = async (fn) => { const before = jevRequests.length; const out = await fn(); return { out, calls: jevRequests.length - before }; };

try {
  // ---------- Safety: the server must use the fake Jev and the fake key ----------
  const status = await waitForStatus();
  const safe = status && status.jevBaseUrl === FAKE_URL && status.keySet === true && status.tracking?.umamiHost === UMAMI_URL && status.tracking?.enabled === true;
  check('SAFETY: dev server uses the fake Jev and the fake Umami, and a key is set', safe, status);
  if (!safe) throw new Error('SAFETY STOP: the dev server does not point at the fake Jev and the fake Umami. No question was sent.');
  check('status never contains the key', !JSON.stringify(status).includes(FAKE_KEY));

  // ---------- Input (failure list 1 to 6) ----------
  let r = await jevDelta(() => ask(''));
  check('1. empty question opens "who", with no Jev call', r.out.status === 200 && r.out.data.experience?.id === 'who' && r.out.data.source === 'default' && r.calls === 0, r.out.data);
  r = await jevDelta(async () => { qPosts++; return post({}); });
  check('1. missing "q" opens "who", with no Jev call', r.out.data?.experience?.id === 'who' && r.calls === 0, r.out.data);
  r = await jevDelta(() => post({ q: 'x'.repeat(301) }));
  check('2. 301 characters: HTTP 400, no Jev call', r.out.status === 400 && r.calls === 0, r.out);
  r = await jevDelta(() => post('not json', true));
  check('3. body is not JSON: HTTP 400, no Jev call', r.out.status === 400 && r.calls === 0, r.out);
  r = await jevDelta(() => post({ q: 42 }));
  check('3. "q" is not a string: HTTP 400, no Jev call', r.out.status === 400 && r.calls === 0, r.out);

  r = await jevDelta(() => ask('clear projects'));
  check('14. clear winner: shown "projects" from Jev', r.out.data?.outcome === 'shown' && r.out.data.experience?.id === 'projects' && r.out.data.source === 'jev' && r.calls === 1, r.out.data);
  check('14. shown answer has its follow-ups (maat, gcontext, who)', JSON.stringify(r.out.data?.followUps?.map((f) => f.id)) === '["maat","gcontext","who"]', r.out.data?.followUps);
  r = await jevDelta(() => ask('  Clear   PROJECTS '));
  check('4. same question (case and spaces differ): from the cache, no Jev call', r.out.data?.source === 'cache' && r.out.data.experience?.id === 'projects' && r.calls === 0, r.out.data);

  r = await jevDelta(() => post({ open: 'maat' }));
  check('6. open an option directly: shown "maat", no Jev call', r.out.data?.outcome === 'shown' && r.out.data.experience?.id === 'maat' && r.calls === 0, r.out.data);
  r = await jevDelta(() => post({ open: 'nope' }));
  check('6. open an unknown experience: HTTP 404, no Jev call', r.out.status === 404 && r.calls === 0, r.out);

  // ---------- Decision (13 to 16) ----------
  r = await jevDelta(() => ask('off topic weather'));
  check('13. scope below 0.5: blocked, with the landing questions, even though "who" has 0.7', r.out.data?.outcome === 'blocked' && JSON.stringify(r.out.data.options?.map((o) => o.id)) === '["who","now","projects"]', r.out.data);
  r = await jevDelta(() => ask('close call'));
  check('15. two close experiences: did-you-mean with exactly projects and maat', r.out.data?.outcome === 'did-you-mean' && JSON.stringify(r.out.data.options?.map((o) => o.id)) === '["projects","maat"]', r.out.data?.options);
  r = await jevDelta(() => ask('flat everything'));
  check('16. all probabilities low: did-you-mean with 3 options', r.out.data?.outcome === 'did-you-mean' && r.out.data.options?.length === 3, r.out.data?.options);

  // ---------- Jev response problems (9 to 12) ----------
  r = await jevDelta(() => ask('slow please'));
  check('9. slow Jev: unavailable (timeout), no retry, answered before Jev finished', r.out.data?.outcome === 'unavailable' && r.out.data.reason === 'timeout' && r.calls === 1 && r.out.data.ms < TIMEOUT_MS * 2, { data: r.out.data, calls: r.calls });
  check('9. unavailable offers the landing questions', JSON.stringify(r.out.data?.options?.map((o) => o.id)) === '["who","now","projects"]', r.out.data?.options);
  r = await jevDelta(() => ask('error five hundred'));
  check('10. HTTP 500: one retry (2 calls), then unavailable', r.out.data?.outcome === 'unavailable' && r.out.data.reason === 'http' && r.calls === 2, { data: r.out.data, calls: r.calls });
  r = await jevDelta(() => ask('retry then ok'));
  check('10. HTTP 503 then OK: the retry succeeds, shown', r.out.data?.outcome === 'shown' && r.calls === 2, { data: r.out.data, calls: r.calls });
  r = await jevDelta(() => ask('error unauthorized'));
  check('11. HTTP 401: no retry (1 call), unavailable', r.out.data?.outcome === 'unavailable' && r.calls === 1, { data: r.out.data, calls: r.calls });
  for (const [q, label] of [['broken json', 'body is not JSON'], ['unknown choice', 'a choice that is not an experience'], ['bad sum', 'probabilities do not add up to 1']]) {
    r = await jevDelta(() => ask(q));
    check(`12. ${label}: unavailable (contract)`, r.out.data?.outcome === 'unavailable' && r.out.data.reason === 'contract', r.out.data);
  }
  r = await jevDelta(() => ask('broken json'));
  check('12. a failed answer is not cached: the same question calls Jev again', r.calls === 1 && r.out.data?.outcome === 'unavailable', { calls: r.calls });

  // ---------- The request that reaches Jev ----------
  const good = jevRequests.filter((x) => x.body);
  const shapeOk = good.every((x) => x.path === '/v1/systemone' && x.auth === `Bearer ${FAKE_KEY}` && x.body.model === 'jev-latest'
    && x.body.questions?.scope?.type === 'noul' && x.body.questions?.experience?.type === 'choice'
    && JSON.stringify(Object.keys(x.body.questions.experience.criteria)) === JSON.stringify(IDS));
  check('Jev request: /v1/systemone, bearer key, model, a scope (noul) and an experience (choice) question with all 15 ids', shapeOk && good.length > 0, good[0]?.body);

  // ---------- Umami events (21 to 26) ----------
  await ask(`long ${'y'.repeat(250)}`);
  await post({ open: 'maat', via: 'follow-up', from: 'projects' });
  await post({ open: 'maat', via: 'did-you-mean', q: 'close call' });
  await post({ open: 'who', via: 'sample' });
  await post({ open: 'who', via: 'weird' });
  umamiSlow = true;
  const slowStart = Date.now();
  await ask('clear while umami waits');
  const slowMs = Date.now() - slowStart;
  umamiSlow = false;
  await waitForEvents(qPosts + 3);
  await new Promise((r) => setTimeout(r, 300));

  const asks = eventData('ask');
  check('25. every question that passed the input checks sent one "ask" event (cache and fallback too)', asks.length === qPosts, { asks: asks.length, qPosts });
  const clear = asks.find((d) => d.q === 'clear projects');
  check('"ask" event: q, experience, probability, outcome, source', clear && clear.experience === 'projects' && clear.probability === 0.9 && clear.outcome === 'shown' && clear.source === 'jev', clear);
  check('"ask" event from the cache has source "cache"', asks.some((d) => d.q === 'Clear   PROJECTS' && d.source === 'cache'), asks.map((d) => d.source));
  check('"ask" event for did-you-mean lists the options and no experience', asks.some((d) => d.q === 'close call' && d.outcome === 'did-you-mean' && d.options === 'projects,maat' && d.experience === ''), asks.find((d) => d.q === 'close call'));
  check('"ask" event for a fallback has outcome "unavailable" and source "fallback"', asks.some((d) => d.q === 'slow please' && d.outcome === 'unavailable' && d.source === 'fallback'));
  check('23. a long question is cut to 200 characters in the event', asks.some((d) => d.q.startsWith('long ') && d.q.length === 200), asks.filter((d) => d.q.startsWith('long ')).map((d) => d.q.length));
  check('click event "follow-up" has from and to', eventData('follow-up').some((d) => d.from === 'projects' && d.to === 'maat'), eventData('follow-up'));
  check('click event "did-you-mean" has the question and the pick', eventData('did-you-mean').some((d) => d.q === 'close call' && d.to === 'maat'), eventData('did-you-mean'));
  check('click event "sample" has the experience', eventData('sample').some((d) => d.to === 'who'), eventData('sample'));
  check('24. a click with an unknown "via", or with no "via", sends no event', umamiEvents.filter((e) => !['ask', 'follow-up', 'did-you-mean', 'sample'].includes(e.body?.payload?.name)).length === 0 && events('sample').length === 1 && events('follow-up').length === 1);
  const sample = umamiEvents.find((e) => e.body?.payload?.data?.q === 'clear projects');
  check('Umami request: /api/send, type event, the site id, page url, browser name and IP forwarded', sample && sample.path === '/api/send' && sample.body.type === 'event'
    && sample.body.payload.website === 'e87d4767-b2e9-409a-a4a8-7c4e05300ad3' && sample.body.payload.url === '/' && sample.ua === 'Mozilla/5.0 (e2e)' && !!sample.xff, sample && { path: sample.path, ua: sample.ua, xff: sample.xff, payload: sample.body.payload });
  check('21. Umami is slow: the answer does not wait for it', slowMs < 1000, `${slowMs} ms`);
  check('no event ever contains the key', !JSON.stringify(umamiEvents).includes(FAKE_KEY));

  // ---------- The local test page ----------
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
  const pageErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.goto(`${BASE}/ask-lab`);
  await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Jev key'));
  check('lab: status shows "key set" and the fake address', (await page.textContent('#status')).includes(`Jev key: set. Address: ${FAKE_URL}`), await page.textContent('#status'));
  await page.screenshot({ path: join(outDir, 'lab-start.png') });

  const labAsk = async (q, shot) => {
    qPosts++;
    await page.fill('#q', q);
    await page.click('#send');
    await page.waitForFunction((label) => document.querySelector('#history li')?.textContent.startsWith(`"${label}"`), q);
    if (shot) await page.screenshot({ path: join(outDir, shot), fullPage: true });
    return page.textContent('#result-body');
  };
  let text = await labAsk('clear from the lab', 'lab-shown.png');
  check('lab: a clear question shows "shown" and "Projects"', text.includes('shown') && text.includes('Projects'), text.slice(0, 120));
  text = await labAsk('close from the lab', 'lab-did-you-mean.png');
  check('lab: a close question shows "did-you-mean" with MAAT and Projects', text.includes('did-you-mean') && text.includes('MAAT') && text.includes('Projects'), text.slice(0, 160));
  const before = jevRequests.length;
  await page.click('#result-body button[data-open="maat"]');
  await page.waitForFunction(() => document.querySelector('#history li')?.textContent.startsWith('open maat'));
  check('lab: a click on an option opens MAAT with no Jev call', jevRequests.length === before && (await page.textContent('#result-body')).includes('MAAT'));
  await new Promise((r) => setTimeout(r, 300));
  const labPick = umamiEvents.find((e) => e.body?.payload?.name === 'did-you-mean' && e.body.payload.data.q === 'close from the lab');
  check('lab: the "Did you mean" click sends a "did-you-mean" event with the question, from page /ask-lab', labPick?.body.payload.data.to === 'maat' && labPick.body.payload.url === '/ask-lab', labPick?.body?.payload);
  text = await labAsk('off topic from the lab', 'lab-blocked.png');
  check('lab: an off-topic question shows "blocked"', text.includes('blocked'), text.slice(0, 120));
  text = await labAsk('slow from the lab', 'lab-unavailable.png');
  check('lab: a slow Jev shows "unavailable"', text.includes('unavailable'), text.slice(0, 120));
  check('lab: the call counter matches the Jev calls (4)', (await page.textContent('#calls')).trim() === '4', await page.textContent('#calls'));
  check('lab: zero console errors', pageErrors.length === 0, pageErrors);

  // ---------- Rate limit (5) ----------
  let allowed = 0;
  let limited = null;
  const callsBefore = jevRequests.length;
  for (let i = 0; i < RATE_LIMIT + 5; i++) {
    const x = await post({ q: '' });
    if (x.status === 429) { limited = i; break; }
    allowed++;
  }
  check(`5. rate limit: HTTP 429 after ${RATE_LIMIT} questions from one visitor, no Jev call`, limited !== null && qPosts + allowed === RATE_LIMIT && jevRequests.length === callsBefore, { qPostsBefore: qPosts, allowedAfter: allowed, limitedAt: limited });

  // ---------- Logs (20) ----------
  const leaked = ['clear projects', 'off topic weather', 'broken json', 'slow please', 'close from the lab'].filter((q) => serverLog.toLowerCase().includes(q));
  check('20. server logs never contain the question text', leaked.length === 0, leaked);

  // ---------- Missing key (7) ----------
  await stopDev(dev);
  dev = startDev({ JEV_API_KEY: '', ASK_TRACK: '' });
  const noKey = await waitForStatus();
  check('22. local development without ASK_TRACK=on: Umami events are off', noKey?.tracking?.enabled === false, noKey?.tracking);
  const eventsBefore = umamiEvents.length;
  if (noKey?.jevBaseUrl !== FAKE_URL) {
    check('7. missing key: SAFETY, the restarted server uses the fake address', false, noKey);
  } else if (noKey.keySet) {
    check('7. missing key: could not clear the key with an empty variable, test skipped', false, 'JEV_API_KEY="" did not override .env');
  } else {
    r = await jevDelta(() => post({ q: 'clear no key' }));
    check('7. missing key: unavailable (no-key), no Jev call', r.out.data?.outcome === 'unavailable' && r.out.data.reason === 'no-key' && r.calls === 0, r.out.data);
    await new Promise((r) => setTimeout(r, 500));
    check('22. with events off, a question sends no Umami event', umamiEvents.length === eventsBefore, { before: eventsBefore, after: umamiEvents.length });
  }
} catch (error) {
  check('run finished without an exception', false, error.message);
} finally {
  if (browser) await browser.close();
  await stopDev(dev);
  fake.close();
  umami.close();
}

const failed = results.filter((x) => !x.pass).length;
const report = {
  when: new Date().toISOString(),
  realJevCalls: 0,
  fakeJevRequests: jevRequests.length,
  fakeUmamiEvents: umamiEvents.length,
  notCovered: ['19. /ask-lab and GET /api/ask return 404 in production (needs a production build)', '8. network error retry (the fake server is always reachable)', '17. prompt injection (design argument, not a test)'],
  results,
};
await writeFile(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(`\n${results.length - failed} passed, ${failed} failed. Fake Jev requests: ${jevRequests.length}. Real Jev calls: 0.`);
console.log(`Report: ${join(outDir, 'report.json')}`);
process.exit(failed ? 1 : 0);
