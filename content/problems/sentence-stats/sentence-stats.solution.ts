export function sentenceStats(sentence: string): { words: number; characters: number } {
  const trimmed = sentence.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  const characters = sentence.replace(/\s/g, "").length;
  return { words, characters };
}
