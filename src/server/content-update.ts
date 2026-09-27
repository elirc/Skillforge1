import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { loadAllCourses, loadAllProblems } from "../../scripts/lib/content";
import { catalogVersion, syncContent } from "../../scripts/lib/seed-content";
import { prisma } from "@/lib/prisma";

export async function previewContentUpdate() {
  const courses = await loadAllCourses();
  const problems = await loadAllProblems();
  const authored = courses.flatMap(course => course.modules.flatMap(module => module.lessons));
  const installed = await prisma.lesson.findMany({ select: { contentKey: true, archived: true } });
  const existingKeys = new Set(installed.map(lesson => lesson.contentKey));
  const authoredKeys = new Set(authored.map(lesson => lesson.id));
  const version = catalogVersion(courses, problems);
  const previous = await prisma.appMetadata.findUnique({ where: { key: "content-version" } });
  return { version, installedVersion: previous?.value ?? "legacy", courses: courses.length, lessons: authored.length, problems: problems.length, addedLessons: authored.filter(lesson => !existingKeys.has(lesson.id ?? null)).length, retiredLessons: installed.filter(lesson => lesson.contentKey && !lesson.archived && !authoredKeys.has(lesson.contentKey)).length, changed: previous?.value !== version };
}

export async function applyContentUpdate(expectedVersion: string) {
  const courses = await loadAllCourses();
  const problems = await loadAllProblems();
  if (catalogVersion(courses, problems) !== expectedVersion) throw new Error("The authored content changed. Preview the update again.");
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.startsWith("file:")) throw new Error("A local SQLite database is required.");
  const databasePath = resolve("prisma", databaseUrl.slice(5));
  await promisify(execFile)(process.execPath, [resolve("scripts/backup-database.mjs"), databasePath], { windowsHide: true });
  return syncContent(prisma, courses, problems);
}
