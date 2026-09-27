export type CacheOp = ["put", string, number] | ["get", string];

export function simulateLru(capacity: number, ops: CacheOp[]): (number | string | null)[] {
  const cache = new Map<string, number>();
  const results: (number | string | null)[] = [];

  for (const op of ops) {
    const key = op[1];
    if (op[0] === "get") {
      if (!cache.has(key)) {
        results.push(null);
        continue;
      }
      const value = cache.get(key)!;
      cache.delete(key);
      cache.set(key, value);
      results.push(value);
      continue;
    }

    let evicted: string | null = null;
    if (cache.has(key)) {
      cache.delete(key);
    } else if (cache.size >= capacity) {
      evicted = cache.keys().next().value!;
      cache.delete(evicted);
    }
    cache.set(key, op[2]);
    results.push(evicted);
  }

  return results;
}
