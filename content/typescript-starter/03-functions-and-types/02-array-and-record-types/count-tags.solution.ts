export function countTags(tags: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const raw of tags) {
    const tag = raw.trim().toLowerCase();
    if (tag === "") continue;
    counts[tag] = (counts[tag] ?? 0) + 1;
  }
  return counts;
}
