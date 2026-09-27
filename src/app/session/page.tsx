import { SiteShell } from "@/components/site-shell";
import { GuidedSession, type SessionStep } from "@/features/dashboard/guided-session";
import { getCurrentUser } from "@/server/user";
import { getNextLesson, getRecommendedProblem, getWeakConcepts } from "@/server/feed";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function SessionPage() {
  const user = await getCurrentUser();
  const due = await prisma.reviewState.count({ where: { userId: user.id, knowledgeItem: { archived: false }, dueAt: { lte: new Date() } } });
  const lesson = await getNextLesson(user.id, user.goal);
  const weak = await getWeakConcepts(user.id, 5);
  const problem = await getRecommendedProblem(user.id, weak.map(item => item.tag), user.goal);
  const minutes = user.dailyMinutes;
  const reviewMinutes = due ? Math.min(due, Math.max(1, Math.floor(minutes * 0.2))) : 0;
  const practiceMinutes = problem ? Math.max(2, Math.floor(minutes * 0.3)) : 0;
  const lessonMinutes = Math.max(1, minutes - reviewMinutes - practiceMinutes);
  const steps: SessionStep[] = [];
  if (reviewMinutes) steps.push({ title: "Retrieve yesterday's ideas", href: `/reviews?limit=${reviewMinutes}`, minutes: reviewMinutes, description: `Work through up to ${reviewMinutes} due cards. Code cards may take longer.` });
  if (lesson) steps.push({ title: lesson.lessonTitle, href: `/courses/${lesson.courseSlug}/lessons/${lesson.lessonId}`, minutes: lessonMinutes, description: `Continue ${lesson.courseTitle}. The full lesson takes about ${lesson.estimatedMinutes} minutes; save your draft if you stop partway.` });
  if (problem) steps.push({ title: problem.title, href: `/problems/${problem.slug}`, minutes: practiceMinutes, description: "Try an independent solution and compare the failed cases before using hints." });
  return <SiteShell><h1 className="mb-4 text-3xl font-semibold">Your guided session</h1><GuidedSession steps={steps} minutes={minutes} /></SiteShell>;
}
