export type Job = { id: string; arrival: number; duration: number; priority: number };

export function schedule(jobs: Job[], workers: number) {
  // Waiting jobs live in a priority queue ordered by (priority desc, arrival asc, id asc).
  // At time t: admit arrivals, give each free worker (lowest number first) the best waiting job,
  // then jump t to the next arrival or job end.
}
