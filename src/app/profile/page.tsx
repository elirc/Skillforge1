import { BadgeCheck, Flame, Trophy } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/user";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const [progress, badges, leaderboard] = await Promise.all([
    prisma.progress.findUnique({ where: { userId: user.id } }),
    prisma.userAchievement.findMany({ where: { userId: user.id }, include: { achievement: true }, orderBy: { earnedAt: "desc" } }),
    prisma.leaderboardEntry.findMany({ include: { user: true, league: true }, orderBy: { xp: "desc" }, take: 10 }),
  ]);

  return (
    <SiteShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">{user.name ?? "Skillforge learner"}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{user.email}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="XP" value={progress?.xp ?? 0} icon={<Trophy className="h-5 w-5 text-emerald-500" />} />
        <Stat title="Level" value={progress?.level ?? 1} icon={<BadgeCheck className="h-5 w-5 text-sky-500" />} />
        <Stat title="Streak" value={`${progress?.streakCurrent ?? 0} days`} icon={<Flame className="h-5 w-5 text-amber-500" />} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {badges.length === 0 ? <p className="text-sm text-slate-500">Earn your first badge by completing a lesson or review.</p> : null}
            {badges.map((badge) => (
              <div key={badge.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <strong>{badge.achievement.icon} {badge.achievement.name}</strong>
                <p className="text-sm text-slate-500">{badge.achievement.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly league</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                <span>{index + 1}. {entry.user.name ?? entry.user.email}</span>
                <span>{entry.xp} XP</span>
              </div>
            ))}
          </CardContent>
        </Card>
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
