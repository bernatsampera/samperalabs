import type {Story} from './types';

// DRAFT content. The chapters come from the "AI has no memory" journey in design-preview/world/journey/data.js,
// which is mock data for design review. The three part names and missions group those chapters and are placeholders.
// Replace this file with the real story before publishing.
export const gcontext: Story = {
  slug: 'gcontext',
  name: 'gcontext',
  mission: 'How should AI store and find information?',
  context: 'My own research, and how I see AI: the hard part is not the model. It is the information we give it.',
  parts: [
    {id: 1, name: 'The gap', mission: 'Why does a strong model still give weak answers about my work?', from: '2026-05', to: '2026-06', status: 'done'},
    {id: 2, name: 'A shape for knowledge', mission: 'How does an AI find what it needs without reading everything?', from: '2026-07', to: '2026-08', status: 'done'},
    {id: 3, name: 'Between sessions', mission: 'How does knowledge outlive the session?', from: '2026-10', to: null, status: 'ongoing'},
  ],
  chapters: [
    {id: 'k-1', short: 'Not your work', part: 1, icon: 'blank', date: '2026-05', title: 'A model knows the world, not your work',
      simple: ['A model has read most of the internet.', 'It has never read your notes, your rules, or your reasons.'],
      learned: 'The gap is not intelligence. It is information.', article: null},
    {id: 'k-2', short: 'All information', part: 1, icon: 'files', date: '2026-06', title: 'Everything is information',
      simple: ['Code, a chat, a rule in someone\'s head: all of it is information.', 'If it is written down clearly, an AI can use it.'],
      learned: 'Working with AI is mostly knowledge work.',
      article: {title: 'Express the general', href: '/posts/express-the-general'}},
    {id: 'k-3', short: 'A shape', part: 2, icon: 'tree', date: '2026-07', title: 'Knowledge needs a shape',
      simple: ['A pile of documents does not help anyone.', 'Knowledge needs a structure that people and AI both understand.'],
      learned: 'Give a map, not a pile.', article: null},
    {id: 'k-4', short: 'Load little', part: 2, icon: 'map', date: '2026-08', title: 'Load little, find fast',
      simple: ['If you give an AI everything, it gets lost.', 'It should read the map first, then open only what the question needs.'],
      learned: 'Minimal to load, fast to find.',
      article: {title: 'Global context for AI agents: minimal to load, fast to find', href: '/posts/why-ai-agents-need-a-global-context'}},
    {id: 'k-5', short: 'Keep the lessons', part: 3, icon: 'save', date: '2026-10', title: 'Knowledge must outlive the session', latest: true,
      simple: ['Each AI session ends and forgets what it learned.', 'I am testing a small tool, gcontext, that saves the useful parts for the next session.'],
      learned: 'Saving knowledge must be a clear step that a person approves.', article: null},
  ],
};
