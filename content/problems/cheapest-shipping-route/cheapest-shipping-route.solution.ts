export type Lane = [from: string, to: string, cost: number];

export function cheapestRoute(
  lanes: Lane[],
  start: string,
  goal: string,
  closed: string[],
): { cost: number; path: string[] } | null {
  const shut = new Set(closed);
  if (shut.has(start) || shut.has(goal)) return null;

  const adjacency = new Map<string, [string, number][]>();
  for (const [from, to, cost] of lanes) {
    if (shut.has(from) || shut.has(to)) continue;
    const list = adjacency.get(from) ?? [];
    list.push([to, cost]);
    adjacency.set(from, list);
  }

  const dist = new Map<string, number>([[start, 0]]);
  const cameFrom = new Map<string, string>();
  const done = new Set<string>();

  while (true) {
    // Pick the cheapest node that is not finished yet.
    let current: string | null = null;
    for (const [node, cost] of dist) {
      if (!done.has(node) && (current === null || cost < dist.get(current)!)) current = node;
    }
    if (current === null) return null;
    if (current === goal) break;
    done.add(current);

    for (const [next, cost] of adjacency.get(current) ?? []) {
      const candidate = dist.get(current)! + cost;
      if (!done.has(next) && candidate < (dist.get(next) ?? Infinity)) {
        dist.set(next, candidate);
        cameFrom.set(next, current);
      }
    }
  }

  const path = [goal];
  while (path[0] !== start) path.unshift(cameFrom.get(path[0])!);
  return { cost: dist.get(goal)!, path };
}
