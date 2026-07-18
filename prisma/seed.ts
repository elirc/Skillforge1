import { PrismaClient, type Prisma } from "@prisma/client";
import { type CourseSeed } from "../src/lib/content-schema";
import { loadAllCourses, loadAllProblems } from "../scripts/lib/content";

const prisma = new PrismaClient();

async function upsertCourse(course: CourseSeed) {
  await prisma.course.upsert({
    where: { slug: course.slug },
    update: {
      title: course.title,
      description: course.description,
      language: course.language,
      topicTags: course.topicTags,
      difficulty: course.difficulty,
      isPro: course.isPro,
      order: course.order,
      outcomes: course.outcomes,
    },
    create: {
      slug: course.slug,
      title: course.title,
      description: course.description,
      language: course.language,
      topicTags: course.topicTags,
      difficulty: course.difficulty,
      isPro: course.isPro,
      order: course.order,
      outcomes: course.outcomes,
    },
  });

  const savedCourse = await prisma.course.findUniqueOrThrow({ where: { slug: course.slug } });
  await prisma.module.deleteMany({ where: { courseId: savedCourse.id } });

  for (const courseModule of course.modules) {
    const savedModule = await prisma.module.create({
      data: {
        courseId: savedCourse.id,
        title: courseModule.title,
        order: courseModule.order,
      },
    });

    for (const lesson of courseModule.lessons) {
      const savedLesson = await prisma.lesson.create({
        data: {
          moduleId: savedModule.id,
          title: lesson.title,
          order: lesson.order,
          contentBlocks: lesson.contentBlocks as Prisma.InputJsonValue,
        },
      });

      await prisma.knowledgeItem.createMany({
        data: lesson.knowledgeItems.map((item) => ({
          lessonId: savedLesson.id,
          type: item.type,
          prompt: item.prompt,
          payload: item.payload as Prisma.InputJsonValue,
          conceptTags: item.conceptTags,
        })),
      });
    }
  }
}

async function seedProblems() {
  for (const problem of await loadAllProblems()) {
    const data = {
      title: problem.title,
      prompt: problem.prompt,
      explanation: problem.explanation as Prisma.InputJsonValue,
      language: problem.language,
      difficulty: problem.difficulty,
      conceptTags: problem.conceptTags,
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
  const achievements = [
    {
      key: "first-forge",
      name: "First Forge",
      description: "Earn 50 XP from genuine learning activity.",
      icon: "FF",
      xpReward: 10,
    },
    {
      key: "three-day-heat",
      name: "Three-Day Heat",
      description: "Keep a three-day learning streak alive.",
      icon: "3D",
      xpReward: 15,
    },
    {
      key: "recall-smith",
      name: "Recall Smith",
      description: "Complete five spaced-repetition reviews.",
      icon: "RS",
      xpReward: 20,
    },
    {
      key: "module-maker",
      name: "Module Maker",
      description: "Complete three lessons in a course.",
      icon: "MM",
      xpReward: 15,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }
}

async function seedDemoUser() {
  const user = await prisma.user.upsert({
    where: { email: "demo@skillforge.local" },
    update: { name: "Guest Learner" },
    create: {
      email: "demo@skillforge.local",
      name: "Guest Learner",
      progress: {
        create: {
          xp: 80,
          level: 2,
          streakCurrent: 2,
          streakLongest: 4,
          streakFreezes: 1,
          lastActiveDate: new Date(),
        },
      },
    },
  });

  await prisma.progress.upsert({
    where: { userId: user.id },
    update: { xp: 80, level: 2, streakCurrent: 2, streakLongest: 4 },
    create: { userId: user.id, xp: 80, level: 2, streakCurrent: 2, streakLongest: 4 },
  });

  const firstLesson = await prisma.lesson.findFirst({
    where: { module: { course: { slug: "javascript-foundations" } } },
    include: { knowledgeItems: true },
    orderBy: { order: "asc" },
  });

  if (firstLesson) {
    await prisma.lessonCompletion.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: firstLesson.id } },
      update: {},
      create: { userId: user.id, lessonId: firstLesson.id },
    });

    for (const item of firstLesson.knowledgeItems) {
      await prisma.reviewState.upsert({
        where: { userId_knowledgeItemId: { userId: user.id, knowledgeItemId: item.id } },
        update: { dueAt: new Date(Date.now() - 60_000) },
        create: {
          userId: user.id,
          knowledgeItemId: item.id,
          dueAt: new Date(Date.now() - 60_000),
          stability: 1,
          difficulty: 5,
          interval: 0,
          state: "NEW",
        },
      });
    }
  }

  await prisma.organization.upsert({
    where: { id: "demo-org" },
    update: { adminId: user.id, seats: 12 },
    create: {
      id: "demo-org",
      name: "Skillforge Labs",
      seats: 12,
      adminId: user.id,
    },
  });
}

async function main() {
  for (const course of await loadAllCourses()) {
    await upsertCourse(course);
  }
  await seedProblems();
  await seedAchievements();
  await seedDemoUser();
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
