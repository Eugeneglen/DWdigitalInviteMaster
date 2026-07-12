'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// PageContent is loaded client-side only.  The `view` param is read from
// the URL in PageContentShell (below) and passed as a prop so that the
// dynamically-loaded chunk never needs to touch the router or window.
const PageContent = dynamic(
  () => import('./_PageContent').then((m) => ({ default: m.PageContent })),
  { ssr: false, loading: () => <div className="loading-state">Loading...</div> },
);

export default function PageClientView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <div className="loading-state">Loading...</div>;

  return (
    <Suspense fallback={<div className="loading-state">Loading...</div>}>
      <PageContentShell />
    </Suspense>
  );
}

function readViewFromURL(): string | null {
  return new URLSearchParams(window.location.search).get('view');
}

/**
 * Thin shell that reads `?view=` from the URL and passes it to the
 * dynamically-imported PageContent.
 *
 * We intentionally read `window.location.search` here (not
 * `useSearchParams()`) because:
 *  1. This component only renders client-side (the `mounted` guard above
 *     guarantees it), so `window` is always available.
 *  2. `useSearchParams()` can suspend in certain Next.js streaming
 *     scenarios, causing the Suspense fallback to flash even when the
 *     search params are already available.
 *  3. Direct `window.location.search` is synchronous and never suspends.
 *
 * A `popstate` listener + incrementing key ensure that browser
 * back/forward navigation also triggers a fresh read of the URL.
 */
function PageContentShell() {
  const [view, setView] = useState(readViewFromURL);
  const [, setTick] = useState(0);

  // React to browser back / forward navigation
  useEffect(() => {
    const onPopState = () => {
      setView(readViewFromURL());
      setTick((n) => n + 1); // force re-render of children
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return <PageContent key={view} view={view} />;
}