// What each home page experience shows. Round 5 (2026-11-01), written from Bernat's interview answers in
// design-preview/home-experiences/evidence.md and from his published articles. No title line, plain text, one card style.
// Voice: spoken, first person, concrete, real numbers, short paragraphs that end on one line (Bernat's reference piece, round 5).
// Bernat owns this text. Review it on /ask-review (local only). Keep the ids in sync with experiences.ts.
// "To check" marks a fact that Bernat must confirm before the text goes live.

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
const bySlug = (slug: string): Article => ARTICLES.find((a) => a.slug === slug)!;

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

/** My first serious agent, on GitHub. The image is the preview that GitHub renders for the repository. */
const GITHUB_CARD: Card = {
  title: 'event-deep-research',
  line: 'My first serious agent, built with LangGraph. 257 stars on GitHub.',
  image: 'https://opengraph.githubassets.com/1/bernatsampera/event-deep-research',
  alt: 'The event-deep-research repository on GitHub',
  href: 'https://github.com/bernatsampera/event-deep-research',
};

export const CONTENT: Record<string, AnswerContent> = {
  who: {
    blocks: [
      {
        kind: 'text',
        paragraphs: [
          'I\'m Bernat Sampera, an AI engineer. Most of my work is the information an AI needs before it can do a job well. The model is rarely the problem. The information we give it is. Everything is information.',
          'For three or four years I was a frontend and full stack developer, most of that time in Munich. At the start of 2025 I switched to AI. I took some months to study, LangGraph, an AI engineering course at Turing College, and a lot of building. The first serious thing I built was a research agent with LangGraph. It\'s open source, and it has 257 stars on GitHub.',
          'At the end of 2025 I joined MAAT. MAAT helps gym owners run their academy, mostly martial arts like Brazilian jiu-jitsu, MMA, and kickboxing. My job there is to find every place where AI can help the team or the owners, and then build it. The MAAT card below opens that story.',
          'In my own time I build gcontext, my attempt at the memory problem of AI agents. I\'m from Spain. Right now I move around Europe, city by city. Tallinn was the first stop. And I train BJJ.',
        ],
      },
      { kind: 'cards', cards: [PROJECT_CARDS.maat, GITHUB_CARD] },
    ],
  },
  now: { blocks: [{ kind: 'cards', cards: [PROJECT_CARDS.maat, PROJECT_CARDS.memory] }] },
  projects: { blocks: [{ kind: 'cards', cards: [PROJECT_CARDS.maat, PROJECT_CARDS.memory, PROJECT_CARDS.bjjgym, PROJECT_CARDS.indoeuromap] }] },
  maat: { blocks: [{ kind: 'cards', cards: [PROJECT_CARDS.maat] }] },
  memory: {
    blocks: [{
      kind: 'text',
      paragraphs: [
        'Because nobody wrote it down. A model has read most of the internet, but it has never read your notes, your rules, or the price change you agreed on Tuesday. When the session ends, that conversation is gone. On Friday a new session starts from zero, and you\'re the one who explains it all again.',
        'People hear this and want a bigger model. I don\'t think the model is the problem. Give an agent ten tools and no map, and it opens every drawer and takes the first number it finds. Access isn\'t the same as knowing where to look.',
        'So I care about two things. A map, so the agent reads one line, goes to one place, and loads only what the question needs. And a save step, so what a session learns outlives the session, and the old fact gets replaced instead of piled on.',
        'The saving is the hard part. A model is great at predicting the next word and bad at organizing information. I spent weeks letting it build the structure on its own, and it saved too much. So my rule is the opposite of what you\'d expect. I\'d rather lose a fact than keep the noise.',
      ],
    }],
  },
  gcontext: {
    blocks: [
      {
        kind: 'text',
        paragraphs: [
          'gcontext is my own project. It tries to solve the memory problem of AI agents. A session has a limited context, and when it ends, whatever the agent learned is gone. gcontext structures that information so the next session can find it.',
          'Today it\'s a handbook. A folder of plain Markdown files with what a coding agent needs to know about a project, the decisions and why, the architecture, the connections, the plans. When a session ends, gcontext reads it, keeps what my rules ask for, and proposes changes to the handbook. I accept or reject each one. The first real run worked on October 31.',
          'It\'s not a vector database, not RAG, not a graph. People and agents read the same files, and an agent finds things with grep. The part that isn\'t solved is how little a person has to do so the handbook stays small and current. Honestly, that\'s the whole reason I keep going. Tools like mem0, the memory in Claude, and Graphify work on the same problem, and none of them has solved the one I have.',
          'I started in March 2026. The first version was a web app where you picked which context modules an agent loads, with the secrets injected by name. I never released it. I didn\'t want to deal with secrets if it ever became a service. I still use it myself.',
        ],
      },
      { kind: 'cards', cards: [PROJECT_CARDS.memory] },
    ],
  },
  agents: {
    blocks: [
      {
        kind: 'text',
        paragraphs: [
          'I don\'t think of an agent as a machine. It\'s closer to a colleague with a very narrow memory and a lot of power. My job is to give it the right information and to coordinate it. That\'s a feeling more than a theory, but it\'s how I work with coding agents every day.',
          'Take the MAAT Admin Agent. A gym owner types "who came to class yesterday?" and the agent answers from the gym\'s data. Before the big model writes a word, a small decision model called Jev answers four narrow questions. Is this about the gym? Does it need careful thinking? Which language? Which part of the data? Code turns those answers into a plan, and the big model only writes. On our bench that cut the model steps by 43 percent.',
          'What I learned building it fits in four lines. Write the questions with known answers before the prompts, because that\'s your test. Keep the model that decides apart from the model that writes. Trace every turn, or you can\'t see why an answer is wrong. And treat a model call as a probability, not a fact.',
          'My first agents were LangGraph, in 2025. A research agent, a translator that remembers your corrections, human in the loop with FastAPI. The lesson that stuck is the bitter one. The best change I made was removing steps from the agent, so the person waiting got the answer faster.',
        ],
      },
      { kind: 'list', articles: [bySlug('how-we-built-the-maat-admin-agent'), bySlug('lessons-learned-building-a-real-world-ai-agent-with-langgraph'), bySlug('how-to-handle-human-in-the-loop-with-langgraph-and-fastapi')] },
    ],
  },
  principles: {
    blocks: [{
      kind: 'text',
      paragraphs: [
        'Most of what I believe about AI comes from one idea. Everything is information. Code, a chat, a rule in someone\'s head. Working with AI is less about code and more about how that information gets written down and passed on. The model is rarely the problem.',
        'On information, three rules I keep coming back to. Give a map, not a pile. Keep it small, because I\'d rather lose a fact than keep the noise. And don\'t copy what already lives in Stripe or Notion, write down how to reach it.',
        'On agents. Let a small model decide before the big model writes. Write the test questions before the prompts. Trace every turn. And remember that a model call returns a probability, not a fact.',
        'On working with AI. Say the goal, not the steps, or the agent can\'t find a better way than yours. If a result only works because of a prompt trick, it doesn\'t work. And an agent is a colleague with a narrow memory, not a machine. I drive, it builds.',
      ],
    }],
  },
  tools: {
    blocks: [{
      kind: 'text',
      paragraphs: [
        'Claude Code, all day. That\'s where I work. Sometimes Codex gets a piece of the build as a subagent. Each agent gets one job, one plans and reviews, another one builds.',
        'My first agents were LangGraph. Most of what I build now reaches its data through MCP servers. I write the server, the agent gets the tools, and I don\'t have to explain the database in every prompt.',
        'Jev is the odd one in this list. It\'s a small decision model that never writes text. It answers narrow questions with probabilities, and code acts on them. I run it before the big model, so the big model does less, and every decision is a number I can test.',
        'For local models I use Ollama. Two of my articles are about running it without cooking your laptop.',
      ],
    }],
  },
  work: {
    blocks: [{
      kind: 'text',
      paragraphs: [
        'I keep several Claude Code sessions open on the same project, each with one job. I write the direction, the AI writes the plan, I say yes, and a subagent builds. Another agent reviews the result before I look at it.',
        'I ask for options rated from one to ten before I decide anything. And I ask for every explanation in plain English. The moment I have to decode a message, the work stops. It has happened more than once.',
        'I run the tests myself. No unit tests. One end to end run that leaves something I can open and check. And when a model call costs money, one real call, not a hundred.',
        'Every decision goes into a file with the date and my words, so the next session can read why we did it. I\'m the driver. The AI helps.',
      ],
    }],
  },
  articles: { blocks: [{ kind: 'list', articles: ARTICLES }] },
  bjjgym: { blocks: [{ kind: 'cards', cards: [PROJECT_CARDS.bjjgym] }] },
  indoeuromap: { blocks: [{ kind: 'cards', cards: [PROJECT_CARDS.indoeuromap] }] },
  contact: {
    blocks: [{
      kind: 'text',
      paragraphs: [
        'Email is the best way. Write to info@samperalabs.com. I read everything, and I answer when I can.',
        'A form here is coming, so you can write to me without leaving the page.',
      ],
    }],
  },
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
