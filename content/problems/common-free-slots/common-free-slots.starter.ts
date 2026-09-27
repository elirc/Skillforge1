export type Interval = [start: number, end: number];

export function commonFreeSlots(calendars: Interval[][], workday: Interval, duration: number) {
  // Flatten every busy block, clip it to the workday, sort, and sweep for gaps.
}
