export function formatId(id: string | number): string {
  if (typeof id === "number") {
    return `#${id}`;
  }
  return id.trim().toUpperCase();
}
