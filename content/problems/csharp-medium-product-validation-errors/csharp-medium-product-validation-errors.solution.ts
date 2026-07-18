type ProductInput = { name: string; price: number };

export function productValidationErrors(input: ProductInput): string[] {
  const errors: string[] = [];
  if (input.name.trim().length === 0) errors.push("name is required");
  if (input.price < 0) errors.push("price cannot be negative");
  return errors;
}
