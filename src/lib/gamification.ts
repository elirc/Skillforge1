import type { Experience, Goal } from "@/lib/enums";

export type ActivityKind = "lesson" | "review" | "exercise" | "quest" | "achievement";

export interface ProgressSnapshot {
  xp: number;
  level: number;
  streakCurrent: number;
  streakLongest: number;
  lastActiveDate: Date | null;
  streakFreezes: number;
  dailyXpGoal: number;
}

const baseXpByActivity: Record<ActivityKind, number> = {
  lesson: 35,
  review: 8,
  exercise: 12,
  quest: 0,
  achievement: 0,
};

/** Streak multiplier tops out at 1.5x so a long streak matters without runaway inflation. */
export function streakMultiplier(streak: number) {
  return Math.min(1.5, 1 + Math.floor(streak / 5) * 0.1);
}

/**
 * `correct` is false for a failed recall *and* for repeat credit (re-reading a
 * finished lesson, re-solving a solved problem). A missed review still pays a
 * token 2 XP because the attempt itself is useful practice; everything else
 * pays nothing, so no activity can be farmed by repeating it.
 */
export function xpForActivity(kind: ActivityKind, correct = true, streak = 0) {
  if (!correct) return kind === "review" ? Math.round(2 * streakMultiplier(streak)) : 0;
  return Math.round(baseXpByActivity[kind] * streakMultiplier(streak));
}

// -------------------------------------------------------------------------
// Levels
// -------------------------------------------------------------------------

/**
 * Quadratic curve: level N starts at 75 * (N-1)^2 XP. Early levels come fast,
 * later ones stretch out, which is what keeps a long solo run interesting.
 */
export function xpForLevel(level: number) {
  return 75 * Math.max(0, level - 1) ** 2;
}

export function levelForXp(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 75)) + 1);
}

export interface LevelInfo {
  level: number;
  rank: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPct: number;
}

const ranks = [
  { minLevel: 1, name: "Hello World" },
  { minLevel: 3, name: "Console App" },
  { minLevel: 5, name: "Controller Cadet" },
  { minLevel: 8, name: "CRUD Journeyman" },
  { minLevel: 12, name: "EF Core Wrangler" },
  { minLevel: 16, name: "Query Planner" },
  { minLevel: 21, name: "Service Architect" },
  { minLevel: 27, name: "Production Owner" },
];

export function rankForLevel(level: number) {
  return [...ranks].reverse().find((rank) => level >= rank.minLevel)?.name ?? ranks[0].name;
}

export function levelInfo(xp: number): LevelInfo {
  const level = levelForXp(xp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const span = ceiling - floor;
  const into = xp - floor;
  return {
    level,
    rank: rankForLevel(level),
    xpIntoLevel: into,
    xpForNextLevel: span,
    progressPct: span === 0 ? 0 : Math.min(100, Math.round((into / span) * 100)),
  };
}

// -------------------------------------------------------------------------
// Days and streaks
// -------------------------------------------------------------------------

export function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Local calendar day key (YYYY-MM-DD). Deliberately not UTC: streaks are a local-time idea. */
export function dayKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function daysBetween(a: Date, b: Date) {
  return Math.round((startOfLocalDay(b).getTime() - startOfLocalDay(a).getTime()) / 86_400_000);
}

export interface StreakOutcome {
  streakCurrent: number;
  streakLongest: number;
  streakFreezes: number;
  freezeUsed: boolean;
  extended: boolean;
}

/**
 * A freeze covers exactly one missed day. Anything longer resets to 1 — the
 * streak should mean something.
 */
export function applyStreak(progress: ProgressSnapshot, now = new Date()): StreakOutcome {
  const gap = progress.lastActiveDate ? daysBetween(progress.lastActiveDate, now) : null;
  let streakCurrent = progress.streakCurrent;
  let streakFreezes = progress.streakFreezes;
  let freezeUsed = false;
  let extended = false;

  if (gap === null || gap < 0) {
    streakCurrent = Math.max(1, streakCurrent);
    extended = gap === null;
  } else if (gap === 0) {
    streakCurrent = streakCurrent || 1;
  } else if (gap === 1) {
    streakCurrent += 1;
    extended = true;
  } else if (gap === 2 && streakFreezes > 0) {
    streakFreezes -= 1;
    streakCurrent += 1;
    freezeUsed = true;
    extended = true;
  } else {
    streakCurrent = 1;
    extended = true;
  }

  return {
    streakCurrent,
    streakLongest: Math.max(progress.streakLongest, streakCurrent),
    streakFreezes,
    freezeUsed,
    extended,
  };
}

export interface ActivityOutcome extends ProgressSnapshot {
  xpEarned: number;
  leveledUp: boolean;
  freezeUsed: boolean;
}

export function applyActivityProgress(
  progress: ProgressSnapshot,
  kind: ActivityKind,
  now = new Date(),
  correct = true,
): ActivityOutcome {
  const streak = applyStreak(progress, now);
  const xpEarned = xpForActivity(kind, correct, streak.streakCurrent);
  const xp = progress.xp + xpEarned;
  const level = levelForXp(xp);

  return {
    xp,
    level,
    streakCurrent: streak.streakCurrent,
    streakLongest: streak.streakLongest,
    lastActiveDate: now,
    streakFreezes: streak.streakFreezes,
    dailyXpGoal: progress.dailyXpGoal,
    xpEarned,
    leveledUp: level > progress.level,
    freezeUsed: streak.freezeUsed,
  };
}

// -------------------------------------------------------------------------
// Daily quests
// -------------------------------------------------------------------------

export interface QuestTemplate {
  key: string;
  title: string;
  target: number;
  xpReward: number;
  /** Which activity increments this quest, or "xp" to track raw XP for the day. */
  tracks: ActivityKind | "xp";
}

/**
 * Quests are picked from the learner's goal and experience so the day's plan
 * reflects what they actually signed up for.
 */
export function questsForDay(goal: Goal, experience: Experience, dailyXpGoal: number): QuestTemplate[] {
  const reviewTarget = experience === "beginner" ? 5 : 10;
  const quests: QuestTemplate[] = [
    { key: "daily-xp", title: `Earn ${dailyXpGoal} XP today`, target: dailyXpGoal, xpReward: 20, tracks: "xp" },
    { key: "clear-reviews", title: `Clear ${reviewTarget} review cards`, target: reviewTarget, xpReward: 15, tracks: "review" },
  ];

  if (goal === "crud-dev") {
    quests.push({ key: "build-something", title: "Finish 2 lessons", target: 2, xpReward: 25, tracks: "lesson" });
    quests.push({ key: "hands-on", title: "Pass 1 coding exercise", target: 1, xpReward: 20, tracks: "exercise" });
  } else if (goal === "interview") {
    quests.push({ key: "drill", title: "Pass 3 coding exercises", target: 3, xpReward: 30, tracks: "exercise" });
    quests.push({ key: "deep-read", title: "Finish 1 lesson", target: 1, xpReward: 15, tracks: "lesson" });
  } else {
    quests.push({ key: "steady", title: "Finish 1 lesson", target: 1, xpReward: 15, tracks: "lesson" });
    quests.push({ key: "hands-on", title: "Pass 1 coding exercise", target: 1, xpReward: 20, tracks: "exercise" });
  }

  return quests;
}

// -------------------------------------------------------------------------
// Achievements
// -------------------------------------------------------------------------

export interface AchievementStats {
  xp: number;
  level: number;
  streakCurrent: number;
  reviewReps: number;
  completedLessons: number;
  solvedProblems: number;
  /** Distinct HARD problems with at least one passing submission. */
  hardProblemsSolved: number;
  questsCompleted: number;
}

export interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  xpReward: number;
  earned: (stats: AchievementStats) => boolean;
  /** Current value / target, for the "in progress" bars on the profile page. */
  progress: (stats: AchievementStats) => { current: number; target: number };
}

function counter(target: number, read: (stats: AchievementStats) => number) {
  return {
    earned: (stats: AchievementStats) => read(stats) >= target,
    progress: (stats: AchievementStats) => ({ current: Math.min(read(stats), target), target }),
  };
}

export const achievementDefinitions: AchievementDefinition[] = [
  {
    key: "first-forge",
    name: "First Forge",
    description: "Earn 50 XP from genuine learning activity.",
    icon: "🔥",
    tier: "bronze",
    xpReward: 10,
    ...counter(50, (s) => s.xp),
  },
  {
    key: "three-day-heat",
    name: "Three-Day Heat",
    description: "Keep a three-day learning streak alive.",
    icon: "📅",
    tier: "bronze",
    xpReward: 15,
    ...counter(3, (s) => s.streakCurrent),
  },
  {
    key: "recall-smith",
    name: "Recall Smith",
    description: "Complete five spaced-repetition reviews.",
    icon: "🧠",
    tier: "bronze",
    xpReward: 20,
    ...counter(5, (s) => s.reviewReps),
  },
  {
    key: "module-maker",
    name: "Module Maker",
    description: "Complete three lessons.",
    icon: "📦",
    tier: "bronze",
    xpReward: 15,
    ...counter(3, (s) => s.completedLessons),
  },
  {
    key: "green-tests",
    name: "All Green",
    description: "Pass five coding exercises.",
    icon: "✅",
    tier: "silver",
    xpReward: 25,
    ...counter(5, (s) => s.solvedProblems),
  },
  {
    key: "quest-runner",
    name: "Quest Runner",
    description: "Complete ten daily quests.",
    icon: "🎯",
    tier: "silver",
    xpReward: 30,
    ...counter(10, (s) => s.questsCompleted),
  },
  {
    key: "two-week-burn",
    name: "Two-Week Burn",
    description: "Hold a fourteen-day streak.",
    icon: "🌋",
    tier: "gold",
    xpReward: 60,
    ...counter(14, (s) => s.streakCurrent),
  },
  {
    key: "level-ten",
    name: "Double Digits",
    description: "Reach level 10.",
    icon: "🏆",
    tier: "gold",
    xpReward: 50,
    ...counter(10, (s) => s.level),
  },
  {
    key: "hard-mode",
    name: "Hard Mode",
    description: "Solve a HARD practice problem.",
    icon: "🧗",
    tier: "silver",
    xpReward: 40,
    ...counter(1, (s) => s.hardProblemsSolved),
  },
  {
    key: "quarter-shelf",
    name: "Quarter Shelf",
    description: "Complete twenty-five lessons.",
    icon: "📚",
    tier: "silver",
    xpReward: 40,
    ...counter(25, (s) => s.completedLessons),
  },
  {
    key: "problem-grinder",
    name: "Problem Grinder",
    description: "Solve twenty-five different practice problems.",
    icon: "⚙️",
    tier: "silver",
    xpReward: 40,
    ...counter(25, (s) => s.solvedProblems),
  },
  {
    key: "memory-palace",
    name: "Memory Palace",
    description: "Review fifty different cards at least once.",
    icon: "🏛️",
    tier: "silver",
    xpReward: 40,
    ...counter(50, (s) => s.reviewReps),
  },
  {
    key: "month-of-fire",
    name: "Month of Fire",
    description: "Hold a thirty-day streak.",
    icon: "☄️",
    tier: "gold",
    xpReward: 100,
    ...counter(30, (s) => s.streakCurrent),
  },
  {
    key: "century-shelf",
    name: "Century Shelf",
    description: "Complete one hundred lessons.",
    icon: "🗄️",
    tier: "gold",
    xpReward: 100,
    ...counter(100, (s) => s.completedLessons),
  },
  {
    key: "problem-centurion",
    name: "Problem Centurion",
    description: "Solve one hundred different practice problems.",
    icon: "💯",
    tier: "gold",
    xpReward: 100,
    ...counter(100, (s) => s.solvedProblems),
  },
  {
    key: "total-recall",
    name: "Total Recall",
    description: "Review two hundred fifty different cards at least once.",
    icon: "🧬",
    tier: "gold",
    xpReward: 100,
    ...counter(250, (s) => s.reviewReps),
  },
  {
    key: "hard-hitter",
    name: "Hard Hitter",
    description: "Solve five HARD practice problems.",
    icon: "🪨",
    tier: "gold",
    xpReward: 80,
    ...counter(5, (s) => s.hardProblemsSolved),
  },
  {
    key: "level-twenty",
    name: "Twenty Deep",
    description: "Reach level 20.",
    icon: "👑",
    tier: "gold",
    xpReward: 120,
    ...counter(20, (s) => s.level),
  },
];

export function earnedAchievementKeys(stats: AchievementStats) {
  return achievementDefinitions.filter((definition) => definition.earned(stats)).map((definition) => definition.key);
}
