import rss from '@astrojs/rss';
import {getDB} from '../lib/db';
import {projectSlugSet} from '../lib/projects';

export async function GET(context) {
  const db = getDB();
  const posts = (await db.getAllPosts())
    .filter((post) => !projectSlugSet.has(post.slug))
    .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());

  return rss({
    title: 'Sampera Labs | Writing',
    description: 'Working notes on AI integration by Bernat Sampera.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      description: post.description ?? post.excerpt ?? '',
      pubDate: new Date(post.pub_date),
      link: `/posts/${post.slug}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
