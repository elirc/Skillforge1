export function pairSum(numbers: number[], target: number): boolean {
  const seen = new Set<number>();
  for (const value of numbers) {
    if (seen.has(target - value)) return true;
    seen.add(value);
  }
  return false;
}
