export function capitalizeNames(names: string[]): string[] {
  return names.map((name) => (name.length === 0 ? "" : name[0].toUpperCase() + name.slice(1).toLowerCase()));
}
