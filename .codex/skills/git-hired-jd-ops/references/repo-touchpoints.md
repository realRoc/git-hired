# Repo Touchpoints

When you add or edit a JD in `git-hired`, these are the touchpoints that matter.

## Role wiring

`roles.json`

This is the source of truth for:

- `page_slug`
- `prompt_slug`
- `prompt_base`
- English title
- Chinese title
- English summary
- Chinese summary

## Prompt source files

For each role:

- `prompts/<prompt_slug>.en.md`
- `prompts/<prompt_slug>.md`

These are the editable source prompts. Edit these first.

## Candidate-facing role page

For each role:

- `docs/<page_slug>.html`

This page must:

- default to English
- support EN / 中文 switch
- include author GitHub info
- include repo link
- include only a home link, not cross-role links
- show compact bilingual one-line starter commands
- avoid rendering the full long prompt as public page content

## Shared skill entry

`skill.md` and `docs/skill.md`

These must stay content-identical.

The public skill entry bundles the full canonical role prompt appendix generated from `prompts/`, so compact role pages can route public agents without exposing long raw prompts in the page UI.

## Homepage

`docs/index.html`

The role-card section should be generated from `roles.json` by the registry sync script.

Do not hand-edit role cards unless you are changing the layout template itself.

The homepage also links to the mobile human quick test:

- `docs/start.html`
- QR asset: `docs/assets/quick-test-qr.svg`

Keep this as a lightweight self-report entry that hands off to the deeper `skill.md` agent test. On the homepage, place this QR fallback near the bottom after the main explanatory content.

## READMEs

- `README.md`
- `README.zh-CN.md`

The following sections should be generated from `roles.json` by the registry sync script:

- live links
- role list
- prompt source list

Do not hand-edit those generated regions unless you are changing the template itself.

## Validation

After any non-trivial JD change, run:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/validate_roles.py
```
