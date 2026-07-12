'use client';

import { useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/store/useAuthModalStore';

const GuestSite = dynamic(() => import('@/components/wedding/GuestSite'), {
  ssr: false,
  loading: () => <div className="loading-state">Loading...</div>,
});

const LoginModal = dynamic(
  () => import('@/components/cms/LoginModal').then((m) => ({ default: m.LoginModal })),
  { ssr: false },
);

export function PageContent() {
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

  const handleModalClose = useCallback(
    (open: boolean) => {
      if (!open) {
        closeModal();
        router.replace('/');
      }
    },
    [closeModal, router],
  );

  if (status === 'loading') return <div className="loading-state">Loading...</div>;

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