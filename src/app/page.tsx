'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GuestSite from '@/components/wedding/GuestSite';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import MasterCMSLayout from '@/components/cms/MasterCMSLayout';
import MasterCMSPageRouter from '@/components/cms/MasterCMSPageRouter';
import CoupleCMSLayout from '@/components/cms/CoupleCMSLayout';
import CoupleCMSPageRouter from '@/components/cms/CoupleCMSPageRouter';

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
  // view was requested.  The modal's onSuccess now just closes — the
  // session change propagates via next-auth/react and this component
  // re-renders with the CMS layout.
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
    // Wrong role but authenticated — show a helpful message
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
    // Not authenticated — fall through to GuestSite with modal
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
    // Wrong role but authenticated
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
    // Not authenticated — fall through to GuestSite with modal
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