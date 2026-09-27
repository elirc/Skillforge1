export function longestStreak(days: boolean[]): number {
  let current = 0;
  let best = 0;
  for (const practiced of days) {
    current = practiced ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}
