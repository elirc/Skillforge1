export function mergeIntervals(intervals: number[][]): number[][] {
  const sorted = intervals.map((interval) => [...interval]).sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [];

  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (!last || interval[0] > last[1]) {
      merged.push(interval);
    } else {
      last[1] = Math.max(last[1], interval[1]);
    }
  }

  return merged;
}
