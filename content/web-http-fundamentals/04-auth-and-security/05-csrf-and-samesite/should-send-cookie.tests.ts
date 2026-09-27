import type { TestCase } from "@content/_authoring/types";

export const functionName = "shouldSendCookie";

const lax = { sameSite: "Lax", secure: true };
const strict = { sameSite: "Strict", secure: true };
const none = { sameSite: "None", secure: true };

const sameSite = { pageSite: "bank.test", targetSite: "bank.test", method: "POST", topLevelNavigation: false, https: true };
const crossLinkClick = { pageSite: "mail.test", targetSite: "bank.test", method: "GET", topLevelNavigation: true, https: true };
const crossFormPost = { pageSite: "evil.test", targetSite: "bank.test", method: "POST", topLevelNavigation: true, https: true };
const crossFetch = { pageSite: "evil.test", targetSite: "bank.test", method: "GET", topLevelNavigation: false, https: true };

export const tests: TestCase[] = [
  { name: "same-site requests carry the cookie", args: [strict, sameSite], expected: true },
  { name: "Lax cookies follow a cross-site link click", args: [lax, crossLinkClick], expected: true },
  { name: "Lax cookies are NOT sent on a cross-site form POST", args: [lax, crossFormPost], expected: false },
  { name: "Strict cookies are not sent even on a link click", args: [strict, crossLinkClick], expected: false },
  { name: "Lax cookies are not sent on a cross-site fetch", args: [lax, crossFetch], expected: false },
  { name: "None cookies are sent cross-site (CSRF tokens needed!)", args: [none, crossFormPost], expected: true },
  { name: "a Secure cookie is not sent over http", args: [lax, { ...sameSite, https: false }], expected: false },
  { name: "SameSite=None without Secure is dropped", args: [{ sameSite: "None", secure: false }, { ...crossFetch, https: false }], expected: false, hidden: true },
  { name: "a non-Secure Lax cookie still works same-site over http", args: [{ sameSite: "Lax", secure: false }, { ...sameSite, https: false }], expected: true, hidden: true },
];
