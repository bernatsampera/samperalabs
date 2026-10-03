import React, { lazy, Suspense, useMemo } from 'react';
import { getInteractiveComponent } from '../../lib/interactiveEssays';

interface Props {
  slug: string;
}

export default function InteractiveEssayPreview({ slug }: Props) {
  const Component = useMemo(() => {
    const loader = getInteractiveComponent(slug);
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
