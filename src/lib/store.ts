import { create } from 'zustand';

interface NavStore {
  currentPage: string;
  drawerOpen: boolean;
  setPage: (page: string) => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useStore = create<NavStore>((set) => ({
  currentPage: 'home',
  drawerOpen: false,
  setPage: (page) => {
    set({ currentPage: page, drawerOpen: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  setDrawerOpen: (open) => set({ drawerOpen: open }),
}));