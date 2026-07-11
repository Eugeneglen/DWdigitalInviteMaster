'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import GuestSite from '@/components/wedding/GuestSite';
import { useAuthModalStore } from '@/store/useAuthModalStore';

// Lazy-load CMS layouts + page routers so the initial / compilation
// only processes the GuestSite.  The CMS bundles are loaded on demand
// after the user authenticates.
const MasterCMSLayout = dynamic(
  () => import('@/components/cms/MasterCMSLayout'),
  { ssr: false },
);
const MasterCMSPageRouter = dynamic(
  () => import('@/components/cms/MasterCMSPageRouter'),
  { ssr: false },
);
const CoupleCMSLayout = dynamic(
  () => import('@/components/cms/CoupleCMSLayout'),
  { ssr: false },
);
const CoupleCMSPageRouter = dynamic(
  () => import('@/components/cms/CoupleCMSPageRouter'),
  { ssr: false },
);

function ViewRouter() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const { data: session, status } = useSession();
  const openModal = useAuthModalStore((s) => s.openModal);

  const role = session?.user?.role;
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ACCOUNT_MANAGER';
  const isCouple = role === 'COUPLE';
  const isAuthenticated = status === 'authenticated' && !!session;

  // Open the login modal when the user is NOT authenticated and a CMS
  // view was requested.
  useEffect(() => {
    if (!isAuthenticated) {
      if (view === 'cms') {
        openModal('cms');
      } else if (view === 'couple') {
        openModal('default');
      }
    }
  }, [view, isAuthenticated, openModal]);

  // ── Master Admin CMS ────────────────────────────────────────────
  if (view === 'cms') {
    if (isAuthenticated && isAdmin) {
      return (
        <MasterCMSLayout>
          <MasterCMSPageRouter />
        </MasterCMSLayout>
      );
    }
    if (isAuthenticated && !isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-paper-cream p-6">
          <div className="text-center max-w-sm">
            <p className="text-lg font-semibold text-charcoal-ink mb-2">Access Denied</p>
            <p className="text-sm text-charcoal-ink/60">
              Your account does not have admin privileges. Please sign in with an admin account.
            </p>
          </div>
        </div>
      );
    }
  }

  // ── Couple CMS ──────────────────────────────────────────────────
  if (view === 'couple') {
    if (isAuthenticated && isCouple) {
      return (
        <CoupleCMSLayout>
          <CoupleCMSPageRouter />
        </CoupleCMSLayout>
      );
    }
    if (isAuthenticated && !isCouple) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-paper-cream p-6">
          <div className="text-center max-w-sm">
            <p className="text-lg font-semibold text-charcoal-ink mb-2">Access Denied</p>
            <p className="text-sm text-charcoal-ink/60">
              Your account does not have couple privileges. Please sign in with a couple account.
            </p>
          </div>
        </div>
      );
    }
  }

  // ── Guest site (default, or unauthenticated CMS/couple view) ────
  return <GuestSite showEditorButton />;
}

export default function Page() {
  return (
    <Suspense>
      <ViewRouter />
    </Suspense>
  );
}