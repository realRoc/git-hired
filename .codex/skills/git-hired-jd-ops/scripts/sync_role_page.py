#!/usr/bin/env python3

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "README.md").exists() and (candidate / "roles.json").exists():
            return candidate
    raise SystemExit("Could not locate git-hired repo root.")


def load_roles(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))


def replace_prompt_block(page_text: str, prompt_id: str, prompt_text: str) -> str:
    escaped = html.escape(prompt_text, quote=False)
    pattern = rf'(<pre class="prompt" id="{re.escape(prompt_id)}" data-lang="(?:en|zh)">)(.*?)(</pre>)'
    new_text, count = re.subn(pattern, rf"\1{escaped}\3", page_text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"Could not locate prompt block id: {prompt_id}")
    return new_text


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync prompt source files into a docs role page.")
    parser.add_argument("--page-slug", required=True)
    args = parser.parse_args()

    repo_root = find_repo_root(Path.cwd())
    roles = load_roles(repo_root / "roles.json")
    role = next((item for item in roles if item["page_slug"] == args.page_slug), None)
    if not role:
        raise SystemExit(f"No role found for page_slug={args.page_slug}")

    page_path = repo_root / "docs" / f"{role['page_slug']}.html"
    zh_path = repo_root / "prompts" / f"{role['prompt_slug']}.md"
    en_path = repo_root / "prompts" / f"{role['prompt_slug']}.en.md"

    if not page_path.exists():
        raise SystemExit(f"Missing page: {page_path}")
    if not zh_path.exists():
        raise SystemExit(f"Missing Chinese prompt source: {zh_path}")
    if not en_path.exists():
        raise SystemExit(f"Missing English prompt source: {en_path}")

    page_text = page_path.read_text(encoding="utf-8")
    page_text = replace_prompt_block(page_text, f"{role['prompt_base']}-en", en_path.read_text(encoding="utf-8"))
    page_text = replace_prompt_block(page_text, f"{role['prompt_base']}-zh", zh_path.read_text(encoding="utf-8"))
    page_path.write_text(page_text, encoding="utf-8")

    print(f"Synchronized prompts into docs/{role['page_slug']}.html")


if __name__ == "__main__":
    main()
