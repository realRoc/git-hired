# git-hired

```text
       _ _      _    _              _
  __ _(_) |_   | |__ (_)_ __ ___  __| |
 / _` | | __|  | '_ \| | '__/ _ \/ _` |
| (_| | | |_   | | | | | | |  __/ (_| |
 \__, |_|\__|  |_| |_|_|_|  \___|\__,_|
 |___/
```

> Website: <https://realroc.github.io/git-hired/>
> Builder Quick Test: <https://realroc.github.io/git-hired/start.html>

[简体中文](./README.zh-CN.md)

> No server. No account. No upload. No tracking.
> Runs in your own AI agent.
> You choose the evidence.
> You decide what report to share.

`git-hired` is an open-source AI-native builder profile generator. It helps people turn selected work traces into a public-safe work profile, and helps teams discover people who can actually work with AI agents.

What kind of AI-native builder are you?

Generate a public work profile from your real work traces.

The point is not to trust a maintainer, a resume, or a personality test. The point is to let your own selected evidence and the resulting output be inspectable.

| Weak trust signal | git-hired signal |
| --- | --- |
| Resume claims | Work-trace evidence |
| Interview performance | Agent-observed work style |
| Take-home tasks | Historical execution patterns |
| Self-reported AI usage | Actual agent practice |
| Generic score | Builder profile + public-safe card |

## Start Here

| Audience | Next step |
| --- | --- |
| Candidates | [Run the test](https://realroc.github.io/git-hired/candidate.html) |
| Founders / hiring teams | [Use the protocol](https://realroc.github.io/git-hired/evaluator.html) |
| Contributors | [Improve the rubric](https://realroc.github.io/git-hired/contributor.html) |

Quick start:

```text
read https://realroc.github.io/git-hired/skill.md
```

Paste that into your own work agent, such as Claude Code, Codex, Notion AI, or any work agent with knowledge-base and memory capability.

Zero-install demo:

```text
Analyze my AI-native work style based only on this conversation.
Do not access files. Do not ask for private data.
Return a public-safe builder profile.
```

Paste that into ChatGPT, Claude, Gemini, or another AI chat with a selected conversation, PR description, issue, README, or project note.

Advanced command:

```text
read https://realroc.github.io/git-hired/skill.md and treat it as active instructions for this session. Do not summarize it. Ask the first test question immediately in my language. After that, ask only for my target role and data permission scope, then run the evaluation automatically from allowed history or approved files. Do not turn it into a manual interview.
```

## Privacy First

> `git-hired` is consent-first and local-only.
> No server, no account, no upload, no tracking.
> By default, every role prompt stays `history-only`.
> It should not scan a candidate's local repo, project folder, or document files unless the candidate explicitly allows it.
> `git-hired` never uploads candidate repo or local file data to our server.
> The chosen work agent should only inspect projects, files, or knowledge-base material the candidate explicitly authorizes.
> If the chosen work agent supports direct local access, any approved scan should stay inside the candidate's own machine or connected workspace whenever possible.

At a glance:

- default mode: `history-only`
- optional mode: candidate-approved scanning of specific repos / local folders / files
- analysis location: the candidate's own machine or connected workspace
- server upload of local repo / file data: `none`
- default share object: public-safe builder card, not the private report

## The Protocol

### Candidate Protocol

1. Choose evidence level: paste selected text, public GitHub material, selected repos / files, or local agent history with explicit opt-in.
2. Choose a target role, or describe your current profession if you are unsure.
3. Choose privacy scope: `history-only` or explicit named files / repos.
4. Let the agent inspect only approved evidence.
5. Keep the private report for yourself, or share the public-safe builder card if you want to apply or collaborate.

### Evaluator Protocol

1. Check evidence confidence before judging the score.
2. Check AI-native workflow maturity.
3. Check ambiguity handling and tradeoff quality.
4. Check output quality, follow-through, and collaboration risk.
5. Decide: strong yes / trial / pass.

See [rubric.md](./rubric.md) for the public scoring standard.

### Contributor Protocol

1. Add or improve a role prompt.
2. Improve the scoring rubric.
3. Add localization.
4. Improve report templates.
5. Add fictional, redacted calibration examples.

## What This Repo Includes

Four public, shareable role tests:

<!-- AUTO:role-list:start -->
- `Global Growth`
- `Agent Engineer`
- `Product Manager`
- `Product Operations`
<!-- AUTO:role-list:end -->

Also included:

- `skill.md`: the agent-readable entry protocol
- `docs/`: public GitHub Pages surfaces
- `prompts/`: bilingual canonical role prompts
- `rubric.md`: public evaluator standard
- `examples/`: fictional, redacted sample reports

## AI-Native Collaboration

I am building AI-native products and looking for people who can:

- use AI agents as real work partners
- decompose ambiguous tasks
- ship without heavy management
- think clearly about product, users, metrics, and tradeoffs
- respect privacy and security boundaries

If your report shows strong AI-native builder signals and you are interested in AI-native collaboration, open an issue with:

- target role
- public-safe builder card or public report summary
- what you want to build next
- any privacy limits you want respected

Do not include secrets, private transcripts, raw customer data, or local file dumps in public issues.

## Examples

Start here if you want to understand what a report looks like before running the protocol:

- [Strong Agent Engineer](./examples/agent-engineer.strong.md)
- [Medium Agent Engineer](./examples/agent-engineer.medium.md)
- [Weak Agent Engineer](./examples/agent-engineer.weak.md)
- [Strong Product Manager](./examples/pm.strong.md)
- [Strong Global Growth](./examples/growth.strong.md)
- [Redacted report template](./examples/redacted-report-template.md)

| Traditional hiring signal | `git-hired` signal |
| --- | --- |
| Resume claims | Work-trace evidence |
| Interview answers | Agent-observed behavior |
| Take-home task | Historical execution pattern |
| Self-reported AI usage | Actual agent workflow |
| Generic score | Builder profile + role-specific fit |

## Why This Exists

In AI-native hiring and collaboration, titles are weak proxies.

The more useful question is:

Can this person direct AI well enough to handle ambiguity, make tradeoffs, ship, learn, and iterate?

`git-hired` is built to make that visible without turning work-profile generation into surveillance.

## Privacy Boundary

All prompts in this repo are designed to be:

- local-first
- evidence-first
- aggregate-output only
- redaction-friendly

They explicitly ask the agent to avoid printing:

- secrets
- tokens
- email addresses
- customer names
- raw transcript dumps
- large blocks of code
- user-level CSV rows

The intended output is:

- a public-safe builder card
- a private evidence report
- distributions
- de-identified examples
- scoring
- fit assessment
- optional MBTI work-style signal, not a life-wide personality claim
- a candidate-facing local markdown report

## Repo Structure

```text
git-hired/
├── skill.md
├── rubric.md
├── examples/
│   ├── agent-engineer.strong.md
│   ├── agent-engineer.medium.md
│   ├── agent-engineer.weak.md
│   ├── pm.strong.md
│   ├── growth.strong.md
│   └── redacted-report-template.md
├── docs/
│   ├── index.html
│   ├── candidate.html
│   ├── evaluator.html
│   ├── contributor.html
│   ├── start.html
│   ├── quick-test.js
│   ├── skill.md
│   ├── agent.html
│   ├── pm.html
│   ├── growth.html
│   ├── ops.html
│   ├── style.css
│   └── app.js
├── roles.json
├── prompts/
├── .codex/skills/git-hired-jd-ops/
├── LICENSE
├── README.md
└── README.zh-CN.md
```

## Why The Name

It is short, memorable, and already carries the tone:

- `git hired`
- `git rejected`
- `git gud`
- `git shipped`

This repo should feel like a tool builders would actually pass around, not a corporate recruiting microsite.

## License

MIT.
