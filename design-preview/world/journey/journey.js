(() => {
'use strict';

const W = window.WORLD;
const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileQuery = matchMedia('(max-width: 760px)');

const esc = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const sortKey = date => (date === 'next' ? '9999-99' : date);
const sorted = j => [...j.chapters].sort((a, b) => sortKey(a.date).localeCompare(sortKey(b.date)));
const newest = j => {
  const list = sorted(j);
  return list.find(c => c.status === 'latest') || list.filter(c => c.status !== 'next').at(-1) || list[0];
};
const month = (date, style = 'long') => date === 'next'
  ? 'Next'
  : new Intl.DateTimeFormat('en', {month: style, year: 'numeric', timeZone: 'UTC'}).format(new Date(date + '-01T00:00:00Z'));
const storyUrl = (j, c) => 'story.html?w=' + encodeURIComponent(j.id) + (c ? '#' + encodeURIComponent(c.id) : '');
const chapterUrl = (j, c) => 'chapter.html?w=' + encodeURIComponent(j.id) + '&c=' + encodeURIComponent(c.id);
const journey = W.journeys.find(j => j.id === params.get('w')) || W.journeys[0];

const footer = () => `
  <footer class="footer">
    <a href="home.html">${esc(W.person.name)}</a>
    <nav aria-label="Journeys">${W.journeys.map(j => `<a href="${storyUrl(j)}">${esc(j.name)}</a>`).join('')}</nav>
  </footer>`;

// A horizontal route of all chapters, ending at the mission.
function miniRoute(j, {link, current} = {}) {
  const now = newest(j);
  const items = sorted(j).map((c, i) => {
    const classes = [c.id === now.id && 'is-now', c.status === 'next' && 'is-next', current && c.id === current.id && 'is-current'].filter(Boolean).join(' ');
    const date = (c.id === now.id ? '<span class="now-pill">Now</span> ' : '') + esc(month(c.date, 'short'));
    const inner = `<span class="mini-node">${i + 1}</span><span class="mini-label">${esc(c.short)}</span><span class="mini-date">${date}</span>`;
    const here = current && c.id === current.id ? ' aria-current="page"' : '';
    return `<li class="${classes}">${link ? `<a href="${link(c)}"${here}>${inner}</a>` : inner}</li>`;
  }).join('');
  return `<ol class="mini-route">${items}<li class="mini-goal"><span class="mini-node">?</span><span class="mini-label">Mission</span></li></ol>`;
}

function home() {
  const [main, ...others] = W.journeys;
  const words = W.person.motto.split(' ');
  const motto = esc(words.slice(0, -1).join(' ')) + ' <span class="hl">' + esc(words.at(-1)) + '</span>';
  const card = (j, primary) => `
    <article class="journey-card ${primary ? 'primary' : 'secondary'}" data-id="${esc(j.id)}">
      <h3 class="card-name">${esc(j.name)}</h3>
      <p class="card-mission"><span class="label">Mission</span>${esc(j.mission)}</p>
      <p class="card-context">${esc(j.context)}</p>
      ${miniRoute(j, {link: c => storyUrl(j, c)})}
      <a class="button ${primary ? 'button-sun' : 'button-blue'}" href="${storyUrl(j)}">Follow the journey <span aria-hidden="true">→</span></a>
    </article>`;

  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="home.html">${esc(W.person.name)}</a>
      <nav aria-label="Main">${W.journeys.map(j => `<a href="${storyUrl(j)}">${esc(j.name)}</a>`).join('')}<a href="#about">About</a></nav>
    </header>
    <main id="main">
      <section class="hero">
        <p class="label">${esc(W.person.name)}, ${esc(W.person.role)}</p>
        <h1>${motto}</h1>
        <p class="hero-lead">${esc(W.person.line)} ${esc(W.person.mottoLong)}</p>
      </section>
      <section class="section journeys" aria-labelledby="journeys-title">
        <h2 class="section-label" id="journeys-title">What I am working on</h2>
        ${card(main, true)}
        ${others.map(j => card(j, false)).join('')}
      </section>
      <section class="section products" aria-labelledby="products-title">
        <h2 class="section-label" id="products-title">Also built</h2>
        <ul>${W.products.map(p => `
          <li><a href="${esc(p.href)}" target="_blank" rel="noopener noreferrer">
            <strong>${esc(p.name)}</strong><span>${esc(p.line)}</span><span class="out" aria-hidden="true">↗</span>
            <span class="sr-only">(opens in a new tab)</span>
          </a></li>`).join('')}
        </ul>
      </section>
      <section class="section about" id="about" aria-labelledby="about-title">
        <h2 class="section-label" id="about-title">About</h2>
        <div class="about-body">
          <p class="about-lead">${esc(W.person.about[0])}</p>
          ${W.person.about.slice(1).map(p => `<p>${esc(p)}</p>`).join('')}
        </div>
      </section>
      <section class="section principles" aria-labelledby="principles-title">
        <h2 class="section-label" id="principles-title">How I think about AI</h2>
        <ol>${W.principles.map(p => `
          <li class="principle">
            <button type="button" aria-expanded="false" aria-controls="principle-${p.n}">
              <span class="p-num">${p.n}</span><span class="p-title">${esc(p.title)}</span><span class="p-icon" aria-hidden="true">+</span>
            </button>
            <div class="p-body" id="principle-${p.n}" hidden>
              <p>${esc(p.explain)}</p>
              <p class="p-example"><strong>Example:</strong> ${esc(p.example)}</p>
            </div>
          </li>`).join('')}
        </ol>
      </section>
    </main>
    ${footer()}`;

  const buttons = [...document.querySelectorAll('.principle button')];
  buttons.forEach(button => button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    buttons.forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      document.getElementById(other.getAttribute('aria-controls')).hidden = true;
    });
    if (!open) {
      button.setAttribute('aria-expanded', 'true');
      document.getElementById(button.getAttribute('aria-controls')).hidden = false;
    }
  }));
}

const ICONS = {
  heads: '<circle cx="20" cy="24" r="8"/><circle cx="44" cy="24" r="8"/><path d="M7 49c2-10 8-15 15-15s13 5 15 15M31 49c2-10 8-15 15-15 6 0 11 4 13 12"/>',
  brain: '<path d="M20 49c-8 0-11-8-7-13-7-6-2-16 6-15 0-8 11-11 15-4 5-6 16-2 14 6 8 1 11 11 5 16 4 7-3 15-11 13H20Z"/><path d="M32 17v31M20 22c8 0 7 8 12 8M44 25c-7 0-6 7-12 7M20 39c5-1 7 3 7 8M45 39c-5-1-7 3-7 8"/>',
  tree: '<circle cx="32" cy="13" r="5"/><circle cx="17" cy="31" r="5"/><circle cx="47" cy="31" r="5"/><circle cx="10" cy="50" r="5"/><circle cx="26" cy="50" r="5"/><circle cx="40" cy="50" r="5"/><circle cx="55" cy="50" r="5"/><path d="M32 18v6M17 26v-4h30v4M17 36v7M47 36v7M10 43h16M40 43h15"/>',
  photo: '<rect x="9" y="14" width="46" height="37" rx="4"/><circle cx="22" cy="26" r="5"/><path d="m13 46 12-12 8 8 7-7 11 11M22 9h20"/>',
  chat: '<path d="M9 14h46v31H31l-12 9v-9H9Z"/><path d="M19 26h26M19 34h18"/>',
  blank: '<path d="M15 8h27l10 10v38H15Z"/><path d="M42 8v11h10M23 32h21M23 41h15"/>',
  files: '<path d="M12 18h17l5 6h19v31H12Z"/><path d="M17 10h17l5 6h14v8M20 35h24M20 44h18"/>',
  map: '<path d="m8 16 16-7 16 7 16-7v40l-16 7-16-7-16 7Z"/><path d="M24 9v40M40 16v40M32 23c0-5 8-5 8 0 0 5-4 8-4 8s-4-3-4-8Z"/>',
  save: '<path d="M11 9h38l7 7v39H11Z"/><path d="M20 9v16h27V9M20 55V36h27v19M27 18h13"/>',
  question: '<circle cx="32" cy="32" r="24"/><path d="M23 24c1-8 17-10 19 0 2 9-10 9-10 17M32 49v1"/>',
};
const icon = name => `<svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[name] || ICONS.question}</svg>`;

function story() {
  const list = sorted(journey);
  const now = newest(journey);
  const other = W.journeys.find(j => j !== journey);
  const started = list.find(c => c.date !== 'next');
  document.title = journey.name + ' | Bernat Sampera';

  const index = list.map((c, i) => `
    <li><a href="#${esc(c.id)}" data-index="${esc(c.id)}" class="${c.id === now.id ? 'is-now' : ''}">
      <span class="jr-index-num">${i + 1}</span>
      <span class="jr-index-text"><strong>${esc(c.short)}</strong><time>${esc(month(c.date, 'short'))}</time></span>
    </a></li>`).join('');

  const steps = list.map((c, i) => {
    const classes = ['jr-step', c.id === now.id && 'is-now', c.status === 'next' && 'is-next'].filter(Boolean).join(' ');
    return `
      <article class="${classes}" id="${esc(c.id)}" data-chapter="${esc(c.id)}">
        <p class="jr-date" aria-hidden="true">${esc(c.date === 'next' ? 'Next' : month(c.date, 'short'))}</p>
        <div class="jr-badge">${icon(c.icon)}</div>
        <div class="jr-card">
          ${c.id === now.id ? '<p class="jr-here">You are here</p>' : ''}
          <p class="jr-meta"><span>Chapter ${i + 1}</span><span>${esc(month(c.date))}</span>${c.status === 'next' ? '<span>To be continued</span>' : ''}</p>
          <h2>${esc(c.title)}</h2>
          <div class="jr-simple">${c.simple.map(s => `<p>${esc(s)}</p>`).join('')}</div>
          <p class="jr-learned"><strong>What I learned</strong>${esc(c.learned)}</p>
          <a class="jr-more full-chapter" href="${chapterUrl(journey, c)}">Read the full chapter <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
  }).join('');

  app.innerHTML = `
    <header class="jr-bar">
      <a class="jr-bar-link" href="home.html"><span aria-hidden="true">←</span> Home</a>
      <button class="jr-start" id="first-control" type="button">Start at the beginning</button>
      <a class="jr-bar-link jr-other" href="${storyUrl(other)}">${esc(other.name)} <span aria-hidden="true">→</span></a>
      <span class="jr-progress" aria-hidden="true"></span>
    </header>
    <main id="main">
      <header class="jr-hero">
        <p class="jr-eyebrow">${esc(journey.name)}</p>
        <h1>${esc(journey.mission)}</h1>
        <p class="jr-intro">${esc(journey.context)}</p>
        <p class="jr-facts">
          <span><strong>${list.filter(c => c.status !== 'next').length}</strong> chapters so far</span>
          <span>Since <strong>${esc(month(started.date))}</strong></span>
          <span>Last stop: <strong>${esc(now.short)}</strong></span>
        </p>
      </header>
      <div class="jr-layout">
        <nav class="jr-index" aria-label="Chapters in time order"><h2>Chapters</h2><ol>${index}</ol></nav>
        <section class="jr-trail" id="trail" aria-label="The journey">
          <svg class="jr-line" aria-hidden="true">
            <defs><mask id="trail-reveal" maskUnits="userSpaceOnUse"><path class="jr-reveal" pathLength="1"/></mask></defs>
            <path class="jr-band"/><path class="jr-under"/><path class="jr-dots" mask="url(#trail-reveal)"/>
          </svg>
          <div class="jr-steps">${steps}</div>
          <section class="jr-end" id="mission-end" aria-labelledby="mission-end-title">
            <div class="jr-badge jr-goal">${icon('question')}</div>
            <p class="jr-eyebrow">The mission</p>
            <h2 id="mission-end-title">${esc(journey.mission)}</h2>
            <p>The journey continues. New chapters appear here as I learn.</p>
          </section>
        </section>
      </div>
    </main>
    ${footer()}`;

  const trail = document.getElementById('trail');
  const svg = trail.querySelector('svg');
  const stepEls = [...trail.querySelectorAll('.jr-step')];
  const badges = [...trail.querySelectorAll('.jr-badge')];

  // A winding path through the badge of every chapter, ending at the mission.
  function drawTrail() {
    const root = trail.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${root.width} ${root.height}`);
    const points = badges.map(b => {
      const r = b.getBoundingClientRect();
      return [r.left - root.left + r.width / 2, r.top - root.top + r.height / 2];
    });
    const swing = mobileQuery.matches ? 0 : root.width * 0.16;
    let d = `M${points[0][0]} 0 L${points[0].join(' ')}`;
    points.slice(1).forEach(([x, y], i) => {
      const [px, py] = points[i];
      const bend = px + (i % 2 ? -swing : swing);
      const mid = (py + y) / 2;
      d += ` C${px} ${py + (y - py) * 0.25},${bend} ${mid - 50},${bend} ${mid} S${x} ${y - (y - py) * 0.25},${x} ${y}`;
    });
    svg.querySelectorAll('path').forEach(p => p.setAttribute('d', d));
  }
  new ResizeObserver(drawTrail).observe(trail);
  document.fonts.ready.then(drawTrail);

  // The dotted trail and the progress bar follow the scroll.
  const progressBar = document.querySelector('.jr-progress');
  const onScroll = () => {
    const r = trail.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / (r.height - innerHeight * 0.3)));
    document.documentElement.style.setProperty('--trail-offset', reduced ? '0' : String(1 - progress));
    progressBar.style.transform = `scaleX(${progress})`;
  };
  addEventListener('scroll', onScroll, {passive: true});
  onScroll();

  const goTo = (el, smooth) => el.scrollIntoView({behavior: smooth && !reduced ? 'smooth' : 'instant', block: 'center'});
  document.getElementById('first-control').addEventListener('click', () => {
    history.replaceState(null, '', storyUrl(journey, list[0]));
    goTo(stepEls[0], true);
  });
  document.querySelectorAll('.jr-index a').forEach(a => a.addEventListener('click', event => {
    event.preventDefault();
    history.replaceState(null, '', '#' + a.dataset.index);
    goTo(document.getElementById(a.dataset.index), true);
  }));

  const links = [...document.querySelectorAll('[data-index]')];
  const observer = new IntersectionObserver(entries => {
    const seen = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!seen) return;
    links.forEach(a => {
      const active = a.dataset.index === seen.target.id;
      a.setAttribute('aria-current', String(active));
      if (active && mobileQuery.matches) {
        const strip = document.querySelector('.jr-index ol');
        strip.scrollLeft = a.parentElement.offsetLeft - strip.clientWidth / 2 + a.parentElement.offsetWidth / 2;
      }
    });
  }, {rootMargin: '-30% 0px -40% 0px', threshold: [0, 0.3, 0.6]});
  stepEls.forEach(el => observer.observe(el));

  const enter = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    goTo(document.getElementById(list.some(c => c.id === id) ? id : now.id), false);
    onScroll();
  };
  document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(enter)));
}

function chapter() {
  const list = sorted(journey);
  const c = list.find(x => x.id === params.get('c')) || list[0];
  const i = list.indexOf(c);
  const prev = list[i - 1];
  const next = list[i + 1];
  const back = storyUrl(journey, c);
  document.title = c.title + ' | ' + journey.name;
  const pagerLink = (x, kind) => x
    ? `<a class="pager-${kind}" href="${chapterUrl(journey, x)}"><span class="label">${kind === 'prev' ? '← Previous chapter' : 'Next chapter →'}</span><strong>${esc(x.title)}</strong><span class="pager-date">${esc(month(x.date))}</span></a>`
    : '<span></span>';
  app.innerHTML = `
    <header class="topbar dark sticky chapter-bar">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="home.html">Home</a><span aria-hidden="true">/</span>
        <a href="${storyUrl(journey)}">${esc(journey.name)}</a><span aria-hidden="true">/</span>
        <span aria-current="page">Chapter ${i + 1}</span>
      </nav>
      <a class="button button-coral back-journey" href="${back}">Back to the journey</a>
    </header>
    <main id="main" class="chapter">
      <header class="chapter-hero">
        <div class="wrap">
          <p class="label"><span>Chapter ${i + 1} of ${list.length}</span><span>${esc(month(c.date))}</span></p>
          <h1>${esc(c.title)}</h1>
          <p class="part-of">Part of the mission: <strong>${esc(journey.mission)}</strong></p>
        </div>
      </header>
      <div class="wrap chapter-body">
        <div class="chapter-lead">${c.simple.map(s => `<p>${esc(s)}</p>`).join('')}</div>
        <section class="where" aria-label="Where this chapter sits in the journey">
          <p class="label">Where this sits in the journey</p>
          ${miniRoute(journey, {link: x => chapterUrl(journey, x), current: c})}
        </section>
        ${c.sections.map(s => `<section class="chapter-section"><h2>${esc(s.h)}</h2><p>${esc(s.p)}</p></section>`).join('')}
        <blockquote class="learned-quote"><p class="label">What I learned</p><p>${esc(c.learned)}</p></blockquote>
        ${c.article ? `<aside class="article-link"><p class="label">Read the full article</p><a href="${esc(c.article.href)}">${esc(c.article.title)} <span aria-hidden="true">→</span></a></aside>` : ''}
        ${c.status === 'next' ? '<p class="progress-note">This chapter is still in progress.</p>' : ''}
        <nav class="pager" aria-label="Other chapters">${pagerLink(prev, 'prev')}${pagerLink(next, 'next')}</nav>
      </div>
    </main>
    ${footer()}`;

  const strip = document.querySelector('.mini-route');
  const current = strip.querySelector('.is-current');
  if (strip.scrollWidth > strip.clientWidth) strip.scrollLeft = current.offsetLeft - strip.clientWidth / 2 + current.offsetWidth / 2;
}

const page = document.body.dataset.page;
if (page === 'story') story();
else if (page === 'chapter') chapter();
else home();

const bar = document.querySelector('.topbar, .jr-bar');
new ResizeObserver(() => document.documentElement.style.setProperty('--bar-h', bar.offsetHeight + 'px')).observe(bar);
})();
