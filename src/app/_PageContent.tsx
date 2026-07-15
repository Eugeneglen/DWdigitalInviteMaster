'use client';

import dynamic from 'next/dynamic';

const GuestSite = dynamic(() => import('@/components/wedding/GuestSite'), {
  ssr: false,
  loading: () => <div className="loading-state">Loading...</div>,
});

const CoupleCMSView = dynamic(
  () => import('@/components/cms/CoupleCMSView'),
  { ssr: false, loading: () => <div className="loading-state">Loading...</div> },
);

const AdminCMSView = dynamic(
  () => import('@/components/cms/AdminCMSView'),
  { ssr: false, loading: () => <div className="loading-state">Loading...</div> },
);

/**
 * Renders the appropriate top-level view based on the `?view=` query param.
 * The `view` string is passed from PageClientView which reads it via
 * `useSearchParams()` in a non-dynamically-imported shell component.
 */
export function PageContent({ view }: { view: string | null }) {
  if (view === 'couple') {
    return <CoupleCMSView />;
  }

  if (view === 'cms') {
    return <AdminCMSView />;
  }

  // Default → Wedding site (guest-facing)
  return <GuestSite />;
}