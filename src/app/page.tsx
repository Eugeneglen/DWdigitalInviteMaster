'use client';

import { Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthModalStore } from '@/store/useAuthModalStore';

// Dynamic imports to exclude heavy components from the initial static-generation heap
const GuestSite = dynamic(() => import('@/components/wedding/GuestSite'), {
  ssr: false,
  loading: () => <PageShellFallback />,
});

const LoginModal = dynamic(() => import('@/components/cms/LoginModal').then((m) => ({ default: m.LoginModal })), {
  ssr: false,
});

/** Minimal fallback shown inside <Suspense> and during dynamic-chunk load */
function PageShellFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-champagne-silk border-t-transparent" />
        <p className="text-sm text-stone-500">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Inner component that consumes search params.
 * Wrapped by <Suspense> in the outer Page so Next.js can
 * statically render the shell and defer the param-dependent part.
 */
function PageContent() {
  const params = useSearchParams();
  const { status } = useSession();
  const router = useRouter();
  const view = params.get('view');
  const { open: modalOpen, closeModal } = useAuthModalStore();

  useEffect(() => {
    if (status === 'unauthenticated' && (view === 'cms' || view === 'couple')) {
      useAuthModalStore.getState().openModal(view === 'cms' ? 'cms' : 'default');
    }
    if (status === 'authenticated' && view === 'cms') router.replace('/admin');
    if (status === 'authenticated' && view === 'couple') router.replace('/workspace');
  }, [status, view, router]);

  const handleModalClose = useCallback((open: boolean) => {
    if (!open) {
      closeModal();
      router.replace('/');
    }
  }, [closeModal, router]);

  if (status === 'loading') return <PageShellFallback />;

  return (
    <>
      <GuestSite />
      <LoginModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        variant={view === 'couple' ? 'default' : 'cms'}
        targetRole={view === 'couple' ? 'couple' : 'admin'}
      />
    </>
  );
}

/** Public root — static shell that defers to Suspense */
export default function Page() {
  return (
    <Suspense fallback={<PageShellFallback />}>
      <PageContent />
    </Suspense>
  );
}