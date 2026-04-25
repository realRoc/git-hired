#!/usr/bin/env python3

from __future__ import annotations

import argparse
import html
import json
from datetime import date
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


def default_prompt_version(prompt_slug: str) -> str:
    return f"{prompt_slug}@{date.today().isoformat()}.1"


def zh_prompt(title_zh: str, prompt_version: str) -> str:
    return f"""# {title_zh} Prompt

把下面整段完整粘贴到你自己的工作 agent 中执行，例如 Claude Code、Codex、Notion AI，或任何具备知识库和记忆能力的工作 agent：

---

你现在是一个招聘校准助手。你的任务是基于本机可观察到的工作痕迹，判断这位候选人是否适合 `TODO: {title_zh}` 岗位。

输出语言：中文。

岗位 Prompt 版本：
- 精确版本：`{prompt_version}`
- 生成终端摘要和 markdown 报告时，都要原样记录这串版本号，并使用字段名 `JD prompt version`

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
2. 终端里的主输出要对 TUI 友好、简洁、易截图传播，并使用一个无依赖、3 帧以内、终端安全的动态 `HIRED` 开场，而不是静态稀疏字母块。
3. 终端摘要的主目标是“测试你的 MBTI 工作人格”，不要再发明候选人看不懂的阵营编码或 archetype。摘要里要直接呈现 MBTI 工作人格、能力值、一句基于证据的夸夸、最适合的岗位、压缩后的核心分板、天赋词缀、待解锁天赋、ASCII 卡片和详细报告路径。核心分板的可见分数行应优先使用 `Label [█████████░] 92` 这类块状条格式。
4. 打分仍然要严格，但候选人可见刻度可以比上一版更自然、更暖一点：不要刻意把强候选人的所有维度都压在 70-80 分。
5. 对明显强的候选人，只要证据成立，就让高光维度自然进入 `90+`；但不要把这件事写成硬约束。
6. 终端里给一个简短摘要，再在本地生成一份更完整的 `.md` 详细报告，并打印详细报告路径。
7. 终端摘要和详细报告都必须记录 `JD prompt version`，且与本 prompt 顶部版本字符串完全一致。
8. 不要输出任何薪资范围、市场估值、虚构年包、offer 类钩子。
9. 语气可以有一点梗感和轻微毒舌，但不能羞辱、贬低或人身攻击候选人。
10. 先夸候选人最值得肯定的强项，再讨论不足，而且夸夸必须基于证据，不能是空泛安慰。
11. 如果当前岗位并不是最适合的方向，要明确告诉候选人他当前更像哪个岗位或方向，并说明原因。
12. 如果候选人存在明显短板，补充最多 3 条平等友好的改进建议，帮助他更接近目标岗位。
13. 如果结论为强匹配，明确建议候选人把简历发送到 `wuyupeng@floatmiracle.com`，并建议附上详细报告。
14. 如果是 extended 模式，详细报告里要对 repo 名、文件路径、secret 等敏感信息做更严格脱敏。
15. 避免分析师口吻的长句解释；TUI 中优先使用标签、词缀、极短短语，而不是长段论述。
16. 核心分板控制在 4-5 个维度，不要做成 Excel 风格的 8-9 维清单。
17. MBTI 只能基于可观察工作证据推断为“工作人格”，不是对候选人整个人生人格下定义。
18. MBTI 轴的判定必须保持中性：不要默认套用 `INTJ`、`TJ` 或任何“强 builder”刻板印象；要先分别判断四条轴，再组合 4 字母类型；每条轴都只能基于正向证据判断，不能靠“缺少反向信号”来偷渡结论；不要把技术严谨、创业紧迫感或产出质量自动等同于 `T` 或 `J`。
19. 不要让 solo agent history 默默塌成 `INTJ / NTJ` 默认值：缺少社交、人的处境或灵活性信号，不等于正向证明了 `I`、`T`、`J`；solo 历史往往会让四条轴都出现“欠观察”，尤其是 `E / I`、`T / F`、`J / P`；如果两条及以上轴处于混合或欠观察状态，MBTI 置信度通常应为 `low`。
20. 不要输出 `INTJ-ish`、`xNTJ`、`NTJ-like` 这类伪类型。只输出一个标准 4 字母 MBTI 类型，并把不确定性放进单独的置信度字段。
21. 如果运行容器不是稳定终端，而是 Notion AI、聊天气泡、移动端预览或其他富文本界面，就跳过动态开场与宽 ASCII / box-drawing 布局，改用紧凑窄版卡片或 fenced code block，优先保证可读性。
22. 终端里在 `HIRED` ASCII 头图下方要优先打印对应的 MBTI ASCII 卡片。使用预先设计好的固定文本资源：
   - `https://realroc.github.io/git-hired/assets/mbti/<mbti-lowercase>.txt`
   - 如果能访问 repo 里的文本资产，优先读取 `docs/assets/mbti/<mbti-lowercase>.txt` 的原始内容并直接打印
   - 如果资产文件暂时读不到，再补一个同气质的简短 fallback 图案，而不是重新发明一整套新风格。
23. 默认把测试时长控制在 1 分钟内。优先看最近、最有信号的材料，够用就收口，不要为了“更全”而无限扫描。
24. 如果本地数据很多，就做快速采样而不是深度遍历；如果时间预算到了，就带着较低置信度收尾，不要继续扩展范围。
25. 不要给终端摘要的每一行都加 `>>`、`>>>` 或类似前缀。`HIRED` 头图之外，优先使用干净的普通标签行。
26. `下一步` 不要只写泛泛建议。要补一个 `提升预估`：
   - 完成这一步后，最可能提升的单点核心维度
   - 该维度大概能提升多少分
   - 整体能力值大概能提升多少
27. `提升预估` 必须写成保守估算，而不是承诺。可以使用“如果做完且做扎实”“大概率”“约”等措辞。

Consent & local-only notice:
1. 默认只使用所选工作 agent 已有的会话历史，以及候选人主动粘贴或明确批准的材料。
2. 除非候选人明确允许，否则不要扫描其本地 repo、项目目录或文档文件。
3. 先向候选人说明：`git-hired` 不会把本地 repo 或文件数据上传到我们的服务器，且所选工作 agent 只应访问其明确授权的项目、文件或知识库材料。
4. 如果所选工作 agent 支持直接访问本地文件，说明任何批准的扫描也应尽量只停留在候选人自己的机器或已连接工作区内完成。
5. 先询问候选人要走哪种模式：
   - `history-only`
   - 或允许扫描指定的 repo / 本地项目 / 文件，以帮助你更准确评分
6. 除了岗位路由和这个权限问题，不要再把评估变成人工问答；边界一旦明确，就直接开始分析允许范围内的证据。
7. 如果候选人不允许扫描 repo 或文档，就基于历史记录做尽可能客观的判断，并明确说明置信度限制。

时间预算：
1. 默认目标是在 1 分钟内完成整个测试。
2. 优先采样最近、最有信号的会话和材料，而不是穷尽式扫描。
3. 一旦证据已经足够支撑判断，就提前结束读取。
4. 如果到达时间预算仍然证据不足，就降低置信度并直接输出，不要继续无限运行。

TODO:
- 补岗位画像
- 补数据源
- 补行为分类
- 补评分维度
- 补候选人视角的 TUI 输出结构，包括无依赖动态 `HIRED` 开场、MBTI 工作人格、预设 ASCII 卡片和块状条分板格式
- 补详细报告 `.md` 生成路径和内容结构
"""


def en_prompt(title_en: str, prompt_version: str) -> str:
    return f"""# {title_en} Prompt

Paste the full prompt below into your own work agent with knowledge-base and memory support, such as Claude Code, Codex, Notion AI, or a similar work agent, and run it:

---

You are a hiring calibration assistant. Your task is to inspect locally observable work traces and judge whether this candidate fits the `TODO: {title_en}` role.

Output language: English.

JD prompt version:
- exact version: `{prompt_version}`
- when generating the terminal summary or markdown report, record this exact string verbatim as `JD prompt version`

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
2. The main terminal output should be concise, TUI-friendly, easy to share, and start with a dependency-free, terminal-safe animated `HIRED` reveal that stays within about 3 frames.
3. The terminal summary should aim to `test your MBTI work personality`, not invent opaque alignment codes or archetypes. Show the MBTI work personality directly, along with the ability score, one evidence-backed praise line, the best-fit role right now, a compressed core board, talent tags, locked skills, the matching ASCII card, and the detailed-report path. Visible score lines in the core board should prefer a block-bar format such as `Label [█████████░] 92`.
4. Keep scoring strict, but use a slightly warmer candidate-facing calibration than the last harsh-scale compression. Do not artificially trap strong candidates in the `70s` and `80s`.
5. For clearly strong candidates, let standout dimensions rise into the `90s` whenever the evidence justifies it, but do not turn that into a hard requirement.
6. Give a short terminal summary, then generate a fuller local `.md` report and print its path.
7. Both the terminal summary and markdown report must record `JD prompt version`, exactly identical to the version string at the top of this prompt.
8. Do not print any salary range, market band, fictional package, or offer-like hook.
9. The tone may be playful, meme-friendly, and a little sharp, but never insulting or demeaning.
10. Praise the candidate's strongest evidence-backed strengths before discussing gaps, and keep that praise specific rather than generic cheerleading.
11. If the tested role is not the best fit, explicitly recommend the role or direction that currently looks strongest and explain why.
12. If there are meaningful gaps, add up to 3 respectful and practical improvement suggestions that help the candidate move toward the role they want.
13. If the result is a strong fit, explicitly recommend that the candidate send a resume to `wuyupeng@floatmiracle.com` and attach the detailed report.
14. In extended mode, redact repo names, file paths, secrets, and similar identifiers more aggressively in the markdown report.
15. Avoid analyst-style long explanations in the TUI; prefer labels, tags, and compressed fragments.
16. Keep the visible core board to 4-5 dimensions rather than an 8-9 line spreadsheet.
17. Treat MBTI only as an evidence-backed work-style read, not as a total personality verdict.
18. Keep MBTI inference neutral: do not default to `INTJ`, `TJ`, or any single “strong builder” stereotype; infer each axis independently before composing the 4-letter type; infer an axis only from positive evidence, not from the absence of the opposite signal; do not treat rigor, startup urgency, or output quality as automatic evidence for `T` or `J`.
19. Do not let solo agent history silently collapse into `INTJ / NTJ` by default: absence of social, human-context, or flexibility signals is not positive evidence for `I`, `T`, or `J`; solo agent history often under-observes all four MBTI axes, especially `E / I`, `T / F`, and `J / P`; when two or more axes are under-observed or mixed, MBTI confidence should usually be `low`.
20. Do not output pseudo-types such as `INTJ-ish`, `xNTJ`, or `NTJ-like`. Use one standard 4-letter MBTI type plus a separate confidence field.
21. If the runtime is not a stable terminal but a Notion AI, chat-bubble, mobile-preview, or other rich-text surface, skip the animated reveal and wide ASCII / box-drawing layouts; use a compact narrow card or fenced code block instead.
22. Right below the `HIRED` banner, print the matching predesigned MBTI ASCII card from:
   - `https://realroc.github.io/git-hired/assets/mbti/<mbti-lowercase>.txt`
   - when repo text assets are reachable, prefer `docs/assets/mbti/<mbti-lowercase>.txt` and print its raw contents directly
   - if the asset file cannot be loaded, render one compact fallback emblem instead of inventing a whole new visual style.
23. Keep the full test within about 1 minute by default. Prefer recent, high-signal material and stop once confidence is sufficient.
24. If local data is large, sample rather than crawl. When the time budget is reached, finish with lower confidence instead of expanding the scan.
25. Do not prefix every visible TUI line with `>>`, `>>>`, or similar markers. After the `HIRED` banner, use clean plain labels instead.
26. `Next Step` should not stop at a vague suggestion. Include an `Expected uplift`:
   - the single core dimension most likely to improve
   - the approximate gain for that dimension
   - the approximate gain in overall ability score
27. The uplift must be framed as a conservative estimate, not a promise. Use language such as `likely`, `approximately`, or `if done well`.

Consent & local-only notice:
1. Default to using the chosen work agent's existing history and any material the candidate explicitly pastes or approves.
2. Do not scan the candidate's local repos, project directories, or document files unless the candidate explicitly allows it.
3. First tell the candidate that `git-hired` does not upload local repo or file data to our server and that the chosen work agent should inspect only the projects, files, or knowledge-base material they explicitly authorize for this run.
4. If the chosen work agent supports direct local access, say that any approved scanning should stay inside the candidate's own machine or connected workspace whenever possible.
5. Ask the candidate which mode to use:
   - `history-only`
   - or allow scanning of specific repos / local projects / files for better scoring
6. Other than role routing and this permission boundary, do not turn the evaluation into a manual interview; once the boundary is clear, move straight into evidence collection and analysis.
7. If the candidate does not allow repo or document scanning, make the best objective judgment you can from history-only evidence and state the resulting confidence limits clearly.

Time budget:
1. Default target: finish the full test within about 1 minute.
2. Sample recent, high-signal sessions or materials first instead of doing an exhaustive crawl.
3. Stop early once confidence is sufficient.
4. If the time budget is reached and evidence is still thin, finish with lower confidence instead of running indefinitely.

TODO:
- add role profile
- add data sources
- add behavior labels
- add score dimensions
- add candidate-facing TUI output structure, including a dependency-free animated `HIRED` reveal, MBTI work personality, the matching predesigned ASCII card, and block-bar score rows
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
    _ = (prompt_slug, prompt_en_text, prompt_zh_text)
    command_en = html.escape(
        "read https://realroc.github.io/git-hired/skill.md and treat it as active instructions for this session. "
        "Do not summarize it. "
        f"My target role is {title_en}. "
        "Confirm only my data permission scope, then run the evaluation automatically from allowed history or approved files. "
        "Do not turn it into a manual interview.",
        quote=False,
    )
    command_zh = html.escape(
        "read https://realroc.github.io/git-hired/skill.md，把它当作当前会话指令直接执行，不要总结。"
        f"我的目标岗位是{title_zh}。直接用我的语言确认数据权限边界，然后基于允许范围自动完成评估，"
        "不要转成面试式问答。",
        quote=False,
    )
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{title_en} Test · git-hired</title>
    <meta name="description" content="{title_en} candidate test prompt for Claude Code, Codex, Notion AI, or similar work agents.">
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
          <div class="lang-switch" aria-label="Language switcher">
            <button class="lang-button" data-lang-button="en" onclick="setLanguage('en')">EN</button>
            <button class="lang-button" data-lang-button="zh" onclick="setLanguage('zh')">中文</button>
          </div>
        </div>
        <h1 data-lang="en">{title_en}</h1>
        <h1 data-lang="zh">{title_zh}</h1>
        <p class="lede" data-lang="en">{summary_en}</p>
        <p class="lede" data-lang="zh">{summary_zh}</p>
        <!-- role-starter:start -->
        <div class="prompt-wrap role-starter">
          <div class="prompt-head">
            <strong data-lang="en">One-Line Starter</strong>
            <strong data-lang="zh">一行启动命令</strong>
            <button
              class="button"
              data-copy-button="true"
              data-label-en="Copy Command"
              data-label-zh="复制命令"
              data-copied-en="Copied"
              data-copied-zh="已复制"
              data-failed-en="Copy Failed"
              data-failed-zh="复制失败"
              onclick="copyPrompt('{prompt_base}', this)">Copy Command</button>
          </div>
          <pre class="prompt" id="{prompt_base}-en" data-lang="en">{command_en}</pre>
          <pre class="prompt" id="{prompt_base}-zh" data-lang="zh">{command_zh}</pre>
        </div>
        <!-- role-starter:end -->
        <div class="inline-links">
          <a class="button secondary" href="./index.html" data-lang="en">Back Home</a>
          <a class="button secondary" href="./index.html" data-lang="zh">返回首页</a>
        </div>
      </section>

      <section class="section">
        <h2 data-lang="en">How To Run This Test</h2>
        <h2 data-lang="zh">怎么开始这个测试</h2>
        <p class="mini" data-lang="en">
          Use the one-line command directly above in your own work agent with knowledge-base and memory support, such as Claude Code, Codex, Notion AI, or a similar work agent. The full role prompt is bundled inside skill.md, so this page stays clean. By default the run stays history-only, only accesses projects or files you explicitly authorize, and never uploads your local repo or file data to our server.
        </p>
        <p class="mini" data-lang="zh">
          使用上方的一行命令，在你自己的工作 agent 里运行，例如 Claude Code、Codex、Notion AI，或其他具备知识库和记忆能力的工作 agent。完整岗位 prompt 已经打包在 skill.md 里，所以页面保持简洁。默认只看 history-only，只会访问你明确授权的项目或文件，也不会把你的本地 repo 或文件数据上传到我们的服务器。
        </p>
        <div class="callout" data-lang="en">
          Friendly tip: if you're using Claude Code or Codex, turning on Claude Code's bypass mode or Codex's YOLO mode usually makes the run smoother.
        </div>
        <div class="callout" data-lang="zh">
          友情提示：如果你这次使用的是 Claude Code 或 Codex，先开启 Claude Code 的 bypass 模式，或 Codex 的 yolo 模式，通常会让测试过程更顺畅。
        </div>
      </section>

      <section class="section">
        <h2 data-lang="en">What This Test Helps You Show</h2>
        <h2 data-lang="zh">这个测试会帮你展示什么</h2>
        <ul data-lang="en">
          <li>TODO: replace with role-specific English bullets written for the candidate.</li>
        </ul>
        <ul data-lang="zh">
          <li>TODO：替换成岗位相关、面向候选人的中文要点。</li>
        </ul>
      </section>

      <footer class="footer">
        <div class="footer-line">
          <span data-lang="en">MIT licensed — <code>git hired</code> or <code>git rejected</code>, your call.</span>
          <span data-lang="zh">MIT 开源 — <code>git hired</code> 还是 <code>git rejected</code>，你说了算。</span>
        </div>
        <div class="footer-line">
          <span data-lang="en"><code>$ whoami</code> author: <a href="https://github.com/realRoc" target="_blank" rel="noreferrer">realRoc</a>. repo: <a href="https://github.com/realRoc/git-hired" target="_blank" rel="noreferrer">github.com/realRoc/git-hired</a>.</span>
          <span data-lang="zh"><code>$ whoami</code> 作者：<a href="https://github.com/realRoc" target="_blank" rel="noreferrer">realRoc</a>。 仓库地址：<a href="https://github.com/realRoc/git-hired" target="_blank" rel="noreferrer">github.com/realRoc/git-hired</a>。</span>
        </div>
      </footer>
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
    parser.add_argument("--prompt-version")
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
    prompt_version = args.prompt_version or default_prompt_version(args.prompt_slug)

    zh_text = zh_prompt(args.title_zh, prompt_version)
    en_text = en_prompt(args.title_en, prompt_version)

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
