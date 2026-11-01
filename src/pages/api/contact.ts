import type { APIRoute } from 'astro';
import { checkInput, CONTACT_RULES } from '../../lib/contact/form';
import { MailError, mailSettings, sendMail } from '../../lib/contact/mail';
import { track, trackSettings } from '../../lib/ask/track';

export const prerender = false;

// Failure list: design-preview/home-experiences/product.md ("Contact form: how it can fail").
// The log and the Umami event hold the outcome only: never the message, the email, or the key.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const MAX_BODY = 16 * 1024;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const env = (name: string, fallback: number) => Number(import.meta.env[name] ?? process.env[name] ?? fallback);
const rateLimit = () => env('CONTACT_RATE_LIMIT', 3);
const dailyCap = () => env('CONTACT_DAILY_CAP', 30);

// In memory, per server process: messages per visitor per hour, and mail attempts for the whole site per day.
const seen = new Map<string, number[]>();
let sends: number[] = [];
function allow(visitor: string): boolean {
  const now = Date.now();
  const recent = (seen.get(visitor) ?? []).filter((t) => now - t < HOUR_MS);
  const ok = recent.length < rateLimit();
  if (ok) recent.push(now);
  seen.set(visitor, recent);
  return ok;
}
function underCap(): boolean {
  const now = Date.now();
  sends = sends.filter((t) => now - t < DAY_MS);
  if (sends.length >= dailyCap()) return false;
  sends.push(now);
  return true;
}

type Outcome = 'sent' | 'invalid' | 'too-many' | 'failed' | 'bot' | 'no-key' | 'cap';
function finish(outcome: Outcome, request: Request, visitor: string, detail = '') {
  console.info(`[contact] outcome=${outcome}${detail ? ` ${detail}` : ''}`);
  track('contact', { outcome }, request, visitor);
}

const isId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(v);

// POST /api/contact  { email, message, website (honeypot), ms (time since first focus), id (idempotency key) }
export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ outcome: 'failed', error: 'The body must be JSON.' }, 415);
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) return json({ outcome: 'failed', error: 'The body is too large.' }, 413);
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ outcome: 'failed', error: 'The body is too large.' }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ outcome: 'failed', error: 'The body must be JSON.' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ outcome: 'failed', error: 'The body must be a JSON object.' }, 400);
  const { email, message, website, ms, id } = body as Record<string, unknown>;
  if (typeof email !== 'string' || typeof message !== 'string') return json({ outcome: 'failed', error: '"email" and "message" must be strings.' }, 400);

  let visitor = 'unknown';
  try {
    visitor = clientAddress;
  } catch {
    /* adapter without client address */
  }

  const replyTo = email.trim();
  const text = message.trim();
  const problem = checkInput(replyTo, text);
  if (problem) {
    finish('invalid', request, visitor, `field=${problem.field}`);
    return json({ outcome: 'invalid', field: problem.field, error: problem.text }, 400);
  }
  if (!allow(visitor)) {
    finish('too-many', request, visitor);
    return json({ outcome: 'too-many' }, 429);
  }
  // A bot gets the normal answer, so it learns nothing. No mail goes out.
  if ((typeof website === 'string' && website !== '') || typeof ms !== 'number' || ms < CONTACT_RULES.minMs) {
    finish('bot', request, visitor);
    return json({ outcome: 'sent' });
  }
  if (!underCap()) {
    finish('cap', request, visitor);
    return json({ outcome: 'failed' }, 503);
  }

  try {
    const how = await sendMail({ replyTo, message: text, id: isId(id) ? id : crypto.randomUUID() });
    finish('sent', request, visitor, how === 'fake' ? 'mailer=fake' : '');
    return json({ outcome: 'sent' });
  } catch (error) {
    const e = error instanceof MailError ? error : new MailError('Unknown error.', 'network');
    finish(e.reason === 'no-key' ? 'no-key' : 'failed', request, visitor, `reason=${e.reason}${e.status ? ` status=${e.status}` : ''}${e.code ? ` resend=${e.code}` : ''}`);
    return json({ outcome: 'failed' }, 503);
  }
};

// GET /api/contact: local status for the E2E test. It never shows the key. Not available in production.
export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) return new Response(null, { status: 404 });
  const { key, baseUrl, mode, timeoutMs } = mailSettings();
  const tracking = trackSettings();
  return json({
    keySet: key.length > 0, mailer: mode, resendBaseUrl: baseUrl, timeoutMs, rateLimit: rateLimit(), dailyCap: dailyCap(),
    tracking: { enabled: tracking.enabled, umamiHost: tracking.host },
  });
};
