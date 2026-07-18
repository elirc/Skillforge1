export function longestWord(sentence: string): string {
  let best = "";
  for (const raw of sentence.split(/\s+/)) {
    const word = raw.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "");
    if (word.length > best.length) best = word;
  }
  return best;
}
