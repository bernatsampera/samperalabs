// Sends home page question events to Umami from the server, through Umami's /api/send.
// Sends only in production, or when ASK_TRACK=on (the E2E test points UMAMI_HOST at a fake server).
// ASK_TRACK=off stops events in production. The answer never waits for Umami.
// Event names and data: design-preview/home-experiences/product.md ("Saving the questions").

// The same Umami site as src/components/common/Analytics.astro.
const DEFAULT_HOST = 'https://umami-wgg0cog08kwcsccgc8kww0gg.bjjgym.com';
const DEFAULT_WEBSITE = 'e87d4767-b2e9-409a-a4a8-7c4e05300ad3';
export const MAX_QUESTION_IN_EVENT = 200;

export type EventData = Record<string, string | number>;

export function trackSettings() {
  const env = import.meta.env;
  const flag = env.ASK_TRACK ?? process.env.ASK_TRACK;
  return {
    enabled: flag === 'on' || (env.PROD && flag !== 'off'),
    host: (env.UMAMI_HOST ?? process.env.UMAMI_HOST ?? DEFAULT_HOST).replace(/\/$/, ''),
    website: env.UMAMI_WEBSITE_ID ?? process.env.UMAMI_WEBSITE_ID ?? DEFAULT_WEBSITE,
  };
}

export const cut = (q: string) => q.slice(0, MAX_QUESTION_IN_EVENT);

function pageOf(request: Request): URL | null {
  try {
    return new URL(request.headers.get('referer') ?? '');
  } catch {
    return null;
  }
}

/** Fire and forget. The visitor's IP and browser name go to Umami only so that it can count visitors. */
export function track(name: string, data: EventData, request: Request, ip?: string): void {
  const settings = trackSettings();
  if (!settings.enabled) return;
  const page = pageOf(request);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': request.headers.get('user-agent') ?? 'Mozilla/5.0',
  };
  if (ip) headers['X-Forwarded-For'] = ip;
  const payload = {
    website: settings.website,
    hostname: page?.hostname ?? 'samperalabs.com',
    url: page ? page.pathname + page.search : '/',
    referrer: '',
    language: (request.headers.get('accept-language') ?? '').split(',')[0],
    screen: '',
    title: '',
    name,
    data,
  };
  fetch(`${settings.host}/api/send`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type: 'event', payload }),
    signal: AbortSignal.timeout(2000),
  })
    .then((r) => {
      if (!r.ok) console.warn(`[ask] Umami event "${name}" failed: HTTP ${r.status}.`);
    })
    .catch((error) => console.warn(`[ask] Umami event "${name}" failed: ${error?.name ?? 'error'}.`));
}
