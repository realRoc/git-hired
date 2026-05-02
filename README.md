# git-hired

Turn your AI-native work into a LinkedIn-ready profile.

`git-hired` is an AI-native resume / profile generator.
It helps people translate projects, workflows, launches, automation, content, sales, recruiting, and agent work into a company-readable resume profile.

Website: <https://realroc.github.io/git-hired/>

[简体中文](./README.zh-CN.md)

## Start Here

Choose a track, paste your work evidence, then generate a profile:

- Builder profile: for artifacts, systems, workflows, automation, prototypes, tools, and shipped output.
- Seller profile: for narrative, positioning, distribution, sales, recruiting, launches, trust, and adoption.

Generator entry:

- Builder: <https://realroc.github.io/git-hired/start.html?track=builder>
- Seller: <https://realroc.github.io/git-hired/start.html?track=seller>

## Product Path

```text
Choose Track -> Add Work Evidence -> Generate Profile -> Edit -> Export
```

The browser-local generator returns:

- LinkedIn headline
- About section
- AI-native value proposition
- core skills
- selected work evidence
- resume bullets
- suggested roles
- missing proof
- next edit
- Markdown export

## Tracks

Builder is a resume/profile track for people who make things real with AI:

- prototyping
- AI workflow building
- automation
- product building
- systems thinking
- technical or no-code execution
- research-to-artifact
- shipping useful output

Seller is a resume/profile track for people who make people care with AI:

- storytelling
- positioning
- distribution
- sales
- recruiting
- marketing
- community
- launches and outbound
- trust building

## Trust Boundary

The MVP does not require private uploads.

- Paste only what you want to include.
- Public links are enough.
- Browser-local text input is enough.
- You control what you copy, edit, export, and share.

Long-term, `git-hired` can become a hiring signal layer for AI-native workers.
The MVP starts with a useful resume/profile draft because that gives users value before asking for deeper proof.

## Deeper Agent Report

Paste the `skill.md` command into your own work agent when you want a deeper, privacy-bounded report from approved history or files.

```text
read https://realroc.github.io/git-hired/skill.md
```

- You choose what evidence to provide.
- No local files are uploaded to our server.
- You decide what to share.

## Privacy First

> `git-hired` is consent-first and local-only.
> No server upload for local repo or file data.
> By default, every role prompt stays `history-only`.
> It should not scan a candidate's local repo, project folder, or document files unless the candidate explicitly allows it.
> `git-hired` never uploads candidate repo or local file data to our server.
> The chosen work agent should only inspect projects, files, or knowledge-base material the candidate explicitly authorizes.
> If the chosen work agent supports direct local access, any approved scan should stay inside the candidate's own machine or connected workspace whenever possible.

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

If your profile, report, or public evidence shows strong AI-native worker signals and you are interested in collaboration, open an issue with:

- target track or role
- public-safe profile or report summary
- what you want to build or sell next
- any privacy limits you want respected

Do not include secrets, private transcripts, raw customer data, or local file dumps in public issues.

## Examples

Start here if you want to understand what a deeper report looks like:

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
