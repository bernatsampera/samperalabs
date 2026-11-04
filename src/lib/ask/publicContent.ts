import {getPublicPostStore} from '../publicPostStore';
import {CONTENT, type AnswerContent} from './content';

// Public article metadata has one source: the published post store.
export async function getAnswerContent(): Promise<Record<string, AnswerContent>> {
  const posts = (await getPublicPostStore().getAllPosts()).slice().sort((a, b) => b.pub_date.localeCompare(a.pub_date));
  return {
    ...CONTENT,
    articles: {
      ...CONTENT.articles,
      blocks: CONTENT.articles.blocks.map(block => block.kind === 'list'
        ? {...block, articles: posts.slice(0, 3).map(post => ({slug: post.slug, title: post.title, date: post.pub_date.slice(0, 7)}))}
        : block),
    },
  };
}
