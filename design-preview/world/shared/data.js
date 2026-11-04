// Mock content for the SamperaLabs "world" mockups.
// Every page renders from window.WORLD. Add a chapter to a workspace and it
// must appear on the home page and in the story view without other changes.
// Dates and some chapter details are mock data for design review.

window.WORLD = {
  person: {
    name: 'Bernat Sampera',
    role: 'AI engineer, working on context',
    kid: 'I help computers understand what people know.',
    motto: 'Everything is information.',
    mottoLong: 'Working with AI is less about code and more about knowledge: what you know, and how you pass it on.',
    about: [
      'I am not a classic software developer. I work on what an AI needs to know before it can help.',
      'At MAAT, I build AI agents for gyms. At home, I research how agents keep and share knowledge. I call that project gcontext.',
    ],
  },

  principles: [
    {n: 1, title: 'Everything is information.', kid: 'Code, a chat, a rule in someone\'s head: they are all information. AI work starts there.', example: 'Before I write an agent, I list what it must know.'},
    {n: 2, title: 'Knowledge beats code.', kid: 'A smart model with the wrong knowledge gives wrong answers. Most of my work is the knowledge, not the code.', example: 'The MAAT Brain is a set of folders, not a program.'},
    {n: 3, title: 'Say the goal, not only the steps.', kid: 'If you tell a helper only the steps, it cannot find a better way. Tell it what you want.', example: '"Make this easy to read" beats "add comments to every line".'},
    {n: 4, title: 'Give a map, not a pile.', kid: 'Nobody reads a pile of papers. A map shows where to look, so the AI reads only what it needs.', example: 'gcontext loads one index first, then only the files the question needs.'},
    {n: 5, title: 'Write it so people and AI can both read it.', kid: 'If a new colleague and an AI can both follow it, it is clear enough.', example: 'Plain files with short sentences, in folders with clear names.'},
  ],

  workspaces: [
    {
      id: 'maat',
      name: 'MAAT',
      kind: 'Where I work',
      importance: 'center',
      oneLiner: 'MAAT makes software for combat sports gyms. I build the AI agents that help the team and the gym owners.',
      kid: 'A company for gyms. I teach its computers to help people.',
      chapters: [
        {
          id: 'maat-1', date: '2026-05', status: 'done', icon: 'heads', short: 'In people\'s heads',
          title: 'The knowledge lived in people\'s heads',
          kid: ['To do one task, you had to ask three people.', 'The rules were in documents. The exceptions were in someone\'s head. The data was in the system.'],
          learned: 'Having access to data is not the same as knowing how the work is done.',
          deep: 'Support, migrations, and integrations each needed context from people, documents, and services. Someone had to collect it for every task.',
          article: null,
        },
        {
          id: 'maat-2', date: '2026-06', status: 'done', icon: 'brain', short: 'The Brain',
          title: 'We drew a map of what we know',
          kid: ['We made one shared place for our knowledge: the MAAT Brain.', 'It is a set of folders with clear names. People and AI follow the same map.'],
          learned: 'The structure of knowledge matters as much as the knowledge.',
          deep: 'The Brain has top folders for support, modules, and connections. Each folder has an index that says what is inside and when to read it.',
          article: {title: 'Building an AI Brain at MAAT', href: '#building-an-ai-brain-at-maat'},
        },
        {
          id: 'maat-3', date: '2026-07', status: 'done', icon: 'tree', short: 'Support tasks',
          title: 'The agent learned to do support tasks',
          kid: ['Now the AI could read the map and do real support work.', 'It reads the right branch first, then only the pages it needs.'],
          learned: 'A tree of context lets an agent find its way without reading everything.',
          deep: 'A context tree routes each support task to the procedure and the connections it needs.',
          article: {title: 'A context tree for agent support tasks', href: '#context-tree-agent-support-tasks'},
        },
        {
          id: 'maat-4', date: '2026-09', status: 'done', icon: 'photo', short: 'Schedule photos',
          title: 'From a photo of a schedule to real classes',
          kid: ['Gyms send a picture of their class schedule.', 'The AI turns the picture into text, a person checks it, and the classes appear in MAAT.'],
          learned: 'Put a person where the AI is unsure, and make that step easy.',
          deep: 'Docling reads the image into editable Markdown. The sales team corrects it. Gemini turns it into classes. Entry went from 30 minutes to five.',
          article: {title: 'From a gym schedule picture to classes in MAAT', href: '#gym-schedule-image-to-classes'},
        },
        {
          id: 'maat-5', date: '2026-10', status: 'latest', icon: 'chat', short: 'Admin Agent',
          title: 'Gym owners can ask in plain words',
          kid: ['A gym owner types: "Who came to class yesterday?"', 'The Admin Agent finds the answer and shows it as a table or a chart.'],
          learned: 'Decide what the agent should do before the AI writes the answer.',
          deep: 'The agent calls backend actions, a small decision model (Jev) prepares each turn, answers can include widgets, a bench of fixed cases tests it, and real conversations show what owners ask for.',
          article: {title: 'How we built the MAAT Admin Agent for gym owners', href: '#how-we-built-the-maat-admin-agent'},
        },
      ],
    },
    {
      id: 'gcontext',
      name: 'gcontext',
      kind: 'What I research at home',
      importance: 'second',
      oneLiner: 'gcontext is my research on how AI agents keep knowledge between sessions and share it.',
      kid: 'How can a computer remember what it learned yesterday?',
      chapters: [
        {
          id: 'gc-1', date: '2026-06', status: 'done', icon: 'blank', short: 'Starts from zero',
          title: 'Every new chat starts from zero',
          kid: ['Each time you open a new chat, the AI forgets everything.', 'You explain your project again, and again, and again.'],
          learned: 'The model is not the problem. The missing context is.',
          deep: 'An AI model does not know your business. Each session must rebuild what the last one knew.',
          article: null,
        },
        {
          id: 'gc-2', date: '2026-07', status: 'done', icon: 'files', short: 'Plain files',
          title: 'Write it down where both can read it',
          kid: ['I put the knowledge in plain files, in folders with clear names.', 'Each folder starts with a short index: what is here, and when to read it.'],
          learned: 'Plain files work for people, for agents, and for git.',
          deep: 'A context tree: an index.md at the root links to topic files. Agents read the index first, then open only what they need.',
          article: null,
        },
        {
          id: 'gc-3', date: '2026-08', status: 'done', icon: 'map', short: 'Load less',
          title: 'Load only what the question needs',
          kid: ['If you give the AI everything, it gets lost.', 'So the knowledge is split by topic. Each question opens one small part.'],
          learned: 'Minimal to load, fast to find.',
          deep: 'A global context is a map of domains. Each session loads only the domains the question needs.',
          article: {title: 'Global context for AI agents: minimal to load, fast to find', href: '#why-ai-agents-need-a-global-context'},
        },
        {
          id: 'gc-4', date: '2026-10', status: 'latest', icon: 'save', short: 'Learn at the end',
          title: 'Learning at the end of the day',
          kid: ['When a work session ends, the useful parts are saved.', 'Tomorrow, the next session starts where this one stopped.'],
          learned: 'Saving must be a clear step that a person approves.',
          deep: 'A session-start hook gives the agent the index. At the end, an explicit learn command reads the finished session and proposes changes to the tree.',
          article: null,
        },
        {
          id: 'gc-5', date: 'next', status: 'next', icon: 'question', short: 'What to forget',
          title: 'What should it forget?',
          kid: ['Not everything is worth keeping.', 'I am now testing how the tree can stay small and correct.'],
          learned: 'Still in progress.',
          deep: 'Open questions: how to remove stale knowledge, how to review changes, and how to share one tree between several agents.',
          article: null,
        },
      ],
    },
  ],

  products: [
    {id: 'bjjgym', name: 'BJJGym', href: 'https://bjjgym.com', kid: 'Find a jiu-jitsu gym wherever you travel.', detail: 'AI reads public reviews and adds labels such as no-gi, clean, and good teacher.'},
    {id: 'indoeuromap', name: 'IndoEuroMap', href: 'https://indoeuromap.com', kid: 'See the patterns of a city on a map.', detail: 'Public place and review data become simple area profiles.'},
  ],
};
