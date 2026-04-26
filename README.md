# git-hired

What kind of AI-native builder are you?

`git-hired` helps people discover how they work with ambiguity, AI, people, and progress.

Start with the simple builder test.
If you want a deeper read, run the agent version in your own work agent.

Website: <https://realroc.github.io/git-hired/>

[简体中文](./README.zh-CN.md)

## Simple Test

Take the test and get a shareable AI-native builder card.

Start here: <https://realroc.github.io/git-hired/start.html>

## Deeper Agent Report

Paste the `skill.md` command into your own work agent.
It can generate a deeper, privacy-bounded report from approved history or files.

```text
read https://realroc.github.io/git-hired/skill.md
```

- You choose what evidence to provide.
- No local files are uploaded to our server.
- You decide what to share.

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

- [Final builder card](./examples/builder-card.md)
- [Strong Agent Engineer](./examples/agent-engineer.strong.md)
- [Medium Agent Engineer](./examples/agent-engineer.medium.md)
- [Weak Agent Engineer](./examples/agent-engineer.weak.md)
- [Strong Product Manager](./examples/pm.strong.md)
- [Strong Global Growth](./examples/growth.strong.md)
- [Redacted report template](./examples/redacted-report-template.md)

## Eval Gate

Before promoting changes from `dev` to `main`, run:

```bash
python3 scripts/eval_release.py
```

This gate syncs generated surfaces, checks role wiring, verifies the `skill.md` output contract, locks the public builder card format, and runs `git diff --check`.

| Traditional hiring signal | `git-hired` signal |
| --- | --- |
| Resume claims | Work-trace evidence |
| Interview answers | Agent-observed behavior |
| Take-home task | Historical execution pattern |
| Self-reported AI usage | Actual agent workflow |
| Generic score | Builder profile + role-specific fit |

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
