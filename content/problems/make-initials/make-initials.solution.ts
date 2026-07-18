export function makeInitials(fullName: string): string {
  return fullName
    .trim()
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase())
    .join("");
}
