type TeamCard = { displayName?: string; fallbackName: string };

export function teamFallbackName(card: TeamCard) {
  // prefer displayName, then fallbackName
}
