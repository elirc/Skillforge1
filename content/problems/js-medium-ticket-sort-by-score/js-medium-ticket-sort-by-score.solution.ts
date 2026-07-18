type ScoredItem = { id: string; score: number };

export function ticketSortByScore(items: ScoredItem[]): ScoredItem[] {
  return [...items].sort((a, b) => b.score - a.score);
}
