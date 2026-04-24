---
name: git-hired-jd-ops
description: Use when adding a new JD/role to git-hired, editing an existing JD, syncing bilingual prompt source files into docs pages, or validating consistency across roles, prompts, docs, and README files.
---

# git-hired JD Ops

Use this skill inside the `git-hired` repo whenever the task is:

- add a new job role
- add a new JD
- optimize an existing JD
- rename a role
- update bilingual prompts
- keep `docs/`, `prompts/`, `README*`, and role wiring consistent

## First read

1. Read `roles.json`
2. Read `references/repo-touchpoints.md`
3. If the request changes wording standards or evaluation logic, also read `references/jd-quality-bar.md`

## Source of truth

`roles.json` is the wiring map between:

- public page slug, for example `docs/agent.html`
- prompt slug, for example `prompts/agent-engineer.md`
- prompt block id inside HTML, for example `prompt-engineer`

Do not invent these mappings ad hoc. Update `roles.json` first, or use the scaffold script to add the entry for you.

## Default workflow

### A. Add a new role

1. Pick:
   - `page_slug`: short public URL slug, for example `designer`
   - `prompt_slug`: stable prompt file slug, for example `product-designer`
   - `prompt_base`: prompt block id prefix, usually `prompt-<page_slug>`
2. Run:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/new_role.py \
  --page-slug <page_slug> \
  --prompt-slug <prompt_slug> \
  --prompt-base <prompt_base> \
  --title-en "<English title>" \
  --title-zh "<中文标题>" \
  --summary-en "<One-line English summary>" \
  --summary-zh "<一句中文简介>"
```

3. Edit the newly created source prompts first:
   - `prompts/<prompt_slug>.en.md`
   - `prompts/<prompt_slug>.md`
4. Sync the compact role starter into the candidate-facing page:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_role_page.py --page-slug <page_slug>
```

5. Sync the public `skill.md` role-prompt appendix:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_skill_entry.py
```

6. Sync registry-driven surfaces:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_registry_surfaces.py
```

7. Validate:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/validate_roles.py
```

### B. Edit an existing JD or role page

1. Find the role in `roles.json`
2. Edit prompt source files first:
   - `prompts/<prompt_slug>.en.md`
   - `prompts/<prompt_slug>.md`
3. Sync the compact role starter into the page:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_role_page.py --page-slug <page_slug>
```

4. Sync the public `skill.md` role-prompt appendix:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_skill_entry.py
```

5. If title or summary changed in `roles.json`, or if a role was added or removed, sync registry-driven surfaces:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_registry_surfaces.py
```

6. Validate:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/validate_roles.py
```

### C. Rename a role

Do not do a casual rename. A rename can break:

- public links
- prompt paths
- HTML prompt block ids
- README links
- role registry consistency

If the rename is URL-safe and intentional:

1. Update `roles.json`
2. Rename the prompt files and page file
3. Update internal links and prompt block ids
4. Run `sync_role_page.py`
5. Run `sync_skill_entry.py`
6. Run `sync_registry_surfaces.py`
7. Run `validate_roles.py`

## Required repo invariants

Keep these true after every change:

- every role in `roles.json` has:
  - one Chinese prompt source
  - one English prompt source
  - one candidate-facing HTML page
- every role page:
  - defaults to English
  - supports `EN / 中文` switch
  - has a single `Back Home / 返回首页` link
  - keeps author GitHub info
  - keeps repo link
  - renders a compact one-line starter instead of the full long prompt
- `skill.md` and `docs/skill.md` stay content-identical and include the generated canonical role-prompt appendix
- every role change is reflected in:
  - `docs/index.html`
  - `README.md`
  - `README.zh-CN.md`

## Editing rules

- Edit prompt source files first. Do not hand-edit public role-page starters unless you are fixing page structure.
- Use `sync_role_page.py` to keep role pages compact.
- Use `sync_skill_entry.py` to push prompt changes into the public `skill.md` appendix.
- Use `sync_registry_surfaces.py` to update homepage cards and README role lists.
- Keep English and Chinese prompt files semantically aligned.
- Keep English as the default language in HTML.
- Preserve privacy-boundary language unless the user explicitly wants to change the data policy.
- Prefer changing the minimum necessary copy. Do not rewrite unrelated roles.

## Final check

Before finishing:

```bash
python3 .codex/skills/git-hired-jd-ops/scripts/sync_registry_surfaces.py
python3 .codex/skills/git-hired-jd-ops/scripts/sync_skill_entry.py
python3 .codex/skills/git-hired-jd-ops/scripts/validate_roles.py
git diff --stat
```
