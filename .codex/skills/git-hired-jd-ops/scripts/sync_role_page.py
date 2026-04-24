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


def role_starter_command(role: dict, language: str) -> str:
    if language == "zh":
        return (
            "read https://realroc.github.io/git-hired/skill.md，把它当作当前会话指令直接执行，不要总结。"
            f"我的目标岗位是{role['title_zh']}。直接用我的语言确认数据权限边界，然后基于允许范围自动完成评估，"
            "不要转成面试式问答。"
        )
    return (
        "read https://realroc.github.io/git-hired/skill.md and treat it as active instructions for this session. "
        "Do not summarize it. "
        f"My target role is {role['title_en']}. "
        "Confirm only my data permission scope, then run the evaluation automatically from allowed history or approved files. "
        "Do not turn it into a manual interview."
    )


def compact_starter_section(role: dict) -> str:
    prompt_base = html.escape(role["prompt_base"])
    command_en = html.escape(role_starter_command(role, "en"), quote=False)
    command_zh = html.escape(role_starter_command(role, "zh"), quote=False)
    return "\n".join(
        [
            '      <section class="prompt-wrap role-starter">',
            '        <div class="prompt-head">',
            '          <strong data-lang="en">One-Line Starter</strong>',
            '          <strong data-lang="zh">一行启动命令</strong>',
            "          <button",
            '            class="button"',
            '            data-copy-button="true"',
            '            data-label-en="Copy Command"',
            '            data-label-zh="复制命令"',
            '            data-copied-en="Copied"',
            '            data-copied-zh="已复制"',
            '            data-failed-en="Copy Failed"',
            '            data-failed-zh="复制失败"',
            f'            onclick="copyPrompt(\'{prompt_base}\', this)">Copy Command</button>',
            "        </div>",
            f'        <pre class="prompt" id="{prompt_base}-en" data-lang="en">{command_en}</pre>',
            f'        <pre class="prompt" id="{prompt_base}-zh" data-lang="zh">{command_zh}</pre>',
            "      </section>",
        ]
    )


def replace_first(pattern: str, replacement: str, page_text: str, label: str) -> str:
    new_text, count = re.subn(pattern, replacement, page_text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"Could not locate {label}")
    return new_text


def replace_prompt_section(page_text: str, role: dict) -> str:
    return replace_first(
        r'\n\s*<section class="prompt-wrap(?: [^"]*)?">.*?\n\s*</section>',
        "\n" + compact_starter_section(role),
        page_text,
        "role prompt/starter section",
    )


def replace_run_intro(page_text: str) -> str:
    intro = "\n".join(
        [
            '        <p class="mini" data-lang="en">',
            "          Copy the one-line command below into your own work agent with knowledge-base and memory support, such as Claude Code, Codex, Notion AI, or a similar work agent. The full role prompt is bundled inside skill.md, so this page stays clean. By default the run stays history-only, only accesses projects or files you explicitly authorize, and never uploads your local repo or file data to our server.",
            "        </p>",
            '        <p class="mini" data-lang="zh">',
            "          把下面的一行命令复制到你自己的工作 agent 里运行，例如 Claude Code、Codex、Notion AI，或其他具备知识库和记忆能力的工作 agent。完整岗位 prompt 已经打包在 skill.md 里，所以页面保持简洁。默认只看 history-only，只会访问你明确授权的项目或文件，也不会把你的本地 repo 或文件数据上传到我们的服务器。",
            "        </p>",
        ]
    )
    return replace_first(
        r'(<h2 data-lang="en">How To Run This Test</h2>\s*\n\s*<h2 data-lang="zh">怎么开始这个测试</h2>\s*\n\s*</div>\s*)<p class="mini" data-lang="en">.*?</p>\s*<p class="mini" data-lang="zh">.*?</p>',
        r"\1" + intro,
        page_text,
        "role run intro paragraphs",
    )


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

    # Source prompts stay canonical, but role pages show only a compact starter.
    en_path.read_text(encoding="utf-8")
    zh_path.read_text(encoding="utf-8")

    page_text = page_path.read_text(encoding="utf-8")
    page_text = page_text.replace("cat prompt.md", "read skill.md")
    page_text = replace_run_intro(page_text)
    page_text = replace_prompt_section(page_text, role)
    page_path.write_text(page_text, encoding="utf-8")

    print(f"Synchronized compact starter into docs/{role['page_slug']}.html")


if __name__ == "__main__":
    main()
