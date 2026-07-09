'use client';

import { create } from 'zustand';
import type { WorkspacePage, WorkspaceSection, WorkspaceBlock } from '@/types/content';

interface WorkspaceState {
  /** All pages for the current account */
  pages: WorkspacePage[];
  /** Currently selected page slug */
  selectedPageSlug: string | null;
  /** Currently selected section ID */
  selectedSectionId: string | null;
  /** Whether pages are loading */
  isLoading: boolean;
  /** Error from last operation */
  error: string | null;
  /** Whether unsaved changes exist */
  isDirty: boolean;
  /** Track which blocks have been modified locally */
  dirtyBlockIds: Set<string>;

  // ─── Actions ─────────────────────────────────────────────
  loadPages: () => Promise<void>;
  selectPage: (slug: string) => void;
  selectSection: (id: string | null) => void;
  updateBlockValue: (blockId: string, value: string) => void;
  savePageBlocks: (pageSlug: string) => Promise<void>;
  reorderSections: (pageSlug: string, sections: { id: string; sortOrder: number }[]) => Promise<void>;
  reorderBlocks: (sectionId: string, blocks: { id: string; sortOrder: number }[]) => Promise<void>;
  addSection: (pageSlug: string, slug: string, title: string) => Promise<WorkspaceSection | null>;
  deleteSection: (sectionId: string) => Promise<void>;
  addBlock: (sectionId: string, key: string, type: string) => Promise<WorkspaceBlock | null>;
  deleteBlock: (blockId: string) => Promise<void>;
  clearDirty: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  pages: [],
  selectedPageSlug: null,
  selectedSectionId: null,
  isLoading: false,
  error: null,
  isDirty: false,
  dirtyBlockIds: new Set(),

  loadPages: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/workspace/content');
      if (!res.ok) throw new Error(`Failed to load pages: ${res.status}`);
      const data = await res.json();

      set({
        pages: data.pages as WorkspacePage[],
        isLoading: false,
        selectedPageSlug: (data.pages as WorkspacePage[])[0]?.slug ?? null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load pages',
      });
    }
  },

  selectPage: (slug) => {
    const state = get();
    set({
      selectedPageSlug: slug,
      selectedSectionId: null,
    });
  },

  selectSection: (id) => {
    set({ selectedSectionId: id });
  },

  updateBlockValue: (blockId, value) => {
    set((state) => {
      const newPages = state.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) => ({
          ...section,
          blocks: section.blocks.map((block) =>
            block.id === blockId ? { ...block, value } : block
          ),
        })),
      }));

      const newDirty = new Set(state.dirtyBlockIds);
      newDirty.add(blockId);

      return { pages: newPages, isDirty: true, dirtyBlockIds: newDirty };
    });
  },

  savePageBlocks: async (pageSlug) => {
    const state = get();
    const page = state.pages.find((p) => p.slug === pageSlug);
    if (!page) return;

    // Collect all block IDs and their current values
    const blocks: { id: string; value: string }[] = [];
    for (const section of page.sections) {
      for (const block of section.blocks) {
        blocks.push({ id: block.id, value: block.value });
      }
    }

    try {
      const res = await fetch(`/api/workspace/content/${pageSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);

      set({
        isDirty: false,
        dirtyBlockIds: new Set(),
        error: null,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Save failed' });
    }
  },

  reorderSections: async (pageSlug, sections) => {
    try {
      const res = await fetch('/api/workspace/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sections', pageSlug, order: sections }),
      });

      if (!res.ok) throw new Error(`Reorder failed: ${res.status}`);

      // Update local state optimistically
      set((state) => {
        const orderMap = new Map(sections.map((s) => [s.id, s.sortOrder]));
        const newPages = state.pages.map((page) =>
          page.slug === pageSlug
            ? {
                ...page,
                sections: [...page.sections]
                  .map((s) => ({ ...s, sortOrder: orderMap.get(s.id) ?? s.sortOrder }))
                  .sort((a, b) => a.sortOrder - b.sortOrder),
              }
            : page
        );
        return { pages: newPages, isDirty: true };
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Reorder failed' });
    }
  },

  reorderBlocks: async (sectionId, blocks) => {
    try {
      const res = await fetch('/api/workspace/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'blocks', sectionId, order: blocks }),
      });

      if (!res.ok) throw new Error(`Reorder failed: ${res.status}`);

      // Update local state
      set((state) => {
        const orderMap = new Map(blocks.map((b) => [b.id, b.sortOrder]));
        const newPages = state.pages.map((page) => ({
          ...page,
          sections: page.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  blocks: [...section.blocks]
                    .map((b) => ({ ...b, sortOrder: orderMap.get(b.id) ?? b.sortOrder }))
                    .sort((a, b) => a.sortOrder - b.sortOrder),
                }
              : section
          ),
        }));
        return { pages: newPages, isDirty: true };
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Reorder failed' });
    }
  },

  addSection: async (pageSlug, slug, title) => {
    try {
      const res = await fetch('/api/workspace/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSlug, slug, title }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create section');
      }

      const { section } = await res.json();

      // Add to local state
      set((state) => ({
        pages: state.pages.map((page) =>
          page.slug === pageSlug
            ? { ...page, sections: [...page.sections, { ...section, blocks: [] }] }
            : page
        ),
        isDirty: true,
      }));

      return section;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add section' });
      return null;
    }
  },

  deleteSection: async (sectionId) => {
    try {
      const res = await fetch(`/api/workspace/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

      set((state) => ({
        pages: state.pages.map((page) => ({
          ...page,
          sections: page.sections.filter((s) => s.id !== sectionId),
        })),
        selectedSectionId: state.selectedSectionId === sectionId ? null : state.selectedSectionId,
        isDirty: true,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Delete failed' });
    }
  },

  addBlock: async (sectionId, key, type) => {
    try {
      const res = await fetch('/api/workspace/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, key, type }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create block');
      }

      const { block } = await res.json();

      set((state) => ({
        pages: state.pages.map((page) => ({
          ...page,
          sections: page.sections.map((section) =>
            section.id === sectionId
              ? { ...section, blocks: [...section.blocks, block] }
              : section
          ),
        })),
        isDirty: true,
      }));

      return block;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add block' });
      return null;
    }
  },

  deleteBlock: async (blockId) => {
    try {
      const res = await fetch(`/api/workspace/blocks/${blockId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

      set((state) => {
        const newDirty = new Set(state.dirtyBlockIds);
        newDirty.delete(blockId);

        return {
          pages: state.pages.map((page) => ({
            ...page,
            sections: page.sections.map((section) => ({
              ...section,
              blocks: section.blocks.filter((b) => b.id !== blockId),
            })),
          })),
          dirtyBlockIds: newDirty,
          isDirty: newDirty.size > 0,
        };
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Delete failed' });
    }
  },

  clearDirty: () => set({ isDirty: false, dirtyBlockIds: new Set() }),
}));