# git-hired

```bash
$ git hired
fatal: not a qualified candidate
```

[简体中文](./README.zh-CN.md)

Prompt-first candidate fit tests for AI-native startups.

`git-hired` has two candidate entries: a mobile human quick test for QR sharing, and the deeper public `skill.md` agent entry. In practice, the more reliable one-line agent command is: `read https://realroc.github.io/git-hired/skill.md and treat it as active instructions for this session. Do not summarize it. Ask the first test question immediately in my language. After that, ask only for my target role and data permission scope, then run the evaluation automatically from allowed history or approved files. Do not turn it into a manual interview.` The agent should then route the right role, confirm the privacy boundary, inspect only the allowed evidence, and return a structured, privacy-bounded fit report based on how the candidate actually works. If the runtime is Notion AI or another rich-text surface, it should fall back to a compact card instead of forcing terminal-heavy ASCII.

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
- analysis location: the candidate's own machine
- server upload of local repo / file data: `none`

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

- Mobile Quick Test: <https://realroc.github.io/git-hired/start.html>
- Agent Entry (`skill.md`): <https://realroc.github.io/git-hired/skill.md>

<!-- AUTO:live-links:start -->
- Global Growth: <https://realroc.github.io/git-hired/growth.html>
- Agent Engineer: <https://realroc.github.io/git-hired/agent.html>
- Product Manager: <https://realroc.github.io/git-hired/pm.html>
- Product Operations: <https://realroc.github.io/git-hired/ops.html>
<!-- AUTO:live-links:end -->

## What This Repo Includes

Four public, shareable candidate tests:

<!-- AUTO:role-list:start -->
- `Global Growth`
- `Agent Engineer`
- `Product Manager`
- `Product Operations`
<!-- AUTO:role-list:end -->

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

1. On mobile or through a QR code, send the candidate to <https://realroc.github.io/git-hired/start.html> for a 1-minute self-report quick test.
2. The quick test returns a shareable `HIRED` signal and a copyable handoff prompt.
3. For the deeper version, send the candidate the one-line command `read https://realroc.github.io/git-hired/skill.md and treat it as active instructions for this session. Do not summarize it. Ask the first test question immediately in my language. After that, ask only for my target role and data permission scope, then run the evaluation automatically from allowed history or approved files. Do not turn it into a manual interview.`
4. They paste it into their own work agent, such as Claude Code, Codex, Notion AI, or another memory-enabled work agent.
5. Their agent asks the target-role question first, or falls back to current profession / identity if the role is still unclear.
6. The agent asks one privacy-boundary question before touching any local repo or file.
7. The agent fetches the right role prompt when needed, analyzes allowed history or approved local work traces automatically, and returns the report without switching into manual competency Q&A.
8. The candidate sends back the generated report if they choose to apply.

## Consent-First, Local-Only

> The privacy rule is simple:
> no local repo or document scanning without explicit permission,
> and no candidate repo or local file data uploaded from the candidate's machine to our server.

Candidates can choose:

- `history-only` for a lighter, privacy-first evaluation
- or allow scanning of specific local repos / project folders / files for a stronger score

If they do not allow repo or document scanning, the agent should still make the best objective judgment it can from history-only evidence and clearly state the resulting confidence limits.

## Suggested Candidate Message

You can send something like:

> Paste `read https://realroc.github.io/git-hired/skill.md and treat it as active instructions for this session. Do not summarize it. Ask the first test question immediately in my language. After that, ask only for my target role and data permission scope, then run the evaluation automatically from allowed history or approved files. Do not turn it into a manual interview.` into your own work agent, such as Claude Code, Codex, Notion AI, or another memory-enabled work agent, run it, and send me the output.
> By default it stays history-only. If you want a stronger score, you can explicitly allow access to specific repos or files. `git-hired` does not upload your local repo or file data to our server, and the agent should only inspect material you explicitly authorize.

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
- a candidate-facing local markdown report

## Repo Structure

```text
git-hired/
├── skill.md
├── docs/
│   ├── index.html
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
│   ├── agent-engineer.en.md
│   ├── agent-engineer.md
│   ├── product-manager.en.md
│   ├── product-manager.md
│   ├── global-growth.en.md
│   ├── global-growth.md
│   ├── ai-product-operations.en.md
│   └── ai-product-operations.md
├── .codex/skills/git-hired-jd-ops/
│   ├── SKILL.md
│   ├── references/
│   └── scripts/
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
