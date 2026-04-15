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
    general_page = repo_root / "docs" / "general.html"

    errors: list[str] = []
    warnings: list[str] = []

    if "<!-- AUTO:role-cards:start -->" not in index_text or "<!-- AUTO:role-cards:end -->" not in index_text:
        errors.append("docs/index.html missing AUTO role-cards markers")
    if "git-hired-lang" not in index_text:
        errors.append("docs/index.html missing language bootstrap script")
    if "./general.html" not in index_text:
        errors.append("docs/index.html missing universal entry link to ./general.html")
    if "See whether a candidate" in index_text or "看候选人是否" in index_text:
        errors.append("docs/index.html still contains recruiter-facing JD summary wording")

    if not general_page.exists():
        errors.append("docs/general.html missing universal entry page")
    else:
        general_text = general_page.read_text(encoding="utf-8")
        if "git-hired-lang" not in general_text:
            errors.append("docs/general.html missing language bootstrap script")
        if "current-role" not in general_text or "target-role" not in general_text:
            errors.append("docs/general.html missing current/target profession intake fields")
        if "history-only" not in general_text or "repo-scan-ready" not in general_text:
            errors.append("docs/general.html missing privacy mode controls")
        if 'id="prompt-general-en"' not in general_text or 'id="prompt-general-zh"' not in general_text:
            errors.append("docs/general.html missing generated prompt blocks")
        if "https://github.com/realRoc" not in general_text:
            errors.append("docs/general.html missing author GitHub link")
        if "https://github.com/realRoc/git-hired" not in general_text:
            errors.append("docs/general.html missing repo link")

    if "<!-- AUTO:live-links:start -->" not in readme_en or "<!-- AUTO:live-links:end -->" not in readme_en:
        errors.append("README.md missing AUTO live-links markers")
    if "<!-- AUTO:role-list:start -->" not in readme_en or "<!-- AUTO:role-list:end -->" not in readme_en:
        errors.append("README.md missing AUTO role-list markers")
    if "<!-- AUTO:live-links:start -->" not in readme_zh or "<!-- AUTO:live-links:end -->" not in readme_zh:
        errors.append("README.zh-CN.md missing AUTO live-links markers")
    if "<!-- AUTO:role-list:start -->" not in readme_zh or "<!-- AUTO:role-list:end -->" not in readme_zh:
        errors.append("README.zh-CN.md missing AUTO role-list markers")

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
        if zh_prompt.exists():
            zh_prompt_text = zh_prompt.read_text(encoding="utf-8")
            if "history-only" not in zh_prompt_text or "上传到我们的服务器" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing consent-first local-only notice")
            if "详细报告" not in zh_prompt_text or "HIRED" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing candidate-facing TUI/report output requirements")
            if "## G. 面试建议" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains interviewer-facing interview section")
        if en_prompt.exists():
            en_prompt_text = en_prompt.read_text(encoding="utf-8")
            if "history-only" not in en_prompt_text or "our server" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing consent-first local-only notice")
            if "Detailed report" not in en_prompt_text or "HIRED" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing candidate-facing TUI/report output requirements")
            if "Interview Follow-ups" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains interviewer-facing interview section")

        if "summary_en" not in role or not role["summary_en"]:
            errors.append(f"missing summary_en in roles.json for {page_slug}")
        if "summary_zh" not in role or not role["summary_zh"]:
            errors.append(f"missing summary_zh in roles.json for {page_slug}")
        if "See whether a candidate" in role["summary_en"]:
            errors.append(f"roles.json summary_en for {page_slug} should be candidate-facing, not recruiter-facing")
        if "看候选人是否" in role["summary_zh"]:
            errors.append(f"roles.json summary_zh for {page_slug} should be candidate-facing, not recruiter-facing")

        if f'href="./{page_slug}.html"' not in index_text:
            errors.append(f"docs/index.html missing link to ./{page_slug}.html")

        if page.exists():
            page_text = page.read_text(encoding="utf-8")
            if "history-only" not in page_text or "上传到我们的服务器" not in page_text:
                errors.append(f"docs/{page_slug}.html missing consent-first local-only candidate notice")
            if "git-hired-lang" not in page_text:
                errors.append(f"docs/{page_slug}.html missing language bootstrap script")
            if 'href="./index.html"' not in page_text:
                errors.append(f"docs/{page_slug}.html missing back-home link")
            if "Message To Send The Candidate" in page_text or "发给候选人的话术" in page_text:
                errors.append(f"docs/{page_slug}.html still contains recruiter-facing section headings")
            if "send me the output" in page_text or "把结果私信发我" in page_text:
                errors.append(f"docs/{page_slug}.html still contains recruiter-facing CTA copy")
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
