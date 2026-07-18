export function countWords(sentence: string): number {
  const trimmed = sentence.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}
