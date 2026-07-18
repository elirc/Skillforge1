type Flag = { key: string; enabled: boolean };

export function makeLookup(flags: Flag[]): Record<string, boolean> {
  const lookup: Record<string, boolean> = {};
  for (const flag of flags) {
    lookup[flag.key] = flag.enabled;
  }
  return lookup;
}
