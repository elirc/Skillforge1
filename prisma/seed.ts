import { PrismaClient } from "@prisma/client";
import { achievementDefinitions } from "../src/lib/gamification";
import { loadAllCourses, loadAllProblems } from "../scripts/lib/content";
import { syncContent } from "../scripts/lib/seed-content";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const prisma = new PrismaClient();
async function main() {
  const courses = await loadAllCourses();
  const problems = await loadAllProblems();
  if (await prisma.user.count()) {
    const url = process.env.DATABASE_URL ?? "file:../data/skillforge.db";
    if (!url.startsWith("file:")) throw new Error("Content sync requires a local SQLite database.");
    execFileSync(process.execPath, [resolve("scripts/backup-database.mjs"), resolve("prisma", url.slice(5))], { stdio: "inherit", windowsHide: true });
  }
  console.log(await syncContent(prisma, courses, problems));
  for (const definition of achievementDefinitions) {
    const { key, name, description, icon, tier, xpReward } = definition;
    const data = { name, description, icon, tier, xpReward };
    await prisma.achievement.upsert({ where: { key }, update: data, create: { key, ...data } });
  }
  await prisma.user.upsert({ where: { id: "local" }, update: {}, create: { id: "local", name: "Learner", progress: { create: {} } } });
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
