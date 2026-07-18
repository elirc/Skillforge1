type FormInput = { name: string; tags: string[] };

export function workspaceValidationErrors(input: FormInput): string[] {
  const errors: string[] = [];
  if (input.name.trim().length === 0) errors.push("Name is required");
  if (input.tags.length === 0) errors.push("Choose at least one tag");
  return errors;
}
