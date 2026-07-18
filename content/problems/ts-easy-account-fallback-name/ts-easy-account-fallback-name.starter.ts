type AccountCard = { displayName?: string; fallbackName: string };

export function accountFallbackName(card: AccountCard) {
  // prefer displayName, then fallbackName
}
