interface Operation {
  tx: string;
  op: "read" | "write" | "commit" | "rollback";
  key?: string;
}

// Which anomalies does this interleaving (a schedule) contain?
// "dirty-read" | "lost-update" | "non-repeatable-read", distinct and sorted.
export function detectAnomalies(schedule: Operation[]) {
  const found: string[] = [];
  // track open transactions, who wrote what, and who read what
  return found;
}
