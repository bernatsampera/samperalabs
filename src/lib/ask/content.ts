// What each home page experience shows. Round 3 (2026-11-01), after Bernat's comments in
// design-preview/home-experiences/comments.json: no title line, plain text, one card style.
// Bernat owns this text. Review it on /ask-review (local only). Keep the ids in sync with experiences.ts.

/** A card opens one of three things: the MAAT story (door), an external site, or another answer. */
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
  | { kind: 'text'; paragraphs: string[] }
  | { kind: 'cards'; cards: Card[] }
  | { kind: 'list'; articles: Article[] };

export type AnswerContent = { blocks: Block[] };

export const SHARED = {
  placeholder: 'Ask me about my work',
  placeholderNext: 'Ask something else',
  startOver: 'Start over',
  blocked: 'Please ask a question about SamperaLabs or Bernat and his work.',
  didYouMean: 'Which one do you mean?',
  unavailable: 'I cannot read questions right now.',
  tooMany: 'You asked many questions in a short time. Wait a few minutes.',
};

const ARTICLES: Article[] = [
  { date: '2026-10', title: 'How we built the MAAT Admin Agent for gym owners', slug: 'how-we-built-the-maat-admin-agent' },
  { date: '2026-10', title: 'Global context for AI agents: minimal to load, fast to find', slug: 'why-ai-agents-need-a-global-context' },
  { date: '2026-10', title: 'Building an AI Brain at MAAT', slug: 'building-an-ai-brain-at-maat' },
  { date: '2026-10', title: 'From a gym schedule picture to classes in MAAT', slug: 'gym-schedule-image-to-classes' },
  { date: '2026-06', title: 'How we built a context tree for our agent to resolve support tasks', slug: 'context-tree-agent-support-tasks' },
  { date: '2026-06', title: 'Express the General', slug: 'express-the-general' },
  { date: '2026-05', title: 'Context Architecture vs Agent Harnesses: Where Gcontext Fits', slug: 'context-architecture-vs-agent-harnesses' },
  { date: '2026-05', title: 'Your AI Agent Deserves Its Own Repo', slug: 'your-ai-agent-deserves-its-own-repo' },
  { date: '2026-05', title: 'Bet on Optionality', slug: 'bet-on-optionality' },
  { date: '2026-04', title: 'Using Ollama in a simple App with the MCP Protocol', slug: 'using-ollama-in-a-simple-app-with-the-mcp-protocol' },
  { date: '2026-01', title: 'Safely Running Ollama with CPU Temperature Checks in Python', slug: 'safely-running-ollama-with-cpu-temperature-checks-in-python' },
  { date: '2025-11', title: 'How to handle Human in the loop with Langgraph and FastAPI', slug: 'how-to-handle-human-in-the-loop-with-langgraph-and-fastapi' },
  { date: '2025-09', title: 'Lessons Learned Building a Real-World AI Agent with LangGraph', slug: 'lessons-learned-building-a-real-world-ai-agent-with-langgraph' },
  { date: '2025-07', title: 'Advanced Langgraph: Deep dive into open deep research', slug: 'analyzing-open-deep-research' },
];

// The MAAT story page (src/pages/maat.astro).
const MAAT_STORY = '/maat';

/** The project cards, shared by the answers and the home page. */
export const PROJECT_CARDS = {
  maat: { title: 'MAAT', line: 'I help a software company for combat sports gyms work with AI.', image: '/images/ask/maat.jpg', alt: 'A MAAT screen that turns a schedule picture into classes', door: MAAT_STORY },
  memory: { title: 'AI has no memory', line: 'My research on how AI should store and find information.', image: '/images/ask/gcontext.png', alt: 'The gcontext website', open: 'memory' },
  bjjgym: { title: 'BJJGym', line: 'Find a jiu-jitsu gym wherever you travel.', image: '/images/ask/bjjgym.webp', alt: 'The BJJGym map of gyms in New York', href: 'https://bjjgym.com' },
  indoeuromap: { title: 'IndoEuroMap', line: 'See the local patterns of a city on a map.', image: '/images/ask/indoeuromap.png', alt: 'The IndoEuroMap home page', href: 'https://indoeuromap.com' },
} satisfies Record<string, Card>;

export const CONTENT: Record<string, AnswerContent> = {
  who: {
    blocks: [{
      kind: 'text',
      paragraphs: [
        'I am Bernat, an AI engineer. I work on the knowledge an AI needs before it can help.',
        'At MAAT, I help a company learn to work with AI. In my own time, I research how AI should store and find information.',
      ],
    }],
  },
  now: { blocks: [{ kind: 'cards', cards: [PROJECT_CARDS.maat, PROJECT_CARDS.memory] }] },
  projects: { blocks: [{ kind: 'cards', cards: [PROJECT_CARDS.maat, PROJECT_CARDS.memory, PROJECT_CARDS.bjjgym, PROJECT_CARDS.indoeuromap] }] },
  maat: { blocks: [{ kind: 'cards', cards: [PROJECT_CARDS.maat] }] },
  memory: { blocks: [{ kind: 'text', paragraphs: ['My own research. The hard part of AI is not the model. It is the information we give it.'] }] },
  agents: {
    blocks: [{
      kind: 'text',
      paragraphs: [
        'I build agents that work with what a company knows.',
        'At MAAT, the Admin Agent answers gym owners in plain words, and a support agent follows a context tree to resolve tasks.',
      ],
    }],
  },
  principles: {
    blocks: [{
      kind: 'text',
      paragraphs: [
        'Everything is information. Code, a chat, a rule in someone\'s head: all of it is information.',
        'Knowledge beats code. A strong model with the wrong knowledge gives wrong answers.',
        'Say the goal, not only the steps. If you give a helper only the steps, it cannot find a better way.',
        'Give a map, not a pile. A map shows where to look, so the AI reads only what the question needs.',
        'Write for people and AI at the same time. If a new colleague and an AI can both follow it, it is clear enough.',
      ],
    }],
  },
  articles: { blocks: [{ kind: 'list', articles: ARTICLES }] },
  bjjgym: { blocks: [{ kind: 'cards', cards: [PROJECT_CARDS.bjjgym] }] },
  indoeuromap: { blocks: [{ kind: 'cards', cards: [PROJECT_CARDS.indoeuromap] }] },
  site: {
    blocks: [{
      kind: 'text',
      paragraphs: [
        'This page has no chatbot. Every answer is prepared.',
        'A small model, Jev, reads your question and picks the answer that fits. If Jev is not sure, the page asks which one you mean.',
      ],
    }],
  },
};
