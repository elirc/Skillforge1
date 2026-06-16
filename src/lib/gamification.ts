export type ActivityKind = "lesson" | "review" | "exercise";

export interface ProgressSnapshot {
  xp: number;
  level: number;
  streakCurrent: number;
  streakLongest: number;
  lastActiveDate: Date | null;
  streakFreezes: number;
}

const xpByActivity: Record<ActivityKind, number> = {
  lesson: 35,
  review: 8,
  exercise: 12,
};

export function xpForActivity(kind: ActivityKind, correct = true) {
  if (kind === "review" && !correct) {
    return 2;
  }
  return xpByActivity[kind];
}

export function levelForXp(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(xp / 75)) + 1);
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(a: Date, b: Date) {
  return Math.round((startOfLocalDay(b).getTime() - startOfLocalDay(a).getTime()) / 86_400_000);
}

export function applyActivityProgress(
  progress: ProgressSnapshot,
  kind: ActivityKind,
  now = new Date(),
  correct = true,
): ProgressSnapshot {
  const earned = xpForActivity(kind, correct);
  const xp = progress.xp + earned;
  const gap = progress.lastActiveDate ? daysBetween(progress.lastActiveDate, now) : null;
  let streakCurrent = progress.streakCurrent;
  let streakFreezes = progress.streakFreezes;

  if (gap === null) {
    streakCurrent = 1;
  } else if (gap === 0) {
    streakCurrent = progress.streakCurrent || 1;
  } else if (gap === 1) {
    streakCurrent += 1;
  } else if (streakFreezes > 0) {
    streakFreezes -= 1;
    streakCurrent += 1;
  } else {
    streakCurrent = 1;
  }

  return {
    xp,
    level: levelForXp(xp),
    streakCurrent,
    streakLongest: Math.max(progress.streakLongest, streakCurrent),
    lastActiveDate: now,
    streakFreezes,
  };
}

export function achievementKeysForProgress(progress: ProgressSnapshot, reviewReps: number, completedLessons: number) {
  const keys: string[] = [];
  if (progress.xp >= 50) keys.push("first-forge");
  if (progress.streakCurrent >= 3) keys.push("three-day-heat");
  if (reviewReps >= 5) keys.push("recall-smith");
  if (completedLessons >= 3) keys.push("module-maker");
  return keys;
}
