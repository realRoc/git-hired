# git-hired Agent Guide

This file defines how maintenance agents should operate inside this repo.

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
   - `git-hired` does not upload candidate repo or local file data to our server
   - the chosen work agent may inspect only the projects, files, or knowledge-base material the candidate explicitly authorizes for that run
   - if the chosen work agent supports direct local access, any approved scanning should stay inside the candidate's own machine or connected workspace whenever possible
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
3. `git-hired` does not upload candidate repo or local file data to our server
4. the chosen work agent may inspect only the projects, files, or knowledge-base material the candidate explicitly authorizes
5. if the chosen work agent supports direct local access, any approved scan should stay inside the candidate's own machine or connected workspace whenever possible

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
6. Lead with the candidate's strongest evidence-backed strengths before discussing gaps.
7. If the candidate is not a strong fit for the tested role, explicitly help them by recommending the role or direction they currently look best suited for.

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
5. Candidate-facing copy must describe runtime compatibility as examples, not exclusivity. Use wording such as:
   - `Claude Code, Codex, Notion AI, or any work agent with knowledge-base and memory capability`
   - `Claude Code、Codex、Notion AI，或任何具备知识库和记忆能力的工作 agent`
6. Candidate-facing copy must explicitly say:
   - `git-hired` does not upload candidate repo or local file data to our server
   - the chosen work agent should inspect only the projects or files the candidate explicitly authorizes
7. If a page includes a runtime tip, phrase it conditionally, for example:
   - `If you're using Claude Code or Codex, bypass / YOLO usually makes the run smoother.`
8. On `docs/index.html`, the hero copy should follow this order:
   - first, one short sentence that introduces `git-hired` as a way to test the candidate's `MBTI work personality` from how they actually work
   - second, one explicit privacy line saying we do not upload local repo, file, or other local data to our server
   - third, let the page flow into the universal-entry section

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
   - one short bilingual runtime tip that conditionally mentions Claude Code `bypass` mode or Codex `YOLO` mode when the candidate is using those tools
6. When describing how to start the test, do not frame Claude Code or Codex as the only supported runtimes. Present them as examples of compatible work agents alongside Notion AI and other memory-enabled work agents.

## HIRED TUI Output

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, the universal-entry prompt, and the role template in `new_role.py`.

1. The terminal output should feel like a candidate-facing hero portrait, not a dry audit log.
2. The first visual block in the terminal must be a readable ASCII banner whose main word is exactly `HIRED`, not a sparse single-letter block.
3. After the `HIRED` header, the terminal summary should present:
   - a subtitle focused on `MBTI work personality`
   - a result label
   - the best-fit role right now
   - an MBTI work personality type
   - MBTI confidence or evidence strength
   - an ability score
   - a compact core board
   - talent tags
   - locked or not-yet-awakened skills
   - a matching MBTI ASCII card rendered directly in the terminal when possible
   - the local detailed-report path
4. The summary should remain TUI-friendly, skimmable, and easy to share. Keep it concise enough to read comfortably in a terminal.
5. Detailed evidence belongs in a local markdown report, not in the terminal summary.
6. Score more harshly than a feel-good internet quiz:
   - `90+` or `9-10/10` should be rare
   - `75-89` or `7-8/10` is already clearly strong
   - `60-74` or `5-6/10` is solid but not rare
   - below `60` or `0-4/10` means meaningful gaps, thin proof, or inconsistent evidence
7. If evidence is thin, round down and say so explicitly instead of flattering the candidate.
8. Avoid essay-like explanation in the TUI. Prefer labels, tags, fragments, and compressed lines over paragraphs.
9. In the TUI, sections like talent tags and locked skills should read like a game system, not like an HR memo.
10. The `HIRED` header should use a simple animated reveal or pulse in the terminal when possible, but it must stay dependency-free and terminal-safe.
11. The `HIRED` ASCII art should feel more dimensional and more legible than a flat block. Prefer a bold, easy-to-recognize shape over decorative noise.
12. Do not require external packages, terminal UI libraries, or browser-only rendering tricks for the `HIRED` animation. The effect must work as plain terminal output.
13. Do not reintroduce opaque labels such as custom alignment codes or obscure archetype acronyms. The visible identity system should use standard MBTI letters directly.

## Best-Fit Role Recommendation

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, the universal-entry prompt, and the role template in `new_role.py`.

1. Do not print salary ranges, compensation bands, fictional packages, or offer-like hooks anywhere in the terminal summary or markdown report.
2. Instead, give a clear `best-fit role right now` recommendation based on the evidence.
3. If the tested role is not the best fit, say which direction looks more natural and why.
4. For weaker or mismatched candidates, the recommendation must still be helpful from the candidate's point of view:
   - what role or direction looks stronger right now
   - what evidence is missing for the tested role
   - what to improve next

## MBTI Work Personality Output

This rule applies whenever adding or editing any role prompt in `prompts/`, the universal-entry prompt, or the role template in `new_role.py`.

1. Do not let Step 5 drift into analyst prose or a diagnostic essay.
2. The visible goal of the test should be framed as `test your MBTI work personality`, not as a custom in-house alignment quiz.
3. Every TUI output must use standard MBTI letters directly:
   - `E / I`
   - `S / N`
   - `T / F`
   - `J / P`
4. MBTI here is a work-style read from observable evidence, not a life-wide personality claim. Keep that boundary explicit in prompts and reports.
5. Infer each MBTI axis conservatively from work evidence:
   - `E / I`: outward collaboration loops vs quieter solo synthesis
   - `S / N`: concrete execution detail vs abstraction and pattern synthesis
   - `T / F`: tradeoff logic vs people or user-attunement
   - `J / P`: structure and closure vs exploration and adaptation
6. If one or more axes are weakly evidenced, lower confidence rather than forcing certainty.
7. Replace long “why this works” explanation blocks with exactly 3 `Talent Tags`.
8. Talent tags must be noun-phrase style, not mini paragraphs:
   - short
   - label-first
   - highly compressible
   - screenshot-friendly
9. Replace ordinary weakness/improvement sections with 2-3 `Locked Skills`, `Version Bottlenecks`, or `Not-Yet-Awakened` abilities.
10. Those “gap” sections must still be respectful and useful to the candidate. Game framing should remove HR stiffness, not empathy.
11. The visible TUI score board should be compressed to 4-5 core dimensions for each role, not 8-9 spreadsheet lines.
12. Step 4 may still use evidence-rich analysis internally, but the candidate-facing surface must present only the compressed core board.
13. When creating or revising a role, the 4-5 core dimensions should be custom to that role rather than generic boilerplate.
14. Avoid generic AI flourish such as:
   - “you are not just X, you are Y”
   - long motivational framing
   - over-explaining obvious strengths in full sentences
15. Prefer direct definitions such as:
   - MBTI work personality
   - talent tags
   - locked skills
   - best-fit role
16. In the visible `Core Board`, do not use dotted label rows like `Spec Control ........ 7/10 [#######---]`.
17. Use a clearer bar-first format such as `[████████░░] 8` or another equivalent block-bar rendering that keeps the numeric score obvious at a glance.
18. Do not decorate every visible line with repeated prefixes such as `>>`.
19. In the terminal summary, reserve strong decoration for the `HIRED` banner itself. After that, prefer plain labels such as:
   - `MBTI Work Personality`
   - `Result`
   - `Core Board`
   - `Talent Tags`
   - `Locked Skills`
   - `Next Step`
20. Avoid visual noise that makes the report feel like raw debug output. The TUI should read like a clean card, not a terminal log dump.

## Runtime Budget

This rule applies whenever adding or editing any role prompt in `prompts/`, the universal-entry prompt, embedded prompts under `docs/`, the role template in `new_role.py`, or related validation rules.

1. The default runtime target for a test is `within about 1 minute`.
2. Prompts must explicitly tell the agent to optimize for fast, good-enough evidence gathering rather than exhaustive scanning.
3. If the candidate exposes a large amount of local history or project material, the agent should:
   - sample recent, high-signal material first
   - prefer bounded reads over deep crawls
   - stop once confidence is sufficient
   - state when the result is based on a fast sample
4. Do not silently sprawl into long scans just because more data is available.
5. If evidence is still thin at the end of the time budget, the agent should finish with a lower-confidence result rather than running indefinitely.
6. When prompts mention data sources, they should frame them as bounded, recent, or small-scope sources unless the candidate explicitly asks for a deeper pass.
7. `new_role.py`, public prompts, and validation rules must all carry this time-budget constraint so future JD edits inherit it automatically.

## MBTI ASCII Card Assets

This rule applies whenever adding or editing any role prompt in `prompts/`, the universal-entry prompt, the role template in `new_role.py`, or any asset under `docs/assets/mbti/`.

1. The canonical MBTI ASCII deck lives under `docs/assets/mbti/`.
2. Maintain one predesigned ASCII card per MBTI type:
   - `intj.txt`, `intp.txt`, `entj.txt`, `entp.txt`
   - `infj.txt`, `infp.txt`, `enfj.txt`, `enfp.txt`
   - `istj.txt`, `isfj.txt`, `estj.txt`, `esfj.txt`
   - `istp.txt`, `isfp.txt`, `estp.txt`, `esfp.txt`
3. Keep `docs/assets/mbti/manifest.json` aligned with the actual asset files.
4. Candidate-facing prompts should reference the public asset URL pattern:
   - `https://realroc.github.io/git-hired/assets/mbti/<mbti-lowercase>.txt`
5. In terminal output, place the MBTI ASCII card immediately below the `HIRED` header by printing the raw text card directly in the TUI.
6. Prefer the repo text asset itself over a generated substitute. Only fall back to a compact emblem when the asset file cannot be loaded.
7. Do not use SVG, raster images, or inline-image assumptions for the MBTI deck. This repo’s MBTI visuals are terminal-first text assets.
8. Do not generate a fresh one-off visual style during the test. Reuse the predesigned ASCII deck so the result is consistent and recognizable across candidates.

## Per-JD Prompt Versioning

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, the universal-entry prompt, and the role template in `new_role.py`.

1. Every JD prompt must carry an explicit version identifier for that role.
2. Version history is per JD, not global. Different roles may iterate on different version numbers or version strings independently.
3. The English and Chinese source prompts for the same JD must always carry the same version identifier.
4. Every time a role's prompt source changes, bump that role's version before syncing the page, even if the change is only to emphasis, wording, scoring dimensions, evidence rules, privacy wording, or output structure.
5. The candidate-facing report must record the exact JD prompt version used to generate it so the hiring team can trace which evaluation focus was active at that time.
6. If the terminal summary shows version info, it must match the version recorded in the local markdown report.
7. When syncing prompt content into `docs/`, keep the embedded prompt version aligned with the source prompt files.

## Local Detailed Report Output

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, and the role template in `new_role.py`.

1. Every role prompt should ask the agent to generate a concise TUI summary plus a more detailed local `.md` report.
2. The terminal summary must print the local path of that markdown report.
3. The markdown report must record the exact JD prompt version used to generate the report.
4. The markdown report must also stay candidate-facing.
5. The markdown report should encourage the candidate to keep or attach it if they decide to apply.
6. The markdown report must remain privacy-bounded and de-identified.

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

3. Initialize the new role's prompt version in both source prompts and keep the Chinese and English version identifier identical.

4. Sync the role page:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_role_page.py --page-slug <page_slug>
```

5. Sync generated surfaces:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_registry_surfaces.py
```

6. Validate:

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

3. Bump that role's prompt version in both source prompts for every prompt update, and keep the version identifier identical across languages.

4. Sync the page:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_role_page.py --page-slug <page_slug>
```

5. If title or summary changed in `roles.json`, also run:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_registry_surfaces.py
```

6. Validate:

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
- every JD prompt has a traceable per-role version identifier, aligned across Chinese, English, and embedded prompt content
- every candidate-facing report records the exact JD prompt version used for that run
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

If you are the maintainer and want the fastest path, open your repo-capable coding agent in `git-hired/` and say one of these:

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
