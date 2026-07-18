export function removeFalsyValues(values: unknown[]): unknown[] {
  return values.filter(Boolean);
}
