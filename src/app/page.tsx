'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GuestSite from '@/components/wedding/GuestSite';
import { useAuthModalStore } from '@/store/useAuthModalStore';

function ViewRouter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view');
  const { data: session, status } = useSession();
  const openModal = useAuthModalStore((s) => s.openModal);

  const role = session?.user?.role;
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ACCOUNT_MANAGER';
  const isCouple = role === 'COUPLE';
  const isAuthenticated = status === 'authenticated' && !!session;

  useEffect(() => {
    if (view === 'cms' && isAuthenticated && isAdmin) {
      router.replace('/admin');
      return;
    }
    if (view === 'couple' && isAuthenticated && isCouple) {
      router.replace('/workspace');
      return;
    }
    if (!isAuthenticated) {
      if (view === 'cms') openModal('cms');
      else if (view === 'couple') openModal('default');
    }
  }, [view, isAuthenticated, isAdmin, isCouple, router, openModal]);

  if (view === 'cms' && isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-cream p-6">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-charcoal-ink mb-2">Access Denied</p>
          <p className="text-sm text-charcoal-ink/60">Your account does not have admin privileges.</p>
        </div>
      </div>
    );
  }
  if (view === 'couple' && isAuthenticated && !isCouple) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-cream p-6">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-charcoal-ink mb-2">Access Denied</p>
          <p className="text-sm text-charcoal-ink/60">Your account does not have couple privileges.</p>
        </div>
      </div>
    );
  }

  if (view === 'cms' || view === 'couple') return null;

  return <GuestSite showEditorButton />;
}

export default function Page() {
  return (
    <Suspense>
      <ViewRouter />
    </Suspense>
  );
}
