# 03 Validation, Auth, And Permissions

## Validation Layers

| Boundary | Validation | Anchor |
| --- | --- | --- |
| Content JSON | Zod schemas | [`src/lib/content-schema.ts:3-90`](../../../src/lib/content-schema.ts#L3-L90) |
| Content reference code | Worker execution | [`scripts/validate-content.ts:14-23`](../../../scripts/validate-content.ts#L14-L23) |
| String-typed DB columns | Zod enums and JSON tag parsing | [`src/lib/enums.ts:8-52`](../../../src/lib/enums.ts#L8-L52) |
| Lesson completion action | `lessonId: string` | [`src/server/actions.ts:19-24`](../../../src/server/actions.ts#L19-L24) |
| Review grading action | recall score, correctness, duration | [`src/server/actions.ts:46-55`](../../../src/server/actions.ts#L46-L55) |
| Onboarding / settings actions | name, goal, experience, XP goal, focus tags | [`src/server/actions.ts:63-82`](../../../src/server/actions.ts#L63-L82) |
| Problem submission action | problem id, code size, pass flag, duration | [`src/server/problems.ts:9-19`](../../../src/server/problems.ts#L9-L19) |
| Sandbox request | code/function/tests | [`src/lib/sandbox/shared.ts:3-14`](../../../src/lib/sandbox/shared.ts#L3-L14) |

## Identity

There is no authentication. No Auth.js, no providers, no sessions, no `Account`/`Session` tables. Skillforge runs on one machine for one learner.

Identity is a constant: `LOCAL_USER_ID = "local"` in [`src/server/user.ts:8`](../../../src/server/user.ts#L8). Every server module that needs "who is this" calls [`getCurrentUser()`](../../../src/server/user.ts#L21-L40), which **upserts** that single row and therefore never returns `null`. There is no unauthenticated path to handle, because there is no authenticated one to contrast it with.

Read that as a design decision, not an omission. The cost of the decision is that `userId` is threaded through every query for a user who can only ever be one person — and the benefit is that the day this becomes multi-user, the seam already exists: change what `getCurrentUser()` returns and the query layer is already scoped.

## Authorization And Isolation

Good example:
- Review grading fetches by both `id` and `userId` in [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49). With one user this guard can never fire, but it is the shape an IDOR guard must have, and keeping it costs nothing.

What replaces access control here:
- Lesson completion does not check entitlement — there is nothing to be entitled to. What it *does* enforce is anti-farming: a second completion of the same lesson takes the `noAwardSummary` branch instead of the award pipeline in [`src/server/actions.ts:27-40`](../../../src/server/actions.ts#L27-L40). The same rule appears for problems in [`src/server/problems.ts:22-38`](../../../src/server/problems.ts#L22-L38).
- The course page has no gate at all beyond `notFound()` on an unknown slug in [`src/app/courses/[slug]/page.tsx:46-49`](../../../src/app/courses/%5Bslug%5D/page.tsx#L46-L49). The `Course` model has no `isPro` field and the content schema has no tier.
- Review correctness is still decided on the client and sent to the server in [`src/features/review/review-session.tsx:62-66`](../../../src/features/review/review-session.tsx#L62-L66). Nobody else can be cheated by this, but the learner can cheat themselves, and the structural point stands: the server trusts a fact it could derive.

## What A Junior Might Miss

- A TypeScript `string` is not validation. `lessonId: z.string()` proves shape, not existence.
- A hidden button or disabled UI is not a rule; the server action is reachable regardless.
- "No auth" is not the same as "no integrity boundary." The integrity boundary here is the XP ledger and the sandbox, not a login.

## What A Senior Checks

- Every resource mutation scopes by `userId`, even when there is only one — because that is what makes the assumption removable later.
- The server derives authority-sensitive facts (correctness, repeat-credit, XP amount) rather than accepting them from the client. [`awardActivity`](../../../src/server/gamification.ts#L61-L123) is the single write path for progress precisely so this stays checkable in one place.
- Untrusted input that is *executed* — learner code — is isolated: [`src/lib/sandbox/shared.ts:38-42`](../../../src/lib/sandbox/shared.ts#L38-L42) strips `fetch`, `XMLHttpRequest`, `WebSocket`, and `importScripts` from the harness, and the runner enforces a timeout.
- Zod schemas at the action boundary fail closed rather than coercing.

## Drill

Write a test plan for the anti-farming invariant: completing an already-completed lesson must not move XP, streak, or quest progress. Name the action, the branch it must take, the rows that must be unchanged, and how you would assert it without a wall clock. Then do the same for `recordProblemSubmissionAction`, where the rule is "XP on the first green run only" — note that it still writes a `ProblemSubmission` row every time, and decide whether your test should care.
