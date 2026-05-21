import React, { lazy, Suspense, useMemo } from 'react';
import { interactiveEssayRegistry } from '../../lib/interactiveEssays';

interface Props {
  slug: string;
}

export default function InteractiveEssay({ slug }: Props) {
  const Component = useMemo(() => {
    const loader = interactiveEssayRegistry[slug];
    if (!loader) return null;
    return lazy(loader);
  }, [slug]);

  if (!Component) return null;

  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}
