import { create } from 'zustand';

export type CMSPage = 'dashboard' | 'weddings' | 'users' | 'templates' | 'analytics' | 'settings' | 'audit';

/** Auth user context passed to CMS page components */
export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  tenantRole?: string;
  token?: string;
}

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