type Student = { name: string; scores: number[] };

function average(scores: number[]): number {
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

export function topStudent(students: Student[]): string {
  if (students.length === 0) return "";
  let best = students[0];
  for (const student of students) {
    if (average(student.scores) > average(best.scores)) best = student;
  }
  return best.name;
}
