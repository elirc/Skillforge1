type ProjectCard = { displayName?: string; fallbackName: string };

export function projectFallbackName(card: ProjectCard): string {
  return card.displayName ?? card.fallbackName;
}
