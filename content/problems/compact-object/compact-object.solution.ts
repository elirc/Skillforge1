export function compactObject(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value !== null && value !== undefined && value !== "") {
      output[key] = value;
    }
  }

  return output;
}
