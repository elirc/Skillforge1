export function findMinMax(numbers: number[]): { min: number | null; max: number | null } {
  if (numbers.length === 0) return { min: null, max: null };
  let min = numbers[0];
  let max = numbers[0];
  for (const number of numbers) {
    if (number < min) min = number;
    if (number > max) max = number;
  }
  return { min, max };
}
