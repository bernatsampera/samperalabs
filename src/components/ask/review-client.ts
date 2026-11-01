// The review page: renders every answer with the same code as the home page, plus a comment box for each.

import type { AnswerContent } from '../../lib/ask/content';
import { blockHtml, bubbleHtml, esc, ICON, pickHtml, sayHtml, type Option } from './render';

type Item = { id: string; title: string; question: string; note: string; say?: string; chips: { id: string; ask: string }[]; options?: Option[] };
type Data = { content: Record<string, AnswerContent>; shared: Record<string, string>; items: Item[]; previous: Record<string, { comment: string }> };

const data: Data = JSON.parse(document.getElementById('rv-data')!.textContent!);
const list = document.querySelector<HTMLElement>('[data-list]')!;
const index = document.querySelector<HTMLElement>('[data-index]')!;

function answerHtml(item: Item) {
  const content = data.content[item.id];
  const blocks = content
    ? content.blocks.map((b) => blockHtml(b, item.id)).join('')
    : sayHtml(item.say ?? '') + (item.options ? pickHtml(item.options, item.question) : '');
  const chips = item.chips.map((c) => `<span class="pill">${esc(c.ask)}</span>`).join('');
  return `
    <div class="ask ask-static" data-state="answer">
      <div class="ans show">${bubbleHtml(item.question)}<div class="ans-a"><div class="ans-blocks">${blocks}</div></div></div>
      <div class="rv-chips"><small>Chips above the field</small>${chips}<span class="pill ghost">${ICON.back}${esc(data.shared.startOver)}</span></div>
    </div>`;
}

function commentHtml(id: string, label: string, value: string) {
  return `<div class="rv-comment">
    <label for="c-${esc(id)}">${esc(label)}</label>
    <textarea id="c-${esc(id)}" data-comment="${esc(id)}" placeholder="What should change?">${esc(value)}</textarea>
    <p class="rv-status" data-status="${esc(id)}" aria-live="polite"></p>
    ${data.previous[id]?.comment ? `<details class="rv-prev"><summary>Your comment last round</summary><p>${esc(data.previous[id].comment)}</p></details>` : ''}
  </div>`;
}

async function start() {
  const saved: Record<string, { comment: string }> = await fetch('/api/ask-review').then((r) => r.json()).catch(() => ({}));
  const has = (id: string) => (saved[id]?.comment ?? '').trim().length > 0;

  index.innerHTML = [{ id: 'overall', title: 'Overall' }, ...data.items]
    .map((it) => `<a href="#rv-${esc(it.id)}" data-link="${esc(it.id)}" class="${has(it.id) ? 'has' : ''}">${esc(it.title)}</a>`).join('');

  list.innerHTML = `<section class="rv-overall" id="rv-overall">${commentHtml('overall', 'Overall comment, for all answers', saved.overall?.comment ?? '')}</section>` +
    data.items.map((it, i) => `
      <section class="rv-item" id="rv-${esc(it.id)}">
        <div class="rv-meta">
          <span class="rv-num">${String(i + 1).padStart(2, '0')}</span>
          <h2>${esc(it.title)}</h2>
          <span class="rv-q">Example question: <b>${esc(it.question)}</b></span>
          <span class="rv-note">${esc(it.note)}</span>
        </div>
        <div class="rv-frame">${answerHtml(it)}</div>
        ${commentHtml(it.id, `Comment on "${it.title}"`, saved[it.id]?.comment ?? '')}
      </section>`).join('');

  // Buttons inside the answers are only a picture here.
  list.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.rv-frame button, .rv-frame a[data-door]')) e.preventDefault();
  });

  const timers = new Map<string, number>();
  list.addEventListener('input', (e) => {
    const box = (e.target as HTMLElement).closest<HTMLTextAreaElement>('[data-comment]');
    if (!box) return;
    const id = box.dataset.comment!;
    const status = list.querySelector<HTMLElement>(`[data-status="${id}"]`)!;
    status.className = 'rv-status';
    status.textContent = 'Saving...';
    clearTimeout(timers.get(id));
    timers.set(id, window.setTimeout(async () => {
      try {
        const r = await fetch('/api/ask-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, comment: box.value }) });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        status.textContent = box.value.trim() ? 'Saved.' : 'Comment removed.';
        index.querySelector(`[data-link="${id}"]`)?.classList.toggle('has', box.value.trim().length > 0);
      } catch (error) {
        status.className = 'rv-status bad';
        status.textContent = `Not saved: ${(error as Error).message}. Copy your text before you leave.`;
      }
    }, 700));
  });
  document.documentElement.dataset.ready = 'true';
}
start();
