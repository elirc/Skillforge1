import { create } from "zustand";

interface ReviewUiState {
  index: number;
  next: () => void;
  reset: () => void;
}

export const useReviewStore = create<ReviewUiState>((set) => ({
  index: 0,
  next: () => set((state) => ({ index: state.index + 1 })),
  reset: () => set({ index: 0 }),
}));
