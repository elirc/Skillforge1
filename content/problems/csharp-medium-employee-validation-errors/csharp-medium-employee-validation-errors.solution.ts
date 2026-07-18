type EmployeeInput = { name: string; salary: number };

export function employeeValidationErrors(input: EmployeeInput): string[] {
  const errors: string[] = [];
  if (input.name.trim().length === 0) errors.push("name is required");
  if (input.salary < 0) errors.push("salary cannot be negative");
  return errors;
}
