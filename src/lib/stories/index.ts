import {icons} from './icons';
import {maat} from './maat';
import {gcontext} from './gcontext';
import type {Story, StoryPart} from './types';

export type {Story, StoryPart, StoryChapter} from './types';

// Every story in home page order. To add one: write its data file, add it here, and add a page in src/pages.
export const stories: Story[] = [maat, gcontext];
export {maat, gcontext};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthShort = (ym: string) => MONTHS[Number(ym.slice(5, 7)) - 1];
export const monthYear = (ym: string) => `${monthShort(ym)} ${ym.slice(0, 4)}`;
export const partDates = (p: StoryPart) => `${monthYear(p.from)} to ${p.to ? monthYear(p.to) : 'now'}`;
export const partChapters = (story: Story, p: StoryPart) =>
  story.chapters.filter((c) => c.part === p.id).sort((a, b) => a.date.localeCompare(b.date));
export const startYear = (story: Story) => story.parts.reduce((y, p) => (p.from < y ? p.from : y), story.parts[0].from).slice(0, 4);

/** The shape src/scripts/story.js reads. Sends only the icons the story uses. */
export function clientData(story: Story) {
  const used = new Set(story.chapters.map((c) => c.icon));
  return {
    journey: {id: story.slug, name: story.name, mission: story.mission, context: story.context},
    seasons: story.parts.map(({id, name, mission, from, to, status}) => ({id, name, mission, from, to, status})),
    chapters: story.chapters.map(({part, ...c}) => ({...c, season: part})),
    icons: Object.fromEntries(Object.entries(icons).filter(([name]) => used.has(name as keyof typeof icons))),
  };
}
