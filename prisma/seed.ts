import { PrismaClient, type Prisma } from "@prisma/client";
import { type CourseSeed } from "../src/lib/content-schema";
import { achievementDefinitions } from "../src/lib/gamification";
import { loadAllCourses, loadAllProblems } from "../scripts/lib/content";

const prisma = new PrismaClient();

/** SQLite has no scalar lists, so `string[]` content fields are stored as JSON text. */
const tags = (value: readonly string[]) => JSON.stringify(value);

async function upsertCourse(course: CourseSeed) {
  const fields = {
    title: course.title,
    description: course.description,
    language: course.language,
    topicTags: tags(course.topicTags),
    difficulty: course.difficulty,
    order: course.order,
    outcomes: tags(course.outcomes),
  };

  const savedCourse = await prisma.course.upsert({
    where: { slug: course.slug },
    update: fields,
    create: { slug: course.slug, ...fields },
  });

  // Identity here is POSITION, not content: reordering modules or lessons, or
  // inserting a knowledge item mid-lesson, re-points existing completions and
  // review states at whatever now occupies that slot. Append rather than
  // reorder when editing published content.
  //
  // Content rows are upserted against their stable position keys
  // (course+order, module+order, lesson+order) rather than deleted and
  // recreated. Their cuid()s therefore survive a re-seed, and so do the
  // learner rows that point at them -- LessonCompletion by lessonId,
  // ReviewState and Attempt by knowledgeItemId. Rebuilding instead would
  // cascade-delete every completion and review state on each content edit.
  const moduleOrders: number[] = [];

  for (const courseModule of course.modules) {
    moduleOrders.push(courseModule.order);

    const savedModule = await prisma.module.upsert({
      where: { courseId_order: { courseId: savedCourse.id, order: courseModule.order } },
      update: { title: courseModule.title },
      create: { courseId: savedCourse.id, title: courseModule.title, order: courseModule.order },
    });

    const lessonOrders: number[] = [];

    for (const lesson of courseModule.lessons) {
      lessonOrders.push(lesson.order);

      const lessonFields = {
        title: lesson.title,
        contentBlocks: lesson.contentBlocks as Prisma.InputJsonValue,
      };

      const savedLesson = await prisma.lesson.upsert({
        where: { moduleId_order: { moduleId: savedModule.id, order: lesson.order } },
        update: lessonFields,
        create: { moduleId: savedModule.id, order: lesson.order, ...lessonFields },
      });

      for (const [index, item] of lesson.knowledgeItems.entries()) {
        const itemFields = {
          type: item.type,
          prompt: item.prompt,
          payload: item.payload as Prisma.InputJsonValue,
          conceptTags: tags(item.conceptTags),
        };

        await prisma.knowledgeItem.upsert({
          where: { lessonId_order: { lessonId: savedLesson.id, order: index } },
          update: itemFields,
          create: { lessonId: savedLesson.id, order: index, ...itemFields },
        });
      }

      // Items removed from the lesson since the last seed.
      await prisma.knowledgeItem.deleteMany({
        where: { lessonId: savedLesson.id, order: { gte: lesson.knowledgeItems.length } },
      });
    }

    // Lessons removed from the module since the last seed.
    await prisma.lesson.deleteMany({
      where: { moduleId: savedModule.id, order: { notIn: lessonOrders } },
    });
  }

  // Modules removed from the course since the last seed.
  await prisma.module.deleteMany({
    where: { courseId: savedCourse.id, order: { notIn: moduleOrders } },
  });
}

async function seedProblems() {
  for (const problem of await loadAllProblems()) {
    const data = {
      title: problem.title,
      prompt: problem.prompt,
      explanation: problem.explanation as Prisma.InputJsonValue,
      language: problem.language,
      runtime: problem.runtime,
      difficulty: problem.difficulty,
      conceptTags: tags(problem.conceptTags),
      order: problem.order,
      starterCode: problem.starterCode,
      functionName: problem.functionName,
      tests: problem.tests as Prisma.InputJsonValue,
      referenceSolution: problem.referenceSolution,
    };
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: data,
      create: { slug: problem.slug, ...data },
    });
  }
}

async function seedAchievements() {
  for (const definition of achievementDefinitions) {
    const data = {
      name: definition.name,
      description: definition.description,
      icon: definition.icon,
      tier: definition.tier,
      xpReward: definition.xpReward,
    };
    await prisma.achievement.upsert({
      where: { key: definition.key },
      update: data,
      create: { key: definition.key, ...data },
    });
  }
}

/** The single local learner. Progress is preserved across re-seeds. */
async function seedLocalUser() {
  await prisma.user.upsert({
    where: { id: "local" },
    update: {},
    create: { id: "local", name: "Learner", progress: { create: {} } },
  });
}

async function main() {
  const courses = await loadAllCourses();
  for (const course of courses) {
    await upsertCourse(course);
  }
  await seedProblems();
  await seedAchievements();
  await seedLocalUser();

  const [lessons, problems] = await Promise.all([prisma.lesson.count(), prisma.problem.count()]);
  console.log(`Seeded ${courses.length} courses, ${lessons} lessons, ${problems} problems.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
