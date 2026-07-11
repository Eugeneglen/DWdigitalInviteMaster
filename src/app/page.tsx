'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import GuestSite from '@/components/wedding/GuestSite';
import { useAuthModalStore } from '@/store/useAuthModalStore';

function ViewRouter() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const openModal = useAuthModalStore((s) => s.openModal);

  useEffect(() => {
    if (view === 'cms') {
      openModal('cms');
    } else if (view === 'couple') {
      openModal('default');
    }
  }, [view, openModal]);

  return <GuestSite showEditorButton />;
}

export default function Page() {
  return (
    <Suspense>
      <ViewRouter />
    </Suspense>
  );
}