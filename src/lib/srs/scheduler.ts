export type RecallScore = "again" | "hard" | "good" | "easy";
export type ReviewLifecycle = "new" | "learning" | "review" | "relearning";

export interface SrsReviewState {
  dueAt: Date;
  stability: number;
  difficulty: number;
  interval: number;
  lapses: number;
  reps: number;
  lastReviewedAt: Date | null;
  state: ReviewLifecycle;
}

const scoreWeight: Record<RecallScore, number> = {
  again: 0,
  hard: 1,
  good: 2,
  easy: 3,
};

function addDays(now: Date, days: number) {
  const next = new Date(now);
  next.setDate(next.getDate() + days);
  return next;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function scheduleReview(
  current: SrsReviewState,
  recallScore: RecallScore,
  now = new Date(),
): SrsReviewState {
  const grade = scoreWeight[recallScore];
  const reps = current.reps + 1;
  const failed = recallScore === "again";
  const lapses = current.lapses + (failed ? 1 : 0);
  const difficulty = clamp(current.difficulty + (grade < 2 ? 0.8 : grade === 3 ? -0.45 : -0.15), 1, 10);

  const baseStability = current.stability > 0 ? current.stability : 1;
  const stability = failed
    ? Math.max(0.4, baseStability * 0.45)
    : clamp(baseStability * (1 + grade * 0.55) + (10 - difficulty) * 0.12, 1, 3650);

  const interval =
    recallScore === "again"
      ? 0
      : recallScore === "hard"
        ? Math.max(1, Math.round(stability * 0.7))
        : recallScore === "good"
          ? Math.max(1, Math.round(stability))
          : Math.max(2, Math.round(stability * 1.55));

  return {
    dueAt: failed ? new Date(now.getTime() + 10 * 60 * 1000) : addDays(now, interval),
    stability,
    difficulty,
    interval,
    lapses,
    reps,
    lastReviewedAt: now,
    state: failed ? "relearning" : interval <= 1 ? "learning" : "review",
  };
}

export function conceptStrength(state: Pick<SrsReviewState, "dueAt" | "stability">, now = new Date()) {
  const millisUntilDue = state.dueAt.getTime() - now.getTime();
  const daysUntilDue = millisUntilDue / 86_400_000;
  const normalized = clamp((daysUntilDue + state.stability) / Math.max(1, state.stability * 2), 0, 1);
  return Math.round(normalized * 100);
}
