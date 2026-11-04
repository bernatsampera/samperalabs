// Shared content and behaviour for the home page options.
// Content comes from the same files as the story view:
//   ../world/journey/data.js          (person, principles, both journeys, products)
//   ../world/journey/guided/data.js   (MAAT seasons and chapters, as in flyover-2.html)
// Each option page builds its own layout from the parts below, then calls HomeKit.start().

(() => {
'use strict';

const W = window.WORLD;
const G = window.GUIDED;
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const OUT = 'cubic-bezier(.22, 1, .36, 1)';
const CINE = 'cubic-bezier(.65, 0, .35, 1)';

// While JS prepares the intro, intro items stay hidden. Without JS they show at once.
root.dataset.state = 'loading';

const STORY_URL = '../world/journey/guided/flyover-2.html';

const esc = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const month = (date, style = 'long') => date === 'next'
  ? 'Next'
  : new Intl.DateTimeFormat('en', {month: style, year: 'numeric', timeZone: 'UTC'}).format(new Date(date + '-01T00:00:00Z'));
const monthOnly = date => new Intl.DateTimeFormat('en', {month: 'short', timeZone: 'UTC'}).format(new Date(date + '-01T00:00:00Z'));
const monthIndex = date => { const [y, m] = date.split('-').map(Number); return y * 12 + m - 1; };

const maat = W.journeys.find(j => j.id === 'maat');
const memory = W.journeys.find(j => j.id === 'knowledge');
const latest = G.chapters.find(c => c.latest);
const seasons = G.seasons.map(s => ({...s, chapters: G.chapters.filter(c => c.season === s.id)}));

const person = {
  name: W.person.name,
  role: 'AI engineer focused on context',
  motto: W.person.motto,
  mottoLong: W.person.mottoLong,
  notDev: W.person.about[0],
  now: W.person.about[1],
};

const seasonDates = s => s.to
  ? `${monthOnly(s.from)} to ${month(s.to, 'short')}`
  : `Since ${month(s.from, 'short')}`;
const seasonMeta = s => `${seasonDates(s)}. ${s.chapters.length} ${s.chapters.length === 1 ? 'chapter' : 'chapters'}. ${s.status === 'done' ? 'Done' : 'Ongoing'}.`;
const seasonVars = s => `--s-light: var(--season-${s.id}-light); --s-dark: var(--season-${s.id}-dark); --s-tint: var(--season-${s.id}-tint);`;

const EXTERNAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

const parts = {
  // The three MAAT seasons on a 2026 month axis, ending at the newest chapter.
  seasonStrip() {
    const first = Math.min(...seasons.map(s => monthIndex(s.from)));
    const last = monthIndex(latest.date);
    const months = last - first + 1;
    const labels = Array.from({length: months}, (_, i) => {
      const y = Math.floor((first + i) / 12), m = (first + i) % 12 + 1;
      return monthOnly(`${y}-${String(m).padStart(2, '0')}`);
    });
    const rows = seasons.map((s, i) => {
      const start = monthIndex(s.from) - first + 1;
      const end = s.to ? monthIndex(s.to) - first + 2 : months + 1;
      const row = i + 1;
      // A bar that starts late leaves room on its left: the name sits there, outside the bar.
      const outside = start > 2;
      return (outside
        ? `<span class="strip-out" style="grid-row: ${row}; grid-column: 1 / ${start};">${esc(s.name)}</span>`
        : '') +
        `<span class="strip-bar${s.to ? '' : ' open'}" style="${seasonVars(s)} grid-row: ${row}; grid-column: ${start} / ${end};">` +
        (outside ? '' : `<span>${esc(s.name)}</span>`) + `</span>`;
    }).join('');
    return `<div class="strip" style="--months: ${months};" role="img" aria-label="${esc(seasons.map(s => `${s.name}: ${seasonDates(s)}`).join('. '))}.">
      ${rows}
      <div class="strip-axis" style="grid-row: ${seasons.length + 1};" aria-hidden="true">${labels.map((l, i) => i === months - 1 ? `<span>${l} <b>Now</b></span>` : `<span>${l}</span>`).join('')}</div>
    </div>`;
  },

  // The three MAAT seasons as a list: name, question, dates.
  seasonList(level = 3) {
    return `<ol class="seasons">${seasons.map(s => `
      <li class="season" style="${seasonVars(s)}">
        <div>
          <h${level} class="season-name">${esc(s.name)}</h${level}>
          <p class="season-mission">${esc(s.mission)}</p>
          <p class="season-meta">${esc(seasonMeta(s))}</p>
        </div>
      </li>`).join('')}
    </ol>`;
  },

  latestChapter() {
    return `<div class="latest"><span class="latest-dot" aria-hidden="true"></span>
      <p>Newest chapter: ${esc(latest.title)} <span>(${esc(month(latest.date))})</span></p></div>`;
  },

  // "AI has no memory": the chapters in date order. The last one is next.
  memoryChapters({titles = 'title'} = {}) {
    const list = [...memory.chapters].sort((a, b) => (a.date === 'next' ? '9999' : a.date).localeCompare(b.date === 'next' ? '9999' : b.date));
    return `<ol class="chapters">${list.map(c => `
      <li class="chapter${c.status === 'next' ? ' next' : ''}${c.status === 'latest' ? ' now' : ''}">
        <p><span class="chapter-title">${esc(c[titles])}</span>
        <span class="chapter-date">${esc(c.status === 'next' ? 'Next' : month(c.date))}</span></p>
      </li>`).join('')}
    </ol>`;
  },

  soon() {
    return '<p class="soon">The story of this journey is coming soon.</p>';
  },

  principles(level = 3) {
    return W.principles.map(p => `
      <li class="principle">
        <h${level} class="principle-title">${esc(p.title)}</h${level}>
        <p class="principle-explain">${esc(p.explain)}</p>
        <p class="principle-example"><b>Example:</b> ${esc(p.example)}</p>
      </li>`).join('');
  },

  products() {
    return W.products.map(p => `
      <li><a class="product" href="${esc(p.href)}" target="_blank" rel="noopener noreferrer">
        <span><strong>${esc(p.name)}</strong> <span class="product-line">${esc(p.line)}</span></span>${EXTERNAL}
        <span class="sr-only">(opens in a new tab)</span>
      </a></li>`).join('');
  },

  // The one way into the story view. The closest [data-panel] grows into it.
  enter(className = 'btn btn-light') {
    return `<a class="${className}" href="${STORY_URL}" data-enter>Enter the MAAT journey</a>`;
  },

  footer() {
    return `<footer class="foot"><span>${esc(person.name)}, ${esc(person.role)}</span><span>${esc(person.motto)}</span></footer>`;
  },
};

// The guided move into the story view: the panel grows to fill the screen,
// turns into the paper of the story view start screen, then the browser navigates.
function wireEnter() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-enter]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (reduced.matches || root.dataset.state === 'leaving') return;
    e.preventDefault();
    leave(link.href, link.closest('[data-panel]') || link);
  });
  addEventListener('pageshow', e => {
    if (!e.persisted) return;
    document.querySelectorAll('.guided-cover').forEach(n => n.remove());
    root.dataset.state = 'idle';
  });
}

function leave(href, from) {
  root.dataset.state = 'leaving';
  const r = from.getBoundingClientRect();
  const cs = getComputedStyle(from);
  const clip = [r.top, innerWidth - r.right, innerHeight - r.bottom, r.left].map(v => Math.max(0, v) + 'px').join(' ');
  const radius = cs.borderTopLeftRadius || '0px';

  const color = document.createElement('div');
  color.className = 'guided-cover';
  Object.assign(color.style, {inset: '0', backgroundColor: cs.backgroundColor, backgroundImage: cs.backgroundImage, backgroundSize: cs.backgroundSize});
  const paper = document.createElement('div');
  paper.className = 'guided-cover to-paper';
  Object.assign(paper.style, {inset: '0', opacity: '0'});
  document.body.append(color);

  // The mission stays in place while the panel grows, so the visitor sees what opens.
  const mission = from.querySelector('[data-maat-mission]');
  if (mission) {
    const mr = mission.getBoundingClientRect();
    const ms = getComputedStyle(mission);
    const ghost = document.createElement('p');
    ghost.className = 'guided-cover';
    ghost.textContent = mission.textContent;
    Object.assign(ghost.style, {left: mr.left + 'px', top: mr.top + 'px', width: mr.width + 'px', margin: '0', font: ms.font, letterSpacing: ms.letterSpacing, color: ms.color, textWrap: ms.textWrap, maxWidth: ms.maxWidth});
    document.body.append(ghost);
  }
  document.body.append(paper);

  const grow = color.animate([{clipPath: `inset(${clip} round ${radius})`}, {clipPath: 'inset(0px 0px 0px 0px round 0px)'}], {duration: 560, easing: CINE, fill: 'forwards'});
  grow.finished.then(() => paper.animate([{opacity: 0}, {opacity: 1}], {duration: 240, easing: OUT, fill: 'forwards'}).finished)
    .then(() => { location.href = href; });
}

// One orchestrated intro on load: items marked [data-intro] rise in, in document order.
async function start() {
  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* fonts are optional */ }
  wireEnter();
  const items = [...document.querySelectorAll('[data-intro]')];
  root.dataset.state = 'intro';
  if (!reduced.matches) {
    const anims = items.map((el, i) => el.animate(
      [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}],
      {duration: 650, delay: 60 + i * 90, easing: OUT, fill: 'backwards'}));
    await Promise.all(anims.map(a => a.finished)).catch(() => {});
  }
  root.dataset.state = 'idle';
}

window.HomeKit = {W, G, esc, month, person, maat, memory, seasons, latest, parts, STORY_URL, start, reduced};
})();
