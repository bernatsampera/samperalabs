// The experiences that a home page question can open.
// Jev reads each `describe` text to choose one, so write it as what the visitor wants to see.
// Product decisions: design-preview/home-experiences/product.md
// Round 4 (2026-11-01): written from Bernat's interview answers, design-preview/home-experiences/evidence.md.
// The order here is the order of the ids that Jev receives. Keep scripts/ask-jev-e2e.mjs and scripts/ask-ui-shots.mjs in sync.

export type AnswerType = 'text' | 'cards' | 'list';

export type Experience = {
  id: string;
  title: string;
  type: AnswerType;
  /** The question as a visitor would ask it. Used for sample and follow-up questions. */
  ask: string;
  /** What Jev reads to decide if this experience fits the question. */
  describe: string;
  followUps: string[];
};

export const EXPERIENCES: Experience[] = [
  {
    id: 'who',
    title: 'Who is Bernat',
    type: 'text',
    ask: 'Who is Bernat Sampera?',
    describe: 'Who Bernat Sampera is: his role as an AI engineer, his background as a frontend and full stack developer, his switch to AI in 2025, where he is from and where he lives, what he does at MAAT and in his own time. Also greetings and general questions about him.',
    followUps: ['now', 'principles'],
  },
  {
    id: 'now',
    title: 'What I work on now',
    type: 'cards',
    ask: 'What are you working on now?',
    describe: 'What Bernat is working on right now: his current work at MAAT and his current personal project, gcontext.',
    followUps: ['maat', 'gcontext'],
  },
  {
    id: 'projects',
    title: 'Projects',
    type: 'cards',
    ask: 'Show me your projects.',
    describe: 'An overview of all the projects that Bernat has built or worked on: MAAT, gcontext, BJJGym, IndoEuroMap. Also his portfolio, his GitHub, and open source work.',
    followUps: ['maat', 'gcontext'],
  },
  {
    id: 'maat',
    title: 'MAAT',
    type: 'cards',
    ask: 'What do you do at MAAT?',
    describe: 'MAAT, the company where Bernat works. MAAT makes software that helps gym owners run a martial arts academy. How a company becomes AI native: internal AI tools (a schedule tool, AI migrations), the company Brain with playbooks, and the Admin Agent for gym owners. Also questions about bringing AI into a company or a team.',
    followUps: ['agents', 'now'],
  },
  {
    id: 'memory',
    title: 'AI has no memory',
    type: 'text',
    ask: 'Why does AI forget what you tell it?',
    describe: 'Bernat\'s view on AI memory and context: why a model forgets between sessions, why access to tools is not the same as knowing where to look, what a map and a save step change, and why noise is the enemy. His opinions on context engineering, RAG, memory layers, and how information should be stored and found. The thinking, not the tool.',
    followUps: ['gcontext', 'principles'],
  },
  {
    id: 'gcontext',
    title: 'gcontext',
    type: 'text',
    ask: 'What is gcontext?',
    describe: 'gcontext, Bernat\'s own tool and open source project: what it is (a handbook of plain Markdown files for a coding agent, and a gateway that reads a session and proposes changes), what it is not (not RAG, not a vector database, not a graph), its history since March 2026, its status, and how to try it.',
    followUps: ['memory', 'articles'],
  },
  {
    id: 'agents',
    title: 'AI agents',
    type: 'text',
    ask: 'How do you build AI agents?',
    describe: 'How Bernat builds AI agents and what he learned: the MAAT Admin Agent, a small decision model (Jev) before the big model, writing the test questions before the prompts, observability and traces, his LangGraph agents and human in the loop, and his view of an agent as a colleague with a narrow memory.',
    followUps: ['maat', 'tools'],
  },
  {
    id: 'principles',
    title: 'How I think about AI',
    type: 'text',
    ask: 'How do you think about AI?',
    describe: 'Bernat\'s opinions and principles about AI, in three groups: about information and memory, about building agents, and about working with AI every day. His view on the future of AI, on models, and on what matters.',
    followUps: ['memory', 'agents'],
  },
  {
    id: 'tools',
    title: 'Tools and models',
    type: 'text',
    ask: 'Which tools and models do you use?',
    describe: 'The tools, models, and stack that Bernat uses, and what he uses each one for: Claude Code, Codex, LangGraph, MCP servers, Ollama and local models, and Jev as a decision model. Questions like "what is your stack", "which model do you use", "do you use Cursor".',
    followUps: ['work', 'agents'],
  },
  {
    id: 'work',
    title: 'How I work with AI',
    type: 'text',
    ask: 'How do you work with AI every day?',
    describe: 'Bernat\'s daily way of working with AI: several coding agent sessions in parallel, one job per agent, a plan before the code, options rated from one to ten, explanations in plain English, he runs the tests himself, no unit tests, one end to end run with an artifact, decisions written with the date. Questions like "do you still write code" or "how do you use Claude Code".',
    followUps: ['tools', 'principles'],
  },
  {
    id: 'articles',
    title: 'Articles',
    type: 'list',
    ask: 'What have you written?',
    describe: 'Bernat\'s articles, blog posts, and other writing. Also "did you write about X" and "your latest post".',
    followUps: ['projects', 'agents'],
  },
  {
    id: 'bjjgym',
    title: 'BJJGym',
    type: 'cards',
    ask: 'What is BJJGym?',
    describe: 'BJJGym, Bernat\'s website to find Brazilian jiu-jitsu gyms across the world when you travel. Also questions about jiu-jitsu, BJJ, and his training.',
    followUps: ['projects', 'who'],
  },
  {
    id: 'indoeuromap',
    title: 'IndoEuroMap',
    type: 'cards',
    ask: 'What is IndoEuroMap?',
    describe: 'IndoEuroMap, Bernat\'s early map project about how multicultural a place is.',
    followUps: ['projects', 'who'],
  },
  {
    id: 'contact',
    title: 'Contact',
    type: 'text',
    ask: 'How can I contact you?',
    describe: 'How to contact Bernat, hire him, work with him, or propose something: email, LinkedIn, GitHub, and what he is open to. Questions like "are you available", "can I hire you", "do you consult".',
    followUps: ['who', 'projects'],
  },
  {
    id: 'site',
    title: 'How this site works',
    type: 'text',
    ask: 'How does this site work?',
    describe: 'How this website works: the search box, the Jev model, and how the site matches a question to an answer. Questions like "is this a chatbot" or "which model is this".',
    followUps: ['maat', 'who'],
  },
];

export const DEFAULT_EXPERIENCE = 'who';
export const LANDING_QUESTIONS = ['projects', 'principles', 'who'];
export const LANDING_LABELS: Record<string, string> = {projects: 'Understand my work', principles: 'Explore my ideas', who: 'About me'};

const byId = new Map(EXPERIENCES.map((e) => [e.id, e]));
export const getExperience = (id: string): Experience | undefined => byId.get(id);
