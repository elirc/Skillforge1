type QueryKey = unknown[];

interface CachedQuery {
  key: QueryKey;
  observers: number; // mounted components using this query right now
}

interface InvalidateFilter {
  queryKey: QueryKey;
  exact?: boolean;
}

// Model queryClient.invalidateQueries(filter) for every query in the cache.
// Matching:
// - default (partial): the filter key is compared element by element from the
//   start, so ["products"] matches ["products"], ["products", 5] and
//   ["products", "list", { page: 2 }]. An object element matches when every key
//   IN THE FILTER object is present and equal (extra keys in the query are fine).
// - exact: true: the keys must be equal, ignoring object key order.
// Then each matching query is marked stale, and:
// - active queries (observers > 0) refetch now  -> refetchNow
// - inactive ones just wait for their next use -> markedStale
// Non-matching queries -> untouched.
// Label each query with JSON.stringify(query.key) and keep cache order.
// Return { refetchNow, markedStale, untouched }.
export function planInvalidation(queries: CachedQuery[], filter: InvalidateFilter) {
  const refetchNow: string[] = [];
  const untouched: string[] = [];
  for (const query of queries) {
    const label = JSON.stringify(query.key);
    // Only compares the first element and ignores exact and observers.
    if (query.key[0] === filter.queryKey[0]) refetchNow.push(label);
    else untouched.push(label);
  }
  return { refetchNow, markedStale: [], untouched };
}
