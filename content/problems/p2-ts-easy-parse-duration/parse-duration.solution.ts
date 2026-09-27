const PATTERN = /^\s*(?:(\d+)\s*d)?\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?\s*$/i;
const UNIT_SECONDS = [86400, 3600, 60, 1];

export function parseDuration(text: string): number | null {
  const match = PATTERN.exec(text);
  if (!match) return null;
  const parts = match.slice(1, 5);
  if (parts.every((part) => part === undefined)) return null;
  return parts.reduce((total, part, i) => total + (part === undefined ? 0 : Number(part) * UNIT_SECONDS[i]), 0);
}
