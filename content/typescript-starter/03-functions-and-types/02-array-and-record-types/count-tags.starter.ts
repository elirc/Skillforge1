// The return type Record<string, number> says: an object whose keys are
// strings and whose values are numbers. Start from an empty object typed
// that way, e.g. `const counts: Record<string, number> = {};`.
export function countTags(tags: string[]) {
  // 1. Normalize each tag: trim whitespace and lowercase it.
  // 2. Skip tags that are empty after trimming.
  // 3. Count how many times each normalized tag appears.
}
