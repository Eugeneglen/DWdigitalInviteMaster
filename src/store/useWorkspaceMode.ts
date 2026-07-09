'use client';

import { create } from 'zustand';

interface WorkspaceModeState {
  /** Whether the CMS workspace editor is visible (replaces guest view) */
  isWorkspaceMode: boolean;
  /** Toggle workspace mode on/off */
  toggleWorkspace: () => void;
  /** Set workspace mode explicitly */
  setWorkspaceMode: (enabled: boolean) => void;
}

export const useWorkspaceMode = create<WorkspaceModeState>((set) => ({
  isWorkspaceMode: false,
  toggleWorkspace: () => set((s) => ({ isWorkspaceMode: !s.isWorkspaceMode })),
  setWorkspaceMode: (enabled) => set({ isWorkspaceMode: enabled }),
}));