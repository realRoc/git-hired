# git-hired

```bash
$ git hired
fatal: not a qualified candidate
```

[简体中文](./README.zh-CN.md)

`git-hired` is an open-source AI-native hiring test: candidates let their own AI agent analyze their real work traces and return a privacy-bounded fit report.

Hiring for AI-native teams is broken.

Resumes show claims.
Interviews show performance.
Take-home tests show isolated skill.

`git-hired` asks a different question:

Can this person use AI agents to understand ambiguity, inspect real work traces, make tradeoffs, and ship?

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

Advanced command:

```text
read https://realroc.github.io/git-hired/skill.md and treat it as active instructions for this session. Do not summarize it. Ask the first test question immediately in my language. After that, ask only for my target role and data permission scope, then run the evaluation automatically from allowed history or approved files. Do not turn it into a manual interview.
```

## Privacy First

> `git-hired` is consent-first and local-only.
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

## The Protocol

### Candidate Protocol

1. Paste the quick start command into your own work agent.
2. Choose a target role, or describe your current profession if you are unsure.
3. Choose privacy scope: `history-only` or explicit named files / repos.
4. Let the agent inspect only approved evidence.
5. Keep the generated fit report, or send a public summary if you want to apply or collaborate.

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

## Live Links

- Homepage: <https://realroc.github.io/git-hired/>
- Candidate Protocol: <https://realroc.github.io/git-hired/candidate.html>
- Evaluator Protocol: <https://realroc.github.io/git-hired/evaluator.html>
- Contributor Protocol: <https://realroc.github.io/git-hired/contributor.html>
- Mobile Quick Test: <https://realroc.github.io/git-hired/start.html>
- Agent Entry (`skill.md`): <https://realroc.github.io/git-hired/skill.md>

<!-- AUTO:live-links:start -->
- Global Growth: <https://realroc.github.io/git-hired/growth.html>
- Agent Engineer: <https://realroc.github.io/git-hired/agent.html>
- Product Manager: <https://realroc.github.io/git-hired/pm.html>
- Product Operations: <https://realroc.github.io/git-hired/ops.html>
<!-- AUTO:live-links:end -->

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

## I Am Using This To Find Collaborators

I am building AI-native products and looking for people who can:

- use AI agents as real work partners
- decompose ambiguous tasks
- ship without heavy management
- think clearly about product, users, metrics, and tradeoffs
- respect privacy and security boundaries

If this sounds like you, run `git-hired` on yourself and open an issue with:

- target role
- public report summary
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
| Generic score | Role-specific fit report |

## Why This Exists

In AI-native hiring, titles are weak proxies.

The more useful question is:

Can this person direct AI well enough to ship, learn, and iterate under startup constraints?

`git-hired` is built to make that visible without turning candidate evaluation into surveillance.

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

- distributions
- de-identified examples
- scoring
- fit assessment
- MBTI work personality as a work-style read, not a life-wide personality claim
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
