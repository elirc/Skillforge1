type User = { id: number; name: string };

export function formatUserLabel(user: User): string {
  return `${user.name} (#${user.id})`;
}
