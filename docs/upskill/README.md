# Skillforge Upskill Curriculum

This curriculum turns this repository into a training lab for a junior engineer growing toward mid-level and senior ownership. It teaches this specific Skillforge codebase first, then extracts transferable engineering judgment: boundaries, contracts, validation, persistence, testing, debugging, performance, security, and contribution workflow.

## Repo Identity

Skillforge is a single Next.js App Router application for short coding lessons, spaced-repetition reviews, gamification, standalone practice problems, and course browsing. It is deliberately **local-only and single-learner**: no sign-in, no accounts, no billing, no multi-tenancy, no deployment target. The UI lives in `src/app`, `src/features`, and `src/components`, while server mutations live mostly in `src/server`. Persistence is Prisma over a SQLite file at `data/skillforge.db`, modeled in `prisma/schema.prisma` and seeded from the content tree under `content/`. The current learner is one hard-coded row, `LOCAL_USER_ID = "local"`, resolved by `getCurrentUser()` in [`src/server/user.ts`](../../src/server/user.ts). The most important product spine is lesson completion -> review-state seeding -> review grading -> scheduler update -> XP/streak/quest/achievement update. The code-exercise sandbox is isolated in a Web Worker and has a Node worker twin for tests.

That constraint is a teaching asset, not an apology. Much of what this curriculum asks you to notice — untransacted multi-writes, client-supplied facts, user-scoping clauses no test can falsify — is visible here precisely because nothing else is in the way.

## How To Use This

Weekend path:
1. Read [00-fast-track.md](00-fast-track.md).
2. Trace lesson completion in [01-codebase-cartography/05-key-flows.md](01-codebase-cartography/05-key-flows.md).
3. Do two drills from [04-code-reading-gym/01-annotation-drills.md](04-code-reading-gym/01-annotation-drills.md).
4. Attempt one ticket from [06-contribution-practice/01-good-first-tickets.md](06-contribution-practice/01-good-first-tickets.md).

Two-week path:
1. Complete the cartography module.
2. Study TypeScript, React, server actions, Prisma, and worker boundaries in [02-stack-and-language-mastery](02-stack-and-language-mastery/README.md).
3. Add one test using [05-quality-engineering/02-writing-tests-here.md](05-quality-engineering/02-writing-tests-here.md).
4. Write a PR description using [07-career-and-collaboration/02-writing-prs-and-rfcs.md](07-career-and-collaboration/02-writing-prs-and-rfcs.md).

Eight-week path:
1. Week 1-2: run, read, and trace the repository.
2. Week 3-4: complete junior tickets across UI, server logic, content validation, and tests.
3. Week 5-6: complete one mid-level cross-layer feature ticket.
4. Week 7-8: write an RFC or senior architecture critique for one risk in [08-reference/risk-register.md](08-reference/risk-register.md).

Ongoing contribution practice:
- Keep a local learning log: flow traced, invariant found, test added, risk noticed.
- Prefer small PRs that follow existing boundaries.
- Use the rubrics in [08-reference/learning-rubrics.md](08-reference/learning-rubrics.md) before asking for review.

## Major Learning Tracks

| Track | Start here | Outcome |
| --- | --- | --- |
| Codebase cartography | [01-codebase-cartography/README.md](01-codebase-cartography/README.md) | You can name the major parts and trace real flows. |
| Stack mastery | [02-stack-and-language-mastery/README.md](02-stack-and-language-mastery/README.md) | You understand TypeScript, React, Next, Prisma, and worker constraints as used here. |
| Architecture judgment | [03-architecture-and-patterns/README.md](03-architecture-and-patterns/README.md) | You can critique boundaries, persistence, side effects, and risk. |
| Code reading gym | [04-code-reading-gym/README.md](04-code-reading-gym/README.md) | You practice active reading, trace tables, and review katas. |
| Quality engineering | [05-quality-engineering/README.md](05-quality-engineering/README.md) | You can test, debug, and reason about security/performance. |
| Contribution practice | [06-contribution-practice/README.md](06-contribution-practice/README.md) | You can turn learning into maintainable PRs. |
| Career collaboration | [07-career-and-collaboration/README.md](07-career-and-collaboration/README.md) | You can review, write RFCs, communicate, and interview from the repo, including C#/.NET transfer practice. |

## Recommended Paths

Brand-new junior:
- Read [00-fast-track.md](00-fast-track.md), then [01-codebase-cartography/02-file-reading-order.md](01-codebase-cartography/02-file-reading-order.md).
- Focus on locating files, naming owners, and explaining one flow.

Junior with stack familiarity:
- Start with [01-codebase-cartography/05-key-flows.md](01-codebase-cartography/05-key-flows.md), then [05-quality-engineering/02-writing-tests-here.md](05-quality-engineering/02-writing-tests-here.md).
- Pick tickets that add tests or small UI behavior.

Mid-level engineer new to this repo:
- Read [03-architecture-and-patterns/01-boundaries-and-layers.md](03-architecture-and-patterns/01-boundaries-and-layers.md) and [03-architecture-and-patterns/06-architecture-critique.md](03-architecture-and-patterns/06-architecture-critique.md).
- Pick one mid-level ticket and write design notes first.

Senior engineer doing architecture review:
- Read [08-reference/risk-register.md](08-reference/risk-register.md), [03-architecture-and-patterns/06-architecture-critique.md](03-architecture-and-patterns/06-architecture-critique.md), and [05-quality-engineering/05-security-checklist.md](05-quality-engineering/05-security-checklist.md).
- Validate hypotheses before proposing migrations.

## Conventions

- File anchors use relative links such as [`src/server/actions.ts:23-43`](../../src/server/actions.ts#L23-L43).
- Fake code is labeled `Illustrative fake code: not from this repo.`
- Drills require action: annotate, trace, test, review, or write design notes.
- Self-grading is explicit: basic, solid, strong.
- Verification notes list commands run, files inspected, and uncertainties.

## Senior Mindset

A junior asks, "How do I make it work?" A mid-level engineer adds, "Is this the right pattern for this codebase?" A senior asks, "What does this commit us to, who pays the cost, how will we know it broke, and how do we reduce risk before the blast radius grows?"

## Verification Notes

- Inspected `rg --files`, root README, `.env.example`, package scripts, Prisma schema, server modules, review scheduler, sandbox, tests, and CI.
- Commands previously verified in this workspace include `npm run lint`, `npm run typecheck`, `npm test`, `npm run validate:content`, and `npm run build`.
- The database is a local SQLite file, so `npm run db:setup` and the E2E suite need no external service. CI runs the same `db:setup` step at [`.github/workflows/ci.yml:23`](../../.github/workflows/ci.yml#L23).
