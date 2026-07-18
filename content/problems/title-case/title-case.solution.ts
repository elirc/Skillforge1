export function titleCase(sentence: string): string {
  return sentence
    .split(" ")
    .map((word) => (word === "" ? word : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}
