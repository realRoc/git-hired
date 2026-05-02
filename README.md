# git-hired

Know your AI-native market value — and how to raise it.

`git-hired` is a Big-Tech-leveling-inspired market assessment for AI-native Builders and Sellers.
It helps AI-native workers understand their market level, missing signals, and next step to become more valuable.

Website: <https://realroc.github.io/git-hired/>

[简体中文](./README.zh-CN.md)

## Start Here

Choose a track, then assess your current GH level:

- Builder track: turns ambiguity into useful artifacts with AI.
- Seller track: turns ideas into attention, trust, adoption, and revenue with AI.

Assessment entry:

- Builder: <https://realroc.github.io/git-hired/start.html?track=builder>
- Seller: <https://realroc.github.io/git-hired/start.html?track=seller>

## Product Path

```text
Choose Track -> Assess Level -> Market Read -> Upgrade Plan
```

The lightweight browser assessment returns:

- `GH-L3` to `GH-L7` level
- what the level means
- market read and opportunity band
- missing signals
- next level gap
- upgrade plan
- recommended next step
- shareable market level card

## GH Levels

The GH level system is inspired by Big Tech leveling logic, but it does not claim equivalence to any specific company level.

- `GH-L3 — Entry`: can complete work under clear tasks.
- `GH-L4 — Independent`: can complete full tasks or projects independently.
- `GH-L5 — Senior`: can handle complex problems and create verifiable user, business, or market impact.
- `GH-L6 — Staff`: can amplify impact across teams, systems, or channels.
- `GH-L7 — Principal`: can define direction, create market-level impact, and influence an organization or category.

## Tracks

Builder is not a personality label.
It is a capability track for people who make things real:

- prototyping
- AI workflow building
- automation
- product building
- systems thinking
- technical or no-code execution
- research-to-artifact
- shipping useful output

Seller is not a traditional sales label.
It is a capability track for people who make people care:

- storytelling
- positioning
- distribution
- sales
- recruiting
- marketing
- community
- fundraising narrative
- momentum creation
- trust building

## Recommended Next Step

The next step comes after the assessment.
It is a concrete suggestion for raising the missing market signal, not a homepage product concept or upload flow.

- Builder next step: build one useful AI workflow, prototype, automation, tool, or artifact in 48 hours.
- Seller next step: launch one idea publicly in 48 hours and try to get real replies, signups, leads, candidates, users, or feedback.
- Trust boundary: no private work required, use public links only, you control what you share.

Long-term, `git-hired` can become a reputation / hiring signal layer for AI-native workers.
The MVP starts with market level, missing signals, and the next step because that gives users value before asking for proof.

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
> No server, no account, no upload, no tracking for private evidence.
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
- default share object: public-safe card, not the private report

## Protocol Pages

- [Candidate protocol](./docs/candidate.html)
- [Evaluator protocol](./docs/evaluator.html)
- [Contributor protocol](./docs/contributor.html)
- [Scoring rubric](./rubric.md)
- [Examples](./examples/)

## AI-Native Collaboration

I am building AI-native products and looking for people who can:

- use AI agents as real work partners
- decompose ambiguous tasks
- ship without heavy management
- think clearly about product, users, metrics, and tradeoffs
- create attention, trust, distribution, and adoption
- respect privacy and security boundaries

If your assessment, report, or public next-step evidence shows strong AI-native worker signals and you are interested in collaboration, open an issue with:

- target track or role
- public-safe market level card or public report summary
- what you want to build or sell next
- any privacy limits you want respected

Do not include secrets, private transcripts, raw customer data, or local file dumps in public issues.

## Examples

Start here if you want to understand what a report looks like before running the deeper protocol:

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

This gate syncs generated surfaces, checks role wiring, verifies the `skill.md` output contract, locks the public card format, and runs `git diff --check`.

## Repo Structure

```text
git-hired/
├── skill.md
├── rubric.md
├── examples/
├── docs/
│   ├── index.html
│   ├── start.html
│   ├── quick-test.js
│   ├── candidate.html
│   ├── evaluator.html
│   └── contributor.html
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
