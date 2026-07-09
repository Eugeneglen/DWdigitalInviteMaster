'use client';

import { useEffect } from 'react';
import { useContentStore } from '@/store/useContentStore';

const DEFAULT_WEDDING_SLUG = 'eleanor-james';

/**
 * Triggers the initial content load for a wedding site.
 * On mount (or when `weddingSlug` changes), calls `loadContent` from the
 * content store if content has not already been loaded.
 *
 * @param weddingSlug - The account slug to load. Defaults to `'eleanor-james'`.
 * @returns `{ isLoading, isLoaded, error }` derived from the store.
 */
export function useWeddingContent(weddingSlug: string = DEFAULT_WEDDING_SLUG) {
  const loadContent = useContentStore((s) => s.loadContent);
  const isLoaded = useContentStore((s) => s.isLoaded);
  const isLoading = useContentStore((s) => s.isLoading);
  const error = useContentStore((s) => s.error);

  useEffect(() => {
    if (!isLoaded && !isLoading) {
      loadContent(weddingSlug);
    }
  }, [weddingSlug, isLoaded, isLoading, loadContent]);

  return { isLoading, isLoaded, error };
}