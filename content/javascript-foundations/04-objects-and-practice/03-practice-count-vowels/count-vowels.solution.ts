export function countVowels(word: string): number {
  return [...word].filter((character) => "aeiou".includes(character)).length;
}
