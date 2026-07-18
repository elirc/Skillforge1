export function sumAll(...numbers: number[]): number {
  return numbers.reduce((sum, value) => sum + value, 0);
}
