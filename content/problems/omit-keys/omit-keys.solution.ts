export function omitKeys(input: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const blocked = new Set(keys);
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!blocked.has(key)) output[key] = value;
  }
  return output;
}
