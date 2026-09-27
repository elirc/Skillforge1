export type Interval = [start: number, end: number];

export function commonFreeSlots(calendars: Interval[][], workday: Interval, duration: number): Interval[] {
  const [dayStart, dayEnd] = workday;

  const busy = calendars
    .flat()
    .map(([start, end]): Interval => [Math.max(start, dayStart), Math.min(end, dayEnd)])
    .filter(([start, end]) => start < end)
    .sort((a, b) => a[0] - b[0]);

  const free: Interval[] = [];
  let cursor = dayStart;
  for (const [start, end] of busy) {
    if (start > cursor) free.push([cursor, start]);
    cursor = Math.max(cursor, end);
  }
  if (cursor < dayEnd) free.push([cursor, dayEnd]);

  return free.filter(([start, end]) => end - start >= duration);
}
