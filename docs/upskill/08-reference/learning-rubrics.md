# Learning Rubrics

## Junior

Observable behaviors:
- Can run documented checks.
- Can identify route, component, server action, and schema for one flow.
- Can make a small change following an existing pattern.
- Can add a simple unit test.

Self-assessment:
- [ ] I can trace lesson completion from UI to DB.
- [ ] I can explain what `ReviewState` is.
- [ ] I can run `npm test` and understand failures.
- [ ] I can write a PR description with testing notes.

## Mid-Level

Observable behaviors:
- Designs cross-layer changes before coding.
- Adds validation and permission tests.
- Understands transaction and consistency risks.
- Reviews PRs for correctness, not just style.

Self-assessment:
- [ ] I can identify authority boundaries.
- [ ] I can decide unit vs integration vs E2E tests.
- [ ] I can explain schema migration risk.
- [ ] I can debug a failing flow systematically.

## Senior

Observable behaviors:
- Identifies invariants and blast radius.
- Proposes migrations with rollback.
- Separates confirmed issues from hypotheses.
- Teaches others through clear review and RFCs.

Self-assessment:
- [ ] I can critique guest mode, Pro gating, cron reliability, and sandbox security.
- [ ] I can design outbox and transaction improvements.
- [ ] I can explain tradeoffs to product and maintainers.
- [ ] I can reduce risk without creating broad churn.

## Answer Quality

- Weak: "It works because the test passes."
- Solid: "The test covers the pure scheduler branch, but DB integration is untested."
- Strong: "The invariant is one ReviewState per user/item; unit tests cover date math, integration tests should cover idempotent seeding and transaction behavior."
