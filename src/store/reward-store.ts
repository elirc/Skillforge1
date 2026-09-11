import { create } from "zustand";
import type { AwardSummary } from "@/server/gamification";

export interface RewardToast {
  id: number;
  tone: "xp" | "level" | "quest" | "achievement" | "streak";
  title: string;
  detail?: string;
  icon?: string;
}

interface RewardState {
  toasts: RewardToast[];
  push: (toast: Omit<RewardToast, "id">) => void;
  dismiss: (id: number) => void;
  celebrate: (summary: AwardSummary | null | undefined) => void;
}

let nextId = 1;

/**
 * Fans a single AwardSummary out into the stack of toasts the learner sees:
 * XP first, then the bigger the payoff the later it lands.
 */
export const useRewardStore = create<RewardState>((set, get) => ({
  toasts: [],
  push: (toast) => set((state) => ({ toasts: [...state.toasts, { ...toast, id: nextId++ }] })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  celebrate: (summary) => {
    if (!summary) return;
    const { push } = get();

    if (summary.xpEarned > 0) {
      push({
        tone: "xp",
        title: `+${summary.xpEarned} XP`,
        detail: `${summary.dailyXp} / ${summary.dailyXpGoal} XP today`,
        icon: "⚡",
      });
    }

    if (summary.freezeUsed) {
      push({ tone: "streak", title: "Streak freeze used", detail: "You missed a day; the streak survived.", icon: "🧊" });
    }

    for (const quest of summary.questsCompleted) {
      push({ tone: "quest", title: "Quest complete", detail: `${quest.title} · +${quest.xpReward} XP`, icon: "🎯" });
    }

    for (const achievement of summary.achievements) {
      push({
        tone: "achievement",
        title: achievement.name,
        detail: `${achievement.description} · +${achievement.xpReward} XP`,
        icon: achievement.icon,
      });
    }

    if (summary.leveledUp) {
      push({ tone: "level", title: `Level ${summary.level}`, detail: summary.rank, icon: "🏅" });
    }
  },
}));
