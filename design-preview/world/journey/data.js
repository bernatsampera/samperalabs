// Mock content for "The Journey" mockup of samperalabs.com.
// Every page renders from window.WORLD. Add a chapter to a journey and it
// must appear on the map, in the journey view, and as a chapter page.
// Dates are mock data for design review.

window.WORLD = {
  person: {
    name: 'Bernat Sampera',
    role: 'AI engineer',
    line: 'I work on how knowledge reaches AI.',
    motto: 'Everything is information.',
    mottoLong: 'Working with AI is less about code and more about knowledge: what you know, and how you pass it on.',
    about: [
      'I am not a classic software developer. Most of my work is the knowledge an AI needs before it can help.',
      'At MAAT, I help a company learn to work with AI. In my own time, I research how AI should store and find information.',
    ],
  },

  principles: [
    {n: 1, title: 'Everything is information.', explain: 'Code, a chat, a rule in someone\'s head: all of it is information. AI work starts there.', example: 'Before I build an agent, I list what it must know.'},
    {n: 2, title: 'Knowledge beats code.', explain: 'A strong model with the wrong knowledge gives wrong answers. Most of the work is the knowledge, not the code.', example: 'The MAAT Brain is a set of folders and text, not a program.'},
    {n: 3, title: 'Say the goal, not only the steps.', explain: 'If you give a helper only the steps, it cannot find a better way. Tell it what you want.', example: '"Make this easy to read" beats "add a comment to every line".'},
    {n: 4, title: 'Give a map, not a pile.', explain: 'Nobody reads a pile. A map shows where to look, so the AI reads only what the question needs.', example: 'An agent reads one index first, then opens only the files it needs.'},
    {n: 5, title: 'Write for people and AI at the same time.', explain: 'If a new colleague and an AI can both follow it, it is clear enough.', example: 'Plain files, short sentences, folders with clear names.'},
  ],

  journeys: [
    {
      id: 'maat',
      name: 'MAAT',
      mission: 'How does a company become AI native?',
      context: 'MAAT makes software for combat sports gyms. I help the team, and the gym owners, work with AI.',
      words: ['support', 'procedures', 'exceptions', 'rules', 'migrations', 'connections', 'modules', 'schedules', 'classes', 'owners', 'members', 'actions', 'decisions', 'widgets', 'intents', 'bench', 'agents', 'context', 'team', 'answers'],
      chapters: [
        {
          id: 'maat-1', icon: 'heads', date: '2026-05', status: 'done', short: 'In people\'s heads',
          title: 'The knowledge lived in people\'s heads',
          simple: ['To do one task, you had to ask three people.', 'The rules were in documents. The exceptions were in someone\'s head. The data was in the system.'],
          learned: 'Access to data is not the same as knowing how the work is done.',
          sections: [
            {h: 'The situation', p: 'MAAT makes software for combat sports gyms. Support, migrations, and integrations all depend on rules, exceptions, and current data.'},
            {h: 'The problem', p: 'The rules were in documents, the exceptions in people\'s heads, and the data in services. For each task, someone had to collect all three.'},
            {h: 'Why it matters for AI', p: 'An AI with access to the data still does not know how the work is done. Before a company can use AI, its knowledge must be somewhere an AI can read.'},
          ],
          article: null,
        },
        {
          id: 'maat-2', icon: 'brain', date: '2026-06', status: 'done', short: 'The Brain',
          title: 'We drew a map of what we know',
          simple: ['We made one shared place for our knowledge: the MAAT Brain.', 'It is a set of folders with clear names. People and AI follow the same map.'],
          learned: 'The shape of knowledge matters as much as the knowledge.',
          sections: [
            {h: 'The idea', p: 'One shared place for company knowledge, with a structure that people and AI both follow.'},
            {h: 'How it works', p: 'Top folders for support, modules, and connections. Each folder starts with a short index that says what is inside and when to read it.'},
            {h: 'What changed', p: 'A new task starts from the same map, for a colleague and for an agent.'},
          ],
          article: {title: 'Building an AI Brain at MAAT', href: '#building-an-ai-brain-at-maat'},
        },
        {
          id: 'maat-3', icon: 'tree', date: '2026-07', status: 'done', short: 'Support tasks',
          title: 'The agent learned to do support tasks',
          simple: ['Now the AI could read the map and do real support work.', 'It reads the right branch first, then only the pages it needs.'],
          learned: 'A tree of context lets an agent find its way without reading everything.',
          sections: [
            {h: 'The problem', p: 'A support task needs the right procedure and the right connections, not the whole Brain.'},
            {h: 'How it works', p: 'The agent reads the top index, follows the branch for the task, and opens only the pages it needs.'},
            {h: 'What I learned', p: 'The structure does the routing. The model does not need to search everything.'},
          ],
          article: {title: 'A context tree for agent support tasks', href: '#context-tree-agent-support-tasks'},
        },
        {
          id: 'maat-4', icon: 'photo', date: '2026-09', status: 'done', short: 'Schedule photos',
          title: 'From a photo of a schedule to real classes',
          simple: ['Gyms send a picture of their class schedule.', 'The AI turns the picture into text, a person checks it, and the classes appear in MAAT.'],
          learned: 'Put a person where the AI is unsure, and make that step easy.',
          sections: [
            {h: 'The problem', p: 'New gyms send their class schedule as a picture. The sales team typed every class by hand.'},
            {h: 'How it works', p: 'Docling reads the picture into editable Markdown. A person corrects it. Gemini turns the text into classes in MAAT.'},
            {h: 'What changed', p: 'Schedule entry went from about 30 minutes to about five.'},
          ],
          article: {title: 'From a gym schedule picture to classes in MAAT', href: '#gym-schedule-image-to-classes'},
        },
        {
          id: 'maat-5', icon: 'chat', date: '2026-10', status: 'latest', short: 'Admin Agent',
          title: 'Gym owners can ask in plain words',
          simple: ['A gym owner types: "Who came to class yesterday?"', 'The Admin Agent finds the answer and shows it as a table or a chart.'],
          learned: 'Decide what the agent should do before the AI writes the answer.',
          sections: [
            {h: 'The problem', p: 'To answer a simple question, a gym owner had to open one dashboard screen after another.'},
            {h: 'How it works', p: 'The Admin Agent calls backend actions to get data. A small decision model, Jev, prepares each turn before the AI writes the answer. Answers can include tables and charts.'},
            {h: 'How we keep it right', p: 'A bench of fixed cases tests each change. Real conversations show what owners actually ask for.'},
          ],
          article: {title: 'How we built the MAAT Admin Agent for gym owners', href: '#how-we-built-the-maat-admin-agent'},
        },
      ],
    },
    {
      id: 'knowledge',
      name: 'AI has no memory',
      mission: 'How should AI store and find information?',
      context: 'My own research, and how I see AI: the hard part is not the model. It is the information we give it.',
      words: ['memory', 'index', 'map', 'domains', 'files', 'sessions', 'context', 'retrieval', 'structure', 'names', 'decisions', 'lessons', 'forget', 'review', 'hierarchy', 'notes', 'knowledge', 'questions', 'links', 'trees'],
      chapters: [
        {
          id: 'k-1', icon: 'blank', date: '2026-05', status: 'done', short: 'Not your work',
          title: 'A model knows the world, not your work',
          simple: ['A model has read most of the internet.', 'It has never read your notes, your rules, or your reasons.'],
          learned: 'The gap is not intelligence. It is information.',
          sections: [
            {h: 'The question', p: 'Why does a strong model still give weak answers about my work?'},
            {h: 'What I saw', p: 'The answers failed where the model lacked my context: names, rules, past decisions. With the right context, the same model did well.'},
            {h: 'What I think now', p: 'The limit of AI work today is information, not intelligence.'},
          ],
          article: null,
        },
        {
          id: 'k-2', icon: 'files', date: '2026-06', status: 'done', short: 'All information',
          title: 'Everything is information',
          simple: ['Code, a chat, a rule in someone\'s head: all of it is information.', 'If it is written down clearly, an AI can use it.'],
          learned: 'Working with AI is mostly knowledge work.',
          sections: [
            {h: 'The idea', p: 'Code is only one form of information. Chats, decisions, procedures, and exceptions are information too.'},
            {h: 'Why it matters', p: 'If knowledge stays in heads, no AI can use it. Writing it down clearly is the real work.'},
            {h: 'Where it shows up', p: 'The MAAT Brain is mostly folders and text, not code.'},
          ],
          article: {title: 'Express the general', href: '#express-the-general'},
        },
        {
          id: 'k-3', icon: 'tree', date: '2026-07', status: 'done', short: 'A shape',
          title: 'Knowledge needs a shape',
          simple: ['A pile of documents does not help anyone.', 'Knowledge needs a structure that people and AI both understand.'],
          learned: 'Give a map, not a pile.',
          sections: [
            {h: 'The problem', p: 'A large folder of documents is hard to use, for people and for AI.'},
            {h: 'The idea', p: 'A hierarchy. Each level starts with a short index that says what is below and when to read it.'},
            {h: 'The test', p: 'If a new colleague and an AI can both follow it, the shape is right.'},
          ],
          article: null,
        },
        {
          id: 'k-4', icon: 'map', date: '2026-08', status: 'done', short: 'Load little',
          title: 'Load little, find fast',
          simple: ['If you give an AI everything, it gets lost.', 'It should read the map first, then open only what the question needs.'],
          learned: 'Minimal to load, fast to find.',
          sections: [
            {h: 'The problem', p: 'Loading everything fills the context and hides what matters.'},
            {h: 'The idea', p: 'Split knowledge by domain. Read the map first, then load only the domains the question needs.'},
            {h: 'In practice', p: 'A global context is a map of domains. Each session starts from it and opens only what it needs.'},
          ],
          article: {title: 'Global context for AI agents: minimal to load, fast to find', href: '#why-ai-agents-need-a-global-context'},
        },
        {
          id: 'k-5', icon: 'save', date: '2026-10', status: 'latest', short: 'Keep the lessons',
          title: 'Knowledge must outlive the session',
          simple: ['Each AI session ends and forgets what it learned.', 'I am testing a small tool, gcontext, that saves the useful parts for the next session.'],
          learned: 'Saving knowledge must be a clear step that a person approves.',
          sections: [
            {h: 'The problem', p: 'Each session ends and its lessons disappear. The next one starts from zero.'},
            {h: 'The experiment', p: 'gcontext is a small tool I build to test this. A hook gives each new session the index. At the end, a learn step proposes changes to the knowledge tree.'},
            {h: 'What I learned', p: 'Learning is a manual step. A person chooses the finished session and reviews what stays in the tree.'},
          ],
          article: null,
        },
        {
          id: 'k-6', icon: 'question', date: 'next', status: 'next', short: 'What to forget',
          title: 'What should AI forget?',
          simple: ['Not all knowledge stays true.', 'Next, I want to find how a knowledge base stays small and correct.'],
          learned: 'Still in progress.',
          sections: [
            {h: 'The question', p: 'Knowledge goes stale. Which parts should an AI forget, and who decides?'},
            {h: 'What I will test', p: 'Ways to remove old knowledge, to review changes, and to share one tree between several agents.'},
          ],
          article: null,
        },
      ],
    },
  ],

  products: [
    {id: 'bjjgym', name: 'BJJGym', href: 'https://bjjgym.com', line: 'Find a jiu-jitsu gym wherever you travel.'},
    {id: 'indoeuromap', name: 'IndoEuroMap', href: 'https://indoeuromap.com', line: 'See the patterns of a city on a map.'},
  ],
};
