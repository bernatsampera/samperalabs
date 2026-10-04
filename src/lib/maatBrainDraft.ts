import content from '../editorial/drafts/maat-brain.md?raw';
import comicUrl from '../editorial/drafts/maat-brain-comic.png?url';
import { enhancePostWithMetadata } from './db';

// Import only behind import.meta.env.DEV. This never enters the public store.
export const maatBrainDraft = enhancePostWithMetadata({
  slug: 'building-an-ai-brain-at-maat',
  title: 'Building an AI Brain at MAAT',
  author: 'Bernat Sampera',
  description: 'The problem, the tools, and how we brought them together through shared context.',
  pub_date: '2026-10-03',
  tags: ['AI', 'Context'],
  status: 'draft',
  content: content.replace('src="maat-brain-comic.png"', `src="${comicUrl}"`),
});
