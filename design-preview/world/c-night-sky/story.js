(() => {
  const data = window.WORLD;
  const requested = new URLSearchParams(location.search).get('w');
  const workspace = data.workspaces.find(item => item.id === requested) || data.workspaces.find(item => item.id === 'maat') || data.workspaces[0];
  const other = data.workspaces.find(item => item.id !== workspace.id);
  const latest = workspace.chapters.find(item => item.status === 'latest') || workspace.chapters.at(-1);
  let lastDialogTrigger = null;
  document.body.dataset.workspace = workspace.id;
  document.querySelector('#bar-name').textContent = workspace.name;

  document.title = `${workspace.name} | The Night Sky`;
  document.querySelector('#story-kind').textContent = workspace.kind;
  document.querySelector('#story-title').textContent = workspace.name;
  document.querySelector('#story-one-liner').textContent = workspace.oneLiner;
  document.querySelector('#panel-name').textContent = workspace.name;
  const otherLink = document.querySelector('#other-workspace');
  otherLink.href = `story.html?w=${other.id}`;
  otherLink.textContent = `Visit ${other.name}`;

  const icons = {
    heads: '<circle class="icon-fill" cx="34" cy="32" r="14"/><circle class="icon-fill" cx="78" cy="32" r="14"/><path class="icon-line" d="M12 87c3-22 14-32 31-32M100 87c-3-22-14-32-31-32M45 72h22M56 61v22"/>',
    brain: '<path class="icon-fill" d="M56 24c-9-14-29-4-25 10-15-1-18 21-5 26-10 12 2 29 16 23 5 13 22 9 22-3V34c0-12-8-17-8-10Z"/><path class="icon-fill" d="M64 24c9-14 29-4 25 10 15-1 18 21 5 26 10 12-2 29-16 23-5 13-22 9-22-3V34c0-12 8-17 8-10Z"/><path class="icon-line" d="M39 39c9 1 13 6 13 14M38 68c8-6 14-4 18 3M81 39c-9 1-13 6-13 14M82 68c-8-6-14-4-18 3"/>',
    tree: '<path class="icon-line" d="M60 99V66M60 76 35 52M60 62l24-25M60 49 46 30M35 52 20 38M84 37l15-12"/><circle class="icon-fill" cx="46" cy="29" r="8"/><circle class="icon-fill" cx="19" cy="37" r="8"/><circle class="icon-fill" cx="100" cy="24" r="8"/><circle class="icon-fill" cx="85" cy="37" r="8"/><circle class="icon-fill" cx="35" cy="53" r="8"/>',
    photo: '<rect class="icon-fill" x="17" y="23" width="86" height="72" rx="8"/><circle class="icon-line" cx="79" cy="43" r="9"/><path class="icon-line" d="m24 84 23-25 14 14 10-9 25 20M45 14h30"/>',
    chat: '<path class="icon-fill" d="M17 25h86v58H60L39 99V83H17Z"/><path class="icon-line" d="M37 48h46M37 62h30"/>',
    blank: '<rect class="icon-fill" x="25" y="18" width="70" height="84" rx="7"/><path class="icon-line" d="M39 41h42M39 57h42M39 73h25"/><circle cx="82" cy="82" r="10" fill="var(--indigo)" stroke="currentColor" stroke-width="2"/>',
    files: '<path class="icon-fill" d="M17 39h38l9 10h39v48H17Z"/><path class="icon-line" d="M28 38V25h33l9 9h25v14M36 65h48M36 78h35"/>',
    map: '<path class="icon-fill" d="m14 29 28-11 36 12 28-10v72L78 102 42 90 14 101Z"/><path class="icon-line" d="M42 18v72M78 30v72M53 52c9-8 18-7 25 1M53 66c9-8 18-7 25 1"/>',
    save: '<path class="icon-fill" d="M22 18h68l10 11v73H22Z"/><path class="icon-line" d="M40 18v28h40V18M39 102V67h44v35"/><circle class="icon-line" cx="61" cy="84" r="8"/>',
    question: '<circle class="icon-fill" cx="60" cy="60" r="44" stroke-dasharray="5 7"/><path class="icon-line" d="M44 47c2-20 33-22 34-2 1 18-18 17-18 30M60 88v1"/>',
  };

  const chapters = document.querySelector('#chapters');
  const index = document.querySelector('#chapter-index');
  const dialog = document.querySelector('#telescope');
  function openDetail(chapter, trigger) {
    lastDialogTrigger = trigger;
    document.querySelector('#dialog-title').textContent = chapter.title;
    document.querySelector('#dialog-deep').textContent = chapter.deep;
    document.querySelector('#dialog-link').innerHTML = chapter.article ? `<a class="article-link" href="${chapter.article.href}">${chapter.article.title} <span aria-hidden="true">&nbsp;→</span></a>` : '';
    dialog.showModal();
    document.querySelector('#close-telescope').focus();
  }

  workspace.chapters.forEach((chapter, chapterNumber) => {
    const indexLink = document.createElement('a');
    indexLink.className = 'index-link';
    indexLink.href = `#${chapter.id}`;
    indexLink.innerHTML = `<span>${chapter.title}</span>`;
    indexLink.setAttribute('aria-label', `Go to chapter ${chapterNumber + 1}: ${chapter.title}`);
    index.append(indexLink);
    const dot = document.createElement('a');
    dot.href = `#${chapter.id}`;
    dot.className = `bar-dot ${chapter.status}`;
    dot.setAttribute('aria-label', `${chapter.title}${chapter.status === 'latest' ? ', newest chapter' : ''}`);
    dot.title = chapter.title;
    dot.innerHTML = '<span aria-hidden="true"></span>';
    document.querySelector('#bar-index').append(dot);

    const article = document.createElement('article');
    article.id = chapter.id;
    article.className = `chapter-card ${chapter.status}`;
    const status = chapter.status === 'next' ? 'Still forming' : chapter.status === 'latest' ? 'Newest star' : `Star ${chapterNumber + 1}`;
    article.innerHTML = `<div class="chapter-meta"><time>${chapter.date}</time><span class="status">${status}</span></div><div class="chapter-visual" role="img" aria-label="A simple ${chapter.icon} drawing"><svg viewBox="0 0 120 120" aria-hidden="true">${icons[chapter.icon] || icons.question}</svg></div><h2>${chapter.title}</h2><div class="kid-copy">${chapter.kid.map(text => `<p>${text}</p>`).join('')}</div><p class="learned"><span>What I learned</span>${chapter.learned}</p><button class="telescope-button" type="button">Look through the telescope</button>`;
    article.querySelector('button').addEventListener('click', event => openDetail(chapter, event.currentTarget));
    chapters.append(article);
  });

  document.querySelector('#start-first').addEventListener('click', () => {
    document.querySelector(`#${workspace.chapters[0].id}`).scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
  });
  document.querySelector('#close-telescope').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => lastDialogTrigger?.focus());

  const svg = document.querySelector('#story-constellation');
  svg.setAttribute('aria-label', `${workspace.name} constellation with ${workspace.chapters.length} chapter stars`);
  const seed = [...workspace.id].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7);
  const random = i => { const value = Math.sin(seed + i * 9187.31) * 10000; return value - Math.floor(value); };
  const positions = workspace.chapters.map((chapter, i) => [
    (i + seed) % 2 === 0 ? 240 - random(i) * 60 : 380 + random(i) * 60,
    120 + (i + (i > 0 && i < workspace.chapters.length - 1 ? (random(i + 20) - .5) * .4 : 0)) * 420 / Math.max(1, workspace.chapters.length - 1),
  ]);
  positions.slice(1).forEach((position, i) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', positions[i][0]); line.setAttribute('y1', positions[i][1]);
    line.setAttribute('x2', position[0]); line.setAttribute('y2', position[1]);
    line.setAttribute('class', 'story-line'); line.dataset.index = String(i + 1);
    svg.append(line);
  });
  workspace.chapters.forEach((chapter, i) => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `story-star ${chapter.status}`);
    group.setAttribute('transform', `translate(${positions[i][0]} ${positions[i][1]})`);
    group.setAttribute('tabindex', '0');
    group.setAttribute('role', 'link');
    group.setAttribute('aria-label', `Go to ${chapter.title}`);
    group.dataset.id = chapter.id;
    const left = positions[i][0] < 310;
    const shortLabel = chapter.short || chapter.title.split(/\s+/).slice(0, 3).join(' ');
    group.innerHTML = `<title>${chapter.title}</title><circle r="9"></circle><text x="${left ? -24 : 24}" y="5" style="text-anchor:${left ? 'end' : 'start'}">${shortLabel}</text>`;
    const showTitle = () => { document.querySelector('#star-title').textContent = chapter.title; };
    group.addEventListener('mouseenter', showTitle);
    group.addEventListener('focus', showTitle);
    group.addEventListener('mouseleave', () => { document.querySelector('#star-title').textContent = ''; });
    group.addEventListener('blur', () => { document.querySelector('#star-title').textContent = ''; });
    const go = () => document.querySelector(`#${chapter.id}`).scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
    group.addEventListener('click', go);
    group.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); go(); } });
    svg.append(group);
  });

  function setActive(activeId) {
    const activeIndex = workspace.chapters.findIndex(chapter => chapter.id === activeId);
    svg.querySelectorAll('.story-star').forEach((star, i) => {
      star.classList.toggle('active', star.dataset.id === activeId);
      star.classList.toggle('lit', i <= activeIndex && workspace.chapters[i].status !== 'next');
    });
    svg.querySelectorAll('.story-line').forEach((line, i) => line.classList.toggle('lit', i < activeIndex));
    index.querySelectorAll('.index-link').forEach((link, i) => link.classList.toggle('active', i === activeIndex));
    document.querySelectorAll('.bar-dot').forEach((link, i) => {
      link.classList.toggle('active', i === activeIndex);
      if (i === activeIndex) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }

  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target.id);
  }, {rootMargin: '-18% 0px -36% 0px', threshold: [0, .15, .4, .7]});
  chapters.querySelectorAll('.chapter-card').forEach(card => observer.observe(card));
  setActive(latest.id);

  document.fonts.ready.then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = document.querySelector(`#${latest.id}`);
      const topOffset = innerWidth <= 760 ? 286 : 176;
      const targetTop = target.getBoundingClientRect().top + scrollY - topOffset;
      const priorScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo({top: targetTop, behavior: 'auto'});
      requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = priorScrollBehavior; });
    }));
  });
})();
