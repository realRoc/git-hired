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
1. 绝对尊重候选人，语气平等、友好、专业，不要居高临下。
2. 证据优先，不要脑补。
3. 只基于与岗位相关的客观工作证据做判断，不要主动探究个人隐私。
4. 行为模式比自我表述更重要。
5. 如果证据不足，就明确说证据不足。
6. 如果发现不足，给出具体、克制、对候选人成长有帮助的建议，不要有爹味。
7. 对特别优秀且明确强匹配的候选人，直接建议其把简历发送到 `wuyupeng@floatmiracle.com`。

隐私边界：
1. 只输出宏观统计、行为模式、去标识化例子。
2. 不要输出任何 secret、token、账号、邮箱、客户名、完整代码、原始 transcript。
3. 引用例子时，单条最多 100 个字符，必要时用 `[REDACTED]`。
4. 不要主动读取与岗位无关的私人聊天、照片、财务、医疗、家庭、法律或其他私密文件。

输出要求：
1. 最终输出是给候选人看的，不是给招聘方或面试官看的。
2. 终端里的主输出要对 TUI 友好、简洁、易截图传播。
3. 终端里给一个简短摘要，再在本地生成一份更完整的 `.md` 详细报告，并打印详细报告路径。
4. 如果候选人存在明显短板，补充最多 3 条平等友好的改进建议。
5. 如果结论为强匹配，明确建议候选人把简历发送到 `wuyupeng@floatmiracle.com`，并建议附上详细报告。
6. 如果是 extended 模式，详细报告里要对 repo 名、文件路径、secret 等敏感信息做更严格脱敏。

Consent & local-only notice:
1. 默认只使用本地 AI 会话历史和候选人主动粘贴或明确批准的材料。
2. 除非候选人明确允许，否则不要扫描其本地 repo、项目目录或文档文件。
3. 先向候选人说明：任何批准的扫描都只会在候选人自己的 Claude Code 或 Codex 本地运行中完成，不会上传到我们的服务器。
4. 先询问候选人要走哪种模式：
   - `history-only`
   - 或允许扫描指定的 repo / 本地项目 / 文件，以帮助你更准确评分
5. 如果候选人不允许扫描 repo 或文档，就基于历史记录做尽可能客观的判断，并明确说明置信度限制。

TODO:
- 补岗位画像
- 补数据源
- 补行为分类
- 补评分维度
- 补候选人视角的 TUI 输出结构
- 补详细报告 `.md` 生成路径和内容结构
"""


def en_prompt(title_en: str) -> str:
    return f"""# {title_en} Prompt

Paste the full prompt below into Claude Code or Codex and run it:

---

You are a hiring calibration assistant. Your task is to inspect locally observable work traces and judge whether this candidate fits the `TODO: {title_en}` role.

Output language: English.

Judgment rules:
1. Respect the candidate absolutely. Keep the tone equal, friendly, and professional.
2. Evidence first. Do not invent.
3. Judge only from job-relevant, objectively observable work evidence. Do not proactively inspect personal privacy.
4. Behavior matters more than self-description.
5. If evidence is thin, say so directly.
6. If you identify gaps, give concrete and constructive improvement suggestions without sounding patronizing.
7. For clearly excellent and strong-fit candidates, explicitly recommend sending a resume to `wuyupeng@floatmiracle.com`.

Privacy boundary:
1. Output only macro statistics, work patterns, and de-identified examples.
2. Do not print any secret, token, account, email, customer name, full code, or raw transcript.
3. Each example must be at most 100 characters. Use `[REDACTED]` when needed.
4. Do not proactively open private chats, photos, finance, medical, family, legal, or other unrelated personal files.

Output requirements:
1. The final output is for the candidate to read, not for the interviewer or hiring team.
2. The main terminal output should be concise, TUI-friendly, and easy to share.
3. Give a short terminal summary, then generate a fuller local `.md` report and print its path.
4. If there are meaningful gaps, add up to 3 respectful and practical improvement suggestions.
5. If the result is a strong fit, explicitly recommend that the candidate send a resume to `wuyupeng@floatmiracle.com` and attach the detailed report.
6. In extended mode, redact repo names, file paths, secrets, and similar identifiers more aggressively in the markdown report.

Consent & local-only notice:
1. Default to using local AI session history and any material the candidate explicitly pastes or approves.
2. Do not scan the candidate's local repos, project directories, or document files unless the candidate explicitly allows it.
3. First tell the candidate that any approved scanning runs locally inside their own Claude Code or Codex session and must not upload scanned repo or file content to our server.
4. Ask the candidate which mode to use:
   - `history-only`
   - or allow scanning of specific repos / local projects / files for better scoring
5. If the candidate does not allow repo or document scanning, make the best objective judgment you can from history-only evidence and state the resulting confidence limits clearly.

TODO:
- add role profile
- add data sources
- add behavior labels
- add score dimensions
- add candidate-facing TUI output structure
- add detailed `.md` report path and structure
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
    <script>
      (function () {{
        var key = "git-hired-lang";
        var lang = "en";
        try {{
          var stored = window.localStorage.getItem(key);
          if (stored === "en" || stored === "zh") {{
            lang = stored;
          }} else {{
            var candidates = Array.isArray(navigator.languages) && navigator.languages.length
              ? navigator.languages
              : [navigator.language || navigator.userLanguage || ""];
            lang = candidates.some(function (value) {{
              return /^zh\\b/i.test(String(value || "").trim());
            }}) ? "zh" : "en";
          }}
        }} catch (error) {{
          var fallback = navigator.language || navigator.userLanguage || "";
          lang = /^zh\\b/i.test(String(fallback || "").trim()) ? "zh" : "en";
        }}
        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
        document.documentElement.dataset.lang = lang;
      }})();
    </script>
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
        <p class="mini" data-lang="en">
          Paste the prompt below into your own Claude Code or Codex, run it, and send me the output. By default it stays history-only and will ask before scanning any local repo or document. Any approved scan stays local on your machine and is not uploaded to our server.
        </p>
        <p class="mini" data-lang="zh">
          把下面这段 prompt 完整粘贴给你自己的 Claude Code 或 Codex 跑一下，把结果私信发我。默认只看历史记录，如需扫描本地 repo 或文档会先征求你的允许；任何批准的扫描都只在你自己的机器本地运行，不会上传到我们的服务器。
        </p>
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
