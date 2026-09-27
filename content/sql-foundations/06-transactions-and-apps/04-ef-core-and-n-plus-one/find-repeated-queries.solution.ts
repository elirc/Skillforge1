// Group a request's SQL log by statement shape (literals replaced by ?)
// and report shapes executed at least `threshold` times: a likely N+1.
export function findRepeatedQueries(log: string[], threshold: number): { sql: string; count: number }[] {
  const normalize = (sql: string) =>
    sql
      .replace(/'(?:[^']|'')*'/g, "?") // string literals, with '' as an escaped quote
      .replace(/\b\d+(\.\d+)?\b/g, "?") // numeric literals (not the digits inside names like @p0 or t1)
      .replace(/\s+/g, " ")
      .trim();

  const counts = new Map<string, number>();
  for (const statement of log) {
    const shape = normalize(statement);
    counts.set(shape, (counts.get(shape) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= threshold)
    .map(([sql, count]) => ({ sql, count }))
    .sort((a, b) => b.count - a.count || (a.sql < b.sql ? -1 : a.sql > b.sql ? 1 : 0));
}
