import Link from "next/link";
import { Flame, GraduationCap, Trophy, UserCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/user";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const progress = await prisma.progress.findUnique({ where: { userId: user.id } });
  const due = await prisma.reviewState.count({ where: { userId: user.id, dueAt: { lte: new Date() } } });

  return (
    <div className="min-h-screen bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span>Skillforge</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link className="rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900" href="/">
              Catalog
            </Link>
            <Link className="rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900" href="/reviews">
              Reviews {due > 0 ? <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{due}</span> : null}
            </Link>
            <Link className="rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900" href="/profile" aria-label="Profile">
              <UserCircle className="h-5 w-5" />
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="inline-flex items-center gap-1">
            <Flame className="h-4 w-4 text-amber-500" />
            {progress?.streakCurrent ?? 0} day streak
          </span>
          <span className="inline-flex items-center gap-1">
            <Trophy className="h-4 w-4 text-emerald-500" />
            Level {progress?.level ?? 1}
          </span>
          <span>{progress?.xp ?? 0} XP</span>
        </div>
        {children}
      </main>
    </div>
  );
}
