export function longestIncreasingRun(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  let best = 1;
  let current = 1;
  for (let index = 1; index < numbers.length; index += 1) {
    current = numbers[index] > numbers[index - 1] ? current + 1 : 1;
    if (current > best) best = current;
  }
  return best;
}
