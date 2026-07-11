'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GuestSite from '@/components/wedding/GuestSite';

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    const role = session.user.role;

    if (role === 'SUPER_ADMIN' || role === 'ACCOUNT_MANAGER') {
      router.replace('/admin');
      return;
    }

    if (role === 'COUPLE') {
      router.replace('/workspace');
      return;
    }
  }, [session, status, router]);

  return <GuestSite showEditorButton />;
}