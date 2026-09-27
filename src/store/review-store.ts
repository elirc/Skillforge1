import { create } from "zustand";

/**
 * Position within the current review session. The index belongs to one queue,
 * identified by `queueKey` (the session's card ids). When a different queue is
 * shown (a new tag filter, or a fresh visit with different due cards) the
 * stored index no longer applies and reads as 0, so a session never starts
 * mid-queue.
 */
interface ReviewUiState {
  queueKey: string;
  index: number;
  next: (queueKey: string) => void;
  reset: (queueKey: string) => void;
}

export const useReviewStore = create<ReviewUiState>((set) => ({
  queueKey: "",
  index: 0,
  next: (queueKey) =>
    set((state) => ({ queueKey, index: (state.queueKey === queueKey ? state.index : 0) + 1 })),
  reset: (queueKey) => set({ queueKey, index: 0 }),
}));

/** The index for `queueKey`, or 0 when the store is tracking a different queue. */
export function selectReviewIndex(queueKey: string) {
  return (state: Pick<ReviewUiState, "queueKey" | "index">) => (state.queueKey === queueKey ? state.index : 0);
}
