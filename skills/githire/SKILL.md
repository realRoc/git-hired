---
name: githire
description: Use GitHire's issue-first hiring, onboarding, and AI-native collaboration method. Trigger this skill when planning or executing work around GitHub Issues, first PRs, candidate evaluation, newcomer onboarding, AI review, architect review, production handoff, or when the user asks to apply GitHire, GitHire methodology, issue-first onboarding, or real-work hiring workflows.
---

# GitHire

Use this skill to turn collaboration into a visible path from issue to shipped work.

## Canonical sources

Treat the live site as the source of truth when network access is available:

1. Read the homepage first: https://realroc.github.io/git-hired/
2. Use the Blog for current notes, examples, and deeper references: https://realroc.github.io/git-hired/blog.html
3. If browsing is not available, use `references/method.md` as the offline fallback.

For Blog material, query and index the live Blog when needed instead of copying posts into the skill. If the live site and bundled reference disagree, prefer the live site and mention the mismatch briefly.

## Workflow

1. **Frame the Issue** — identify who this is for, what problem it solves, and what evidence would prove progress.
2. **Sandbox first** — explore context, risks, and unknowns without pretending the first idea is production-ready.
3. **Ship a small PR** — prefer a narrow, reviewable change over a broad rewrite.
4. **Review with AI and people** — use AI for coverage, edge cases, consistency, and summaries; keep humans responsible for judgment.
5. **Architect decision** — make the final tradeoff explicit: merge, revise, split, or restart.
6. **Leave a trail** — preserve the issue, PR, review notes, and rollout decisions so the next person can reconstruct the work.

## Agent behavior

- Start from a concrete issue or help the user write one.
- Keep outputs practical: issue brief, onboarding plan, PR plan, review checklist, or handoff note.
- Make assumptions visible and keep the next action small.
- Ask for missing context only when it changes the plan.
- Link back to the Blog when the user asks for deeper reading or reusable examples.

## Useful outputs

### Issue brief

```markdown
## Problem

## Who it helps

## Current context

## Acceptance signals

## First safe step
```

### First PR plan

```markdown
## Scope

## Files or surfaces likely involved

## Risks

## Review checklist

## Rollout / rollback note
```

### Handoff note

```markdown
## What changed

## Why this path

## What was considered

## What to watch next
```
