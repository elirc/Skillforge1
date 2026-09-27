// The parameters are annotated for you: TypeScript now knows baseXp and
// streakDays are numbers and isReview is a boolean, so it will flag any
// caller that passes the wrong kind of value.
export function awardXp(baseXp: number, streakDays: number, isReview: boolean) {
  // 1. Add a streak bonus of 5 XP per streak day, capped at 10 days (50 XP).
  // 2. Reviews earn half: Math.floor the total when isReview is true.
  // 3. Never award less than 0.
}
