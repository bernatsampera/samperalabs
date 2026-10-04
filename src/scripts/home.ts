const notebook = document.querySelector<HTMLElement>('.home-notebook');
if (notebook) {
  const sections = [...notebook.querySelectorAll<HTMLElement>('[data-home-section]')];
  const links = [...notebook.querySelectorAll<HTMLAnchorElement>('[data-home-link]')];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const phoneScreen = matchMedia('(max-width: 760px)');
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  let queued = false;
  let activeId = '';
  const scenes = sections.flatMap((section) => {
    const scene = section.querySelector<HTMLElement>('[data-home-scene]');
    if (!scene) return [];
    return [
      {
        section,
        illustration: scene.querySelector('svg') ?? scene,
        grid: section.querySelector<HTMLElement>('.home-post-grid')!,
        controls: section.querySelector<HTMLElement>('[data-scene-controls]')!,
        hint: section.querySelector<HTMLElement>('[data-scene-hint]')!,
        progress: section.querySelector<HTMLElement>('[data-scene-progress]')!,
        fill: section.querySelector<HTMLElement>('[data-scene-progress-fill]')!,
        button: section.querySelector<HTMLButtonElement>('[data-scene-play]')!,
        buttonLabel: section.querySelector<HTMLElement>('[data-scene-play-label]')!,
        title: section.querySelector('h2')!.textContent!.trim(),
        started: null as number | null,
        manualProgress: null as number | null,
        playbackScroll: 0,
        played: false,
        parts: [...scene.querySelectorAll<SVGElement>('[data-motion]')].map((element) => ({
          element,
          kind: element.dataset.motion,
          start: Number(element.dataset.start ?? 0),
          end: Number(element.dataset.end ?? 1),
          x: Number(element.dataset.x ?? 0),
          y: Number(element.dataset.y ?? 0),
        })),
      },
    ];
  });
  const update = (now: number) => {
    queued = false;
    const activationLine = Math.min(160, innerHeight * 0.3);
    const bounds = sections.map((section) => section.getBoundingClientRect());
    const active = bounds.findIndex((rect) => rect.top <= activationLine && rect.bottom > activationLine);
    for (const state of scenes) {
      const rect = bounds[sections.indexOf(state.section)];
      const scrolling = state.section.dataset.sceneMode === 'scroll';
      const automatic = phoneScreen.matches && !motionPreference.matches;
      const illustration = state.illustration.getBoundingClientRect();
      const visibleHeight = Math.max(
        0,
        Math.min(illustration.bottom, innerHeight - 24) - Math.max(illustration.top, 88)
      );
      // Start once, when most of the illustration can be seen below the header.
      const requiredHeight = Math.min(illustration.height, Math.max(1, innerHeight - 112)) * 0.6;
      if (automatic && !state.played && !document.hidden && visibleHeight > 0 && visibleHeight >= requiredHeight) {
        state.started = now;
        state.manualProgress = 0;
        state.played = true;
      }
      // The section has 48px of padding at each end. Finish before sticky release.
      const travel = Math.max(1, rect.height - 96 - state.grid.offsetHeight);
      const scrollProgress = clamp((112 - rect.top - 48) / (travel * 0.8));
      if (
        rect.bottom <= 0 ||
        rect.top >= innerHeight ||
        document.hidden ||
        (automatic && (illustration.bottom <= 88 || illustration.top >= innerHeight)) ||
        motionPreference.matches ||
        (scrolling && Math.abs(scrollY - state.playbackScroll) > 8)
      ) {
        state.started = null;
        state.manualProgress = null;
      }
      let progress = state.manualProgress ?? (scrolling ? scrollProgress : automatic && !state.played ? 0 : 1);
      if (state.started !== null) {
        progress = clamp((now - state.started) / 3600);
        state.manualProgress = progress;
        if (progress === 1) state.started = null;
        else requestUpdate();
      }
      if (motionPreference.matches) progress = 1;
      const displayedProgress = !scrolling && !state.played ? 0 : progress;
      state.progress.setAttribute('aria-valuenow', String(Math.round(displayedProgress * 100)));
      state.fill.style.transform = 'scaleX(' + displayedProgress + ')';
      const playing = state.started !== null;
      state.hint.textContent = playing ? 'Playing' : scrolling && progress < 1 ? 'Scroll to animate' : '';
      const label = playing ? 'Stop' : (scrolling ? progress === 1 : state.played) ? 'Replay' : 'Play';
      state.buttonLabel.textContent = label;
      state.button.setAttribute('aria-label', label + ' animation: ' + state.title);
      for (const part of state.parts) {
        const fraction = clamp((progress - part.start) / Math.max(0.001, part.end - part.start));
        const eased = fraction * fraction * (3 - 2 * fraction);
        if (part.kind === 'draw') {
          part.element.style.strokeDasharray = '1';
          part.element.style.strokeDashoffset = String(1 - eased);
        } else {
          const leaving = part.kind === 'leave';
          const offset = leaving ? eased : 1 - eased;
          part.element.style.opacity = String(leaving ? 1 - eased : eased);
          part.element.style.transform = 'translate(' + part.x * offset + 'px, ' + part.y * offset + 'px)';
        }
      }
    }
    const nextId = sections[active]?.id ?? '';
    if (nextId !== activeId) {
      activeId = nextId;
      links.forEach((link) => {
        if (link.hash === '#' + activeId) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  };
  const requestUpdate = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  const measure = () => {
    for (const state of scenes) {
      state.controls.hidden = motionPreference.matches;
      const height = state.grid.offsetHeight;
      // Use manual playback when the whole scene cannot fit below the header.
      const mode = !motionPreference.matches && innerWidth > 1100 && height <= innerHeight - 136 ? 'scroll' : 'manual';
      if (state.section.dataset.sceneMode !== mode) {
        state.started = null;
        state.manualProgress = null;
        state.section.dataset.sceneMode = mode;
      }
      state.section.style.setProperty('--scene-height', height + 'px');
    }
    requestUpdate();
  };
  for (const state of scenes) {
    state.button.addEventListener('click', () => {
      if (motionPreference.matches) return;
      state.started = state.started === null ? performance.now() : null;
      state.manualProgress = state.started === null ? 1 : 0;
      state.playbackScroll = scrollY;
      state.played = true;
      requestUpdate();
    });
  }
  const observer = new ResizeObserver(measure);
  scenes.forEach((state) => observer.observe(state.grid));
  motionPreference.addEventListener('change', measure);
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden)
      scenes.forEach((state) => {
        state.started = null;
        state.manualProgress = null;
      });
    requestUpdate();
  });
  measure();
}

function revealPostIndex() {
  if (location.hash === '#all-posts') {
    const index = document.querySelector<HTMLDetailsElement>('#all-posts');
    if (index) index.open = true;
  }
}
window.addEventListener('hashchange', revealPostIndex);
revealPostIndex();

const postIndex = document.querySelector<HTMLDetailsElement>('.home-index');
const phoneIndex = matchMedia('(max-width: 760px)');
const setIndexLayout = () => {
  if (postIndex) postIndex.open = !phoneIndex.matches || location.hash === '#all-posts';
};
phoneIndex.addEventListener('change', setIndexLayout);
setIndexLayout();
