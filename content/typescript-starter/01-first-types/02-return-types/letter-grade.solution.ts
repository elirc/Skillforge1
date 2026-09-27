export function letterGrade(score: number): string {
  if (score < 0 || score > 100) return "invalid";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
