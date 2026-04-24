#!/usr/bin/env python3

from __future__ import annotations

import json
import re
from pathlib import Path


START = "<!-- AUTO:role-prompts:start -->"
END = "<!-- AUTO:role-prompts:end -->"


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "README.md").exists() and (candidate / "roles.json").exists():
            return candidate
    raise SystemExit("Could not locate git-hired repo root.")


def fenced_prompt(path: Path, label: str) -> str:
    text = path.read_text(encoding="utf-8").rstrip()
    return "\n".join(
        [
            f"### {label}",
            "",
            "```markdown",
            text,
            "```",
            "",
        ]
    )


def generate_appendix(repo_root: Path) -> str:
    roles = json.loads((repo_root / "roles.json").read_text(encoding="utf-8"))
    sections = [
        START,
        "## Canonical role prompt appendix",
        "",
        "This generated appendix is intentionally bundled into `skill.md` so public role pages can stay clean and compact. Do not execute every prompt in this appendix. After the candidate chooses a role and language, activate only the matching prompt.",
        "",
    ]

    for role in roles:
        prompt_slug = role["prompt_slug"]
        title_en = role["title_en"]
        title_zh = role["title_zh"]
        en_path = repo_root / "prompts" / f"{prompt_slug}.en.md"
        zh_path = repo_root / "prompts" / f"{prompt_slug}.md"
        if not en_path.exists():
            raise SystemExit(f"Missing English prompt source: {en_path}")
        if not zh_path.exists():
            raise SystemExit(f"Missing Chinese prompt source: {zh_path}")
        sections.extend(
            [
                f"## {title_en} / {title_zh}",
                "",
                fenced_prompt(en_path, f"{prompt_slug}.en.md"),
                fenced_prompt(zh_path, f"{prompt_slug}.md"),
            ]
        )

    sections.append(END)
    return "\n".join(sections)


def replace_block(text: str, replacement: str) -> str:
    pattern = re.compile(rf"(?s){re.escape(START)}.*?{re.escape(END)}")
    if not pattern.search(text):
        raise SystemExit(f"Missing generated appendix markers: {START} ... {END}")
    return pattern.sub(replacement, text, count=1)


def main() -> None:
    repo_root = find_repo_root(Path.cwd())
    skill_path = repo_root / "skill.md"
    public_skill_path = repo_root / "docs" / "skill.md"
    appendix = generate_appendix(repo_root)
    next_text = replace_block(skill_path.read_text(encoding="utf-8"), appendix)
    skill_path.write_text(next_text.rstrip() + "\n", encoding="utf-8")
    public_skill_path.write_text(skill_path.read_text(encoding="utf-8"), encoding="utf-8")
    print("Skill entry synced.")
    print("- skill.md")
    print("- docs/skill.md")


if __name__ == "__main__":
    main()
