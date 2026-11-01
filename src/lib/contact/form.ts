// The contact form: its text and its input rules. Shared by the page (render.ts, contact-client.ts) and the server (api/contact.ts),
// so both check the same things. Bernat owns the text. Plain English, spoken, no dashes.

export const CONTACT = {
  emailLabel: 'Your email',
  messageLabel: 'Your message',
  send: 'Send',
  sending: 'Sending',
  sent: "Thanks, it's in my inbox. I'll answer by email.",
  emptyMessage: 'Write a message first.',
  badEmail: "That email doesn't look right.",
  tooLong: 'Keep it under 4,000 characters.',
  // These two end with the address, as a link.
  failed: "That didn't go through. Write to me at",
  tooMany: 'You sent a few messages already. Write to me at',
  address: 'info@samperalabs.com',
};

export const CONTACT_RULES = {
  maxMessage: 4000,
  maxEmail: 254,
  /** A form sent faster than this after the first focus is a bot. */
  minMs: 2000,
};

export type Field = 'email' | 'message';

/** The first problem with the input, or null. The email has no spaces or line breaks, one @, and a dot in the domain. */
export function checkInput(email: string, message: string): { field: Field; text: string } | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > CONTACT_RULES.maxEmail) return { field: 'email', text: CONTACT.badEmail };
  if (!message) return { field: 'message', text: CONTACT.emptyMessage };
  if (message.length > CONTACT_RULES.maxMessage) return { field: 'message', text: CONTACT.tooLong };
  return null;
}
