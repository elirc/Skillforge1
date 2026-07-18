type WorkspaceCard = { displayName?: string; fallbackName: string };

export function workspaceFallbackName(card: WorkspaceCard): string {
  return card.displayName ?? card.fallbackName;
}
