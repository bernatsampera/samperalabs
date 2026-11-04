(() => {
// The text that draws the face. Four regions, each with its own lines, taken from the site content
// (src/lib/ask/content.ts). The first region whose test passes wins; the last one takes the rest.
// u, v are image coordinates from 0 to 1 (left to right, top to bottom).
const ell = (cx, cy, rx, ry) => (u, v) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1;

window.FaceFragments = {
  regions: [
    {
      id: 'see', label: 'How I see it', test: ell(0.5, 0.405, 0.26, 0.075),
      lines: [
        "Everything is information. Code, a chat, a rule in someone's head: all of it is information.",
        'Knowledge beats code. A strong model with the wrong knowledge gives wrong answers.',
        'Say the goal, not only the steps. If you give a helper only the steps, it cannot find a better way.',
        'Give a map, not a pile. A map shows where to look, so the AI reads only what the question needs.',
        'Write for people and AI at the same time. If a new colleague and an AI can both follow it, it is clear enough.',
        'The hard part of AI is not the model. It is the information we give it.',
      ],
    },
    {
      id: 'now', label: 'What I work on', test: (u, v) => v < 0.33,
      lines: [
        'At MAAT, I help a software company for combat sports gyms work with AI.',
        'The Admin Agent answers gym owners in plain words.',
        'A support agent follows a context tree to resolve tasks.',
        'I build agents that work with what a company knows.',
        'I work on the knowledge an AI needs before it can help.',
        'In my own time, I research how AI should store and find information.',
        'Global context for AI agents: minimal to load, fast to find.',
        'Building an AI Brain at MAAT.',
        'From a gym schedule picture to classes in MAAT.',
      ],
    },
    {
      id: 'say', label: 'What I say', test: ell(0.5, 0.585, 0.17, 0.085),
      lines: [
        '2026-10 How we built the MAAT Admin Agent for gym owners.',
        '2026-10 Global context for AI agents: minimal to load, fast to find.',
        '2026-10 Building an AI Brain at MAAT.',
        '2026-10 From a gym schedule picture to classes in MAAT.',
        '2026-06 How we built a context tree for our agent to resolve support tasks.',
        '2026-06 Express the General.',
        '2026-05 Context Architecture vs Agent Harnesses: Where Gcontext Fits.',
        '2026-05 Your AI Agent Deserves Its Own Repo.',
        '2026-05 Bet on Optionality.',
        '2026-04 Using Ollama in a simple App with the MCP Protocol.',
        '2026-01 Safely Running Ollama with CPU Temperature Checks in Python.',
        '2025-11 How to handle Human in the loop with Langgraph and FastAPI.',
        '2025-09 Lessons Learned Building a Real-World AI Agent with LangGraph.',
        '2025-07 Advanced Langgraph: Deep dive into open deep research.',
      ],
    },
    {
      id: 'who', label: 'Who I am', test: () => true,
      lines: [
        'I am Bernat, an AI engineer.',
        'I work on the knowledge an AI needs before it can help.',
        'At MAAT, I help a company learn to work with AI.',
        'In my own time, I research how AI should store and find information.',
        'BJJGym: find a jiu-jitsu gym wherever you travel.',
        'IndoEuroMap: see the local patterns of a city on a map.',
        'This page has no chatbot. Every answer is prepared.',
        'A small model, Jev, reads your question and picks the answer that fits.',
        'Everything is information.',
      ],
    },
  ],
};
})();
