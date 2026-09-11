import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

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

// Each knowledge check renders as a card: <div class="rounded-lg ..."><div><h3>{prompt}</h3>...</div>...</div>.
// Scoping to the card by its prompt keeps the MCQ / cloze / code steps independent of render order.
function checkCard(page: Page, prompt: RegExp) {
  return page.getByRole("heading", { level: 3, name: prompt }).locator("xpath=../..");
}

test("local learner takes a lesson and completes a review", async ({ page }) => {
  // Track catalog -> course
  await page.goto("/tracks", { timeout: NAV_TIMEOUT });
  await expect(page.getByRole("heading", { name: "Tracks" })).toBeVisible({ timeout: NAV_TIMEOUT });
  // The course can be listed twice (under "Continue learning" and in the full grid); either goes to the same place.
  await page.getByRole("link", { name: /JavaScript Foundations/ }).first().click();
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

  // MCQ check
  const mcq = checkCard(page, /Which declaration should you usually choose/);
  const constChoice = mcq.getByRole("button", { name: "const", exact: true });
  // A selected choice is highlighted; asserting that proves the click reached React state.
  await expect(async () => {
    await constChoice.click();
    await expect(constChoice).toHaveClass(/border-emerald-500/);
  }).toPass({ timeout: 60_000 });
  await mcq.getByRole("button", { name: "Check" }).click();
  await expect(mcq.getByText("Correct")).toBeVisible();

  // Cloze check
  const cloze = checkCard(page, /Complete the sentence about bindings/);
  const blank = cloze.getByPlaceholder(/A variable gives a value a ____/);
  await blank.fill("name");
  await expect(blank).toHaveValue("name");
  await cloze.getByRole("button", { name: "Check" }).click();
  await expect(cloze.getByText("Correct")).toBeVisible();

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
  // Grading advances the queue (or finishes it when this was the last card).
  await expect(page.getByText(/Card 2 of \d+|Review session complete/)).toBeVisible();
});
