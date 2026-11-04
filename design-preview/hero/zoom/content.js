(() => {
// MOCK CONTENT for the zoom demo. Every part of the face owns one section.
// This is the only file to edit to change what the face shows: add or remove a part, change its shape,
// its depth (how far you zoom before the text clears: 1 is normal, 1.3 is deeper), its title and its lines.
// Each part is typeset with its own section, repeated, so the face is made of what you read when you zoom.
// u, v are photo coordinates from 0 to 1 (left to right, top to bottom). The first shape that matches wins.
const ell = (cx, cy, rx, ry) => (u, v) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1;

const regions = [
  {
    id: 'hair', part: 'Hair', label: 'Career', shape: (u, v) => v < 0.23, depth: 1,
    blocks: [
      { title: '2024 to now', lines: ['MAAT, AI engineer', 'Agents for gym owners', 'The company brain'] },
      { title: '2021 to 2024', lines: ['Software engineer', 'Web products', 'First agents in 2023'] },
      { title: 'Before', lines: ['Computer science', 'Side projects', 'Jiu-jitsu'] },
    ],
  },
  {
    id: 'eyes', part: 'Eyes', label: 'How I see it', shape: ell(0.5, 0.405, 0.27, 0.075), depth: 1,
    blocks: [
      { title: 'Everything is information', lines: ['Code, a chat, a rule in a head', 'Knowledge beats code', 'Give a map, not a pile'] },
      { title: 'AI has no memory', lines: ['Say the goal, not the steps', 'Write for people and AI', 'Context is the hard part'] },
    ],
  },
  {
    id: 'nose', part: 'Nose', label: 'Now', shape: ell(0.5, 0.5, 0.08, 0.075), depth: 1.25,
    blocks: [
      { title: 'This month', lines: ['MAAT Admin Agent', 'Global context research', 'This site'] },
    ],
  },
  {
    id: 'mouth', part: 'Mouth', label: 'Writing', shape: ell(0.5, 0.59, 0.17, 0.075), depth: 1.1,
    blocks: [
      { title: 'Latest articles', lines: ['How we built the MAAT Admin Agent', 'Global context for AI agents', 'Building an AI Brain at MAAT', 'From a schedule picture to classes'] },
    ],
  },
  {
    id: 'shoulders', part: 'Shoulders', label: 'Who I am', shape: (u, v) => v > 0.72, depth: 1,
    blocks: [
      { title: 'Bernat Sampera', lines: ['AI engineer', 'Works at MAAT', 'Researches AI memory'] },
      { title: 'Projects', lines: ['BJJGym', 'IndoEuroMap', 'gcontext'] },
      { title: 'Contact', lines: ['Email', 'LinkedIn', 'X'] },
    ],
  },
];

// The text of the skin between the parts: the general lines about Bernat.
const pool = [
  'I am Bernat, an AI engineer. I work on the knowledge an AI needs before it can help.',
  'At MAAT, I help a company learn to work with AI. In my own time, I research how AI should store and find information.',
  'Everything is information. Code, a chat, a rule in someone\'s head: all of it is information.',
  'Knowledge beats code. A strong model with the wrong knowledge gives wrong answers.',
  'Say the goal, not only the steps. Give a map, not a pile. Write for people and AI at the same time.',
  'The hard part of AI is not the model. It is the information we give it.',
];

window.FaceContent = { regions, pool };
})();
