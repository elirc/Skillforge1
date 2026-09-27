export type Lane = [from: string, to: string, cost: number];

export function cheapestRoute(lanes: Lane[], start: string, goal: string, closed: string[]) {
  // Dijkstra: always expand the cheapest unfinished warehouse, relax its lanes,
  // and rebuild the path from "came from" links. Return null when unreachable.
}
