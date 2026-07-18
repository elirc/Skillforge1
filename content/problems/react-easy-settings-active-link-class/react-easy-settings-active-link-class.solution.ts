export function settingsActiveLinkClass(href: string, currentPath: string): string {
  return href === currentPath ? "link active" : "link";
}
