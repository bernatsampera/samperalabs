export const SELECTED_PROJECT_SLUGS = ['bjjgym', 'indoeuromap', 'gcontext'] as const;

// Keep old project posts out of essays and RSS without changing their URLs.
export const HISTORICAL_PROJECT_SLUGS = ['everythingiscontext', 'contextagora', 'bjjgym', 'packdensack'] as const;
export const PROJECT_SLUGS = [...new Set([...HISTORICAL_PROJECT_SLUGS, ...SELECTED_PROJECT_SLUGS])];
export const projectSlugSet = new Set<string>(PROJECT_SLUGS);
export const isProjectSlug = (slug: string): boolean => projectSlugSet.has(slug);

export const selectedProjects = [
  {
    slug: 'bjjgym', name: 'BJJGym', category: 'Travel & training', url: 'https://bjjgym.com',
    purpose: 'Find a BJJ gym. Wherever you travel.',
    description: 'Find Brazilian jiu-jitsu gyms around the world and choose where to train.',
    problem: 'Gym listings often lack useful details about training styles, cleanliness, teachers, and training level.',
    solution: 'Use AI to extract labels from public reviews, such as no-gi, clean, good teacher, and high level. Show these details for each gym.',
  },
  {
    slug: 'indoeuromap', name: 'IndoEuroMap', category: 'Places & data', url: 'https://indoeuromap.com',
    purpose: 'Explore a city. See its local patterns.',
    description: 'A map of area profiles built from public place and review data.',
    problem: 'Scattered place and review data are hard to understand at the neighbourhood level.',
    solution: 'Combine public signals into area profiles and show them on a map. These profiles do not establish an individual’s ethnicity or culture.',
  },
  {
    slug: 'gcontext', name: 'gcontext', category: 'Agent context', url: 'https://gcontext.ai',
    purpose: 'A new session. The knowledge stays.',
    description: 'Shared, structured context for AI agents across sessions.',
    problem: 'Useful knowledge gets lost between sessions or stays scattered across tools.',
    solution: 'Store knowledge, connections, and procedures in plain files that agents can load and update through MCP.',
  },
] as const;
