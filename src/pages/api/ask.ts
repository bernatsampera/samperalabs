import type { APIRoute } from 'astro';
import { decide, open, RULES, type Decision } from '../../lib/ask/decide';
import { jevSettings } from '../../lib/ask/jev';
import { cut, track, trackSettings } from '../../lib/ask/track';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// One visitor may ask a limited number of questions in a time window. In memory, per server process.
const WINDOW_MS = 10 * 60 * 1000;
const rateLimit = () => Number(import.meta.env.ASK_RATE_LIMIT ?? process.env.ASK_RATE_LIMIT ?? 30);
const seen = new Map<string, number[]>();
function allow(visitor: string): boolean {
  const now = Date.now();
  const recent = (seen.get(visitor) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= rateLimit()) {
    seen.set(visitor, recent);
    return false;
  }
  recent.push(now);
  seen.set(visitor, recent);
  return true;
}

const short = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

function askEvent(question: string, d: Decision) {
  return {
    q: cut(question),
    experience: d.outcome === 'shown' ? (d.experience?.id ?? '') : '',
    probability: Math.round((d.probabilities?.[0]?.probability ?? d.experience?.probability ?? 0) * 1000) / 1000,
    outcome: d.outcome,
    source: d.source,
    ...(d.outcome === 'did-you-mean' ? { options: (d.options ?? []).map((o) => o.id).join(',') } : {}),
  };
}

// POST /api/ask  { q: "question" }  or  { open: "experience id", via, from, q }
export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'The body must be JSON.' }, 400);
  }
  if (!body || typeof body !== 'object') return json({ error: 'The body must be a JSON object.' }, 400);
  const { q, open: openId, via, from } = body as { q?: unknown; open?: unknown; via?: unknown; from?: unknown };

  let visitor = 'unknown';
  try {
    visitor = clientAddress;
  } catch {
    /* adapter without client address */
  }

  if (openId !== undefined) {
    if (typeof openId !== 'string') return json({ error: '"open" must be a string.' }, 400);
    const decision = open(openId);
    if (!decision) return json({ error: 'Unknown experience.' }, 404);
    if (via === 'follow-up') track('follow-up', { from: short(from, 40), to: openId }, request, visitor);
    else if (via === 'did-you-mean') track('did-you-mean', { q: cut(short(q, RULES.maxLength)), to: openId }, request, visitor);
    else if (via === 'sample') track('sample', { to: openId }, request, visitor);
    else if (via === 'menu') track('menu', { to: openId }, request, visitor);
    return json(decision);
  }

  if (q !== undefined && typeof q !== 'string') return json({ error: '"q" must be a string.' }, 400);
  const question = (q ?? '').trim();
  if (question.length > RULES.maxLength) return json({ error: `The question can have at most ${RULES.maxLength} characters.` }, 400);
  if (!allow(visitor)) return json({ error: 'Too many questions. Wait a few minutes, then ask again.' }, 429);

  const decision = await decide(question);
  track('ask', askEvent(question, decision), request, visitor);
  return json(decision);
};

// GET /api/ask: local status for the test page. It never shows the key. Not available in production.
export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) return new Response(null, { status: 404 });
  const { key, baseUrl, model, timeoutMs } = jevSettings();
  const tracking = trackSettings();
  return json({
    keySet: key.length > 0, jevBaseUrl: baseUrl, model, timeoutMs, rateLimit: rateLimit(), rules: RULES,
    tracking: { enabled: tracking.enabled, umamiHost: tracking.host },
  });
};
