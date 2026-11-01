// Ask Jev: behaviour of the home page question box.
// The field stays at the bottom and never moves. The hero, and later each answer, appears above it.
// An answer looks like a chat: the question on the right, the answer on the left. One answer at a time.
// Chips above the field: sample questions on landing, follow-ups after an answer.
// Questions go to /api/ask. A click on a chip, card or option opens an answer directly, with no Jev call.

import type { AnswerContent } from '../../lib/ask/content';
import { blockHtml, bubbleHtml, esc, go, ICON, pct, pickHtml, sayHtml, type Option } from './render';
import './contact-client';

type Decision = {
  outcome: 'shown' | 'did-you-mean' | 'blocked' | 'unavailable';
  experience?: Option;
  options?: Option[];
  followUps?: Option[];
  scope?: number;
  probabilities?: { id: string; probability: number }[];
  source: 'jev' | 'cache' | 'default' | 'fallback';
  reason?: string;
  tooMany?: boolean;
};
type Data = {
  content: Record<string, AnswerContent>;
  shared: Record<'placeholder' | 'placeholderNext' | 'startOver' | 'blocked' | 'didYouMean' | 'unavailable' | 'tooMany', string>;
  order: string[];
  titles: Record<string, string>;
  asks: Record<string, string>;
  samples: Option[];
  api: string;
};

const root = document.querySelector<HTMLElement>('[data-ask]');
if (root) init(root);

function init(root: HTMLElement) {
  const data: Data = JSON.parse(root.querySelector('#ask-data')!.textContent!);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const OUT = 'cubic-bezier(.22, 1, .36, 1)';
  const MOVE = 'cubic-bezier(.65, 0, .35, 1)';
  const form = root.querySelector<HTMLFormElement>('[data-form]')!;
  const input = form.querySelector<HTMLInputElement>('input')!;
  const send = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const hello = root.querySelector<HTMLElement>('[data-hello]')!;
  const chips = root.querySelector<HTMLElement>('[data-chips]')!;
  const answer = root.querySelector<HTMLElement>('[data-answer]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  const browse = root.querySelector<HTMLButtonElement>('[data-browse]')!;
  const menu = root.querySelector<HTMLElement>('[data-menu]')!;
  let busy = false;

  const wait = (ms: number) => new Promise((done) => setTimeout(done, reduced.matches ? 0 : ms));
  const play = (el: Element, frames: Keyframe[], o: KeyframeAnimationOptions) => (reduced.matches ? Promise.resolve() : el.animate(frames, o).finished.then(() => undefined));

  async function call(body: Record<string, unknown>): Promise<Decision> {
    try {
      const r = await fetch(data.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.status === 429) return { outcome: 'unavailable', options: data.samples, source: 'fallback', tooMany: true };
      if (!r.ok) return { outcome: 'unavailable', options: data.samples, source: 'fallback' };
      return (await r.json()) as Decision;
    } catch {
      return { outcome: 'unavailable', options: data.samples, source: 'fallback' };
    }
  }

  // ---------- Browse: every topic in a list above the field. Text stays the main way. ----------
  const menuItems = () => [...menu.querySelectorAll<HTMLButtonElement>('button')];
  function openMenu(focusFirst: boolean) {
    menu.hidden = false;
    browse.setAttribute('aria-expanded', 'true');
    play(menu, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: OUT });
    if (focusFirst) menuItems()[0]?.focus();
  }
  function closeMenu(refocus = false) {
    if (menu.hidden) return;
    menu.hidden = true;
    browse.setAttribute('aria-expanded', 'false');
    if (refocus) input.focus();
  }
  browse.addEventListener('click', () => (menu.hidden ? openMenu(false) : closeMenu()));
  input.addEventListener('keydown', (e) => {
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !input.value) {
      e.preventDefault();
      openMenu(true);
    }
  });
  menu.addEventListener('keydown', (e) => {
    const items = menuItems();
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[(at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    } else if (e.key === 'Escape') {
      closeMenu(true);
    }
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !(e.target as HTMLElement).closest('[data-menu], [data-browse]')) closeMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(true); });

  // ---------- Chips above the field ----------
  const sampleChips = () => data.samples.map((o) => `<button type="button" class="pill" ${go(o.id, 'sample', o.ask)}>${esc(o.ask)}</button>`).join('');
  const startOver = () => `<button type="button" class="pill ghost" data-reset>${ICON.back}${esc(data.shared.startOver)}</button>`;
  function chipsFor(d: Decision) {
    const id = d.experience?.id ?? '';
    if (d.outcome === 'shown') return (d.followUps ?? []).map((f) => `<button type="button" class="pill" ${go(f.id, 'follow-up', f.ask, id)}>${esc(f.ask)}</button>`).join('') + startOver();
    if (d.outcome === 'did-you-mean') return startOver();
    return sampleChips() + startOver();
  }
  async function setChips(html: string) {
    await play(chips, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: OUT, fill: 'forwards' });
    chips.innerHTML = html;
    chips.getAnimations().forEach((a) => a.cancel());
    if (!reduced.matches) [...chips.children].forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 50, easing: OUT, fill: 'backwards' }));
  }

  // ---------- Between landing and answer. The field never moves. ----------
  async function toAnswer() {
    if (root.dataset.state === 'answer') return;
    await play(hello, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-24px)' }], { duration: 320, easing: OUT, fill: 'forwards' });
    root.dataset.state = 'answer';
    hello.getAnimations().forEach((a) => a.cancel());
  }

  async function toLanding(push = true) {
    if (root.dataset.state !== 'answer') return;
    await clearAnswer();
    root.dataset.state = 'landing';
    input.value = '';
    input.placeholder = data.shared.placeholder;
    play(hello, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: OUT });
    setChips(sampleChips());
    if (push) history.pushState(null, '', location.pathname);
    live.textContent = 'Back to the start.';
  }

  async function clearAnswer() {
    const old = answer.querySelector<HTMLElement>('.ans');
    if (!old) return;
    await play(old, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-16px)' }], { duration: 220, easing: OUT, fill: 'forwards' });
    answer.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }

  // ---------- One answer: the bubble, the Jev signal, then the answer ----------
  function newAnswer(q: string, reading: boolean) {
    const el = document.createElement('div');
    el.className = 'ans';
    const bars = data.order.map((id, i) => `<i data-id="${esc(id)}" style="--i:${i}"></i>`).join('');
    el.innerHTML = `${bubbleHtml(q)}
      <div class="ans-a" tabindex="-1">
        <button type="button" class="signal${reading ? ' reading' : ''}" data-signal disabled${reading ? '' : ' hidden'}>
          <span class="signal-bars" aria-hidden="true">${bars}</span>
          <span class="signal-label">${reading ? 'Reading your question' : ''}</span>
          <span class="signal-why" hidden>${ICON.down}</span>
        </button>
        <div class="why" data-why hidden></div>
        <div class="ans-blocks"></div>
      </div>`;
    answer.append(el);
    play(el.querySelector('.bubble')!, [{ opacity: 0, transform: 'translateX(16px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: OUT });
    if (reading) play(el.querySelector('.signal')!, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 160, easing: OUT, fill: 'backwards' });
    return el;
  }

  function settleSignal(el: HTMLElement, d: Decision) {
    const signal = el.querySelector<HTMLButtonElement>('[data-signal]')!;
    const probs = new Map((d.probabilities ?? []).map((p) => [p.id, p.probability]));
    signal.classList.remove('reading');
    signal.querySelector('.signal-label')!.textContent = '';
    // The signal shows only when Jev decided: no signal for clicks, blocked or unavailable answers.
    signal.hidden = !probs.size || d.outcome === 'blocked' || d.outcome === 'unavailable';
    if (signal.hidden) return;
    const max = Math.max(0.0001, ...probs.values());
    const close = new Set(d.outcome === 'did-you-mean' ? (d.options ?? []).map((o) => o.id) : []);
    signal.querySelectorAll<HTMLElement>('.signal-bars i').forEach((b) => {
      b.style.transform = `scaleY(${Math.max(0.16, (probs.get(b.dataset.id!) ?? 0) / max)})`;
      b.classList.toggle('win', d.outcome === 'shown' && b.dataset.id === d.experience?.id);
      b.classList.toggle('close', close.has(b.dataset.id!));
    });
    const rows = [...probs.entries()].sort((a, b) => b[1] - a[1]).map(([id, p]) => `
      <li class="${d.outcome === 'shown' && id === d.experience?.id ? 'win' : ''}"><span>${esc(data.titles[id] ?? id)}</span><span>${pct(p)}</span><i style="transform: scaleX(${Math.max(0.02, p)})"></i></li>`).join('');
    el.querySelector<HTMLElement>('[data-why]')!.innerHTML =
      `<ol>${rows}</ol>${d.scope !== undefined ? `<p>Jev was ${pct(d.scope)} sure the question is about me.</p>` : ''}`;
    signal.disabled = false;
    signal.setAttribute('aria-expanded', 'false');
    signal.setAttribute('aria-label', 'Why this answer');
    signal.querySelector('.signal-why')!.removeAttribute('hidden');
  }

  // ---------- Showing a decision: the answer grows upward from the field ----------
  async function present(d: Decision, q: string, opts: { reading?: HTMLElement; push?: boolean } = {}) {
    const el = opts.reading ?? newAnswer(q, false);
    settleSignal(el, d);
    if (opts.reading) await wait(420);

    const id = d.experience?.id ?? '';
    const content = d.outcome === 'shown' ? data.content[id] : undefined;
    let html = '';
    if (content) html = content.blocks.map((b) => blockHtml(b, id)).join('');
    else if (d.outcome === 'did-you-mean') html = sayHtml(data.shared.didYouMean) + pickHtml(d.options ?? [], q);
    else html = sayHtml(d.outcome === 'blocked' ? data.shared.blocked : d.tooMany ? data.shared.tooMany : data.shared.unavailable);

    // FLIP: the bubble sits near the field while Jev reads. New content pushes it up, smoothly.
    const moving = [el.querySelector<HTMLElement>('.ans-q')!, el.querySelector<HTMLElement>('[data-signal]')!];
    const before = moving.map((m) => m.getBoundingClientRect().top);
    const blocks = el.querySelector<HTMLElement>('.ans-blocks')!;
    blocks.innerHTML = html;
    [...blocks.children].forEach((child, i) => (child as HTMLElement).style.setProperty('--b', String(i)));
    el.style.setProperty('--d0', reduced.matches ? '0ms' : '120ms');
    el.classList.add('show');
    moving.forEach((m, i) => {
      const delta = before[i] - m.getBoundingClientRect().top;
      if (!m.hidden && Math.abs(delta) > 2) play(m, [{ transform: `translateY(${delta}px)` }, { transform: 'none' }], { duration: 620, easing: MOVE });
    });

    setChips(chipsFor(d));
    input.value = '';
    input.placeholder = data.shared.placeholderNext;
    if (opts.push !== false) {
      const url = d.outcome === 'shown' && id ? `${location.pathname}?q=${encodeURIComponent(id)}` : location.pathname;
      history.pushState({ d, q }, '', url);
    }
    live.textContent = blocks.textContent?.trim().replace(/\s+/g, ' ').slice(0, 300) ?? '';
    el.querySelector<HTMLElement>('.ans-a')!.focus({ preventScroll: true });
  }

  // ---------- Actions ----------
  async function ask(raw: string) {
    if (busy) return;
    busy = true;
    send.setAttribute('aria-busy', 'true');
    const q = raw.trim();
    const pending = call({ q });
    try {
      if (root.dataset.state === 'answer') await clearAnswer();
      else await toAnswer();
      setChips('');
      const el = newAnswer(q || data.asks.who, true);
      live.textContent = 'Reading your question.';
      const [d] = await Promise.all([pending, wait(q ? 700 : 300)]);
      await present(d, q || data.asks.who, { reading: el });
    } finally {
      busy = false;
      send.removeAttribute('aria-busy');
    }
  }

  async function open(id: string, via: string, from: string, q: string, label: string) {
    if (busy) return;
    busy = true;
    const pending = call({ open: id, via, from, q: q || undefined });
    try {
      if (root.dataset.state === 'answer') await clearAnswer();
      else await toAnswer();
      await present(await pending, label || data.asks[id] || '');
    } finally {
      busy = false;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ask(input.value);
  });

  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const opener = target.closest<HTMLElement>('[data-open]');
    if (opener) {
      closeMenu();
      const d = opener.dataset;
      open(d.open!, d.via ?? '', d.from ?? '', d.q ?? '', d.label ?? '');
      return;
    }
    if (target.closest('[data-reset]')) {
      toLanding();
      return;
    }
    const signal = target.closest<HTMLButtonElement>('[data-signal]');
    if (signal?.hasAttribute('aria-expanded')) {
      const why = signal.parentElement!.querySelector<HTMLElement>('[data-why]')!;
      const opened = signal.getAttribute('aria-expanded') === 'true';
      signal.setAttribute('aria-expanded', String(!opened));
      why.hidden = opened;
      if (!opened) play(why, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: OUT });
      return;
    }
    // A card into a story: everything else fades, the card rises, then the browser navigates.
    const door = target.closest<HTMLAnchorElement>('a[data-door]');
    const me = e as MouseEvent;
    if (door && !reduced.matches && !me.metaKey && !me.ctrlKey && !me.shiftKey && !me.altKey && me.button === 0) {
      e.preventDefault();
      root.querySelectorAll('.ans-q, .signal, .ans-blocks > *, .pcard, [data-dock]').forEach((n) => {
        if (n !== door && !n.contains(door)) n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: OUT, fill: 'forwards' });
      });
      door.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-24px) scale(1.02)' }], { duration: 560, delay: 160, easing: MOVE, fill: 'forwards' })
        .finished.then(() => { location.href = door.href; });
    }
  });

  window.addEventListener('popstate', async (e) => {
    const view = e.state as { d: Decision; q: string } | null;
    if (view?.d) {
      if (root.dataset.state === 'answer') await clearAnswer();
      else await toAnswer();
      await present(view.d, view.q, { push: false });
    } else {
      await toLanding(false);
    }
  });

  // A shared link (?q=projects) opens that answer directly.
  const start = new URLSearchParams(location.search).get('q');
  if (start && data.content[start]) {
    root.dataset.state = 'answer';
    call({ open: start }).then((d) => present(d, data.asks[start] ?? '', { push: false }).then(() => history.replaceState({ d, q: data.asks[start] }, '', location.href)));
  }
  root.dataset.ready = 'true';
}
