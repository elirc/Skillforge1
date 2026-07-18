export function countVowels(text: string): number {
  let count = 0;
  for (const char of text.toLowerCase()) {
    if ("aeiou".includes(char)) count += 1;
  }
  return count;
}
