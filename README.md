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
- suggested directions
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

## Privacy First

> The browser generator uses only what you type or paste into the page.
> No account, backend, private upload, local repo scan, or document scan is required.
> Public links are enough.
> You control what you copy, edit, export, and share.

## AI-Native Collaboration

I am building AI-native products and looking for people who can:

- use AI agents as real work partners
- decompose ambiguous tasks
- ship without heavy management
- think clearly about product, users, metrics, and tradeoffs
- create attention, trust, distribution, and adoption
- respect privacy and security boundaries

If your generated profile or public evidence shows strong AI-native worker signals and you are interested in collaboration, open an issue with:

- target track or direction
- public-safe profile summary
- what you want to build or sell next
- any privacy limits you want respected

Do not include secrets, private transcripts, raw customer data, or local file dumps in public issues.

## Eval Gate

Before promoting changes from `dev` to `main`, run:

```bash
python3 scripts/eval_release.py
```

This gate checks the static generator, analytics contract, and whitespace-safe diffs.

## Repo Structure

```text
git-hired/
├── docs/
│   ├── index.html
│   ├── start.html
│   ├── quick-test.js
│   ├── analytics.js
│   └── style.css
├── evals/
├── scripts/
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
