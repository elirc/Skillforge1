export function countStatuses(statuses: string[]): Record<string, number> {
  const counts = new Map<string, number>();
  for (const status of statuses) {
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return Object.fromEntries(counts);
}
