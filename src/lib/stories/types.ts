import type {icons} from './icons';

// One story: a journey with a question, split into parts. Each part has a mission and chapters.
// The home page shows its part cards. Its own page (/<slug>) shows the timeline and the guided path.

export interface Story {
  slug: string; // the page URL: /<slug>
  name: string;
  mission: string; // the question the story answers
  context: string;
  parts: StoryPart[];
  chapters: StoryChapter[];
}

export interface StoryPart {
  id: number; // 1, 2, 3: the number badge and the #part-N link
  name: string;
  mission: string;
  from: string; // YYYY-MM
  to: string | null; // null while it is still going
  status: 'done' | 'ongoing';
}

export interface StoryChapter {
  id: string;
  short: string; // the label on the path and the part card
  part: number; // StoryPart.id
  icon: keyof typeof icons;
  date: string; // YYYY-MM
  title: string;
  simple: string[];
  learned: string;
  latest?: boolean; // the newest chapter of the story; "Go to the newest chapter" opens it
  article: {title: string; href: string} | null;
}
