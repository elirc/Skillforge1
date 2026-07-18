interface Learner {
  name: string;
  streak: number;
}

export function withStreak(learner: Learner, streak: number): Learner {
  return { ...learner, streak };
}
