import { createHash } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import type { CourseSeed, ProblemSeed } from "../../src/lib/content-schema";

const json = (value: unknown) => value as Prisma.InputJsonValue;
export const catalogVersion = (courses: CourseSeed[], problems: ProblemSeed[]) => createHash("sha256").update(JSON.stringify({ courses, problems })).digest("hex").slice(0, 16);

/** Reordering never changes identity; retired content retains all learner data. */
export async function syncContent(client: PrismaClient, courses: CourseSeed[], problems: ProblemSeed[]) {
  const keys = courses.flatMap(c => c.modules.flatMap(m => [m.id, ...m.lessons.flatMap(l => [l.id, ...l.knowledgeItems.map(k => k.id)])]));
  if (keys.some(key => !key) || new Set(keys).size !== keys.length) throw new Error("Every module, lesson and knowledge item needs a unique authored id. Run npm run content:ids.");
  return client.$transaction(async tx => {
    const oldCourses = await tx.course.findMany();
    const oldModules = await tx.module.findMany();
    const oldLessons = await tx.lesson.findMany();
    const oldItems = await tx.knowledgeItem.findMany();
    const legacyKey = "backup-legacy-positions";
    if (!await tx.appMetadata.findUnique({ where: { key: legacyKey } })) {
      const lessonKeys: Record<string, string> = {};
      const itemKeys: Record<string, string> = {};
      for (const lesson of oldLessons) {
        const legacyModule = oldModules.find(row => row.id === lesson.moduleId);
        const course = oldCourses.find(row => row.id === legacyModule?.courseId);
        if (!legacyModule || !course) continue;
        const key = `${course.slug}/${legacyModule.order}/${lesson.order}`;
        lessonKeys[key] = lesson.id;
        for (const item of oldItems.filter(row => row.lessonId === lesson.id)) itemKeys[`${key}/${item.order}`] = item.id;
      }
      await tx.appMetadata.create({ data: { key: legacyKey, value: JSON.stringify({ lessons: lessonKeys, items: itemKeys }) } });
    }
    // Free positional uniqueness before moving rows. Snapshots retain legacy positions.
    for (const [rows, table] of [[oldModules, "Module"], [oldLessons, "Lesson"], [oldItems, "KnowledgeItem"]] as const) {
      let position = Math.min(0, ...rows.map(row => row.order)) - rows.length - 1;
      for (const row of rows) await tx.$executeRawUnsafe(`UPDATE "${table}" SET "order" = ?, "archived" = 1 WHERE "id" = ?`, position++, row.id);
    }
    await tx.course.updateMany({ data: { archived: true } });
    await tx.problem.updateMany({ data: { archived: true } });
    const adopted = new Set<string>();
    for (const course of courses) {
      const { modules, ...metadata } = course;
      const fields = { ...metadata, topicTags: JSON.stringify(course.topicTags), outcomes: JSON.stringify(course.outcomes), prerequisites: JSON.stringify(course.prerequisites), archived: false };
      const savedCourse = await tx.course.upsert({ where: { slug: course.slug }, create: fields, update: fields });
      const legacyCourse = oldCourses.find(row => row.slug === course.slug);
      for (const courseModule of modules) {
        const previousModule = oldModules.find(row => row.contentKey === courseModule.id) ?? oldModules.find(row => !row.contentKey && !adopted.has(row.id) && row.courseId === legacyCourse?.id && row.title === courseModule.title);
        if (previousModule) adopted.add(previousModule.id);
        const moduleData = { courseId: savedCourse.id, contentKey: courseModule.id!, title: courseModule.title, order: courseModule.order, archived: false };
        const savedModule = previousModule ? await tx.module.update({ where: { id: previousModule.id }, data: moduleData }) : await tx.module.create({ data: moduleData });
        for (const lesson of courseModule.lessons) {
          const previousLesson = oldLessons.find(row => row.contentKey === lesson.id) ?? oldLessons.find(row => !row.contentKey && !adopted.has(row.id) && row.moduleId === previousModule?.id && row.title === lesson.title);
          if (previousLesson) adopted.add(previousLesson.id);
          const lessonData = { moduleId: savedModule.id, contentKey: lesson.id!, title: lesson.title, order: lesson.order, archived: false, contentBlocks: json(lesson.contentBlocks), estimatedMinutes: lesson.estimatedMinutes, prerequisites: JSON.stringify(lesson.prerequisites) };
          const savedLesson = previousLesson ? await tx.lesson.update({ where: { id: previousLesson.id }, data: lessonData }) : await tx.lesson.create({ data: lessonData });
          for (const [order, item] of lesson.knowledgeItems.entries()) {
            const previousItem = oldItems.find(row => row.contentKey === item.id) ?? oldItems.find(row => !row.contentKey && !adopted.has(row.id) && row.lessonId === previousLesson?.id && row.type === item.type && row.prompt === item.prompt);
            if (previousItem) adopted.add(previousItem.id);
            const itemData = { lessonId: savedLesson.id, contentKey: item.id!, order, archived: false, type: item.type, prompt: item.prompt, payload: json(item.payload), conceptTags: JSON.stringify(item.conceptTags) };
            if (previousItem) await tx.knowledgeItem.update({ where: { id: previousItem.id }, data: itemData });
            else await tx.knowledgeItem.create({ data: itemData });
          }
        }
      }
    }
    for (const problem of problems) {
      const fields = { ...problem, conceptTags: JSON.stringify(problem.conceptTags), tests: json(problem.tests), explanation: json(problem.explanation), archived: false };
      await tx.problem.upsert({ where: { slug: problem.slug }, create: fields, update: fields });
    }
    // Legacy rows that no authored record adopted remain archived. Give them
    // a fixed recovery identity too, so later syncs cannot invalidate a backup
    // merely by moving their retired display positions again.
    for (const table of ["Module", "Lesson", "KnowledgeItem"] as const) {
      await tx.$executeRawUnsafe(`UPDATE "${table}" SET "contentKey" = 'legacy_' || "id" WHERE "contentKey" IS NULL`);
    }
    const version = catalogVersion(courses, problems);
    await tx.appMetadata.upsert({ where: { key: "content-version" }, create: { key: "content-version", value: version }, update: { value: version } });
    return { version, courses: courses.length, lessons: courses.reduce((sum, c) => sum + c.modules.reduce((n, m) => n + m.lessons.length, 0), 0), problems: problems.length };
  }, { maxWait: 30_000, timeout: 300_000 });
}
