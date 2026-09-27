interface Operation {
  tx: string;
  op: "read" | "write" | "commit" | "rollback";
  key?: string;
}

// Which anomalies does this interleaving (a schedule) contain?
// "dirty-read" | "lost-update" | "non-repeatable-read", distinct and sorted.
export function detectAnomalies(schedule: Operation[]): string[] {
  const found = new Set<string>();

  // How each transaction ends (for lost updates, both sides must commit).
  const committed = new Set(schedule.filter((s) => s.op === "commit").map((s) => s.tx));

  const ended = new Set<string>();
  const indexed = schedule.map((operation, index) => ({ ...operation, index }));

  for (const current of indexed) {
    if (current.op === "commit" || current.op === "rollback") {
      ended.add(current.tx);
      continue;
    }
    const before = indexed.slice(0, current.index);

    if (current.op === "read") {
      // Dirty read: another transaction wrote this key and has not ended yet.
      if (before.some((p) => p.op === "write" && p.key === current.key && p.tx !== current.tx && !ended.has(p.tx))) {
        found.add("dirty-read");
      }

      // Non-repeatable read: since this tx last read the key, another tx wrote it and committed.
      const previousReads = before.filter((p) => p.op === "read" && p.tx === current.tx && p.key === current.key);
      if (previousReads.length > 0) {
        const lastRead = previousReads[previousReads.length - 1].index;
        const otherCommitsSince = indexed.slice(lastRead + 1, current.index).filter((p) => p.op === "commit" && p.tx !== current.tx);
        for (const commit of otherCommitsSince) {
          if (before.some((p) => p.tx === commit.tx && p.op === "write" && p.key === current.key)) {
            found.add("non-repeatable-read");
          }
        }
      }
    }

    if (current.op === "write" && committed.has(current.tx)) {
      // Lost update: since this tx last read the key, another committed tx wrote it, and now this tx overwrites it.
      const reads = before.filter((p) => p.op === "read" && p.tx === current.tx && p.key === current.key);
      if (reads.length > 0) {
        const lastRead = reads[reads.length - 1].index;
        const interveningWrite = indexed
          .slice(lastRead + 1, current.index)
          .some((p) => p.op === "write" && p.key === current.key && p.tx !== current.tx && committed.has(p.tx));
        if (interveningWrite) found.add("lost-update");
      }
    }
  }

  return [...found].sort();
}
