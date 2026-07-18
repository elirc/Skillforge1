type CustomerInput = { name: string; balance: number };

export function customerValidationErrors(input: CustomerInput): string[] {
  const errors: string[] = [];
  if (input.name.trim().length === 0) errors.push("name is required");
  if (input.balance < 0) errors.push("balance cannot be negative");
  return errors;
}
