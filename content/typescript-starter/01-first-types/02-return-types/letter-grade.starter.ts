// Add the return type annotation `: string` after the parameter list once the
// body returns a value on every path. With the annotation in place, TypeScript
// will complain if any branch forgets to return.
export function letterGrade(score: number) {
  // 90 and above -> "A", 80-89 -> "B", 70-79 -> "C", 60-69 -> "D", below 60 -> "F".
  // A score outside 0-100 is invalid: return "invalid".
}
