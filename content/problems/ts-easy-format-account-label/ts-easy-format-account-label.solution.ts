type Account = { id: string; displayName: string };

export function formatAccountLabel(item: Account): string {
  return item.displayName + " (" + item.id + ")";
}
