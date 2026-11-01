// HTML for answers. Shared by the home component (ask-client.ts) and the review page (review-client.ts),
// so the review shows exactly what visitors see.

import type { Block, Card } from '../../lib/ask/content';

export type Option = { id: string; title: string; ask: string; probability?: number };

export const esc = (v: unknown) =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const month = (ym: string) =>
  new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${ym}-01T00:00:00Z`));
export const pct = (p: number) => `${Math.round(p * 100)}%`;

export const ICON = {
  right: '<svg class="ico" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>',
  back: '<svg class="ico" viewBox="0 0 12 12" aria-hidden="true"><path d="M7.5 2.5 4 6l3.5 3.5"/></svg>',
  out: '<svg class="ico" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 8l4-4M4.5 4H8v3.5"/></svg>',
  down: '<svg class="ico" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5l3-3"/></svg>',
};

/** Data attributes for anything that opens an answer directly. `label` is what the question bubble shows. */
export const go = (id: string, via: string, label: string, from = '', q = '') =>
  `data-open="${esc(id)}" data-via="${esc(via)}" data-label="${esc(label)}" data-from="${esc(from)}"${q ? ` data-q="${esc(q)}"` : ''}`;

/** The visitor's question, as a chat message on the right. */
export const bubbleHtml = (q: string) => `<div class="ans-q"><p class="bubble">${esc(q)}</p></div>`;

const host = (url: string) => new URL(url).hostname.replace(/^www\./, '');

/** One project card. Used by blockHtml here and by the home page "Also built" section. */
export function cardHtml(c: Card, j: number, from: string) {
  const inner = `
    <span class="pcard-media"><img src="${esc(c.image)}" alt="${esc(c.alt)}" loading="lazy" decoding="async"></span>
    <span class="pcard-text">
      <span class="pcard-title">${esc(c.title)}</span>
      <span class="pcard-line">${esc(c.line)}</span>
      ${c.href ? `<span class="pcard-meta">${esc(host(c.href))}</span>` : ''}
    </span>
    <span class="pcard-go" aria-hidden="true">${c.href ? ICON.out : ICON.right}</span>`;
  const style = `style="--j:${j}"`;
  if (c.door) return `<a class="pcard" ${style} href="${esc(c.door)}" data-door data-umami-event="enter" data-umami-event-from="${esc(from)}" data-umami-event-to="story">${inner}</a>`;
  if (c.href) return `<a class="pcard" ${style} href="${esc(c.href)}" target="_blank" rel="noopener">${inner}<span class="sr-only">(opens in a new tab)</span></a>`;
  return `<button type="button" class="pcard" ${style} ${go(c.open!, 'follow-up', c.title, from)}>${inner}</button>`;
}

export function blockHtml(b: Block, from: string): string {
  switch (b.kind) {
    case 'text':
      return `<div class="b-text">${b.paragraphs.map((p, j) => `<p style="--j:${j}">${esc(p)}</p>`).join('')}</div>`;
    case 'cards':
      return `<div class="b-cards${b.cards.length === 1 ? ' one' : ''}">${b.cards.map((c, j) => cardHtml(c, j, from)).join('')}</div>`;
    case 'list':
      return `<div class="b-list">${b.articles.map((a, j) => `
        <a href="https://samperalabs.com/posts/${esc(a.slug)}/" target="_blank" rel="noopener" style="--j:${j}">
          <time datetime="${esc(a.date)}">${esc(month(a.date))}</time><span>${esc(a.title)}</span>${ICON.out}
        </a>`).join('')}</div>`;
  }
}

/** A short line of plain text, for "Did you mean", blocked and unavailable. */
export const sayHtml = (text: string) => `<div class="b-text"><p style="--j:0">${esc(text)}</p></div>`;

/** "Did you mean": Jev's close options, each with its probability. */
export const pickHtml = (options: Option[], q: string) => `<div class="b-pick">${options.map((o, j) => `
  <button type="button" style="--j:${j}" ${go(o.id, 'did-you-mean', q, '', q)}>
    <span><span class="pick-title">${esc(o.title)}</span><span class="pick-ask">${esc(o.ask)}</span></span>
    <span class="pick-p">${o.probability !== undefined ? `<i style="--p:${o.probability}"></i>${pct(o.probability)}` : ''}</span>
    ${ICON.right}
  </button>`).join('')}</div>`;
