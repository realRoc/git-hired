# git-hired

```bash
$ git hired
fatal: not a qualified candidate
```

[简体中文](./README.zh-CN.md)

Prompt-first candidate fit tests for AI-native startups.

`git-hired` gives candidates a role-specific prompt to run inside their own AI agent, such as Claude Code or Codex, and asks that agent to return a structured, privacy-bounded fit report based on how the candidate actually works.

This is not resume theater.

It is a practical way to inspect signals that matter more in AI-native teams:

- how someone scopes work
- how they use AI tools
- how they debug
- how they decompose ambiguity
- how they think about users, metrics, and tradeoffs
- whether they look like the kind of builder an early-stage startup actually needs

## Live Links

After GitHub Pages is enabled for this repo:

- AI Agent Engineer: <https://realroc.github.io/git-hired/agent.html>
- Product Manager: <https://realroc.github.io/git-hired/pm.html>
- Head of Global Growth: <https://realroc.github.io/git-hired/growth.html>

## What This Repo Includes

Three public, shareable candidate tests:

- `AI Agent Engineer`
- `Product Manager`
- `Head of Global Growth`

Each role includes:

- a standalone page under `docs/`
- a source prompt under `prompts/`
- both Chinese and English source prompt files
- a privacy boundary that asks the agent to output aggregate signals instead of raw dumps

## Why This Exists

In AI-native hiring, titles are weak proxies.

The more useful question is:

Can this person direct AI well enough to ship, learn, and iterate under startup constraints?

`git-hired` is built to make that visible.

## How It Works

1. Send the candidate the role-specific page.
2. They copy the prompt into their own Claude Code or Codex.
3. Their agent analyzes local work traces with explicit privacy limits.
4. The candidate sends back the generated report.
5. You use that report as a structured screening input, not as the final decision.

## Suggested Candidate Message

You can send something like:

> Paste the prompt from this link into your own Claude Code or Codex, run it, and send me the output.  
> It is designed to extract macro working-style signals only, not raw logs or sensitive information.

Or lean into the joke:

> Run this and send me the result.  
> `git hired` or `git rejected`, let your agent talk first.

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
- interview follow-up questions

## Repo Structure

```text
git-hired/
├── docs/
│   ├── index.html
│   ├── agent.html
│   ├── pm.html
│   ├── growth.html
│   ├── style.css
│   └── app.js
├── prompts/
│   ├── agent-engineer.en.md
│   ├── agent-engineer.md
│   ├── product-manager.en.md
│   ├── product-manager.md
│   ├── global-growth.en.md
│   └── global-growth.md
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

## Notes

I only had explicit JD text for:

- `AI Agent Engineer`
- `Head of Global Growth`

So the `Product Manager` prompt is a strong default profile for an AI-native startup PM working on agent workflows, specs, MVP scoping, and cross-functional execution. Edit it as your PM hiring bar evolves.

## Customization

You should adapt the prompts for:

- your company stage
- your product category
- your team culture
- your hiring bar
- your privacy expectations

## Prompt Sources

- AI Agent Engineer
  - Chinese: `prompts/agent-engineer.md`
  - English: `prompts/agent-engineer.en.md`
- Product Manager
  - Chinese: `prompts/product-manager.md`
  - English: `prompts/product-manager.en.md`
- Head of Global Growth
  - Chinese: `prompts/global-growth.md`
  - English: `prompts/global-growth.en.md`

## License

MIT.
