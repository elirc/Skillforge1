import type { TestCase } from "@content/_authoring/types";

export const functionName = "commonFreeSlots";

const twoPeople = [
  [
    [540, 600],
    [720, 780],
  ],
  [
    [630, 660],
    [900, 960],
  ],
];

export const tests: TestCase[] = [
  {
    name: "finds the gaps between everyone's meetings",
    args: [twoPeople, [540, 1020], 30],
    expected: [
      [600, 630],
      [660, 720],
      [780, 900],
      [960, 1020],
    ],
  },
  {
    name: "drops gaps shorter than the duration",
    args: [twoPeople, [540, 1020], 45],
    expected: [
      [660, 720],
      [780, 900],
      [960, 1020],
    ],
  },
  {
    name: "merges overlapping and touching busy blocks",
    args: [
      [
        [[600, 700]],
        [
          [650, 750],
          [750, 800],
        ],
      ],
      [540, 900],
      30,
    ],
    expected: [
      [540, 600],
      [800, 900],
    ],
  },
  {
    name: "clips busy time outside the working day",
    args: [
      [
        [
          [480, 570],
          [1000, 1100],
        ],
      ],
      [540, 1020],
      15,
    ],
    expected: [[570, 1000]],
  },
  { name: "an empty calendar frees the whole day", args: [[[], []], [540, 600], 60], expected: [[540, 600]] },
  { name: "a window shorter than the duration is not offered", args: [[[]], [540, 600], 61], expected: [] },
  { name: "a fully booked day has no slots", args: [[[[500, 1100]]], [540, 1020], 5], expected: [] },
  {
    name: "a short block nested inside a long one does not reopen time",
    args: [
      [
        [[600, 900]],
        [
          [650, 700],
          [1000, 1010],
        ],
      ],
      [540, 1020],
      10,
    ],
    expected: [
      [540, 600],
      [900, 1000],
      [1010, 1020],
    ],
    hidden: true,
  },
  {
    name: "zero-length blocks do not split a window",
    args: [[[[600, 600]]], [540, 720], 120],
    expected: [[540, 720]],
    hidden: true,
  },
  {
    name: "handles unsorted blocks",
    args: [
      [
        [
          [900, 960],
          [540, 600],
        ],
      ],
      [540, 1020],
      30,
    ],
    expected: [
      [600, 900],
      [960, 1020],
    ],
    hidden: true,
  },
];
