**Skillforge application and curriculum review — 26 September 2026**

Skillforge has a useful foundation: local ownership of progress, file-authored courses, runnable exercises, a review queue, targeted practice, mastery summaries, and progress backup. The best next investment is a clearer learning path and more authentic practice. The repository already contains substantial content that the current database does not expose.

This review prioritizes the C#/.NET-and-SQL goal stated in the README. It covers the application implementation, a complete inventory of authored courses and problems, representative lesson/explanation quality, progression, persistence, and testing. It does not certify the correctness of every reference solution. The broader browser screenshot pass timed out loading the dashboard; visual-layout recommendations below are based on component inspection. The earlier browser happy-path test passed.

Current content inventory:

| Course | Authored lessons | Lessons in current database | Best next investment |
| --- | ---: | ---: | --- |
| JavaScript Foundations | 36 | 28 | Expand thin explanations with worked examples and debugging practice |
| JavaScript Patterns | 20 | 16 | Execute real promises and asynchronous functions, rather than only scheduling simulations |
| TypeScript Starter | 29 | 25 | Preserve TypeScript source and grade compiler diagnostics alongside runtime behavior |
| C# and .NET Interview Prep | 32 | 18 | Add a beginner prerequisite track and real ASP.NET Core/EF Core project labs |
| SQL Foundations | 29 | 20 | Convert existing material into executable SQL labs |
| Python Thinking | 19 | 10 | Clearly label reading-only practice; add execution later if Python remains a priority |
| React for CRUD UIs | 18 | 0 | Surface the authored course and add actual component rendering and interaction tests |
| Web and HTTP Fundamentals | 21 | 0 | Surface the authored course and connect it to a request/response playground |
| Total | 204 | 117 | |

There are 449 authored standalone problems, versus 431 stored in the database: 223 EASY, 194 MEDIUM, and 32 HARD. The repository therefore has 87 more lessons and 18 more problems than the installed curriculum. These counts describe authored files, not a new execution-validation result.

Before adding another large batch, validate the new content against a database copy, create a progress backup, and synchronize the installed curriculum. Add a visible content-version/status page showing installed versus available content and a preview of updates. Ordinary seeding and content reordering have different risks: the current seed identifies lessons and knowledge items by position. Introduce immutable authored IDs and a migration path before reorganizing published material. See [seed identity](../prisma/seed.ts).

The most urgent learning-quality findings are:

1. **All 408 authored MCQs place the correct answer first.** Both the lesson player and review UI render choices in authored order. A learner can select the first option without understanding anything. Shuffle choices once per displayed card, preserve that order while answering, and add a content-quality check for answer-position bias. Also improve distractors so they represent plausible misconceptions. See [lesson player](../src/features/lessons/lesson-player.tsx) and [review session](../src/features/review/review-session.tsx).
2. **391 of 449 problems use the same generic explanation template.** The boilerplate mostly repeats the prompt and tells the learner to be clear and test edge cases. Replace it with a concrete example trace, the key insight, why a tempting approach fails, complexity where relevant, and a worked solution revealed on request. Retain useful variants as extra drills under a canonical problem instead of treating every variant as an equally important milestone.
3. **The earliest JavaScript lessons are often too thin for beginners.** The median instructional-block length is about 47 whitespace-delimited words, counting code too. “Filter Keeps Matches,” for example, has one 12-word prose block and no worked example. Shortness itself is fine; missing explanation is the problem. Show input, callback decisions, resulting output, and the difference from map before asking learners to implement it.
4. **Curriculum labels and executable practice frequently differ.** Of 58 C#-labelled standalone problems, only 8 have C# exercise files; the other 50 execute JavaScript. TypeScript source is transpiled during authoring, so the editor cannot assess the type skill the course teaches. React exercises test plain functions rather than mounted components. SQL exercises model queries over arrays. Make “Topic” and “You will write” explicit until genuine runtimes are available.
5. **Completion does not reliably mean demonstrated understanding.** MCQ/CLOZE checks do not gate lesson completion; CODE review cards can receive correctness credit from a self-reported recall score. Distinguish read, practiced, independently passed, and retained. Offer an explicit skip/reveal route without labelling it mastery.

The five functional findings from the earlier review remain priorities: the C# endpoint's header-only local guard while the default server listens on network interfaces; rejected submissions after ten minutes; wrong answers scheduled as successful recall; permanently lost first-solve XP after an award failure; and daily quests that miss bonus XP. Fix these before extending reward logic or making mastery more prominent.

The application experience would benefit from the following changes:

| Area | Observed gap | Recommended behavior |
| --- | --- | --- |
| Onboarding | Focus tags are collected and promised to affect recommendations, but the feed does not use them. Experience does not select a beginner curriculum. | Use goal, prerequisites, experience, focus tags, and available time in the next-session recommendation. Add an optional placement exercise. |
| Dashboard | Several similar cards compete for attention; XP and quests do not specify a concrete study session. | One primary “Start a 15-minute session” action with a small plan: due reviews, one lesson, one related exercise. Explain why each item was selected. |
| Course outline | Lesson rows do not visually distinguish completed/current/next lessons; outcomes can push the lesson list far down the page. | Put Resume near the title, show completion marks and estimated time, collapse finished modules, and show prerequisites. |
| Lesson navigation | The page links back to the outline but lacks direct previous/next lesson actions. | Provide previous/next navigation, a sticky outline, and a next-step action after completion. |
| Editors | Lesson drafts live in an in-memory Zustand store; standalone problem drafts are not restored. Feedback is limited and coding hints are absent. | Persist drafts by stable exercise ID, show saved status, support reset confirmation, staged hints, test input/expected/actual diffs, console output, and an optional solution walkthrough. |
| Problem bank | Hundreds of cards, three controls initially labelled “All,” no solved/unsolved filter, and no URL-persisted filtering. | Label filters, add status filtering and sorting, save filters in the URL, provide focused problem sets, paginate or progressively load results, and add useful empty states. |
| Reviews | CODE cards are generic recall prompts; a final-card verdict is lost behind the completion view. | Add predict-output, spot-the-bug, explain-the-fix, and small executable variants. Summarize mistakes and show a concrete follow-up lesson or problem at session end. |
| Mastery | Strength is derived from scheduling state and time, without evidence from independent problem solving. | Show the evidence and sample size. Combine delayed recall with independent code success and unfamiliar variants; distinguish untested concepts from weak ones. |
| Profile and backup | Backup is valuable, but curriculum version and editor drafts are not part of the recovery story. | Show last backup and installed content version, support a safe update preview, and make draft recovery explicit. |
| Accessibility | Mobile navigation hides link labels; filter selects lack meaningful labels; some inputs rely on placeholders. | Add accessible names, active navigation state, keyboard and focus checks, and clear validation/error feedback. |
| Display preferences | Theme follows the OS; no explicit user override. | Add system/light/dark preference and editor font-size controls after higher-priority learning fixes. |

For new content, prioritize these additions. Counts are proposed scope, not existing content or implementation commitments.

| Priority | Content pack | Suggested size | Concrete learner outcome |
| --- | --- | --- | --- |
| 1 | C# Foundations | 12–16 lessons and 2 mini-projects | Write and test small C# programs before studying ASP.NET, async, DI, and EF Core |
| 2 | SQL Business Data Lab | 12–20 executable labs, largely adapting existing lessons | Query real tables, change data safely, and inspect query behavior |
| 3 | Build a Real ASP.NET Core API | 10–12 project milestones | Create, test, and operate an API with a real EF Core database |
| 4 | Testing and Debugging Workshop | 8–12 failure-driven labs | Reproduce a bug, write a failing test, fix it, and explain the regression protection |
| 5 | Ship and Maintain an App | 6–8 labs | Use Git, CI, containers, configuration, health checks, and backup/restore in a working project |
| 6 | React Integration Labs | 8 component or screen labs adapting the existing course | Build accessible forms and CRUD screens that communicate with the API |

**C# Foundations** should cover variables and types; parsing input; conditions and loops; methods and parameters; strings; arrays/lists/dictionaries; classes and constructors; properties; interfaces and composition; nullability; exceptions; and introductory tests. Begin with a console inventory tracker and a CSV importer. Introduce records, LINQ, async, and dependency injection only after those basics are established. Reuse the existing C# runner for these BCL-focused exercises.

**SQL Business Data Lab** should use one evolving products/customers/orders/payments dataset. Suggested exercises: find customers without orders; distinguish COUNT(*) from COUNT(column); handle NULL in an anti-join; return each customer's latest order; compute running inventory; detect duplicate invoices; aggregate revenue after refunds; paginate with a stable order; choose and verify an index; perform an atomic stock decrement; migrate a new required column safely; and investigate a slow query. Use a declared dialect. SQLite is a practical browser-first starting point, with advanced SQL Server or PostgreSQL behavior covered in separate labs. The [official SQLite WebAssembly project](https://www.sqlite.org/wasm/doc/trunk/index.md) supplies a browser-compatible engine.

**Build a Real ASP.NET Core API** should extend the existing theory with a real solution: project setup and routing; DTO binding and validation; EF Core entities and migrations; CRUD persistence; filtering/sorting/paging; authentication; resource ownership and authorization; consistent Problem Details; concurrency conflicts; transactions and idempotency; integration tests; and operational readiness. The current BCL-only function runner cannot deliver this experience. Start with a downloadable companion repository and `dotnet test` checkpoints, then integrate project execution when justified. ASP.NET Core's [WebApplicationFactory integration-testing support](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0) is an appropriate foundation for verifying real HTTP behavior.

**Testing and Debugging Workshop** should ask learners to repair concrete failures: an off-by-one paging bug, a mutation that corrupts earlier state, a lost update, a double submission, a stale network response, an N+1 query, a timezone boundary, and a cancellation bug. Require a regression test as part of the answer. Include choosing unit versus integration boundaries and reading logs before editing code. Several of Skillforge's own defects could become carefully isolated teaching fixtures.

**Ship and Maintain an App** should become a first-class in-app track, reusing suitable material from the existing upskill documents. Suggested labs: branch and commit a small change; resolve a conflict; review a diff; run checks in CI; containerize the API; configure environment-specific settings; add a health endpoint; and restore a database backup. Teach observable completion criteria rather than command memorization.

**React Integration Labs** should render actual components and test interactions: controlled form validation; accessible errors and focus; filtered/paginated lists with URL state; loading/empty/error screens; optimistic updates with rollback; cancellation and stale responses; edit conflicts; and delete confirmation. The existing 18-lesson course already provides the theoretical sequence. Its next investment should be runnable UI practice.

TypeScript and JavaScript also need runtime improvements before many more exercises: preserve typed source, provide compiler diagnostics, allow compile-only questions, and support awaited promises within the existing execution timeout. Pair compile checks with runtime checks; transpilation alone cannot establish type correctness. Keep Python as an explicitly labelled optional reading track until its runtime is a deliberate priority.

A shared capstone would make these tracks reinforce one another. **Inventory Desk** could grow through these milestones:

1. Build C# product and stock rules as tested pure logic.
2. Design and query the SQL schema with realistic fixtures.
3. Expose product CRUD through ASP.NET Core and EF Core.
4. Add validation and consistent error responses.
5. Add users and resource-level permissions.
6. Build React list, detail, create, and edit screens.
7. Add paging, filtering, and URL state.
8. Handle concurrent edits and atomic stock adjustments.
9. Add an audit trail and useful logs.
10. Write HTTP integration tests and browser tests.
11. Run the app in a container with health checks.
12. Document, demonstrate, back up, and restore it.

Each milestone should have a short specification, acceptance tests, a review rubric, and a reflection question. The completed application is a tangible portfolio artifact; the supporting lessons remain useful reference material.

For future lesson authoring, use a consistent learning sequence: explicit objective and prerequisites; one worked example; one plausible mistake explained; a small modification task; an independent exercise; targeted hints; a solution explanation; and a later review variant. Add stable IDs, prerequisite IDs, expected runtime, estimated effort, content version, and source references to the authoring model. Prefer stronger feedback to a fixed minimum word count.

Recommended implementation order:

1. **Restore trust:** fix the previously reproduced functional issues, shuffle MCQs, validate/synchronize existing content safely, and add durable draft storage.
2. **Guide progress:** add the C# foundations bridge, prerequisite-aware next steps, effective focus preferences, clear course completion states, and previous/next navigation.
3. **Improve existing practice:** replace generic explanations for the most-used problems; add a hint ladder and solution review; introduce real SQL and TypeScript grading, then asynchronous JavaScript support.
4. **Connect the stack:** deliver Inventory Desk as companion project milestones, followed by integrated ASP.NET/EF Core and React labs.
5. **Protect the experience:** run the database suites and browser happy path in CI against isolated fixtures; add focused coverage for empty queues, long editing sessions, failed saves, import/restore, and keyboard/mobile navigation. The current CI invokes the default unit command but not the helper-owned database suites or Playwright.

Judge improvements by unaided success on a new variant, recovery after a mistake, successful delayed recall, completed project milestones, and whether interrupted work resumes safely. XP remains useful encouragement, but these measures better reflect the app's learning goal.

Validation context: the previous review passed lint, TypeScript checking, 71 standard unit tests, 13 database tests using temporary schema copies, and the browser happy path. This broader pass added content inventory and answer-position/template/runtime analysis. No application behavior or learner progress was changed by this review.
