export function auditLines(before: Record<string, unknown>, after: Record<string, unknown>, ignore: string[]) {
  // Key order: before's keys, then keys only in after. Skip ignored keys.
  // set to / cleared (was) / array added+removed / OLD -> NEW, all via JSON.stringify.
}
