<p align="center">
  <img src="assets/readme-hero.svg" alt="GitHire" width="260" />
</p>

<h1 align="center">GitHire</h1>

<p align="center">
  <strong>Humans frame. AI executes. Architects judge.</strong>
</p>

<p align="center">
  <a href="README.md">English</a>
  ·
  <a href="README.zh-CN.md">中文</a>
</p>

<p align="center">
  <a href="https://realroc.github.io/git-hired/">Website</a>
  ·
  <a href="https://realroc.github.io/git-hired/case-redis-scan.html">Case 01</a>
  ·
  <a href="https://realroc.github.io/git-hired/blog.html">Blog</a>
  ·
  <a href="https://realroc.github.io/git-hired/skill.html">Skill</a>
  ·
  <a href="https://github.com/realRoc/git-hired/issues">Open an issue</a>
</p>

---

GitHire is an AI-native engineering methodology, written as a reusable six-step workflow and validated against real production incidents.

AI coding speed already outruns human review speed. Reviewing code *after* it's written is too late, so the work shifts:

- **Humans frame** — write the issue, set constraints, declare non-goals, define success.
- **AI executes** — generates the code, runs tests, opens the PR.
- **Architects judge** — make the final tradeoff before merge.

The six steps below place each role at the right point in the pipeline:

1. **Issue** — frame the problem with the six-section Prompt Spec (Goal / Constraints / Non-goals / Verification / Architecture notes / Existing context).
2. **Sandbox** — a long-running dev environment with real dependencies and production-shape data.
3. **Execute** — Claude Code or Codex implements in the sandbox.
4. **AI Review** — a second agent with *different* priors (performance, security, anti-patterns).
5. **Architect** ★ — the most expensive 30 seconds in the workflow. Human reads the diff with system-side context (QPS curves, prior incidents).
6. **Production** — merge, ship, write the decision trail back to the Issue.

If you only adopt one step, adopt step 5.

## Real cases

The site is an *operating log*, not a tutorial. Every case is a real event:

- **[Case 01 · A 22-line SCAN took down production Redis](https://realroc.github.io/git-hired/case-redis-scan.html)** — Codex wrote a `r.scan(match='model_detail::*')` + pipelined `HGETALL` in 5 minutes; the architect step was skipped; production was on fire 13 hours later; 25 hours of fix-chain commits until a Redis SET replaced the SCAN. Walked along all six steps to show where each one was abandoned.

More cases are queued; if you've shipped a real incident worth walking, [open an issue](https://github.com/realRoc/git-hired/issues) and we'll co-write the post-mortem.

## Install as Skill

GitHire is published as an installable Skill so any AI agent can apply the same method. The skill lives at **[realRoc/skills](https://github.com/realRoc/skills)** alongside the matching **Prompt Spec** skill.

```bash
# Install both skills
npx skills add realRoc/skills

# Or just one
npx skills add realRoc/skills --skill githire
npx skills add realRoc/skills --skill prompt-spec
```

The Skill points agents at the live site for current method, plus the bundled `references/method.md` for offline fallback. Detailed install page: <https://realroc.github.io/git-hired/skill.html>.

> **Note on path migration**: skills used to live under `realRoc/git-hired/skills/githire`. They now live at `realRoc/skills/skills/githire`. The local `skills/` directory in this repo is a dev workspace artifact (symlinked to `.agents/`) and is gitignored — clones will see it empty, which is expected.

## What belongs here

Open an issue if you want to:

- contribute a real-incident case for the operating log;
- propose a refinement to the six-step workflow;
- challenge a claim in the FAQ;
- improve the Prompt Spec template;
- discuss how AI should support — not replace — architect judgment.

A polished proposal is not required. A clear question is enough.

## Links

- Website: <https://realroc.github.io/git-hired/>
- Case 01: <https://realroc.github.io/git-hired/case-redis-scan.html>
- Blog: <https://realroc.github.io/git-hired/blog.html>
- Skill landing: <https://realroc.github.io/git-hired/skill.html>
- Skill source (canonical): <https://github.com/realRoc/skills>
- Issues: <https://github.com/realRoc/git-hired/issues>
