export function suggest(input: string, commands: string[]) {
  // 1. Normalise (trim, lowercase); exact match -> [].
  // 2. Levenshtein distance to every command; keep distance <= max(1, floor(len / 3)).
  // 3. Sort by distance then name; return up to 3 in original casing.
}
