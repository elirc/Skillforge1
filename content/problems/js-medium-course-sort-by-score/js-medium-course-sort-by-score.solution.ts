type ScoredItem = { id: string; score: number };

export function courseSortByScore(items: ScoredItem[]): ScoredItem[] {
  return [...items].sort((a, b) => b.score - a.score);
}
