# git-hired Agent Guide

This file defines how maintenance agents should operate inside this repo.

## Scope

This `AGENTS.md` applies to everything under `git-hired/`.

Primary goal:

- let a maintainer add or update a JD with one sentence
- keep `roles.json`, `prompts/`, `docs/`, and `README*` consistent
- avoid half-finished role changes

Treat a natural-language request like:

- `新增一个 AI Sales Engineer 岗位，中文叫 AI 销售工程师，页面 slug 用 sales，强调 outbound automation、CRM、pipeline ownership 和英文沟通。`
- `把 growth 岗位改成更偏 AI 工具出海，弱化传统买量，强化 DM、内容、社媒和 Product Channel Fit。`

as a direct execution request, not a brainstorming prompt. Execute end-to-end if the request contains enough information. Only ask follow-up when missing info would break public URL naming, role identity, or rename stability.

## Source Of Truth

`roles.json` is the role registry, defining `page_slug`, `prompt_slug`, `prompt_base`, `title_en`, `title_zh`, `summary_en`, `summary_zh`.

Recruitment display order:

1. Global Growth / 海外增长
2. Agent Engineer / Agent 工程师
3. Product Manager / 产品经理
4. Product Operations / 产品运营

Treat the array order in `roles.json` as display priority. Do not prefix Agent Engineer or Product Operations with `AI`. Keep URL slugs stable unless the user explicitly asks to change links.

README role lists are optional. If present, they must come from `roles.json`; if the README positioning is sharper without that block, omit it.

## Self-Evolving Spec Capture

When reusable engineering rules appear during work, the agent must write them back into the correct `AGENTS.md` automatically (without asking) if:

- the user states a new rule, convention, or best practice
- the user asks to record or standardize something
- a reusable workflow pattern or repo invariant is discovered

After every `AGENTS.md` update:

1. Output: `喵 ฅ՞•ﻌ•՞ฅ 已完成xxx相关的spec，更新/删除AGENTS.md文件中相关内容。`
2. Commit with a `docs:` message, push in the same turn
3. Output: `汪 U•ᴥ•U 已完成AGENTS.md相关更新的提交并推送。`

Use root `AGENTS.md` for cross-repo rules. Use module-level `AGENTS.md` (e.g. `docs/AGENTS.md`, `prompts/AGENTS.md`) for rules local to that subtree.

## Global Candidate Evaluation Principles

These apply to every JD prompt, existing and future:

1. Respect every candidate absolutely.
2. Do not proactively inspect personal privacy. Evaluate only from job-relevant, objectively observable work evidence.
3. If a candidate has gaps, offer improvement suggestions in an equal, friendly, constructive tone.
4. Judge candidates fairly against the JD and hiring need, not personal taste.
5. If a candidate is clearly strong and fits well, explicitly recommend sending their resume to `wuyupeng@floatmiracle.com`.

## Consent And Evidence Policy

This merges the consent-first scan policy with history-only analysis rules. Applies to `skill.md`, every role prompt, every embedded prompt, and the role template.

### Default mode: history-only

- Local AI session history and explicitly pasted material are allowed
- Repo / local project / document scanning requires explicit candidate opt-in
- Prompts must tell the candidate: `git-hired` does not upload repo or local file data to our server; the agent inspects only what the candidate explicitly authorizes

### Consent flow

- Offer the candidate a choice: `history-only` or allow scanning of specific repos/projects/files
- If consent is unclear, ask a short permission question before scanning

### Auto analysis after consent

- After the candidate answers the target role question and the privacy question, move into evidence collection automatically
- Do not replace missing repo access with manual competency Q&A
- In history-only mode, directly inspect allowed session-history and approved work traces, then complete the full evaluation
- If evidence is thin, finish with lower confidence or ask one narrow follow-up permission question for a specific data source — do not turn the test into a human interview
- Role prompts should ask only the minimum questions needed to route the role lens and resolve the privacy boundary

### Candidate deliverables

- A designed `HIRED` TUI summary
- A detailed local markdown report when file writing is available

## README First Screen

The first visible section of `README.md` and `README.zh-CN.md` must establish the product mental model before explaining privacy or agent execution:

1. `git-hired` is the reputation layer for AI-native workers
2. It answers `Are you a Builder or a Seller in the AI-native workplace?`
3. It helps people prove how they create value in the AI era, inspired by `Learn to sell, learn to build`
4. Default path: simple test → Builder/Seller mode → challenge → proof → reputation
5. The deeper agent report is optional and runs inside the user's own work agent

## Docs Language Behavior

All candidate-facing HTML pages under `docs/`:

1. Respect cached manual language choice first
2. Default to `zh` only when browser language is Chinese; `en` otherwise
3. Persist language choice in local storage
4. Match resolved default as early as possible — no late content flash

## Candidate-Facing Prompt Output

Applies to every role prompt and the role template:

1. Final output is for the candidate, not the interviewer
2. No interviewer-facing sections (interview plans, recruiter follow-ups, hiring-team instructions)
3. Tone: respectful, equal, useful. May be playful and sharp, never insulting
4. Lead with evidence-backed strengths before discussing gaps
5. If the candidate is not a strong fit, recommend the role or direction they look best suited for

## Skill Entry Flow

Applies to `skill.md`, `docs/skill.md`, `docs/index.html`.

- `skill.md` is the canonical agent-readable entry spec. `docs/skill.md` must stay content-identical.
- The top of `skill.md` must be execution-first: treat as active instructions, do not summarize, send the first role question immediately.
- First interaction: introduce `git-hired` briefly, ask the candidate for the target role.
- If a supported role is named, fetch the corresponding prompt immediately.
- If no clear target, ask for current profession first, then route into universal calibration.
- Default starter command: `read https://realroc.github.io/git-hired/skill.md`
- Homepage must not make `skill.md` the primary first-screen path.

## Simple Builder/Seller Test

Applies to `docs/index.html`, `docs/start.html`, `docs/quick-test.js`, `docs/style.css`, READMEs.

### Product model

- `git-hired = AI-native workers' reputation layer`
- Primary hook: `Are you a Builder or a Seller in the AI-native workplace?`
- User path: Test → Mode → Challenge → Proof → Reputation
- The quick test is the entry point, not the final product.
- Builder proves value through build challenges: products, systems, prototypes, workflows, automations.
- Seller proves value through sell challenges: expression, narrative, distribution, sales, recruiting, propagation.

### Quiz rules

- No hero section or pre-test explainer above the quiz — first surface is progress bar and current question
- Compact merged topbar + progress as one test status bar
- 10 questions, 4 options each, single-choice only
- Measure whether the candidate more naturally creates value by building or selling
- Plain concrete answer options, no clever labels or personality-test coding
- Do not keep the old six archetypes or any MBTI-style expression.
- Scoring returns exactly one primary mode: `Builder` or `Seller`.

### Two reputation modes

- `Builder` / `构建者`: creates value by building products, systems, prototypes, workflows, and automations.
- `Seller` / `销售者`: creates value by expression, narrative, distribution, sales, recruiting, and propagation.
- Do not use job-like result categories (Product type, Engineer type, etc.) as the primary result.

### Result card — first layer only

- Compact result-card topbar matching quiz chrome
- `git-hired` ASCII identity art as compact brand header
- `Your mode` / `你的模式` + `Builder` or `Seller` + one-line explanation
- `Your strengths` / `你的优势`
- `Your edge` / `你的优势场`
- `Watch out` / `需要注意`
- `Next proof` / `下一步证明`

Do not show: old six archetypes, role fit, ability score, evidence strength, confidence, local report path, runtime mode, history-only, locked skills, hiring recommendation.

### After the result card

- Challenge entry: Builder gets a build challenge; Seller gets a sell challenge
- Hiring signal entry: explain that challenge proof can become a reputation signal for teams
- Optional advanced-agent entry can remain secondary
- Three trust points: user chooses evidence, no local files uploaded, user decides what to share
- Button: `Copy agent prompt` / `复制 Agent 指令`

### Share

- Primary action: `Share` / `分享` — generate portrait-oriented mobile-friendly share image, write PNG to clipboard
- Text-copy fallback only for browsers without image clipboard support
- Result page keeps `Share` as the primary action, and also offers `Copy profile`, `Download image`, `Share on X`, and `Share on LinkedIn`.
- Public profile URL can be static and account-free at first, using `start.html?result=<builder|seller>` or an equivalent URL parameter/hash.
- Team waitlist is a weak secondary result-page entry, not a homepage or primary result CTA.

## Protocol Positioning

Applies to READMEs, `docs/index.html`, audience pages, `rubric.md`, `examples/`.

### Public positioning

- `git-hired is an open-source reputation layer for AI-native workers.`
- Primary hook: `Are you a Builder or a Seller in the AI-native workplace?`
- Homepage must make clear that the quick test leads into challenge proof and future reputation, not a standalone personality-test ending.
- Work-trace and public profile language belongs to the optional deeper-agent path or challenge/proof path, not homepage first screen overload.

### Trust structure

- User-selected historical work traces, verifiable inspectable output, local-first execution, open-source rules, user-controlled disclosure
- Public trust copy: No server. No account. No upload. No tracking. Runs in your own AI agent. You decide what to include and share.

### Three public hooks (homepage leads with #1 only)

1. Personal sharing: `Are you a Builder or a Seller in the AI-native workplace?`
2. Job/collaboration: `Turn real challenge proof into a hiring signal.`
3. Founder/team: `Find AI-native workers who can build or sell with agents.`

### Evidence ladder

- Level 0: paste text into any agent, no file access
- Level 1: analyze public GitHub profile/PR/README
- Level 2: analyze selected repos/files chosen by candidate
- Level 3: analyze local agent history/workspace, opt-in only

### Reports

- Private report: detailed evidence, reasoning, specific work traces, candidate-only next steps
- Public card: Builder/Seller mode, strengths, collaboration mode, best-fit challenges, anonymized evidence
- Default share object is the public-safe card

### Audience pages

Maintain `docs/candidate.html`, `docs/evaluator.html`, `docs/contributor.html` as concise protocol pages (not marketing landing pages). No first-screen entry splitting on homepage.

## Mobile Quick Test Entry

Applies to `docs/start.html`, `docs/quick-test.js`, `docs/style.css`.

- Extremely mobile-friendly: narrow screens, no desktop-only agent runtime, ~1 minute, shareable result
- Step-by-step flow, one question visible, thumb-friendly single-tap
- Result is builder-profile-only, rendered as structured DOM (not raw markdown)
- Clearly label as simple self-report / quick-signal (not same evidence quality as agent deep test)
- Same privacy posture: no local scanning, no upload, browser-local state only
- QR code entry allowed but not on homepage first path

## Candidate-Serving JD Descriptions

Applies to `roles.json`, role cards in `docs/index.html`, role pages under `docs/`.

- Written for the candidate, not the recruiter
- Use `This test helps you surface...` not `See whether a candidate...`
- Role pages: explain how to start, what the test shows, privacy boundary, one bilingual runtime tip
- Show a compact copyable command in hero section, route through `skill.md`
- Full long prompts are implementation detail, not candidate-facing page content
- No `role-test` eyebrow or ordinal label above role title

## Public Footer Style

Every public HTML page under `docs/`:

- Chinese: `MIT 开源 — git hired 还是 git rejected，你说了算。` + `$ whoami 作者：realRoc。 仓库地址：github.com/realRoc/git-hired。`
- English: direct equivalent preserving MIT, `git hired`/`git rejected`, `$ whoami`, `realRoc`, repo link
- No source prompt filenames or links in footer. Horizontally centered on desktop and mobile.
- `docs/404.html` uses English footer (no language switch).

## HIRED TUI Output

Applies to every role prompt and the role template.

### Structure

1. Readable ASCII `HIRED` banner (bold, dimensional, dependency-free)
2. One public-safe builder card with this section order:
   - `[ git-hired ] ... builder card` header rail
   - Role/builder identity in uppercase + result badge
   - Evidence and scope line
   - `SIGNALS` — dimensions: agency, ai fluency, debug maturity, product sense, taste, trust, communication (1/5 to 5/5 with block bars)
   - `STRENGTHS` and `GAPS`
   - `NEXT`
   - Footer: `git-hired · local-only · candidate-controlled · MIT`

### Style rules

- TUI-friendly, skimmable, easy to share. Detailed evidence goes in local markdown report.
- Compressed 4-5 core dimensions per role in visible score board, custom to each role
- Bar-first format: `[█████████░] 92` — no dotted label rows
- Prefer labels, tags, fragments over paragraphs. Reserve strong decoration for HIRED banner and card frame only.
- No MBTI, personality-test labels, or opaque archetype codes anywhere
- Builder type labels: `Prototype Hacker`, `Agent Orchestrator`, `Product Shaper`, `Systems Builder`, `Growth Experimenter`, `Taste-driven Designer`, `Debugging Detective`, `Operator Builder`
- Talent tags: 3 noun-phrase style, short, label-first, screenshot-friendly
- Gaps framed as `Locked Skills` / `Not-Yet-Awakened` — respectful game framing, not HR stiffness

## Runtime-Aware Report Rendering

If the runtime is rich-text, chat-bubble, or Notion-like (not a true terminal):

- Skip animated reveal and wide ASCII layouts
- Keep same info and section order, render as compact narrow card or fenced code block
- Prioritize legibility over decoration

## Best-Fit Role And Next Step

Applies to every role prompt and the role template.

- No salary ranges or compensation in output
- Give a clear `best-fit role right now` recommendation based on evidence
- If tested role is not best fit, say which direction looks more natural and why
- For weaker candidates: recommend stronger direction, state missing evidence, suggest what to improve
- `Next Step`: one concrete action, with a conservative uplift estimate (which dimension improves, approximate score increase). Use estimate language (`likely`, `approximately`).

## Eval And Release Gates

- Default development branch: `dev`. Day-to-day work goes on `dev`.
- `main` is the release branch. Do not push feature work to `main` directly.
- Before promoting `dev` to `main`, run: sync registry surfaces → sync skill.md → validate roles → skill-output contract evals → whitespace/diff checks
- Contract evals protect: execution-first skill.md, consent-first default, builder card shape, no MBTI, required SIGNALS/STRENGTHS/GAPS/NEXT sections, local-only footer, rich-text fallback
- Analytics contract evals protect the public PostHog funnel: every HTML page loads `analytics.js`, PostHog uses the production key/host with pageview and autocapture enabled and session recording disabled, and the events `$pageview`, `click_start`, `select_role`, `start_quiz`, `complete_quiz`, `view_result`, `click_share`, `copy_profile`, `download_card`, `share_x`, `share_linkedin`, `create_public_profile`, `click_team_waitlist` remain wired with useful properties.
- Eval fixtures must use fictional/redacted data only
- After evals pass on `dev`, start a local docs server for human review. Do not merge to `main` until maintainer confirms.

## Local Report And Redaction

- Every role prompt generates a TUI summary + detailed local `.md` report
- Markdown report records exact JD prompt version, stays candidate-facing, encourages attaching when applying
- In extended mode, redact aggressively: replace repo names, org names, file paths, URLs, customer names with `[REPO]`, `[ORG]`, `[FILE]`, `[URL]`, `[CUSTOMER]`, `[SECRET]`

## One-Sentence JD Operations

### Default interpretation

1. Named existing role (`agent`, `pm`, `growth`) → edit that role
2. `保留链接不变` → never change `page_slug` or `prompt_slug`
3. Missing summary → derive from JD
4. Missing slug → infer short ASCII slugs
5. Edit prompt source files first. Do not manually maintain embedded prompt blocks.

### Canonical workflow: Add

1. Update `roles.json` (or scaffold via `new_role.py`)
2. Edit bilingual source prompts under `prompts/`
3. Sync role page: `sync_role_page.py --page-slug <slug>`
4. Sync generated surfaces: `sync_registry_surfaces.py`
5. Validate: `validate_roles.py`

### Canonical workflow: Update

1. Edit `prompts/<prompt_slug>.md` and `.en.md`
2. Sync page: `sync_role_page.py --page-slug <slug>`
3. If title/summary changed, also run `sync_registry_surfaces.py`
4. Validate: `validate_roles.py`

### Canonical workflow: Rename

Only when user clearly requested. Update `roles.json` → rename files if needed → update references → sync role page → sync surfaces → validate.

### Required invariants

- Every role has bilingual prompt sources, one HTML page, EN default with EN/中文 switch
- `docs/index.html` in sync with `roles.json`
- `validate_roles.py` passes
- Every JD prompt preserves Global Candidate Evaluation Principles and Consent Policy above

## Commit Policy

- If a turn changes files and work is complete, automatically `git add`, `git commit`, `git push`
- Run validation before commit if applicable
- If validation fails, fix or report before pushing
- User can opt out by explicitly saying not to commit/push
