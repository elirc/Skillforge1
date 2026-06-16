import { describe, expect, it } from "vitest";
import { scheduleReview, type SrsReviewState } from "@/lib/srs/scheduler";

const base: SrsReviewState = {
  dueAt: new Date("2026-06-16T12:00:00Z"),
  stability: 1,
  difficulty: 5,
  interval: 0,
  lapses: 0,
  reps: 0,
  lastReviewedAt: null,
  state: "new",
};

describe("scheduleReview", () => {
  it("schedules successful recall into the future and increments reps", () => {
    const now = new Date("2026-06-16T12:00:00Z");
    const result = scheduleReview(base, "good", now);

    expect(result.reps).toBe(1);
    expect(result.lapses).toBe(0);
    expect(result.interval).toBeGreaterThanOrEqual(1);
    expect(result.dueAt.getTime()).toBeGreaterThan(now.getTime());
    expect(result.state).toMatch(/learning|review/);
  });

  it("keeps failed recall close and records a lapse", () => {
    const now = new Date("2026-06-16T12:00:00Z");
    const result = scheduleReview({ ...base, reps: 3, stability: 6, interval: 6, state: "review" }, "again", now);

    expect(result.lapses).toBe(1);
    expect(result.interval).toBe(0);
    expect(result.state).toBe("relearning");
    expect(result.dueAt.getTime() - now.getTime()).toBe(10 * 60 * 1000);
  });

  it("gives easy recall a longer interval than hard recall", () => {
    const now = new Date("2026-06-16T12:00:00Z");
    const hard = scheduleReview(base, "hard", now);
    const easy = scheduleReview(base, "easy", now);

    expect(easy.interval).toBeGreaterThan(hard.interval);
  });
});
