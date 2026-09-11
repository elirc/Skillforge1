import Link from "next/link";
import { Flame, Hammer, Map, Snowflake, Swords, Target, UserCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { XpRing } from "@/components/xp-ring";
import { getCurrentUser } from "@/server/user";
import { getProgressOverview } from "@/server/gamification";

const navLinks = [
  { href: "/", label: "Today", icon: Target },
  { href: "/tracks", label: "Tracks", icon: Map },
  { href: "/problems", label: "Problems", icon: Swords },
];

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const [overview, due] = await Promise.all([
    getProgressOverview(user.id),
    prisma.reviewState.count({ where: { userId: user.id, dueAt: { lte: new Date() } } }),
  ]);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white">
              <Hammer className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">Skillforge</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 sm:px-3"
              >
                <link.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
            <Link
              href="/reviews"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 sm:px-3"
            >
              <span className="hidden sm:inline">Reviews</span>
              <span className="sm:hidden">Rev</span>
              {due > 0 ? (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {due}
                </span>
              ) : null}
            </Link>
            <Link
              href="/profile"
              className="rounded-md px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label="Profile"
            >
              <UserCircle className="h-5 w-5" />
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <XpRing
              value={overview.xpIntoLevel}
              max={overview.xpForNextLevel}
              label={`${overview.level}`}
              sublabel="lvl"
            />
            <div>
              <p className="font-semibold">{overview.rank}</p>
              <p className="text-xs text-slate-500">
                {overview.xpIntoLevel} / {overview.xpForNextLevel} XP to level {overview.level + 1}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <XpRing
              value={overview.dailyXp}
              max={overview.dailyXpGoal}
              tone="amber"
              label={`${overview.dailyXp}`}
              sublabel="today"
            />
            <div>
              <p className="font-semibold">Daily goal</p>
              <p className="text-xs text-slate-500">{overview.dailyXpGoal} XP</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5">
            <Flame className={overview.streakCurrent > 0 ? "h-4 w-4 text-amber-500" : "h-4 w-4 text-slate-400"} />
            <strong>{overview.streakCurrent}</strong> day streak
          </span>

          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Snowflake className="h-4 w-4 text-sky-400" />
            {overview.streakFreezes} freeze{overview.streakFreezes === 1 ? "" : "s"}
          </span>

          <span className="ml-auto text-slate-500">{overview.xp.toLocaleString()} XP total</span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
