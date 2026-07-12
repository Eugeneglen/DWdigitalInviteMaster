'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// PageContent is loaded client-side only — useSearchParams() is never
// seen by the SSR/build phase, which prevents the prerender error.
const PageContent = dynamic(
  () => import('./_PageContent').then((m) => ({ default: m.PageContent })),
  { ssr: false, loading: () => <div className="loading-state">Loading...</div> },
);

export default function PageClientView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="loading-state">Loading...</div>;

  return (
    <Suspense fallback={<div className="loading-state">Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}