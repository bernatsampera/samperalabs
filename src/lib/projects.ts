export const PROJECT_SLUGS = ['contextagora', 'bjjgym', 'packdensack'] as const;

export const projectSlugSet = new Set<string>(PROJECT_SLUGS);

export const isProjectSlug = (slug: string): boolean => projectSlugSet.has(slug);
