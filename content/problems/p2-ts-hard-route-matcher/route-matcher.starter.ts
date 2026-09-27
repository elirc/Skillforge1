export type RouteMatch = { route: string; params: Record<string, string> };

export function matchRoute(routes: string[], path: string) {
  // For each pattern, walk the segments: static = 0, :param = 1, * = 2.
  // Keep the matching pattern with the lexicographically smallest rank list (first wins ties).
}
