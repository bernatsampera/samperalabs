import '../assets/styles/maat-journey.css';

// The overview opens a real work item. All work areas remain available on the rail.
export function createMaatJourney({seasons, icons, host, onOpen, onClose, live}) {
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const items = seasons.flatMap((part, si) => part.chapters.map((chapter, ci) => ({chapter, si, ci})));
  const compact = matchMedia('(max-width: 899px), (max-height: 540px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const view = document.createElement('main');
  view.className = 'maat-journey';
  view.setAttribute('aria-label', 'MAAT work');
  view.hidden = true;
  const arrow = direction => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction === 'back' ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'}"/></svg>`;
  const region = `<svg class="journey-region" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true"><path d="M73 20C126 4 207 16 266 10 334 3 382 39 373 100 393 151 377 202 387 249 398 309 357 377 296 378 226 397 185 378 124 388 57 399 13 355 24 294 8 242 27 204 16 148 3 90 25 36 73 20Z" vector-effect="non-scaling-stroke"/></svg>`;
  view.innerHTML = `
    <header class="journey-top"><button type="button" class="journey-overview" data-journey="close">${arrow('back')}Overview</button></header>
    <div class="journey-layout">
      <nav class="journey-rail" aria-label="MAAT journey">
        <button type="button" class="journey-map-toggle" data-journey="map" aria-pressed="false">Full path</button>
        <div class="journey-world">
        <svg class="journey-route" aria-hidden="true"><path class="journey-route-ahead"/><path class="journey-route-travelled"/><circle class="journey-traveller" r="5"/></svg>
        ${seasons.map((part, si) => `<section class="journey-group" aria-labelledby="journey-group-${part.id}">
          ${region}
          <h2 id="journey-group-${part.id}">${esc(part.name)}</h2>
          <ol>${items.map((item, index) => item.si !== si ? '' : `<li class="journey-entry" data-entry="${index}">
            <button type="button" class="journey-stop" data-item="${index}" aria-controls="maat-journey-detail">
              <span class="journey-landmark"><span class="journey-dot"><svg viewBox="0 0 64 64" aria-hidden="true">${icons[item.chapter.icon] || ''}</svg></span></span>
              <span class="journey-stop-label">${esc(item.chapter.short)}</span>
            </button>
          </li>`).join('')}</ol>
        </section>`).join('')}
        </div>
      </nav>
      <div class="journey-stage"></div>
    </div>
    <footer class="journey-controls"><button type="button" data-journey="previous">${arrow('back')}Previous</button><button type="button" data-journey="next">Next${arrow('next')}</button></footer>`;
  host.appendChild(view);
  const rail = view.querySelector('.journey-rail');
  const world = view.querySelector('.journey-world');
  const route = view.querySelector('.journey-route');
  const routeAhead = view.querySelector('.journey-route-ahead');
  const routeTravelled = view.querySelector('.journey-route-travelled');
  const traveller = view.querySelector('.journey-traveller');
  const mapToggle = view.querySelector('.journey-map-toggle');
  const stage = view.querySelector('.journey-stage');
  const panel = document.createElement('article');
  panel.id = 'maat-journey-detail';
  panel.className = 'journey-detail';
  panel.setAttribute('aria-labelledby', 'journey-title');
  const previous = view.querySelector('[data-journey="previous"]');
  const next = view.querySelector('[data-journey="next"]');
  const stops = [...view.querySelectorAll('.journey-stop')];
  const groups = [...world.querySelectorAll('.journey-group')];
  const groupItems = groups.map((_, si) => items.flatMap((item, index) => item.si === si ? [index] : []));
  let selected = 0;
  let returnFocus = null;
  let motion = null;
  let travelFrame = 0;
  let fullPath = false;
  let points = [];
  let distances = [];
  let routeLength = 0;
  let routePosition = 0;
  let camera = {x: 0, y: 0, scale: 1};
  let worldHeight = 0;
  const worldWidth = 420;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function paintJourney() {
    if (!points.length) return;
    const point = routeAhead.getPointAtLength(routePosition);
    traveller.setAttribute('cx', point.x);
    traveller.setAttribute('cy', point.y);
    routeTravelled.style.strokeDasharray = `${routePosition} ${routeLength + 1}`;
    routeTravelled.style.visibility = routePosition > .5 ? '' : 'hidden';
    world.style.setProperty('--map-scale', compact.matches ? 1 : camera.scale);
    world.style.transform = compact.matches ? '' : `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
  }

  function focusedRegion() {
    const indexes = groupItems[items[selected].si];
    const first = points[indexes[0]].y;
    const last = points[indexes.at(-1)].y;
    return {top: first - 145, height: last - first + 255};
  }

  function cameraAt(scale) {
    const region = focusedRegion();
    return {
      x: (rail.clientWidth - worldWidth * scale) / 2,
      y: fullPath ? (rail.clientHeight - worldHeight * scale) / 2
        : clamp(rail.clientHeight / 2 - (region.top + region.height / 2) * scale, Math.min(0, rail.clientHeight - worldHeight * scale), 0),
      scale,
    };
  }

  function travel(animate = true) {
    cancelAnimationFrame(travelFrame);
    if (!points.length) return;
    const destination = distances[selected];
    const scale = Math.min(1, (rail.clientWidth - 16) / worldWidth,
      fullPath ? (rail.clientHeight - 56) / worldHeight : (rail.clientHeight - 32) / focusedRegion().height);
    if (compact.matches || reduced.matches || !animate) {
      routePosition = destination;
      camera = cameraAt(scale);
      paintJourney();
      return;
    }
    const from = routePosition;
    const fromCamera = {...camera};
    const toCamera = cameraAt(scale);
    const duration = clamp(Math.abs(destination - from) * .7, 500, 950);
    const start = performance.now();
    const frame = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t * t * (3 - 2 * t);
      routePosition = from + (destination - from) * eased;
      camera = {
        x: fromCamera.x + (toCamera.x - fromCamera.x) * eased,
        y: fromCamera.y + (toCamera.y - fromCamera.y) * eased,
        scale: fromCamera.scale + (scale - fromCamera.scale) * eased,
      };
      paintJourney();
      if (t < 1) travelFrame = requestAnimationFrame(frame);
    };
    travelFrame = requestAnimationFrame(frame);
  }

  function layoutPath() {
    if (view.hidden) return;
    cancelAnimationFrame(travelFrame);
    if (compact.matches) {
      world.style.height = '';
      const bounds = world.getBoundingClientRect();
      points = stops.map(button => {
        const dot = button.querySelector('.journey-dot').getBoundingClientRect();
        return {x: dot.left - bounds.left + dot.width / 2, y: dot.top - bounds.top + dot.height / 2};
      });
      route.setAttribute('viewBox', `0 0 ${world.clientWidth} ${world.scrollHeight}`);
    } else {
      const across = [.29, .7, .37, .72, .43];
      let y = 180;
      points = items.map((item, index) => {
        if (index) y += item.si === items[index - 1].si ? 240 : 360;
        return {x: worldWidth * across[index % across.length], y};
      });
      worldHeight = y + 150;
      world.style.height = `${worldHeight}px`;
      stops.forEach((button, index) => {
        button.style.setProperty('--stop-x', `${points[index].x}px`);
        button.style.setProperty('--stop-y', `${points[index].y}px`);
      });
      groups.forEach((group, si) => {
        const first = points[groupItems[si][0]];
        const last = points[groupItems[si].at(-1)];
        group.style.setProperty('--group-y', `${first.y - 110}px`);
        group.style.setProperty('--region-y', `${first.y - 145}px`);
        group.style.setProperty('--region-height', `${last.y - first.y + 255}px`);
      });
      route.setAttribute('viewBox', `0 0 ${worldWidth} ${worldHeight}`);
    }
    let d = `M${points[0].x} ${points[0].y}`;
    distances = [0];
    points.slice(1).forEach((point, index) => {
      const previous = points[index];
      const middle = (previous.y + point.y) / 2;
      if (!compact.matches && items[index].si !== items[index + 1].si) {
        // Enter the next island beside its title, then curve towards the first stop.
        const edge = point.x < worldWidth / 2 ? 36 : worldWidth - 36;
        d += `C${previous.x} ${previous.y + 90} ${edge} ${middle - 60} ${edge} ${middle}`;
        d += `C${edge} ${point.y - 48} ${point.x} ${point.y - 48} ${point.x} ${point.y}`;
      } else {
        d += `C${previous.x} ${middle} ${point.x} ${middle} ${point.x} ${point.y}`;
      }
      routeAhead.setAttribute('d', d);
      distances.push(routeAhead.getTotalLength());
    });
    routeTravelled.setAttribute('d', d);
    routeLength = routeAhead.getTotalLength();
    travel(false);
  }

  function placePanel() {
    const active = document.activeElement;
    const parent = compact.matches ? view.querySelector(`[data-entry="${selected}"]`) : stage;
    if (panel.parentElement !== parent) {
      parent.appendChild(panel);
      if (active instanceof HTMLElement && panel.contains(active)) active.focus({preventScroll: true});
    }
  }

  function show(index, {focus = true, railFocus = false, updateUrl = true, animate = true} = {}) {
    selected = Math.max(0, Math.min(items.length - 1, index));
    const {chapter: c, si, ci} = items[selected];
    const detail = c.detail;
    stops.forEach((button, i) => {
      button.classList.toggle('is-selected', i === selected);
      button.tabIndex = compact.matches || i === selected ? 0 : -1;
      if (i === selected) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    panel.innerHTML = `
      <h1 id="journey-title" tabindex="-1">${esc(c.title)}</h1>
      <div class="journey-content">
        <div class="journey-copy">
          ${c.simple.map(text => `<p>${esc(text)}</p>`).join('')}
          ${detail?.result ? `<p>${esc(detail.result)}</p>` : ''}
          ${c.article ? `<a class="journey-article" href="${esc(c.article.href)}">Read the article${arrow('next')}</a>` : ''}
        </div>
        ${detail ? `<figure class="journey-visual">
          ${detail.metric ? `<div class="journey-metric"><div><span>${esc(detail.metric.before)}</span><i aria-hidden="true">→</i><strong>${esc(detail.metric.after)}</strong></div><p>${esc(detail.metric.label)}</p></div>` : ''}
          ${detail.image ? `<a class="journey-image" href="${esc(detail.image.src)}" target="_blank" rel="noopener" aria-label="Enlarge the product screen"><img src="${esc(detail.image.src)}" alt="${esc(detail.image.alt)}" width="${detail.image.width}" height="${detail.image.height}"></a><figcaption>${esc(detail.caption)}</figcaption>` : `<ol class="journey-flow">${detail.flow.map(label => `<li>${esc(label)}</li>`).join('')}</ol>`}
        </figure>` : ''}
      </div>`;
    placePanel();
    stage.scrollTop = 0;
    fullPath = false;
    mapToggle.setAttribute('aria-pressed', 'false');
    mapToggle.textContent = 'Full path';
    if (compact.matches || !points.length) layoutPath();
    else travel(animate);
    previous.disabled = selected === 0;
    next.innerHTML = selected === items.length - 1 ? `Overview${arrow('next')}` : `Next${arrow('next')}`;
    next.setAttribute('aria-label', selected === items.length - 1 ? 'Return to overview' : `Next: ${items[selected + 1].chapter.short}`);
    previous.setAttribute('aria-label', selected > 0 ? `Previous: ${items[selected - 1].chapter.short}` : 'Previous');
    document.documentElement.dataset.view = 'season';
    document.documentElement.dataset.season = String(seasons[si].id);
    document.documentElement.dataset.step = String(ci + 1);
    if (updateUrl) history.replaceState(null, '', `#${c.id}`);
    live.textContent = c.title;
    motion?.cancel();
    if (!reduced.matches) motion = panel.animate([{opacity: .4, transform: 'translateY(6px)'}, {opacity: 1, transform: 'none'}], {duration: 180, easing: 'ease-out'});
    if (focus) {
      if (compact.matches) stops[selected].scrollIntoView({block: 'start', behavior: 'auto'});
      (railFocus ? stops[selected] : panel.querySelector('h1')).focus({preventScroll: true});
    }
  }

  function close({updateUrl = true} = {}) {
    if (view.hidden) return;
    motion?.cancel();
    cancelAnimationFrame(travelFrame);
    view.hidden = true;
    onClose();
    if (updateUrl) history.replaceState(null, '', location.pathname + location.search);
    live.textContent = 'MAAT overview';
    const fallback = document.querySelector(`#home [data-act="enter"][data-si="${items[selected].si}"]`);
    (returnFocus?.isConnected && returnFocus !== document.body ? returnFocus : fallback)?.focus({preventScroll: true});
  }

  function open(si, {target = 1, chapterId, updateUrl = true} = {}) {
    const index = chapterId ? items.findIndex(item => item.chapter.id === chapterId)
      : items.findIndex(item => item.si === si && item.ci === Math.max(0, target - 1));
    if (index < 0) return false;
    const entering = view.hidden;
    if (entering) returnFocus = document.activeElement;
    onOpen();
    view.hidden = false;
    if (entering) layoutPath();
    show(index, {updateUrl, animate: !entering});
    return true;
  }

  function followHash() {
    const hash = location.hash.slice(1);
    const si = seasons.findIndex(part => `part-${part.id}` === hash);
    if (si >= 0) return open(si, {updateUrl: false});
    if (items.some(item => item.chapter.id === hash)) return open(0, {chapterId: hash, updateUrl: false});
    if (!hash && !view.hidden) close({updateUrl: false});
    return false;
  }

  view.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.item !== undefined) show(Number(button.dataset.item));
    else if (button.dataset.journey === 'map') {
      fullPath = !fullPath;
      mapToggle.setAttribute('aria-pressed', String(fullPath));
      mapToggle.textContent = fullPath ? 'Focus' : 'Full path';
      travel();
    }
    else if (button.dataset.journey === 'close') close();
    else if (button.dataset.journey === 'previous') show(selected - 1);
    else if (button.dataset.journey === 'next') selected === items.length - 1 ? close() : show(selected + 1);
  });
  view.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (!rail.contains(event.target) || !event.target.closest('.journey-stop')) return;
    const target = event.key === 'ArrowDown' ? selected + 1 : event.key === 'ArrowUp' ? selected - 1
      : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
    if (target !== null) { event.preventDefault(); show(target, {railFocus: true}); }
  });
  compact.addEventListener('change', () => {
    if (view.hidden) return;
    if (compact.matches) {
      fullPath = false;
      mapToggle.setAttribute('aria-pressed', 'false');
      mapToggle.textContent = 'Full path';
    }
    placePanel();
    stops.forEach((button, i) => { button.tabIndex = compact.matches || i === selected ? 0 : -1; });
    world.style.transform = '';
    layoutPath();
  });
  new ResizeObserver(layoutPath).observe(rail);
  reduced.addEventListener('change', () => {
    if (!view.hidden && reduced.matches) {
      motion?.cancel();
      travel(false);
    }
  });
  addEventListener('hashchange', followHash);
  return {
    open, close, followHash,
    go: step => open(items[selected].si, {target: step}),
    get isOpen() { return !view.hidden; },
    get season() { return items[selected].si; },
    get step() { return items[selected].ci + 1; },
  };
}
