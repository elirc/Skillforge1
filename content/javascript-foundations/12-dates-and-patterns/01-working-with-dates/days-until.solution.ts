// Both inputs are calendar dates written as "YYYY-MM-DD".
// Return how many whole days `to` is after `from` (negative if it is before),
// or null if either date is not valid.
export function daysUntil(from: string, to: string): number | null {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(from) || !pattern.test(to)) return null;

  // Date.parse treats a bare "YYYY-MM-DD" as midnight UTC, so no time zone
  // or daylight-saving shift can sneak in.
  const start = Date.parse(from);
  const end = Date.parse(to);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  // JavaScript quietly rolls "2026-02-31" over to March 3, so check the date survives a round trip.
  if (new Date(start).toISOString().slice(0, 10) !== from) return null;
  if (new Date(end).toISOString().slice(0, 10) !== to) return null;

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end - start) / msPerDay);
}
