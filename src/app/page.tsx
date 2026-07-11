'use client';
import { Suspense } from 'react';
import GuestSite from '@/components/wedding/GuestSite';
export default function Page() {
  return (
    <Suspense>
      <GuestSite showEditorButton />
    </Suspense>
  );
}