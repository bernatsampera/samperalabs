// Prepared answers and shared project cards. Bernat owns the source ideas.
// Each answer gives a direct introduction and a next action.

/** A card opens one of three things: a story (door), an external site, or another answer. */
export type Card = {
  title: string;
  line: string;
  image: string;
  alt: string;
  door?: string;
  href?: string;
  open?: string;
};
export type Article = { date: string; title: string; slug: string };

export type Block =
  | { kind: 'text'; heading?: string; paragraphs: string[] }
  | { kind: 'cards'; cards: Card[] }
  | { kind: 'list'; articles: Article[] }
  // The contact form. Its text lives in src/lib/contact/form.ts.
  | { kind: 'form' };

export type AnswerContent = { title: string; blocks: Block[]; action?: { label: string; href: string } };

export const SHARED = {
  placeholder: 'Ask me about my work',
  placeholderNext: 'Ask something else',
  startOver: 'Back to the landing',
  blocked: 'Please ask a question about SamperaLabs or Bernat and his work.',
  didYouMean: 'Which one do you mean?',
  unavailable: 'I cannot read questions right now.',
  tooMany: 'You asked many questions in a short time. Wait a few minutes.',
};


// The story pages (src/pages/maat.astro, src/pages/gcontext.astro).
const MAAT_STORY = '/maat';
const GCONTEXT_STORY = '/gcontext';

/** The project cards, shared by the answers and the home page. The key `memory` is the gcontext story card (the home page reads it by that name). */
export const PROJECT_CARDS = {
  maat: { title: 'MAAT', line: 'I bring AI into a company that makes software for martial arts gyms.', image: '/images/ask/maat.jpg', alt: 'A MAAT screen that turns a schedule picture into classes', door: MAAT_STORY },
  memory: { title: 'gcontext', line: 'My own project. A memory for AI agents, in plain files.', image: '/images/ask/gcontext.png', alt: 'The gcontext website', door: GCONTEXT_STORY },
  bjjgym: { title: 'BJJGym', line: 'Find a Brazilian jiu-jitsu gym wherever you travel.', image: '/images/ask/bjjgym.webp', alt: 'The BJJGym map of gyms in New York', href: 'https://bjjgym.com' },
  indoeuromap: { title: 'IndoEuroMap', line: 'An early map of how multicultural a place is.', image: '/images/ask/indoeuromap.png', alt: 'The IndoEuroMap home page', href: 'https://indoeuromap.com' },
} satisfies Record<string, Card>;

export const CONTENT: Record<string, AnswerContent> = {
  who: {
    title: 'About Bernat',
    blocks: [
      {kind: 'text', paragraphs: ['I am an AI engineer. I build AI products at MAAT and develop gcontext, a project about memory for AI agents.']},
      {kind: 'text', heading: 'My focus', paragraphs: ['I study how to structure information so agents can find and use it. The model is rarely the problem. The information we give it is.']},
    ],
    action: {label: 'Explore my work', href: '/work'},
  },
  now: {
    title: 'What I work on now',
    blocks: [
      {kind: 'text', paragraphs: ['My main work is at MAAT. In my own time, I develop gcontext. Both involve the information that AI needs to do useful work.']},
      {kind: 'cards', cards: [PROJECT_CARDS.maat, PROJECT_CARDS.memory]},
    ],
    action: {label: 'Explore all work', href: '/work'},
  },
  projects: {
    title: 'My work',
    blocks: [
      {kind: 'text', paragraphs: ['Start with MAAT for AI in a company, or gcontext for memory between agent sessions. My side projects include BJJGym and IndoEuroMap.']},
      {kind: 'cards', cards: [PROJECT_CARDS.maat, PROJECT_CARDS.memory]},
    ],
    action: {label: 'Explore all projects', href: '/work'},
  },
  maat: {
    title: 'AI at MAAT',
    blocks: [
      {kind: 'text', paragraphs: [PROJECT_CARDS.maat.line, 'I build AI tools for the team and for gym owners.']},
      {kind: 'text', heading: 'One example', paragraphs: ['The MAAT Admin Agent lets gym owners ask questions about their gym data. Other work includes a schedule import tool and a shared handbook for the team.']},
    ],
    action: {label: 'Explore the MAAT project', href: PROJECT_CARDS.maat.door},
  },
  memory: {
    title: 'Why agents forget',
    blocks: [
      {kind: 'text', paragraphs: ['A new agent session does not automatically know the decisions from the last session. Someone has to save the useful information.']},
      {kind: 'text', heading: 'A map and a save step', paragraphs: ['The map tells the agent where to look. The save step keeps useful decisions after the session ends. gcontext is my attempt to make both work with plain files.']},
    ],
    action: {label: 'Read about global context', href: '/posts/why-ai-agents-need-a-global-context'},
  },
  gcontext: {
    title: 'Memory for AI agents',
    blocks: [
      {kind: 'text', paragraphs: ['gcontext keeps project knowledge in a handbook of plain Markdown files. People and coding agents use the same information.']},
      {kind: 'text', heading: 'How it works', paragraphs: ['After a session, it proposes changes to the handbook. I review each change before it becomes part of the project knowledge.']},
      {kind: 'text', heading: 'The open question', paragraphs: ['How little work can a person do while keeping that handbook small and current? That is the problem I am working on.']},
    ],
    action: {label: 'Explore gcontext', href: PROJECT_CARDS.memory.door},
  },
  agents: {
    title: 'How I build AI agents',
    blocks: [
      {kind: 'text', paragraphs: ['I separate decisions from writing. A small model answers narrow questions, and code uses those answers to plan the work.']},
      {kind: 'text', heading: 'In the MAAT Admin Agent', paragraphs: ['Jev checks the scope, language, data needs, and need for careful thinking. A larger model then writes the answer.']},
      {kind: 'text', heading: 'What I check', paragraphs: ['I define test questions before prompts and trace each turn. A model returns probabilities, so the code must handle uncertainty.']},
    ],
    action: {label: 'Read how the Admin Agent works', href: '/posts/how-we-built-the-maat-admin-agent'},
  },
  principles: {
    title: 'How I think about AI',
    blocks: [
      {kind: 'text', paragraphs: ['Everything is information: code, a conversation, or a rule in someone\'s head. I focus on how that information gets written and shared.']},
      {kind: 'text', heading: 'Give the agent a map', paragraphs: ['Keep context small. Tell the agent where to find information instead of copying everything into each session.']},
      {kind: 'text', heading: 'Make decisions visible', paragraphs: ['Separate decisions from writing. Define test questions first. Keep a trace of each turn so you can see why an answer is wrong.']},
    ],
    action: {label: 'Explore my writing', href: '/writing'},
  },
  tools: {
    title: 'Tools and models',
    blocks: [
      {kind: 'text', paragraphs: ['I use Claude Code for daily work and Codex for some tasks. My first agents used LangGraph.']},
      {kind: 'text', heading: 'Access to information', paragraphs: ['I build MCP servers so agents can use data and tools. Jev handles narrow decisions. I use Ollama for local models.']},
    ],
    action: {label: 'See the tools in practice', href: '/work'},
  },
  work: {
    title: 'How I work with AI',
    blocks: [
      {kind: 'text', paragraphs: ['I set the direction and review a plan before implementation. Each agent gets one job. Another agent reviews the result.']},
      {kind: 'text', heading: 'Keep the work reviewable', paragraphs: ['I ask for plain explanations and test results I can inspect. I save decisions with their date and reason, so the next session can understand them.']},
    ],
    action: {label: 'Explore the projects', href: '/work'},
  },
  articles: {
    title: 'Writing about AI and information',
    blocks: [
      {kind: 'text', paragraphs: ['These articles explain problems, decisions, and implementations from my work. Start with a recent article, or explore the full collection.']},
      {kind: 'list', articles: []},
    ],
    action: {label: 'Browse all writing', href: '/writing'},
  },
  bjjgym: {
    title: PROJECT_CARDS.bjjgym.title,
    blocks: [
      {kind: 'text', paragraphs: [PROJECT_CARDS.bjjgym.line]},
      {kind: 'text', heading: 'The idea', paragraphs: ['I train Brazilian jiu-jitsu. BJJGym helps people find a place to train when they travel.']},
    ],
    action: {label: 'Visit BJJGym', href: PROJECT_CARDS.bjjgym.href},
  },
  indoeuromap: {
    title: PROJECT_CARDS.indoeuromap.title,
    blocks: [{kind: 'text', paragraphs: [PROJECT_CARDS.indoeuromap.line]}],
    action: {label: 'Visit IndoEuroMap', href: PROJECT_CARDS.indoeuromap.href},
  },
  contact: {
    title: 'Contact me',
    blocks: [
      {kind: 'text', paragraphs: ['Email is the best way. Write to info@samperalabs.com, or use the form below. I answer when I can.']},
      {kind: 'form'},
    ],
  },
  site: {
    title: 'How Jev helps you explore',
    blocks: [
      {kind: 'text', paragraphs: ['Jev matches your question to a prepared answer about me and my work. It does not write a new answer.']},
      {kind: 'text', heading: 'Choose a next step', paragraphs: ['Each answer links to a project, article, or another page. Related questions help you explore further. You can also use the site navigation at any time.']},
    ],
    action: {label: 'Explore the work behind the site', href: '/maat'},
  },
};
