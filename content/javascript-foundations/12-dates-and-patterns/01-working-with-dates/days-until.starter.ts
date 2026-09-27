// Both inputs are calendar dates written as "YYYY-MM-DD".
// Return how many whole days `to` is after `from` (negative if it is before),
// or null if either date is not valid.
export function daysUntil(from: string, to: string): number | null {
  // Hint: Date.parse("2026-03-01") gives milliseconds since 1970 (UTC midnight).
  // Subtract, then divide by the number of milliseconds in one day.
  // Careful: "2026-02-31" parses as March 3, so check that the date round-trips.
  return 0;
}
