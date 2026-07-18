export function countCompleted(lessons: Record<string, boolean>): number {
  return Object.values(lessons).filter(Boolean).length;
}
