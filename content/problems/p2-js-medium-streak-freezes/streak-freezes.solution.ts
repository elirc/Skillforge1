export function longestStreak(days: boolean[], freezes: number): { length: number; start: number } {
  let best = { length: 0, start: 0 };
  let left = 0;
  let misses = 0;
  for (let right = 0; right < days.length; right++) {
    if (!days[right]) misses++;
    while (misses > freezes) {
      if (!days[left]) misses--;
      left++;
    }
    const length = right - left + 1;
    if (length > best.length) best = { length, start: left };
  }
  return best;
}
