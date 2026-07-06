import { create } from 'zustand';

export type CMSPage = 'dashboard' | 'weddings' | 'users' | 'templates' | 'analytics' | 'settings';

interface CMSState {
  currentPage: CMSPage;
  selectedWeddingId: string | null;
  setPage: (page: CMSPage) => void;
  selectWedding: (id: string | null) => void;
}

export const useCMSStore = create<CMSState>((set) => ({
  currentPage: 'dashboard',
  selectedWeddingId: null,
  setPage: (page) => set({ currentPage: page }),
  selectWedding: (id) => set({ selectedWeddingId: id }),
}));