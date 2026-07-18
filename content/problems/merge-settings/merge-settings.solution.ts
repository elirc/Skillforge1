export function mergeSettings(defaults: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown> {
  return { ...defaults, ...overrides };
}
