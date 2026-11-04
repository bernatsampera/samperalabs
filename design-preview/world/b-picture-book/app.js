(function () {
  'use strict';

  const data = window.WORLD;
  const main = document.querySelector('#main');
  const ink = '#2A2233';
  const colors = ['#E8573C', '#F2B33D', '#2D5BD7', '#3FA36B', '#F49AC1'];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[char]));
  }

  function iconSvg(name, label, large) {
    const sizeClass = large ? 'scene-icon scene-icon-large' : 'scene-icon';
    const start = `<svg class="${sizeClass}" viewBox="0 0 180 150" role="img" aria-label="${escapeHtml(label)}" xmlns="http://www.w3.org/2000/svg">`;
    const end = '</svg>';
    const s = `stroke="${ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
    const shapes = {
      heads: `<circle cx="57" cy="55" r="25" fill="#F2B33D" ${s}/><path d="M22 128c2-32 16-47 35-47s33 15 35 47" fill="#E8573C" ${s}/><circle cx="123" cy="58" r="23" fill="#F49AC1" ${s}/><path d="M94 128c2-30 13-45 29-45s29 15 33 45" fill="#2D5BD7" ${s}/><path d="M82 48c11-12 19-12 30 0" fill="none" ${s}/>` ,
      brain: `<path d="M91 29c-14-18-39-5-35 13-20-5-31 19-17 32-17 11-7 38 12 37 2 22 32 26 42 8 14 16 42 7 39-14 20-5 23-33 5-42 7-18-15-36-31-26-2-8-8-12-15-8z" fill="#F49AC1" ${s}/><path d="M90 34v82M68 47c13 4 14 15 6 25M112 48c-12 5-13 17-4 25M55 85c14-8 25 0 25 12M126 84c-14-6-24 3-23 15" fill="none" ${s}/>` ,
      tree: `<path d="M88 127V67" fill="none" ${s}/><path d="M88 91L63 70M89 79l25-24" fill="none" ${s}/><path d="M40 59c-8-22 17-38 34-25 6-25 39-25 47-4 24-4 36 25 19 40 9 18-15 34-30 24-9 18-39 14-41-7-18 12-42-7-29-28z" fill="#3FA36B" ${s}/><path d="M67 127h43" fill="none" ${s}/>` ,
      photo: `<rect x="28" y="24" width="124" height="100" rx="8" fill="#FFF6E5" ${s}/><circle cx="61" cy="55" r="13" fill="#F2B33D" ${s}/><path d="M39 108l31-29 20 18 20-25 31 36" fill="#3FA36B" ${s}/><path d="M122 39v20M112 49h20" fill="none" ${s}/>` ,
      chat: `<path d="M27 29h126v78H78l-29 22 5-22H27z" fill="#2D5BD7" ${s}/><path d="M52 55h70M52 77h47" fill="none" stroke="#FFF6E5" stroke-width="7" stroke-linecap="round"/><circle cx="131" cy="77" r="8" fill="#F2B33D" ${s}/>` ,
      blank: `<rect x="36" y="20" width="108" height="112" rx="7" fill="#FFF6E5" ${s}/><path d="M58 48h63M58 70h63M58 92h38" fill="none" stroke="#BBAFA7" stroke-width="5" stroke-linecap="round"/><circle cx="122" cy="108" r="15" fill="#F49AC1" ${s}/>` ,
      files: `<path d="M24 53h58l12 14h62v64H24z" fill="#F2B33D" ${s}/><path d="M43 24h88v29H82L72 42H43z" fill="#FFF6E5" ${s}/><path d="M48 89h83M48 108h61" fill="none" ${s}/>` ,
      map: `<path d="M23 37l43-16 48 17 43-16v91l-43 16-48-17-43 16z" fill="#FFF6E5" ${s}/><path d="M66 21v91M114 38v91" fill="none" ${s}/><path d="M40 89c24-31 49-2 67-29 12-18 23-17 34-8" fill="none" stroke="#E8573C" stroke-width="7" stroke-linecap="round"/><circle cx="107" cy="60" r="9" fill="#2D5BD7" ${s}/>` ,
      save: `<path d="M34 22h91l22 22v86H34z" fill="#2D5BD7" ${s}/><path d="M57 22h55v37H57zM58 84h65v46H58z" fill="#FFF6E5" ${s}/><circle cx="91" cy="107" r="11" fill="#F2B33D" ${s}/>` ,
      question: `<path d="M60 52c2-23 18-34 39-32 25 2 37 25 27 44-8 15-28 15-29 32" fill="none" ${s}/><circle cx="96" cy="124" r="7" fill="#E8573C" ${s}/><path d="M33 31l-9-11M143 31l10-11M45 119l-14 10M139 116l14 10" fill="none" stroke="#BBAFA7" stroke-width="4" stroke-dasharray="8 8"/>`
    };
    return start + (shapes[name] || shapes.question) + end;
  }

  function characterSvg() {
    return `<svg class="bernat-drawing" viewBox="0 0 290 350" role="img" aria-label="A friendly drawing of Bernat"><path d="M74 300c3-85 29-122 71-122s69 37 72 122" fill="#2D5BD7" stroke="${ink}" stroke-width="6"/><circle cx="145" cy="112" r="71" fill="#F2B33D" stroke="${ink}" stroke-width="6"/><path d="M78 96c6-56 55-84 104-60 20 10 30 27 34 48-29-2-50-11-65-31-17 24-42 38-73 43z" fill="${ink}"/><circle cx="119" cy="112" r="5" fill="${ink}"/><circle cx="172" cy="112" r="5" fill="${ink}"/><path d="M124 143c14 12 29 12 43 0" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/><path d="M96 214l-51 49M194 214l53 50" fill="none" stroke="${ink}" stroke-width="16" stroke-linecap="round"/><path d="M105 300l-15 37M185 300l15 37" fill="none" stroke="${ink}" stroke-width="17" stroke-linecap="round"/></svg>`;
  }

  function renderHome() {
    document.title = `${data.person.name}, The Picture Book`;
    const mainWork = data.workspaces.find((item) => item.importance === 'center') || data.workspaces[0];
    const secondWork = data.workspaces.find((item) => item.importance === 'second') || data.workspaces[1];
    const orbit = mainWork.chapters.map((chapter, index) => {
      const total = Math.max(mainWork.chapters.length, 2);
      const angle = (-130 + (index * 225 / (total - 1))) * Math.PI / 180;
      const x = Math.round(167 + Math.cos(angle) * 175 - 33);
      const y = Math.round(238 + Math.sin(angle) * 210 - 33);
      return `<span class="orbit" style="--orbit-x:${x}px;--orbit-y:${y}px" title="${escapeHtml(chapter.title)}">${iconSvg(chapter.icon, chapter.title, false)}</span>`;
    }).join('');
    const products = data.products.map((product, index) => `<a class="product-sticker sticker-${index % 2}" href="${escapeHtml(product.href)}" target="_blank" rel="noreferrer"><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(product.kid)}</span></a>`).join('');
    const principles = data.principles.map((item) => `<article class="rule-card"><div class="rule-card-inner"><div class="rule-face rule-front"><span class="rule-number">${item.n}</span><h3>${escapeHtml(item.title)}</h3><span class="turn-note">Turn this card</span></div><div class="rule-face rule-back"><p>${escapeHtml(item.kid)}</p><small>${escapeHtml(item.example)}</small></div></div><button class="rule-turn" type="button" aria-label="Turn rule ${item.n}" aria-pressed="false"></button></article>`).join('');
    main.innerHTML = `
      <section class="book-spread" aria-label="Meet Bernat and his work">
        <article class="book-page intro-page">
          <p class="page-kicker">HELLO, READER!</p>
          <h1>This is Bernat.</h1>
          ${characterSvg()}
          <p class="intro-kid">${escapeHtml(data.person.kid)}</p>
          <div class="motto"><strong>${escapeHtml(data.person.motto)}</strong><span>${escapeHtml(data.person.mottoLong)}</span></div>
          <span class="page-number">1</span>
        </article>
        <article class="book-page world-page">
          <p class="page-kicker">MY WORLD RIGHT NOW</p>
          <h2>Here is what I am building.</h2>
          <div class="world-map">
            <a class="work-blob maat-blob" href="story.html?w=${encodeURIComponent(mainWork.id)}">
              <span class="blob-kind">${escapeHtml(mainWork.kind)}</span><strong>${escapeHtml(mainWork.name)}</strong><span class="blob-kid">${escapeHtml(mainWork.kid)}</span><span class="open-story">Open the story</span>
            </a>
            ${orbit}
            <a class="work-blob gcontext-blob" href="story.html?w=${encodeURIComponent(secondWork.id)}">
              <span class="blob-kind">${escapeHtml(secondWork.kind)}</span><strong>${escapeHtml(secondWork.name)}</strong><span class="blob-kid">${escapeHtml(secondWork.kid)}</span><span class="open-story">Open the story</span>
            </a>
            <span class="drawing-note" aria-hidden="true">still being drawn</span>
          </div>
          <div class="sticker-row">${products}</div>
          <span class="page-number">2</span>
        </article>
      </section>
      <section class="rules-section" aria-labelledby="rules-title">
        <div class="notebook">
          <p class="page-kicker">FIVE THINGS I REMEMBER</p>
          <h2 id="rules-title">Bernat's rules</h2>
          <p class="rules-help">Select a rule to turn its card.</p>
          <div class="rules-grid">${principles}</div>
        </div>
      </section>
      <section class="about-page" aria-labelledby="about-title">
        <div>${iconSvg('brain', 'A brain drawing', false)}</div>
        <div><p class="page-kicker">A LITTLE MORE</p><h2 id="about-title">About ${escapeHtml(data.person.name)}</h2>${data.person.about.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
      </section>`;

    document.querySelectorAll('.rule-turn').forEach((button) => {
      button.addEventListener('click', () => {
        const card = button.closest('.rule-card');
        const turned = card.classList.toggle('is-turned');
        button.setAttribute('aria-pressed', String(turned));
      });
    });
  }

  function renderStory() {
    const requested = new URLSearchParams(location.search).get('w');
    const workspace = data.workspaces.find((item) => item.id === requested) || data.workspaces.find((item) => item.id === 'maat') || data.workspaces[0];
    const other = data.workspaces.find((item) => item.id !== workspace.id);
    const newest = workspace.chapters.find((item) => item.status === 'latest') || workspace.chapters.filter((item) => item.status !== 'next').at(-1) || workspace.chapters.at(-1);
    const first = workspace.chapters[0];
    const newestSentence = Array.isArray(newest.kid) ? newest.kid[0] : newest.kid;
    document.title = `${workspace.name}, The Picture Book`;
    document.querySelector('.story-links').innerHTML = `<a href="home.html">Home</a>${other ? `<a href="story.html?w=${encodeURIComponent(other.id)}">Read ${escapeHtml(other.name)}</a>` : ''}`;
    const index = workspace.chapters.map((chapter, indexNumber) => `<a href="#${escapeHtml(chapter.id)}" data-tab-for="${escapeHtml(chapter.id)}" aria-label="Page ${indexNumber + 1}: ${escapeHtml(chapter.title)}"><span class="tab-number">${indexNumber + 1}</span><span class="tab-title">${escapeHtml(chapter.short || shortTitle(chapter.title))}</span></a>`).join('');
    const dots = workspace.chapters.map((chapter, number) => `<a href="#${escapeHtml(chapter.id)}" aria-label="Page ${number + 1}: ${escapeHtml(chapter.title)}">${number + 1}</a>`).join('');
    const pages = workspace.chapters.map((chapter, indexNumber) => chapterPage(chapter, indexNumber, workspace.chapters.length)).join('');
    main.innerHTML = `
      <section class="story-cover" aria-labelledby="story-title">
        <div class="cover-copy">
          <p class="page-kicker">${escapeHtml(workspace.kind)}</p>
          <h1 id="story-title">${escapeHtml(workspace.name)}</h1>
          <p class="cover-line">${escapeHtml(workspace.oneLiner)}</p>
          <a class="big-button first-page-control" href="#${escapeHtml(first.id)}">Read from page 1</a>
        </div>
        <article class="newest-card">
          <div class="newest-visual">${iconSvg(newest.icon, newest.title, false)}</div>
          <div><span class="newest-label">NEWEST PAGE, ${escapeHtml(newest.date)}</span><h2>${escapeHtml(newest.title)}</h2><p>${escapeHtml(newestSentence)}</p><a class="text-button" href="#${escapeHtml(newest.id)}">Read the newest page</a></div>
        </article>
        <nav class="cover-pages" aria-label="Preview the pages"><strong>${workspace.chapters.length} pages</strong><div>${dots}</div></nav>
        <div class="cover-doodle" aria-hidden="true"><span></span><span></span><span></span></div>
      </section>
      <nav class="chapter-index" aria-label="All pages"><strong>Pick a page</strong><div>${index}</div></nav>
      <div class="story-pages">${pages}</div>
      <nav class="bookmark-tabs" aria-label="Chapter bookmarks">${index}</nav>`;

    document.querySelectorAll('.detail-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        const panel = document.querySelector(`#${button.getAttribute('aria-controls')}`);
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
        button.textContent = open ? 'Grown-up version' : 'Close grown-up version';
      });
    });
    watchChapters();
  }

  function shortTitle(title) {
    const words = title.replace(/[?:]/g, '').split(' ');
    return words.slice(0, 4).join(' ');
  }

  function chapterPage(chapter, index, total) {
    const nextClass = chapter.status === 'next' ? ' next-page' : '';
    const article = chapter.article ? `<a class="article-link" href="${escapeHtml(chapter.article.href)}">Read: ${escapeHtml(chapter.article.title)}</a>` : '';
    return `<section class="chapter-page${nextClass}" id="${escapeHtml(chapter.id)}" data-chapter="${escapeHtml(chapter.id)}" aria-labelledby="title-${escapeHtml(chapter.id)}">
      <div class="illustration-panel"><span class="sun-shape" aria-hidden="true"></span>${iconSvg(chapter.icon, `Drawing for ${chapter.title}`, true)}<span class="ground-shape" aria-hidden="true"></span></div>
      <div class="chapter-copy">
        <div class="chapter-meta"><span>PAGE ${index + 1} OF ${total}</span><time>${escapeHtml(chapter.date)}</time></div>
        ${chapter.status === 'next' ? '<p class="unfinished-label">THIS PAGE IS STILL BEING DRAWN</p>' : ''}
        <h2 id="title-${escapeHtml(chapter.id)}">${escapeHtml(chapter.title)}</h2>
        <div class="kid-copy">${chapter.kid.map((sentence) => `<p>${escapeHtml(sentence)}</p>`).join('')}</div>
        <aside class="learned"><strong>What I learned</strong><p>${escapeHtml(chapter.learned)}</p></aside>
        <button class="detail-toggle" type="button" aria-expanded="false" aria-controls="deep-${escapeHtml(chapter.id)}">Grown-up version</button>
        <div class="deep-detail" id="deep-${escapeHtml(chapter.id)}" hidden><p>${escapeHtml(chapter.deep)}</p>${article}</div>
      </div>
    </section>`;
  }

  function watchChapters() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('[data-tab-for]').forEach((link) => link.classList.toggle('is-current', link.dataset.tabFor === entry.target.id));
      });
    }, {rootMargin: '-35% 0px -50% 0px'});
    document.querySelectorAll('[data-chapter]').forEach((chapter) => observer.observe(chapter));
  }

  if (!data || !main) return;
  if (document.body.dataset.page === 'story') renderStory();
  else renderHome();
}());
