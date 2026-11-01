(() => {
// Hero concepts: the shared behaviour.
// A small stand-in for Jev: it scores each experience by the words of the question.
// On the site, Jev returns the real probabilities with the same shape: [{id, p}].

const EXPERIENCES = [
  { id: 'who', title: 'Who is Bernat', ask: 'Who is Bernat Sampera?', strong: 'who bernat sampera yourself', weak: 'engineer role background hello' },
  { id: 'now', title: 'What I work on now', ask: 'What are you working on now?', strong: 'now currently today', weak: 'working focus days' },
  { id: 'projects', title: 'Projects', ask: 'Show me your projects.', strong: 'projects project portfolio', weak: 'built build made working show' },
  { id: 'maat', title: 'MAAT', ask: 'What do you do at MAAT?', strong: 'maat company native', weak: 'gyms brain job employer' },
  { id: 'memory', title: 'AI has no memory', ask: 'How should AI store and find information?', strong: 'memory remember gcontext context store information forget', weak: 'knowledge find research' },
  { id: 'agents', title: 'AI agents', ask: 'How do you build AI agents?', strong: 'agents agent langgraph', weak: 'build admin support tools' },
  { id: 'principles', title: 'How I think about AI', ask: 'How do you think about AI?', strong: 'think opinion principles believe philosophy', weak: 'view ideas' },
  { id: 'articles', title: 'Articles', ask: 'What have you written?', strong: 'articles article written write writing blog posts post', weak: 'essays read' },
  { id: 'bjjgym', title: 'BJJGym', ask: 'What is BJJGym?', strong: 'bjjgym bjj jiu jitsu', weak: 'gym gyms travel' },
  { id: 'indoeuromap', title: 'IndoEuroMap', ask: 'What is IndoEuroMap?', strong: 'indoeuromap map maps city', weak: 'patterns' },
  { id: 'site', title: 'How this site works', ask: 'How does this site work?', strong: 'site website jev search chatbot', weak: 'works page matches' },
];
const SAMPLES = ['Who is Bernat Sampera?', 'What are you working on now?', 'Show me your projects.'];
const DEMO = ['How do you build AI agents?', 'How should AI remember my work?', 'What have you written?', 'What are you working on now?'];

const STOP = new Set(['the', 'and', 'what', 'how', 'does', 'did', 'are', 'your', 'you', 'about', 'with', 'for', 'this', 'that', 'can', 'should', 'have', 'has', 'his', 'her', 'tell', 'show', 'from', 'into', 'some', 'any', 'all', 'been', 'was', 'were', 'will', 'would', 'could', 'there', 'where', 'which', 'why', 'when', 'who', 'is', 'do', 'me', 'my', 'of', 'to', 'in', 'on', 'at', 'an', 'a']);
const tokens = (q) => q.toLowerCase().split(/[^a-z]+/).filter((t) => t.length >= 3 && (!STOP.has(t) || t === 'who'));
const hit = (t, w) => w === t || (t.length >= 4 && w.startsWith(t)) || (w.length >= 4 && t.startsWith(w));
const words = (s) => s.split(' ').filter(Boolean);

/** The stand-in matcher. Returns experiences sorted by probability; `top` is null when nothing matches. */
function match(q) {
  const ts = tokens(q);
  const scored = EXPERIENCES.map((e) => {
    let s = 0;
    for (const t of ts) {
      if (words(e.strong).some((w) => hit(t, w))) s += 3;
      else if (words(e.weak).some((w) => hit(t, w))) s += 1;
    }
    return { id: e.id, title: e.title, s };
  });
  const sum = scored.reduce((a, b) => a + b.s, 0);
  const list = scored.map(({ id, title, s }) => ({ id, title, p: sum ? s / sum : 0 })).sort((a, b) => b.p - a.p);
  return { list, top: sum ? list[0] : null, tokens: ts, active: ts.length > 0 };
}

/** Wires the dock. onText fires on every change of the question (typing, chips, demo). */
function initDock({ onText, onSubmit }) {
  const field = document.querySelector('[data-field]');
  const form = document.querySelector('[data-form]');
  const send = form.querySelector('.send');
  const params = new URLSearchParams(location.search);
  field.addEventListener('input', () => onText(field.value, 'typing'));
  document.querySelectorAll('[data-chip]').forEach((b) => b.addEventListener('click', () => {
    field.value = b.dataset.chip; onText(field.value, 'chip'); field.focus();
  }));
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    send.setAttribute('aria-busy', 'true');
    setTimeout(() => send.removeAttribute('aria-busy'), 700);
    onSubmit?.(field.value);
  });
  const preset = params.get('q');
  if (preset !== null) { field.value = preset; onText(preset, 'preset'); return { field, demo: null }; }
  if (params.get('demo') === '0') { onText('', 'idle'); return { field, demo: null }; }
  return { field, demo: demo(field, DEMO, onText) };
}

/** The idle demonstration: sample questions type themselves into the placeholder, and the hero answers.
    It stops for good the moment the visitor touches the field. Reduced motion: one static example. */
function demo(field, questions, onText, { hold = 2400, speed = 48, start = 900 } = {}) {
  const orig = field.placeholder;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, j = 0, timer, stopped = false;
  const stop = () => { if (stopped) return; stopped = true; clearTimeout(timer); field.placeholder = orig; onText(field.value, 'idle'); };
  field.addEventListener('focus', stop, { once: true });
  field.addEventListener('input', stop, { once: true });
  if (reduced) { field.placeholder = questions[0]; onText(questions[0], 'demo'); return { stop }; }
  const tick = () => {
    if (stopped) return;
    const q = questions[i];
    if (j <= q.length) { field.placeholder = q.slice(0, j); onText(q.slice(0, j), 'demo'); j++; timer = setTimeout(tick, speed); return; }
    timer = setTimeout(() => { j = 0; i = (i + 1) % questions.length; field.placeholder = ''; onText('', 'demo'); timer = setTimeout(tick, 600); }, hold);
  };
  timer = setTimeout(tick, start);
  return { stop };
}

const NAV = `<header class="nav"><div class="col">
  <nav class="nav-side" aria-label="Main"><a class="pill line" href="#">Work</a><a class="pill" href="#">Writing</a><a class="pill" href="#">About</a></nav>
  <div class="nav-side"><a class="pill" href="#">X</a><a class="pill" href="#">LinkedIn</a><button type="button" class="pill solid">Copy Email</button></div>
</div></header>`;

const DOCK = `<div class="dock">
  <div class="chips">${SAMPLES.map((s) => `<button type="button" class="pill" data-chip="${s}">${s}</button>`).join('')}</div>
  <form class="form" role="search" data-form>
    <label class="sr-only" for="q">Ask a question about Bernat and his work</label>
    <input class="field" id="q" name="q" type="text" maxlength="300" autocomplete="off" spellcheck="false" placeholder="Ask me about my work" data-field>
    <button class="browse" type="button" aria-label="Browse all topics"><svg class="ico" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 3h8M2 6h8M2 9h5"/></svg></button>
    <button class="send" type="submit" aria-label="Ask"><svg class="ico" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 10V2.5M2.8 5.5 6 2.3l3.2 3.2"/></svg></button>
  </form>
</div>`;

// Classic script, so that the pages open from a file URL. The pages read window.Hero.
window.Hero = { EXPERIENCES, SAMPLES, DEMO, tokens, match, initDock, demo, NAV, DOCK };
})();
