import rss from '@astrojs/rss';
import {getDB} from '../lib/db';

export async function GET(context) {
  const db = getDB();
  const posts = db.getAllPosts()
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
