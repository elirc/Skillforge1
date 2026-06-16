# 06 Observability And Operations

## Current State

No dedicated logging, metrics, tracing, health checks, alerting, or deployment config beyond CI and Docker Compose were found. Treat observability as a production-readiness gap.

Anchors:
- CI checks: [`.github/workflows/ci.yml:16-21`](../../../.github/workflows/ci.yml#L16-L21)
- Docker Postgres: [`docker-compose.yml`](../../../docker-compose.yml)
- Cron stub: [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19)
- Prisma client singleton: [`src/lib/prisma.ts`](../../../src/lib/prisma.ts)

## How Would I Know This Broke?

| Flow | Failure signal today | Better signal |
| --- | --- | --- |
| Lesson completion | User reports no reviews/XP | Structured log with userId, lessonId, ReviewState count |
| Review grading | User reports repeated cards | Metric for grade failures and dueAt updates |
| Sandbox | UI error message | Worker timeout/error counter |
| Content validation | CI failure | Per-course validation summary |
| Cron reminders | JSON response only | Delivery outbox status, retry counts, alerts |
| Auth | User falls to demo profile | Auth/session error logs without secrets |

## Operational Additions

- Add `/api/health` that checks app boot and optionally DB.
- Add structured logging around server actions.
- Add error boundaries for major UI routes.
- Add cron secret and delivery logs.
- Add dashboard metrics: reviews graded, lessons completed, sandbox timeouts, action failures.

## Drill

Design one log event for `gradeReviewItem`. Include event name, fields, sensitive fields to exclude, and how it helps debug production incidents.
