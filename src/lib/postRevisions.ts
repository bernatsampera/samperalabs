import agentRepo from '../editorial/revisions/your-ai-agent-deserves-its-own-repo.md?raw';
import openResearch from '../editorial/revisions/analyzing-open-deep-research.md?raw';
import type {Post} from './db';

// These two public articles are managed in source. Admin APIs retain the stored version.
// Edit the Markdown files to change public text, or remove an entry to use the database again.
const revisions: Record<string, {content: string; description: string; source: string}> = {
  'your-ai-agent-deserves-its-own-repo': {
    content: agentRepo,
    description: 'Organize agent context in a repository, load the right files at runtime, and turn repeated work into reusable procedures.',
    source: 'src/editorial/revisions/your-ai-agent-deserves-its-own-repo.md',
  },
  'analyzing-open-deep-research': {
    content: openResearch,
    description: 'How Open Deep Research turns a question into parallel research, and where its architecture makes useful tradeoffs.',
    source: 'src/editorial/revisions/analyzing-open-deep-research.md',
  },
};

export function getPostRevisionSource(slug: string): string | undefined {
  return Object.hasOwn(revisions, slug) ? revisions[slug].source : undefined;
}

export function applyPostRevision(post: Post): Post {
  const revision = Object.hasOwn(revisions, post.slug) ? revisions[post.slug] : undefined;
  return revision ? {...post, content: revision.content, description: revision.description} : post;
}
