import type {APIRoute} from 'astro';
import {generateOpenGraphImage} from 'astro-og-canvas';
import {getDB, getNoteDB} from '~/lib/db';

export const prerender = false;

const fonts = ['./public/fonts/ppneuemontreal-bold.otf', './public/fonts/ppneuemontreal-book.otf'];

// Strip markdown to plain prose and truncate, for use as a fallback subtitle.
// ponytail: fixed char cap, not pixel-measured — bump if cards clip or look short.
const excerpt = (md: string, title = '', max = 160): string => {
  let text = md
    .replace(/```[\s\S]*?```/g, '') // code fences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/[#>*_`~-]/g, '') // markdown symbols
    .replace(/\s+/g, ' ')
    .trim();
  if (title && text.toLowerCase().startsWith(title.toLowerCase())) {
    text = text.slice(title.length).trim();
  }
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
};

export const GET: APIRoute = async ({params}) => {
  const {type, slug} = params;

  let title: string | undefined;
  let description = '';

  if (type === 'posts') {
    const post = await getDB().getPostBySlug(slug ?? '');
    if (post) {
      title = post.title;
      description = post.description?.trim() || excerpt(post.content ?? '', post.title);
    }
  } else if (type === 'notes') {
    const note = await getNoteDB().getNoteBySlug(slug ?? '');
    if (note) {
      title = note.title;
      description = excerpt(note.content ?? '', note.title);
    }
  }

  if (!title) return new Response('Not found', {status: 404});

  const png = await generateOpenGraphImage({
    title,
    description,
    fonts,
    bgGradient: [[255, 255, 255], [243, 242, 240]],
    border: {color: [17, 17, 17], width: 16, side: 'inline-start'},
    padding: 96,
    font: {
      title: {color: [17, 17, 17], size: 80, lineHeight: 1.05, weight: 'Bold', families: ['PP Neue Montreal']},
      description: {color: [110, 110, 110], size: 36, lineHeight: 1.4, weight: 'Normal', families: ['PP Neue Montreal']},
    },
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
};
