type ScoredItem = { id: string; score: number };

export function productSortByScore(items: ScoredItem[]): ScoredItem[] {
  return [...items].sort((a, b) => b.score - a.score);
}
