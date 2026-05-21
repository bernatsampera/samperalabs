import type { ComponentType } from 'react';

type LazyImport = () => Promise<{ default: ComponentType }>;

/**
 * Maps essay slugs to their interactive React components.
 *
 * To add an interactive component for an essay:
 * 1. Create a React component in src/components/react/essays/
 * 2. Export it as default
 * 3. Add an entry here mapping the essay slug to a dynamic import
 *
 * Example:
 *   'my-essay-slug': () => import('../components/react/essays/MyEssayInteractive'),
 */
export const interactiveEssayRegistry: Record<string, LazyImport> = {
  'lessons-learned-building-a-real-world-ai-agent-with-langgraph': () =>
    import('../components/react/essays/TranslationFeedbackLoop'),
};

export function hasInteractiveComponent(slug: string): boolean {
  return slug in interactiveEssayRegistry;
}

export function getInteractiveComponent(slug: string): LazyImport | null {
  return interactiveEssayRegistry[slug] ?? null;
}
