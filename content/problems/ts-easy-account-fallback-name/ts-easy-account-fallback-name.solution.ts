type AccountCard = { displayName?: string; fallbackName: string };

export function accountFallbackName(card: AccountCard): string {
  return card.displayName ?? card.fallbackName;
}
