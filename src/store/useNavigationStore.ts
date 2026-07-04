import { create } from 'zustand';

export type Section =
  | 'home'
  | 'schedule'
  | 'rsvp'
  | 'getting-there'
  | 'story'
  | 'wishes'
  | 'qa'
  | 'moments';

interface NavigationState {
  currentSection: Section;
  drawerOpen: boolean;
  setSection: (section: Section) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentSection: 'home',
  drawerOpen: false,
  setSection: (section) => {
    set({ currentSection: section, drawerOpen: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
}));