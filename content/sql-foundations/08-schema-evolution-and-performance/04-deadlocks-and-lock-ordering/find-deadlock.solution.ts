interface HeldLock {
  resource: string;
  heldBy: string;
}

interface WaitingRequest {
  tx: string;
  resource: string;
}

// The database's deadlock monitor builds a wait-for graph:
//   tx A -> tx B   when A waits for a resource that B holds.
// A cycle in that graph is a deadlock; the engine kills one victim (SQL Server error 1205).
// Each transaction waits for at most one resource at a time.
export function findDeadlock(held: HeldLock[], waiting: WaitingRequest[]): string[] {
  const holderOf = new Map(held.map((h) => [h.resource, h.heldBy]));
  const waitsFor = new Map<string, string>();
  for (const w of waiting) {
    const holder = holderOf.get(w.resource);
    if (holder !== undefined && holder !== w.tx) waitsFor.set(w.tx, holder);
  }

  const inCycle = new Set<string>();
  for (const start of waitsFor.keys()) {
    // Follow the single outgoing edge until we come back to start or run out.
    const visited = new Set<string>();
    let current = waitsFor.get(start);
    while (current !== undefined && !visited.has(current)) {
      if (current === start) {
        inCycle.add(start);
        break;
      }
      visited.add(current);
      current = waitsFor.get(current);
    }
  }

  return [...inCycle].sort();
}
