'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GuestSite from '@/components/wedding/GuestSite';
import AdminLoginPage from '@/app/admin/login/page';
import WorkspaceLoginPage from '@/app/workspace/login/page';

function ViewRouter() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  if (view === 'cms') {
    return <AdminLoginPage />;
  }
  if (view === 'couple') {
    return <WorkspaceLoginPage />;
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