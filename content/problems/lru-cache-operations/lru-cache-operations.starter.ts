export type CacheOp = ["put", string, number] | ["get", string];

export function simulateLru(capacity: number, ops: CacheOp[]) {
  // A Map keeps insertion order: delete + set moves a key to the "most recent" end.
}
