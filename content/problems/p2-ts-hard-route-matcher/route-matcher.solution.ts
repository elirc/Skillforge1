export type RouteMatch = { route: string; params: Record<string, string> };

const segments = (value: string) => value.split("/").filter((segment) => segment !== "");

function decode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function tryMatch(pattern: string[], parts: string[]): { rank: number[]; params: Record<string, string> } | null {
  const rank: number[] = [];
  const params: Record<string, string> = {};
  for (let i = 0; i < pattern.length; i++) {
    const segment = pattern[i];
    if (segment === "*") {
      if (parts.length <= i) return null;
      params["*"] = parts.slice(i).map(decode).join("/");
      rank.push(2);
      return { rank, params };
    }
    if (i >= parts.length) return null;
    if (segment.startsWith(":")) {
      params[segment.slice(1)] = decode(parts[i]);
      rank.push(1);
    } else if (segment === parts[i]) {
      rank.push(0);
    } else {
      return null;
    }
  }
  return pattern.length === parts.length ? { rank, params } : null;
}

function compareRanks(a: number[], b: number[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

export function matchRoute(routes: string[], path: string): RouteMatch | null {
  const parts = segments(path);
  let best: { route: string; rank: number[]; params: Record<string, string> } | null = null;
  for (const route of routes) {
    const match = tryMatch(segments(route), parts);
    if (match && (best === null || compareRanks(match.rank, best.rank) < 0)) best = { route, ...match };
  }
  return best && { route: best.route, params: best.params };
}
