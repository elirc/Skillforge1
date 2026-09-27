export type Addon = { id: string; price: number; value: number };

export function bestBundle(addons: Addon[], budget: number) {
  // best[i][c] = best (value desc, price asc) using the first i add-ons with at most c to spend.
  // Remember whether taking add-on i was better, then walk back to list the ids.
}
