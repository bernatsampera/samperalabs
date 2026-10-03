const notebook = document.querySelector<HTMLElement>('.home-notebook');
if (notebook) {
  const sections = [...notebook.querySelectorAll<HTMLElement>('[data-home-section]')];
  const links = [...notebook.querySelectorAll<HTMLAnchorElement>('[data-home-link]')];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  let activeId = '';
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
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
        const steps = scene.querySelectorAll('[data-scene-step]');
        // Complete the sequence early enough to read the final state before the next post.
        const travel = Math.max(1, ((bounds[index + 1]?.top ?? rect.bottom) - rect.top) * 0.65);
        const phase = Math.min(steps.length - 1, Math.floor(clamp((activationLine - rect.top) / travel) * steps.length));
        steps.forEach((node, step) => {
          const selected = motionPreference.matches ? step === steps.length - 1 : index === active && step === phase;
          node.classList.toggle('is-current', selected);
        });
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

function revealPostIndex() { if (location.hash === '#all-posts') { const index = document.querySelector<HTMLDetailsElement>('#all-posts'); if(index) index.open = true; } }
window.addEventListener('hashchange', revealPostIndex);
revealPostIndex();

const postIndex = document.querySelector<HTMLDetailsElement>('.home-index');
const phoneIndex = matchMedia('(max-width: 760px)');
const setIndexLayout = () => { if(postIndex) postIndex.open = !phoneIndex.matches || location.hash === '#all-posts'; };
phoneIndex.addEventListener('change', setIndexLayout);
setIndexLayout();
