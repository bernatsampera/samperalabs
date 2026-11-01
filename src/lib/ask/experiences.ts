// The experiences that a home page question can open.
// Jev reads each `describe` text to choose one, so write it as what the visitor wants to see.
// Product decisions: design-preview/home-experiences/product.md

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
    describe: 'Who Bernat Sampera is: his role, his background, and what kind of engineer he is. Also greetings and general questions about him.',
    followUps: ['now', 'projects'],
  },
  {
    id: 'now',
    title: 'What I work on now',
    type: 'cards',
    ask: 'What are you working on now?',
    describe: 'What Bernat is working on right now: his current work and his current research.',
    followUps: ['maat', 'projects'],
  },
  {
    id: 'projects',
    title: 'Projects',
    type: 'cards',
    ask: 'Show me your projects.',
    describe: 'An overview of all the projects that Bernat has built or worked on.',
    followUps: ['maat', 'who'],
  },
  {
    id: 'maat',
    title: 'MAAT',
    type: 'cards',
    ask: 'What do you do at MAAT?',
    describe: 'MAAT, the company where Bernat works. MAAT makes software for combat sports gyms. The journey of how MAAT becomes an AI native company: internal AI tools, a company brain, and AI for gym owners.',
    followUps: ['projects', 'now'],
  },
  {
    id: 'memory',
    title: 'AI has no memory',
    type: 'text',
    ask: 'How should AI store and find information?',
    describe: 'Bernat\'s research on how AI should store and find information: AI memory, context, knowledge structure, global context, and his tool gcontext.',
    followUps: ['articles', 'maat'],
  },
  {
    id: 'agents',
    title: 'AI agents',
    type: 'text',
    ask: 'How do you build AI agents?',
    describe: 'How Bernat builds AI agents, and his articles about agents, for example the MAAT Admin Agent, context trees for support tasks, and LangGraph.',
    followUps: ['maat', 'articles'],
  },
  {
    id: 'principles',
    title: 'How I think about AI',
    type: 'text',
    ask: 'How do you think about AI?',
    describe: 'Bernat\'s opinions and principles about AI, and how people should work with AI.',
    followUps: ['articles', 'who'],
  },
  {
    id: 'articles',
    title: 'Articles',
    type: 'list',
    ask: 'What have you written?',
    describe: 'Bernat\'s articles, blog posts, and other writing.',
    followUps: ['projects', 'who'],
  },
  {
    id: 'bjjgym',
    title: 'BJJGym',
    type: 'cards',
    ask: 'What is BJJGym?',
    describe: 'BJJGym, Bernat\'s website to find Brazilian jiu-jitsu gyms when you travel.',
    followUps: ['projects', 'who'],
  },
  {
    id: 'indoeuromap',
    title: 'IndoEuroMap',
    type: 'cards',
    ask: 'What is IndoEuroMap?',
    describe: 'IndoEuroMap, Bernat\'s map project that shows the patterns of a city.',
    followUps: ['projects', 'who'],
  },
  {
    id: 'site',
    title: 'How this site works',
    type: 'text',
    ask: 'How does this site work?',
    describe: 'How this website works: the search box, the Jev model, and how the site matches a question to an answer.',
    followUps: ['maat', 'who'],
  },
];

export const DEFAULT_EXPERIENCE = 'who';
export const LANDING_QUESTIONS = ['who', 'now', 'projects'];

const byId = new Map(EXPERIENCES.map((e) => [e.id, e]));
export const getExperience = (id: string): Experience | undefined => byId.get(id);
