export function latestPerId<T extends { id: string; updatedAt: string }>(items: T[]): T[] {
  // A Map remembers insertion order, so the first time we see an id fixes its position.
  const latest = new Map<string, T>();
  for (const item of items) {
    const current = latest.get(item.id);
    if (current === undefined || item.updatedAt > current.updatedAt) {
      latest.set(item.id, item);
    }
  }
  return [...latest.values()];
}
