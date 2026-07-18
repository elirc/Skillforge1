type ProjectCard = { displayName?: string; fallbackName: string };

export function projectFallbackName(card: ProjectCard) {
  // prefer displayName, then fallbackName
}
