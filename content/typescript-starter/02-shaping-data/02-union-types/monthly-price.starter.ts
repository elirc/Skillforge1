type Plan = "free" | "pro" | "team";

// Because plan is the union Plan, TypeScript knows exactly three strings are
// possible, and your editor will autocomplete them in comparisons.
export function monthlyPrice(plan: Plan, seats: number) {
  // free: 0 no matter how many seats.
  // pro: 12 per seat.
  // team: 8 per seat, billed for at least 3 seats.
}
