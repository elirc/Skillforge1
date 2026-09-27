export type Entry = { value: string | number | boolean | null; ts: number; node: string };
export type Replica = Record<string, Entry>;

export function mergeReplicas(replicas: Replica[]) {
  // Per field, keep the entry with the highest ts (ties: greater node).
  // Return { view, state } with alphabetically sorted keys.
}
