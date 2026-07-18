export function firstUnique(text: string): string {
  const counts = new Map<string, number>();
  for (const character of text) {
    counts.set(character, (counts.get(character) ?? 0) + 1);
  }
  for (const character of text) {
    if (counts.get(character) === 1) return character;
  }
  return "";
}
