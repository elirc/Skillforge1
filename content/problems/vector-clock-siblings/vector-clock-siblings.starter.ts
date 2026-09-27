export type Version = { id: string; clock: Record<string, number> };

export function resolveSiblings(versions: Version[]) {
  // Keep versions that nothing else happened after (dedupe equal clocks),
  // and merge every clock with a pointwise max.
}
