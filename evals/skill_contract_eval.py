#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT_MARKERS = ("README.md", "roles.json", "skill.md")
GOLDEN_CARD = Path("evals/fixtures/builder-card.golden.txt")
CARD_FOOTER = "git-hired  ·  local-only  ·  candidate-controlled  ·  MIT"
SIGNAL_ROWS = (
    "agency",
    "ai fluency",
    "debug maturity",
    "product sense",
    "taste",
    "trust",
    "communication",
)
CARD_SECTIONS = ("SIGNALS", "STRENGTHS", "GAPS", "NEXT")
FORBIDDEN_OLD_TUI_MARKERS = (
    "Keep the builder profile first. Do not print a secondary MBTI ASCII card before the identity block",
    "Then print a subtitle:",
    "Print `Core Board`",
    "Print `Talent Tags`",
    "Print `Locked Skills`",
    "If this portrait feels right",
    "Right below the `HIRED` banner, print the matching predesigned MBTI ASCII card",
    "终端里在 `HIRED` ASCII 头图下方要优先打印对应的 MBTI ASCII 卡片",
    "保持 builder 画像优先。不要在身份卡之前输出辅助 MBTI ASCII 卡片",
    "然后输出副标题",
    "输出 `Core Board`",
    "输出 `天赋词缀`",
    "输出 `待解锁天赋`",
)


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if all((candidate / marker).exists() for marker in ROOT_MARKERS):
            return candidate
    raise SystemExit("Could not locate git-hired repo root.")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def extract_first_text_fence(markdown: str) -> str:
    match = re.search(r"```text\n(?P<body>.*?)\n```", markdown, flags=re.S)
    if not match:
        raise AssertionError("missing fenced text block")
    return match.group("body")


def assert_contains(label: str, text: str, marker: str, errors: list[str]) -> None:
    if marker not in text:
        errors.append(f"{label} missing marker: {marker}")


def assert_not_contains(label: str, text: str, marker: str, errors: list[str]) -> None:
    if marker in text:
        errors.append(f"{label} contains forbidden marker: {marker}")


def assert_order(label: str, text: str, markers: tuple[str, ...], errors: list[str]) -> None:
    cursor = -1
    for marker in markers:
        index = text.find(marker, cursor + 1)
        if index == -1:
            errors.append(f"{label} missing ordered marker: {marker}")
            return
        if index < cursor:
            errors.append(f"{label} has marker out of order: {marker}")
            return
        cursor = index


def validate_card(label: str, card: str, golden: str, errors: list[str]) -> None:
    if card.strip() != golden.strip():
        errors.append(f"{label} does not match evals/fixtures/builder-card.golden.txt")
    if "MBTI" in card:
        errors.append(f"{label} must not include MBTI")
    if not card.startswith("╔") or not card.rstrip().endswith("╝"):
        errors.append(f"{label} missing outer box frame")
    assert_order(label, card, ("builder card", "evidence:", "SIGNALS", "STRENGTHS", "GAPS", "NEXT", CARD_FOOTER), errors)
    for row in SIGNAL_ROWS:
        if not re.search(rf"║\s+{re.escape(row)}\s+[█░]+", card):
            errors.append(f"{label} missing signal row: {row}")


def validate_prompt_contract(label: str, text: str, golden: str, language: str, errors: list[str]) -> None:
    localized_markers = (
        ("do not add MBTI anywhere in this card", "1/5` to `5/5")
        if language == "en"
        else ("这张卡里不要出现 MBTI", "1/5` 到 `5/5")
    )
    for marker in (
        "builder card",
        CARD_FOOTER,
        *localized_markers,
        "evidence: <low|medium|high>  ·  scope:",
        "Detailed report: ./git-hired-<role>-report-YYYYMMDD-HHMMSS.md",
    ):
        assert_contains(label, text, marker, errors)
    for marker in CARD_SECTIONS:
        assert_contains(label, text, marker, errors)
    for row in SIGNAL_ROWS:
        assert_contains(label, text, row, errors)
    if golden not in text:
        errors.append(f"{label} missing canonical builder-card template")
    for marker in FORBIDDEN_OLD_TUI_MARKERS:
        assert_not_contains(label, text, marker, errors)


def validate_skill_entry(repo_root: Path, errors: list[str]) -> None:
    skill = read(repo_root / "skill.md")
    public_skill = read(repo_root / "docs/skill.md")
    if skill != public_skill:
        errors.append("skill.md and docs/skill.md differ")
    for marker in (
        "Execute, do not summarize",
        "What target role are you aiming for right now?",
        "history-only",
        "start evidence collection and analysis automatically",
        "A terminal-facing `HIRED` builder card",
        "do not include MBTI in the public builder card",
        CARD_FOOTER,
    ):
        assert_contains("skill.md", skill, marker, errors)
    for marker in FORBIDDEN_OLD_TUI_MARKERS:
        assert_not_contains("skill.md", skill, marker, errors)


def main() -> int:
    repo_root = find_repo_root(Path.cwd())
    errors: list[str] = []
    golden = read(repo_root / GOLDEN_CARD).strip()

    example_text = read(repo_root / "examples/builder-card.md")
    validate_card("examples/builder-card.md", extract_first_text_fence(example_text), golden, errors)

    validate_skill_entry(repo_root, errors)

    roles = json.loads(read(repo_root / "roles.json"))
    for role in roles:
        prompt_slug = role["prompt_slug"]
        validate_prompt_contract(f"prompts/{prompt_slug}.en.md", read(repo_root / "prompts" / f"{prompt_slug}.en.md"), golden, "en", errors)
        validate_prompt_contract(f"prompts/{prompt_slug}.md", read(repo_root / "prompts" / f"{prompt_slug}.md"), golden, "zh", errors)

    for page in ("README.md", "README.zh-CN.md", "docs/index.html"):
        text = read(repo_root / page)
        assert_contains(page, text, "examples/builder-card.md", errors)

    if errors:
        print("Skill contract eval failed:\n")
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print("Skill contract eval passed.")
    print(f"- role prompt pairs checked: {len(roles)}")
    print("- builder card contract: locked")
    return 0


if __name__ == "__main__":
    sys.exit(main())
