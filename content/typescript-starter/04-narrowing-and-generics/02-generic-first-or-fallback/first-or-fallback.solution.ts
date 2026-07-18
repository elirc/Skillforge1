export function firstOrFallback<T>(items: T[], fallback: T): T {
  return items.length > 0 ? items[0] : fallback;
}
