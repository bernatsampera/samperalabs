// Content of the home hero flight (copied from design-preview/hero/flight/content.js): what the visitor meets, in the order they meet it.
// The flight is one lane. Cards come one after another, chapter by chapter: first the chapter opener (its name
// in ink and its question in gray, with the chapter's number badge), then its pieces. Nothing else is shown.
// A piece: label (what it is, and a date, with commas), title, body (on the card), detail (in the box, falls back
// to body), href and cta (the link on the card and the button in the box). A piece without href is not clickable.
// To change what the visitor sees, or the order: edit this file only. Keep bodies to three short lines.
const post = (slug) => `https://samperalabs.com/posts/${slug}/`;

const chapters = [
  {
    id: 'who', name: 'Who I am', question: 'Who is Bernat?',
    pieces: [
      { label: 'Who', title: 'Bernat Sampera', body: 'AI engineer. I work on the knowledge an AI needs before it can help.', detail: 'I am Bernat, an AI engineer. I work on the knowledge an AI needs before it can help. At MAAT I help a company learn to work with AI. In my own time I research how AI should store and find information.', href: 'https://samperalabs.com/about', cta: 'About me' },
    ],
  },
  {
    id: 'career', name: 'Where I come from', question: 'How did I get into AI?',
    pieces: [
      { label: 'Career, 2021', title: 'Software engineer', body: 'Web products, small teams, shipping every week.', detail: 'Web products in small teams, shipping every week. The years that taught me how software reaches people.' },
      { label: 'Career, 2023', title: 'First agents in production', body: 'LangGraph, a human in the loop, lessons learned the hard way.', detail: 'The first agents that real people used. LangGraph, a human in the loop, and a long list of lessons learned the hard way.', href: post('lessons-learned-building-a-real-world-ai-agent-with-langgraph'), cta: 'Read the lessons' },
      { label: 'Career, 2024', title: 'Joined MAAT as AI engineer', body: 'A software company for combat sports gyms learns to work with AI.', detail: 'MAAT builds software for combat sports gyms. I joined to make the company work with AI: first the agents that answer gym owners, then the knowledge they need to answer well.', href: 'https://samperalabs.com/maat', cta: 'Open the MAAT story' },
      { label: 'Career, 2024', title: 'The Admin Agent', body: 'Gym owners ask in plain words. The agent answers from what the company knows.', detail: 'The Admin Agent sits inside MAAT. A gym owner asks a question in plain words and the agent answers from the company knowledge, or does the task. It was the first agent in production.', href: post('how-we-built-the-maat-admin-agent'), cta: 'Read the article' },
      { label: 'Career, 2025', title: 'The company brain', body: 'One place where the knowledge of MAAT lives, for people and for agents.', detail: 'One place where the knowledge of MAAT lives. People read it, agents read it. When the answer is wrong, we fix the knowledge, not the code.', href: post('building-an-ai-brain-at-maat'), cta: 'Read the article' },
    ],
  },
  {
    id: 'see', name: 'How I see it', question: 'What do I believe about AI?',
    pieces: [
      { label: 'Principle', title: 'Everything is information', body: 'Code, a chat, a rule in someone\'s head: all of it is information.', detail: 'Code, a chat, a rule in someone\'s head: all of it is information. Working with AI is working with how information is kept and passed on.' },
      { label: 'Principle', title: 'AI has no memory', body: 'Every session starts from zero. The context has to carry the person.', detail: 'Every session starts from zero. The context has to carry the person, the task and the history. This is my research.', href: 'https://samperalabs.com/gcontext', cta: 'Open the research' },
      { label: 'Principle', title: 'Give a map, not a pile', body: 'A map shows where to look, so the AI reads only what the question needs.', detail: 'A map shows where to look, so the AI reads only what the question needs. A pile makes it read everything and understand nothing.', href: post('why-ai-agents-need-a-global-context'), cta: 'Read the article' },
      { label: 'Principle', title: 'Knowledge beats code', body: 'A strong model with the wrong knowledge gives wrong answers.', detail: 'A strong model with the wrong knowledge gives wrong answers. Most of the work is in what the model knows when it starts.' },
    ],
  },
  {
    id: 'now', name: 'Now', question: 'What am I working on?',
    pieces: [
      { label: 'Now, this week', title: 'MAAT Admin Agent, routing v2', body: 'Fewer wrong turns when a question touches two topics.', detail: 'Routing v2 of the Admin Agent: fewer wrong turns when a question touches two topics at once.' },
      { label: 'Now, this month', title: 'Global context research', body: 'Minimal to load, fast to find. Testing it on my own notes.', detail: 'Global context: minimal to load, fast to find. This month I test it on my own notes before I test it on a company.', href: 'https://samperalabs.com/gcontext', cta: 'Open the research' },
    ],
  },
  {
    id: 'writing', name: 'Writing', question: 'What have I written?',
    pieces: [
      { label: 'Article, October 2026', title: 'How we built the MAAT Admin Agent for gym owners', body: 'Gym owners ask in plain words. The agent answers from what the company knows.', href: post('how-we-built-the-maat-admin-agent'), cta: 'Read the article' },
      { label: 'Article, October 2026', title: 'Global context for AI agents: minimal to load, fast to find', body: 'Why a map beats a pile, and how to build the map.', href: post('why-ai-agents-need-a-global-context'), cta: 'Read the article' },
      { label: 'Article, October 2026', title: 'Building an AI Brain at MAAT', body: 'One place where the knowledge of MAAT lives, for people and for agents.', href: post('building-an-ai-brain-at-maat'), cta: 'Read the article' },
      { label: 'Article, October 2026', title: 'From a gym schedule picture to classes in MAAT', body: 'A photo of a timetable becomes the classes of a gym.', href: post('gym-schedule-image-to-classes'), cta: 'Read the article' },
      { label: 'Writing', title: 'All articles', body: 'Fourteen articles since 2025, newest first.', href: 'https://samperalabs.com/writing', cta: 'Open the list' },
    ],
  },
  {
    id: 'more', name: 'Projects and contact', question: 'What else, and how to reach me?',
    pieces: [
      { label: 'Project', title: 'BJJGym', body: 'Find a jiu-jitsu gym wherever you travel.', href: 'https://bjjgym.com', cta: 'Open BJJGym' },
      { label: 'Project', title: 'IndoEuroMap', body: 'See the local patterns of a city on a map.', href: 'https://indoeuromap.com', cta: 'Open IndoEuroMap' },
      { label: 'Research', title: 'gcontext', body: 'How AI should store and find information.', href: 'https://samperalabs.com/gcontext', cta: 'Open the research' },
      { label: 'Contact', title: 'Write to me', body: 'Email is the fastest way. LinkedIn and X work too.', href: 'mailto:info@samperalabs.com', cta: 'Send an email' },
    ],
  },
];

export const content = { chapters };
