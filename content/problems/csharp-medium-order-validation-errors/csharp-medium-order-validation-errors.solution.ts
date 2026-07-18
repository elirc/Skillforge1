type OrderInput = { number: string; total: number };

export function orderValidationErrors(input: OrderInput): string[] {
  const errors: string[] = [];
  if (input.number.trim().length === 0) errors.push("number is required");
  if (input.total < 0) errors.push("total cannot be negative");
  return errors;
}
