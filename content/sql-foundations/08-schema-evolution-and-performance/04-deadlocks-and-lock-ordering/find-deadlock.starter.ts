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
  // 1. Map each resource to the tx holding it.
  // 2. Build tx -> tx edges from the waiting list.
  // 3. A tx is deadlocked if following edges from it leads back to itself.
  // Return those tx names sorted. Waiting alone is NOT a deadlock (that is just blocking).
  return waiting.map((w) => w.tx).sort();
}
