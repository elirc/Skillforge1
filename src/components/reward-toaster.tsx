"use client";

import { useEffect } from "react";
import { useRewardStore, type RewardToast } from "@/store/reward-store";

const toneStyles: Record<RewardToast["tone"], string> = {
  xp: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  level: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
  quest: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100",
  achievement: "border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100",
  streak: "border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
};

/** Level-ups and achievements linger; a plain XP tick gets out of the way. */
const toneDuration: Record<RewardToast["tone"], number> = {
  xp: 2200,
  level: 5000,
  quest: 4000,
  achievement: 5000,
  streak: 4000,
};

export function RewardToaster() {
  const toasts = useRewardStore((state) => state.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:items-end">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastCard({ toast }: { toast: RewardToast }) {
  const dismiss = useRewardStore((state) => state.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), toneDuration[toast.tone]);
    return () => clearTimeout(timer);
  }, [dismiss, toast.id, toast.tone]);

  return (
    <div
      role="status"
      className={`pointer-events-auto w-full max-w-sm animate-[reward-in_220ms_ease-out] rounded-lg border px-4 py-3 shadow-lg ${toneStyles[toast.tone]}`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-xl leading-none">
          {toast.icon ?? "⚡"}
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{toast.title}</p>
          {toast.detail ? <p className="truncate text-sm opacity-80">{toast.detail}</p> : null}
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => dismiss(toast.id)}
          className="ml-auto text-sm opacity-50 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
