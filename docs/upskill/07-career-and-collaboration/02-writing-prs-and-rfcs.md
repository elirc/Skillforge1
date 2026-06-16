# 02 Writing PRs And RFCs

## PR Template

```md
## What changed
- 

## Why
- 

## How tested
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm test
- [ ] npm run validate:content
- [ ] npm run test:e2e (if DB/browser flow)

## Risks
- 

## Follow-ups
- 
```

## Commit Messages

Good:
- `Add server-derived review correctness tests`
- `Gate cron review route with shared secret`
- `Document guest-mode migration risks`

Weak:
- `fix stuff`
- `updates`
- `refactor everything`

## When To Write An RFC

Write an RFC when:
- The schema changes.
- A public contract changes.
- Auth/permissions change.
- A new worker/background flow appears.
- You are changing a core invariant like ReviewState scheduling.

## RFC Template

```md
# RFC: [Title]

## Problem
## Goals / Non-goals
## Current behavior
## Proposed design
## Alternatives considered
## Data model and migration
## Security and privacy
## Performance and reliability
## Test plan
## Rollout and rollback
## Open questions
```

Tailor evidence with anchors, such as [`src/server/review.ts:39-91`](../../../src/server/review.ts#L39-L91) for review grading changes.
