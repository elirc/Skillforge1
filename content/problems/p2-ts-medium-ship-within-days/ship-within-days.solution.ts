function daysNeeded(parcels: number[], capacity: number): number {
  let days = 1;
  let load = 0;
  for (const weight of parcels) {
    if (load + weight > capacity) {
      days++;
      load = 0;
    }
    load += weight;
  }
  return days;
}

export function minTruckCapacity(parcels: number[], days: number): number {
  if (parcels.length === 0) return 0;
  let lo = Math.max(...parcels);
  let hi = parcels.reduce((sum, weight) => sum + weight, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (daysNeeded(parcels, mid) <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
