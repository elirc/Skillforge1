type TeamCard = { displayName?: string; fallbackName: string };

export function teamFallbackName(card: TeamCard): string {
  return card.displayName ?? card.fallbackName;
}
