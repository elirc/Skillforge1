import { describe, expect, it } from "vitest";
import {
  applyActivityProgress,
  applyStreak,
  dayKey,
  earnedAchievementKeys,
  levelForXp,
  levelInfo,
  questsForDay,
  streakMultiplier,
  xpForActivity,
  xpForLevel,
  type ProgressSnapshot,
} from "@/lib/gamification";

function snapshot(overrides: Partial<ProgressSnapshot> = {}): ProgressSnapshot {
  return {
    xp: 0,
    level: 1,
    streakCurrent: 0,
    streakLongest: 0,
    streakFreezes: 1,
    lastActiveDate: null,
    dailyXpGoal: 60,
    ...overrides,
  };
}

describe("xp and levels", () => {
  it("awards lesson XP, updates level, and starts a streak", () => {
    const result = applyActivityProgress(snapshot({ xp: 40 }), "lesson", new Date(2026, 5, 16, 12));

    expect(result.xpEarned).toBe(35);
    expect(result.xp).toBe(75);
    expect(result.level).toBe(levelForXp(75));
    expect(result.streakCurrent).toBe(1);
    expect(result.streakLongest).toBe(1);
  });

  it("pays less for a failed review than a passed one", () => {
    expect(xpForActivity("review", false)).toBeLessThan(xpForActivity("review", true));
    expect(xpForActivity("review", false)).toBeGreaterThan(0);
  });

  it("pays nothing for repeat credit on a lesson or exercise", () => {
    // `correct: false` is how the actions signal "already earned this".
    // Paying full price here let a learner farm XP by re-completing a lesson.
    expect(xpForActivity("lesson", false)).toBe(0);
    expect(xpForActivity("exercise", false)).toBe(0);
    expect(xpForActivity("lesson", false, 30)).toBe(0);
    expect(xpForActivity("lesson", true)).toBe(35);
  });

  it("scales XP with the streak but caps the multiplier", () => {
    expect(streakMultiplier(0)).toBe(1);
    expect(streakMultiplier(10)).toBeCloseTo(1.2);
    expect(streakMultiplier(500)).toBe(1.5);
  });

  it("keeps the level curve and its inverse consistent", () => {
    for (const level of [1, 2, 5, 12, 30]) {
      expect(levelForXp(xpForLevel(level))).toBe(level);
    }
  });

  it("reports progress within the current level", () => {
    const info = levelInfo(xpForLevel(4) + 10);
    expect(info.level).toBe(4);
    expect(info.xpIntoLevel).toBe(10);
    expect(info.progressPct).toBeGreaterThan(0);
    expect(info.progressPct).toBeLessThan(100);
    expect(info.rank).toBeTruthy();
  });

  it("flags a level-up when the award crosses a threshold", () => {
    const result = applyActivityProgress(snapshot({ xp: xpForLevel(2) - 1, level: 1 }), "lesson");
    expect(result.leveledUp).toBe(true);
  });
});

describe("streaks", () => {
  it("extends on a consecutive day", () => {
    const result = applyStreak(
      snapshot({ streakCurrent: 4, lastActiveDate: new Date(2026, 5, 15, 12) }),
      new Date(2026, 5, 16, 8),
    );
    expect(result.streakCurrent).toBe(5);
    expect(result.freezeUsed).toBe(false);
  });

  it("does not double-count two sessions on the same day", () => {
    const result = applyStreak(
      snapshot({ streakCurrent: 3, lastActiveDate: new Date(2026, 5, 16, 9) }),
      new Date(2026, 5, 16, 21),
    );
    expect(result.streakCurrent).toBe(3);
  });

  it("spends a freeze to cover exactly one missed day", () => {
    const result = applyStreak(
      snapshot({ streakCurrent: 4, streakFreezes: 1, lastActiveDate: new Date(2026, 5, 14, 12) }),
      new Date(2026, 5, 16, 12),
    );
    expect(result.streakCurrent).toBe(5);
    expect(result.streakFreezes).toBe(0);
    expect(result.freezeUsed).toBe(true);
  });

  it("resets after a longer gap even with a freeze in hand", () => {
    const result = applyStreak(
      snapshot({ streakCurrent: 9, streakLongest: 9, streakFreezes: 2, lastActiveDate: new Date(2026, 5, 10, 12) }),
      new Date(2026, 5, 16, 12),
    );
    expect(result.streakCurrent).toBe(1);
    expect(result.streakFreezes).toBe(2);
    expect(result.streakLongest).toBe(9);
  });

  it("keys days on local time", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("quests", () => {
  it("tracks the learner's own daily XP goal", () => {
    const quests = questsForDay("crud-dev", "beginner", 120);
    const xpQuest = quests.find((quest) => quest.key === "daily-xp");
    expect(xpQuest?.target).toBe(120);
    expect(xpQuest?.tracks).toBe("xp");
  });

  it("gives interview prep a heavier exercise load than the CRUD track", () => {
    const interview = questsForDay("interview", "junior", 60).find((quest) => quest.tracks === "exercise");
    const crud = questsForDay("crud-dev", "junior", 60).find((quest) => quest.tracks === "exercise");
    expect(interview!.target).toBeGreaterThan(crud!.target);
  });
});

describe("achievements", () => {
  it("unlocks from real progress", () => {
    const keys = earnedAchievementKeys({
      xp: 90,
      level: 2,
      streakCurrent: 3,
      reviewReps: 5,
      completedLessons: 3,
      solvedProblems: 0,
      questsCompleted: 0,
    });

    expect(keys).toEqual(expect.arrayContaining(["first-forge", "three-day-heat", "recall-smith", "module-maker"]));
    expect(keys).not.toContain("green-tests");
  });

  it("unlocks nothing on a fresh profile", () => {
    const keys = earnedAchievementKeys({
      xp: 0,
      level: 1,
      streakCurrent: 0,
      reviewReps: 0,
      completedLessons: 0,
      solvedProblems: 0,
      questsCompleted: 0,
    });

    expect(keys).toEqual([]);
  });
});
