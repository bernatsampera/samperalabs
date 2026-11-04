import type {icons} from './icons';

// One story: a journey with a question, split into parts. Each part has a mission and chapters.
// Each story page shows a timeline and a continuous path with visible work cards.

export interface Story {
  slug: string; // the page URL: /<slug>
  name: string;
  mission: string; // the question the story answers
  context: string;
  overview?: {
    title: string;
    role: string;
    introduction: string;
    transition: string;
  };
  parts: StoryPart[];
  chapters: StoryChapter[];
}

export interface StoryPart {
  id: number; // Stable part number for the #part-N link.
  name: string;
  mission: string;
  summary?: string;
  introduction?: string; // Short explanation above the work in this part.
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
  dateLabel?: string; // Use a broader label when the exact month is not confirmed.
  title: string;
  simple: string[];
  preview?: string; // Concise copy for the visible journey card.
  visual?: {kind: string; label: string; question?: string};
  learned: string;
  detail?: {
    workLabel: string;
    result?: string;
    flow: string[];
    caption: string;
    image?: {src: string; alt: string; width: number; height: number};
    metric?: {before: string; after: string; label: string};
  };
  latest?: boolean; // the newest chapter of the story; "Go to the newest chapter" opens it
  article: {title: string; href: string} | null;
}
