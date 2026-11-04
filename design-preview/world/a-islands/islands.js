(() => {
  'use strict';

  const data = window.WORLD;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const icon = (name) => {
    const drawings = {
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
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${drawings[name] || drawings.question}</svg>`;
  };

  function townPosition(index, count) {
    const columns = Math.min(3, count);
    const rows = Math.ceil(count / columns);
    const row = Math.floor(index / columns);
    const col = row % 2 ? columns - 1 - index % columns : index % columns;
    return [390 + col * 85, 352 + row * Math.min(108, 135 / Math.max(1, rows - 1))];
  }

  function buildingMarkup(chapter, index, chapters) {
    const [x, y] = townPosition(index, chapters.length);
    const designs = {
      heads: '<path fill="#FBF4E6" d="M-26 0v-27h52V0Z"/><path fill="#F0745A" d="m-30-27 30-19 30 19Z"/><circle cx="-10" cy="-17" r="5" fill="#F6C445"/><circle cx="10" cy="-17" r="5" fill="#F6C445"/><path d="M-16-4v-5h12v5M4-4v-5h12v5"/>',
      brain: '<path fill="#FBF4E6" d="M-29 0v-32h58V0Z"/><path fill="#F6C445" d="m-33-32 33-17 33 17Z"/><path d="M-20-25v19M-10-25v19M10-25v19M20-25v19"/><path fill="#7FD1C7" d="M-7 0v-20H7V0"/><path d="M-34 4h68"/>',
      tree: '<path fill="#FBF4E6" d="M-26 0v-25h52V0Z"/><path fill="#7FD1C7" d="M-32-25v-12h64v12Z"/><path d="M-30-12h60M0-37v-17m-10 8h20"/><circle cx="0" cy="-53" r="5" fill="#F6C445"/><path d="M-16 0v-10M16 0v-10"/>',
      photo: '<path fill="#FBF4E6" d="M-30 0v-28h60V0Z"/><path fill="#F0745A" d="M-34-28l12-16h44l12 16Z"/><path fill="#7FD1C7" d="M-22 0v-18h16V0"/><path fill="#F6C445" d="M0-25h25v16H0Z"/><circle cx="13" cy="-17" r="5"/><path d="M20-44v-16h8v16"/>',
      chat: '<path fill="#FBF4E6" d="M-17 0v-43h34V0Z"/><path fill="#F0745A" d="m-23-43 23-18 23 18Z"/><path fill="#7FD1C7" d="M-7 0v-16H7V0"/><path fill="#F6C445" d="M-2-49v-24h37v19H14l-8 9v-4Z"/><path d="M6-65h21M6-59h13"/>',
    };
    const drawing = designs[chapter.icon] || designs.heads;
    return `<a class="town-building" href="story.html?w=maat#${escapeHtml(chapter.id)}" aria-label="${escapeHtml(chapter.title)}" data-title="${escapeHtml(chapter.title)}"><g transform="translate(${x} ${y}) scale(${chapters.length > 6 ? 0.72 : 1})">${drawing}<text class="town-number" y="17">${index + 1}</text></g></a>`;
  }

  function mapMarkup(maat, gcontext, products) {
    const buildings = maat.chapters.map(buildingMarkup).join('');
    const townPath = maat.chapters.map((chapter, index) => `${index ? 'L' : 'M'}${townPosition(index, maat.chapters.length).join(' ')}`).join(' ');
    const flags = gcontext.chapters.map((chapter, index) => {
      const x = 828 + index * 18;
      const y = 206 + (index % 2) * 12;
      return `<g aria-label="${escapeHtml(chapter.title)}"><path d="M${x} ${y}v-24" fill="none"/><path d="M${x} ${y - 24}l13 5-13 5Z" fill="${chapter.status === 'latest' ? '#F6C445' : '#FBF4E6'}"/></g>`;
    }).join('');
    return `
      <svg viewBox="0 0 1200 720" role="group" aria-labelledby="map-svg-title map-svg-desc" preserveAspectRatio="xMidYMid slice">
        <title id="map-svg-title">A sea map of Bernat's work</title>
        <desc id="map-svg-desc">MAAT is the large center island. gcontext is the smaller island to the upper right. Two product islands sit at the edges.</desc>
        <defs>
          <pattern id="waves" width="90" height="70" patternUnits="userSpaceOnUse"><path class="wave" d="M8 28c8-7 16-7 24 0s16 7 24 0M42 55c7-6 14-6 21 0s14 6 21 0"/></pattern>
        </defs>
        <rect width="1200" height="900" fill="#2B8C96"/>
        <rect class="sea-pattern" width="1200" height="900" fill="url(#waves)"/>
        <a class="island-link island-maat" href="story.html?w=${escapeHtml(maat.id)}" data-map-name="${escapeHtml(maat.name)}" data-map-copy="${escapeHtml(maat.oneLiner)}" data-zoom="46% 55%">
          <g class="island-group">
            <path d="M312 364C337 300 403 272 476 278c59-10 137 15 165 64 41 30 48 89 13 124-19 58-95 81-157 68-59 15-135-1-165-45-50-22-59-85-20-125Z" fill="#7FD1C7"/>
            <path d="M330 365C358 314 416 301 475 306c55-8 121 10 146 51 31 26 34 68 6 94-21 45-83 56-133 43-50 14-110-1-134-38-36-19-43-59-30-91Z" fill="#F3E3C3"/>
            <path d="M354 454c36 47 99 36 134 27M554 479q40-5 57-33" fill="none" stroke-dasharray="2 5"/>
            <path d="M349 398v35m-12-21 12-25 13 25ZM606 381v35m-12-21 12-25 13 25ZM410 441v24m-10-13 10-23 12 23Z" fill="#7FD1C7"/>
            <path d="m371 461 8-10 12 3 3 9Zm230-31 6-9 10 5 3 8Z" fill="#B9C7BF"/>
            <text class="island-label" x="488" y="555">${escapeHtml(maat.name)}</text>
            <text class="island-kind" x="488" y="575">${escapeHtml(maat.kind)}</text>
          </g>
        </a>
        <g class="town-layer"><path class="town-path" d="${townPath}"/>${buildings}</g>
        <a class="island-link island-gcontext" href="story.html?w=${escapeHtml(gcontext.id)}" data-map-name="${escapeHtml(gcontext.name)}" data-map-copy="${escapeHtml(gcontext.oneLiner)}" data-zoom="73% 34%">
          <g class="island-group">
            <path d="M747 235c18-52 75-73 125-54 53-7 99 30 95 79 13 45-33 85-78 78-52 21-114-10-118-55-25-8-35-29-24-48Z" fill="#7FD1C7"/>
            <path d="M770 238c22-35 62-43 98-29 38-6 72 20 70 54 3 31-31 52-63 44-36 14-77-4-82-34-20-4-28-20-23-35Z" fill="#F3E3C3"/>
            <path d="M862 248h20l-3-55h-14Z" fill="#FBF4E6"/><path d="M861 193h22l-4-13h-14Z" fill="#F0745A"/><path d="M869 172h6v9h-6Z" fill="#F6C445"/>
            <path d="M807 257v-31h42v31M813 226c5-26 25-26 30 0" fill="#FBF4E6"/>
            <path class="scaffold" d="M798 218h58M802 207v58M852 207v58M802 246h50M802 207l50 58M852 207l-50 58"/>
            ${flags}
            <text class="island-label" x="856" y="352">${escapeHtml(gcontext.name)}</text>
            <text class="island-kind" x="856" y="371">${escapeHtml(gcontext.kind)}</text>
          </g>
        </a>
        <a class="island-link island-bjj" href="${escapeHtml(products[0].href)}" target="_blank" rel="noopener noreferrer" data-map-name="${escapeHtml(products[0].name)}" data-map-copy="${escapeHtml(products[0].kid)}" data-zoom="13% 73%">
          <g class="island-group" opacity="0.78">
            <path d="M62 527c14-30 50-38 78-24 32-8 65 11 66 39 8 29-26 47-53 39-34 16-80 0-79-26-15-6-20-18-12-28Z" fill="#B9DFD7"/>
            <path d="M90 527h65v42H90Z" fill="#FBF4E6"/><path d="M82 529l40-30 42 30Z" fill="#F0745A"/><path d="M101 544h42M101 553h42" fill="none"/>
            <text class="island-label product-label" x="132" y="606">${escapeHtml(products[0].name)}</text>
          </g>
        </a>
        <a class="island-link island-indoeuro" href="${escapeHtml(products[1].href)}" target="_blank" rel="noopener noreferrer" data-map-name="${escapeHtml(products[1].name)}" data-map-copy="${escapeHtml(products[1].kid)}" data-zoom="89% 76%">
          <g class="island-group" opacity="0.78">
            <path d="M1008 533c20-29 59-35 88-15 36-2 58 24 49 51-3 30-39 39-66 28-33 9-69-10-67-36-14-6-15-18-4-28Z" fill="#B9DFD7"/>
            <path d="M1063 536c0-23 34-23 34 0 0 20-17 36-17 36s-17-16-17-36Z" fill="#F0745A"/><circle cx="1080" cy="536" r="6" fill="#FBF4E6"/>
            <text class="island-label product-label" x="1076" y="623">${escapeHtml(products[1].name)}</text>
          </g>
        </a>
        <a class="compass-button" href="#principles" aria-label="Go to the five principles">
          <g transform="translate(1090 105)"><circle r="52"/><path d="M0-40 10-9 0 0-10-9ZM0 40 10 9 0 0-10 9Z"/><path d="M-40 0-9-10 0 0-9 10ZM40 0 9-10 0 0 9 10Z" fill="#F6C445"/><text x="0" y="-58">N</text></g>
        </a>
        <g class="boat-routes" aria-hidden="true"><path class="route" d="M720 490Q740 380 790 318M720 490Q685 510 642 480"/></g>
        <g class="mobile-map-only" aria-hidden="true"><path class="route" d="M255 593Q306 581 273 479M255 593Q379 457 299 266"/></g>
        <a class="bernat-boat" href="#captains-log" aria-label="Bernat: read the captain's log"><g transform="translate(720 490)"><path d="M-36 0q36 8 72 0l-14 22h-40Z" fill="#F3E3C3"/><path d="M0 0v-66"/><path d="M-4-55-29-8h25Z" fill="#FBF4E6"/><path d="M3-64h66l-9 11 9 11H3Z" fill="#F6C445"/><text x="10" y="-48" class="boat-flag">Bernat</text><path d="M-42 30q12 5 24 0m28 0q12 5 24 0" fill="none"/></g></a>
      </svg>`;
  }

  function renderHome() {
    const [maat, gcontext] = data.workspaces;
    const map = document.querySelector('#world-map');
    map.innerHTML = mapMarkup(maat, gcontext, data.products);
    if (window.innerWidth <= 640) map.querySelector('svg').setAttribute('viewBox', '0 0 390 844');

    const tag = document.createElement('div');
    tag.className = 'building-tag';
    tag.setAttribute('role', 'tooltip');
    tag.id = 'building-tag';
    tag.hidden = true;
    map.append(tag);
    document.querySelectorAll('.town-building').forEach((building) => {
      building.setAttribute('aria-describedby', tag.id);
      const show = () => {
        tag.textContent = building.dataset.title;
        tag.hidden = false;
        const bounds = building.getBoundingClientRect();
        const parent = map.getBoundingClientRect();
        tag.style.left = `${Math.max(12, Math.min(parent.width - tag.offsetWidth - 12, bounds.left - parent.left + bounds.width / 2 - tag.offsetWidth / 2))}px`;
        tag.style.top = `${bounds.top - parent.top - tag.offsetHeight - 12}px`;
      };
      building.addEventListener('mouseenter', show);
      building.addEventListener('focus', show);
      building.addEventListener('mouseleave', () => { tag.hidden = true; });
      building.addEventListener('blur', () => { tag.hidden = true; });
    });

    const card = document.querySelector('#map-card');
    document.querySelectorAll('.island-link').forEach((link) => {
      const show = () => {
        card.innerHTML = `<h2>${escapeHtml(link.dataset.mapName)}</h2><p>${escapeHtml(link.dataset.mapCopy)}</p><span>${link.target === '_blank' ? 'Visit the project' : 'Visit the island'}</span>`;
        card.hidden = false;
      };
      link.addEventListener('mouseenter', show);
      link.addEventListener('focus', show);
      link.addEventListener('mouseleave', () => { card.hidden = true; });
      link.addEventListener('blur', () => { card.hidden = true; });
      link.addEventListener('click', (event) => {
        if (reduceMotion || link.target === '_blank') return;
        event.preventDefault();
        const destination = link.getAttribute('href');
        document.documentElement.style.setProperty('--zoom-x', link.dataset.zoom.split(' ')[0]);
        document.documentElement.style.setProperty('--zoom-y', link.dataset.zoom.split(' ')[1]);
        document.body.classList.add('zooming');
        window.setTimeout(() => { window.location.href = destination; }, 460);
      });
    });

    const person = data.person;
    document.querySelector('#captains-log').innerHTML = `
      <article class="captains-log">
        <div class="log-mark" aria-hidden="true"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="81"/><path d="M43 136c39-21 95-21 134 0M110 29v55M81 86h58M90 86l-15 37h70l-15-37M70 157c25 14 55 14 80 0"/><circle cx="110" cy="58" r="9"/></svg></div>
        <div class="log-copy">
          <p class="eyebrow">Captain's log</p>
          <h2>${escapeHtml(person.name)}</h2>
          <p class="log-role">${escapeHtml(person.role)}</p>
          <p class="log-kid">${escapeHtml(person.kid)}</p>
          <blockquote class="motto"><strong>${escapeHtml(person.motto)}</strong><br>${escapeHtml(person.mottoLong)}</blockquote>
          <div class="about-list">${person.about.map((text) => `<p>${escapeHtml(text)}</p>`).join('')}</div>
        </div>
      </article>`;

    document.querySelector('#bottle-list').innerHTML = data.principles.map((principle) => `
      <article class="bottle-wrap">
        <button class="bottle-button" type="button" aria-expanded="false" aria-controls="principle-${principle.n}">
          <svg viewBox="0 0 100 180" aria-hidden="true"><path class="glass" d="M36 12h28v25c0 9 17 17 19 35l8 79c1 13-8 20-20 20H29c-12 0-21-7-20-20l8-79c2-18 19-26 19-35Z"/><path class="cork" d="M35 10h30v20H35Z"/><path class="note" d="M25 88c18-7 35-7 51 0l-4 52c-14-5-29-5-43 0Z"/><text x="50" y="121" text-anchor="middle" fill="#233140" font-family="Fraunces" font-size="28" font-weight="800">${principle.n}</text></svg>
          <strong>${escapeHtml(principle.title)}</strong>
        </button>
        <div id="principle-${principle.n}" class="principle-note" aria-hidden="true"><div><div class="note-paper"><p>${escapeHtml(principle.kid)}</p><p class="note-example"><strong>For example:</strong> ${escapeHtml(principle.example)}</p></div></div></div>
      </article>`).join('');

    document.querySelectorAll('.bottle-button').forEach((button) => {
      button.addEventListener('click', () => {
        const note = document.querySelector(`#${button.getAttribute('aria-controls')}`);
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
        note.setAttribute('aria-hidden', String(open));
      });
    });
  }

  function scenery(index) {
    const motifs = [
      '<path d="M66 123q16-35 7-67M72 59Q44 23 22 57q27-9 50 2M73 57q10-43 38-30-25 11-38 30M75 58q40-20 49 12-25-15-49-12" fill="#7FD1C7"/><path d="m36 128 8-12 17 3 6 13Zm64 5 9-11 16 3 7 10Z" fill="#B9C7BF"/>',
      '<path d="M21 110q16-12 32 0t32 0t32 0M32 126q16-12 32 0t32 0" stroke="#2B8C96"/><path d="M34 96Q75 40 116 96M34 78Q75 22 116 78M34 96V68M116 96V68M48 78V54M102 78V54M64 66V44M87 66V44"/><path d="m24 137 13-10 14 5 4 10Z" fill="#F3E3C3"/>',
      '<path d="M20 110q14-12 28 0t28 0t28 0M42 126q14-12 28 0t28 0" stroke="#2B8C96"/><path d="m32 89 13-26 28 4 13 26Zm48 6 13-16 20 4 7 17Z" fill="#B9C7BF"/><path d="m38 91 9-14 8 12M96 70l5-19m-13 6 13 6 12-9"/>',
    ];
    return `<svg viewBox="0 0 150 160">${motifs[index % motifs.length]}</svg>`;
  }

  function renderStory() {
    const requested = new URLSearchParams(window.location.search).get('w');
    const workspace = data.workspaces.find((item) => item.id === requested) || data.workspaces.find((item) => item.id === 'maat') || data.workspaces[0];
    const other = data.workspaces.find((item) => item.id !== workspace.id);
    const latest = workspace.chapters.find((chapter) => chapter.status === 'latest') || workspace.chapters.filter((chapter) => chapter.status !== 'next').at(-1);
    document.title = `${workspace.name}: island story`;
    const otherLink = document.querySelector('#other-island');
    otherLink.href = `story.html?w=${encodeURIComponent(other.id)}`;
    otherLink.textContent = `Sail to ${other.name}`;
    document.querySelector('#story-header').innerHTML = `<div class="story-header-inner"><p class="eyebrow">${escapeHtml(workspace.kind)}</p><h1>${escapeHtml(workspace.name)}</h1><p class="story-intro">${escapeHtml(workspace.oneLiner)}</p><p class="last-stop"><span>Last stop:</span> ${escapeHtml(latest.title)}</p></div>`;

    document.querySelector('#mini-map').innerHTML = `<h2>Chapters</h2><ol>${workspace.chapters.map((chapter, index) => `<li><a href="#${escapeHtml(chapter.id)}" data-chapter-link="${escapeHtml(chapter.id)}" aria-label="Chapter ${index + 1}: ${escapeHtml(chapter.title)}">${index + 1}<span>. ${escapeHtml(chapter.title)}</span></a></li>`).join('')}</ol>`;

    document.querySelector('#chapters').innerHTML = workspace.chapters.map((chapter, index) => `
      <article id="${escapeHtml(chapter.id)}" class="chapter ${escapeHtml(chapter.status)}" data-chapter="${escapeHtml(chapter.id)}">
        <div class="trail-scenery" aria-hidden="true">${scenery(index)}</div>
        <div class="chapter-badge" role="img" aria-label="${escapeHtml(chapter.icon)} illustration">${icon(chapter.icon)}</div>
        <div class="chapter-card">
          ${chapter.status === 'latest' ? '<span class="you-are-here">You are here</span>' : ''}
          <p class="chapter-meta"><span>Chapter ${index + 1}</span><span>${escapeHtml(chapter.date)}</span>${chapter.status === 'next' ? '<span>To be continued</span>' : ''}</p>
          <h2>${escapeHtml(chapter.title)}</h2>
          <div class="kid-copy">${chapter.kid.map((text) => `<p>${escapeHtml(text)}</p>`).join('')}</div>
          <p class="learned"><strong>What I learned</strong>${escapeHtml(chapter.learned)}</p>
          <button class="chest-button" type="button" aria-expanded="false" aria-controls="deep-${escapeHtml(chapter.id)}">Open the chest</button>
          <div id="deep-${escapeHtml(chapter.id)}" class="deep-drawer" aria-hidden="true"><div><div class="deep-content"><p>${escapeHtml(chapter.deep)}</p>${chapter.article ? `<a class="article-link" href="${escapeHtml(chapter.article.href)}">Read: ${escapeHtml(chapter.article.title)}</a>` : ''}</div></div></div>
        </div>
      </article>`).join('');

    document.querySelectorAll('.chest-button').forEach((button) => {
      button.addEventListener('click', () => {
        const drawer = document.querySelector(`#${button.getAttribute('aria-controls')}`);
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
        button.textContent = open ? 'Open the chest' : 'Close the chest';
        drawer.setAttribute('aria-hidden', String(open));
      });
    });

    const first = document.querySelector('.chapter');
    document.querySelector('#first-control').addEventListener('click', () => first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }));

    const chapters = [...document.querySelectorAll('.chapter')];
    function drawTrail() {
      const trail = document.querySelector('#trail');
      const svg = trail.querySelector('.trail-line');
      const root = trail.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${root.width} ${root.height}`);
      const points = chapters.map((chapter) => {
        const badge = chapter.querySelector('.chapter-badge').getBoundingClientRect();
        return [badge.left - root.left + badge.width / 2, badge.top - root.top + badge.height / 2];
      });
      let path = `M${points[0].join(' ')}`;
      points.slice(1).forEach(([x, y], index) => {
        const [px, py] = points[index];
        const swing = window.innerWidth <= 640 ? 29 : root.width * 0.32;
        const bend = px + (index % 2 ? -swing : swing);
        const middle = (py + y) / 2;
        path += ` C${px} ${py + (y - py) * 0.25},${bend} ${middle - 50},${bend} ${middle} S${x} ${y - (y - py) * 0.25},${x} ${y}`;
      });
      svg.querySelectorAll('path').forEach((element) => element.setAttribute('d', path));
    }
    new ResizeObserver(drawTrail).observe(document.querySelector('#chapters'));
    drawTrail();
    const navLinks = [...document.querySelectorAll('[data-chapter-link]')];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.setAttribute('aria-current', String(link.dataset.chapterLink === visible.target.id)));
    }, { rootMargin: '-20% 0px -45% 0px', threshold: [0.15, 0.4, 0.7] });
    chapters.forEach((chapter) => observer.observe(chapter));

    const updateTrail = () => {
      if (reduceMotion) return;
      const trail = document.querySelector('#trail');
      const rect = trail.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.58 - rect.top) / (rect.height - window.innerHeight * 0.35)));
      document.documentElement.style.setProperty('--trail-offset', String(1 - progress));
    };
    window.addEventListener('scroll', updateTrail, { passive: true });
    updateTrail();

    const showLatest = () => {
      const requestedChapter = document.getElementById(window.location.hash.slice(1));
      const target = requestedChapter?.classList.contains('chapter') ? requestedChapter : document.getElementById(latest.id);
      target?.scrollIntoView({ behavior: 'instant', block: 'center' });
    };
    requestAnimationFrame(() => requestAnimationFrame(showLatest));
  }

  if (!data) throw new Error('WORLD data did not load.');
  if (document.body.dataset.page === 'home') renderHome();
  if (document.body.dataset.page === 'story') renderStory();
})();
