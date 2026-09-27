export function cheapestToQualify(sortedPrices: number[], subtotal: number, threshold: number): number | null {
  const need = threshold - subtotal;
  if (need <= 0) return 0;
  let lo = 0;
  let hi = sortedPrices.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sortedPrices[mid] < need) lo = mid + 1;
    else hi = mid;
  }
  return lo < sortedPrices.length ? sortedPrices[lo] : null;
}
