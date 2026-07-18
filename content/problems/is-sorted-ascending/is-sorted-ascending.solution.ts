export function isSortedAscending(numbers: number[]): boolean {
  for (let index = 1; index < numbers.length; index += 1) {
    if (numbers[index] < numbers[index - 1]) return false;
  }
  return true;
}
