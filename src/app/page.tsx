'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GuestSite from '@/components/wedding/GuestSite';

function ViewRouter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view');

  useEffect(() => {
    if (view === 'cms') {
      router.replace('/admin/login');
    } else if (view === 'couple') {
      router.replace('/workspace/login');
    }
  }, [view, router]);

  if (view === 'cms' || view === 'couple') {
    return null;
  }

  return <GuestSite showEditorButton />;
}

export default function Page() {
  return (
    <Suspense>
      <ViewRouter />
    </Suspense>
  );
}