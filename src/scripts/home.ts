const notebook = document.querySelector<HTMLElement>('.home-notebook');
if (notebook) {
  const sections = [...notebook.querySelectorAll<HTMLElement>('[data-home-section]')];
  const links = [...notebook.querySelectorAll<HTMLAnchorElement>('[data-home-link]')];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  let activeId = '';
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  // Each drawing defines its own motion intervals and operations.
  const sceneParts = new Map(
    sections.map((section) => [
      section,
      [...section.querySelectorAll<SVGElement>('[data-motion]')].map((element) => ({
        element,
        kind: element.dataset.motion,
        start: Number(element.dataset.start ?? 0),
        end: Number(element.dataset.end ?? 1),
        x: Number(element.dataset.x ?? 0),
        y: Number(element.dataset.y ?? 0),
      })),
    ])
  );
  const update = () => {
    queued = false;
    // Start at the reading position, not while the next post enters the viewport.
    const activationLine = Math.min(160, innerHeight * 0.3);
    const bounds = sections.map((section) => section.getBoundingClientRect());
    const active = bounds.findIndex((rect) => rect.top <= activationLine && rect.bottom > activationLine);
    sections.forEach((section, index) => {
      const rect = bounds[index];
      const scene = section.querySelector<HTMLElement>('[data-home-scene]');
      if (scene) {
        // Keep the final state readable before the next article.
        const travel = Math.max(1, ((bounds[index + 1]?.top ?? rect.bottom) - rect.top) * 0.65);
        const progress = motionPreference.matches ? 1 : clamp((activationLine - rect.top) / travel);
        for (const part of sceneParts.get(section) ?? []) {
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
    });
    const nextId = sections[active]?.id ?? '';
    if (nextId !== activeId) {
      activeId = nextId;
      links.forEach((link) => {
        if (link.hash === `#${activeId}`) link.setAttribute('aria-current', 'location');
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
  const setMotion = () => {
    const reduced = motionPreference.matches;
    notebook.dataset.motion = reduced ? 'reduced' : 'enabled';
    requestUpdate();
  };
  motionPreference.addEventListener('change', setMotion);
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('pageshow', requestUpdate);
  setMotion();
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
