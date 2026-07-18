export function findMissingLetters(text: string): string {
  const seen = new Set(text.toLowerCase());
  let missing = "";
  for (const letter of "abcdefghijklmnopqrstuvwxyz") {
    if (!seen.has(letter)) missing += letter;
  }
  return missing;
}
