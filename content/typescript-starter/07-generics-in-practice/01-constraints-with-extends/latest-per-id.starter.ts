// T extends { id: string; updatedAt: string } means: any object type, as long
// as it has at least these two fields. Inside the function you may read
// item.id and item.updatedAt; callers get back their own full type T.
export function latestPerId<T extends { id: string; updatedAt: string }>(items: T[]) {
  // A sync may deliver several versions of the same record.
  // 1. Keep one item per id: the one with the greatest updatedAt
  //    (ISO-8601 strings compare correctly as plain strings).
  // 2. On an exact tie, keep the version that appeared first.
  // 3. Output order: the order in which each id first appeared.
  // Return the whole item (all its fields), not just id and updatedAt.
}
