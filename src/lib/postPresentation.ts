/** Editorial scenes must describe the published article, not a proposed feature. */
export interface PostPresentation {
  scene: 'translation-loop' | 'context-tree' | 'context-repo';
  label: string;
  heading: string;
  summary: string;
  caption: string;
}

// Verified against the published article on 2026-10-03.
// `context-is-everything` is not a published essay, so it has no scene.
const presentations: Record<string, PostPresentation> = {
  'context-tree-agent-support-tasks': {
    scene: 'context-tree',
    label: 'Context for support',
    heading: 'A question. A path. A runbook.',
    summary:
      'Support work led us from manual fixes to a tree of context files. Each index points the agent to service details, task instructions, and past investigations.',
    caption: 'The support index points to task runbooks. Logs keep a record of completed work.',
  },
  'your-ai-agent-deserves-its-own-repo': {
    scene: 'context-repo',
    label: 'Agent context',
    heading: 'New session. Useful context.',
    summary:
      'Keep agent knowledge in version-controlled files. Organize the context, load what each task needs, and save repeated work as reusable procedures.',
    caption: 'A context repo holds the knowledge. Each session loads the files it needs.',
  },
  'lessons-learned-building-a-real-world-ai-agent-with-langgraph': {
    scene: 'translation-loop',
    label: 'Agent architecture',
    heading: 'Translate. Correct. Refine.',
    summary:
      'A translation agent needs room for feedback. This LangGraph workflow keeps the conversation in state and moves slow glossary suggestions into a background job.',
    caption: 'The translation returns first. Glossary suggestions run in the background.',
  },
};

export const getPostPresentation = (slug: string): PostPresentation | undefined => presentations[slug];

const textSummaries: Record<string, string> = {
  'express-the-general': 'State what you want and the constraints that matter. A short essay on prompting, inspired by Kierkegaard, and why guesses about the method can hide the goal.',
  'analyzing-open-deep-research': 'An analysis of how Open Deep Research splits work across agents and carries context between steps. Includes architecture tradeoffs, limits, and practical takeaways.',
};

export const getPostSummary = (slug: string): string | undefined => presentations[slug]?.summary ?? textSummaries[slug];
