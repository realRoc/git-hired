#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from pathlib import Path


REQUIRED_HTML_SCRIPT = '<script src="./analytics.js" defer></script>'
POSTHOG_PROJECT_KEY = "phc_JQHakHYG7KOiZUXCqdojoXuAll5QW8DwkdJzk0Qzg0e"
POSTHOG_API_HOST = "https://us.i.posthog.com"
REQUIRED_COMMON_PROPERTIES = (
    "location:",
    "role:",
    "result_type:",
    "question_id:",
    "page_path:",
)
REQUIRED_FUNNEL_EVENTS = (
    "$pageview",
    "click_start",
    "select_role",
    "start_quiz",
    "complete_quiz",
    "view_result",
    "click_share",
)


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "README.md").exists() and (candidate / "roles.json").exists():
            return candidate
    raise SystemExit("Could not locate git-hired repo root.")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


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
        cursor = index


def validate_html_pages(repo_root: Path, errors: list[str]) -> None:
    html_pages = sorted((repo_root / "docs").glob("*.html"))
    if not html_pages:
        errors.append("docs/ should contain public HTML pages")
        return

    for path in html_pages:
        label = f"docs/{path.name}"
        text = read(path)
        assert_contains(label, text, REQUIRED_HTML_SCRIPT, errors)

    index_text = read(repo_root / "docs" / "index.html")
    start_text = read(repo_root / "docs" / "start.html")
    assert_contains("docs/index.html", index_text, 'class="button primary big-cta" href="./start.html"', errors)
    assert_order(
        "docs/start.html",
        start_text,
        ('<script src="./analytics.js" defer></script>', '<script src="./quick-test.js" defer></script>'),
        errors,
    )
    assert_contains("docs/start.html", start_text, 'id="share-result"', errors)


def validate_posthog_config(analytics_text: str, errors: list[str]) -> None:
    label = "docs/analytics.js"
    for marker in (
        f'var POSTHOG_API_KEY = "{POSTHOG_PROJECT_KEY}";',
        f'var POSTHOG_API_HOST = "{POSTHOG_API_HOST}";',
        "window.posthog.init(POSTHOG_API_KEY, {",
        "api_host: POSTHOG_API_HOST",
        'defaults: "2026-01-30"',
        'person_profiles: "identified_only"',
        "capture_pageview: true",
        "autocapture: true",
        "disable_session_recording: true",
        "window.gitHiredAnalytics = {",
    ):
        assert_contains(label, analytics_text, marker, errors)

    for marker in (
        "POSTHOG_API_KEY_HERE",
        "disable_session_recording: false",
        "startSessionRecording(",
    ):
        assert_not_contains(label, analytics_text, marker, errors)
    if re.search(r"(?<!disable_)session_recording\s*:\s*true", analytics_text):
        errors.append(f"{label} enables session recording")


def validate_common_properties(analytics_text: str, errors: list[str]) -> None:
    match = re.search(r"function eventProperties\(properties\) \{(?P<body>[\s\S]*?)\n  \}", analytics_text)
    if not match:
        errors.append("docs/analytics.js missing eventProperties(properties)")
        return

    body = match.group("body")
    for marker in REQUIRED_COMMON_PROPERTIES:
        assert_contains("docs/analytics.js eventProperties", body, marker, errors)


def validate_manual_events(analytics_text: str, quick_test_text: str, errors: list[str]) -> None:
    for event in ("click_start", "select_role"):
        assert_contains("docs/analytics.js", analytics_text, f'track("{event}"', errors)

    for event in ("select_role", "start_quiz", "complete_quiz", "view_result", "click_share"):
        assert_contains("docs/quick-test.js", quick_test_text, f'trackEvent("{event}"', errors)

    for marker in (
        '.home-shell .big-cta[href$=\'start.html\']',
        'location: "home_hero"',
        "target_path:",
        "ROLE_BY_PAGE",
        "ROLE_BY_PROMPT_BASE",
        'location: "role_link"',
        'location: "role_command_copy"',
        'selection_type: "role"',
    ):
        assert_contains("docs/analytics.js", analytics_text, marker, errors)

    for marker in (
        'location: "quick_test_question"',
        "question_id: input.name",
        "question_step:",
        "answer_value:",
        "answer_label_en:",
        "answer_label_zh:",
        "answer_count:",
        'location: "quick_test"',
        "result_type: builderType",
        'location: "quick_result"',
        'role: "builder_type"',
        'selection_type: "builder_type"',
        'location: "result_card"',
        "result_type: resultType(lastResult)",
        'share_target: "clipboard"',
    ):
        assert_contains("docs/quick-test.js", quick_test_text, marker, errors)

    assert_order(
        "docs/quick-test.js result funnel events",
        quick_test_text,
        ('trackEvent("complete_quiz"', 'trackEvent("view_result"', 'trackEvent("click_share"'),
        errors,
    )
    assert_contains("docs/quick-test.js", quick_test_text, 'document.getElementById("share-result")', errors)


def main() -> int:
    repo_root = find_repo_root(Path.cwd())
    analytics_path = repo_root / "docs" / "analytics.js"
    quick_test_path = repo_root / "docs" / "quick-test.js"
    errors: list[str] = []

    if not analytics_path.exists():
        errors.append("docs/analytics.js missing")
        analytics_text = ""
    else:
        analytics_text = read(analytics_path)

    if not quick_test_path.exists():
        errors.append("docs/quick-test.js missing")
        quick_test_text = ""
    else:
        quick_test_text = read(quick_test_path)

    validate_html_pages(repo_root, errors)
    validate_posthog_config(analytics_text, errors)
    validate_common_properties(analytics_text, errors)
    validate_manual_events(analytics_text, quick_test_text, errors)

    if errors:
        print("Analytics contract eval failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Analytics contract eval passed.")
    print("- protected funnel: " + " -> ".join(REQUIRED_FUNNEL_EVENTS))
    print("- HTML pages load analytics.js")
    print("- session recording disabled")
    return 0


if __name__ == "__main__":
    sys.exit(main())
