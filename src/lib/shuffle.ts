/** Deterministic Fisher–Yates: stable on re-render and identical during SSR/hydration. */
export function shuffledChoices(choices: readonly string[], seed: string): string[] {
  let state = 2166136261;
  for (const character of seed) state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  const result = [...choices];
  for (let i = result.length - 1; i > 0; i--) {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
