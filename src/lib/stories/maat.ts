import type {Story} from './types';

// Ported from design-preview/world/journey/guided/data.js, the data of the approved clean/maat.html.
// That file marks the chapter dates and the "AI migrations" chapter as mock data. Confirm before publishing.
export const maat: Story = {
  slug: 'maat',
  name: 'MAAT',
  mission: 'How does a company become AI native?',
  context: 'MAAT makes software for combat sports gyms. I help the team, and the gym owners, work with AI.',
  parts: [
    {id: 1, name: 'Internal AI tools', mission: 'How can AI take slow, manual work off the team?', from: '2026-05', to: '2026-09', status: 'done'},
    {id: 2, name: 'The company brain', mission: 'Can one place answer any question about MAAT?', from: '2026-05', to: null, status: 'ongoing'},
    {id: 3, name: 'AI for our customers', mission: 'How can gym owners use AI every day?', from: '2026-09', to: null, status: 'ongoing'},
  ],
  chapters: [
    {id: 'maat-mig', short: 'AI migrations', part: 1, icon: 'files', date: '2026-05', title: 'AI migrations to MAAT',
      simple: ['A new gym brings years of data from its old software.', 'AI maps that data into MAAT, and a person checks the result.'],
      learned: 'Check the AI output before it reaches a customer.', article: null},
    {id: 'maat-4', short: 'Schedule photos', part: 1, icon: 'photo', date: '2026-09', title: 'From a photo of a schedule to real classes',
      simple: ['Gyms send a picture of their class schedule.', 'The AI turns the picture into text, a person checks it, and the classes appear in MAAT.'],
      learned: 'Put a person where the AI is unsure, and make that step easy.',
      article: {title: 'From a gym schedule picture to classes in MAAT', href: '/posts/gym-schedule-image-to-classes'}},
    {id: 'maat-1', short: 'In people\'s heads', part: 2, icon: 'heads', date: '2026-05', title: 'The knowledge lived in people\'s heads',
      simple: ['To do one task, you had to ask three people.', 'The rules were in documents. The exceptions were in someone\'s head.'],
      learned: 'Access to data is not the same as knowing how the work is done.', article: null},
    {id: 'maat-2', short: 'The Brain', part: 2, icon: 'brain', date: '2026-06', title: 'We drew a map of what we know',
      simple: ['We made one shared place for our knowledge: the MAAT Brain.', 'People and AI follow the same map.'],
      learned: 'The shape of knowledge matters as much as the knowledge.',
      article: {title: 'Building an AI Brain at MAAT', href: '/posts/building-an-ai-brain-at-maat'}},
    {id: 'maat-3', short: 'Support tasks', part: 2, icon: 'tree', date: '2026-07', title: 'The agent learned to do support tasks',
      simple: ['Now the AI could read the map and do real support work.', 'It reads the right branch first, then only the pages it needs.'],
      learned: 'A tree of context lets an agent find its way without reading everything.',
      article: {title: 'A context tree for agent support tasks', href: '/posts/context-tree-agent-support-tasks'}},
    {id: 'maat-5', short: 'Admin Agent', part: 3, icon: 'chat', date: '2026-10', title: 'Gym owners can ask in plain words', latest: true,
      simple: ['A gym owner types: "Who came to class yesterday?"', 'The Admin Agent finds the answer and shows it as a table or a chart.'],
      learned: 'Decide what the agent should do before the AI writes the answer.',
      article: {title: 'How we built the MAAT Admin Agent for gym owners', href: '/posts/how-we-built-the-maat-admin-agent'}},
  ],
};
