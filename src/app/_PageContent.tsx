'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useAuthModalStore } from '@/store/useAuthModalStore';

export function PageContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  useEffect(() => {
    // 1. Wait until session status is determined
    if (status === 'loading') return;

    // 2. Only open the modal if the user is not logged in
    // This stays on the current page instead of redirecting
    if (status === 'unauthenticated') {
      if (view === 'cms') {
        useAuthModalStore.getState().openModal('cms');
      } else if (view === 'couple') {
        useAuthModalStore.getState().openModal('default');
      }
    }
  }, [status, view]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return null;
}