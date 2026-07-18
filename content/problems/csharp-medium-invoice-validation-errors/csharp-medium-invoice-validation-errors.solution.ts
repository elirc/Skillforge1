type InvoiceInput = { number: string; amount: number };

export function invoiceValidationErrors(input: InvoiceInput): string[] {
  const errors: string[] = [];
  if (input.number.trim().length === 0) errors.push("number is required");
  if (input.amount < 0) errors.push("amount cannot be negative");
  return errors;
}
