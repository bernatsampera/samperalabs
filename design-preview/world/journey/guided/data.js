// Shared mock content for the guided journey examples.
// One journey, split into seasons. Each season is a trip with its own mission.
// Chapters belong to one season. Dates and the migrations chapter are mock data.

window.GUIDED = {
  journey: {
    id: 'maat',
    name: 'MAAT',
    mission: 'How does a company become AI native?',
    context: 'MAAT makes software for combat sports gyms. I help the team, and the gym owners, work with AI.',
  },

  seasons: [
    {
      id: 1, name: 'Internal AI tools', mission: 'How can AI take slow, manual work off the team?',
      from: '2026-05', to: '2026-09', status: 'done',
      color: {light: '#7FD1C7', tint: '#E3F4F0', dark: '#1F5F73'},
    },
    {
      id: 2, name: 'The company brain', mission: 'Can one place answer any question about MAAT?',
      from: '2026-05', to: null, status: 'ongoing',
      color: {light: '#F6B49F', tint: '#FBE8E0', dark: '#8A3F2C'},
    },
    {
      id: 3, name: 'AI for our customers', mission: 'How can gym owners use AI every day?',
      from: '2026-09', to: null, status: 'ongoing',
      color: {light: '#F6C445', tint: '#FCF0CF', dark: '#6E520C'},
    },
  ],

  // In date order inside each season. "latest: true" marks the newest chapter of the whole journey.
  chapters: [
    {id: 'maat-mig', short: 'AI migrations', season: 1, icon: 'files', date: '2026-05', title: 'AI migrations to MAAT',
      simple: ['A new gym brings years of data from its old software.', 'AI maps that data into MAAT, and a person checks the result.'],
      learned: 'Check the AI output before it reaches a customer.', article: null},
    {id: 'maat-4', short: 'Schedule photos', season: 1, icon: 'photo', date: '2026-09', title: 'From a photo of a schedule to real classes',
      simple: ['Gyms send a picture of their class schedule.', 'The AI turns the picture into text, a person checks it, and the classes appear in MAAT.'],
      learned: 'Put a person where the AI is unsure, and make that step easy.', article: {title: 'From a gym schedule picture to classes in MAAT', href: '#'}},
    {id: 'maat-1', short: 'In people\'s heads', season: 2, icon: 'heads', date: '2026-05', title: 'The knowledge lived in people\'s heads',
      simple: ['To do one task, you had to ask three people.', 'The rules were in documents. The exceptions were in someone\'s head.'],
      learned: 'Access to data is not the same as knowing how the work is done.', article: null},
    {id: 'maat-2', short: 'The Brain', season: 2, icon: 'brain', date: '2026-06', title: 'We drew a map of what we know',
      simple: ['We made one shared place for our knowledge: the MAAT Brain.', 'People and AI follow the same map.'],
      learned: 'The shape of knowledge matters as much as the knowledge.', article: {title: 'Building an AI Brain at MAAT', href: '#'}},
    {id: 'maat-3', short: 'Support tasks', season: 2, icon: 'tree', date: '2026-07', title: 'The agent learned to do support tasks',
      simple: ['Now the AI could read the map and do real support work.', 'It reads the right branch first, then only the pages it needs.'],
      learned: 'A tree of context lets an agent find its way without reading everything.', article: {title: 'A context tree for agent support tasks', href: '#'}},
    {id: 'maat-5', short: 'Admin Agent', season: 3, icon: 'chat', date: '2026-10', title: 'Gym owners can ask in plain words', latest: true,
      simple: ['A gym owner types: "Who came to class yesterday?"', 'The Admin Agent finds the answer and shows it as a table or a chart.'],
      learned: 'Decide what the agent should do before the AI writes the answer.', article: {title: 'How we built the MAAT Admin Agent for gym owners', href: '#'}},
  ],

  // Line icons, 64x64 viewBox. Draw with stroke, no fill.
  icons: {
    heads: '<circle cx="20" cy="24" r="8"/><circle cx="44" cy="24" r="8"/><path d="M7 49c2-10 8-15 15-15s13 5 15 15M31 49c2-10 8-15 15-15 6 0 11 4 13 12"/>',
    brain: '<path d="M20 49c-8 0-11-8-7-13-7-6-2-16 6-15 0-8 11-11 15-4 5-6 16-2 14 6 8 1 11 11 5 16 4 7-3 15-11 13H20Z"/><path d="M32 17v31M20 22c8 0 7 8 12 8M44 25c-7 0-6 7-12 7M20 39c5-1 7 3 7 8M45 39c-5-1-7 3-7 8"/>',
    tree: '<circle cx="32" cy="13" r="5"/><circle cx="17" cy="31" r="5"/><circle cx="47" cy="31" r="5"/><circle cx="10" cy="50" r="5"/><circle cx="26" cy="50" r="5"/><circle cx="40" cy="50" r="5"/><circle cx="55" cy="50" r="5"/><path d="M32 18v6M17 26v-4h30v4M17 36v7M47 36v7M10 43h16M40 43h15"/>',
    photo: '<rect x="9" y="14" width="46" height="37" rx="4"/><circle cx="22" cy="26" r="5"/><path d="m13 46 12-12 8 8 7-7 11 11M22 9h20"/>',
    chat: '<path d="M9 14h46v31H31l-12 9v-9H9Z"/><path d="M19 26h26M19 34h18"/>',
    files: '<path d="M12 18h17l5 6h19v31H12Z"/><path d="M17 10h17l5 6h14v8M20 35h24M20 44h18"/>',
  },
};
