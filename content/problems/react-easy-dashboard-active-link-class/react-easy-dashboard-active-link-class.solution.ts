export function dashboardActiveLinkClass(href: string, currentPath: string): string {
  return href === currentPath ? "link active" : "link";
}
