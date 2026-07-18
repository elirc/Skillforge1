export function activeNavClass(href: string, currentPath: string): string {
  return href === currentPath ? "nav-item active" : "nav-item";
}
