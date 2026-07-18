export function countByLength(words: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const word of words) {
    const key = String(word.length);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
