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

## Product Manager Prompt Evidence Discipline

This rule applies to the `Product Manager` role prompt and to any future PM-like role prompt.

When evaluating PM candidates:

1. Distinguish candidate-authored product judgment from AI-generated or AI-polished product language.
2. Treat pasted PRDs, generic rewrite requests, and polished PM wording without explicit reasoning as weak evidence, not strong PM signals.
3. Treat the following as stronger PM evidence:
   - original prioritization calls
   - scope cuts and MVP boundary decisions
   - tradeoff reasoning
   - acceptance criteria
   - critique of an AI draft with clear rationale
   - explicit product decisions that change implementation or launch direction
4. Do not infer team-driving ability, collaboration momentum, or cross-functional leadership from solo AI chat alone.
5. Only treat collaboration and tempo as strong signals when there is human-collaboration evidence, such as:
   - handoff notes
   - stakeholder or teammate coordination artifacts
   - issue or planning threads
   - launch checklists with ownership and sequencing
   - meeting notes or decision logs
6. If collaboration evidence is thin, mark that dimension as `N/A` or low-confidence instead of treating the absence of evidence as proof of weakness.

## Global Growth Prompt Social-Native Signal

This rule applies to the `Head of Global Growth` role prompt and to any future growth-lead role prompt.

When evaluating growth candidates:

1. Include a distinct scoring dimension for social-media-native intuition or implicit social-platform experience.
2. Do not confuse generic content production, posting frequency, or surface social familiarity with real social-distribution judgment.
3. Treat the following as stronger evidence of social-native growth skill:
   - platform-specific hook or format judgment
   - understanding of creator, comment, reply, or community loops
   - platform-aware localization
   - social-signal mining from comments, DMs, or community behavior
   - reasoning about why a tactic fits Twitter/X, Reddit, TikTok, LinkedIn, Discord, YouTube, or similar platforms differently
4. Treat the following as weak evidence unless paired with clear reasoning:
   - generic content calendars
   - vague “I did social media” claims
   - follower counts without operating logic
   - generic ad or content jargon with no platform specificity
5. If social-native evidence is thin, lower confidence on that dimension instead of inventing experience.

## Role Title Style

This rule applies to `roles.json`, candidate-facing pages, README role lists, and prompt source files.

Default title style:

1. Use clean functional titles in both English and Chinese.
2. Do not add level markers such as `Head of`, `Lead`, `Specialist`, `Manager`, `负责人`, `专员`, or similar by default.
3. Only keep or add seniority markers when the user explicitly asks for them.
4. Prefer short, stable, candidate-facing titles that match the public page and prompt wording.

## Candidate-Facing Prompt Output

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, and the role template in `new_role.py`.

1. The final output is for the candidate to read, not for the interviewer or hiring team.
2. Do not include interviewer-facing sections such as interview plans, recruiter follow-up questions, or hiring-team instructions.
3. If the report suggests discussion topics, phrase them as candidate-facing preparation guidance, for example:
   - `If you choose to apply, be ready to talk about...`
4. The tone must remain respectful, equal, and useful to the candidate's own growth.
5. Public prompt output may be playful, meme-friendly, and a little sharp, but it must never become insulting, humiliating, or contemptuous.

## Universal Entry Flow

This rule applies to `docs/index.html`, the universal-entry page under `docs/`, and any future shared test-entry surface.

1. The homepage must include a clear universal test entry in addition to role-specific entries.
2. The universal entry should send the candidate into a short intake flow before showing the prompt.
3. That intake flow must collect:
   - the candidate's current profession
   - the candidate's target profession
4. After profession intake, the universal entry must clearly explain the two privacy modes:
   - `history-only`
   - allow scanning of specific local repos / projects / files after explicit approval
5. The universal-entry prompt must carry the candidate's profession context and chosen privacy preference into the generated prompt text.

## Candidate-Serving Shared Pages

This rule applies to `docs/index.html`, `docs/general.html`, and any future shared entry or landing page.

1. Treat these pages as candidate-serving surfaces, not recruiter-operating surfaces.
2. Use candidate-facing headings and action labels, for example `How To Start`, not recruiter phrasing such as `How To Send This`.
3. Explain next steps from the candidate's point of view:
   - which test to choose
   - how privacy works
   - what they will get after running the prompt
4. Avoid employer-facing copy on shared pages, such as:
   - screening instructions
   - internal hiring-process framing
   - recruiter workflow language

## Candidate-Serving JD Descriptions

This rule applies to `roles.json`, the role cards in `docs/index.html`, every public role page under `docs/`, and the role-page template in `new_role.py`.

1. Treat public JD descriptions as copy written for the candidate, not for the recruiter.
2. Role-card summaries should help the candidate choose the right test, not describe the candidate in third person.
3. Prefer direct candidate-facing phrasing such as:
   - `Use this if you want to show...`
   - `This test helps you surface...`
4. Avoid recruiter-facing phrasing such as:
   - `See whether a candidate...`
   - `看候选人是否...`
   - `Message To Send The Candidate`
   - `把结果私信发我`
5. On role pages, explain:
   - how the candidate starts the test
   - what the test helps the candidate show
   - what privacy boundary applies while they run it

## HIRED TUI Output

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, the universal-entry prompt, and the role template in `new_role.py`.

1. The terminal output should feel like a candidate-facing hero portrait, not a dry audit log.
2. The first visual block in the terminal must be a readable ASCII banner whose main word is exactly `HIRED`, not a sparse single-letter block.
3. After the `HIRED` header, the terminal summary should present:
   - a subtitle or portrait label
   - a result tier
   - a memorable archetype title plus short acronym
   - an ability score
   - a compact signal board
   - strongest signals
   - upgrade path
   - the local detailed-report path
   - a fictional annual-package hook near the end
4. The summary should remain TUI-friendly, skimmable, and easy to share. Keep it concise enough to read comfortably in a terminal.
5. Detailed evidence belongs in a local markdown report, not in the terminal summary.
6. Score more harshly than a feel-good internet quiz:
   - `90+` or `9-10/10` should be rare
   - `75-89` or `7-8/10` is already clearly strong
   - `60-74` or `5-6/10` is solid but not rare
   - below `60` or `0-4/10` means meaningful gaps, thin proof, or inconsistent evidence
7. If evidence is thin, round down and say so explicitly instead of flattering the candidate.

## Fictional Compensation Hook

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, the universal-entry prompt, and the role template in `new_role.py`.

1. Near the end of the TUI summary, include one short `Fantasy annual package` line as a social-sharing hook.
2. It must be explicitly marked as fictional, for fun, and not a real offer or compensation promise.
3. Use language-local currency:
   - English output: USD
   - Chinese output: RMB
4. Tie the band to the strict result tier rather than printing a generic number.
5. Invent a playful fictional company name on the spot every time.
6. Fictional company names may parody startup or big-tech vibes, but they must not imply a real employer made the offer.
7. The hook may be a little spicy or teasing, but it must still respect the candidate and avoid personal humiliation.

## Local Detailed Report Output

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, and the role template in `new_role.py`.

1. Every role prompt should ask the agent to generate a concise TUI summary plus a more detailed local `.md` report.
2. The terminal summary must print the local path of that markdown report.
3. The markdown report must also stay candidate-facing.
4. The markdown report should encourage the candidate to keep or attach it if they decide to apply.
5. The markdown report must remain privacy-bounded and de-identified.

## Extended-Mode Redaction

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, and the role template in `new_role.py`.

1. If the candidate runs the prompt in extended mode, the markdown report must redact more aggressively than the terminal summary.
2. Never expose raw repo names, org names, branch names, file paths, issue numbers, domains, customer names, emails, internal URLs, or secrets in the extended-mode markdown report.
3. Replace sensitive identifiers with placeholders such as `[REPO]`, `[ORG]`, `[FILE]`, `[URL]`, `[CUSTOMER]`, and `[SECRET]`.
4. Do not paste raw logs, raw transcripts, raw tables, or secret-bearing text into the markdown report.

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
