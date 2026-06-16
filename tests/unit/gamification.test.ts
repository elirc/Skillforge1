import { describe, expect, it } from "vitest";
import { achievementKeysForProgress, applyActivityProgress, levelForXp } from "@/lib/gamification";

describe("gamification", () => {
  it("awards lesson XP, updates level, and starts a streak", () => {
    const result = applyActivityProgress(
      {
        xp: 40,
        level: 1,
        streakCurrent: 0,
        streakLongest: 0,
        streakFreezes: 1,
        lastActiveDate: null,
      },
      "lesson",
      new Date("2026-06-16T12:00:00Z"),
    );

    expect(result.xp).toBe(75);
    expect(result.level).toBe(levelForXp(75));
    expect(result.streakCurrent).toBe(1);
    expect(result.streakLongest).toBe(1);
  });

  it("uses a streak freeze across a missed day", () => {
    const result = applyActivityProgress(
      {
        xp: 0,
        level: 1,
        streakCurrent: 4,
        streakLongest: 4,
        streakFreezes: 1,
        lastActiveDate: new Date("2026-06-14T12:00:00Z"),
      },
      "review",
      new Date("2026-06-16T12:00:00Z"),
    );

    expect(result.streakCurrent).toBe(5);
    expect(result.streakFreezes).toBe(0);
  });

  it("unlocks achievements from real progress", () => {
    const keys = achievementKeysForProgress(
      {
        xp: 90,
        level: 2,
        streakCurrent: 3,
        streakLongest: 3,
        streakFreezes: 0,
        lastActiveDate: new Date(),
      },
      5,
      3,
    );

    expect(keys).toEqual(expect.arrayContaining(["first-forge", "three-day-heat", "recall-smith", "module-maker"]));
  });
});
