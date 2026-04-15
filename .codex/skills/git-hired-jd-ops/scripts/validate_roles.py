#!/usr/bin/env python3

from __future__ import annotations

import json
import sys
from pathlib import Path


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "README.md").exists() and (candidate / "roles.json").exists():
            return candidate
    raise SystemExit("Could not locate git-hired repo root.")


def main() -> None:
    repo_root = find_repo_root(Path.cwd())
    roles = json.loads((repo_root / "roles.json").read_text(encoding="utf-8"))
    index_text = (repo_root / "docs" / "index.html").read_text(encoding="utf-8")
    readme_en = (repo_root / "README.md").read_text(encoding="utf-8")
    readme_zh = (repo_root / "README.zh-CN.md").read_text(encoding="utf-8")

    errors: list[str] = []
    warnings: list[str] = []

    page_slugs = set()
    prompt_slugs = set()
    prompt_bases = set()

    for role in roles:
        page_slug = role["page_slug"]
        prompt_slug = role["prompt_slug"]
        prompt_base = role["prompt_base"]

        if page_slug in page_slugs:
            errors.append(f"duplicate page_slug in roles.json: {page_slug}")
        page_slugs.add(page_slug)

        if prompt_slug in prompt_slugs:
            errors.append(f"duplicate prompt_slug in roles.json: {prompt_slug}")
        prompt_slugs.add(prompt_slug)

        if prompt_base in prompt_bases:
            errors.append(f"duplicate prompt_base in roles.json: {prompt_base}")
        prompt_bases.add(prompt_base)

        zh_prompt = repo_root / "prompts" / f"{prompt_slug}.md"
        en_prompt = repo_root / "prompts" / f"{prompt_slug}.en.md"
        page = repo_root / "docs" / f"{page_slug}.html"

        if not zh_prompt.exists():
            errors.append(f"missing Chinese prompt file: prompts/{prompt_slug}.md")
        if not en_prompt.exists():
            errors.append(f"missing English prompt file: prompts/{prompt_slug}.en.md")
        if not page.exists():
            errors.append(f"missing role page: docs/{page_slug}.html")

        if f'href="./{page_slug}.html"' not in index_text:
            errors.append(f"docs/index.html missing link to ./{page_slug}.html")

        if f"prompts/{prompt_slug}.md" not in readme_en or f"prompts/{prompt_slug}.en.md" not in readme_en:
            warnings.append(f"README.md may be missing prompt source references for {prompt_slug}")

        if f"prompts/{prompt_slug}.md" not in readme_zh or f"prompts/{prompt_slug}.en.md" not in readme_zh:
            warnings.append(f"README.zh-CN.md may be missing prompt source references for {prompt_slug}")

        if page.exists():
            page_text = page.read_text(encoding="utf-8")
            if 'href="./index.html"' not in page_text:
                errors.append(f"docs/{page_slug}.html missing back-home link")
            if "https://github.com/realRoc" not in page_text:
                errors.append(f"docs/{page_slug}.html missing author GitHub link")
            if "https://github.com/realRoc/git-hired" not in page_text:
                errors.append(f"docs/{page_slug}.html missing repo link")
            if f'prompts/{prompt_slug}.md' not in page_text:
                warnings.append(f"docs/{page_slug}.html may be missing Chinese source prompt footer for {prompt_slug}")
            if f'prompts/{prompt_slug}.en.md' not in page_text:
                warnings.append(f"docs/{page_slug}.html may be missing English source prompt footer for {prompt_slug}")

    if errors:
        print("Role validation failed:\n")
        for item in errors:
            print(f"ERROR: {item}")
        if warnings:
            print("\nWarnings:")
            for item in warnings:
                print(f"- {item}")
        sys.exit(1)

    print("Role validation passed.")
    print(f"- roles checked: {len(roles)}")
    print(f"- page slugs: {', '.join(sorted(page_slugs))}")
    print(f"- prompt slugs: {', '.join(sorted(prompt_slugs))}")
    if warnings:
        print("\nWarnings:")
        for item in warnings:
            print(f"- {item}")


if __name__ == "__main__":
    main()
