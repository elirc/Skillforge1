export function removeFieldAt(fields: string[], indexToRemove: number): string[] {
  return fields.filter((_, index) => index !== indexToRemove);
}
