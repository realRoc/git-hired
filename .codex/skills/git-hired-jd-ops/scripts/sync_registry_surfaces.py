#!/usr/bin/env python3

from __future__ import annotations

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
    roles = json.loads(path.read_text(encoding="utf-8"))
    required_keys = {
        "page_slug",
        "prompt_slug",
        "prompt_base",
        "title_en",
        "title_zh",
        "summary_en",
        "summary_zh",
    }
    for role in roles:
        missing = sorted(required_keys - role.keys())
        if missing:
            raise SystemExit(
                f"roles.json entry for {role.get('page_slug', '<unknown>')} is missing keys: {', '.join(missing)}"
            )
    return roles


def replace_block(text: str, start_marker: str, end_marker: str, replacement: str) -> str:
    pattern = re.compile(rf"(?s)[ \t]*{re.escape(start_marker)}.*?[ \t]*{re.escape(end_marker)}")
    if not pattern.search(text):
        raise SystemExit(f"Could not find marker block: {start_marker} ... {end_marker}")
    return pattern.sub(replacement, text, count=1)


def generate_index_cards(roles: list[dict]) -> str:
    blocks: list[str] = []
    for index, role in enumerate(roles, start=1):
        title_en = html.escape(role["title_en"])
        title_zh = html.escape(role["title_zh"])
        summary_en = html.escape(role["summary_en"])
        summary_zh = html.escape(role["summary_zh"])
        page_slug = html.escape(role["page_slug"])
        idx = f"{index:02d}"
        blocks.append(
            "\n".join(
                [
                    '        <article class="card">',
                    '          <div class="role-meta">',
                    f'            <span class="slug">{page_slug}.html</span>',
                    f'            <span class="idx">{idx}</span>',
                    "          </div>",
                    f'          <h3 data-lang="en">{title_en}</h3>',
                    f'          <h3 data-lang="zh">{title_zh}</h3>',
                    f'          <p data-lang="en">{summary_en}</p>',
                    f'          <p data-lang="zh">{summary_zh}</p>',
                    f'          <a class="card-foot" href="./{page_slug}.html">',
                    '            <span data-lang="en">open test</span>',
                    '            <span data-lang="zh">打开测试</span>',
                    '            <span class="open">./run</span>',
                    "          </a>",
                    "        </article>",
                ]
            )
        )

    body = "\n\n".join(blocks)
    return "\n".join(
        [
            "        <!-- AUTO:role-cards:start -->",
            body,
            "        <!-- AUTO:role-cards:end -->",
        ]
    )


def generate_role_list(roles: list[dict], language: str) -> str:
    lines = ["<!-- AUTO:role-list:start -->"]
    key = "title_en" if language == "en" else "title_zh"
    for role in roles:
        lines.append(f"- `{role[key]}`")
    lines.append("<!-- AUTO:role-list:end -->")
    return "\n".join(lines)


def sync_index(repo_root: Path, roles: list[dict]) -> None:
    path = repo_root / "docs" / "index.html"
    text = path.read_text(encoding="utf-8")
    text = replace_block(
        text,
        "<!-- AUTO:role-cards:start -->",
        "<!-- AUTO:role-cards:end -->",
        generate_index_cards(roles),
    )
    path.write_text(text, encoding="utf-8")


def sync_readme(repo_root: Path, roles: list[dict], filename: str, language: str) -> None:
    path = repo_root / filename
    text = path.read_text(encoding="utf-8")
    text = replace_block(
        text,
        "<!-- AUTO:role-list:start -->",
        "<!-- AUTO:role-list:end -->",
        generate_role_list(roles, language),
    )
    path.write_text(text, encoding="utf-8")


def main() -> None:
    repo_root = find_repo_root(Path.cwd())
    roles = load_roles(repo_root / "roles.json")
    sync_index(repo_root, roles)
    sync_readme(repo_root, roles, "README.md", "en")
    sync_readme(repo_root, roles, "README.zh-CN.md", "zh")
    print("Registry-driven surfaces synced.")
    print("- docs/index.html")
    print("- README.md")
    print("- README.zh-CN.md")


if __name__ == "__main__":
    main()
