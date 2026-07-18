interface LessonRecord {
  title: string;
  status: string;
}

export function groupByStatus(lessons: LessonRecord[]): Record<string, LessonRecord[]> {
  return lessons.reduce<Record<string, LessonRecord[]>>((groups, lesson) => {
    groups[lesson.status] = groups[lesson.status] ?? [];
    groups[lesson.status].push(lesson);
    return groups;
  }, {});
}
