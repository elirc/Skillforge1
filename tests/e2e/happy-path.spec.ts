import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { tmpdir } from "node:os";

const owned=process.env.SKILLFORGE_E2E_TEST_DB;
if(!owned || process.env.DATABASE_URL!==`file:${owned.replaceAll("\\","/")}` || path.dirname(path.dirname(path.resolve(owned)))!==path.resolve(tmpdir()) || !path.basename(path.dirname(owned)).startsWith("skillforge-browser-")) throw new Error("Run npm run test:e2e; these tests require a helper-owned temporary database.");

const LESSON_TITLE = "Variables Hold Values";
const LOCAL_USER_ID = "local";

// Against `next dev`, each route is compiled on first request and that compile
// can take well over a minute on a slow machine. Assertions that follow a
// navigation get this budget; everything else keeps the default expect timeout.
const NAV_TIMEOUT = 180_000;

// The journey below completes a lesson, and "Complete lesson" is disabled once
// a completion row exists. So each run starts by removing ONLY this lesson's
// completion and its review cards for the local learner (a handful of rows;
// nothing else in the seeded database is touched). Completing the lesson then
// re-seeds those cards as due, which is what the Reviews step relies on.
test.beforeEach(async () => {
  const prisma = new PrismaClient();
  try {
    const lesson = await prisma.lesson.findFirstOrThrow({
      where: { title: LESSON_TITLE },
      include: { knowledgeItems: { select: { id: true } } },
    });
    await prisma.lessonCompletion.deleteMany({ where: { userId: LOCAL_USER_ID, lessonId: lesson.id } });
    await prisma.reviewState.deleteMany({
      where: { userId: LOCAL_USER_ID, knowledgeItemId: { in: lesson.knowledgeItems.map((item) => item.id) } },
    });
  } finally {
    await prisma.$disconnect();
  }
});

// Each knowledge check renders as a card: <div class="rounded-lg ..."><div><h3>{prompt}</h3><badge/></div>...</div>.
// Prompts go through markdown-lite, so `code` spans render as <code> inside the <h3>; the accessible
// name is still the plain text. Scoping to the card by its prompt keeps the MCQ / cloze / code steps
// independent of render order.
function checkCard(page: Page, prompt: RegExp) {
  return page.getByRole("heading", { level: 3, name: prompt }).locator("xpath=../..");
}

test("local learner takes a lesson and completes a review", async ({ page }) => {
  // Track catalog -> course
  await page.goto("/tracks", { timeout: NAV_TIMEOUT });
  await expect(page.getByRole("heading", { name: "Tracks" })).toBeVisible({ timeout: NAV_TIMEOUT });
  await page.screenshot({ path: "test-results/tracks-desktop.png", fullPage: true });
  // The course can be listed twice (under "Continue learning" and in the full grid); either goes to the same place.
  await page.getByRole("link", { name: /JavaScript Foundations/ }).last().click();
  await page.waitForURL(/\/courses\/javascript-foundations$/, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole("heading", { name: "JavaScript Foundations" })).toBeVisible({ timeout: NAV_TIMEOUT });

  // Course -> lesson
  await page.getByRole("link", { name: LESSON_TITLE }).click();
  await page.waitForURL(/\/courses\/javascript-foundations\/lessons\//, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole("heading", { name: LESSON_TITLE })).toBeVisible({ timeout: NAV_TIMEOUT });
  const completeButton = page.getByRole("button", { name: "Complete lesson" });
  await expect(completeButton).toBeDisabled();

  // Hydration gate. The checks are server-rendered before React attaches their
  // handlers, and hydrating this page (it bundles CodeMirror) is slow here. The
  // editor's .cm-content only exists once the client tree has mounted, so once
  // it is visible the MCQ / cloze buttons below are live too.
  await expect(page.locator(".cm-content")).toBeVisible({ timeout: NAV_TIMEOUT });
  await page.screenshot({ path: "test-results/lesson-desktop.png", fullPage: true });

  // MCQ check
  const mcq = checkCard(page, /Which declaration should you usually choose/);
  const constChoice = mcq.getByRole("button", { name: "const", exact: true });
  // A selected choice sets aria-pressed; asserting that proves the click reached React state.
  await expect(async () => {
    await constChoice.click();
    await expect(constChoice).toHaveAttribute("aria-pressed", "true");
  }).toPass({ timeout: 60_000 });
  await mcq.getByRole("button", { name: "Check" }).click();
  await expect(mcq.getByText("Correct", { exact: true })).toBeVisible();
  // A correct MCQ answer settles the card: choices lock and the explanation appears.
  await expect(constChoice).toBeDisabled();
  await expect(mcq.getByText(/binding itself should stay attached/)).toBeVisible();

  // Cloze check
  const cloze = checkCard(page, /Complete the sentence about bindings/);
  const blank = cloze.getByPlaceholder(/A variable gives a value a ____/);
  const clozeCheck = cloze.getByRole("button", { name: "Check" });
  // Two misses unlock "Reveal answer"; the learner keeps trying instead of revealing.
  for (const guess of ["label", "type"]) {
    await blank.fill(guess);
    await clozeCheck.click();
    await expect(cloze.getByText("Not quite. Try again.")).toBeVisible();
  }
  await expect(cloze.getByRole("button", { name: "Reveal answer" })).toBeVisible();
  await blank.fill("name");
  await expect(blank).toHaveValue("name");
  await clozeCheck.click();
  await expect(cloze.getByText("Correct", { exact: true })).toBeVisible();
  // Answering correctly settles the card, so the reveal offer goes away.
  await expect(cloze.getByRole("button", { name: "Reveal answer" })).toHaveCount(0);

  // Code check: replace the starter code in the CodeMirror editor and run the tests
  const code = checkCard(page, /Implement addXp/);
  const editor = code.locator(".cm-content");
  await expect(editor).toBeVisible();
  await editor.click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("function addXp(current, earned) { return current + earned; }");
  await expect(editor).toContainText("return current + earned");
  await code.getByRole("button", { name: "Run" }).click();
  await expect(code.getByText("Pass: adds a small reward")).toBeVisible();
  await expect(code.getByText("Pass: handles zero current XP")).toBeVisible();

  // Complete the lesson (only enabled once the code check has passed)
  await expect(completeButton).toBeEnabled();
  await completeButton.click();
  await expect(page.getByRole("button", { name: "Completed" })).toBeDisabled();

  // Reviews: completion seeded this lesson's cards as due; reveal and grade one
  await page.locator("header").getByRole("link", { name: /Reviews/ }).click();
  await page.waitForURL(/\/reviews$/, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole("heading", { name: "Reviews due" })).toBeVisible({ timeout: NAV_TIMEOUT });
  await expect(page.getByText(/Card 1 of \d+/)).toBeVisible();
  await page.getByRole("button", { name: "Reveal answer" }).click();
  await expect(page.getByText(/^Answer:/)).toBeVisible();
  await page.getByRole("button", { name: "Good", exact: true }).click();
  // Grading advances the queue (or finishes it when this was the last card). The
  // server decides correctness; nothing was answered here, so when the session
  // sidebar is still showing, its verdict for the graded card must be present.
  await expect(page.getByText(/Card 2 of \d+|Review session complete/)).toBeVisible();
  if (await page.getByText(/Card 2 of \d+/).isVisible()) {
    await expect(page.getByText(/^Last card:/)).toBeVisible();
  }

  // Review by concept tag: this lesson's cards are all tagged #variables.
  await page.goto("/reviews?tag=variables", { timeout: NAV_TIMEOUT });
  await expect(page.getByRole("heading", { name: "Reviews due" })).toBeVisible({ timeout: NAV_TIMEOUT });
  await expect(page.getByText(/Filtered to\s*#variables/)).toBeVisible();
  // A new filter starts its own session from the first card (or shows the tag's empty state).
  await expect(page.getByText(/Card 1 of \d+|Nothing due for #variables/)).toBeVisible();
  await page.getByRole("link", { name: "Clear", exact: true }).click();
  await page.waitForURL(/\/reviews$/, { timeout: NAV_TIMEOUT });

  // Concept mastery page renders.
  await page.goto("/mastery", { timeout: NAV_TIMEOUT });
  await expect(page.getByRole("heading", { level: 1, name: "Concept mastery" })).toBeVisible({ timeout: NAV_TIMEOUT });
  await expect(page.getByText("#variables").first()).toBeVisible();
  await page.screenshot({ path: "test-results/mastery-desktop.png", fullPage: true });
  await page.goto("/", { timeout: NAV_TIMEOUT });
  await page.screenshot({ path: "test-results/dashboard-desktop.png", fullPage: true });
});
