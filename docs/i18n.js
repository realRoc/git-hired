/* GitHire · client-side i18n
 *
 * - Resolves a target language from (in order): ?lang=, localStorage,
 *   IP geolocation (CN → zh, else en), navigator.language, default en.
 * - Walks the DOM once and rewrites every node carrying:
 *     data-i18n              → innerHTML
 *     data-i18n-attr         → comma-separated "attr:key" pairs
 *     data-i18n-title (on <title>) → document.title
 * - Wires the topnav language switch (two buttons with data-lang-btn).
 *
 * The HTML keeps zh-CN as the default content, so the page is fully
 * readable if this script fails to load. The inline pre-paint snippet in
 * each HTML file (looks at localStorage / URL / navigator.language) sets
 * data-lang on <html> before first paint, so returning English users do
 * not see Chinese flash.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'githire-lang';
  var SUPPORTED = ['zh', 'en'];

  // ── Translations ───────────────────────────────────────────────────────
  // Keys are page-prefixed: common.*, index.*, blog.*, skill.*, case.*
  // Both zh and en are kept so switching either way is just a lookup.
  //
  // SECURITY: every value below is written into the DOM as innerHTML, so
  // these strings are CODE, not data. Treat new translation entries as you
  // would any other commit — review for <script>, event-handler attributes
  // (onclick, onerror, onload, …), and javascript: URLs. Do NOT accept
  // unreviewed translations from outside contributors here; if you ever
  // need that, route them through a sanitizer or switch the swap path to
  // textContent for those keys.
  var T = {
    /* ── common ───────────────────────────────────────────────────── */
    'common.skip': {
      zh: '跳到主要内容',
      en: 'Skip to main content'
    },
    'common.nav_aria': {
      zh: '主导航',
      en: 'Main navigation'
    },
    'common.lets_talk': {
      zh: "Let's talk",
      en: "Let's talk"
    },
    'common.menu': {
      zh: 'Menu',
      en: 'Menu'
    },
    'common.nav.intro':      { zh: 'Intro',      en: 'Intro' },
    'common.nav.definition': { zh: 'Definition', en: 'Definition' },
    'common.nav.workflow':   { zh: 'Workflow',   en: 'Workflow' },
    'common.nav.rituals':    { zh: 'Rituals',    en: 'Rituals' },
    'common.nav.faq':        { zh: 'FAQ',        en: 'FAQ' },
    'common.nav.blog':       { zh: 'Blog',       en: 'Blog' },
    'common.nav.skill':      { zh: 'Skill',      en: 'Skill' },

    'common.lang_aria':  { zh: '切换语言', en: 'Switch language' },
    'common.lang_zh':    { zh: '中',       en: '中' },
    'common.lang_en':    { zh: 'EN',       en: 'EN' },

    'common.foot.tagline': {
      zh: '© <span id="year">2026</span> GitHire · operating log from AI-native teams',
      en: '© <span id="year">2026</span> GitHire · operating log from AI-native teams'
    },
    'common.foot.home': {
      zh: '回到 GitHire',
      en: 'Back to GitHire'
    },

    /* ── index.html ───────────────────────────────────────────────── */
    'index.title': {
      zh: 'GitHire · 人思考，AI 执行，人验收',
      en: 'GitHire · Humans think, AI executes, humans verify'
    },
    'index.meta.description': {
      zh: "GitHire 是一套 AI-native 工程方法论:把'人思考、AI 执行、人验收'写成可复用的六步 workflow,拿真实事故 case 验证,再用 Skill 让任何 agent 装上。",
      en: "GitHire is an AI-native engineering method that codifies 'humans think, AI executes, humans verify' into a six-step workflow — validated by real production incidents, packaged as a Skill any agent can install."
    },
    'index.og.description': {
      zh: "一套 AI-native 工程方法论:Issue → Sandbox → PR → AI Review → Architect → Production,六步把'人思考、AI 执行、人验收'落到可复用 workflow。",
      en: "An AI-native engineering method: Issue → Sandbox → PR → AI Review → Architect → Production — six steps that turn 'humans think, AI executes, humans verify' into a reusable workflow."
    },
    'index.og.image_alt': {
      zh: 'GitHire · 人思考、AI 执行、人验收',
      en: 'GitHire · Humans think, AI executes, humans verify'
    },

    'index.hero.kicker': {
      zh: 'AI-native engineering · 一种新的工作方式',
      en: 'AI-native engineering · A new way of working'
    },
    'index.hero.title': {
      zh: '<span class="hl-1"><em>人思考</em>，AI <em>执行</em>，</span>\n          <span class="hl-2"><em>人验收</em><span class="period">.</span></span>',
      en: '<span class="hl-1"><em>Humans</em> think, AI <em>executes</em>,</span>\n          <span class="hl-2"><em>humans</em> verify<span class="period">.</span></span>'
    },
    'index.hero.lede': {
      zh: '一份公开的 operating log —— 六步 workflow、真实事故 case、可装 Skill。给所有想看 AI-native 团队怎么工作的人。',
      en: 'A public operating log — six-step workflow, real incident case, installable Skill. For anyone who wants to see how an AI-native team actually works.'
    },
    'index.hero.scroll': {
      zh: 'Scroll <span>↓</span>',
      en: 'Scroll <span>↓</span>'
    },

    'index.def.kicker': {
      zh: 'What is GitHire · 一句话',
      en: 'What is GitHire · In one line'
    },
    'index.def.line': {
      zh: '<strong>GitHire</strong> 是一套 <em>AI-native 工程方法论</em>——把\n          <strong>"人思考、AI 执行、人验收"</strong>\n          写成可复用的六步 workflow，拿真实事故 case 验证它，再用 Skill 让任何 agent 装上。',
      en: '<strong>GitHire</strong> is an <em>AI-native engineering method</em> — it codifies\n          <strong>"humans think, AI executes, humans verify"</strong>\n          into a reusable six-step workflow, validates it with real production incidents, and packages it as a Skill any agent can install.'
    },
    'index.def.p1.dt': {
      zh: '<span class="num">01</span> Issue-first',
      en: '<span class="num">01</span> Issue-first'
    },
    'index.def.p1.dd': {
      zh: '所有任务从一个能讲明白的 Issue 起步，需求即文档。<em>需求里每一处空白，都是 AI 的自由发挥空间。</em>',
      en: 'Every task starts from an Issue that someone can articulate — the spec is the doc. <em>Every blank in the spec is a blank check for the AI.</em>'
    },
    'index.def.p2.dt': {
      zh: '<span class="num">02</span> Human-orchestrated',
      en: '<span class="num">02</span> Human-orchestrated'
    },
    'index.def.p2.dd': {
      zh: 'AI 在沙盒里完成实现、起 PR、互审；人保留 framing、架构方向与合并决定权。<em>AI 在执行，人在判断。</em>',
      en: 'AI builds, opens PRs, and cross-reviews in a sandbox; humans keep framing, architectural direction, and the merge call. <em>AI executes, humans decide.</em>'
    },
    'index.def.p3.dt': {
      zh: '<span class="num">03</span> Production-bound',
      en: '<span class="num">03</span> Production-bound'
    },
    'index.def.p3.dd': {
      zh: '终点是合并进主分支的 PR，不是 demo、不是练习题。可复用的 Skill 与决策记录回写到 Issue，留作下一次的起点。',
      en: 'The end state is a PR merged to main — not a demo, not an exercise. Reusable Skills and decisions are written back to the Issue as the starting point for the next round.'
    },

    /* Workflow panels */
    'index.wf.s01.counter': { zh: '<span>STEP 01</span> ／ 06', en: '<span>STEP 01</span> ／ 06' },
    'index.wf.s01.fig_caption': { zh: '为谁解决什么', en: 'Whom · solving what' },
    'index.wf.s01.title': {
      zh: '从一个<br/><em>Issue</em> 开始<span class="period">.</span>',
      en: 'Start with an<br/><em>Issue</em><span class="period">.</span>'
    },
    'index.wf.s01.body': {
      zh: '用一两句话把『为谁解决什么』写清楚——能讲明白的需求，才值得进入下一步。Issue 是这次工作的起点，也会是它的归档。',
      en: "Spell out 'whom you are solving what for' in a sentence or two — only specs you can articulate deserve to move forward. The Issue is both the kickoff and the archive of this work."
    },
    'index.wf.s01.en': {
      zh: 'ISSUE · Frame the problem.',
      en: 'ISSUE · Frame the problem.'
    },

    'index.wf.s02.counter': { zh: '<span>STEP 02</span> ／ 06', en: '<span>STEP 02</span> ／ 06' },
    'index.wf.s02.title': {
      zh: '进入开发<br/><em>沙盒</em><span class="period">.</span>',
      en: 'Enter the dev<br/><em>sandbox</em><span class="period">.</span>'
    },
    'index.wf.s02.body': {
      zh: '沙盒是长期运行的开发环境，保留依赖、缓存与既有数据，让 AI 能在真实的上下文里工作，而不是一次性容器。',
      en: 'A sandbox is a long-running dev environment — dependencies, caches, and real data stay put, so the AI works in actual context, not a throwaway container.'
    },
    'index.wf.s02.en': {
      zh: 'SANDBOX · A persistent dev environment.',
      en: 'SANDBOX · A persistent dev environment.'
    },

    'index.wf.s03.counter': { zh: '<span>STEP 03</span> ／ 06', en: '<span>STEP 03</span> ／ 06' },
    'index.wf.s03.title': {
      zh: '执行任务<br/>发起 <em>PR</em><span class="period">.</span>',
      en: 'Execute and<br/>open a <em>PR</em><span class="period">.</span>'
    },
    'index.wf.s03.body': {
      zh: '把 Issue 交给 Claude Code 或 Codex，由它在沙盒里完成实现：写代码、跑测试、迭代修复，最终发起一份 PR。',
      en: 'Hand the Issue to Claude Code or Codex. It builds inside the sandbox — writes code, runs tests, iterates on failures — and ends with a PR.'
    },
    'index.wf.s03.en': {
      zh: 'EXECUTE · Claude Code or Codex.',
      en: 'EXECUTE · Claude Code or Codex.'
    },

    'index.wf.s04.counter': { zh: '<span>STEP 04</span> ／ 06', en: '<span>STEP 04</span> ／ 06' },
    'index.wf.s04.title': {
      zh: '另一位 <em>AI</em><br/>审核 PR<span class="period">.</span>',
      en: 'A second <em>AI</em><br/>reviews the PR<span class="period">.</span>'
    },
    'index.wf.s04.body': {
      zh: '这一步交给另一位 Claude Code 或 Codex。它读完整份 PR，结合 CI 与静态检查，给出可执行的修改意见——双 AI 互审。',
      en: "Hand the PR to a different Claude Code or Codex instance. It reads the whole diff alongside CI and static checks, and returns actionable feedback — two agents cross-reviewing one PR."
    },
    'index.wf.s04.en': {
      zh: 'AI REVIEW · Two agents, one PR.',
      en: 'AI REVIEW · Two agents, one PR.'
    },

    'index.wf.s05.counter': {
      zh: '<span>STEP 05</span> ／ 06 <em>· 关键一步</em>',
      en: '<span>STEP 05</span> ／ 06 <em>· the key step</em>'
    },
    'index.wf.s05.fig_caption': { zh: 'human · key step', en: 'human · key step' },
    'index.wf.s05.title': {
      zh: '人类<br/><em>架构师</em> 评审<span class="period">.</span>',
      en: 'Human <em>architect</em><br/>reviews<span class="period">.</span>'
    },
    'index.wf.s05.body': {
      zh: '整条流程的核心。由人类架构师判断这次改动是否符合系统方向、是否引入隐性债务、是否值得上线。AI 提供线索，决定权在人。',
      en: 'The pivot of the whole workflow. A human architect decides whether this change matches the system direction, whether it adds hidden debt, whether it deserves to ship. AI surfaces signals; humans decide.'
    },
    'index.wf.s05.en': {
      zh: 'ARCHITECT · Where humans decide.',
      en: 'ARCHITECT · Where humans decide.'
    },

    'index.wf.s06.counter': { zh: '<span>STEP 06</span> ／ 06', en: '<span>STEP 06</span> ／ 06' },
    'index.wf.s06.title': {
      zh: '合并<br/>并 <em>上线</em><span class="period">.</span>',
      en: 'Merge and<br/><em>ship</em><span class="period">.</span>'
    },
    'index.wf.s06.body': {
      zh: '架构师签字之后，PR 合入主干、部署到生产。可复用的 Skill、Checklist、评审记录回写到 Issue，留作下一次的起点。',
      en: 'Once the architect signs off, the PR merges into main and deploys to production. Reusable Skills, checklists, and review notes are written back to the Issue — the kickoff for the next round.'
    },
    'index.wf.s06.en': {
      zh: 'PRODUCTION · Ship it.',
      en: 'PRODUCTION · Ship it.'
    },

    'index.wf.ov.kicker': {
      zh: 'Overall flow · 一次走完',
      en: 'Overall flow · End to end'
    },
    'index.wf.ov.title': {
      zh: 'Issue · Sandbox · AI · 架构师 · 上线<br/><em>—— 交付一次完整的改动<span class="period">.</span></em>',
      en: 'Issue · Sandbox · AI · Architect · Ship<br/><em>— one complete change, delivered<span class="period">.</span></em>'
    },
    'index.wf.ov.label': {
      zh: '完整工作流概览',
      en: 'Full workflow overview'
    },
    'index.wf.ov.foot': {
      zh: '六步串成一条流水线 · 从需求到上线 · 每一次都把决定与产物回写到 Issue',
      en: 'Six steps in a pipeline · from spec to ship · every decision and artifact written back to the Issue'
    },
    'index.wf.ov.cta': {
      zh: '在一次真实的生产事故上走一遍这六步 ↗',
      en: 'Walk these six steps through a real production incident ↗'
    },

    /* Rituals */
    'index.rit.kicker': { zh: '— RITUALS', en: '— RITUALS' },
    'index.rit.title': {
      zh: '流水线之外，<br/><em>那些让协作成立的小习惯</em><span class="period">.</span>',
      en: 'Beyond the pipeline —<br/><em>the small rituals that make it work</em><span class="period">.</span>'
    },
    'index.rit.lede': {
      zh: '流程负责"做什么"，习惯负责"在什么节奏里做"。下面这四件事，是我们用来让 AI-native 协作真正运转起来的最小集。',
      en: "Process answers 'what'; rituals answer 'at what rhythm'. These four habits are the minimum set we use to keep AI-native collaboration actually running."
    },
    'index.rit.list_aria': {
      zh: '四个让协作成立的小习惯',
      en: 'Four rituals that make collaboration work'
    },

    'index.rit.c01.num':  { zh: 'RITUAL · 01', en: 'RITUAL · 01' },
    'index.rit.c01.h':    { zh: '一日的形状', en: 'The shape of a day' },
    'index.rit.c01.en':   { zh: 'THE SHAPE OF A DAY', en: 'THE SHAPE OF A DAY' },
    'index.rit.c01.body': {
      zh: '每天早晨花一分钟，写下今天最重要的那个 Issue。它不是任务清单，而是这一天的锚点——所有的对话、改动、PR，都围绕它发生。',
      en: 'Spend a minute every morning writing down the single most important Issue for the day. Not a todo list — an anchor. All conversation, all changes, all PRs orbit it.'
    },
    'index.rit.c01.dt1': { zh: 'MORNING', en: 'MORNING' },
    'index.rit.c01.dd1': { zh: '写下 #today —— 当日最重要的 Issue', en: 'Write #today — the most important Issue for today' },
    'index.rit.c01.dt2': { zh: 'DURING', en: 'DURING' },
    'index.rit.c01.dd2': { zh: '所有改动都挂在这条 Issue 下面', en: 'Every change hangs off this Issue' },
    'index.rit.c01.dt3': { zh: 'EVENING', en: 'EVENING' },
    'index.rit.c01.dd3': { zh: '用一句话回写今天的进展或决定', en: 'Write back today’s progress or decision in one sentence' },

    'index.rit.c02.num':  { zh: 'RITUAL · 02', en: 'RITUAL · 02' },
    'index.rit.c02.h':    { zh: '架构师与开发者', en: 'Architects and developers' },
    'index.rit.c02.en':   { zh: 'ARCHITECT &amp; DEVELOPERS', en: 'ARCHITECT &amp; DEVELOPERS' },
    'index.rit.c02.body': {
      zh: '架构师拥有方向上的最终决策权；开发者围绕 Issue 进行开发，通过 Issue 与 PR 与架构师对话。评审与决策落在 GitHub 上，飞书留给当下需要立刻对齐的事。',
      en: "The architect owns the final call on direction; developers build around the Issue and talk to the architect through Issues and PRs. Reviews and decisions live on GitHub; chat tools are reserved for things that have to align right now."
    },
    'index.rit.c02.dt1': { zh: 'ARCHITECT', en: 'ARCHITECT' },
    'index.rit.c02.dd1': { zh: '方向与边界的最终决策权', en: 'Final call on direction and boundaries' },
    'index.rit.c02.dt2': { zh: 'DEVELOPER', en: 'DEVELOPER' },
    'index.rit.c02.dd2': { zh: '围绕 Issue 开发 · 在 PR 中对话', en: 'Build around Issues · talk in PRs' },
    'index.rit.c02.dt3': { zh: 'CHANNEL', en: 'CHANNEL' },
    'index.rit.c02.dd3': { zh: '评审在 GitHub · 即时同步在飞书', en: 'Reviews on GitHub · live sync on chat' },

    'index.rit.c03.num':  { zh: 'RITUAL · 03', en: 'RITUAL · 03' },
    'index.rit.c03.h':    { zh: 'Issue 与 PR 的追踪', en: 'Every Issue is tracked' },
    'index.rit.c03.en':   { zh: 'EVERY ISSUE IS TRACKED', en: 'EVERY ISSUE IS TRACKED' },
    'index.rit.c03.body': {
      zh: '每一个 Issue 都有一条对应的 PR 来追踪它的执行过程，PR 上的评论会被完整保留下来——下一个接手的人，可以从 Issue 一路读到当时是怎么决定的。',
      en: 'Every Issue is mirrored by a PR that tracks its execution, and the PR comments are kept verbatim — the next person who picks it up can read straight through from Issue to PR and reconstruct how the call was made.'
    },
    'index.rit.c03.dt1': { zh: 'LINK', en: 'LINK' },
    'index.rit.c03.dd1': { zh: '每个 Issue 对应一条 PR · 一一映射', en: 'One Issue → one PR · 1:1' },
    'index.rit.c03.dt2': { zh: 'KEEP', en: 'KEEP' },
    'index.rit.c03.dd2': { zh: 'PR 评论作为决策记录长期保留', en: 'PR comments preserved as decision record' },
    'index.rit.c03.dt3': { zh: 'READ', en: 'READ' },
    'index.rit.c03.dd3': { zh: '新成员从 Issue → PR 还原历史', en: 'Newcomers reconstruct history from Issue → PR' },

    'index.rit.c04.num':  { zh: 'RITUAL · 04', en: 'RITUAL · 04' },
    'index.rit.c04.h':    { zh: '从 Prompt 到 Skill', en: 'From prompt to Skill' },
    'index.rit.c04.en':   { zh: 'FROM PROMPT TO SKILL', en: 'FROM PROMPT TO SKILL' },
    'index.rit.c04.body': {
      zh: '一段反复用过、值得记住的 prompt，就值得变成 Skill —— 带名字、带说明、任何 agent 都能装上调用。<em>这是团队最值得沉淀的工件。</em>',
      en: 'A prompt you have reused enough to remember deserves to become a Skill — named, described, installable by any agent. <em>This is the artifact most worth carrying forward.</em>'
    },
    'index.rit.c04.dt1': { zh: 'SKILL', en: 'SKILL' },
    'index.rit.c04.dd1': { zh: 'GitHire · 六步 workflow', en: 'GitHire · six-step workflow' },
    'index.rit.c04.dt2': { zh: 'SPEC', en: 'SPEC' },
    'index.rit.c04.dd2': { zh: 'Prompt Spec · 六段式 issue 模板', en: 'Prompt Spec · six-section Issue template' },
    'index.rit.c04.dt3': { zh: 'USE', en: 'USE' },
    'index.rit.c04.dd3': { zh: 'npx skills add realRoc/skills', en: 'npx skills add realRoc/skills' },

    /* FAQ */
    'index.faq.kicker': {
      zh: 'FAQ · 关于 humans-orchestrate-AI',
      en: 'FAQ · About humans-orchestrate-AI'
    },
    'index.faq.title': {
      zh: 'AI 写得快，<br/><em>不等于人想得清</em><span class="period">.</span>',
      en: 'AI writes fast —<br/><em>that is not the same as humans thinking clearly</em><span class="period">.</span>'
    },
    'index.faq.lede': {
      zh: '下面是最容易被跳过的问题——也是 GitHire 真正想回答的。',
      en: 'These are the questions most easily skipped — and the ones GitHire actually exists to answer.'
    },

    'index.faq.q1.q': {
      zh: 'AI 写代码这么快，为什么还要 6 步？',
      en: 'AI writes code in minutes — why bother with six steps?'
    },
    'index.faq.q1.a': {
      zh: '因为速度不是问题——AI 5 分钟写完的代码，人 review 需要 30 分钟才能识别"路径不对"。<strong>6 步 workflow 不是给 AI 装护栏，是给人类留决策点</strong>：Issue 是 framing 的决策点，架构师评审是方向的决策点，sandbox 与 AI review 是两次"还来得及反悔"的决策点。一旦决策点形同虚设，AI 的速度就会变成事故的速度。<a href="case-redis-scan.html">看一次跳过决策点的代价 →</a>',
      en: "Because speed isn't the problem. Code AI writes in five minutes still takes a human thirty to recognise 'wrong path.' <strong>The six steps aren't guardrails for AI — they're decision points for humans.</strong> The Issue is the framing decision; architect review is the direction decision; sandbox and AI review are two more 'still time to back out' decisions. Skip them, and AI's speed turns into the speed of incidents. <a href=\"case-redis-scan.html\">See the cost of skipping a decision point →</a>"
    },
    'index.faq.q2.q': {
      zh: 'Architect 30 秒就能识别问题，AI review 5 分钟都识别不出来吗？',
      en: 'The architect spots it in 30 seconds — why does AI review miss it after 5 minutes?'
    },
    'index.faq.q2.a': {
      zh: '两者识别的是不同维度。<strong>AI review 看的是"代码自带的上下文"</strong>——PR 内部一致性、edge cases、命名一致性、被忽略的 nullability；<strong>架构师看的是"系统侧才有的上下文"</strong>——QPS 曲线、历史事故、容量规划。互补，不重叠。Case 01 里那 22 行 SCAN 代码在 AI review 看来完全正确，但架构师 30 秒就能看出"这个 endpoint 每次请求都扫全表"是不可接受的。',
      en: "They look at different dimensions. <strong>AI review reads the 'context the code carries with it'</strong> — internal consistency of the PR, edge cases, naming, ignored nullability. <strong>The architect reads the 'context only the system has'</strong> — QPS curves, past incidents, capacity plans. Complementary, not overlapping. In Case 01 those 22 lines of SCAN looked perfectly correct to AI review, but the architect saw in 30 seconds that 'this endpoint scans the entire keyspace on every request' is unacceptable."
    },
    'index.faq.q3.q': {
      zh: '一份好的 Issue 长什么样？',
      en: 'What does a good Issue look like?'
    },
    'index.faq.q3.a': {
      zh: '六段。<em>Goal</em> 说清楚要解决什么；<em>Constraints</em> 说清楚不能动什么；<em>Non-goals</em> 说清楚不做什么；<em>Verification</em> 说清楚怎么证明成功；<em>Architecture notes</em> 说清楚系统边界；<em>Existing context</em> 说清楚已有实现。<strong>缺一段，AI 就会在那一段自由发挥。</strong>具体对照请看 case 01 里同一需求的 <a href="case-redis-scan.html#rewrite-title">BAD vs GOOD →</a>。',
      en: "Six sections. <em>Goal</em> — what you are solving. <em>Constraints</em> — what cannot move. <em>Non-goals</em> — what we are not doing. <em>Verification</em> — how we know it worked. <em>Architecture notes</em> — system boundaries. <em>Existing context</em> — what is already there. <strong>Drop a section and the AI freelances inside it.</strong> See the same spec written two ways in Case 01: <a href=\"case-redis-scan.html#rewrite-title\">BAD vs GOOD →</a>."
    },
    'index.faq.q4.q': {
      zh: 'AI 出事故，谁来背锅？',
      en: 'When AI ships an incident, who carries it?'
    },
    'index.faq.q4.a': {
      zh: '<strong>架构师。</strong>AI 不背锅——背锅意味着代理责任，AI 没有代理资格。所有合入主干的代码都有一位架构师签字，签字就是认领系统侧后果。GitHire 不允许 review 责任被"AI 评过了"稀释——AI review 是辅助证据，架构师 review 是决定。',
      en: "<strong>The architect.</strong> AI does not carry it — carrying implies agency, and AI has no agency. Every change that merges to main has an architect's signature, and that signature is an explicit claim on the system-side consequences. GitHire does not let review accountability get diluted by 'an AI looked at it.' AI review is supporting evidence; architect review is the decision."
    },
    'index.faq.q5.q': {
      zh: 'Conceptual integrity 怎么在 AI 协作下保持？',
      en: 'How is conceptual integrity preserved when AI is on the team?'
    },
    'index.faq.q5.a': {
      zh: '通过显式的架构 owner。AI agent 可以生成 PR，但 Architect 这一步由人类负责。<strong>所有 PR 必须能被一位 architect 用一句话讲清楚动机和取舍</strong>——做不到的 PR 不 merge。这条约束让概念一致性不被并发的 agent 数量稀释。',
      en: "Through an explicit architecture owner. AI agents can generate PRs, but the Architect step is held by a human. <strong>Every PR must be summarisable by one architect in one sentence — motivation and trade-off.</strong> A PR that fails this test does not merge. The constraint keeps conceptual integrity from being diluted by however many agents are running in parallel."
    },
    'index.faq.q6.q': {
      zh: 'Sandbox 里写的代码为什么默认不进主分支？',
      en: 'Why does sandbox code not land in main by default?'
    },
    'index.faq.q6.a': {
      zh: '因为第一版的价值是<em>澄清问题</em>，不是交付。GitHire 把 Brooks 那句 <em>"Plan to throw one away; you will, anyhow"</em> 显式化：sandbox 阶段的代码默认不进主干，存在的目的是验证方向、暴露未知。<strong>等真正写主干代码时，问题已经清楚，AI 才有可能一次写对。</strong>',
      en: 'Because the value of the first cut is <em>clarifying the problem</em>, not shipping. GitHire makes Brooks’s <em>"Plan to throw one away; you will, anyhow"</em> explicit: sandbox code is not destined for main by default — its job is to validate the direction and surface unknowns. <strong>By the time real code is written for main, the problem is clear enough that AI has a chance of getting it right in one shot.</strong>'
    },
    'index.faq.q7.q': {
      zh: '进度落后的团队是否需要再加人？',
      en: 'Should a team that is falling behind add people?'
    },
    'index.faq.q7.a': {
      zh: '这个问题的经典版本来自 Brooks 的 <em>Mythical Man-Month</em>：给延期项目加人,会让项目更延期——因为新人需要学习上下文,沟通成本随人数二次方上升,短期内整体进度反而更慢。<strong>放到 AI-native 团队里,这条规律没失效,只是稀缺品换了：</strong>coding 手脚不缺——AI 已经够快——稀缺的是<em>会 frame issue、做架构判断的脑子</em>。一个能写出 6 段式 issue 的人可以同时 orchestrate 几个 agent；多请一个 coder 反而稀释了方向。<strong>加人之前先问：是 framing 不够，还是吞吐不够？</strong>',
      en: "The classic version is Brooks's <em>Mythical Man-Month</em>: adding people to a late project makes it later — newcomers have to learn context, communication cost grows quadratically, and progress slows in the short term. <strong>The law still holds in an AI-native team — only the scarce resource has changed.</strong> Coding hands aren't scarce: AI is already fast enough. What is scarce are <em>the heads that can frame an Issue and make architectural calls</em>. One person who can write a six-section Issue can orchestrate several agents; hiring another coder just dilutes direction. <strong>Before adding people, ask: is framing the bottleneck, or is throughput?</strong>"
    },
    'index.faq.q8.q': {
      zh: '『人月』是个伪命题吗？',
      en: "Is the 'person-month' a fiction?"
    },
    'index.faq.q8.a': {
      zh: '"人月"是软件项目的传统估算单位——"这个功能要花 6 个人月"。Brooks 早就指出这是粗糙的近似：人和月不能线性互换,加一倍人不会让项目快一倍。<strong>放到 AI-native 团队里,人月不只是粗糙,而是失效：</strong>它建模的是 coding 工作量,但 coding 已经不是瓶颈——AI agent 5 分钟交付过去一个人月的代码量；而一条糟糕的 issue 让 AI 跑出 22 行 SCAN（<a href="case-redis-scan.html">case 01</a>）,损失 25 小时救火,这部分根本无法用人月度量。<strong>新的单位应该是"决策点节奏"：</strong>每周完成多少次 framing、多少次架构评审、多少次 sandbox → PR 闭环。',
      en: "The 'person-month' was the traditional estimation unit — 'this feature is six person-months.' Brooks already noted it is a rough approximation: people and months are not linearly interchangeable, and doubling headcount does not double speed. <strong>In an AI-native team it is not just rough — it has broken down.</strong> Person-month models coding effort, but coding is no longer the bottleneck: an AI agent ships a former person-month of code in five minutes. Meanwhile one badly framed Issue makes the AI produce 22 lines of SCAN (<a href=\"case-redis-scan.html\">Case 01</a>) and costs 25 hours of firefighting — and that part doesn't fit person-month at all. <strong>The new unit is 'decision-point cadence':</strong> framings per week, architect reviews per week, sandbox → PR loops closed per week."
    },
    'index.faq.q9.q': {
      zh: 'Deadline 为什么总是骗人的？',
      en: 'Why do deadlines keep lying?'
    },
    'index.faq.q9.a': {
      zh: '软件项目几乎从不按时交付——经典的解释是：估算在信息最少的时候做出,承诺在压力最大的时候许下,两边都不靠谱。<strong>放到 AI-native 团队里,deadline 仍然不准,但失准的根源换了：</strong>过去 deadline 滑掉是因为 <em>coding 慢</em>；现在 coding 不慢了,deadline 滑掉是因为 <strong>framing 失误</strong> 和 <strong>review 来不及</strong>——一条没写清的 issue 让 AI 走错方向 20 分钟,代价是 25 小时根治（<a href="case-redis-scan.html">case 01</a>）。<strong>GitHire 不承诺 deadline,改承诺"决策点完成度"：</strong>issue framing 完成 / architect 签字完成 / sandbox 验证完成。可观测的状态替代主观时间,越接近交付,预测越收敛。',
      en: "Software projects almost never ship on time — the classic explanation is that estimates are made when information is thinnest and promises are made when pressure is highest, and neither side is reliable. <strong>Deadlines still miss in an AI-native team, but the root cause has shifted:</strong> they used to slip because <em>coding was slow</em>; now coding isn't slow, and they slip because of <strong>bad framing</strong> and <strong>review not catching up</strong> — a poorly written Issue sends AI down the wrong path for 20 minutes and costs 25 hours to fully fix (<a href=\"case-redis-scan.html\">Case 01</a>). <strong>GitHire does not promise a deadline. It promises 'decision-point completion':</strong> Issue framed / architect signed off / sandbox validated. Observable state replaces subjective time — and the closer to delivery, the tighter the prediction."
    },

    /* Closer */
    'index.closer.kicker': {
      zh: 'End of tour · 你看完了',
      en: 'End of tour · You’ve reached the end'
    },
    'index.closer.title': {
      zh: 'AI <em>在执行</em>，<br/>人 <em>在 frame 与判断</em><span class="period">.</span>',
      en: 'AI <em>executes</em>,<br/>humans <em>frame and decide</em><span class="period">.</span>'
    },
    'index.closer.en': {
      zh: 'Stop assisting. Start operating.',
      en: 'Stop assisting. Start operating.'
    },
    'index.closer.cta_aria': { zh: '下一步', en: 'Next step' },
    'index.closer.cta_case': {
      zh: '看一次真实生产事故的复盘 <span aria-hidden="true">→</span>',
      en: 'Read a real production incident retro <span aria-hidden="true">→</span>'
    },
    'index.closer.cta_skill': {
      zh: '把这套方法装成 Skill <span aria-hidden="true">→</span>',
      en: 'Install this as a Skill <span aria-hidden="true">→</span>'
    },
    'index.closer.cta_talk': {
      zh: '聊一聊 <span aria-hidden="true">→</span>',
      en: 'Let’s talk <span aria-hidden="true">→</span>'
    },

    'index.foot.jump_kicker': { zh: 'Blog', en: 'Blog' },
    'index.foot.jump_text': {
      zh: '滑到底后，再向下滑动两下',
      en: 'After you hit the bottom, scroll once more'
    },

    /* ── blog.html ────────────────────────────────────────────────── */
    'blog.title': {
      zh: 'GitHire Blog · Real cases from AI-native teams',
      en: 'GitHire Blog · Real cases from AI-native teams'
    },
    'blog.meta.description': {
      zh: 'GitHire Blog 把每一篇都写成真实事件复盘:真实的 prompt、真实的 diff、真实的事故,沿着六步 workflow 走一遍。',
      en: 'GitHire Blog reads every post as a real incident retro — real prompt, real diff, real fallout — walked through the six-step workflow.'
    },
    'blog.og.description': {
      zh: '每一篇都是一次真实事件:真实的 prompt、真实的 diff、真实的修复链。围着六步 workflow 走读。',
      en: 'Every post is a real incident — real prompt, real diff, real fix chain — read alongside the six-step workflow.'
    },
    'blog.og.image_alt': {
      zh: 'GitHire · 人思考、AI 执行、人验收',
      en: 'GitHire · Humans think, AI executes, humans verify'
    },

    'blog.hero.kicker': {
      zh: 'Blog · operating log from AI-native teams',
      en: 'Blog · operating log from AI-native teams'
    },
    'blog.hero.title': {
      zh: '真实事故，真实复盘，<br/><em>沿着 workflow 一次走完<span class="period">.</span></em>',
      en: 'Real incidents, real retros,<br/><em>walked end-to-end through the workflow<span class="period">.</span></em>'
    },
    'blog.hero.lede': {
      zh: '这里没有教程，只有事件。每一篇都是一次真实事件 —— 真实的 prompt、真实的 diff、真实的修复链 —— 围着六步 workflow 走读，看每一步在理想中应该是什么样，在事故里又实际是什么样。',
      en: 'No tutorials here, only events. Every post is a real incident — real prompt, real diff, real fix chain — read alongside the six-step workflow: what each step is meant to be, versus what it actually was on the day.'
    },

    'blog.case.aria': { zh: 'Cases', en: 'Cases' },
    'blog.case01.num': { zh: 'CASE 01', en: 'CASE 01' },
    'blog.case01.meta': {
      zh: '2026-05-14 · 22 行代码 · 25 小时根治',
      en: '2026-05-14 · 22 lines of code · 25 hours to fully fix'
    },
    'blog.case01.title': {
      zh: '22 行 SCAN，<em>打爆生产 Redis</em><span class="period">.</span>',
      en: '22 lines of SCAN, <em>and production Redis went down</em><span class="period">.</span>'
    },
    'blog.case01.desc': {
      zh: 'Codex 5 分钟写出的代码，20 分钟后被 commit，当晚 23:54 上线即事故。沿六步 workflow 复盘 —— 哪一步被跳过，事故就在哪一步埋下。',
      en: 'Codex wrote it in 5 minutes; it was committed 20 minutes later; the incident started at 23:54 the same night. Walked back through the six steps — every step skipped is a step where the incident is buried.'
    },
    'blog.case01.tag1': { zh: 'Codex CLI', en: 'Codex CLI' },
    'blog.case01.tag2': { zh: 'Redis SCAN', en: 'Redis SCAN' },
    'blog.case01.tag3': { zh: 'Architect skipped', en: 'Architect skipped' },
    'blog.case01.tag4': { zh: 'Prompt rewrite', en: 'Prompt rewrite' },
    'blog.case01.cta': {
      zh: '读这一案 <span aria-hidden="true">→</span>',
      en: 'Read this case <span aria-hidden="true">→</span>'
    },
    'blog.case_pending.num2': { zh: 'CASE 02', en: 'CASE 02' },
    'blog.case_pending.num3': { zh: 'CASE 03', en: 'CASE 03' },
    'blog.case_pending.title': {
      zh: '近期上架 · coming soon',
      en: 'Coming soon'
    },

    'blog.foot': {
      zh: '想看完整方法？<a href="index.html#workflow">六步 workflow ↗</a><span class="sep">·</span>想直接装上 Skill？<a href="skill.html">从 realRoc/skills ↗</a><span class="sep">·</span>想玩一遍？<a href="game.html">HireRPG game ↗</a>',
      en: 'Want the full method? <a href="index.html#workflow">Six-step workflow ↗</a><span class="sep">·</span>Want to install the Skill? <a href="skill.html">From realRoc/skills ↗</a><span class="sep">·</span>Prefer to play it? <a href="game.html">HireRPG game ↗</a>'
    },

    /* ── skill.html ──────────────────────────────────────────────── */
    'skill.title': {
      zh: 'GitHire Skill · Install from realRoc/skills',
      en: 'GitHire Skill · Install from realRoc/skills'
    },
    'skill.meta.description': {
      zh: 'Install GitHire and the matching Prompt Spec from realRoc/skills — the canonical home for AI-native engineering skills used across the GitHire method.',
      en: 'Install GitHire and the matching Prompt Spec from realRoc/skills — the canonical home for AI-native engineering skills used across the GitHire method.'
    },
    'skill.og.description': {
      zh: 'Install the GitHire Skill and Prompt Spec from realRoc/skills — the canonical AI-native skills home.',
      en: 'Install the GitHire Skill and Prompt Spec from realRoc/skills — the canonical AI-native skills home.'
    },
    'skill.og.image_alt': {
      zh: 'GitHire · 人思考、AI 执行、人验收',
      en: 'GitHire · Humans think, AI executes, humans verify'
    },

    'skill.hero.kicker': {
      zh: 'Skills · canonical home · realRoc/skills',
      en: 'Skills · canonical home · realRoc/skills'
    },
    'skill.hero.title': {
      zh: 'Install GitHire<br/><em>from realRoc/skills.</em>',
      en: 'Install GitHire<br/><em>from realRoc/skills.</em>'
    },
    'skill.hero.lede': {
      zh: 'GitHire 的 Skill 和配套的 <em>Prompt Spec</em> 都住在 <a href="https://github.com/realRoc/skills" target="_blank" rel="noopener">github.com/realRoc/skills</a>——这是 AI-native 方法论的统一发布源。<br/>\n          网站本身只是方法的展示与 case 来源；可装的能力一律从这个仓库安装。',
      en: 'GitHire and its companion <em>Prompt Spec</em> both live in <a href="https://github.com/realRoc/skills" target="_blank" rel="noopener">github.com/realRoc/skills</a> — the single publication source for this AI-native method.<br/>\n          The website is the prose; installable capabilities all come from that repo.'
    },

    'skill.panel.aria': { zh: 'GitHire Skill install command', en: 'GitHire Skill install command' },
    'skill.panel.kicker': { zh: 'Install · 全部 skills', en: 'Install · all skills' },
    'skill.panel.copy_aria': { zh: '复制安装命令', en: 'Copy install command' },
    'skill.panel.copy_label': { zh: 'Copy', en: 'Copy' },
    'skill.panel.note': {
      zh: '一次安装 realRoc/skills 下的所有 skill。也可以只装 GitHire：\n            <code class="skill-inline">npx skills add realRoc/skills --skill githire</code>。<br/>\n            想看完整目录与 README，去 <a href="https://github.com/realRoc/skills" target="_blank" rel="noopener">github.com/realRoc/skills</a>。',
      en: 'Installs every skill under realRoc/skills at once. To install GitHire alone: \n            <code class="skill-inline">npx skills add realRoc/skills --skill githire</code>.<br/>\n            For the full catalog and README, see <a href="https://github.com/realRoc/skills" target="_blank" rel="noopener">github.com/realRoc/skills</a>.'
    },

    'skill.li1': {
      zh: '<span>01</span><strong>GitHire</strong>：把 issue-first 六步 workflow 装进 agent，让它在 framing、AI review、架构师评审、上线归档这些节点知道该做什么。',
      en: '<span>01</span><strong>GitHire</strong>: installs the issue-first six-step workflow into an agent so it knows what to do at framing, AI review, architect review, and ship-archive checkpoints.'
    },
    'skill.li2': {
      zh: '<span>02</span><strong>Prompt Spec</strong>：Goal / Constraints / Non-goals / Verification / Architecture notes / Existing context 六段式 issue 模板，配合 GitHire 使用。<a href="case-redis-scan.html#rewrite-title">看 case 里的 BAD vs GOOD 对照 ↗</a>',
      en: '<span>02</span><strong>Prompt Spec</strong>: the six-section Issue template — Goal / Constraints / Non-goals / Verification / Architecture notes / Existing context — paired with GitHire. <a href="case-redis-scan.html#rewrite-title">See the BAD vs GOOD comparison in the case ↗</a>'
    },
    'skill.li3': {
      zh: '<span>03</span>用法：读首页拿当前方法 → 用 Skill 在真实工程里 frame issue / 起 PR / 走六步评审 → case 页随时引用真实事故复盘。',
      en: '<span>03</span>Use it: read the homepage for the current method → use the Skill to frame Issues / open PRs / run the six-step review in real projects → reference the case page for real incident retros at any time.'
    },

    'skill.foot.repo': {
      zh: '打开 realRoc/skills 仓库 ↗',
      en: 'Open the realRoc/skills repo ↗'
    },
    'skill.foot.case': {
      zh: '看一个真实 case',
      en: 'Read a real case'
    },
    'skill.foot.workflow': {
      zh: '回到 workflow',
      en: 'Back to the workflow'
    },

    /* ── case-redis-scan.html ────────────────────────────────────── */
    'case.title': {
      zh: 'GitHire Case 01 · 从一条 prompt 到生产事故，20 分钟',
      en: 'GitHire Case 01 · From one prompt to a production incident in 20 minutes'
    },
    'case.meta.description': {
      zh: '一次真实的线上事故复盘：22 行 AI 自动生成的 Redis SCAN + pipeline HGETALL 代码，沿着 GitHire 的六步 workflow 走一遍，看在哪一步坠落。',
      en: 'A retro of a real production incident: 22 lines of AI-generated Redis SCAN + pipeline HGETALL, walked through the six-step GitHire workflow to find the step where it fell.'
    },
    'case.og.description': {
      zh: '22 行 AI 自动生成的 SCAN+HGETALL 把生产 Redis 打爆。沿 6 步 workflow 复盘 prompt、commit、事故、修复、重写。',
      en: '22 lines of AI-generated SCAN+HGETALL crashed production Redis. Walk the 6-step workflow back through prompt, commit, incident, fix, rewrite.'
    },
    'case.og.image_alt': {
      zh: 'GitHire Case 01 · 22 行 SCAN，20 分钟到事故 · 时间线 10:19 prompt → 23:54 503',
      en: 'GitHire Case 01 · 22 lines of SCAN, 20 minutes to incident · timeline 10:19 prompt → 23:54 503'
    },

    'case.hero.kicker': {
      zh: 'Case 01 · Real production incident · <time datetime="2026-05-18">2026-05</time>',
      en: 'Case 01 · Real production incident · <time datetime="2026-05-18">2026-05</time>'
    },
    'case.hero.title': {
      zh: '从一条 <em>prompt</em><br/>\n          到生产事故，<br/>\n          只用了 <em>20 分钟</em><span class="period">.</span>',
      en: 'From one <em>prompt</em><br/>\n          to a production incident,<br/>\n          in just <em>20 minutes</em><span class="period">.</span>'
    },
    'case.hero.lede': {
      zh: '一段 22 行的代码，由 AI 自动写出、通过本地测试、合入主干、部署上线，把生产 Redis 打到 503。\n          这是一次真实事故的复盘，沿着 GitHire 的六步 workflow 走一遍，看哪一步没被认真对待——\n          事故就在哪一步埋下。',
      en: '22 lines of code, written by AI, passing local tests, merged to main, deployed to production — and pushing Redis to 503.\n          This is a retro of that real incident, walked along the GitHire six-step workflow to find which step was skipped —\n          and that is the step where the incident was buried.'
    },

    'case.tl.aria': { zh: '事故时间线', en: 'Incident timeline' },
    'case.tl.t1_e': { zh: '用户发出 prompt',         en: 'User submits the prompt' },
    'case.tl.t2_e': { zh: 'AI 写出 SCAN+HGETALL',    en: 'AI writes SCAN+HGETALL' },
    'case.tl.t3_e': { zh: 'commit · 进入 PR',         en: 'Commit · opens PR' },
    'case.tl.t4_e': { zh: 'PR 合并 · 部署',          en: 'PR merged · deployed' },
    'case.tl.t5_e': { zh: '生产事故 · 第一次救火',     en: 'Production incident · first firefight' },
    'case.tl.t6_t': { zh: '+1d 11:34',               en: '+1d 11:34' },
    'case.tl.t6_e': { zh: 'Redis SET 彻底替代',       en: 'Redis SET fully replaces SCAN' },

    'case.hero.meta': {
      zh: '<span>事故代码：22 行</span>\n          <span>· 救火 commit：5 次</span>\n          <span>· 真正根治用时：25 小时</span>',
      en: '<span>Incident code: 22 lines</span>\n          <span>· Firefight commits: 5</span>\n          <span>· Time to full fix: 25 hours</span>'
    },

    'case.method.kicker': { zh: 'Why the workflow exists · 方法论', en: 'Why the workflow exists · Method' },
    'case.method.title': {
      zh: 'AI 写代码的速度，<br/>\n          已经远快于人类 <em>review</em> 的速度<span class="period">.</span>',
      en: 'The speed at which AI writes code<br/>\n          has long outrun the speed humans <em>review</em> it<span class="period">.</span>'
    },
    'case.method.p1': {
      zh: '过去的工程范式默认"人在写代码，AI 是辅助"，所以 review 是顺序里最后一步——\n            人写完 → 测试 → review。这条线在 AI-native 时代被反过来了：\n            <em>AI 在写，人在审；人在 frame，AI 在执行</em>。',
      en: "The old engineering paradigm assumed 'humans write code, AI assists,' so review was the last step in the sequence —\n            humans write → tests → review. In the AI-native era that line is reversed:\n            <em>AI writes, humans review; humans frame, AI executes</em>."
    },
    'case.method.p2': {
      zh: '<strong>六步 workflow 不是给 AI 装护栏，是给人类留决策点。</strong>\n            Issue 是 framing 的决策点；架构师评审是方向的决策点；\n            sandbox 与 AI review 是两次"还来得及反悔"的决策点。\n            一旦哪个决策点形同虚设，AI 的速度就会变成事故的速度。',
      en: "<strong>The six-step workflow is not guardrails for AI — it is decision points for humans.</strong>\n            The Issue is the framing decision; architect review is the direction decision;\n            sandbox and AI review are two more 'still time to back out' decisions.\n            The moment a decision point becomes ceremonial, AI's speed turns into the speed of incidents."
    },
    'case.method.hint': {
      zh: '下面这个 case，会沿着六步走读：<br/>\n          <em>每一步在理想中应该是什么样，在这次事故里又实际是什么样。</em>',
      en: 'The case below is walked through all six steps:<br/>\n          <em>what each step should be in the ideal, versus what it actually was on the day.</em>'
    },
    'case.method.cta': {
      zh: '先看完整 workflow ↗',
      en: 'See the full workflow first ↗'
    },

    /* Step 01 */
    'case.s01.counter': { zh: '<span>STEP 01</span> ／ 06 · ISSUE', en: '<span>STEP 01</span> ／ 06 · ISSUE' },
    'case.s01.title': {
      zh: '理想：<em>把"为谁解决什么"写清楚</em><br/>\n            实际：<em>一条聊天框 prompt</em><span class="period">.</span>',
      en: "Ideal: <em>spell out 'whom you are solving what for'</em><br/>\n            Actual: <em>one line in a chat box</em><span class=\"period\">.</span>"
    },
    'case.s01.prompt_caption': {
      zh: 'Real prompt · 2026-05-14 10:19 +0800 · Codex CLI · gpt-5.5',
      en: 'Real prompt · 2026-05-14 10:19 +0800 · Codex CLI · gpt-5.5'
    },
    'case.s01.prompt': {
      zh: '<p>当前这个国产模型的判断走的是前缀匹配。我想把它做成 model detail 里面的字段，我记得原本就有一个 <code>made_in_china</code> 的字段。</p>\n              <p>我们要把这个字段利用起来，使其更加灵活、可配置。此外，在做 CI 的时候，需要针对国内站和国际站分别做 search 检查，确保：</p>\n              <ol>\n                <li>国内站：对应的 search 接口只返回所有 made_in_china 的模型。</li>\n                <li>国际站：不作限制，正常返回。</li>\n              </ol>\n              <p>建议在 smoke test 那边增加这样一个 E2E 的 CI 流程小步骤进行测试。</p>',
      en: '<p>Right now the domestic-model check is done by prefix matching. I want to turn it into a field on model detail — I think there was already a <code>made_in_china</code> field.</p>\n              <p>We should use that field and make it more flexible and configurable. In CI we should also run search checks separately for the China site and the global site, to make sure:</p>\n              <ol>\n                <li>China site: the corresponding search endpoint only returns models that are made_in_china.</li>\n                <li>Global site: no restriction, returns normally.</li>\n              </ol>\n              <p>It is suggested to add a small E2E step in smoke tests to cover this.</p>'
    },
    'case.s01.note_kicker': {
      zh: '这条 prompt 在 AI 眼里是张空白支票',
      en: "From the AI's point of view this prompt is a blank check"
    },
    'case.s01.miss1': {
      zh: '<strong>没说调用频率：</strong>不知道这个判定是 startup 一次、每请求一次，还是后台定时。',
      en: '<strong>No call frequency:</strong> is this check run once on startup, once per request, or by a background job?'
    },
    'case.s01.miss2': {
      zh: '<strong>没说数据规模：</strong>不知道有多少个 <code>model_detail::*</code>，也没说会涨到多少。',
      en: '<strong>No data scale:</strong> how many <code>model_detail::*</code> exist today, and how large will it grow?'
    },
    'case.s01.miss3': {
      zh: '<strong>没说非目标：</strong>没有"不要全量扫"、"不要每次请求都打 Redis"。',
      en: '<strong>No non-goals:</strong> nothing says "don\'t scan the whole keyspace" or "don\'t hit Redis on every request".'
    },
    'case.s01.miss4': {
      zh: '<strong>没说验证口径：</strong>"能通过 smoke" 是不够的——smoke 不测线上 QPS。',
      en: '<strong>No verification standard:</strong> "smoke passes" is not enough — smoke does not test live QPS.'
    },
    'case.s01.note_tail': {
      zh: '<em>需求里的每一处空白，都是 AI 自由发挥的空间</em>——这不是 AI 的问题，是 issue framing 的问题。',
      en: '<em>Every blank in the spec is room for the AI to freelance.</em> That is not an AI problem — it is an issue-framing problem.'
    },

    /* Step 02 */
    'case.s02.counter': { zh: '<span>STEP 02</span> ／ 06 · SANDBOX', en: '<span>STEP 02</span> ／ 06 · SANDBOX' },
    'case.s02.title': {
      zh: '理想：<em>长期沙盒，带真实数据</em><br/>\n            实际：<em>本地仓库，pytest 全绿</em><span class="period">.</span>',
      en: 'Ideal: <em>a long-running sandbox with real data</em><br/>\n            Actual: <em>local repo, pytest all green</em><span class="period">.</span>'
    },
    'case.s02.p1': {
      zh: 'Codex 在本地仓库直接修改文件、跑 <code>pytest tests/test_site_mode.py -q</code>，\n            103 个用例全通过。\n            <em>但 pytest 用的是 fakeredis 或 in-memory mock，里面只有几条测试数据</em>。\n            真实生产环境里 <code>model_detail::*</code> 有几十到上百个 key，\n            而且 <code>/api/site/config</code> 在前端启动时每个用户都会打一次。',
      en: "Codex edits files in the local repo and runs <code>pytest tests/test_site_mode.py -q</code>;\n            103 test cases all pass.\n            <em>But pytest is wired to fakeredis or an in-memory mock with only a handful of test rows.</em>\n            In real production <code>model_detail::*</code> has dozens to hundreds of keys,\n            and every user pings <code>/api/site/config</code> at front-end startup."
    },
    'case.s02.p2': {
      zh: '<strong>沙盒的价值，不在于"环境能跑"，在于"环境像生产"。</strong>\n            缺数据规模、缺 QPS 量级、缺并发——这三样缺一个，AI 写出的实现就可能在量级跳变时塌掉。',
      en: '<strong>The value of a sandbox is not "the environment runs"; it is "the environment looks like production".</strong>\n            Missing data scale, missing QPS, missing concurrency — drop one, and the implementation AI writes can fall over when the magnitude jumps.'
    },

    /* Step 03 */
    'case.s03.counter': { zh: '<span>STEP 03</span> ／ 06 · EXECUTE', en: '<span>STEP 03</span> ／ 06 · EXECUTE' },
    'case.s03.title': {
      zh: '理想：<em>AI 在沙盒里完成实现</em><br/>\n            实际：<em>5 分钟后，22 行 patch 出炉</em><span class="period">.</span>',
      en: 'Ideal: <em>AI completes the implementation inside the sandbox</em><br/>\n            Actual: <em>five minutes in, 22 lines of patch are out</em><span class="period">.</span>'
    },
    'case.s03.code_caption': {
      zh: 'wowchat/site_config.py · 由 AI 生成 · 10:24:27',
      en: 'wowchat/site_config.py · generated by AI · 10:24:27'
    },
    'case.s03.code_comment': {
      zh: '# ← 每次请求都跑一遍',
      en: '# ← runs on every request'
    },
    'case.s03.note_kicker': {
      zh: '三处隐患 · AI 自己挑的实现路径',
      en: "Three smells — the path AI chose for itself"
    },
    'case.s03.miss1': {
      zh: '<strong>SCAN 全量 <code>model_detail::*</code></strong><br/>\n                没有 index、没有专门的 set，每次都得遍历整张表的 keyspace。',
      en: '<strong>SCAN across the whole <code>model_detail::*</code></strong><br/>\n                No index, no dedicated set — every call walks the entire keyspace.'
    },
    'case.s03.miss2': {
      zh: '<strong>pipeline 里塞 N 个 HGETALL</strong><br/>\n                单次 pipeline 看起来"高效"，但 N 个 HGETALL 把网络往返省了，CPU 没省。',
      en: '<strong>N HGETALLs stuffed into one pipeline</strong><br/>\n                A single pipeline looks "efficient", but N HGETALLs save round-trips, not CPU.'
    },
    'case.s03.miss3': {
      zh: '<strong>放在 <code>/api/site/config</code> 这个高频端点上</strong><br/>\n                这是前端启动就打的接口，QPS 跟在线用户数挂钩。',
      en: '<strong>Mounted on <code>/api/site/config</code> — a high-frequency endpoint</strong><br/>\n                Every front-end startup hits this; its QPS tracks the number of online users.'
    },
    'case.s03.note_tail': {
      zh: '单看这段代码，<em>它在功能上完全正确</em>。\n              它会出事，是因为没人告诉 AI"调用频率"和"数据规模"。',
      en: 'Read in isolation, <em>this code is functionally correct</em>.\n              It blows up because no one told the AI about "call frequency" or "data scale".'
    },

    /* Step 04 */
    'case.s04.counter': { zh: '<span>STEP 04</span> ／ 06 · AI REVIEW', en: '<span>STEP 04</span> ／ 06 · AI REVIEW' },
    'case.s04.title': {
      zh: '理想：<em>另一位 AI 读一遍 PR</em><br/>\n            实际：<em>这一步没发生</em><span class="period">.</span>',
      en: 'Ideal: <em>a second AI reads the PR</em><br/>\n            Actual: <em>this step did not happen</em><span class="period">.</span>'
    },
    'case.s04.p1': {
      zh: '从 prompt 到 commit，整个流程在同一个 Codex session 里走完，\n            没有第二个 agent 读过这个 diff。\n            <em>本地测试通过</em>就成了唯一的"通过"信号。',
      en: 'From prompt to commit, the whole loop ran inside one Codex session;\n            no second agent ever read the diff.\n            <em>Local tests passing</em> became the only "go" signal.'
    },
    'case.s04.p2': {
      zh: '如果当时有一个独立 review agent，给它的 system prompt 里写一句\n            <em>"Flag any new Redis SCAN / KEYS / HGETALL across full keyspace in request-path code"</em>，\n            这次事故大概率就在这一步被拦下。',
      en: 'If there had been an independent review agent with a system prompt that included\n            <em>"Flag any new Redis SCAN / KEYS / HGETALL across full keyspace in request-path code"</em>,\n            this incident would most likely have been caught right here.'
    },
    'case.s04.callout_kicker': { zh: 'AI review 的本质', en: 'What AI review really is' },
    'case.s04.callout': {
      zh: '不是"再跑一遍测试"，而是<em>用另一组先验</em>看同一段代码——\n            review agent 该懂的是性能模式、安全模式、可维护性模式，\n            和生成 agent 互补，不重叠。',
      en: 'Not "re-run the tests" — but <em>reading the same code with a different set of priors</em>.\n            A review agent is meant to know performance patterns, security patterns, maintainability patterns,\n            complementary to the generating agent, not overlapping.'
    },

    /* Step 05 */
    'case.s05.counter': {
      zh: '<span>STEP 05</span> ／ 06 · ARCHITECT <em>· 关键一步</em>',
      en: '<span>STEP 05</span> ／ 06 · ARCHITECT <em>· the key step</em>'
    },
    'case.s05.title': {
      zh: '理想：<em>人类架构师判断方向</em><br/>\n            实际：<em>这一步被跳过了</em><span class="period">.</span>',
      en: 'Ideal: <em>a human architect calls the direction</em><br/>\n            Actual: <em>this step was skipped</em><span class="period">.</span>'
    },
    'case.s05.p1': {
      zh: '从 prompt 到 commit，<em>总共 20 分钟</em>。<br/>\n            没有任何一刻，让一个懂这个系统的人看一眼：\n            "每次 /api/site/config 都 scan 全量 model_detail::*，意味着什么？"',
      en: 'From prompt to commit, <em>20 minutes total</em>.<br/>\n            At no point did someone who knows the system look up and ask:\n            "Every <code>/api/site/config</code> call scans all of <code>model_detail::*</code> — what does that mean?"'
    },
    'case.s05.arch_kicker_q': { zh: '架构师应该问的问题', en: 'Questions the architect should have asked' },
    'case.s05.arch_q1': { zh: '这个 endpoint 每分钟会被调用多少次？', en: 'How many calls per minute does this endpoint take?' },
    'case.s05.arch_q2': { zh: '<code>model_detail::*</code> 的 key 数量当前多少？预计涨到多少？', en: 'How many <code>model_detail::*</code> keys today? Projected to how many?' },
    'case.s05.arch_q3': { zh: '能不能维护一个 set，把"国产模型 id"显式存起来，避免运行时扫描？', en: 'Could we maintain a set of "domestic model ids" explicitly and avoid runtime scanning?' },
    'case.s05.arch_q4': { zh: '这次改动是 hot path 还是 cold path？是不是该走 cache？', en: 'Is this change on a hot or cold path? Should it go through a cache?' },
    'case.s05.arch_q5': { zh: '如果 Redis 抖动 / 慢，这个调用会不会把上游 API 拖垮？', en: 'If Redis jitters or slows, will this call drag the upstream API down with it?' },
    'case.s05.arch_kicker_why': { zh: '为什么这些问题 AI 不会自己问', en: 'Why AI won’t ask these on its own' },
    'case.s05.arch_why1': {
      zh: 'AI 看到的是<em>当前仓库的代码上下文</em>，看不到生产 QPS、\n                看不到 Redis 容量曲线、看不到团队历史上踩过哪些坑。\n                <em>这些是架构师才有的"系统侧上下文"</em>，\n                也是为什么这一步必须是人。',
      en: 'AI sees <em>the code context of the current repo</em> — it does not see production QPS,\n                it does not see Redis capacity curves, it does not see the pits this team has already fallen into.\n                <em>That is the "system-side context" only an architect has,</em>\n                which is exactly why this step has to be a human.'
    },
    'case.s05.arch_why2': {
      zh: 'AI 能在 5 分钟写出正确实现；架构师只需要 30 秒就能识别"不该用这个路径"。\n                <strong>这 30 秒，就是工作流里最贵的一段时间。</strong>',
      en: 'AI can write a correct implementation in 5 minutes; an architect only needs 30 seconds to recognise "wrong path".\n                <strong>Those 30 seconds are the most expensive time in the whole workflow.</strong>'
    },

    /* Step 06 */
    'case.s06.counter': { zh: '<span>STEP 06</span> ／ 06 · PRODUCTION', en: '<span>STEP 06</span> ／ 06 · PRODUCTION' },
    'case.s06.title': {
      zh: '理想：<em>合入主干，平稳上线</em><br/>\n            实际：<em>当晚 23:54，生产报警</em><span class="period">.</span>',
      en: 'Ideal: <em>merge to main, ship cleanly</em><br/>\n            Actual: <em>23:54 that night, production alerted</em><span class="period">.</span>'
    },
    'case.s06.p1': {
      zh: '部署后约两小时，监控开始报：<code>/api/site/config</code> p99 飙到秒级，\n            Redis 慢日志被 <code>SCAN</code> + 大量 <code>HGETALL</code> 塞满，\n            CPU 占用打高，连带其他依赖 Redis 的接口一起被拖慢。\n            <em>首屏阻塞、新用户进不来。</em>',
      en: 'About two hours after deploy, monitors started firing: <code>/api/site/config</code> p99 jumped into seconds,\n            Redis slow logs filled with <code>SCAN</code> and a flood of <code>HGETALL</code>,\n            CPU pinned, and every other Redis-backed endpoint was dragged down too.\n            <em>First paint stalled; new users could not get in.</em>'
    },
    'case.s06.p2': {
      zh: '上线那一刻，<em>没人觉得这次有问题</em>——\n            CI 全绿、PR 描述清楚、AI 写的代码看起来"工整"。\n            事故的特征就是：它在所有传统门禁里都看起来合规。',
      en: 'At the moment of ship, <em>no one thought anything was wrong</em> —\n            CI was all green, the PR description was clear, the AI-written code "looked tidy".\n            That is the signature of this kind of incident: it passes every traditional gate.'
    },

    /* Fix chain */
    'case.fix.kicker': { zh: '救火链 · 5 个 commit · 25 小时', en: 'Fix chain · 5 commits · 25 hours' },
    'case.fix.title': {
      zh: '救火链没有<em>一击即中</em>，<br/>\n          是一连串 <em>不够根治</em> 的尝试<span class="period">.</span>',
      en: 'No single shot lands the fix —<br/>\n          it is a chain of <em>not-quite-cures</em><span class="period">.</span>'
    },
    'case.fix.t1.time': { zh: '事故 +5 分钟', en: 'Incident +5 min' },
    'case.fix.t1.h':    { zh: 'Cache 结果 + 把 SCAN 挪到 threadpool', en: 'Cache the result + move SCAN to a threadpool' },
    'case.fix.t1.p':    {
      zh: '第一反应：让 SCAN 不要堵主线程。<em>问题被推后，没解决</em>——cache 失效那一刻还是会打满。',
      en: 'First reflex: keep SCAN off the main thread. <em>The problem is postponed, not solved</em> — the moment the cache expires, things spike again.'
    },
    'case.fix.t2.time': { zh: '+30 分钟', en: '+30 min' },
    'case.fix.t2.h':    { zh: '改成 in-memory cache + 60s 后台刷新', en: 'Switch to in-memory cache + 60s background refresh' },
    'case.fix.t2.p':    {
      zh: '把 SCAN 从"每次请求"降到"每分钟"。<em>事故面积变小</em>，但启动期还是会一次性扫满。',
      en: 'SCAN drops from "every request" to "every minute". <em>Blast radius shrinks</em>, but startup still slams it.'
    },
    'case.fix.t3.time': { zh: '+90 分钟', en: '+90 min' },
    'case.fix.t3.h':    { zh: 'Drop 后台刷新 · 改成 startup-only warmup', en: 'Drop background refresh · startup-only warmup' },
    'case.fix.t3.p':    {
      zh: '承认在线刷新有风险，退回到只在启动时扫一次。<em>但服务每次重启时还是要承压</em>。',
      en: 'Concede that online refresh is risky; retreat to scanning once at startup. <em>But every restart still takes the hit.</em>'
    },
    'case.fix.t4.time': { zh: '+6 小时', en: '+6 hours' },
    'case.fix.t4.h':    { zh: 'Restore handler · 调好 caching contract', en: 'Restore the handler · fix the caching contract' },
    'case.fix.t4.p':    {
      zh: '把 endpoint 行为修对，确保 fallback 不会引入新 bug。',
      en: 'Fix the endpoint behaviour so the fallback path does not introduce new bugs.'
    },
    'case.fix.t5.time': { zh: '+25 小时', en: '+25 hours' },
    'case.fix.t5.h':    { zh: '用 Redis <em>SET</em> 维护 domestic ids', en: 'Maintain domestic ids in a Redis <em>SET</em>' },
    'case.fix.t5.p':    {
      zh: '<em>这才是根治</em>：模型上下线时显式写入一个 set，\n              读取时直接 <code>SMEMBERS</code>，从 O(N) 扫描降到 O(1) 查询。\n              SCAN 这条路径在生产代码里彻底消失。',
      en: '<em>This is the cure</em>: write into an explicit set when models go up or down,\n              and read with <code>SMEMBERS</code> — dropping from an O(N) scan to an O(1) lookup.\n              The SCAN path is removed from production code entirely.'
    },
    'case.fix.tail': {
      zh: '每一步救火都"看起来更好了一点"，但根治用了 25 小时。\n          <em>如果架构师在 step 05 多花 30 秒，这 25 小时就不会发生。</em>',
      en: 'Each firefight "looked a little better than the last," but the full cure took 25 hours.\n          <em>Thirty extra seconds from the architect at Step 05 would have erased these 25 hours.</em>'
    },

    /* Rewrite */
    'case.rew.kicker': { zh: 'Rewrite · 同一条需求', en: 'Rewrite · same spec' },
    'case.rew.title': {
      zh: '一条 architect-readable 的 <em>issue</em>，<br/>\n          长成什么样<span class="period">.</span>',
      en: 'What an architect-readable <em>Issue</em><br/>\n          actually looks like<span class="period">.</span>'
    },
    'case.rew.bad_meta': { zh: '原 prompt · 缺四样东西', en: 'Original prompt · four things missing' },
    'case.rew.bad_label': { zh: 'BAD', en: 'BAD' },
    'case.rew.bad_text': {
      zh: '<p>当前这个国产模型的判断走的是前缀匹配。我想把它做成 model detail 里面的字段……</p>\n              <p>需要针对国内站和国际站分别做 search 检查……</p>\n              <p>建议在 smoke test 那边增加 E2E 测试。</p>',
      en: '<p>Right now the domestic-model check is done by prefix matching. I want to turn it into a field on model detail…</p>\n              <p>Run search checks separately for the China site and the global site…</p>\n              <p>Suggest adding an E2E step in smoke tests.</p>'
    },
    'case.rew.bad_tag1': { zh: '✗ Constraints',        en: '✗ Constraints' },
    'case.rew.bad_tag2': { zh: '✗ Non-goals',          en: '✗ Non-goals' },
    'case.rew.bad_tag3': { zh: '✗ Verification',       en: '✗ Verification' },
    'case.rew.bad_tag4': { zh: '✗ Architecture notes', en: '✗ Architecture notes' },

    'case.rew.good_meta': { zh: '同一需求 · 重写', en: 'Same spec · rewritten' },
    'case.rew.good_label': { zh: 'GOOD', en: 'GOOD' },
    'case.rew.good_text': {
      zh: '<p><strong>Goal</strong>　把"国产模型"判定从 engine 前缀改成 model_detail.made_in_china 字段，让上下线只需改一个字段。</p>\n              <p><strong>Constraints</strong>　<em>/api/site/config 是高频接口，前端启动时每个用户都会打。</em>不允许每次请求扫 Redis keyspace。model_detail 当前 ~80 条，可能涨到 ~500。</p>\n              <p><strong>Non-goals</strong>　不要用 SCAN / KEYS 实现。不要在 request-path 里做 O(N) 计算。本次不改前端缓存策略。</p>\n              <p><strong>Architecture notes</strong>　建议显式维护一个 Redis SET（如 <code>domestic_model_ids</code>），模型上下线时写入；读路径 O(1)。</p>\n              <p><strong>Verification</strong>　国内站 search 只返回 made_in_china=1；国际站不变；线上 <code>/api/site/config</code> p99 不增。Smoke 新增 E2E 断言。</p>',
      en: '<p><strong>Goal</strong>　Move the "domestic model" check from engine-prefix matching to a <code>model_detail.made_in_china</code> field — so adding or removing a model is a one-field change.</p>\n              <p><strong>Constraints</strong>　<em><code>/api/site/config</code> is a high-frequency endpoint; every user hits it on front-end startup.</em> Scanning the Redis keyspace per request is not allowed. <code>model_detail</code> is ~80 entries today, projected to grow to ~500.</p>\n              <p><strong>Non-goals</strong>　Do not implement via SCAN / KEYS. Do not run O(N) work on the request path. This change does not touch the front-end cache strategy.</p>\n              <p><strong>Architecture notes</strong>　Maintain an explicit Redis SET (e.g. <code>domestic_model_ids</code>); write on add/remove; reads are O(1).</p>\n              <p><strong>Verification</strong>　China site search only returns <code>made_in_china=1</code>; global site unchanged; live <code>/api/site/config</code> p99 does not increase; smoke gets a new E2E assertion.</p>'
    },
    'case.rew.good_tag1': { zh: '✓ Constraints',        en: '✓ Constraints' },
    'case.rew.good_tag2': { zh: '✓ Non-goals',          en: '✓ Non-goals' },
    'case.rew.good_tag3': { zh: '✓ Verification',       en: '✓ Verification' },
    'case.rew.good_tag4': { zh: '✓ Architecture notes', en: '✓ Architecture notes' },

    'case.rew.tail': {
      zh: '右边这版多了 ~150 字。<em>这 150 字，能换 25 小时的救火 + 一段生产事故。</em>',
      en: 'The right-hand version is about 150 words longer. <em>Those 150 words buy back 25 hours of firefighting and one production incident.</em>'
    },
    'case.rew.cta': {
      zh: '把这套六段式 issue 模板装成 Prompt Spec Skill ↗',
      en: 'Install the six-section template as the Prompt Spec Skill ↗'
    },
    'case.rew.cta_note': {
      zh: '— 直接读 SKILL.md，或 <code>npx skills add realRoc/skills --skill prompt-spec</code>',
      en: '— Read SKILL.md directly, or <code>npx skills add realRoc/skills --skill prompt-spec</code>'
    },

    /* Lessons + Closer */
    'case.lessons.kicker': { zh: 'Takeaways', en: 'Takeaways' },
    'case.lessons.title': {
      zh: '这个 case 教会我们三件事<span class="period">.</span>',
      en: 'This case teaches three things<span class="period">.</span>'
    },
    'case.lessons.l1.h': { zh: 'AI coding 的速度，要求 review 前置。', en: 'AI coding speed forces review upstream.' },
    'case.lessons.l1.p': {
      zh: '从 prompt 到 prod-bound commit 只用了 20 分钟。等"PR review"再发现问题，已经晚了——\n              真正的 review 应该发生在 prompt 阶段，由 issue framing 完成。',
      en: 'From prompt to prod-bound commit took 20 minutes. By the time "PR review" sees the problem, it is already too late — the real review happens at the prompt stage, done by issue framing.'
    },
    'case.lessons.l2.h': { zh: '没有 constraints / non-goals 的 prompt，是空白支票。', en: 'A prompt without constraints / non-goals is a blank check.' },
    'case.lessons.l2.p': {
      zh: 'AI 不会自己问"调用频率多少"、"数据规模多大"。\n              这些数字必须由人塞进 issue。<em>需求里每一处空白，都是事故的入口。</em>',
      en: 'AI will not ask itself "what is the call frequency" or "how large is the data". Those numbers have to be put in the Issue by a human. <em>Every blank in the spec is an entry point for the next incident.</em>'
    },
    'case.lessons.l3.h': { zh: '架构师评审是工作流里最贵的 30 秒。', en: 'Architect review is the most expensive 30 seconds in the workflow.' },
    'case.lessons.l3.p': {
      zh: 'AI 写代码 5 分钟，架构师识别"不该用这个路径"30 秒。\n              这一步必须是人——因为只有人有"系统侧上下文"（QPS 曲线、历史事故、容量规划）。',
      en: 'AI writes code in 5 minutes; the architect needs 30 seconds to recognise "wrong path". This step has to be a human — only humans have the system-side context (QPS curves, past incidents, capacity plans).'
    },
    'case.cta.workflow': { zh: '回到完整 workflow',  en: 'Back to the full workflow' },
    'case.cta.skill':    { zh: '把这套方法装成 Skill', en: 'Install this method as a Skill' },
    'case.cta.repo':     { zh: 'realRoc/skills ↗',  en: 'realRoc/skills ↗' },

    'case.foot.tagline': {
      zh: '© <span id="year">2026</span> GitHire · Real cases from AI-native teams',
      en: '© <span id="year">2026</span> GitHire · Real cases from AI-native teams'
    }
  };

  // ── Synchronous best-effort initial language (runs before this script
  // is loaded — via the inline pre-paint snippet in each HTML file).
  // The runtime below trusts whatever <html data-lang> already says, then
  // may flip it after IP detection on first visit.

  function getStoredLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return (v === 'zh' || v === 'en') ? v : null;
    } catch (_) {
      return null;
    }
  }

  function setStoredLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
  }

  function getUrlLang() {
    try {
      var v = new URLSearchParams(location.search).get('lang');
      return (v === 'zh' || v === 'en') ? v : null;
    } catch (_) {
      return null;
    }
  }

  function currentLang() {
    var v = document.documentElement.getAttribute('data-lang');
    if (v === 'zh' || v === 'en') return v;
    return 'en';
  }

  // Normalize markup for comparison only: collapse insignificant whitespace
  // and drop the self-closing slash on void elements. The browser serializes
  // `<br/>` as `<br>`, so without this the dictionary source (which writes
  // `<br/>`) would never match the DOM and we'd re-render needlessly.
  function normMarkup(s) {
    return s.replace(/\s+/g, ' ').replace(/\s*\/>/g, '>').trim();
  }

  function applyTo(root, lang) {
    var els = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = el.getAttribute('data-i18n');
      var entry = T[key];
      if (!entry || typeof entry[lang] !== 'string') continue;
      // Skip the swap when the element already renders this exact markup.
      // The page ships in its own language, so on first load every value
      // already matches — re-setting innerHTML would needlessly reflow the
      // page and restart the hero's CSS entrance animation, making the
      // slogan visibly "jump" a second time. Comparison only; a mismatch
      // (a real language switch) still updates as before.
      if (normMarkup(el.innerHTML) === normMarkup(entry[lang])) continue;
      el.innerHTML = entry[lang];
    }

    var attrEls = root.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrEls.length; j++) {
      var ael = attrEls[j];
      var spec = ael.getAttribute('data-i18n-attr');
      var pairs = spec.split(',');
      for (var k = 0; k < pairs.length; k++) {
        var pair = pairs[k].trim();
        if (!pair) continue;
        var colon = pair.indexOf(':');
        if (colon < 0) continue;
        var attr = pair.slice(0, colon).trim();
        var pkey = pair.slice(colon + 1).trim();
        var pentry = T[pkey];
        if (!pentry || typeof pentry[lang] !== 'string') continue;
        ael.setAttribute(attr, pentry[lang]);
      }
    }
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0) lang = 'en';
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

    applyTo(document, lang);

    // Sync <title> from translated <title data-i18n="...">
    var titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      // title's textContent is the resolved value after innerHTML swap
      document.title = titleEl.textContent;
    }

    // Toggle the language switcher's pressed state.
    var btns = document.querySelectorAll('[data-lang-btn]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var pressed = b.getAttribute('data-lang-btn') === lang;
      b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      if (pressed) b.classList.add('is-active');
      else b.classList.remove('is-active');
    }

    // Restore the dynamic year (gets overwritten by innerHTML swap).
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // Compute the mirror URL for the target language. en pages live under
  // a /en/ path segment relative to the site root; zh pages live above it.
  // Preserves hash and all non-lang query params.
  function urlForLang(target) {
    var url = new URL(location.href);
    var segments = url.pathname.split('/');
    var enIdx = segments.indexOf('en');
    if (target === 'en') {
      if (enIdx < 0) segments.splice(segments.length - 1, 0, 'en');
    } else {
      if (enIdx >= 0) segments.splice(enIdx, 1);
    }
    url.pathname = segments.join('/');
    url.searchParams.delete('lang');
    return url.toString();
  }

  function bindSwitcher() {
    var btns = document.querySelectorAll('[data-lang-btn]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (ev) {
        var lang = ev.currentTarget.getAttribute('data-lang-btn');
        if (SUPPORTED.indexOf(lang) < 0) return;
        // Persist before navigation so the destination page reads
        // localStorage and skips re-detection.
        setStoredLang(lang);
        var target = urlForLang(lang);
        if (target !== location.href) {
          location.assign(target);
        } else {
          // Same URL (already on the right side) — just re-apply in place.
          applyLang(lang);
        }
      });
    }
  }

  // First-visit IP detection. Skipped if user already has a stored
  // preference, set ?lang= explicitly, or the URL itself signals language
  // (i.e. lives under /en/).
  function maybeDetectByIP() {
    if (getStoredLang() || getUrlLang()) return;
    if (location.pathname.split('/').indexOf('en') >= 0) return;

    var controller = (typeof AbortController === 'function') ? new AbortController() : null;
    var timeout = setTimeout(function () {
      if (controller) controller.abort();
    }, 1500);

    // referrerPolicy: 'no-referrer' so api.country.is never sees which page
    // referred the visitor. The IP is unavoidable (it's how geolocation works),
    // but the referrer is.
    var init = { referrerPolicy: 'no-referrer' };
    if (controller) init.signal = controller.signal;
    fetch('https://api.country.is/', init)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        clearTimeout(timeout);
        if (!j || !j.country) return;
        var lang = (j.country === 'CN' || j.country === 'HK' || j.country === 'MO' || j.country === 'TW') ? 'zh' : 'en';
        // Don't override if the user already changed it during the
        // ~1s detection window.
        if (getStoredLang()) return;
        // Persist the IP-derived choice BEFORE any short-circuit, so
        // future page loads / internal navigations read it from
        // localStorage and never hit api.country.is again. Without this
        // line, every page view with no manual preference re-fetched
        // the geolocation API (PR #22 codex review blocker).
        setStoredLang(lang);
        if (lang === currentLang()) return;
        applyLang(lang);
      })
      .catch(function () { clearTimeout(timeout); });
  }

  function init() {
    applyLang(currentLang());
    bindSwitcher();
    maybeDetectByIP();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging / programmatic use. `dict` is also read by the
  // build-en.mjs script (jsdom loads this file then reads window.GitHireI18n.dict).
  window.GitHireI18n = {
    apply: applyLang,
    get: currentLang,
    translations: T,
    dict: T,
    urlForLang: urlForLang
  };
})();
