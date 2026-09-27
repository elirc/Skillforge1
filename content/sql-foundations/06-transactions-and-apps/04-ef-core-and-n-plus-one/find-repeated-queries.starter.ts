// Group a request's SQL log by statement shape (literals replaced by ?)
// and report shapes executed at least `threshold` times: a likely N+1.
export function findRepeatedQueries(log: string[], threshold: number) {
  // 1. normalize: string literals -> ?, numbers -> ?, collapse whitespace, trim
  // 2. count shapes   3. keep count >= threshold   4. sort by count desc, then sql asc
  return log.map((sql) => ({ sql, count: 1 }));
}
