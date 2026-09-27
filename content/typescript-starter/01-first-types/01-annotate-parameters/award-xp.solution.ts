export function awardXp(baseXp: number, streakDays: number, isReview: boolean): number {
  const bonus = Math.min(streakDays, 10) * 5;
  const total = baseXp + bonus;
  const awarded = isReview ? Math.floor(total / 2) : total;
  return Math.max(0, awarded);
}
