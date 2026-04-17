#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


EN_VERSION_RE = re.compile(r"- exact version: `([^`]+)`")
ZH_VERSION_RE = re.compile(r"- 精确版本：`([^`]+)`")
HIRED_HEADER_MARKER = "██╗  ██╗██╗██████╗ ███████╗██████╗"
BLOCK_BAR_MARKER = "[█████████░] 92"
OLD_BAR_MARKER = "[#######---]"
MBTI_EN_MARKER = "MBTI work personality"
MBTI_ZH_MARKER = "MBTI 工作人格"
TIME_BUDGET_EN_MARKER = "within about 1 minute"
TIME_BUDGET_ZH_MARKER = "1 分钟内"
UPLIFT_EN_MARKER = "Expected uplift"
UPLIFT_ZH_MARKER = "提升预估"
ASCII_CARD_EN_MARKER = "ASCII card"
ASCII_CARD_ZH_MARKER = "ASCII 卡片"
ASCII_CARD_URL_BASE = "https://realroc.github.io/git-hired/assets/mbti/"
WORK_AGENT_EN_MARKER = "work agent"
WORK_AGENT_ZH_MARKER = "工作 agent"
READ_COMMAND_MARKER = "read https://realroc.github.io/git-hired/skill.md"
NO_SUMMARY_EN_MARKER = "Do not summarize it."
NO_SUMMARY_ZH_MARKER = "不要总结"
IMMEDIATE_START_EN_MARKER = "Ask the first test question immediately"
IMMEDIATE_START_ZH_MARKER = "直接用我的语言开始第一问"
MBTI_ANTI_ANCHOR_EN_MARKER = "Do not default to `INTJ`, `TJ`, or any single"
MBTI_ANTI_ANCHOR_ZH_MARKER = "不要默认套用 `INTJ`、`TJ`"
MBTI_NEUTRAL_TF_EN_MARKER = "impersonal analysis and consistency vs human-context and value-weighting"
MBTI_NEUTRAL_TF_ZH_MARKER = "非人格化分析与一致性"
MBTI_SOLO_HISTORY_EN_MARKER = "treat `E`, `F`, and `P` as under-observed rather than absent"
MBTI_SOLO_HISTORY_ZH_MARKER = "把 `E`、`F`、`P` 视为“欠观察”而不是“没有”"
SCALE_NOTE_EN_MARKER = "Scale note"
SCALE_NOTE_ZH_MARKER = "刻度说明"
STRONG_SCORE_EN_MARKER = "70+ is already clearly strong here"
STRONG_SCORE_ZH_MARKER = "70+ 在这套体系里已经是明显强"
STANDOUT_DIMENSION_EN_MARKER = "should usually cross `90+`"
STANDOUT_DIMENSION_ZH_MARKER = "通常应该出现 `90+`"
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
    skill_source = repo_root / "skill.md"
    skill_public = repo_root / "docs" / "skill.md"
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
    if "./skill.md" not in index_text:
        errors.append("docs/index.html missing link to ./skill.md")
    if "./general.html" not in index_text:
        errors.append("docs/index.html missing guide link to ./general.html")
    if "See whether a candidate" in index_text or "看候选人是否" in index_text:
        errors.append("docs/index.html still contains recruiter-facing JD summary wording")
    if MBTI_EN_MARKER not in index_text or MBTI_ZH_MARKER not in index_text:
        errors.append("docs/index.html missing MBTI work-personality candidate copy")
    if READ_COMMAND_MARKER not in index_text:
        errors.append("docs/index.html missing one-line read skill command")
    if NO_SUMMARY_EN_MARKER not in index_text or IMMEDIATE_START_EN_MARKER not in index_text:
        errors.append("docs/index.html missing execution-first starter command wording")
    if "Copy Command" not in index_text or "复制命令" not in index_text:
        errors.append("docs/index.html missing copyable starter command UI")

    if not skill_source.exists():
        errors.append("skill.md missing root entry spec")
    if not skill_public.exists():
        errors.append("docs/skill.md missing deployed entry spec")
    if skill_source.exists() and skill_public.exists():
        skill_source_text = skill_source.read_text(encoding="utf-8")
        skill_public_text = skill_public.read_text(encoding="utf-8")
        if skill_source_text != skill_public_text:
            errors.append("skill.md and docs/skill.md must stay content-identical")
        if READ_COMMAND_MARKER not in skill_source_text:
            errors.append("skill.md missing public read command")
        if "## Execute, do not summarize" not in skill_source_text or "Your next assistant message must start the test immediately" not in skill_source_text:
            errors.append("skill.md missing immediate-execution guardrail")
        if "What target role are you aiming for right now?" not in skill_source_text or "你现在最想申请或转向的岗位是什么？" not in skill_source_text:
            errors.append("skill.md missing target-role-first entry question")
        if "What is your current profession or identity right now?" not in skill_source_text or "你当前的职业或身份是什么？" not in skill_source_text:
            errors.append("skill.md missing current profession / identity fallback question")
        if "history-only" not in skill_source_text or "our server" not in skill_source_text:
            errors.append("skill.md missing privacy-boundary wording")
        if "AI Agent Engineer" not in skill_source_text or "Product Manager" not in skill_source_text or "Global Growth" not in skill_source_text or "AI Product Operations" not in skill_source_text:
            errors.append("skill.md missing supported role registry")
        if "wuyupeng@floatmiracle.com" not in skill_source_text:
            errors.append("skill.md missing strong-candidate resume instruction")

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
        if "./skill.md" not in general_text:
            errors.append("docs/general.html missing link to ./skill.md")
        if "target role" not in general_text or "目标岗位" not in general_text:
            errors.append("docs/general.html missing target-role-first copy")
        if "current profession or identity" not in general_text or "当前的职业或身份" not in general_text:
            errors.append("docs/general.html missing current profession / identity fallback copy")
        if "history-only" not in general_text:
            errors.append("docs/general.html missing history-only privacy wording")
        if "bypass / YOLO" not in general_text:
            errors.append("docs/general.html missing bilingual runtime-mode tip")
        if WORK_AGENT_EN_MARKER not in general_text or WORK_AGENT_ZH_MARKER not in general_text:
            errors.append("docs/general.html missing work-agent compatibility wording")
        if "our server" not in general_text or "我们的服务器" not in general_text:
            errors.append("docs/general.html missing explicit no-upload privacy wording")
        if (
            READ_COMMAND_MARKER not in general_text
            or NO_SUMMARY_EN_MARKER not in general_text
            or NO_SUMMARY_ZH_MARKER not in general_text
            or IMMEDIATE_START_EN_MARKER not in general_text
            or IMMEDIATE_START_ZH_MARKER not in general_text
        ):
            errors.append("docs/general.html missing execution-first starter command")
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
    if WORK_AGENT_EN_MARKER not in readme_en or "our server" not in readme_en:
        errors.append("README.md missing work-agent compatibility or privacy-upload wording")
    if WORK_AGENT_ZH_MARKER not in readme_zh or "我们的服务器" not in readme_zh:
        errors.append("README.zh-CN.md missing work-agent compatibility or privacy-upload wording")
    if "skill.md" not in readme_en or "https://realroc.github.io/git-hired/skill.md" not in readme_en:
        errors.append("README.md missing skill.md live link")
    if "skill.md" not in readme_zh or "https://realroc.github.io/git-hired/skill.md" not in readme_zh:
        errors.append("README.zh-CN.md missing skill.md live link")
    if "Paste the prompt from this link into your own Claude Code or Codex" in readme_en:
        errors.append("README.md still contains Claude Code/Codex-exclusive candidate wording")
    if "粘贴到你自己的 Claude Code 或 Codex" in readme_zh:
        errors.append("README.zh-CN.md still contains Claude Code/Codex-exclusive candidate wording")

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
            if WORK_AGENT_ZH_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing work-agent compatibility wording")
            if TIME_BUDGET_ZH_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing 1-minute runtime-budget guidance")
            if "把下面整段完整粘贴到 Claude Code 或 Codex 中执行：" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains Claude Code/Codex-exclusive intro wording")
            if ">> MBTI 工作人格 <<" in zh_prompt_text or ">> 如果这份画像像你" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains noisy double-angle TUI markers")
            if "详细报告" not in zh_prompt_text or "HIRED" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing candidate-facing TUI/report output requirements")
            if HIRED_HEADER_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing updated readable HIRED header")
            if "先播放一个简单的 3 帧 `HIRED` 动态开场" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing dependency-free HIRED animation guidance")
            if BLOCK_BAR_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing block-bar score format guidance")
            if SCALE_NOTE_ZH_MARKER in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md should not contain scale-note guidance")
            if STRONG_SCORE_ZH_MARKER in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md should not contain explicit 70-plus score-defense wording")
            if STANDOUT_DIMENSION_ZH_MARKER in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md should not contain hard-rule 90-plus wording")
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
            if "例如 `INTJ`" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains INTJ example anchoring")
            if "逻辑取舍，还是更偏用户 / 人的感受与关系" in zh_prompt_text or "结构、计划、收口，还是更偏探索、试错、临场适配" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains biased legacy MBTI axis wording")
            if (
                MBTI_ANTI_ANCHOR_ZH_MARKER not in zh_prompt_text
                or MBTI_NEUTRAL_TF_ZH_MARKER not in zh_prompt_text
                or MBTI_SOLO_HISTORY_ZH_MARKER not in zh_prompt_text
            ):
                errors.append(f"prompts/{prompt_slug}.md missing MBTI de-bias guidance")
            if "pixel card" in zh_prompt_text or ".svg" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains legacy pixel-card or SVG language")
            if ASCII_CARD_URL_BASE not in zh_prompt_text or ASCII_CARD_ZH_MARKER not in zh_prompt_text or ".txt" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing MBTI ASCII-card guidance")
            if "天赋词缀" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing talent-tag guidance")
            if "待解锁天赋" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing locked-skill guidance")
            if UPLIFT_ZH_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing next-step uplift guidance")
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
            if WORK_AGENT_EN_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing work-agent compatibility wording")
            if TIME_BUDGET_EN_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing 1-minute runtime-budget guidance")
            if "Paste the full prompt below into Claude Code or Codex and run it:" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains Claude Code/Codex-exclusive intro wording")
            if ">> MBTI work personality <<" in en_prompt_text or ">> If this portrait feels right" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains noisy double-angle TUI markers")
            if "Detailed report" not in en_prompt_text or "HIRED" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing candidate-facing TUI/report output requirements")
            if HIRED_HEADER_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing updated readable HIRED header")
            if "Play a simple 3-frame `HIRED` animation" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing dependency-free HIRED animation guidance")
            if BLOCK_BAR_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing block-bar score format guidance")
            if SCALE_NOTE_EN_MARKER in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md should not contain scale-note guidance")
            if STRONG_SCORE_EN_MARKER in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md should not contain explicit 70-plus score-defense wording")
            if STANDOUT_DIMENSION_EN_MARKER in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md should not contain hard-rule 90-plus wording")
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
            if "such as `INTJ`" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains INTJ example anchoring")
            if "tradeoff logic vs people or user-attunement" in en_prompt_text or "structure and closure vs exploration and adaptation" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains biased legacy MBTI axis wording")
            if (
                MBTI_ANTI_ANCHOR_EN_MARKER not in en_prompt_text
                or MBTI_NEUTRAL_TF_EN_MARKER not in en_prompt_text
                or MBTI_SOLO_HISTORY_EN_MARKER not in en_prompt_text
            ):
                errors.append(f"prompts/{prompt_slug}.en.md missing MBTI de-bias guidance")
            if "pixel card" in en_prompt_text or ".svg" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains legacy pixel-card or SVG language")
            if ASCII_CARD_URL_BASE not in en_prompt_text or ASCII_CARD_EN_MARKER not in en_prompt_text or ".txt" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing MBTI ASCII-card guidance")
            if "Talent Tags" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing talent-tag guidance")
            if "Locked Skills" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing locked-skill guidance")
            if UPLIFT_EN_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing next-step uplift guidance")
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
            if WORK_AGENT_EN_MARKER not in page_text or WORK_AGENT_ZH_MARKER not in page_text:
                errors.append(f"docs/{page_slug}.html missing work-agent compatibility wording")
            if TIME_BUDGET_EN_MARKER not in page_text or TIME_BUDGET_ZH_MARKER not in page_text:
                errors.append(f"docs/{page_slug}.html missing synced 1-minute runtime-budget guidance")
            if "Paste the prompt below into your own Claude Code or Codex" in page_text or "复制后直接粘贴到 Claude Code / Codex" in page_text:
                errors.append(f"docs/{page_slug}.html still contains Claude Code/Codex-exclusive candidate wording")
            if ">> MBTI work personality <<" in page_text or ">> MBTI 工作人格 <<" in page_text or ">> If this portrait feels right" in page_text or ">> 如果这份画像像你" in page_text:
                errors.append(f"docs/{page_slug}.html still contains noisy double-angle TUI markers")
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
            if SCALE_NOTE_EN_MARKER in page_text or SCALE_NOTE_ZH_MARKER in page_text:
                errors.append(f"docs/{page_slug}.html should not contain synced scale-note guidance")
            if STRONG_SCORE_EN_MARKER in page_text or STRONG_SCORE_ZH_MARKER in page_text:
                errors.append(f"docs/{page_slug}.html should not contain synced explicit 70-plus score-defense wording")
            if STANDOUT_DIMENSION_EN_MARKER in page_text or STANDOUT_DIMENSION_ZH_MARKER in page_text:
                errors.append(f"docs/{page_slug}.html should not contain synced hard-rule 90-plus wording")
            if OLD_BAR_MARKER in page_text:
                errors.append(f"docs/{page_slug}.html still contains old hash-based score bar examples")
            if "alignment code" in page_text or "阵营编码" in page_text:
                errors.append(f"docs/{page_slug}.html still contains deprecated alignment-code language")
            if MBTI_EN_MARKER not in page_text or MBTI_ZH_MARKER not in page_text:
                errors.append(f"docs/{page_slug}.html missing synced MBTI work-personality guidance")
            if "such as `INTJ`" in page_text or "例如 `INTJ`" in page_text:
                errors.append(f"docs/{page_slug}.html still contains synced INTJ example anchoring")
            if "tradeoff logic vs people or user-attunement" in page_text or "structure and closure vs exploration and adaptation" in page_text:
                errors.append(f"docs/{page_slug}.html still contains synced biased legacy MBTI axis wording")
            if (
                MBTI_ANTI_ANCHOR_EN_MARKER not in page_text
                or MBTI_ANTI_ANCHOR_ZH_MARKER not in page_text
                or MBTI_NEUTRAL_TF_EN_MARKER not in page_text
                or MBTI_NEUTRAL_TF_ZH_MARKER not in page_text
                or MBTI_SOLO_HISTORY_EN_MARKER not in page_text
                or MBTI_SOLO_HISTORY_ZH_MARKER not in page_text
            ):
                errors.append(f"docs/{page_slug}.html missing synced MBTI de-bias guidance")
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
