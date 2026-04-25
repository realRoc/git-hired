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
- agent-readable entry spec source: `skill.md`
- deployed agent-readable entry spec: `docs/skill.md`
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

## Recruitment Display Priority

This rule applies to `roles.json`, generated homepage role cards, README role lists, and any future public role index.

Default recruitment display order:

1. Global Growth / 海外增长
2. Agent Engineer / Agent 工程师
3. Product Manager / 产品经理
4. Product Operations / 产品运营

Treat the array order in `roles.json` as the source of truth for this public display priority, then regenerate registry-driven surfaces instead of hand-editing homepage cards.

Public role-title wording rule:

- Do not prefix the Agent Engineer role with `AI`; use `Agent Engineer` / `Agent 工程师`.
- Do not prefix the Product Operations role with `AI`; use `Product Operations` / `产品运营`.
- Keep URL slugs and prompt file slugs stable unless the user explicitly asks to change links.

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

## Skill Entry Flow

This rule applies to `skill.md`, `docs/skill.md`, `docs/index.html`, and any future shared test-entry surface.

1. `skill.md` is the canonical agent-readable entry spec for Claude Code, Codex, and similar work agents.
2. `docs/skill.md` is the deployed public copy of that entry spec and must stay content-identical to the root `skill.md`.
3. Shared pages should present `skill.md` as a direct `read .../skill.md` start path before role-specific pages.
4. The first interaction in `skill.md` must:
   - introduce `git-hired` briefly
   - ask the candidate for the target role they want right now
5. If the candidate names a supported target role clearly, the flow should fetch the corresponding canonical role prompt immediately and continue the test from that role lens.
6. If the candidate does not yet have a clear target role, the flow should ask for the candidate's current profession or identity first, then route into the universal calibration path.
7. Before any local scan, the flow must explicitly state the privacy boundary and ask which local repos, projects, files, or other data sources are approved.
8. `history-only` remains the default unless the candidate explicitly approves a narrower named data scope.
9. The shared entry flow should remove unnecessary manual prompt assembly. The agent should read the entry spec, collect the missing context, fetch the right prompt when needed, and then start analysis.
10. `skill.md` must be written so that a work agent can be given a one-line command such as `read https://realroc.github.io/git-hired/skill.md` and immediately enter the test flow without extra setup text from the candidate.
11. On `docs/index.html`, include a copyable one-line starter command that minimizes pre-run friction. The default public command should be:
   - `read https://realroc.github.io/git-hired/skill.md`
12. Because some work agents treat `read <url>` as a document-reading action first, the default starter command on shared pages should explicitly say:
   - execute the fetched file directly
   - do not summarize the file
   - start the first test question immediately in the candidate's language
13. The top of `skill.md` must be execution-first, not explanatory. Before any background description, it should explicitly say:
   - treat the file as active instructions for the current session
   - do not summarize or restate the file
   - send the first role question immediately as the next assistant turn

## History-Only Auto Analysis

This rule applies to `skill.md`, every role prompt in `prompts/`, every embedded prompt in `docs/`, and the role template in `new_role.py`.

1. `git-hired` is not a self-report interview flow after routing and consent are complete.
2. After the candidate answers:
   - the target role question, or the current-profession fallback
   - the privacy / permission question
   the agent should move into evidence collection and analysis automatically.
3. If the candidate keeps `history-only`, do not replace missing repo or file access with manual competency Q&A.
4. In `history-only` mode, the agent should directly inspect the allowed session-history and already-approved work traces, then complete the full evaluation from those records.
5. If `history-only` evidence is thin, the agent may:
   - finish with lower confidence
   - or ask one narrow follow-up permission question for one specific repo / project / file set
   but it should not turn the test into a human interview about skills.
6. Role prompts and the shared entry flow should ask only the minimum human questions needed to:
   - route the right role lens
   - resolve the privacy boundary
7. The candidate-facing deliverables must still be:
   - a designed `HIRED` TUI summary
   - a more detailed local markdown report when file writing is available

## Candidate-Serving Shared Pages

This rule applies to `docs/index.html`, `docs/start.html`, `docs/skill.md`, and any future shared entry or landing page.

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
   - third, show the one-line copyable `read .../skill.md` starter command before flowing into the shared-entry section
9. Do not keep a standalone guide page when it only repeats the homepage starter flow, privacy explanation, or role-routing explanation.
10. Prefer one strong homepage over a homepage-plus-guide split. Fold repeated shared-entry copy into `docs/index.html`, then remove the extra page and links.
11. On the homepage agent shared-entry block, keep one primary action only: the copyable starter command. Do not add a secondary `Open skill.md` button or other raw-spec browse action beside it.
12. The homepage may also expose a separate human quick-test entry for mobile sharing and QR-code traffic. This action must be clearly framed as a lightweight self-test, not as a replacement for the agent deep test.
13. On `docs/index.html`, place the QR-code quick-test fallback near the bottom of the page, after the main explanatory content. The intent is: if the page feels too long or detailed, the candidate can scan one clear bottom entry and start the quick test immediately.

## Mobile Human Quick Test Entry

This rule applies to `docs/start.html`, `docs/quick-test.js`, `docs/style.css`, `docs/index.html`, README links, and any future mobile-first human test surface.

1. Maintain a human-facing quick-test entry in addition to the agent-facing `skill.md` entry.
2. The QR-code quick-test entry must be extremely mobile-friendly:
   - readable on narrow screens
   - no required desktop-only agent runtime
   - quick enough to finish in roughly 1 minute
   - shareable result output
   - no long all-at-once scroll form as the primary experience
3. Use a compact step-by-step flow with one current question visible first, clear progress, and thumb-friendly single-tap choices.
4. All quick-test questions must be single-choice questions. Do not use textarea, multi-select, free-form evidence fields, or manual role-target fields in the mobile quick test.
5. Do not ask the candidate which role or direction they most want to test. The mobile quick test should focus on workplace behavior, team collaboration, decision-making, execution, communication, and other broad work-style dimensions.
6. Each quick-test question should have exactly 4 answer options.
7. Answer option copy must be plain and concrete. Avoid clever labels, abstract jargon, or hidden MBTI-coded wording that normal candidates cannot understand.
8. The mobile quick test should use exactly 10 simplified questions to estimate MBTI work personality.
9. The quick result should output only high-confidence MBTI letters. If an axis is not confident enough, fill that position with `*`, for example `E*TJ` or `**FP`.
10. The quick result must explain the output in plain language:
   - what letters are confident
   - what `*` means
   - why the result is only a lightweight self-report signal
11. The quick test must not imply it has the same evidence quality as the agent deep test. It should clearly label itself as a simple self-report / quick-signal result.
12. The quick test must preserve the same privacy posture:
   - no local repo, project, or document scanning
   - no upload of local repo or file data to our server
   - only candidate-entered answers and browser-local state should be used unless a future backend is explicitly designed and documented
13. The result screen should stay concise and readable on a phone screen.
14. The result screen must be a designed terminal-style report, not a raw markdown or `<pre>` text dump.
15. Render the quick result as structured DOM modules:
   - shell-style status row
   - 4 MBTI axis chips
   - large quick-result readout
   - confirmed section
   - unknown section when needed
   - simple-test footnote
   - CTA row
16. The result screen actions should be:
   - go to `https://github.com/realRoc/git-hired` for the deeper test
   - retake the quick test
   - copy the report text
   Do not show a share action unless explicitly requested later.
17. The result screen must include a clear CTA back to `https://github.com/realRoc/git-hired` and explain that candidates should run the deeper test through Claude Code, Codex, or a similar work agent for detailed evidence-based results.
18. Public pages may show a QR code or QR-friendly URL for the human quick test, but avoid third-party tracking URLs or analytics by default.
19. When shown on the homepage, the QR quick-test entry should behave like a bottom fallback entry, not an interruption inside the first decision flow.

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
7. Role pages should stay visually clean and should not render the full long role prompt as the primary page content.
8. Role pages should mimic the homepage one-line starter command pattern:
   - show a compact copyable command
   - place the command inside the hero section, directly under the role intro copy and before longer explanatory copy
   - route through `skill.md` plus the selected role context
   - avoid asking candidates to copy a long raw prompt from the page
9. The full role prompt may remain in source prompt files and agent-readable deployed artifacts, but public role pages should treat those long prompts as implementation detail rather than candidate-facing page content.

## Public Footer Style

This rule applies to every public HTML page under `docs/`, the role-page template in `new_role.py`, and any future page-generation script.

1. Public page footers must use a unified two-line format.
2. The Chinese footer copy is:
   - `MIT 开源 — git hired 还是 git rejected，你说了算。`
   - `$ whoami 作者：realRoc。 仓库地址：github.com/realRoc/git-hired。`
3. The English footer may be the direct equivalent, but it must preserve:
   - MIT open-source framing
   - `git hired` / `git rejected`
   - `$ whoami`
   - `realRoc`
   - `github.com/realRoc/git-hired`
4. Do not show source prompt filenames, source prompt links, or raw prompt provenance in public page footers.
5. The homepage author line must use `$ whoami` framing, not `built by`.
6. Public page footers must be horizontally centered on both desktop and mobile.
7. The standalone `docs/404.html` page has no language switch, so its footer should default to the English footer copy.

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
   - a one-line strength read
   - a compact core board
   - talent tags
   - locked or not-yet-awakened skills
   - a quantified next-step uplift estimate
   - a matching MBTI ASCII card rendered directly in the terminal when possible
   - the local detailed-report path
4. The summary should remain TUI-friendly, skimmable, and easy to share. Keep it concise enough to read comfortably in a terminal.
5. Detailed evidence belongs in a local markdown report, not in the terminal summary.
6. Show candidate-facing scores on a readable `0-100` scale with a slightly warmer calibration than the old harsh-scale compression:
   - `90+` on a core dimension should stay rare, but it must remain reachable whenever standout evidence clearly justifies it
   - `80-89` is clearly strong
   - `70-79` is solid
   - below `70` means meaningful gaps, thin proof, or inconsistent evidence
7. Do not add defensive score-explainer lines such as `Scale note / 刻度说明`. Instead, calibrate visible scores more naturally so strong candidates do not get artificially trapped in the `70s`.
8. For clearly strong candidates, let standout dimensions rise into the `90s` when justified by evidence, but do not turn this into a hard threshold or mandatory rule.
9. If evidence is thin, round down and say so explicitly instead of flattering the candidate.
10. Avoid essay-like explanation in the TUI. Prefer labels, tags, fragments, and compressed lines over paragraphs.
11. In the TUI, sections like talent tags and locked skills should read like a game system, not like an HR memo.
12. The `HIRED` header should use a simple animated reveal or pulse in the terminal when possible, but it must stay dependency-free and terminal-safe.
13. The `HIRED` ASCII art should feel more dimensional and more legible than a flat block. Prefer a bold, easy-to-recognize shape over decorative noise.
14. Do not require external packages, terminal UI libraries, or browser-only rendering tricks for the `HIRED` animation. The effect must work as plain terminal output.
15. Do not reintroduce opaque labels such as custom alignment codes or obscure archetype acronyms. The visible identity system should use standard MBTI letters directly.

## Runtime-Aware Report Rendering

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, the universal-entry prompt, and the role template in `new_role.py`.

1. Not every supported work agent renders like a true terminal. Claude Code, Codex, and Notion AI may expose the result through different UI containers.
2. If the runtime is a rich-text, chat-bubble, mobile-preview, or Notion-like surface rather than a stable terminal:
   - skip the animated reveal
   - skip wide ASCII layouts that depend on exact monospace alignment
   - keep the same candidate-facing information, but render it as a compact narrow card or fenced code block
3. In non-terminal runtimes, prioritize legibility over decoration:
   - target a narrow width
   - avoid layered box-drawing that collapses when line height or font metrics drift
   - keep the `HIRED` identity and the same section order, but with simpler formatting
4. Candidate-facing prompts must explicitly tell the agent to degrade gracefully on Notion AI and similar surfaces instead of forcing terminal-only art that breaks layout.

## Best-Fit Role Recommendation

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, the universal-entry prompt, and the role template in `new_role.py`.

1. Do not print salary ranges, compensation bands, fictional packages, or offer-like hooks anywhere in the terminal summary or markdown report.
2. Instead, give a clear `best-fit role right now` recommendation based on the evidence.
3. If the tested role is not the best fit, say which direction looks more natural and why.
4. For weaker or mismatched candidates, the recommendation must still be helpful from the candidate's point of view:
   - what role or direction looks stronger right now
   - what evidence is missing for the tested role
   - what to improve next

## Next-Step Uplift

This rule applies to every role prompt in `prompts/`, every embedded prompt in `docs/`, the universal-entry prompt, and the role template in `new_role.py`.

1. The `Next Step` section should not stop at a vague suggestion.
2. Give one concrete next action that is realistic for the candidate to finish next.
3. For that action, include a conservative `uplift estimate`, not a promise:
   - which single core dimension is most likely to improve
   - the approximate score increase for that dimension
   - the approximate increase in overall ability score
4. Use estimate language such as:
   - `Expected uplift`
   - `提升预估`
   - `likely`, `approximately`, `if done well`
5. Do not present the uplift as guaranteed, deterministic, or mathematically exact.
6. The uplift should be specific enough to create an aha moment, but still honest about uncertainty.
7. The detailed markdown report should also carry the same next-step uplift estimate in a slightly fuller form.

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
5. Infer each MBTI axis conservatively and neutrally from work evidence:
   - `E / I`: external interaction energy vs internal reflection energy
   - `S / N`: concrete evidence focus vs pattern / possibility focus
   - `T / F`: impersonal analysis and consistency vs human-context and value-weighting
   - `J / P`: planned closure and decided structure vs adaptive optionality and open exploration
6. Do not default to `INTJ`, `TJ`, or any single “strong builder” stereotype.
7. Infer each axis independently before combining the final 4-letter type.
8. Do not treat technical rigor, startup urgency, product quality, or verbal sharpness as automatic evidence for `T` or `J`.
9. When most evidence comes from solo agent history, do not treat the absence of social, human-context, or flexibility signals as positive evidence for `I`, `T`, or `J`.
10. Solo agent history often under-observes all four MBTI axes, especially `E / I`, `T / F`, and `J / P`, unless the evidence directly shows the distinction.
11. If one or more axes are weakly evidenced, lower confidence rather than forcing certainty.
12. Infer an axis only from positive evidence, not from the mere absence of the opposite signal.
13. Do not infer `N` from abstraction-heavy, architecture-heavy, or AI-native language alone.
14. Do not infer `T` from terse wording, debugging skill, or technical sharpness alone.
15. Do not infer `J` from competence, clean output, task completion, or seniority alone.
16. When two or more axes are under-observed or mixed, MBTI confidence should usually be `low`, and the visible type label should be visually de-emphasized rather than treated as a punchline or badge.
17. Do not output hedged pseudo-types such as `INTJ-ish`, `xNTJ`, `NTJ-like`, or similar variants. Use one standard 4-letter MBTI type plus a separate confidence field.
18. Replace long “why this works” explanation blocks with exactly 3 `Talent Tags`.
19. Talent tags must be noun-phrase style, not mini paragraphs:
   - short
   - label-first
   - highly compressible
   - screenshot-friendly
20. Replace ordinary weakness/improvement sections with 2-3 `Locked Skills`, `Version Bottlenecks`, or `Not-Yet-Awakened` abilities.
21. Those “gap” sections must still be respectful and useful to the candidate. Game framing should remove HR stiffness, not empathy.
22. The visible TUI score board should be compressed to 4-5 core dimensions for each role, not 8-9 spreadsheet lines.
23. Step 4 may still use evidence-rich analysis internally, but the candidate-facing surface must present only the compressed core board.
24. When creating or revising a role, the 4-5 core dimensions should be custom to that role rather than generic boilerplate.
25. Avoid generic AI flourish such as:
   - “you are not just X, you are Y”
   - long motivational framing
   - over-explaining obvious strengths in full sentences
26. Prefer direct definitions such as:
   - MBTI work personality
   - talent tags
   - locked skills
   - best-fit role
27. In the visible `Core Board`, do not use dotted label rows like `Spec Control ........ 7/10 [#######---]`.
28. Use a clearer bar-first format such as `[█████████░] 92` or another equivalent block-bar rendering that keeps the numeric score obvious at a glance.
29. Do not decorate every visible line with repeated prefixes such as `>>`.
30. In the terminal summary, reserve strong decoration for the `HIRED` banner itself. After that, prefer plain labels such as:
   - `MBTI Work Personality`
   - `Result`
   - `Strength Read`
   - `Core Board`
   - `Talent Tags`
   - `Locked Skills`
   - `Next Step`
31. Avoid visual noise that makes the report feel like raw debug output. The TUI should read like a clean card, not a terminal log dump.

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
