export type Entry = { value: string | number | boolean | null; ts: number; node: string };
export type Replica = Record<string, Entry>;

export function mergeReplicas(replicas: Replica[]) {
  const wins = (a: Entry, b: Entry) => a.ts > b.ts || (a.ts === b.ts && a.node > b.node);

  const winners: Record<string, Entry> = {};
  for (const replica of replicas) {
    for (const [field, entry] of Object.entries(replica)) {
      const current = winners[field];
      if (!current || wins(entry, current)) winners[field] = entry;
    }
  }

  const state: Record<string, Entry> = {};
  const view: Record<string, string | number | boolean> = {};
  for (const field of Object.keys(winners).sort()) {
    const entry = winners[field];
    state[field] = entry;
    if (entry.value !== null) view[field] = entry.value;
  }

  return { view, state };
}
