# 03 Validation, Auth, And Permissions

## Validation Layers

| Boundary | Validation | Anchor |
| --- | --- | --- |
| Content JSON | Zod schemas | [`src/lib/content-schema.ts:3-90`](../../../src/lib/content-schema.ts#L3-L90) |
| Content reference code | Worker execution | [`scripts/validate-content.ts:14-23`](../../../scripts/validate-content.ts#L14-L23) |
| Lesson completion action | `lessonId: string` | [`src/server/actions.ts:10-15`](../../../src/server/actions.ts#L10-L15) |
| Review grading action | recall score, correctness, duration | [`src/server/actions.ts:32-41`](../../../src/server/actions.ts#L32-L41) |
| Sandbox request | code/function/tests | [`src/lib/sandbox/shared.ts:3-14`](../../../src/lib/sandbox/shared.ts#L3-L14) |

## Authentication

Auth.js providers and Prisma adapter are configured in [`src/lib/auth.ts:7-21`](../../../src/lib/auth.ts#L7-L21). Session user id is attached in [`src/lib/auth.ts:25-31`](../../../src/lib/auth.ts#L25-L31). The application retrieves the current user through [`src/server/user.ts:4-22`](../../../src/server/user.ts#L4-L22).

Important caveat: unauthenticated users get a shared demo user in [`src/server/user.ts:11-21`](../../../src/server/user.ts#L11-L21). That is convenient for local training but must be reviewed before production.

## Authorization And Isolation

Good example:
- Review grading fetches by both `id` and `userId` in [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49). This is an IDOR guard.

Investigate:
- Lesson completion accepts a lesson id and does not currently verify plan access or course entitlement in [`src/server/actions.ts:14-24`](../../../src/server/actions.ts#L14-L24).
- Course page shows Pro but does not enforce Pro access in [`src/app/courses/[slug]/page.tsx:61-65`](../../../src/app/courses/%5Bslug%5D/page.tsx#L61-L65).
- Cron route has no secret/auth check in [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19).

## What A Junior Might Miss

- A TypeScript `string` is not authorization.
- A hidden button or disabled UI is not a permission check.
- Demo-user fallback is not the same as anonymous isolated guest mode.

## What A Senior Checks

- Every resource mutation scopes by user or tenant.
- Server derives authority-sensitive facts such as plan, ownership, and correctness.
- Background routes require caller authentication.
- Auth config fails closed when provider secrets are missing.

## Drill

Write a test plan for `completeLessonAction` that rejects completion of a Pro lesson for a Core user. Include schema, server action, and UI acceptance criteria.
