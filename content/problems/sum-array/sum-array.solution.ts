export function sumArray(numbers: number[]): number {
  return numbers.reduce((total, value) => total + value, 0);
}
