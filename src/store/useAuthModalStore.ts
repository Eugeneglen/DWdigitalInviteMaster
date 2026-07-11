import { create } from 'zustand';

interface AuthModalStore {
  open: boolean;
  variant: 'default' | 'cms';
  openModal: (variant?: 'default' | 'cms') => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  open: false,
  variant: 'default',
  openModal: (variant = 'default') => set({ open: true, variant }),
  closeModal: () => set({ open: false }),
}));