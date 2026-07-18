type WorkspaceCard = { displayName?: string; fallbackName: string };

export function workspaceFallbackName(card: WorkspaceCard) {
  // prefer displayName, then fallbackName
}
