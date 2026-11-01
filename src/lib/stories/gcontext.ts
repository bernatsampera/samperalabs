import type {Story} from './types';

// Round 5 (2026-11-01). Written from Bernat's interview answers (design-preview/home-experiences/evidence.md, section 9),
// the gcontext repositories, and his published articles, in his spoken voice. Bernat owns this text.
// gcontext is his own project, outside MAAT. The story does not mention MAAT.
// To check before publishing: the start month (Bernat: "it started in March"), and the chapter dates of part 2.
export const gcontext: Story = {
  slug: 'gcontext',
  name: 'gcontext',
  mission: 'How should AI store and find information?',
  context: 'My own project. An AI agent forgets everything when its session ends. I\'m looking for the smallest amount of human work that keeps its memory small and current.',
  parts: [
    {id: 1, name: 'Context as modules', mission: 'What does an agent need to know before it can help?', from: '2026-03', to: '2026-07', status: 'done'},
    {id: 2, name: 'Memory writes itself', mission: 'Can an AI organize its own memory?', from: '2026-08', to: '2026-10', status: 'done'},
    {id: 3, name: 'The handbook', mission: 'How little must a person do to keep the memory current?', from: '2026-10', to: null, status: 'ongoing'},
  ],
  chapters: [
    {id: 'g-zero', short: 'From zero', part: 1, icon: 'blank', date: '2026-03', title: 'A model knows the world, not your work',
      simple: ['Every new session started from zero, and I was the one explaining the same systems again and again.', 'So I started writing what I knew into plain files an agent could load. One module per system, one per procedure.'],
      learned: 'The gap isn\'t intelligence. It\'s information.', article: null},
    {id: 'g-modules', short: 'Modules', part: 1, icon: 'files', date: '2026-05', title: 'A web app to load the right modules',
      simple: ['I built a web app where you pick which modules an agent loads for a task, with the secrets injected by name.', 'I never released it. I didn\'t want to deal with secrets if it became a service. I still use it myself.'],
      learned: 'Context has to be small per task. Load everything and the session gets worse.',
      article: {title: 'Your AI Agent Deserves Its Own Repo', href: '/posts/your-ai-agent-deserves-its-own-repo'}},
    {id: 'g-general', short: 'The goal', part: 1, icon: 'chat', date: '2026-06', title: 'Say the goal, not the steps',
      simple: ['I kept giving the model my method instead of my goal, and it followed me into bad methods.', 'Now a request names the result, the facts and limits, and marks my guesses as guesses.'],
      learned: 'Give a helper only the steps and it can\'t find a better way.',
      article: {title: 'Express the General', href: '/posts/express-the-general'}},
    {id: 'g-folder', short: 'A folder', part: 2, icon: 'tree', date: '2026-08', title: 'Your agent is a folder',
      simple: ['I rebuilt gcontext as a folder. Connections, modules, rules, and one local server that serves it to any coding agent.', 'It worked for what I wrote by hand. It didn\'t grow by itself. A library changed one function and it hurt me for weeks, until I updated the file.'],
      learned: 'A memory that a person has to update by hand goes stale.', article: null},
    {id: 'g-map', short: 'The map', part: 2, icon: 'map', date: '2026-10', title: 'Minimal to load, fast to find',
      simple: ['Two failures. Nothing told the agent where to look, and nobody saved what the session learned.', 'The fix is a map split into domains, and a save step in the domain where the change belongs.'],
      learned: 'Write the context for how the AI loads it. Minimal to load, fast to find.',
      article: {title: 'Global context for AI agents: minimal to load, fast to find', href: '/posts/why-ai-agents-need-a-global-context'}},
    {id: 'g-alone', short: 'Not alone', part: 2, icon: 'question', date: '2026-10', title: 'An AI cannot organize context alone',
      simple: ['For weeks I let the model build the structure from the pieces. It saved too much and couldn\'t tell where things belonged. One whole week with zero progress.', 'A model predicts the next word well. It organizes information badly, unless a person gives it the purpose of each place.'],
      learned: 'Noise is the enemy. A lost fact isn\'t worse than extra text.', article: null},
    {id: 'g-handbook', short: 'The handbook', part: 3, icon: 'save', date: '2026-10', title: 'The handbook, and a person who says yes', latest: true,
      simple: ['gcontext now gives a coding agent a handbook. A folder of Markdown files with what it needs to know about a project.', 'When a session ends, gcontext reads it, keeps what my rules ask for, and proposes changes. I accept or reject each one. The first real run worked on October 31.'],
      learned: 'The open question is how little a person has to do. That\'s where my time goes.', article: null},
  ],
};
