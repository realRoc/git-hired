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
BUILDER_EN_MARKER = "AI-native builder profile"
BUILDER_ZH_MARKER = "AI-native builder 画像"
TIME_BUDGET_EN_MARKER = "within about 1 minute"
TIME_BUDGET_ZH_MARKER = "1 分钟内"
UPLIFT_EN_MARKER = "Expected uplift"
UPLIFT_ZH_MARKER = "提升预估"
BUILDER_CARD_MARKER = "builder card"
BUILDER_CARD_FOOTER = "git-hired  ·  local-only  ·  candidate-controlled  ·  MIT"
BUILDER_CARD_SIGNALS = (
    "agency",
    "ai fluency",
    "debug maturity",
    "product sense",
    "taste",
    "trust",
    "communication",
)
WORK_AGENT_EN_MARKER = "work agent"
WORK_AGENT_ZH_MARKER = "工作 agent"
READ_COMMAND_MARKER = "read https://realroc.github.io/git-hired/skill.md"
NO_SUMMARY_EN_MARKER = "Do not summarize it."
NO_SUMMARY_ZH_MARKER = "不要总结"
IMMEDIATE_START_EN_MARKER = "Ask the first test question immediately"
IMMEDIATE_START_ZH_MARKER = "直接用我的语言开始第一问"
AUTO_EVAL_EN_MARKER = "run the evaluation automatically from allowed history or approved files"
AUTO_EVAL_ZH_MARKER = "基于允许范围自动完成评估"
NO_INTERVIEW_EN_MARKER = "Do not turn it into a manual interview."
NO_INTERVIEW_ZH_MARKER = "不要转成面试式问答"
PROMPT_AUTO_EN_MARKER = "Do not replace denied repo / file access with a manual interview"
PROMPT_AUTO_ZH_MARKER = "不要因为候选人拒绝 repo / 文件扫描，就继续追问"
MIN_PERMISSION_EN_MARKER = "ask only one permission question"
MIN_PERMISSION_ZH_MARKER = "只问 1 个权限问题"
FOOTER_REQUIRED_MARKERS = (
    "MIT 开源",
    "git hired",
    "git rejected",
    "$ whoami",
    "realRoc",
    "github.com/realRoc/git-hired",
)
FOOTER_404_REQUIRED_MARKERS = (
    "MIT licensed",
    "git hired",
    "git rejected",
    "your call",
    "$ whoami",
    "author:",
    "repo:",
    "realRoc",
    "github.com/realRoc/git-hired",
)
FOOTER_FORBIDDEN_MARKERS = (
    "Source prompts",
    "源 prompt",
    "built by",
)
RUNTIME_AWARE_EN_MARKER = "rich-text / chat / mobile-preview surface such as Notion AI"
RUNTIME_AWARE_ZH_MARKER = "Notion AI、聊天气泡、移动端预览这类富文本界面"
RUNTIME_FALLBACK_EN_MARKER = "skip wide ASCII layouts and box-drawing cards"
RUNTIME_FALLBACK_ZH_MARKER = "跳过依赖严格等宽字体的宽 ASCII 布局和 box-drawing 卡片"
SCALE_NOTE_EN_MARKER = "Scale note"
SCALE_NOTE_ZH_MARKER = "刻度说明"
STRONG_SCORE_EN_MARKER = "70+ is already clearly strong here"
STRONG_SCORE_ZH_MARKER = "70+ 在这套体系里已经是明显强"
STANDOUT_DIMENSION_EN_MARKER = "should usually cross `90+`"
STANDOUT_DIMENSION_ZH_MARKER = "通常应该出现 `90+`"
FORBIDDEN_PERSONALITY_MARKERS = (
    "MBTI",
    "mbti",
    "INTJ",
    "INTP",
    "ENTJ",
    "ENTP",
    "INFJ",
    "INFP",
    "ENFJ",
    "ENFP",
    "ISTJ",
    "ISFJ",
    "ESTJ",
    "ESFJ",
    "ISTP",
    "ISFP",
    "ESTP",
    "ESFP",
    "`E / I`",
    "`S / N`",
    "`T / F`",
    "`J / P`",
    "`E/I`",
    "`S/N`",
    "`T/F`",
    "`J/P`",
    "data-mbti",
)
QUICK_TEST_SIGNAL_KEYS = ("build", "sell")


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


def validate_public_footer(label: str, text: str, errors: list[str]) -> None:
    if '<footer class="footer' not in text:
        errors.append(f"{label} missing unified public footer")
    required_markers = FOOTER_404_REQUIRED_MARKERS if label == "docs/404.html" else FOOTER_REQUIRED_MARKERS
    for marker in required_markers:
        if marker not in text:
            errors.append(f"{label} footer missing required marker: {marker}")
    for marker in FOOTER_FORBIDDEN_MARKERS:
        if marker in text:
            errors.append(f"{label} should not show legacy footer wording: {marker}")
    if "author-line" in text:
        errors.append(f"{label} should use the unified footer instead of author-line")
    footer_blocks = re.findall(r"<footer[\s\S]*?</footer>", text)
    if any("prompts/" in block for block in footer_blocks):
        errors.append(f"{label} footer should not show source prompt filenames")


def validate_footer_css(style_text: str, errors: list[str]) -> None:
    footer_match = re.search(r"\.footer\s*\{(?P<body>.*?)\}", style_text, flags=re.S)
    if not footer_match:
        errors.append("docs/style.css missing .footer style block")
        return
    footer_body = footer_match.group("body")
    if "text-align: center;" not in footer_body:
        errors.append("docs/style.css .footer should center footer text")
    if "justify-items: center;" not in footer_body:
        errors.append("docs/style.css .footer should center footer grid items")
    footer_line_match = re.search(r"\.footer-line\s*\{(?P<body>.*?)\}", style_text, flags=re.S)
    if not footer_line_match or "text-align: center;" not in footer_line_match.group("body"):
        errors.append("docs/style.css .footer-line should center each footer line")


def validate_no_personality_layer(label: str, text: str, errors: list[str]) -> None:
    for marker in FORBIDDEN_PERSONALITY_MARKERS:
        if marker in text:
            errors.append(f"{label} should not contain personality-test marker: {marker}")


def validate_market_level_questions(js_text: str, errors: list[str]) -> None:
    if "const TRACKS" not in js_text or "const MATURITY_OPTIONS" not in js_text:
        errors.append("docs/quick-test.js missing track-based market level question source")
        return

    for marker in (
        "Have you used AI to complete a clearly defined work task?",
        "Have you used AI to improve communication, writing, pitch, or content?",
        "GH-L3",
        "GH-L4",
        "GH-L5",
        "GH-L6",
        "GH-L7",
        "AI Task Executor",
        "Independent Workflow Builder",
        "Senior Product Shipper",
        "AI-assisted Communicator",
        "Independent Narrative Builder",
        "Senior Distribution Operator",
    ):
        if marker not in js_text:
            errors.append(f"docs/quick-test.js missing market level marker: {marker}")
    builder_questions = len(re.findall(r'key:\s*"[^"]+",\n\s+signal:\s*\{ en: "[^"]+", zh: "[^"]+" \},\n\s+title:\s*\{', js_text.split("seller:", 1)[0]))
    seller_questions = len(re.findall(r'key:\s*"[^"]+",\n\s+signal:\s*\{ en: "[^"]+", zh: "[^"]+" \},\n\s+title:\s*\{', js_text.split("seller:", 1)[1] if "seller:" in js_text else ""))
    if builder_questions < 10 or seller_questions < 10:
        errors.append("docs/quick-test.js should define 10 Builder questions and 10 Seller questions")


def main() -> None:
    repo_root = find_repo_root(Path.cwd())
    roles = json.loads((repo_root / "roles.json").read_text(encoding="utf-8"))
    skill_source = repo_root / "skill.md"
    skill_public = repo_root / "docs" / "skill.md"
    quick_start = repo_root / "docs" / "start.html"
    quick_start_js = repo_root / "docs" / "quick-test.js"
    quick_start_qr = repo_root / "docs" / "assets" / "quick-test-qr.svg"
    candidate_page = repo_root / "docs" / "candidate.html"
    evaluator_page = repo_root / "docs" / "evaluator.html"
    contributor_page = repo_root / "docs" / "contributor.html"
    not_found_page = repo_root / "docs" / "404.html"
    rubric_path = repo_root / "rubric.md"
    examples_dir = repo_root / "examples"
    index_text = (repo_root / "docs" / "index.html").read_text(encoding="utf-8")
    style_text = (repo_root / "docs" / "style.css").read_text(encoding="utf-8")
    readme_en = (repo_root / "README.md").read_text(encoding="utf-8")
    readme_zh = (repo_root / "README.zh-CN.md").read_text(encoding="utf-8")

    errors: list[str] = []
    warnings: list[str] = []
    skill_source_text = skill_source.read_text(encoding="utf-8") if skill_source.exists() else ""
    validate_no_personality_layer("README.md", readme_en, errors)
    validate_no_personality_layer("README.zh-CN.md", readme_zh, errors)
    validate_no_personality_layer("docs/index.html", index_text, errors)
    new_role_template = repo_root / ".codex" / "skills" / "git-hired-jd-ops" / "scripts" / "new_role.py"
    if new_role_template.exists():
        validate_no_personality_layer(".codex/skills/git-hired-jd-ops/scripts/new_role.py", new_role_template.read_text(encoding="utf-8"), errors)

    if "git-hired-lang" not in index_text:
        errors.append("docs/index.html missing language bootstrap script")
    if "Know your AI-native market value" not in index_text or "了解你的 AI-native 市场价值" not in index_text:
        errors.append("docs/index.html missing market value first-screen hook copy")
    if "Choose your track — Builder or Seller" not in index_text:
        errors.append("docs/index.html missing market assessment subtitle")
    if "Assess Builder Level" not in index_text or "Assess Seller Level" not in index_text:
        errors.append("docs/index.html missing Builder/Seller level CTAs")
    if "./start.html?track=builder" not in index_text or "./start.html?track=seller" not in index_text:
        errors.append("docs/index.html missing track-specific assessment links")
    for forbidden in (
        "Simple mode",
        "Deep mode",
        "For Candidates",
        "For Evaluators",
        "For Contributors",
        "pick a role",
        "choose a protocol",
        "quick-test-fallback",
        "quick-test-qr.svg",
        "Copy Command",
        READ_COMMAND_MARKER,
    ):
        if forbidden in index_text:
            errors.append(f"docs/index.html should not expose first-path split or advanced command: {forbidden}")
    for marker in ("./growth.html", "./agent.html", "./pm.html", "./ops.html", "./candidate.html", "./evaluator.html", "./contributor.html"):
        if marker in index_text:
            errors.append(f"docs/index.html should not expose role/audience entry on the homepage: {marker}")
    if "AUTO:role-cards" in index_text:
        errors.append("docs/index.html should not keep generated role-card markers on the single-entry homepage")
    if "Open skill.md" in index_text or "打开 skill.md" in index_text:
        errors.append("docs/index.html should not expose raw skill.md as a homepage action")
    if "./general.html" in index_text:
        errors.append("docs/index.html should not link to redundant ./general.html guide page")
    if "See whether a candidate" in index_text or "看候选人是否" in index_text:
        errors.append("docs/index.html still contains recruiter-facing JD summary wording")
    if "Choose Track" not in index_text or "Assess Level" not in index_text or "Market Read" not in index_text or "Upgrade Plan" not in index_text:
        errors.append("docs/index.html missing market-level product path")
    if "<span class=\"hash\">define</span>" in index_text or "challenge-preview" in index_text:
        errors.append("docs/index.html should not include define or homepage challenge sections")
    if "Builder and Seller are tracks" not in index_text and "Builder 和 Seller 是你先选择的能力赛道" not in index_text:
        errors.append("docs/index.html should explain Builder/Seller as tracks, not result personas")
    validate_public_footer("docs/index.html", index_text, errors)
    validate_footer_css(style_text, errors)

    audience_pages = {
        "docs/candidate.html": (candidate_page, "Raise Your Market Signals", "提高你的市场信号"),
        "docs/evaluator.html": (evaluator_page, "Evaluator Protocol", "评估者协议"),
        "docs/contributor.html": (contributor_page, "Contributor Protocol", "贡献者协议"),
    }
    for label, (path, marker_en, marker_zh) in audience_pages.items():
        if not path.exists():
            errors.append(f"{label} missing")
            continue
        page_text = path.read_text(encoding="utf-8")
        validate_public_footer(label, page_text, errors)
        if marker_en not in page_text or marker_zh not in page_text:
            errors.append(f"{label} missing bilingual protocol identity")
        if "git-hired-lang" not in page_text:
            errors.append(f"{label} missing language bootstrap script")
        if "./index.html" not in page_text:
            errors.append(f"{label} missing back-home link")
    if candidate_page.exists():
        candidate_text = candidate_page.read_text(encoding="utf-8")
        if READ_COMMAND_MARKER not in candidate_text or "history-only" not in candidate_text or "our server" not in candidate_text or "我们的服务器" not in candidate_text:
            errors.append("docs/candidate.html missing quick-start or privacy boundary")
    if evaluator_page.exists():
        evaluator_text = evaluator_page.read_text(encoding="utf-8")
        if "evidence confidence" not in evaluator_text or "rubric.md" not in evaluator_text:
            errors.append("docs/evaluator.html missing evaluator protocol rubric linkage")
    if contributor_page.exists():
        contributor_text = contributor_page.read_text(encoding="utf-8")
        if "Good First Improvements" not in contributor_text or "role prompt" not in contributor_text:
            errors.append("docs/contributor.html missing contributor improvement guidance")

    if not quick_start.exists():
        errors.append("docs/start.html missing mobile human quick-test page")
    else:
        quick_start_text = quick_start.read_text(encoding="utf-8")
        validate_no_personality_layer("docs/start.html", quick_start_text, errors)
        if "start-hero" in quick_start_text or "class=\"hero" in quick_start_text:
            errors.append("docs/start.html should not render a hero section above the single-choice test")
        if "Answer 10 quick questions" in quick_start_text or "回答 10 道简短问题" in quick_start_text:
            errors.append("docs/start.html should not show a pre-test hero explainer before the questions")
        if "Builder Quick Test" in quick_start_text or "Builder 快速测试" in quick_start_text:
            errors.append("docs/start.html should not expose quick/deep mode wording before the test")
        if "No local repo" in quick_start_text or "不扫描本地 repo" in quick_start_text:
            errors.append("docs/start.html should not explain privacy scope before the lightweight test")
        quiz_topbar_index = quick_start_text.find("quiz-topbar")
        form_index = quick_start_text.find('id="quick-test-form"')
        result_index = quick_start_text.find('id="quick-result"')
        result_topbar_index = quick_start_text.find("result-topbar")
        result_card_index = quick_start_text.find('id="result-card"')
        progress_index = quick_start_text.find("quick-progress")
        if form_index == -1 or progress_index == -1:
            errors.append("docs/start.html should start the test with the form and progress")
        if quiz_topbar_index == -1:
            errors.append("docs/start.html should combine the quiz topbar and progress into one status bar")
        if quiz_topbar_index != -1 and progress_index != -1 and form_index != -1 and not (quiz_topbar_index < progress_index < form_index):
            errors.append("docs/start.html should keep quick progress inside the quiz topbar before the question form")
        if result_index != -1 and form_index != -1 and result_index < form_index:
            errors.append("docs/start.html should render the question form before the result card")
        if result_topbar_index == -1:
            errors.append("docs/start.html should render the final topbar outside the result card")
        if result_index != -1 and result_topbar_index != -1 and result_card_index != -1 and not (result_index < result_topbar_index < result_card_index):
            errors.append("docs/start.html should place the final topbar before and outside result-card")
        if result_topbar_index != -1 and result_card_index != -1:
            result_topbar_text = quick_start_text[result_topbar_index:result_card_index]
            if 'data-lang-button="en"' not in result_topbar_text or 'data-lang-button="zh"' not in result_topbar_text:
                errors.append("docs/start.html final topbar should keep the EN/中文 language switch")
        if "Questions are rendered from TRACKS in quick-test.js." not in quick_start_text:
            errors.append("docs/start.html should delegate quick-test questions to quick-test.js")
        if 'name="target"' in quick_start_text or "Target Direction" in quick_start_text or "目标方向" in quick_start_text:
            errors.append("docs/start.html should not ask for the candidate's target role/direction")
        if "<textarea" in quick_start_text or "evidenceNote" in quick_start_text:
            errors.append("docs/start.html quick test should be single-choice only with no free-form fields")
        if re.search(r'value="[EISNTFJP]2?"', quick_start_text):
            errors.append("docs/start.html should not keep legacy letter-code answer values")
        if "share-result" not in quick_start_text or "分享" not in quick_start_text:
            errors.append("docs/start.html quick result should expose the share-image action")
        if "quick-progress" not in quick_start_text or "quick-nav" not in quick_start_text:
            errors.append("docs/start.html missing step-by-step mobile quick-test shell")
        if "quick-home-link" not in quick_start_text or "Back Home" not in quick_start_text or "返回首页" not in quick_start_text:
            errors.append("docs/start.html question nav should include a back-home action")
        if "Previous" not in quick_start_text or "上一题" not in quick_start_text:
            errors.append("docs/start.html question nav should label the back action as previous question")
        if "Tap one answer to continue." in quick_start_text or "点选一个答案后自动继续。" in quick_start_text:
            errors.append("docs/start.html question nav should not show the old auto-continue hint")
        if "Run Deep Test On GitHub" in quick_start_text:
            errors.append("docs/start.html should use the terminal-style GitHub CTA copy")
        required_result_html = [
            "result-card",
            "result-topbar",
            "RESULT READY",
            "结果已生成",
            "result-next",
            "share-result",
            "challenge-entry",
            "mode-challenge-link",
            "hiring-signal",
            "advanced-report",
            "copy-agent-prompt",
            "result-home-link",
            "Want stronger market evidence?",
            "想要更强的市场证据？",
            "No private work required.",
            "Use public links only.",
            "You decide what to share.",
            "不需要私人作品。",
            "只使用公开链接。",
            "你决定分享什么。",
        ]
        for marker in required_result_html:
            if marker not in quick_start_text:
                errors.append(f"docs/start.html missing quick-result UI marker: {marker}")
        for forbidden in ("result-head", "copy-result", "copy-report", "go to GitHub for deep test", "去 GitHub 做深度测试"):
            if forbidden in quick_start_text:
                errors.append(f"docs/start.html should not keep old quick-result UI marker: {forbidden}")
        if "./index.html" not in quick_start_text:
            errors.append("docs/start.html missing home link")
        validate_public_footer("docs/start.html", quick_start_text, errors)
    if not not_found_page.exists():
        errors.append("docs/404.html missing")
    else:
        validate_public_footer("docs/404.html", not_found_page.read_text(encoding="utf-8"), errors)
    if not quick_start_js.exists():
        errors.append("docs/quick-test.js missing quick-test behavior")
    else:
        quick_start_js_text = quick_start_js.read_text(encoding="utf-8")
        validate_no_personality_layer("docs/quick-test.js", quick_start_js_text, errors)
        if "TRACKS" not in quick_start_js_text or "MATURITY_OPTIONS" not in quick_start_js_text or "scoreQuickTest" not in quick_start_js_text:
            errors.append("docs/quick-test.js missing track-based market level logic")
        required_tracks = ("Builder Track", "Seller Track", "Builder 赛道", "Seller 赛道")
        for marker in required_tracks:
            if marker not in quick_start_js_text:
                errors.append(f"docs/quick-test.js missing market assessment track: {marker}")
        forbidden_builder_types = (
            "Prototype Hacker",
            "Agent Orchestrator",
            "Growth Experimenter",
            "Taste-driven Designer",
            "Debugging Detective",
            "Operator Builder",
            "Product type",
            "Engineer type",
            "Growth type",
            "Operator type",
            "产品型",
            "工程型",
            "增长型",
            "运营型",
        )
        for marker in forbidden_builder_types:
            if marker in quick_start_js_text:
                errors.append(f"docs/quick-test.js should not keep old role-like builder type: {marker}")
        if READ_COMMAND_MARKER not in quick_start_js_text:
            errors.append("docs/quick-test.js missing copied advanced agent prompt")
        if '"builder", "seller"' not in quick_start_js_text:
            errors.append("docs/quick-test.js missing builder/seller track keys")
        for marker in ("Your Level", "What this level means", "Market Read", "Missing Signals", "Next Level", "Upgrade Plan", "Recommended Next Step"):
            if marker not in quick_start_js_text:
                errors.append(f"docs/quick-test.js missing market-level result-card section: {marker}")
        required_result_js = [
            "renderResultCard",
            "builder-card-ascii",
            "builder-card-type",
            "builder-card-section",
            "renderShareImage",
            "copyShareImage",
            "ClipboardItem",
            "copyText",
            "share",
            "market-level.card",
            "Copy agent prompt",
        ]
        for marker in required_result_js:
            if marker not in quick_start_js_text:
                errors.append(f"docs/quick-test.js missing structured quick-result marker: {marker}")
        for forbidden in ("renderResultTopbar", "builder-card-topbar"):
            if forbidden in quick_start_js_text:
                errors.append(f"docs/quick-test.js should not render the final topbar inside result-card: {forbidden}")
        if "resultCard.textContent" in quick_start_js_text:
            errors.append("docs/quick-test.js should render structured result DOM instead of raw text")
        if "target role" in quick_start_js_text or "targetRole" in quick_start_js_text or "role fit" in quick_start_js_text:
            errors.append("docs/quick-test.js should not route the mobile quick test by target role")
        if "navigator.share" in quick_start_js_text:
            errors.append("docs/quick-test.js should copy an image to clipboard instead of using navigator.share")
        validate_market_level_questions(quick_start_js_text, errors)
    if not quick_start_qr.exists():
        errors.append("docs/assets/quick-test-qr.svg missing quick-test QR asset")

    if not skill_source.exists():
        errors.append("skill.md missing root entry spec")
    if not skill_public.exists():
        errors.append("docs/skill.md missing deployed entry spec")
    if skill_source.exists() and skill_public.exists():
        skill_public_text = skill_public.read_text(encoding="utf-8")
        validate_no_personality_layer("skill.md", skill_source_text, errors)
        validate_no_personality_layer("docs/skill.md", skill_public_text, errors)
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
        if BUILDER_CARD_MARKER not in skill_source_text or BUILDER_CARD_FOOTER not in skill_source_text:
            errors.append("skill.md missing public builder-card output shape")
        if "Do not replace `history-only` with a self-report questionnaire" not in skill_source_text:
            errors.append("skill.md missing no-self-report replacement rule")
        if "start evidence collection and analysis automatically" not in skill_source_text or "Do not replace `history-only` with a self-report questionnaire" not in skill_source_text:
            errors.append("skill.md missing auto-analysis no-interview rule")
        if "Notion-like surface" not in skill_source_text:
            errors.append("skill.md missing runtime-aware fallback guidance")
        if "Agent Engineer" not in skill_source_text or "Product Manager" not in skill_source_text or "Global Growth" not in skill_source_text or "Product Operations" not in skill_source_text:
            errors.append("skill.md missing supported role registry")
        if "wuyupeng@floatmiracle.com" not in skill_source_text:
            errors.append("skill.md missing strong-candidate resume instruction")
        if "<!-- AUTO:role-prompts:start -->" not in skill_source_text or "<!-- AUTO:role-prompts:end -->" not in skill_source_text:
            errors.append("skill.md missing generated role-prompt appendix markers")
        if "Canonical role prompt appendix" not in skill_source_text:
            errors.append("skill.md missing bundled canonical role prompt appendix")
        if "Prompt blocks:" in skill_source_text:
            errors.append("skill.md should not route public agents through role-page prompt blocks")
        if "role pages are intentionally compact" not in skill_source_text:
            errors.append("skill.md missing compact-role-page public fetch guidance")

    if (repo_root / "docs" / "general.html").exists():
        errors.append("docs/general.html should be removed after shared-entry simplification")

    if not rubric_path.exists():
        errors.append("rubric.md missing public evaluator standard")
    else:
        rubric_text = rubric_path.read_text(encoding="utf-8")
        for marker in ("Agency", "AI Fluency", "Product Sense", "Debugging Maturity", "Trust", "Communication"):
            if marker not in rubric_text:
                errors.append(f"rubric.md missing rubric dimension: {marker}")
    expected_examples = (
        "builder-card.md",
        "agent-engineer.strong.md",
        "agent-engineer.medium.md",
        "agent-engineer.weak.md",
        "pm.strong.md",
        "growth.strong.md",
        "redacted-report-template.md",
    )
    if not examples_dir.exists():
        errors.append("examples/ missing sample report directory")
    else:
        for filename in expected_examples:
            path = examples_dir / filename
            if not path.exists():
                errors.append(f"examples/ missing {filename}")
            else:
                example_text = path.read_text(encoding="utf-8")
                validate_no_personality_layer(f"examples/{filename}", example_text, errors)
                if filename != "redacted-report-template.md" and "fictional" not in example_text.lower():
                    errors.append(f"examples/{filename} should be clearly marked fictional")
                if filename == "builder-card.md":
                    if BUILDER_CARD_FOOTER not in example_text or "SIGNALS" not in example_text or "STRENGTHS" not in example_text or "GAPS" not in example_text:
                        errors.append("examples/builder-card.md missing canonical builder-card sections")

    if "## Live Links" in readme_en or "AUTO:live-links" in readme_en:
        errors.append("README.md should use a top website entry instead of generated live-links")
    if "## 在线链接" in readme_zh or "AUTO:live-links" in readme_zh:
        errors.append("README.zh-CN.md should use a top website entry instead of generated live-links")
    if not readme_en.startswith("# git-hired") or not readme_zh.startswith("# git-hired"):
        errors.append("README files should start with the simple git-hired H1")
    if "██████" in readme_en or "██████" in readme_zh:
        errors.append("README files should not start with ASCII art in the simple-test first screen")
    if "What This Repo Includes" in readme_en or "Why This Exists" in readme_en:
        errors.append("README.md should not keep generic inventory / why sections")
    if "仓库包含什么" in readme_zh or "为什么要做这个" in readme_zh:
        errors.append("README.zh-CN.md should not keep generic inventory / why sections")
    if WORK_AGENT_EN_MARKER not in readme_en or "our server" not in readme_en:
        errors.append("README.md missing work-agent compatibility or privacy-upload wording")
    if WORK_AGENT_ZH_MARKER not in readme_zh or "我们的服务器" not in readme_zh:
        errors.append("README.zh-CN.md missing work-agent compatibility or privacy-upload wording")
    if "Know your AI-native market value" not in readme_en or "了解你的 AI-native 市场价值" not in readme_zh:
        errors.append("README missing market value hook")
    if "Big-Tech-leveling-inspired market assessment" not in readme_en or "受大厂职级逻辑启发的市场等级评估" not in readme_zh:
        errors.append("README missing market-level positioning statement")
    if "Choose Track -> Assess Level -> Market Read -> Upgrade Plan" not in readme_en or "Choose Track -> Assess Level -> Market Read -> Upgrade Plan" not in readme_zh:
        errors.append("README missing market-level product path")
    if "Website:" not in readme_en or "https://realroc.github.io/git-hired/" not in readme_en:
        errors.append("README.md missing top website entry")
    if "项目网站" not in readme_zh or "https://realroc.github.io/git-hired/" not in readme_zh:
        errors.append("README.zh-CN.md missing top website entry")
    for marker in ("candidate.html", "evaluator.html", "contributor.html", "rubric.md", "examples/"):
        if marker not in readme_en:
            errors.append(f"README.md missing protocol/funnel marker: {marker}")
    for marker in ("candidate.html", "evaluator.html", "contributor.html", "rubric.md", "examples/"):
        if marker not in readme_zh:
            errors.append(f"README.zh-CN.md missing protocol/funnel marker: {marker}")
    if "examples/builder-card.md" not in readme_en:
        errors.append("README.md missing final builder-card example link")
    if "examples/builder-card.md" not in readme_zh:
        errors.append("README.zh-CN.md missing final builder-card example link")
    if "AI-Native Collaboration" not in readme_en or "AI-native 协作" not in readme_zh:
        errors.append("README missing collaborator funnel section")
    if "skill.md" not in readme_en or "https://realroc.github.io/git-hired/skill.md" not in readme_en:
        errors.append("README.md missing skill.md live link")
    if "skill.md" not in readme_zh or "https://realroc.github.io/git-hired/skill.md" not in readme_zh:
        errors.append("README.zh-CN.md missing skill.md live link")
    if "https://realroc.github.io/git-hired/start.html?track=builder" not in readme_en or "https://realroc.github.io/git-hired/start.html?track=seller" not in readme_en:
        errors.append("README.md missing track assessment entries")
    if "https://realroc.github.io/git-hired/start.html?track=builder" not in readme_zh or "https://realroc.github.io/git-hired/start.html?track=seller" not in readme_zh:
        errors.append("README.zh-CN.md missing track assessment entries")
    if "Paste the prompt from this link into your own Claude Code or Codex" in readme_en:
        errors.append("README.md still contains Claude Code/Codex-exclusive candidate wording")
    if "粘贴到你自己的 Claude Code 或 Codex" in readme_zh:
        errors.append("README.zh-CN.md still contains Claude Code/Codex-exclusive candidate wording")
    if READ_COMMAND_MARKER not in readme_en or READ_COMMAND_MARKER not in readme_zh:
        errors.append("README missing deeper agent skill.md command")

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
            validate_no_personality_layer(f"prompts/{prompt_slug}.md", zh_prompt_text, errors)
            if "history-only" not in zh_prompt_text or "上传到我们的服务器" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing consent-first local-only notice")
            if MIN_PERMISSION_ZH_MARKER not in zh_prompt_text or PROMPT_AUTO_ZH_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing auto-analysis no-interview consent flow")
            if RUNTIME_AWARE_ZH_MARKER not in zh_prompt_text or RUNTIME_FALLBACK_ZH_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing Notion/rich-text runtime fallback guidance")
            if WORK_AGENT_ZH_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing work-agent compatibility wording")
            if TIME_BUDGET_ZH_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing 1-minute runtime-budget guidance")
            if "把下面整段完整粘贴到 Claude Code 或 Codex 中执行：" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains Claude Code/Codex-exclusive intro wording")
            if ">> 如果这份画像像你" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains noisy double-angle TUI markers")
            if "详细报告" not in zh_prompt_text or "HIRED" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing candidate-facing TUI/report output requirements")
            if HIRED_HEADER_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing updated readable HIRED header")
            if "3 帧 `HIRED` 动态开场" not in zh_prompt_text:
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
            if BUILDER_ZH_MARKER not in zh_prompt_text or "builder 类型" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing builder-profile guidance")
            if "pixel card" in zh_prompt_text or ".svg" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains legacy pixel-card or SVG language")
            if BUILDER_CARD_MARKER not in zh_prompt_text or BUILDER_CARD_FOOTER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing canonical builder-card guidance")
            for marker in (*BUILDER_CARD_SIGNALS, "STRENGTHS", "GAPS", "NEXT"):
                if marker not in zh_prompt_text:
                    errors.append(f"prompts/{prompt_slug}.md missing builder-card marker: {marker}")
            if "天赋词缀" not in zh_prompt_text and "talent tags" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing talent-tag guidance")
            if "待解锁天赋" not in zh_prompt_text and "locked skills" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing locked-skill guidance")
            if UPLIFT_ZH_MARKER not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing next-step uplift guidance")
            if "岗位 Prompt 版本" not in zh_prompt_text or "JD prompt version" not in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md missing prompt-version guidance")
            if "Signal Board" in zh_prompt_text or "你已经很亮眼的地方" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains legacy output sections")
            if "## G. 面试建议" in zh_prompt_text:
                errors.append(f"prompts/{prompt_slug}.md still contains interviewer-facing interview section")
            zh_prompt_version = extract_zh_prompt_version(zh_prompt_text)
            if not zh_prompt_version:
                errors.append(f"prompts/{prompt_slug}.md missing exact prompt version string")
            elif not zh_prompt_version.startswith(f"{prompt_slug}@"):
                errors.append(f"prompts/{prompt_slug}.md prompt version should start with {prompt_slug}@")
            if zh_prompt_version and zh_prompt_version not in skill_source_text:
                errors.append(f"skill.md missing bundled Chinese prompt version {zh_prompt_version}")
        if en_prompt.exists():
            en_prompt_text = en_prompt.read_text(encoding="utf-8")
            validate_no_personality_layer(f"prompts/{prompt_slug}.en.md", en_prompt_text, errors)
            if "history-only" not in en_prompt_text or "our server" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing consent-first local-only notice")
            if MIN_PERMISSION_EN_MARKER not in en_prompt_text or PROMPT_AUTO_EN_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing auto-analysis no-interview consent flow")
            if RUNTIME_AWARE_EN_MARKER not in en_prompt_text or RUNTIME_FALLBACK_EN_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing Notion/rich-text runtime fallback guidance")
            if WORK_AGENT_EN_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing work-agent compatibility wording")
            if TIME_BUDGET_EN_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing 1-minute runtime-budget guidance")
            if "Paste the full prompt below into Claude Code or Codex and run it:" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains Claude Code/Codex-exclusive intro wording")
            if ">> If this portrait feels right" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains noisy double-angle TUI markers")
            if "Detailed report" not in en_prompt_text or "HIRED" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing candidate-facing TUI/report output requirements")
            if HIRED_HEADER_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing updated readable HIRED header")
            if "3-frame `HIRED` animation" not in en_prompt_text:
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
            if BUILDER_EN_MARKER not in en_prompt_text or "builder type" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing builder-profile guidance")
            if "pixel card" in en_prompt_text or ".svg" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains legacy pixel-card or SVG language")
            if BUILDER_CARD_MARKER not in en_prompt_text or BUILDER_CARD_FOOTER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing canonical builder-card guidance")
            for marker in (*BUILDER_CARD_SIGNALS, "STRENGTHS", "GAPS", "NEXT"):
                if marker not in en_prompt_text:
                    errors.append(f"prompts/{prompt_slug}.en.md missing builder-card marker: {marker}")
            if "Talent Tags" not in en_prompt_text and "talent tags" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing talent-tag guidance")
            if "Locked Skills" not in en_prompt_text and "locked skills" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing locked-skill guidance")
            if UPLIFT_EN_MARKER not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing next-step uplift guidance")
            if "JD prompt version" not in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md missing prompt-version guidance")
            if "Signal Board" in en_prompt_text or "What already stands out" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains legacy output sections")
            if "Interview Follow-ups" in en_prompt_text:
                errors.append(f"prompts/{prompt_slug}.en.md still contains interviewer-facing interview section")
            en_prompt_version = extract_en_prompt_version(en_prompt_text)
            if not en_prompt_version:
                errors.append(f"prompts/{prompt_slug}.en.md missing exact prompt version string")
            elif not en_prompt_version.startswith(f"{prompt_slug}@"):
                errors.append(f"prompts/{prompt_slug}.en.md prompt version should start with {prompt_slug}@")
            if en_prompt_version and en_prompt_version not in skill_source_text:
                errors.append(f"skill.md missing bundled English prompt version {en_prompt_version}")

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

        if f'href="./{page_slug}.html"' in index_text:
            errors.append(f"docs/index.html should not expose role link on the single-entry homepage: ./{page_slug}.html")

        if page.exists():
            page_text = page.read_text(encoding="utf-8")
            validate_public_footer(f"docs/{page_slug}.html", page_text, errors)
            if "history-only" not in page_text or "上传到我们的服务器" not in page_text:
                errors.append(f"docs/{page_slug}.html missing consent-first local-only candidate notice")
            if WORK_AGENT_EN_MARKER not in page_text or WORK_AGENT_ZH_MARKER not in page_text:
                errors.append(f"docs/{page_slug}.html missing work-agent compatibility wording")
            if READ_COMMAND_MARKER not in page_text or "skill.md" not in page_text:
                errors.append(f"docs/{page_slug}.html missing one-line skill.md starter command")
            if "Copy Command" not in page_text or "复制命令" not in page_text:
                errors.append(f"docs/{page_slug}.html missing compact copy-command UI")
            if "full role prompt is bundled inside skill.md" not in page_text or "完整岗位 prompt 已经打包在 skill.md" not in page_text:
                errors.append(f"docs/{page_slug}.html missing role-prompt-in-skill wording")
            if "Use the one-line command directly above" not in page_text or "使用上方的一行命令" not in page_text:
                errors.append(f"docs/{page_slug}.html should describe the role starter as directly above the run instructions")
            if "<!-- role-starter:start -->" not in page_text or "<!-- role-starter:end -->" not in page_text:
                errors.append(f"docs/{page_slug}.html missing generated role starter markers")
            if "role-test" in page_text or "岗位测试" in page_text:
                errors.append(f"docs/{page_slug}.html should not show role-test / 岗位测试 eyebrow copy")
            hero_start = page_text.find('<section class="hero">')
            hero_end = page_text.find("</section>", hero_start)
            starter_index = page_text.find('class="prompt-wrap role-starter"')
            back_home_index = page_text.find('href="./index.html"', hero_start)
            how_to_index = page_text.find("How To Run This Test")
            if not (hero_start != -1 and starter_index != -1 and back_home_index != -1 and hero_end != -1 and how_to_index != -1 and hero_start < starter_index < back_home_index < hero_end < how_to_index):
                errors.append(f"docs/{page_slug}.html should place the one-line starter inside the hero section before the back-home link and before longer instructions")
            if "Paste the prompt below into your own Claude Code or Codex" in page_text or "复制后直接粘贴到 Claude Code / Codex" in page_text:
                errors.append(f"docs/{page_slug}.html still contains Claude Code/Codex-exclusive candidate wording")
            if "one-line command below" in page_text or "下面的一行命令" in page_text:
                errors.append(f"docs/{page_slug}.html still describes the starter as below the instructions")
            if "Paste the full prompt below" in page_text or "把下面整段完整粘贴" in page_text:
                errors.append(f"docs/{page_slug}.html still renders the long raw prompt")
            if "JD prompt version" in page_text or HIRED_HEADER_MARKER in page_text or BLOCK_BAR_MARKER in page_text:
                errors.append(f"docs/{page_slug}.html should not render embedded long prompt internals")
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
            if f"prompts/{prompt_slug}" in page_text:
                errors.append(f"docs/{page_slug}.html should not display source prompt filenames")

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
