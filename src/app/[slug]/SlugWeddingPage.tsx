'use client';

import GuestSite from '@/components/wedding/GuestSite';

interface SlugWeddingPageProps {
  slug: string;
}

export default function SlugWeddingPage({ slug }: SlugWeddingPageProps) {
  return <GuestSite slug={slug} />;
}