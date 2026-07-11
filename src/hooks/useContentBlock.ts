'use client';

import { useMemo } from 'react';
import { useContentStore } from '@/store/useContentStore';
import type { ContentPage, ContentSection, ContentBlock } from '@/types/content';

/**
 * Returns a content block's string value by its page → section → key path.
 * Falls back to an empty string when the block is not found.
 *
 * Uses a stable selector (memoized by page/section/key) to prevent
 * excessive Zustand re-subscriptions that cause infinite re-render loops.
 */
export function useContentBlock(
  pageSlug: string,
  sectionSlug: string,
  key: string,
): string {
  const selector = useMemo(
    () => (state: { content: Map<string, ContentPage> }) => {
      const page = state.content.get(pageSlug);
      if (!page) return undefined;
      const section = page.sections.find((s: ContentSection) => s.slug === sectionSlug);
      if (!section) return undefined;
      const block = section.blocks.find((b: ContentBlock) => b.key === key);
      return block?.value;
    },
    [pageSlug, sectionSlug, key],
  );

  const raw = useContentStore(selector);
  return raw ?? '';
}

/**
 * Returns a content block's value parsed as JSON.
 * Returns `null` when the block is missing, empty, or contains invalid JSON.
 */
export function useContentBlockJSON<T>(
  pageSlug: string,
  sectionSlug: string,
  key: string,
): T | null {
  const selector = useMemo(
    () => (state: { content: Map<string, ContentPage> }) => {
      const page = state.content.get(pageSlug);
      if (!page) return null;
      const section = page.sections.find((s: ContentSection) => s.slug === sectionSlug);
      if (!section) return null;
      const block = section.blocks.find((b: ContentBlock) => b.key === key);
      if (!block?.value) return null;
      try {
        return JSON.parse(block.value) as T;
      } catch {
        return null;
      }
    },
    [pageSlug, sectionSlug, key],
  );

  return useContentStore(selector);
}