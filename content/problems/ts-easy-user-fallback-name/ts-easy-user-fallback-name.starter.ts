type UserCard = { displayName?: string; fallbackName: string };

export function userFallbackName(card: UserCard) {
  // prefer displayName, then fallbackName
}
