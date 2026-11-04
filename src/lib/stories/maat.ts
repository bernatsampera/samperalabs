import type {Story} from './types';

// Based on Bernat's interview (design-preview/home-experiences/evidence.md, section 9)
// and the schedule import, Brain, and Admin Agent article sources. Bernat owns this text.
// To check before publishing: the month of the AI migrations (part 1), the month the first Brain started (part 2),
// and the end of part 1 (now open).
export const maat: Story = {
  slug: 'maat',
  name: 'MAAT',
  mission: 'How does a company become AI native?',
  context: 'MAAT helps gym owners run their academy, mostly martial arts like Brazilian jiu-jitsu, MMA, and kickboxing. I joined at the end of 2025 to bring AI to the team and to the owners.',
  overview: {
    title: 'Enabling AI across MAAT',
    role: 'AI engineer since late 2025',
    introduction: 'I joined MAAT as an AI engineer in late 2025. I help the team use AI in its daily work, share company knowledge, and build new tools for gym owners.',
    transition: 'My work falls into three areas:',
  },
  parts: [
    {id: 1, introduction: "Practical AI tools that reduce manual work for the MAAT team.", name: 'Internal tools', mission: 'How can AI reduce repeated work?', from: '2026-02', to: null, status: 'ongoing',
      summary: 'I built schedule import from images and AI workflows for data migrations from other providers.'},
    {id: 2, introduction: "Shared company knowledge and approved procedures that the team and AI can use.", name: 'MAAT Brain', mission: 'How can the team use what the company knows?', from: '2026-04', to: null, status: 'ongoing',
      summary: 'We built a shared system for company knowledge, service connections, and approved procedures. It helps the team answer questions and resolve support tasks. It is an internal tool, but its scope makes it a separate area of work.'},
    {id: 3, introduction: "An assistant in the MAAT dashboard that helps gym owners get answers from their data.", name: 'Admin Agent', mission: 'How can gym owners get answers from their data?', from: '2026-09', to: null, status: 'ongoing',
      summary: 'I lead the AI infrastructure and backend work for an agent inside the MAAT dashboard. It lets gym owners ask questions about their data.'},
  ],
  chapters: [
    {id: 'maat-schedule', preview: "I built a tool that reads schedule photos and turns them into editable classes. The team reviews the extracted text before saving.", visual: {"kind":"schedule","label":"Schedule photo to editable classes"}, short: 'Schedule import', part: 1, icon: 'photo', date: '2026-02', title: 'From a schedule photo to editable classes',
      simple: ['A gym sent a picture of its weekly schedule. The team entered every class into MAAT by hand.', 'I built an import tool that reads the picture into editable text. The team checks it before conversion into class fields.'],
      learned: 'Make the intermediate text editable, so the team can correct errors before saving classes.',
      detail: {workLabel: 'My work',
        flow: ['Schedule picture', 'Review the text', 'Edit the classes'], caption: 'Staged example with fictional data.',
        image: {src: '/images/gym-schedule-import-editor.jpg', alt: 'Fictional schedule beside editable class names and times in the MAAT import tool.', width: 1713, height: 927},
        metric: {before: '30 min', after: '5 min', label: 'Approximate time per schedule'}},
      article: {title: 'From a gym schedule picture to classes in MAAT', href: '/posts/gym-schedule-image-to-classes'}},
    // To check: the month. Bernat: "Then we also move the migration process from other providers to MAAT with the AI migration."
    {id: 'maat-migrations', preview: "I took responsibility for moving gym data from other providers into MAAT. I use my own AI workflow to help with the migration.", visual: {"kind":"migration","label":"Move existing data into MAAT"}, short: 'AI migrations', part: 1, icon: 'files', date: '2026-04', dateLabel: '2026', title: 'Bring a gym’s existing data into MAAT',
      simple: ['A gym that changes software needs to move its existing data from the old provider into MAAT.', 'I took responsibility for the migration process and used my own AI workflow to help do the work.'],
      learned: 'I own the migration process. AI helps me do the work.',
      detail: {workLabel: 'My work',
        flow: ['Other provider', 'AI-assisted migration', 'MAAT'], caption: 'Conceptual view of the migration work.'}, article: null},
    // To check: the month the first Brain was in use by the team.
    {id: 'maat-brain-1', preview: "We built linked company guides that both the team and AI can use. Support staff could then resolve tasks without a developer handling each one.", visual: {"kind":"context-tree","label":"An index connects the team to shared guides"}, short: 'Shared context', part: 2, icon: 'tree', date: '2026-06', dateLabel: '2026', title: 'Give the team and AI the same guide',
      simple: ['A support question could need Stripe records, database access, and a colleague who knew the rules and exceptions.', 'We organized that knowledge into linked files: an index, service guides, and procedures for specific tasks.'],
      learned: 'A shared index gives people and AI a route to the relevant instructions.',
      detail: {workLabel: 'What we built', result: 'The team could ask about company data, and support staff started resolving tasks without a developer handling each one.',
        flow: ['Shared index', 'Relevant guide', 'Task procedure'], caption: 'A simplified route through the shared files. Guides link to service instructions and current data.'},
      article: {title: 'How we built a context tree for our agent to resolve support tasks', href: '/posts/context-tree-agent-support-tasks'}},
    {id: 'maat-brain-2', preview: "We added approved playbooks and authentication to the Brain. The team supplies the inputs, and each playbook defines the steps.", visual: {"kind":"playbook","label":"Follow an approved procedure"}, short: 'Approved playbooks', part: 2, icon: 'brain', date: '2026-08', title: 'Turn shared knowledge into approved procedures',
      simple: ['The team needed a more structured way to use the Brain and execute support procedures.', 'We added authentication, approved playbooks, and MCP, a protocol that lets compatible AI clients use the Brain’s tools.'],
      learned: 'Fix the procedure’s steps. The AI still has to choose the right procedure and inputs, within the user’s access.',
      detail: {workLabel: 'What we built', result: 'The team can use predefined procedures with task-specific inputs instead of asking AI to invent every backend step.',
        flow: ['Select a playbook', 'Supply the inputs', 'Run approved steps'], caption: 'A playbook limits the steps. It does not replace access checks or guarantee a correct choice.'},
      article: {title: 'Building an AI Brain at MAAT', href: '/posts/building-an-ai-brain-at-maat'}},
    {id: 'maat-admin', preview: "I lead the AI infrastructure and backend work for answers from gym data. The article covers a read-only agent under internal testing.", visual: {"kind":"answer","label":"A question becomes a table or chart","question":"Who came to class yesterday?"}, short: 'Questions to answers', part: 3, icon: 'chat', date: '2026-09', title: 'Ask a question. Get an answer from gym data.', latest: true,
      simple: ['An owner may need several dashboard screens to answer a question such as, "Who came to class yesterday?"', 'I lead the AI infrastructure and backend work. Jev helps plan each turn, then a larger model reads through MAAT’s API.'],
      learned: 'Separate decisions from answer generation. The backend enforces the owner’s access to data.',
      detail: {workLabel: 'My work', result: 'The agent can show answers as tables or charts. The article describes a read-only version under internal testing.',
        flow: ['Owner’s question', 'Plan and read data', 'Table or chart'], caption: 'Jev returns probabilities. Code uses them to plan the turn before the larger model calls tools and writes.'},
      article: {title: 'How we built the MAAT Admin Agent for gym owners', href: '/posts/how-we-built-the-maat-admin-agent'}},
  ],
};
