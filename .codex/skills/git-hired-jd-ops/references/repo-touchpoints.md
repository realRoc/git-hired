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
- contain both embedded prompt blocks that match the source prompt files

## Homepage

`docs/index.html`

Update when:

- a new role is added
- a role title changes
- a role summary changes
- a role is removed

## READMEs

- `README.md`
- `README.zh-CN.md`

Update when:

- a new role is added
- a role title changes
- prompt source paths change
- live links change

At minimum, keep:

- role list
- live links
- prompt source list
- repo structure examples

## Validation

After any non-trivial JD change, run:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/validate_roles.py
```
