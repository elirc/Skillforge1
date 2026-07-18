export function anagramCheck(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return [...a].sort().join("") === [...b].sort().join("");
}
