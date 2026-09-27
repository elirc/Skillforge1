import type { TestCase } from "@content/_authoring/types";

export const functionName = "replayCart";

const mug = { type: "add", sku: "MUG", name: "Mug", unitCents: 800 };
const lamp = { type: "add", sku: "LAMP", name: "Lamp", unitCents: 1999 };

export const tests: TestCase[] = [
  {
    name: "an empty replay is an empty cart",
    args: [[]],
    expected: { items: [], couponCode: null, subtotalCents: 0, discountCents: 0, totalCents: 0 },
  },
  {
    name: "adding the same sku twice increases qty",
    args: [[mug, { ...mug, qty: 2 }]],
    expected: {
      items: [{ sku: "MUG", name: "Mug", unitCents: 800, qty: 3 }],
      couponCode: null,
      subtotalCents: 2400,
      discountCents: 0,
      totalCents: 2400,
    },
  },
  {
    name: "SAVE10 takes 10 percent off, rounded down",
    args: [[lamp, { type: "applyCoupon", code: "save10" }]],
    expected: {
      items: [{ sku: "LAMP", name: "Lamp", unitCents: 1999, qty: 1 }],
      couponCode: "SAVE10",
      subtotalCents: 1999,
      discountCents: 199,
      totalCents: 1800,
    },
  },
  {
    name: "FLAT5 needs a 2000 cent subtotal",
    args: [[mug, { type: "applyCoupon", code: "FLAT5" }]],
    expected: {
      items: [{ sku: "MUG", name: "Mug", unitCents: 800, qty: 1 }],
      couponCode: "FLAT5",
      subtotalCents: 800,
      discountCents: 0,
      totalCents: 800,
    },
  },
  {
    name: "a coupon starts applying once the cart qualifies",
    args: [[mug, { type: "applyCoupon", code: "FLAT5" }, { type: "setQty", sku: "MUG", qty: 3 }]],
    expected: {
      items: [{ sku: "MUG", name: "Mug", unitCents: 800, qty: 3 }],
      couponCode: "FLAT5",
      subtotalCents: 2400,
      discountCents: 500,
      totalCents: 1900,
    },
  },
  {
    name: "setQty to zero removes the line",
    args: [[mug, lamp, { type: "setQty", sku: "MUG", qty: 0 }]],
    expected: {
      items: [{ sku: "LAMP", name: "Lamp", unitCents: 1999, qty: 1 }],
      couponCode: null,
      subtotalCents: 1999,
      discountCents: 0,
      totalCents: 1999,
    },
  },
  {
    name: "unknown coupons and unknown action types are ignored",
    args: [[mug, { type: "applyCoupon", code: "FREE100" }, { type: "giftWrap", sku: "MUG" }]],
    expected: {
      items: [{ sku: "MUG", name: "Mug", unitCents: 800, qty: 1 }],
      couponCode: null,
      subtotalCents: 800,
      discountCents: 0,
      totalCents: 800,
    },
  },
  {
    name: "clear empties items and drops the coupon",
    args: [[mug, { type: "applyCoupon", code: "SAVE10" }, { type: "clear" }, lamp]],
    expected: {
      items: [{ sku: "LAMP", name: "Lamp", unitCents: 1999, qty: 1 }],
      couponCode: null,
      subtotalCents: 1999,
      discountCents: 0,
      totalCents: 1999,
    },
    hidden: true,
  },
  {
    name: "re-adding keeps the original name and price",
    args: [[mug, { type: "add", sku: "MUG", name: "Big Mug", unitCents: 1200 }, { type: "remove", sku: "NOPE" }]],
    expected: {
      items: [{ sku: "MUG", name: "Mug", unitCents: 800, qty: 2 }],
      couponCode: null,
      subtotalCents: 1600,
      discountCents: 0,
      totalCents: 1600,
    },
    hidden: true,
  },
  {
    name: "removeCoupon restores the full total",
    args: [[lamp, lamp, { type: "applyCoupon", code: " flat5 " }, { type: "removeCoupon" }]],
    expected: {
      items: [{ sku: "LAMP", name: "Lamp", unitCents: 1999, qty: 2 }],
      couponCode: null,
      subtotalCents: 3998,
      discountCents: 0,
      totalCents: 3998,
    },
    hidden: true,
  },
];
