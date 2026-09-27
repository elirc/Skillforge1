import type { TestCase } from "@content/_authoring/types";

export const functionName = "checkoutTotals";

export const tests: TestCase[] = [
  {
    name: "standard shipping under 50 costs 4.99",
    args: [[{ items: [{ price: 10, qty: 2 }], shipping: "standard", coupon: null }]],
    expected: [{ subtotal: 20, discount: 0, shipping: 4.99, total: 24.99 }],
  },
  {
    name: "standard shipping is free from 50",
    args: [[{ items: [{ price: 25, qty: 2 }], shipping: "standard", coupon: null }]],
    expected: [{ subtotal: 50, discount: 0, shipping: 0, total: 50 }],
  },
  {
    name: "express and pickup use their own strategies",
    args: [[
      { items: [{ price: 5, qty: 1 }], shipping: "express", coupon: null },
      { items: [{ price: 5, qty: 1 }], shipping: "pickup", coupon: null },
    ]],
    expected: [
      { subtotal: 5, discount: 0, shipping: 12.5, total: 17.5 },
      { subtotal: 5, discount: 0, shipping: 0, total: 5 },
    ],
  },
  {
    name: "SAVE10 takes 10% off, which can push standard shipping back to paid",
    args: [[{ items: [{ price: 52, qty: 1 }], shipping: "standard", coupon: "SAVE10" }]],
    expected: [{ subtotal: 52, discount: 5.2, shipping: 4.99, total: 51.79 }],
  },
  {
    name: "FLAT5 never discounts more than the subtotal",
    args: [[{ items: [{ price: 3, qty: 1 }], shipping: "pickup", coupon: "FLAT5" }]],
    expected: [{ subtotal: 3, discount: 3, shipping: 0, total: 0 }],
  },
  {
    name: "unknown shipping and coupons are reported as errors",
    args: [[
      { items: [{ price: 1, qty: 1 }], shipping: "drone", coupon: null },
      { items: [{ price: 1, qty: 1 }], shipping: "pickup", coupon: "FREE100" },
    ]],
    expected: [{ error: "unknown shipping: drone" }, { error: "unknown coupon: FREE100" }],
  },
  {
    name: "inherited object keys are not strategies",
    args: [[{ items: [{ price: 1, qty: 1 }], shipping: "toString", coupon: null }]],
    expected: [{ error: "unknown shipping: toString" }],
    hidden: true,
  },
  {
    name: "money is rounded to cents",
    args: [[{ items: [{ price: 0.1, qty: 3 }], shipping: "pickup", coupon: null }]],
    expected: [{ subtotal: 0.3, discount: 0, shipping: 0, total: 0.3 }],
    hidden: true,
  },
];
