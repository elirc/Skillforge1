type UserCard = { displayName?: string; fallbackName: string };

export function userFallbackName(card: UserCard): string {
  return card.displayName ?? card.fallbackName;
}
