#!/usr/bin/env python3

from __future__ import annotations

import argparse
import html
import json
from pathlib import Path


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "README.md").exists() and (candidate / "docs").is_dir() and (candidate / "prompts").is_dir():
            return candidate
    raise SystemExit("Could not locate git-hired repo root.")


def load_roles(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def save_roles(path: Path, roles: list[dict]) -> None:
    path.write_text(json.dumps(roles, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_file_if_missing(path: Path, content: str, force: bool) -> None:
    if path.exists() and not force:
        raise SystemExit(f"Refusing to overwrite existing file: {path}")
    path.write_text(content, encoding="utf-8")


def zh_prompt(title_zh: str) -> str:
    return f"""# {title_zh} Prompt

把下面整段完整粘贴到 Claude Code 或 Codex 中执行：

---

你现在是一个招聘校准助手。你的任务是基于本机可观察到的工作痕迹，判断这位候选人是否适合 `TODO: {title_zh}` 岗位。

输出语言：中文。

判断原则：
1. 证据优先，不要脑补。
2. 行为模式比自我表述更重要。
3. 如果证据不足，就明确说证据不足。

隐私边界：
1. 只输出宏观统计、行为模式、去标识化例子。
2. 不要输出任何 secret、token、账号、邮箱、客户名、完整代码、原始 transcript。
3. 引用例子时，单条最多 100 个字符，必要时用 `[REDACTED]`。

TODO:
- 补岗位画像
- 补数据源
- 补行为分类
- 补评分维度
- 补输出结构
"""


def en_prompt(title_en: str) -> str:
    return f"""# {title_en} Prompt

Paste the full prompt below into Claude Code or Codex and run it:

---

You are a hiring calibration assistant. Your task is to inspect locally observable work traces and judge whether this candidate fits the `TODO: {title_en}` role.

Output language: English.

Judgment rules:
1. Evidence first. Do not invent.
2. Behavior matters more than self-description.
3. If evidence is thin, say so directly.

Privacy boundary:
1. Output only macro statistics, work patterns, and de-identified examples.
2. Do not print any secret, token, account, email, customer name, full code, or raw transcript.
3. Each example must be at most 100 characters. Use `[REDACTED]` when needed.

TODO:
- add role profile
- add data sources
- add behavior labels
- add score dimensions
- add output structure
"""


def role_page(
    page_slug: str,
    prompt_slug: str,
    prompt_base: str,
    title_en: str,
    title_zh: str,
    summary_en: str,
    summary_zh: str,
    prompt_en_text: str,
    prompt_zh_text: str,
) -> str:
    prompt_en = html.escape(prompt_en_text, quote=False)
    prompt_zh = html.escape(prompt_zh_text, quote=False)
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{title_en} Test · git-hired</title>
    <meta name="description" content="{title_en} fit test prompt for Claude Code or Codex.">
    <link rel="stylesheet" href="./style.css">
    <script src="./app.js" defer></script>
  </head>
  <body class="lang-en" data-lang="en" data-title-en="{title_en} Test · git-hired" data-title-zh="{title_zh}测试 · git-hired">
    <main class="shell">
      <section class="hero">
        <div class="hero-top">
          <span class="eyebrow" data-lang="en">Role Test</span>
          <span class="eyebrow" data-lang="zh">岗位测试</span>
          <div class="lang-switch" aria-label="Language switcher">
            <button class="lang-button" data-lang-button="en" onclick="setLanguage('en')">EN</button>
            <button class="lang-button" data-lang-button="zh" onclick="setLanguage('zh')">中文</button>
          </div>
        </div>
        <h1 data-lang="en">{title_en}</h1>
        <h1 data-lang="zh">{title_zh}</h1>
        <p class="lede" data-lang="en">{summary_en}</p>
        <p class="lede" data-lang="zh">{summary_zh}</p>
        <div class="inline-links">
          <a class="button secondary" href="./index.html" data-lang="en">Back Home</a>
          <a class="button secondary" href="./index.html" data-lang="zh">返回首页</a>
        </div>
      </section>

      <section class="section">
        <h2 data-lang="en">Message To Send The Candidate</h2>
        <h2 data-lang="zh">发给候选人的话术</h2>
        <p class="mini" data-lang="en">Paste the prompt below into your own Claude Code or Codex, run it, and send me the output.</p>
        <p class="mini" data-lang="zh">把下面这段 prompt 完整粘贴给你自己的 Claude Code 或 Codex 跑一下，把结果私信发我。</p>
      </section>

      <section class="section">
        <h2 data-lang="en">What This Test Looks For</h2>
        <h2 data-lang="zh">这个测试主要看什么</h2>
        <ul data-lang="en">
          <li>TODO: replace with role-specific English bullets.</li>
        </ul>
        <ul data-lang="zh">
          <li>TODO：替换成岗位相关的中文要点。</li>
        </ul>
      </section>

      <section class="prompt-wrap">
        <div class="prompt-head">
          <strong data-lang="en">Copy this directly into Claude Code or Codex</strong>
          <strong data-lang="zh">复制后直接粘贴到 Claude Code / Codex</strong>
          <button
            class="button"
            data-copy-button="true"
            data-label-en="Copy Prompt"
            data-label-zh="复制 Prompt"
            data-copied-en="Copied"
            data-copied-zh="已复制"
            data-failed-en="Copy Failed"
            data-failed-zh="复制失败"
            onclick="copyPrompt('{prompt_base}', this)">Copy Prompt</button>
        </div>
        <pre class="prompt" id="{prompt_base}-en" data-lang="en">{prompt_en}</pre>
        <pre class="prompt" id="{prompt_base}-zh" data-lang="zh">{prompt_zh}</pre>
      </section>

      <section class="section">
        <p class="author-line" data-lang="en">
          Created by <a href="https://github.com/realRoc" target="_blank" rel="noreferrer">realRoc</a>.
          Repository: <a href="https://github.com/realRoc/git-hired" target="_blank" rel="noreferrer">github.com/realRoc/git-hired</a>
        </p>
        <p class="author-line" data-lang="zh">
          作者：<a href="https://github.com/realRoc" target="_blank" rel="noreferrer">realRoc</a>。
          仓库地址：<a href="https://github.com/realRoc/git-hired" target="_blank" rel="noreferrer">github.com/realRoc/git-hired</a>
        </p>
      </section>

      <p class="footer" data-lang="en">Source prompts: <code>prompts/{prompt_slug}.en.md</code> and <code>prompts/{prompt_slug}.md</code></p>
      <p class="footer" data-lang="zh">源 prompt：<code>prompts/{prompt_slug}.en.md</code> 和 <code>prompts/{prompt_slug}.md</code></p>
    </main>
  </body>
</html>
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Scaffold a new git-hired role.")
    parser.add_argument("--page-slug", required=True)
    parser.add_argument("--prompt-slug", required=True)
    parser.add_argument("--prompt-base", required=True)
    parser.add_argument("--title-en", required=True)
    parser.add_argument("--title-zh", required=True)
    parser.add_argument("--summary-en", required=True)
    parser.add_argument("--summary-zh", required=True)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    repo_root = find_repo_root(Path.cwd())
    roles_path = repo_root / "roles.json"
    roles = load_roles(roles_path)

    for role in roles:
        if args.page_slug == role["page_slug"]:
            raise SystemExit(f"page_slug already exists: {args.page_slug}")
        if args.prompt_slug == role["prompt_slug"]:
            raise SystemExit(f"prompt_slug already exists: {args.prompt_slug}")
        if args.prompt_base == role["prompt_base"]:
            raise SystemExit(f"prompt_base already exists: {args.prompt_base}")

    zh_prompt_path = repo_root / "prompts" / f"{args.prompt_slug}.md"
    en_prompt_path = repo_root / "prompts" / f"{args.prompt_slug}.en.md"
    page_path = repo_root / "docs" / f"{args.page_slug}.html"

    zh_text = zh_prompt(args.title_zh)
    en_text = en_prompt(args.title_en)

    write_file_if_missing(zh_prompt_path, zh_text, args.force)
    write_file_if_missing(en_prompt_path, en_text, args.force)
    write_file_if_missing(
        page_path,
        role_page(
            args.page_slug,
            args.prompt_slug,
            args.prompt_base,
            args.title_en,
            args.title_zh,
            args.summary_en,
            args.summary_zh,
            en_text,
            zh_text,
        ),
        args.force,
    )

    roles.append(
        {
            "page_slug": args.page_slug,
            "prompt_slug": args.prompt_slug,
            "prompt_base": args.prompt_base,
            "title_en": args.title_en,
            "title_zh": args.title_zh,
            "summary_en": args.summary_en,
            "summary_zh": args.summary_zh,
        }
    )
    save_roles(roles_path, roles)

    print("Scaffold complete.")
    print(f"- {zh_prompt_path.relative_to(repo_root)}")
    print(f"- {en_prompt_path.relative_to(repo_root)}")
    print(f"- {page_path.relative_to(repo_root)}")
    print("- roles.json updated")
    print("Next:")
    print("1. Edit the two prompt source files")
    print("2. Edit role-specific bullets in the HTML page")
    print("3. Run sync_registry_surfaces.py")
    print("4. Run validate_roles.py")


if __name__ == "__main__":
    main()
