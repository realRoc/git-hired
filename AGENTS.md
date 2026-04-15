# git-hired Agent Guide

This file defines how Claude Code, Codex, or similar agents should operate inside this repo.

## Scope

This `AGENTS.md` applies to everything under `git-hired/`.

Primary goal:

- let a maintainer add or update a JD with one sentence
- keep `roles.json`, `prompts/`, `docs/`, and `README*` consistent
- avoid half-finished role changes

## Short Answer

Yes. In this repo, you can use one sentence to add or update a JD.

Treat a natural-language request like:

- `新增一个 AI Sales Engineer 岗位，中文叫 AI 销售工程师，页面 slug 用 sales，强调 outbound automation、CRM、pipeline ownership 和英文沟通。`
- `把 growth 岗位改成更偏 AI 工具出海，弱化传统买量，强化 DM、内容、社媒和 Product Channel Fit。`
- `保留 pm 链接不变，把产品经理改成 AI Product Owner，并重写中英文 prompt。`

as a direct execution request, not a brainstorming prompt.

If the request contains enough information, execute end-to-end.

Only ask follow-up questions when missing information would likely break:

- public URL naming
- role identity
- whether an existing role should be renamed or kept stable

## Paths

These are the only paths that matter for JD operations:

- repo root: `.`
- role registry: `roles.json`
- editable source prompts:
  - `prompts/<prompt_slug>.md`
  - `prompts/<prompt_slug>.en.md`
- candidate-facing role page:
  - `docs/<page_slug>.html`
- generated surfaces:
  - `docs/index.html`
  - `README.md`
  - `README.zh-CN.md`
- project-local skill:
  - `.codex/skills/git-hired-jd-ops/SKILL.md`
- operation scripts:
  - `.codex/skills/git-hired-jd-ops/scripts/new_role.py`
  - `.codex/skills/git-hired-jd-ops/scripts/sync_role_page.py`
  - `.codex/skills/git-hired-jd-ops/scripts/sync_registry_surfaces.py`
  - `.codex/skills/git-hired-jd-ops/scripts/validate_roles.py`

## Source Of Truth

`roles.json` is the role registry.

It defines:

- `page_slug`
- `prompt_slug`
- `prompt_base`
- `title_en`
- `title_zh`
- `summary_en`
- `summary_zh`

Do not manually maintain homepage cards or README role lists as separate sources of truth.

Those are generated from `roles.json`.

## Core Rule: Self-Evolving Spec Capture

Do not delete, replace, or forget this rule.

This repo uses `AGENTS.md` as the persistent spec layer.

When reusable engineering rules appear during work, the agent must proactively write them back into the correct `AGENTS.md`.

### Automation Principle

When working in this repo, update `AGENTS.md` automatically without asking the user first if any of the following happens:

- the user states a new development rule, convention, or best practice
- the user asks to record, document, or standardize something
- a new JD workflow or role-maintenance pattern proves reusable
- a new prompt-writing, page-sync, or validation rule becomes stable enough to reuse
- the agent discovers a repeatable fix, design pattern, or repo invariant worth preserving

This applies to:

- root-level repo rules
- module-specific rules
- maintenance workflows
- naming conventions
- sync and validation requirements

### Required Notification Format

After every `AGENTS.md` update, the agent must include this line by itself, with a blank line before and after it:

```text
喵 ฅ՞•ﻌ•՞ฅ 已完成xxx相关的spec，更新/删除AGENTS.md文件中相关内容。
```

If a module-level `AGENTS.md` is changed instead of the repo root, use:

```text
喵 ฅ՞•ﻌ•՞ฅ 已完成xxx相关的spec，更新/删除<模块路径>/AGENTS.md文件中相关内容。
```

### Required Git Persistence Principle

If any `AGENTS.md` file is updated, the agent must immediately persist that change through Git.

Required flow:

1. update the relevant `AGENTS.md`
2. output the `喵` notification
3. run Git with a `docs:` commit message
4. push to the remote branch
5. output the `汪` notification

Required `汪` notification:

```text
汪 U•ᴥ•U 已完成AGENTS.md相关更新的提交并推送。
```

Commit rule:

- every `AGENTS.md` update must use a `docs:` commit type
- the `AGENTS.md` change and its commit/push must happen in the same turn
- use focused `git add` targets, not broad destructive Git operations

### What Counts As Spec

Spec includes, but is not limited to:

- JD maintenance workflows
- role naming and slug conventions
- prompt authoring rules
- bilingual page requirements
- homepage and README generation rules
- validation requirements
- privacy-boundary wording
- GitHub Pages assumptions
- any reusable repo operation pattern worth preserving

### Layered AGENTS Management

Not every spec belongs in the root `AGENTS.md`.

Any folder can own a local `AGENTS.md` when the rules are truly local to that part of the repo.

Hierarchy:

- global spec: root `AGENTS.md`
- module spec: `<module>/AGENTS.md`

Examples of possible module-level specs:

- `docs/AGENTS.md`
- `prompts/AGENTS.md`
- `.codex/skills/git-hired-jd-ops/AGENTS.md`

Placement rule:

- use root `AGENTS.md` for cross-repo rules, shared workflows, and core maintenance principles
- use module-level `AGENTS.md` for local rules that only apply inside that subtree

If a new rule clearly belongs to a subtree, create or update that subtree's `AGENTS.md` instead of bloating the root file.

## Global Candidate Evaluation Principles

These principles apply to every existing JD prompt in this repo and to every future JD add/update request.

Do not remove or weaken them unless the user explicitly asks for it.

1. Respect every candidate absolutely.
2. Do not proactively inspect personal privacy. Evaluate only from job-relevant, objectively observable work evidence.
3. If a candidate has gaps, offer improvement suggestions in an equal, friendly, and constructive tone. Do not sound patronizing.
4. Judge candidates fairly and objectively against the JD and hiring need, not personal taste.
5. If a candidate is clearly strong and fits the role well, explicitly recommend that they send their resume to `wuyupeng@floatmiracle.com`.

When writing or editing prompts, preserve all of the following:

- candidate-respecting tone
- privacy-bounded evidence collection
- constructive development suggestions
- fair JD-based evaluation
- direct resume recommendation for clearly strong-fit candidates

## Consent-First Local Scan Policy

This policy applies to every existing role prompt and every future role prompt in this repo.

1. Do not scan a candidate's local repo, project directory, or document files unless the candidate explicitly allows it in that session.
2. The default mode is `history-only`:
   - local AI session history is allowed
   - explicitly pasted or approved material is allowed
   - repo / local project / document scanning is not allowed unless the candidate opts in
3. Prompts must explicitly tell the candidate:
   - the analysis runs locally on the candidate's own machine
   - any approved scanning stays inside the candidate's own Claude Code or Codex run
   - scanned repo or document content must not be uploaded to our server
4. Prompts must explicitly offer the candidate a choice:
   - `history-only`
   - or allow scanning of specific repos / local projects / files for better scoring
5. If the candidate does not allow scanning repo or document sources, still give the best objective judgment you can from history-only evidence, and state the resulting confidence limits clearly.
6. If consent is unclear, ask a short permission question before scanning any repo or document source.

## README Privacy Emphasis

The first visible section of `README.md` and `README.zh-CN.md` must foreground the privacy guarantee.

That top section must make these points explicit:

1. by default the prompts stay `history-only`
2. repo / project / document scanning requires explicit candidate permission
3. any approved scan runs locally inside the candidate's own Claude Code or Codex session
4. no candidate repo or local file data is uploaded from the candidate's machine to our server

Do not bury this message in later sections. Keep it visible near the top so candidates do not feel tricked, monitored, or data-mined.

## Docs Language Behavior

All candidate-facing HTML pages under `docs/` must follow this language behavior:

1. If the user has a cached manual language choice, respect it first.
2. If there is no cached choice, default to `zh` only when the browser language is Chinese.
3. In every other case, default to `en`.
4. The language switch must persist the user's choice in local storage.
5. The first rendered language should match the resolved default as early as possible, not switch late after obvious content flash.

## What Counts As A One-Sentence JD Operation

The following should be treated as valid single-message execution requests:

### A. Add a new role

Examples:

- `新增一个 AI Sales Engineer 岗位，中文叫 AI 销售工程师，页面 slug 用 sales，强调 outbound automation、CRM、pipeline ownership 和英文沟通。`
- `Add a new Founding Designer role. Chinese title is 创始产品设计师. Use design as the page slug and focus on product taste, fast prototyping, and AI-native workflows.`

Expected result:

- new role entry in `roles.json`
- new bilingual source prompts under `prompts/`
- new role page under `docs/`
- homepage and README role lists regenerated
- validation passed

### B. Update an existing JD

Examples:

- `把 growth 岗位改成更偏 AI 工具出海增长，弱化传统买量，强调 DM、内容、社媒和 Product Channel Fit。`
- `Rewrite the agent role to put more weight on tool use, debugging loops, and ownership under ambiguity.`

Expected result:

- prompt source files updated first
- role page synced from prompts
- if title or summary changed, `roles.json` updated too
- homepage and README regenerated when needed
- validation passed

### C. Rename a role

Examples:

- `保留 pm 链接不变，把产品经理改成 AI Product Owner。`
- `Rename growth to global-growth-lead and update the public URL too.`

Expected result:

- if URL stays the same, keep `page_slug` and `prompt_slug` stable unless explicitly told otherwise
- if URL changes, update wiring carefully and treat it as a breaking rename

## Default Interpretation Rules

When the user gives one sentence, use these defaults:

1. If they named an existing role like `agent`, `pm`, or `growth`, treat it as an edit of that role.
2. If they say `保留链接不变`, never change `page_slug` or `prompt_slug`.
3. If they ask for a new role but did not provide `summary_en` or `summary_zh`, derive both from the JD.
4. If they ask for a new role but did not provide a slug:
   - infer a short ASCII `page_slug`
   - infer a stable `prompt_slug`
   - use `prompt-<page_slug>` as `prompt_base`
5. Keep slugs short, ASCII, stable, and human-readable.
6. Edit prompt source files first. Do not manually maintain embedded prompt blocks by hand unless fixing page structure.
7. Do not rename public URLs casually.

## Canonical Workflow

For every JD operation, follow this order.

### Add a new role

1. Update `roles.json`, or scaffold via:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/new_role.py \
  --page-slug <page_slug> \
  --prompt-slug <prompt_slug> \
  --prompt-base <prompt_base> \
  --title-en "<English title>" \
  --title-zh "<中文标题>" \
  --summary-en "<One-line English summary>" \
  --summary-zh "<一句中文简介>"
```

2. Edit the new source prompts:

```text
prompts/<prompt_slug>.en.md
prompts/<prompt_slug>.md
```

3. Sync the role page:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_role_page.py --page-slug <page_slug>
```

4. Sync generated surfaces:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_registry_surfaces.py
```

5. Validate:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/validate_roles.py
```

### Update an existing role

1. Find the role in `roles.json`
2. Edit:

```text
prompts/<prompt_slug>.en.md
prompts/<prompt_slug>.md
```

3. Sync the page:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_role_page.py --page-slug <page_slug>
```

4. If title or summary changed in `roles.json`, also run:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_registry_surfaces.py
```

5. Validate:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/validate_roles.py
```

### Rename a role

Only do this if the user clearly requested a rename.

Required sequence:

1. update `roles.json`
2. rename files if needed
3. update references and prompt block ids if needed
4. run `sync_role_page.py`
5. run `sync_registry_surfaces.py`
6. run `validate_roles.py`

## Required Invariants

Every completed JD operation must leave the repo in this state:

- every role in `roles.json` has one Chinese and one English prompt source
- every role has one candidate-facing HTML page
- every role page defaults to English
- every role page supports `EN / 中文`
- every role page defaults to cached language choice first, otherwise browser language, with `en` as the fallback
- every role page has only a home link, not cross-role links
- every role page keeps author GitHub info and repo link
- `docs/index.html`, `README.md`, and `README.zh-CN.md` are in sync with `roles.json`
- `validate_roles.py` passes
- every JD prompt preserves the Global Candidate Evaluation Principles above
- every JD prompt preserves the Consent-First Local Scan Policy above

## One-Sentence Prompt Templates

Use these when talking to an AI agent in this repo.

### Add

```text
新增一个 [岗位英文名] 岗位，中文叫 [岗位中文名]，页面 slug 用 [page_slug]，如果需要你可以自己补 prompt slug 和摘要。JD 重点是：[一句话岗位画像]。
```

### Update

```text
把 [page_slug 或现有岗位名] 岗位改成：[一句话新的岗位画像或新的评估重点]。保留现有链接不变。
```

### Rename but keep URL

```text
保留 [page_slug] 链接不变，把这个岗位的中英文标题改成 [新标题]，并把中英文 prompt 一起改到新的 JD 方向。
```

### Rename and change URL

```text
把 [旧岗位] 重命名成 [新岗位]，把 URL 也改掉。请同步更新 roles.json、prompts、docs、README 和首页。
```

## How An Agent Should Respond

When a one-sentence JD request is clear enough:

- do the edits
- run the sync scripts
- run validation
- summarize what changed

Do not stop at:

- only proposing a plan
- only editing one file
- only updating prompts without syncing pages
- only updating pages without syncing `README*`

If the request is not clear enough, ask the minimum necessary clarification.

## Human Quickstart

If you are the maintainer and want the fastest path, open Claude Code or Codex in `git-hired/` and say one of these:

```text
新增一个 Founding Designer 岗位，中文叫创始产品设计师，页面 slug 用 design，强调产品审美、快速原型、用户研究和 AI Native 工作流。
```

```text
把 growth 岗位改成更偏 AI 工具出海增长，弱化传统买量，强调 DM、内容、社媒和 Product Channel Fit。保留现有链接不变。
```

```text
保留 pm 链接不变，把产品经理改成 AI Product Owner，并重写中英文 prompt、摘要和首页文案。
```

## Commit Policy

Inside this repo, commit and push every completed file change by default.

Default rule:

- if a turn changes files and the work is complete, automatically `git add`, `git commit`, and `git push`
- use a focused commit message that matches the change
- do not leave finished file edits unpushed unless the user explicitly says not to push

Validation rule:

- if a relevant validation command exists, run it before commit/push
- if validation fails, fix or report the issue before pushing

Opt-out:

- if the user explicitly says not to commit or not to push, follow that instruction instead

AGENTS update rule:

- if this turn updates any `AGENTS.md`, commit and push automatically in the same turn
- if the commit is primarily about `AGENTS.md`, use the `docs:` prefix
