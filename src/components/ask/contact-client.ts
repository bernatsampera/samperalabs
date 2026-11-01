// The contact form inside the "contact" answer. Works on the home page and on the review page.
// States on the form (data-state): idle, sending, sent, failed. Messages go to /api/contact.
// When the form cannot send, it shows Bernat's address, and the visitor's text stays in the field.

import { checkInput, CONTACT, type Field } from '../../lib/contact/form';
import { esc } from './render';

const started = new WeakMap<HTMLFormElement, { at: number; id: string }>();
const fresh = () => ({ at: Date.now(), id: crypto.randomUUID() });
const mail = () => `<a href="mailto:${esc(CONTACT.address)}">${esc(CONTACT.address)}</a>.`;

document.addEventListener('focusin', (e) => {
  const form = (e.target as HTMLElement).closest<HTMLFormElement>('form[data-contact]');
  if (form && !started.has(form)) started.set(form, fresh());
});

document.addEventListener('input', (e) => {
  const field = e.target as HTMLElement;
  const form = field.closest<HTMLFormElement>('form[data-contact]');
  if (!form || field.getAttribute('aria-invalid') !== 'true') return;
  field.removeAttribute('aria-invalid');
  form.querySelector<HTMLElement>('[data-note]')!.textContent = '';
});

document.addEventListener('submit', async (e) => {
  const form = (e.target as HTMLElement).closest<HTMLFormElement>('form[data-contact]');
  if (!form) return;
  e.preventDefault();
  if (form.dataset.state === 'sending' || form.dataset.state === 'sent') return;

  const email = form.querySelector<HTMLInputElement>('[name="email"]')!;
  const message = form.querySelector<HTMLTextAreaElement>('[name="message"]')!;
  const send = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const note = form.querySelector<HTMLElement>('[data-note]')!;
  const fields = { email, message };
  const say = (html: string) => (note.innerHTML = html);
  const invalid = (field: Field, text: string) => {
    form.dataset.state = 'idle';
    fields[field].setAttribute('aria-invalid', 'true');
    fields[field].focus();
    say(esc(text));
  };

  const problem = checkInput(email.value.trim(), message.value.trim());
  if (problem) return invalid(problem.field, problem.text);

  const start = started.get(form) ?? fresh();
  form.dataset.state = 'sending';
  email.readOnly = message.readOnly = true;
  send.setAttribute('aria-busy', 'true');
  send.textContent = CONTACT.sending;
  say('');

  let outcome = 'failed';
  let reply: { outcome?: string; field?: Field; error?: string } = {};
  try {
    const r = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(), message: message.value.trim(),
        website: form.querySelector<HTMLInputElement>('[name="website"]')!.value,
        ms: Date.now() - start.at, id: start.id,
      }),
    });
    reply = await r.json().catch(() => ({}));
    outcome = reply.outcome ?? 'failed';
  } catch {
    /* the visitor's network: outcome stays "failed" */
  }

  email.readOnly = message.readOnly = false;
  send.removeAttribute('aria-busy');
  send.textContent = CONTACT.send;
  if (outcome === 'sent') {
    form.dataset.state = 'sent';
    form.innerHTML = `<p class="b-form-done" role="status">${esc(CONTACT.sent)}</p>`;
    return;
  }
  if (outcome === 'invalid' && (reply.field === 'email' || reply.field === 'message')) return invalid(reply.field, reply.error ?? CONTACT.badEmail);
  form.dataset.state = 'failed';
  say(`${esc(outcome === 'too-many' ? CONTACT.tooMany : CONTACT.failed)} ${mail()}`);
});
