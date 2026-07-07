import { create } from 'zustand';

interface AuthModalStore {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));