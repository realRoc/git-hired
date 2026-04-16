#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


EN_VERSION_RE = re.compile(r"- exact version: `([^`]+)`")
ZH_VERSION_RE = re.compile(r"- 精确版本：`([^`]+)`")
HIRED_HEADER_MARKER = "██╗  ██╗██╗██████╗ ███████╗██████╗"
BLOCK_BAR_MARKER = "[███████░░░] 7"
OLD_BAR_MARKER = "[#######---]"
MBTI_EN_MARKER = "MBTI work personality"
MBTI_ZH_MARKER = "MBTI 工作人格"
ASCII_CARD_EN_MARKER = "ASCII card"
ASCII_CARD_ZH_MARKER = "ASCII 卡片"
ASCII_CARD_URL_BASE = "https://realroc.github.io/git-hired/assets/mbti/"
MBTI_TYPES = (
    "intj", "intp", "entj", "entp",
    "infj", "infp", "enfj", "enfp",
    "istj", "isfj", "estj", "esfj",
    "istp", "isfp", "estp", "esfp",
)


def extract_en_prompt_version(text: str) -> str | None:
    match = EN_VERSION_RE.search(text)
    return match.group(1) if match else None


def extract_zh_prompt_version(text: str) -> str | None:
    match = ZH_VERSION_RE.search(text)
    return match.group(1) if match else None


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
    mbti_asset_dir = repo_root / "docs" / "assets" / "mbti"

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
    if MBTI_EN_MARKER not in index_text or MBTI_ZH_MARKER not in index_text:
        errors.append("docs/index.html missing MBTI work-personality candidate copy")

    if not mbti_asset_dir.exists():
        errors.append("docs/assets/mbti missing MBTI ASCII-card asset directory")
    else:
        manifest = mbti_asset_dir / "manifest.json"
        if not manifest.exists():
            errors.append("docs/assets/mbti/manifest.json missing")
        for mbti_type in MBTI_TYPES:
            if not (mbti_asset_dir / f"{mbti_type}.txt").exists():
                errors.append(f"docs/assets/mbti missing {mbti_type}.txt")
        if list(mbti_asset_dir.glob("*.svg")):
            errors.append("docs/assets/mbti should not contain legacy SVG files")

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
        if "bypass mode" not in general_text or "YOLO mode" not in general_text or "bypass 模式" not in general_text or "yolo 模式" not in general_text:
            errors.append("docs/general.html missing bilingual runtime-mode tip")
        if HIRED_HEADER_MARKER not in general_text:
            errors.append("docs/general.html missing updated readable HIRED header in prompt templates")
        if "Play a simple 3-frame `HIRED` animation" not in general_text or "先播放一个简单的 3 帧 `HIRED` 动态开场" not in general_text:
            errors.append("docs/general.html missing dependency-free HIRED animation guidance in prompt templates")
        if BLOCK_BAR_MARKER not in general_text:
            errors.append("docs/general.html missing block-bar score format guidance in prompt templates")
        if OLD_BAR_MARKER in general_text:
            errors.append("docs/general.html still contains old hash-based score bar examples")
        if "Fantasy annual package" in general_text or "虚构年包" in general_text or "市场估值（示意" in general_text:
            errors.append("docs/general.html still contains salary/compensation hook language in prompt templates")
        if "best-fit role" not in general_text or "最适合的岗位" not in general_text:
            errors.append("docs/general.html missing best-fit role guidance in prompt templates")
        if "alignment code" in general_text or "阵营编码" in general_text:
            errors.append("docs/general.html still contains deprecated alignment-code language")
        if MBTI_EN_MARKER not in general_text or MBTI_ZH_MARKER not in general_text:
            errors.append("docs/general.html missing MBTI work-personality guidance in prompt templates")
        if "pixel card" in general_text or ".svg" in general_text:
            errors.append("docs/general.html still contains legacy pixel-card or SVG language")
        if (
            ASCII_CARD_URL_BASE not in general_text
            or (ASCII_CARD_EN_MARKER not in general_text and ASCII_CARD_ZH_MARKER not in general_text)
            or ".txt" not in general_text
        ):
            errors.append("docs/general.html missing MBTI ASCII-card guidance in prompt templates")
        if "Talent Tags" not in general_text or "天赋词缀" not in general_text:
            errors.append("docs/general.html missing talent-tag guidance in prompt templates")
        if "Locked Skills" not in general_text or "待解锁天赋" not in general_text:
            errors.append("docs/general.html missing locked-skill guidance in prompt templates")
        if "JD prompt version" not in general_text or "universal-entry@" not in general_text:
            errors.append("docs/general.html missing prompt-version traceability in prompt templates")
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
        zh_prompt_version = None
        en_prompt_version = None
        if zh_prompt.exists():
            zh_prompt_text = zh_prompt.read_text(encoding="utf-8")
            if "history-only" not in zh_prompt_text or "上传到我们的服务器" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing consent-first local-only notice")
            if "详细报告" not in zh_prompt_text or "HIRED" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing candidate-facing TUI/report output requirements")
            if HIRED_HEADER_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing updated readable HIRED header")
            if "先播放一个简单的 3 帧 `HIRED` 动态开场" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing dependency-free HIRED animation guidance")
            if BLOCK_BAR_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing block-bar score format guidance")
            if OLD_BAR_MARKER in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains old hash-based score bar examples")
            if "虚构年包" in zh_prompt_text or "市场估值（示意" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains salary/compensation language")
            if "最适合的岗位" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing best-fit role guidance")
            if "阵营编码" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains deprecated alignment-code language")
            if MBTI_ZH_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing MBTI work-personality guidance")
            if "pixel card" in zh_prompt_text or ".svg" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains legacy pixel-card or SVG language")
            if ASCII_CARD_URL_BASE not in zh_prompt_text or ASCII_CARD_ZH_MARKER not in zh_prompt_text or ".txt" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing MBTI ASCII-card guidance")
            if "天赋词缀" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing talent-tag guidance")
            if "待解锁天赋" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing locked-skill guidance")
            if "岗位 Prompt 版本" not in zh_prompt_text or "JD prompt version" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing prompt-version guidance")
            if "Signal Board" in zh_prompt_text or "你已经很亮眼的地方" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains pre-MBTI output sections")
            if "## G. 面试建议" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains interviewer-facing interview section")
            zh_prompt_version = extract_zh_prompt_version(zh_prompt_text)
            if not zh_prompt_version:
                errors.append(f"prompts/{prompt_slug}.md missing exact prompt version string")
            elif not zh_prompt_version.startswith(f"{prompt_slug}@"):
                errors.append(f"prompts/{prompt_slug}.md prompt version should start with {prompt_slug}@")
        if en_prompt.exists():
            en_prompt_text = en_prompt.read_text(encoding="utf-8")
            if "history-only" not in en_prompt_text or "our server" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing consent-first local-only notice")
            if "Detailed report" not in en_prompt_text or "HIRED" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing candidate-facing TUI/report output requirements")
            if HIRED_HEADER_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing updated readable HIRED header")
            if "Play a simple 3-frame `HIRED` animation" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing dependency-free HIRED animation guidance")
            if BLOCK_BAR_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing block-bar score format guidance")
            if OLD_BAR_MARKER in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains old hash-based score bar examples")
            if "Fantasy annual package" in en_prompt_text or "Market Band (illustrative, not an offer)" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains salary/compensation language")
            if "best-fit role" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing best-fit role guidance")
            if "alignment code" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains deprecated alignment-code language")
            if MBTI_EN_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing MBTI work-personality guidance")
            if "pixel card" in en_prompt_text or ".svg" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains legacy pixel-card or SVG language")
            if ASCII_CARD_URL_BASE not in en_prompt_text or ASCII_CARD_EN_MARKER not in en_prompt_text or ".txt" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing MBTI ASCII-card guidance")
            if "Talent Tags" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing talent-tag guidance")
            if "Locked Skills" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing locked-skill guidance")
            if "JD prompt version" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing prompt-version guidance")
            if "Signal Board" in en_prompt_text or "What already stands out" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains pre-MBTI output sections")
            if "Interview Follow-ups" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains interviewer-facing interview section")
            en_prompt_version = extract_en_prompt_version(en_prompt_text)
            if not en_prompt_version:
                errors.append(f"prompts/{prompt_slug}.en.md missing exact prompt version string")
            elif not en_prompt_version.startswith(f"{prompt_slug}@"):
                errors.append(f"prompts/{prompt_slug}.en.md prompt version should start with {prompt_slug}@")

        if zh_prompt_version and en_prompt_version and zh_prompt_version != en_prompt_version:
            errors.append(f"prompt version mismatch for {prompt_slug}: zh={zh_prompt_version} en={en_prompt_version}")

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
            if "bypass mode" not in page_text or "YOLO mode" not in page_text or "bypass 模式" not in page_text or "yolo 模式" not in page_text:
                errors.append(f"docs/{page_slug}.html missing bilingual runtime-mode tip")
            if "Message To Send The Candidate" in page_text or "发给候选人的话术" in page_text:
                errors.append(f"docs/{page_slug}.html still contains recruiter-facing section headings")
            if "send me the output" in page_text or "把结果私信发我" in page_text:
                errors.append(f"docs/{page_slug}.html still contains recruiter-facing CTA copy")
            if "https://github.com/realRoc" not in page_text:
                errors.append(f"docs/{page_slug}.html missing author GitHub link")
            if "https://github.com/realRoc/git-hired" not in page_text:
                errors.append(f"docs/{page_slug}.html missing repo link")
            if "JD prompt version" not in page_text:
                errors.append(f"docs/{page_slug}.html missing embedded prompt version guidance")
            if HIRED_HEADER_MARKER not in page_text:
                errors.append(f"docs/{page_slug}.html missing synced readable HIRED header")
            if BLOCK_BAR_MARKER not in page_text:
                errors.append(f"docs/{page_slug}.html missing synced block-bar score format guidance")
            if OLD_BAR_MARKER in page_text:
                errors.append(f"docs/{page_slug}.html still contains old hash-based score bar examples")
            if "alignment code" in page_text or "阵营编码" in page_text:
                errors.append(f"docs/{page_slug}.html still contains deprecated alignment-code language")
            if MBTI_EN_MARKER not in page_text or MBTI_ZH_MARKER not in page_text:
                errors.append(f"docs/{page_slug}.html missing synced MBTI work-personality guidance")
            if "pixel card" in page_text or ".svg" in page_text:
                errors.append(f"docs/{page_slug}.html still contains legacy pixel-card or SVG language")
            if (
                ASCII_CARD_URL_BASE not in page_text
                or (ASCII_CARD_EN_MARKER not in page_text and ASCII_CARD_ZH_MARKER not in page_text)
                or ".txt" not in page_text
            ):
                errors.append(f"docs/{page_slug}.html missing synced MBTI ASCII-card guidance")
            if zh_prompt_version and zh_prompt_version not in page_text:
                errors.append(f"docs/{page_slug}.html missing synced prompt version {zh_prompt_version}")
            if en_prompt_version and en_prompt_version not in page_text:
                errors.append(f"docs/{page_slug}.html missing synced prompt version {en_prompt_version}")
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
