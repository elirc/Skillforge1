export function billingActiveLinkClass(href: string, currentPath: string): string {
  return href === currentPath ? "link active" : "link";
}
