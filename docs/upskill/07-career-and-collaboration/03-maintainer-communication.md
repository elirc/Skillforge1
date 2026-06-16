# 03 Maintainer Communication

## Ask For Help Without Outsourcing Thinking

Good question shape:
```md
I am trying to change [behavior]. I traced [files/lines]. I expected [x], but saw [y]. I tried [commands]. My current hypothesis is [z]. Am I looking in the right layer?
```

## Bug Report Template

```md
## Reproduction
1. 

## Expected

## Actual

## Environment

## Evidence
- File anchors:
- Logs/screenshots:

## Hypothesis
```

## Feature Proposal Template

```md
## User value
## Current workaround
## Proposed behavior
## Files likely touched
## Risks
## Tests
```

## Responding To Review

- Acknowledge the concern.
- State the change or explain the tradeoff.
- Avoid force-pushing unrelated refactors.

Example:
> Good catch on server-side correctness. I moved MCQ/cloze grading into `gradeReviewItem`, added a malicious-input test, and left code reviews as self-recall pending a server runner design.
