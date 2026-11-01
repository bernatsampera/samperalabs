// Mailer for the contact form: sends one plain-text email through Resend (POST /emails).
// Settings: RESEND_API_KEY, RESEND_BASE_URL, CONTACT_FROM, CONTACT_TO, CONTACT_TIMEOUT_MS, CONTACT_MAILER.
// CONTACT_MAILER is "resend" or "fake". Default: "resend" in production or when a key is set, else "fake".
// The fake mailer sends nothing. A value in the process environment wins over .env, so tests can point at a fake server.
// The key, the message and the visitor's email never go to the log.
// Failure list: design-preview/home-experiences/product.md ("Contact form: how it can fail").

export class MailError extends Error {
  constructor(
    message: string,
    readonly reason: 'no-key' | 'timeout' | 'http' | 'network',
    readonly status?: number,
    /** Resend's error name, for example "validation_error". A fixed code, so it holds no visitor data. */
    readonly code?: string,
  ) {
    super(message);
  }
}

export function mailSettings() {
  const env = import.meta.env;
  const key = (env.RESEND_API_KEY ?? process.env.RESEND_API_KEY ?? '').trim();
  const flag = env.CONTACT_MAILER ?? process.env.CONTACT_MAILER;
  return {
    key,
    baseUrl: (env.RESEND_BASE_URL ?? process.env.RESEND_BASE_URL ?? 'https://api.resend.com').replace(/\/$/, ''),
    from: env.CONTACT_FROM ?? process.env.CONTACT_FROM ?? 'SamperaLabs <info@bjjgym.com>',
    to: env.CONTACT_TO ?? process.env.CONTACT_TO ?? 'info@samperalabs.com',
    timeoutMs: Number(env.CONTACT_TIMEOUT_MS ?? process.env.CONTACT_TIMEOUT_MS ?? 8000),
    mode: flag === 'fake' || flag === 'resend' ? flag : env.PROD || key ? 'resend' : 'fake',
  } as const;
}

export type Mail = { replyTo: string; message: string; id: string };

const body = (m: Mail) => `New message from the contact form on samperalabs.com.

From: ${m.replyTo}
Sent: ${new Date().toISOString()}

${m.message}
`;

/** Sends one email. At most one retry, only for 429, 5xx and network errors. The idempotency key stops a double send. */
export async function sendMail(m: Mail): Promise<'sent' | 'fake'> {
  const { key, baseUrl, from, to, timeoutMs, mode } = mailSettings();
  if (mode === 'fake') return 'fake';
  if (!key) throw new MailError('RESEND_API_KEY is not set.', 'no-key');

  const payload = JSON.stringify({ from, to: [to], reply_to: m.replyTo, subject: 'Message from samperalabs.com', text: body(m) });
  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/emails`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': m.id },
        body: payload,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      // The visitor is waiting, so a timeout gets no retry.
      if (error instanceof Error && error.name === 'TimeoutError') throw new MailError(`Resend did not answer in ${timeoutMs} ms.`, 'timeout');
      if (attempt === 0) continue;
      throw new MailError('Resend could not be reached.', 'network');
    }
    if ((response.status === 429 || response.status >= 500) && attempt === 0) {
      await new Promise((done) => setTimeout(done, 400));
      continue;
    }
    if (!response.ok) {
      const name = await response.json().then((b) => b?.name).catch(() => undefined);
      const code = typeof name === 'string' && /^[a-z_]{1,40}$/.test(name) ? name : undefined;
      throw new MailError(`Resend HTTP status ${response.status}.`, 'http', response.status, code);
    }
    return 'sent';
  }
  throw new MailError('Resend request failed.', 'network');
}
