export function settingsBadgeText(count: number): string {
  if (count <= 0) return "";
  if (count > 9) return "9+";
  return String(count);
}
