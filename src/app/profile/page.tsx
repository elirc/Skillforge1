import { BadgeCheck, Flame, Snowflake, Target, Trophy } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ActivityHeatmap } from "@/features/dashboard/activity-heatmap";
import { ProfileSettings } from "@/features/profile/profile-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/prisma";
import { experienceLabels, goalLabels } from "@/lib/enums";
import { getAchievementBoard, getProgressOverview, getXpHistory } from "@/server/gamification";
import { getCurrentUser } from "@/server/user";

export const dynamic = "force-dynamic";

const tierRing: Record<string, string> = {
  bronze: "border-amber-700/40",
  silver: "border-slate-400/60",
  gold: "border-amber-400",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const [overview, board, history, counts] = await Promise.all([
    getProgressOverview(user.id),
    getAchievementBoard(user.id),
    getXpHistory(user.id, 182),
    Promise.all([
      prisma.lessonCompletion.count({ where: { userId: user.id } }),
      prisma.attempt.count({ where: { userId: user.id } }),
      prisma.problemSubmission
        .findMany({ where: { userId: user.id, passed: true }, select: { problemId: true }, distinct: ["problemId"] })
        .then((rows) => rows.length),
      prisma.quest.count({ where: { userId: user.id, completedAt: { not: null } } }),
    ]),
  ]);

  const [lessonsDone, reviewsGraded, problemsSolved, questsDone] = counts;
  const earned = board.filter((entry) => entry.earnedAt !== null);

  return (
    <SiteShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">{user.name}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Level {overview.level} · {overview.rank} · {goalLabels[user.goal]} · {experienceLabels[user.experience]}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Total XP" value={overview.xp.toLocaleString()} icon={<Trophy className="h-5 w-5 text-emerald-500" />} />
        <Stat title="Current streak" value={`${overview.streakCurrent} days`} icon={<Flame className="h-5 w-5 text-amber-500" />} />
        <Stat title="Longest streak" value={`${overview.streakLongest} days`} icon={<BadgeCheck className="h-5 w-5 text-sky-500" />} />
        <Stat title="Freezes left" value={overview.streakFreezes} icon={<Snowflake className="h-5 w-5 text-sky-400" />} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Lessons finished" value={lessonsDone} icon={<Target className="h-5 w-5 text-slate-400" />} />
        <Stat title="Reviews graded" value={reviewsGraded} icon={<Target className="h-5 w-5 text-slate-400" />} />
        <Stat title="Problems solved" value={problemsSolved} icon={<Target className="h-5 w-5 text-slate-400" />} />
        <Stat title="Quests completed" value={questsDone} icon={<Target className="h-5 w-5 text-slate-400" />} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Last six months</h2>
        <ActivityHeatmap history={history.map(({ day, xp }) => ({ day, xp }))} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Achievements</CardTitle>
            <span className="text-sm text-slate-500">
              {earned.length}/{board.length}
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {board.map((entry) => (
              <div
                key={entry.key}
                className={`rounded-md border-2 p-3 ${entry.earnedAt ? tierRing[entry.tier] ?? "border-slate-300" : "border-dashed border-slate-200 opacity-70 dark:border-slate-800"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className={entry.earnedAt ? "" : "text-slate-500"}>
                      <span aria-hidden className="mr-1.5">
                        {entry.earnedAt ? entry.icon : "🔒"}
                      </span>
                      {entry.name}
                    </strong>
                    <p className="text-sm text-slate-500">{entry.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">+{entry.xpReward} XP</span>
                </div>
                {entry.earnedAt ? null : (
                  <>
                    <Progress className="mt-2" value={(entry.current / entry.target) * 100} />
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.current} / {entry.target}
                    </p>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <ProfileSettings
          defaults={{
            name: user.name,
            goal: user.goal,
            experience: user.experience,
            dailyXpGoal: overview.dailyXpGoal,
            focusTags: user.focusTags,
          }}
        />
      </div>
    </SiteShell>
  );
}

function Stat({ title, value, icon }: { title: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}
