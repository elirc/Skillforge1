type QueryKey = unknown[];

interface CachedQuery {
  key: QueryKey;
  observers: number; // mounted components using this query right now
}

interface InvalidateFilter {
  queryKey: QueryKey;
  exact?: boolean;
}

interface Plan {
  refetchNow: string[];
  markedStale: string[];
  untouched: string[];
}

// Same rule as TanStack Query's partialMatchKey: every key in the filter must match.
// Arrays are objects keyed by index, so a filter key matches any longer key it is a prefix of.
function partialMatch(value: unknown, filter: unknown): boolean {
  if (value === filter) return true;
  if (typeof value !== typeof filter) return false;
  if (value && filter && typeof value === "object" && typeof filter === "object") {
    const target = value as Record<string, unknown>;
    const wanted = filter as Record<string, unknown>;
    return Object.keys(wanted).every((key) => partialMatch(target[key], wanted[key]));
  }
  return false;
}

// Object key order does not matter in a query key, so hash with sorted keys.
function hashKey(key: QueryKey): string {
  return JSON.stringify(key, (_, value: unknown) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const record = value as Record<string, unknown>;
      return Object.fromEntries(Object.keys(record).sort().map((k) => [k, record[k]]));
    }
    return value;
  });
}

export function planInvalidation(queries: CachedQuery[], filter: InvalidateFilter): Plan {
  const plan: Plan = { refetchNow: [], markedStale: [], untouched: [] };
  for (const query of queries) {
    const label = JSON.stringify(query.key);
    const matches = filter.exact
      ? hashKey(query.key) === hashKey(filter.queryKey)
      : partialMatch(query.key, filter.queryKey);
    if (!matches) plan.untouched.push(label);
    else if (query.observers > 0) plan.refetchNow.push(label);
    else plan.markedStale.push(label);
  }
  return plan;
}
