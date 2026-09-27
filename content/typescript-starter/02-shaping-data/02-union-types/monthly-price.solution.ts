type Plan = "free" | "pro" | "team";

export function monthlyPrice(plan: Plan, seats: number): number {
  if (plan === "free") return 0;
  if (plan === "pro") return 12 * seats;
  return 8 * Math.max(3, seats);
}
