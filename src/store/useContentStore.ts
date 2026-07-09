'use client';

import { create } from 'zustand';
import type { ContentPage, WeddingContent } from '@/types/content';

interface AccountInfo {
  id: string;
  coupleName1: string;
  coupleName2: string;
  slug: string;
}

interface ContentState {
  /** Pages indexed by slug for O(1) lookup */
  content: Map<string, ContentPage>;
  /** Account metadata */
  accountInfo: AccountInfo | null;
  /** Whether content has been loaded at least once */
  isLoaded: boolean;
  /** Whether a fetch is in progress */
  isLoading: boolean;
  /** Last error from a fetch attempt */
  error: string | null;

  /** Fetch all content for a wedding and populate the store */
  loadContent: (weddingSlug: string) => Promise<void>;

  /** Get a block's string value by page → section → key path */
  getBlock: (
    pageSlug: string,
    sectionSlug: string,
    key: string,
  ) => string | undefined;

  /** Get a block's value parsed as JSON */
  getBlockJSON: <T>(
    pageSlug: string,
    sectionSlug: string,
    key: string,
  ) => T | null;

  /** Get a block's meta field parsed as JSON */
  getBlockMeta: (
    pageSlug: string,
    sectionSlug: string,
    key: string,
  ) => Record<string, unknown> | null;
}

export const useContentStore = create<ContentState>((set, get) => ({
  content: new Map(),
  accountInfo: null,
  isLoaded: false,
  isLoading: false,
  error: null,

  loadContent: async (weddingSlug: string) => {
    // Avoid duplicate loads
    const state = get();
    if (state.isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`/api/content/${weddingSlug}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch content: ${res.status} ${res.statusText}`);
      }

      const data: WeddingContent = await res.json();

      // Build the Map indexed by page slug
      const contentMap = new Map<string, ContentPage>();
      for (const page of data.pages) {
        contentMap.set(page.slug, page);
      }

      set({
        content: contentMap,
        accountInfo: data.account,
        isLoaded: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error loading content';
      set({ isLoading: false, error: message });
    }
  },

  getBlock: (pageSlug, sectionSlug, key) => {
    const page = get().content.get(pageSlug);
    if (!page) return undefined;

    const section = page.sections.find((s) => s.slug === sectionSlug);
    if (!section) return undefined;

    const block = section.blocks.find((b) => b.key === key);
    return block?.value;
  },

  getBlockJSON: <T>(pageSlug, sectionSlug, key) => {
    const raw = get().getBlock(pageSlug, sectionSlug, key);
    if (raw === undefined || raw === '') return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  getBlockMeta: (pageSlug, sectionSlug, key) => {
    const page = get().content.get(pageSlug);
    if (!page) return null;

    const section = page.sections.find((s) => s.slug === sectionSlug);
    if (!section) return null;

    const block = section.blocks.find((b) => b.key === key);
    if (!block?.meta) return null;

    try {
      return JSON.parse(block.meta) as Record<string, unknown>;
    } catch {
      return null;
    }
  },
}));