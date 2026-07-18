interface Learner {
  name: string;
  streak: number;
}

export function getStreak(learner: Learner): number {
  return learner.streak;
}
