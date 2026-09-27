import type { TestCase } from "@content/_authoring/types";

export const functionName = "assignMeetingRooms";

export const tests: TestCase[] = [
  {
    name: "back-to-back meetings share a room",
    args: [
      [
        { id: "standup", start: 540, end: 600 },
        { id: "design", start: 570, end: 660 },
        { id: "1on1", start: 600, end: 630 },
      ],
    ],
    expected: {
      roomCount: 2,
      assignments: [
        { id: "standup", room: 1 },
        { id: "design", room: 2 },
        { id: "1on1", room: 1 },
      ],
    },
  },
  {
    name: "picks the lowest-numbered free room",
    args: [
      [
        { id: "a", start: 0, end: 10 },
        { id: "b", start: 0, end: 5 },
        { id: "c", start: 0, end: 20 },
        { id: "d", start: 6, end: 8 },
        { id: "e", start: 12, end: 13 },
      ],
    ],
    expected: {
      roomCount: 3,
      assignments: [
        { id: "a", room: 1 },
        { id: "b", room: 2 },
        { id: "c", room: 3 },
        { id: "d", room: 2 },
        { id: "e", room: 1 },
      ],
    },
  },
  {
    name: "processes by start time but reports in input order",
    args: [
      [
        { id: "late", start: 100, end: 200 },
        { id: "early", start: 0, end: 150 },
      ],
    ],
    expected: {
      roomCount: 2,
      assignments: [
        { id: "late", room: 2 },
        { id: "early", room: 1 },
      ],
    },
  },
  {
    name: "disjoint meetings need one room",
    args: [
      [
        { id: "x", start: 0, end: 30 },
        { id: "y", start: 30, end: 60 },
        { id: "z", start: 90, end: 120 },
      ],
    ],
    expected: {
      roomCount: 1,
      assignments: [
        { id: "x", room: 1 },
        { id: "y", room: 1 },
        { id: "z", room: 1 },
      ],
    },
  },
  { name: "no meetings needs no rooms", args: [[]], expected: { roomCount: 0, assignments: [] } },
  {
    name: "equal starts keep input order",
    args: [
      [
        { id: "second", start: 60, end: 90 },
        { id: "first", start: 0, end: 60 },
        { id: "third", start: 60, end: 70 },
      ],
    ],
    expected: {
      roomCount: 2,
      assignments: [
        { id: "second", room: 1 },
        { id: "first", room: 1 },
        { id: "third", room: 2 },
      ],
    },
  },
  {
    name: "fully nested meetings need one room each",
    args: [
      [
        { id: "a", start: 0, end: 100 },
        { id: "b", start: 10, end: 90 },
        { id: "c", start: 20, end: 80 },
        { id: "d", start: 30, end: 70 },
      ],
    ],
    expected: {
      roomCount: 4,
      assignments: [
        { id: "a", room: 1 },
        { id: "b", room: 2 },
        { id: "c", room: 3 },
        { id: "d", room: 4 },
      ],
    },
    hidden: true,
  },
  {
    name: "when several rooms free up at once the lowest wins",
    args: [
      [
        { id: "a", start: 0, end: 50 },
        { id: "b", start: 0, end: 30 },
        { id: "c", start: 0, end: 30 },
        { id: "d", start: 50, end: 60 },
        { id: "e", start: 50, end: 60 },
      ],
    ],
    expected: {
      roomCount: 3,
      assignments: [
        { id: "a", room: 1 },
        { id: "b", room: 2 },
        { id: "c", room: 3 },
        { id: "d", room: 1 },
        { id: "e", room: 2 },
      ],
    },
    hidden: true,
  },
];
