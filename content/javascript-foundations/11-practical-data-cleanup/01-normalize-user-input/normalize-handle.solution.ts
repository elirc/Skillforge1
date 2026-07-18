export function normalizeHandle(handle: string): string {
  const cleaned = handle.trim().toLowerCase();
  return cleaned.startsWith("@") ? cleaned.slice(1) : cleaned;
}
