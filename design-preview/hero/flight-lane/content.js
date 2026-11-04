(() => {
// MOCK CONTENT for the flight: the cards, in the order the visitor meets them.
// The lane shows these cards one after another, first to last. The first five are the main ones. Around the
// lane, hundreds of smaller copies of the same cards fly past, so the face breaks into a whole field of cards.
// A card: label (what it is, with commas, no capitals), title, body (up to three short lines on the card),
// detail (the text in the box, falls back to body), href and cta (the link on the card and the button in the box).
// A card can carry a list instead of a body: list: [{ when, what }, ...], up to seven rows (the career card).
// To change what the visitor sees, or the order: edit this file only. Delete a card to hide it. Move one to reorder.
const post = (slug) => `https://samperalabs.com/posts/${slug}/`;

const cards = [
  // ---- the main five ----
  { label: 'Who', title: 'Bernat Sampera', body: 'AI engineer. I work on the knowledge an AI needs before it can help.', detail: 'I am Bernat, an AI engineer. I work on the knowledge an AI needs before it can help. At MAAT I help a company learn to work with AI. In my own time I research how AI should store and find information.', href: 'https://samperalabs.com/about', cta: 'About me' },
  // MOCK: replace these rows with the LinkedIn list when it is pasted.
  { label: 'Career', title: 'Where I have worked', list: [
      { when: '2024 to now', what: 'MAAT, AI engineer' },
      { when: '2021 to 2024', what: 'Software engineer, web products' },
      { when: '2019 to 2021', what: 'Developer, first job (mock)' },
      { when: '2015 to 2019', what: 'Computer science degree (mock)' },
    ], detail: 'MAAT, AI engineer, 2024 to now. Software engineer in web products, 2021 to 2024. Before that a first developer job and a computer science degree. The full list is on LinkedIn.', href: 'https://www.linkedin.com/in/bernatsampera/', cta: 'Open LinkedIn' },
  { label: 'MAAT', title: 'MAAT', body: 'Software for combat sports gyms. I am the AI engineer there.', detail: 'MAAT builds software for combat sports gyms: members, classes, payments. I joined in 2024 as the AI engineer, to make the company work with AI.', href: 'https://samperalabs.com/maat', cta: 'Open the MAAT story' },
  { label: 'MAAT', title: 'Enabling AI across MAAT', body: 'The Admin Agent answers gym owners. The company brain holds what MAAT knows.', detail: 'Two steps. The Admin Agent: a gym owner asks in plain words and the agent answers from the company knowledge, or does the task. The company brain: one place where the knowledge of MAAT lives, for people and for agents. When an answer is wrong, we fix the knowledge, not the code.', href: post('how-we-built-the-maat-admin-agent'), cta: 'Read how we built it' },
  { label: 'Research', title: 'gcontext', body: 'How AI should store and find information. Minimal to load, fast to find.', detail: 'gcontext is my research on how AI should store and find information. Every session starts from zero, so the context has to carry the person, the task and the history: minimal to load, fast to find.', href: 'https://samperalabs.com/gcontext', cta: 'Open the research' },
  // ---- the rest, all of the same weight ----
  { label: 'Principle', title: 'Everything is information', body: 'Code, a chat, a rule in someone\'s head: all of it is information.', detail: 'Code, a chat, a rule in someone\'s head: all of it is information. Working with AI is working with how information is kept and passed on.' },
  { label: 'Principle', title: 'AI has no memory', body: 'Every session starts from zero. The context has to carry the person.', detail: 'Every session starts from zero. The context has to carry the person, the task and the history. This is my research.', href: 'https://samperalabs.com/gcontext', cta: 'Open the research' },
  { label: 'Principle', title: 'Give a map, not a pile', body: 'A map shows where to look, so the AI reads only what the question needs.', detail: 'A map shows where to look, so the AI reads only what the question needs. A pile makes it read everything and understand nothing.', href: post('why-ai-agents-need-a-global-context'), cta: 'Read the article' },
  { label: 'Principle', title: 'Knowledge beats code', body: 'A strong model with the wrong knowledge gives wrong answers.', detail: 'A strong model with the wrong knowledge gives wrong answers. Most of the work is in what the model knows when it starts.' },
  { label: 'Now, this week', title: 'MAAT Admin Agent, routing v2', body: 'Fewer wrong turns when a question touches two topics.', detail: 'Routing v2 of the Admin Agent: fewer wrong turns when a question touches two topics at once.' },
  { label: 'Now, this month', title: 'Global context research', body: 'Minimal to load, fast to find. Testing it on my own notes.', detail: 'Global context: minimal to load, fast to find. This month I test it on my own notes before I test it on a company.', href: 'https://samperalabs.com/gcontext', cta: 'Open the research' },
  { label: 'Article, October 2026', title: 'How we built the MAAT Admin Agent for gym owners', body: 'Gym owners ask in plain words. The agent answers from what the company knows.', href: post('how-we-built-the-maat-admin-agent'), cta: 'Read the article' },
  { label: 'Article, October 2026', title: 'Global context for AI agents: minimal to load, fast to find', body: 'Why a map beats a pile, and how to build the map.', href: post('why-ai-agents-need-a-global-context'), cta: 'Read the article' },
  { label: 'Article, October 2026', title: 'Building an AI Brain at MAAT', body: 'One place where the knowledge of MAAT lives, for people and for agents.', href: post('building-an-ai-brain-at-maat'), cta: 'Read the article' },
  { label: 'Article, October 2026', title: 'From a gym schedule picture to classes in MAAT', body: 'A photo of a timetable becomes the classes of a gym.', href: post('gym-schedule-image-to-classes'), cta: 'Read the article' },
  { label: 'Writing', title: 'All articles', body: 'Fourteen articles since 2025, newest first.', href: 'https://samperalabs.com/writing', cta: 'Open the list' },
  { label: 'Project', title: 'BJJGym', body: 'Find a jiu-jitsu gym wherever you travel.', href: 'https://bjjgym.com', cta: 'Open BJJGym' },
  { label: 'Project', title: 'IndoEuroMap', body: 'See the local patterns of a city on a map.', href: 'https://indoeuromap.com', cta: 'Open IndoEuroMap' },
  { label: 'Contact', title: 'Write to me', body: 'Email is the fastest way. LinkedIn and X work too.', href: 'mailto:hello@samperalabs.com', cta: 'Send an email' },
];

window.FaceContent = { cards };
})();
