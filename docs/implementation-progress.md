# App review implementation

Implements the approved [full review](app-review-2026-09-26.md). Existing uncommitted work is preserved; no commit or deployment is part of this task.

## Delivered

- Reliability: loopback binding and local execution guards, long-session submissions, server-derived grading, honest incorrect-review scheduling, atomic first-solve rewards, bonus-aware quests, and recoverable errors.
- Learning: shuffled and balanced MCQs, gated knowledge checks, assisted versus independent evidence, expanded examples in all 36 JavaScript foundation lessons, and concrete explanations for 391 previously generic problems.
- Content: immutable authored identities, archive-based atomic sync, additive migration, update preview/version, automatic backups, and compatibility aliases for older positional backups.
- Editors: versioned browser drafts, recovery/export, reset confirmation, hints and solution walkthroughs, diagnostics/test differences, console output, font controls, and invalidation of passing results when code changes.
- Navigation: accessible active navigation, theme preference, course resume/completion states, lesson outline and previous/next links, URL filters, solved status, pagination, and empty states.
- Guidance: focus/experience/prerequisite recommendations, optional placement, daily minutes and guided sessions, explicit mastery evidence, and review summaries.
- Execution: async JavaScript, strict TypeScript and compile-only contracts, real SQLite fixtures, mounted React component labs, and actual runtime labels.
- Curriculum: 15 courses / 287 lessons / 449 problems. Added C# Foundations (18), SQL Business Labs (14), React Integration (8), Debugging/Testing (10), ASP.NET API (12), Inventory Desk capstone (12), Shipping/Maintenance (8), and one TypeScript compile-only lab.
- Projects: downloadable Inventory Desk API/EF Core application, React CRUD UI, console inventory/CSV mini-projects, integration/browser tests, container configuration, backup/restore tools, and twelve acceptance checkpoints. Added Projects and HTTP playground pages.
- CI: content quality, runtimes, unit/database/browser/companion checks and production build, with browser failure artifacts.

## Verification

- Standard unit suite: **81 passed**; the 17 database cases intentionally skip here and run through isolated helpers.
- Database helpers: **17 passed**, including award rollback/retry, content reorder/retirement, old backup identities, import rollback and mastery derivation.
- Companion .NET suite: **21 passed**, including API/domain and console/CSV checks.
- Companion browser journey: **passed**, covering registration, create, stock adjustment, immediate edit, delete cancellation and confirmation. Found and fixed a stale-version race during the stock refresh. Desktop screenshot inspected.
- Main browser journeys against the production build: **all six passed across the full run and focused rerun**. Covers lesson/review/mastery, mobile keyboard navigation and URL filters, draft persistence/verdict invalidation, failed-save recovery, HTTP validation/preconditions, empty queues and source download. Corrected two test selectors/focus setup issues. Dashboard, tracks, lesson, mastery and mobile Projects screenshots inspected; mobile overflow check passed.
- Content execution: first full pass 672/680; corrected the shared React harness, then all 56 scoped exercises across React Integration, TypeScript Starter and C# Foundations passed. This covers the eight original failures and four subsequently added references. All 684 current reference exercises have passing coverage across these runs.
- Content quality: **1,205 lesson/item identities and 490 MCQs passed**; authored answer positions are balanced and the UI also shuffles them.
- Production build passed with Webpack, including TypeScript checking and page generation. All learner pages are dynamic, including the corrected placement page. ESLint passed after fixes, including the final cached check of application code, scripts, database code, tests, companion, configuration and the compile-only content pack.
- Companion backup/restore drill passed on an isolated database; packaged ZIP integrity and source-only contents passed (28 entries).
- Additive migration ran twice on a copy without altering original learner values.
- Full migration and content synchronization passed on a copy: **15 courses / 287 lessons / 449 problems**, with every original learner field unchanged and SQLite integrity/foreign keys valid. Verified copy: `data/backups/verified-content-upgrade.db`.
- The working database was then migrated and synchronized successfully to catalog version `2b9e39006a7f8322`: **15 courses / 287 lessons / 449 problems**. Every original learner field matches both the original backup and the fresh pre-upgrade backup. SQLite integrity and foreign-key checks passed against the working database.

Implementation and the available local verification are complete; the Docker limitation is recorded below.

Docker execution is **not verified**: its version probe did not respond and was stopped. Container files are provided, but no successful container run is claimed.

## Learner data safety

The working database is `data/skillforge.db`, now migrated and synchronized. Its original consistent backup is `data/backups/skillforge-2026-09-27T01-19-42-005Z.db`. The fresh pre-upgrade backup is `data/backups/skillforge-2026-09-27T05-20-18-603Z.db`. Both have `.db.progress.json` snapshots. Preserved learner rows: User 1, Progress 1, LessonCompletion 1, ReviewState 3, Attempt 2, ProblemSubmission 0, XpEvent 7, Quest 8, UserAchievement 1. The seeder also created an automatic post-migration/pre-sync backup at `data/backups/skillforge-2026-09-27T05-29-19-829Z.db`.

Browser/database checks use helper-owned temporary databases. Heavy checks run sequentially because this Windows machine has very little available memory.
