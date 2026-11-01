import type {Story} from './types';

// Round 5 (2026-11-01). Written from Bernat's interview answers (design-preview/home-experiences/evidence.md, section 9)
// and his published articles, in his spoken voice. Bernat owns this text.
// To check before publishing: the month of the AI migrations (part 1), the month the first Brain started (part 2),
// and the end of part 1 (now open).
export const maat: Story = {
  slug: 'maat',
  name: 'MAAT',
  mission: 'How does a company become AI native?',
  context: 'MAAT helps gym owners run their academy, mostly martial arts like Brazilian jiu-jitsu, MMA, and kickboxing. I joined at the end of 2025 to bring AI to the team and to the owners.',
  parts: [
    {id: 1, name: 'Internal AI tools', mission: 'How can AI take slow, manual work off the team?', from: '2026-02', to: null, status: 'ongoing'},
    {id: 2, name: 'The company brain', mission: 'Can one place answer any question about MAAT?', from: '2026-04', to: null, status: 'ongoing'},
    {id: 3, name: 'AI for our customers', mission: 'How can gym owners use AI every day?', from: '2026-09', to: null, status: 'ongoing'},
  ],
  chapters: [
    {id: 'maat-schedule', short: 'Schedule photos', part: 1, icon: 'photo', date: '2026-02', title: 'From a photo of a schedule to real classes',
      simple: ['A new gym sends a photo of its weekly schedule. Someone typed every class into MAAT by hand, about 30 minutes per gym.', 'Now the AI reads the photo into a table, a person checks it, and the classes land in MAAT. Five minutes.'],
      learned: 'Put a person where the AI is unsure, and make that step easy.',
      article: {title: 'From a gym schedule picture to classes in MAAT', href: '/posts/gym-schedule-image-to-classes'}},
    // To check: the month. Bernat: "Then we also move the migration process from other providers to MAAT with the AI migration."
    {id: 'maat-migrations', short: 'AI migrations', part: 1, icon: 'files', date: '2026-04', title: 'AI migrations from other providers',
      simple: ['A new gym brings years of data from its old software. Someone had to map all of it into MAAT.', 'AI does the mapping now. I took the whole migration process on myself, with my own AI workflow.'],
      learned: 'With the right AI workflow, one person can own a process that used to need the team.', article: null},
    // To check: the month the first Brain was in use by the team.
    {id: 'maat-heads', short: 'In people\'s heads', part: 2, icon: 'heads', date: '2026-04', title: 'The knowledge lived in people\'s heads',
      simple: ['To solve a support ticket you needed Stripe, the database, and the one person who knew the exceptions.', 'If you weren\'t a developer, you asked one. For every answer.'],
      learned: 'Access to data isn\'t the same as knowing how the work is done.', article: null},
    {id: 'maat-brain-1', short: 'The first Brain', part: 2, icon: 'tree', date: '2026-06', title: 'The first Brain: a tree of files the agent can follow',
      simple: ['We kept what we learned in every support conversation in a tree of files. Stripe, the database, one runbook per support task.', 'Suddenly the whole team could ask the AI about Stripe or the database, and support started solving tasks on its own.'],
      learned: 'A tree of context lets an agent find its way without reading everything.',
      article: {title: 'How we built a context tree for our agent to resolve support tasks', href: '/posts/context-tree-agent-support-tasks'}},
    {id: 'maat-brain-2', short: 'Playbooks', part: 2, icon: 'brain', date: '2026-08', title: 'The official Brain, with playbooks',
      simple: ['The Brain became an MCP server with real authentication, so the team reaches it from any AI client.', 'A playbook is a pre approved procedure. The AI picks the playbook for a gym owner\'s problem, only the parameters change, so the run stays deterministic.'],
      learned: 'A fixed playbook with a few parameters keeps a non technical user safe from a rogue AI.',
      article: {title: 'Building an AI Brain at MAAT', href: '/posts/building-an-ai-brain-at-maat'}},
    {id: 'maat-admin', short: 'Admin Agent', part: 3, icon: 'chat', date: '2026-09', title: 'Gym owners ask in plain words', latest: true,
      simple: ['A gym owner types "Who came to class yesterday?"', 'Jev, a small decision model, decides what the question is about. Then the AI model finds the answer and shows it as a table or a chart.'],
      learned: 'Decide what the agent should do before the AI writes the answer.',
      article: {title: 'How we built the MAAT Admin Agent for gym owners', href: '/posts/how-we-built-the-maat-admin-agent'}},
  ],
};
