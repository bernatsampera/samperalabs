(function () {
  'use strict';

  const world = window.WORLD;
  if (!world) throw new Error('World data is not available.');

  const colors = { maat: '#E4412F', gcontext: '#2F6FE4', bjjgym: '#2FA25B', indoeuromap: '#F5B700' };
  const ink = '#1E1E28';
  const svgNS = 'http://www.w3.org/2000/svg';

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
  }

  function iconSvg(name, color) {
    const common = `fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;
    const fills = `fill="${color}" stroke="${ink}" stroke-width="7"`;
    const drawings = {
      heads: `<circle cx="58" cy="65" r="27" ${fills}/><circle cx="132" cy="65" r="27" fill="#FFF8EC" stroke="${ink}" stroke-width="7"/><path d="M18 158c4-38 20-57 48-57s43 19 47 57M94 158c4-38 20-57 48-57s43 19 47 57" ${common}/><path d="M82 67h26" ${common}/>`,
      brain: `<path d="M98 35c-22-17-53-2-50 25-25 4-31 40-8 52-11 29 21 50 44 34 12 25 50 19 52-8 28 6 48-27 30-47 17-22-5-53-28-51 0-28-33-39-50-22Z" fill="${color}" stroke="${ink}" stroke-width="7"/><path d="M96 44v96M69 59c18 5 25 18 22 37M122 66c-15 7-21 18-18 34M58 113c18-5 28 0 35 17M130 111c17 0 27 8 29 23" ${common}/>`,
      tree: `<path d="M96 160V74M96 98 54 62M96 116l48-39M96 137l-35-5" ${common}/><rect x="50" y="31" width="43" height="35" rx="8" ${fills}/><rect x="126" y="48" width="45" height="35" rx="8" fill="#FFF8EC" stroke="${ink}" stroke-width="7"/><rect x="37" y="116" width="45" height="35" rx="8" fill="#FFF8EC" stroke="${ink}" stroke-width="7"/><rect x="76" y="145" width="42" height="27" rx="7" ${fills}/>`,
      photo: `<rect x="25" y="30" width="150" height="125" rx="13" fill="#FFF8EC" stroke="${ink}" stroke-width="7"/><circle cx="65" cy="68" r="14" fill="${color}" stroke="${ink}" stroke-width="7"/><path d="m42 136 39-39 27 26 20-18 31 31" ${common}/><path d="M75 171h50" ${common}/>`,
      chat: `<path d="M28 39h144v94H91l-35 28v-28H28Z" fill="${color}" stroke="${ink}" stroke-width="7"/><circle cx="69" cy="85" r="6" fill="${ink}"/><circle cx="100" cy="85" r="6" fill="${ink}"/><circle cx="131" cy="85" r="6" fill="${ink}"/>`,
      blank: `<rect x="36" y="26" width="128" height="140" rx="12" fill="#FFF8EC" stroke="${ink}" stroke-width="7"/><path d="M68 68h65M68 96h65" ${common}/><path d="m76 143 48-48" stroke="${color}" stroke-width="12" stroke-linecap="round"/>`,
      files: `<path d="M38 47h52l13 15h61v94H38Z" fill="${color}" stroke="${ink}" stroke-width="7"/><path d="M52 31h52l13 16h43" ${common}/><path d="M66 91h70M66 116h52" ${common}/>`,
      map: `<path d="m25 48 49-19 52 19 49-19v123l-49 19-52-19-49 19Z" fill="#FFF8EC" stroke="${ink}" stroke-width="7"/><path d="M74 29v123M126 48v123" ${common}/><path d="M42 124 68 92l28 17 25-39 36 29" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
      save: `<path d="M37 27h112l20 20v124H37Z" fill="${color}" stroke="${ink}" stroke-width="7"/><rect x="66" y="31" width="65" height="47" fill="#FFF8EC" stroke="${ink}" stroke-width="7"/><circle cx="103" cy="126" r="27" fill="#FFF8EC" stroke="${ink}" stroke-width="7"/>`,
      question: `<path d="M65 68c2-24 18-39 42-39 25 0 43 15 43 38 0 18-9 27-27 37-15 8-20 18-20 32" ${common}/><circle cx="103" cy="164" r="7" fill="${color}" stroke="${ink}" stroke-width="5"/>`,
    };
    return `<svg viewBox="0 0 200 200" role="img" aria-label="${escapeText(name)} illustration">${drawings[name] || drawings.question}</svg>`;
  }

  function svgElement(name, attrs = {}) {
    const element = document.createElementNS(svgNS, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function addSvgText(group, x, y, text, className, anchor = 'start') {
    const label = svgElement('text', { x, y, class: className, 'text-anchor': anchor });
    label.textContent = text;
    group.append(label);
  }

  function renderHome() {
    const host = document.querySelector('#metro-map');
    if (!host) return;
    const mobile = matchMedia('(max-width: 760px)').matches;
    const maat = world.workspaces.find(w => w.id === 'maat');
    const gc = world.workspaces.find(w => w.id === 'gcontext');
    const width = mobile ? 350 : Math.max(1240, maat.chapters.length * 220 + 140);
    const redEnd = mobile ? 120 + (maat.chapters.length - 1) * 90 : width - 100;
    const cross = mobile ? { x: 50, y: redEnd + 100 } : { x: 100 + (Math.floor(maat.chapters.length / 2) - .5) * ((width - 200) / Math.max(1, maat.chapters.length - 1)), y: 320 };
    const bluePoints = gc.chapters.map((c, i) => mobile
      ? { x: 300, y: cross.y + 190 + i * 90 }
      : { x: cross.x, y: i < 2 ? 80 + i * 110 : 440 + (i - 2) * 110 });
    const height = mobile ? bluePoints.at(-1).y + 190 : Math.max(750, bluePoints.at(-1).y + 90);
    const svg = svgElement('svg', { viewBox: `0 0 ${width} ${height}`, role: 'group', 'aria-label': "Bernat's metro network" });
    host.replaceChildren(svg);
    host.style.aspectRatio = `${width} / ${height}`;

    function track(parent, points, color, size, dashed = false) {
      parent.append(svgElement('polyline', { points: points.map(p => `${p.x},${p.y}`).join(' '), class: 'map-track', stroke: color, 'stroke-width': size, ...(dashed ? {'stroke-dasharray': '12 12'} : {}) }));
    }
    function sign(parent, x, y, text, kind = 'line-sign', fill = 'white', w = 210) {
      const group = svgElement('g', { 'data-collision': kind + ': ' + text });
      group.append(svgElement('rect', { x, y, width: w, height: 40, rx: 10, fill, stroke: ink, 'stroke-width': 3 }));
      addSvgText(group, x + 12, y + 26, text, fill === colors.purple ? 'you-text' : 'svg-sign-text');
      parent.append(group);
    }
    function lineLink(item) {
      const link = svgElement('a', { href: item.href || `story.html?w=${item.id}`, class: 'metro-line', 'aria-label': item.name });
      if (item.href) { link.setAttribute('target', '_blank'); link.setAttribute('rel', 'noreferrer'); }
      link.addEventListener('mouseenter', () => showLine(item));
      link.addEventListener('focusin', () => showLine(item));
      link.addEventListener('mouseleave', resetLineMessage);
      svg.append(link);
      return link;
    }
    function station(parent, point, chapter, i, blue) {
      const station = svgElement('g', { tabindex: '0', 'aria-label': chapter.title });
      const title = svgElement('title');
      title.textContent = chapter.title;
      station.append(title, svgElement('circle', { cx: point.x, cy: point.y, r: 11, class: 'station-dot' }));
      const words = chapter.short || chapter.title.split(/\s+/).slice(0, 3).join(' ');
      const endpoint = !blue && (i === 0 || i === maat.chapters.length - 1);
      const label = svgElement('text', { x: mobile ? point.x + (blue ? -25 : 25) : point.x + (blue ? 25 : 0), y: point.y + (mobile || blue ? 5 : endpoint ? -30 : 40), 'text-anchor': mobile && blue ? 'end' : (!mobile && !blue ? 'middle' : 'start'), class: 'station-name', 'data-collision': chapter.id });
      label.textContent = `${i + 1}. ${words}`;
      station.append(label);
      station.addEventListener('focus', () => { document.querySelector('#line-message').innerHTML = `<span>Station ${i + 1}</span><strong>${escapeText(chapter.title)}</strong>`; });
      parent.append(station);
    }
    const redPoints = maat.chapters.map((c, i) => mobile ? { x: 50, y: 120 + i * 90 } : { x: 100 + i * (width - 200) / Math.max(1, maat.chapters.length - 1), y: 320 });
    const red = lineLink(maat);
    track(red, mobile ? [{x: 50, y: 90}, {x: 50, y: cross.y}] : redPoints, colors.maat, 14);
    sign(red, mobile ? 25 : 30, mobile ? 20 : 220, maat.name + ' line');
    redPoints.forEach((p, i) => station(red, p, maat.chapters[i], i, false));
    const blue = lineLink(gc);
    const blueStart = mobile ? [{x: 50, y: cross.y}, {x: 300, y: cross.y}, bluePoints[0]] : [bluePoints[0]];
    track(blue, blueStart, colors.gcontext, 10);
    bluePoints.forEach((p, i) => {
      if (i) track(blue, [bluePoints[i - 1], p], colors.gcontext, 10, gc.chapters[i].status === 'next');
    });
    bluePoints.forEach((p, i) => station(blue, p, gc.chapters[i], i, true));
    sign(blue, mobile ? 65 : cross.x + 35, mobile ? cross.y + 100 : 5, gc.name + ' line');
    svg.append(svgElement('circle', { cx: cross.x, cy: cross.y, r: 20, class: 'station-dot interchange' }));
    sign(svg, mobile ? 80 : cross.x - 160, mobile ? cross.y - 65 : 260, 'Context', 'station-label', 'white', 120);
    sign(svg, mobile ? 25 : cross.x - 265, mobile ? cross.y + 35 : 405, 'You are here: Bernat', 'pill', '#EADCFB', 235);
    world.products.forEach((product, i) => {
      const link = lineLink(product);
      svg.insertBefore(link, red);
      const y = mobile ? (i ? bluePoints.at(-1).y + 85 : 70) : 500;
      const x = mobile ? 300 : (i ? width - 100 : 100);
      const start = mobile ? (i ? { x, y: bluePoints.at(-1).y } : {x: 50, y: 90}) : {x, y: 320};
      // The green branch occupies the left edge. The yellow branch occupies the right edge.
      track(link, mobile && !i ? [start, {x: 280, y: 90}, {x, y}] : [start, {x, y}], colors[product.id], 10);
      link.append(svgElement('circle', {cx: x, cy: y, r: 11, class: 'station-dot'}));
      const label = svgElement('text', {x: mobile ? 330 : x, y: mobile && !i ? 40 : y + 40, 'text-anchor': mobile ? 'end' : 'middle', class: 'station-name', 'data-collision': product.name});
      label.textContent = product.name;
      link.append(label);
    });
    // Capsule centres stay on straight track sections throughout their short journey.
    [{x: mobile ? 50 : redPoints[0].x + 65, y: mobile ? 155 : 320, vertical: mobile, color: colors.maat},
      {x: mobile ? 300 : cross.x, y: mobile ? bluePoints[0].y + 30 : 110, vertical: true, color: colors.gcontext}].forEach(t => {
      const train = svgElement('rect', {x: t.x - (t.vertical ? 8 : 18), y: t.y - (t.vertical ? 18 : 8), width: t.vertical ? 16 : 36, height: t.vertical ? 36 : 16, rx: 8, fill: t.color, stroke: ink, 'stroke-width': 3, class: t.vertical ? 'grid-train vertical' : 'grid-train', 'aria-hidden': 'true'});
      svg.append(train);
    });
    renderLegend();
    renderPerson();
    renderPrinciples();
    let previousMobile = mobile;
    window.addEventListener('resize', () => {
      if (matchMedia('(max-width: 760px)').matches !== previousMobile) location.reload();
    }, { once: true });
  }
  function showLine(item) {
    const message = document.querySelector('#line-message');
    message.innerHTML = `<span>${item.name}</span><strong>${escapeText(item.oneLiner || item.kid)}</strong>`;
  }

  function resetLineMessage() {
    document.querySelector('#line-message').innerHTML = '<span>Choose a line</span><strong>Each route tells a story.</strong>';
  }

  function renderLegend() {
    const legend = document.querySelector('#legend');
    legend.innerHTML = '<h2>NETWORK LINES</h2>';
    world.workspaces.forEach(item => {
      legend.insertAdjacentHTML('beforeend', `<div class="legend-row"><span class="legend-line" style="background:${colors[item.id]}"></span><span><strong>${escapeText(item.name)}</strong><small>${escapeText(item.kind)}</small></span></div>`);
    });
    world.products.forEach(item => {
      legend.insertAdjacentHTML('beforeend', `<div class="legend-row"><span class="legend-line" style="background:${colors[item.id]}"></span><span><strong>${escapeText(item.name)}</strong><small>Side project</small></span></div>`);
    });
  }

  function renderPerson() {
    const person = world.person;
    document.querySelector('#person-role').textContent = person.role;
    document.querySelector('#person-kid').textContent = person.kid;
    document.querySelector('#person-motto').innerHTML = `<strong>${escapeText(person.motto)}</strong><br>${escapeText(person.mottoLong)}`;
    document.querySelector('#person-about').innerHTML = person.about.map(text => `<p>${escapeText(text)}</p>`).join('');
  }

  function renderPrinciples() {
    const tabs = document.querySelector('#principle-tabs');
    world.principles.forEach((principle, index) => {
      const button = document.createElement('button');
      button.className = 'principle-tab';
      button.type = 'button';
      button.role = 'tab';
      button.id = `principle-tab-${index}`;
      button.setAttribute('aria-controls', 'principle-panel');
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.setAttribute('aria-label', `Principle ${principle.n}: ${principle.title}`);
      button.textContent = principle.n;
      button.addEventListener('click', () => selectPrinciple(index));
      tabs.append(button);
    });
    selectPrinciple(0);
  }

  function selectPrinciple(index) {
    const principle = world.principles[index];
    document.querySelectorAll('.principle-tab').forEach((button, buttonIndex) => button.setAttribute('aria-selected', buttonIndex === index ? 'true' : 'false'));
    const panel = document.querySelector('#principle-panel');
    panel.setAttribute('aria-labelledby', `principle-tab-${index}`);
    panel.innerHTML = `<h3>${escapeText(principle.title)}</h3><p class="rule-kid">${escapeText(principle.kid)}</p><p class="principle-example"><strong>ON THE NETWORK</strong>${escapeText(principle.example)}</p>`;
  }

  function renderStory() {
    const chaptersHost = document.querySelector('#chapters');
    if (!chaptersHost) return;
    const requested = new URLSearchParams(window.location.search).get('w');
    const workspace = world.workspaces.find(item => item.id === requested) || world.workspaces.find(item => item.id === 'maat');
    const other = world.workspaces.find(item => item.id !== workspace.id);
    document.body.dataset.workspace = workspace.id;
    document.title = `${workspace.name} Line | Bernat's Metro`;
    document.querySelector('#line-identity').textContent = `${workspace.name} line`;
    const miniMap = document.querySelector('#mini-map');

    workspace.chapters.forEach((chapter, index) => {
      const mini = document.createElement('a');
      mini.href = `#${chapter.id}`;
      mini.className = `mini-stop ${chapter.status === 'next' ? 'next' : ''}`;
      mini.dataset.target = chapter.id;
      mini.textContent = `${index + 1}. ${chapter.title}`;
      miniMap.append(mini);

      const article = chapter.article ? `<a class="article-link" href="${escapeText(chapter.article.href)}">Read: ${escapeText(chapter.article.title)}</a>` : '';
      const label = chapter.status === 'latest' ? '<span class="stop-label">Last stop so far</span>' : chapter.status === 'next' ? '<span class="stop-label">Under construction</span>' : '';
      const articleElement = document.createElement('article');
      articleElement.className = `chapter ${chapter.status}`;
      articleElement.id = chapter.id;
      articleElement.dataset.index = index;
      articleElement.innerHTML = `${label}<span class="station-node" aria-hidden="true"></span><time class="chapter-date">${escapeText(chapter.date)}</time><div class="chapter-card"><h1 class="station-sign">${escapeText(chapter.title)}</h1><div class="chapter-body"><div class="kid-copy">${chapter.kid.map(text => `<p class="kid-sentence">${escapeText(text)}</p>`).join('')}</div><div class="chapter-visual">${iconSvg(chapter.icon, colors[workspace.id])}</div><p class="learned"><strong>WHAT I LEARNED</strong>${escapeText(chapter.learned)}</p><button class="detail-toggle" type="button" aria-expanded="false" aria-controls="detail-${chapter.id}">Change here for the full chapter</button><div class="deep-detail" id="detail-${chapter.id}" hidden><p>${escapeText(chapter.deep)}</p>${article}</div></div></div>`;
      chaptersHost.append(articleElement);
    });

    document.querySelectorAll('.detail-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const panel = document.querySelector(`#${button.getAttribute('aria-controls')}`);
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        button.textContent = isOpen ? 'Change here for the full chapter' : 'Close the full chapter';
        panel.hidden = isOpen;
      });
    });

    const first = workspace.chapters[0];
    document.querySelector('#first-stop').addEventListener('click', () => document.querySelector(`#${first.id}`).scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' }));
    document.querySelector('#change-line').innerHTML = `<p>Change here for the ${escapeText(other.name)} line.</p><a href="story.html?w=${other.id}">Ride the ${escapeText(other.name)} line</a>`;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setCurrentStation(entry.target.id);
      });
    }, { rootMargin: '-35% 0px -50% 0px' });
    document.querySelectorAll('.chapter').forEach(chapter => observer.observe(chapter));
    window.addEventListener('scroll', updateTrain, { passive: true });

    const latest = workspace.chapters.find(chapter => chapter.status === 'latest') || workspace.chapters[workspace.chapters.length - 1];
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const target = document.querySelector(`#${latest.id}`);
        const top = window.scrollY + target.getBoundingClientRect().top - 175;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, top);
        requestAnimationFrame(() => document.documentElement.style.removeProperty('scroll-behavior'));
        setCurrentStation(latest.id);
        updateTrain();
      }));
    });
  }

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setCurrentStation(id) {
    document.querySelectorAll('.mini-stop').forEach(link => {
      link.classList.toggle('current', link.dataset.target === id);
      if (link.dataset.target === id) {
        const map = link.parentElement;
        const left = link.offsetLeft - ((map.clientWidth - link.clientWidth) / 2);
        map.scrollTo({ left, behavior: reducedMotion() ? 'auto' : 'smooth' });
      }
    });
  }

  function updateTrain() {
    const marker = document.querySelector('#train-marker');
    if (!marker) return;
    const nodes = [...document.querySelectorAll('.station-node')];
    const anchor = document.querySelector('#story-strip').getBoundingClientRect().bottom + 110;
    const node = nodes.reduce((best, item) => {
      const center = el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
      return Math.abs(center(item) - anchor) < Math.abs(center(best) - anchor) ? item : best;
    });
    const rect = node.getBoundingClientRect();
    marker.style.top = `${rect.top + rect.height / 2 - marker.offsetHeight / 2}px`;
    marker.style.left = `${rect.left + rect.width / 2 - marker.offsetWidth / 2}px`;
    setCurrentStation(node.closest('.chapter').id);
  }

  renderHome();
  renderStory();
})();
