// Generates docs/en/*.html from the Chinese source pages by reading the
// translation dictionary out of docs/i18n.js and baking the English values
// into a static HTML mirror — so crawlers and LLMs that don't run JS see
// real English content, not Chinese + English meta.
//
// One-shot script: run `npm run build:en` whenever zh source HTML or the
// T dictionary changes.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DOCS = join(ROOT, 'docs');
const EN = join(DOCS, 'en');
const SITE = 'https://realroc.github.io/git-hired';

const PAGES = [
  { src: 'index.html',           id: 'index', ogImg: 'og.png',                 ogImgEn: 'og.en.png' },
  { src: 'blog.html',            id: 'blog',  ogImg: 'og.png',                 ogImgEn: 'og.en.png' },
  { src: 'skill.html',           id: 'skill', ogImg: 'og.png',                 ogImgEn: 'og.en.png' },
  { src: 'case-redis-scan.html', id: 'case',  ogImg: 'og-case-redis-scan.png', ogImgEn: 'og-case-redis-scan.en.png' },
];

// JSON-LD strings that don't map 1:1 to a single T dictionary key. Curated
// inline so the build script stays the single source of truth for /en/
// structured-data text. Keep in sync if you edit JSON-LD in any zh page.
const JSONLD_REPLACEMENTS = {
  // index.html Organization.description
  "AI-native 工程方法论：把'人 frame、AI 执行、架构师判断'写成可复用的六步 workflow，附真实事故 case 与可装 Skill。":
    "An AI-native engineering method that codifies 'humans frame, AI executes, architects judge' into a reusable six-step workflow — with real production incidents and an installable Skill.",

  // index.html SoftwareApplication.description
  "GitHire 是一套围绕 GitHub Issue 展开的 AI-native 工程方法论：人 frame、AI 执行、架构师判断。":
    "GitHire is an AI-native engineering method built around the GitHub Issue: humans frame, AI executes, architects judge.",

  // index.html HowTo
  "GitHire 工作流：从 Issue 到 Production":
    "GitHire workflow: from Issue to Production",
  "GitHire 的标准工作流分为六个步骤,把'人 frame、AI 执行、架构师判断'串成从需求到上线的完整路径。":
    "The GitHire workflow has six steps that chain 'humans frame, AI executes, architects judge' into a complete path from spec to ship.",
  "用六段式 Prompt Spec 把需求落成 AI 可执行的契约：Goal / Constraints / Non-goals / Verification / Architecture notes / Existing context。每一处空白都是 AI 自由发挥的入口。":
    "Frame the spec into an AI-executable contract using the six-section Prompt Spec: Goal / Constraints / Non-goals / Verification / Architecture notes / Existing context. Every blank is room for the AI to freelance.",
  "长期运行的隔离环境，带真实依赖与生产量级的数据；缺数据规模、缺 QPS 的沙盒只是把 bug 推到上线那一刻。":
    "A long-running isolated environment with real dependencies and production-scale data; a sandbox without data scale or QPS just pushes bugs to ship time.",
  "AI agent 在沙盒里完成实现、跑测试、起 PR；人读 diff，不要试图在 Issue 里规定每一行代码。":
    "An AI agent implements, runs tests, and opens a PR in the sandbox; humans read the diff — don't try to dictate every line inside the Issue.",
  "另一位 agent 用不同 priors 读 PR——性能、安全、anti-pattern——不重跑测试，而是用互补的视角覆盖第一位 agent 没被要求看的事。":
    "A second agent reads the PR with different priors — performance, security, anti-patterns — not re-running tests, but covering with a complementary lens what the first agent wasn't asked to look at.",
  "人类架构师判断方向——这是工作流里最贵的 30 秒，带的是 AI 看不到的系统侧上下文（QPS 曲线、历史事故、容量规划）。":
    "A human architect calls the direction — the most expensive 30 seconds in the workflow, carrying system-side context AI can't see (QPS curves, past incidents, capacity plans).",
  "合并、上线、把决策回写到 Issue。Issue + PR + AI Review + 架构师签字 + handoff note 一起，是这次变更的可追溯记忆。":
    "Merge, ship, write decisions back to the Issue. Issue + PR + AI Review + architect signature + handoff note together — the traceable memory of this change.",

  // index.html FAQPage (Question.name + Answer.text, plain text)
  "AI 写代码这么快，为什么还要 6 步？":
    "AI writes code in minutes — why bother with six steps?",
  "因为速度不是问题——AI 5 分钟写完的代码，人 review 需要 30 分钟才能识别'路径不对'。6 步 workflow 不是给 AI 装护栏，是给人类留决策点：Issue 是 framing 的决策点，架构师评审是方向的决策点，sandbox 与 AI review 是两次'还来得及反悔'的决策点。一旦决策点形同虚设，AI 的速度就会变成事故的速度。":
    "Speed isn't the problem. Code AI writes in five minutes still takes a human thirty to recognise 'wrong path.' The six steps aren't guardrails for AI — they're decision points for humans: the Issue is the framing decision, architect review is the direction decision, sandbox and AI review are two more 'still time to back out' decisions. Once the decision points become rubber stamps, AI's speed turns into the speed of incidents.",

  "Architect 30 秒就能识别问题，AI review 5 分钟都识别不出来吗？":
    "The architect spots it in 30 seconds — why does AI review miss it after 5 minutes?",
  "两者识别的是不同维度。AI review 看的是 PR 内部一致性、edge cases、命名一致性、被忽略的 nullability——'代码自带的上下文'。架构师看的是 QPS 曲线、历史事故、容量规划——'系统侧才有的上下文'。互补，不重叠。Case 01 里 22 行 SCAN 代码在 AI review 看来完全正确，但架构师 30 秒就能看出'这个 endpoint 每次请求都扫全表'是不可接受的。":
    "They look at different dimensions. AI review reads PR-internal consistency, edge cases, naming, ignored nullability — 'context the code carries with it.' The architect reads QPS curves, past incidents, capacity plans — 'context only the system has.' Complementary, not overlapping. In Case 01 those 22 lines of SCAN looked perfectly correct to AI review, but the architect saw in 30 seconds that 'this endpoint scans the entire keyspace on every request' is unacceptable.",

  "一份好的 Issue 长什么样？":
    "What does a good Issue look like?",
  "六段:Goal / Constraints / Non-goals / Verification / Architecture notes / Existing context。Goal 说清楚要解决什么；Constraints 说清楚不能动什么；Non-goals 说清楚不做什么；Verification 说清楚怎么证明成功；Architecture notes 说清楚系统边界；Existing context 说清楚已有实现。缺一段，AI 就会在那一段自由发挥。":
    "Six sections: Goal / Constraints / Non-goals / Verification / Architecture notes / Existing context. Goal says what to solve; Constraints says what cannot move; Non-goals says what isn't being done; Verification says how to prove success; Architecture notes says the system boundary; Existing context says what is already there. Drop a section and the AI freelances inside it.",

  "AI 出事故，谁来背锅？":
    "When AI ships an incident, who carries it?",
  "架构师。AI 不背锅——背锅意味着代理责任，AI 没有代理资格。所有合入主干的代码都有一位架构师签字，签字就是认领系统侧后果。GitHire 不允许 review 责任被'AI 评过了'稀释——AI review 是辅助证据，架构师 review 是决定。":
    "The architect. AI does not carry it — carrying implies agency, and AI has no agency. Every change that merges to main has an architect's signature, and that signature is an explicit claim on the system-side consequences. GitHire does not let review accountability get diluted by 'an AI looked at it' — AI review is supporting evidence; architect review is the decision.",

  "Conceptual integrity 怎么在 AI 协作下保持？":
    "How is conceptual integrity preserved when AI is on the team?",
  "通过显式的架构 owner。AI agent 可以生成 PR，但 Architect 这一步由人类负责。所有 PR 必须能被一位 architect 用一句话讲清楚动机和取舍——做不到的 PR 不 merge。这条约束让概念一致性不被并发的 agent 数量稀释。":
    "Through an explicit architecture owner. AI agents can generate PRs, but the Architect step is held by a human. Every PR must be summarisable by one architect in one sentence — motivation and trade-off. A PR that fails this test does not merge. The constraint keeps conceptual integrity from being diluted by however many agents are running in parallel.",

  "Sandbox 里写的代码为什么默认不进主分支？":
    "Why does sandbox code not land in main by default?",
  "因为第一版的价值是澄清问题，不是交付。GitHire 把 Brooks 那句'Plan to throw one away; you will, anyhow'显式化：sandbox 阶段产生的代码默认不进主干，存在的目的是验证方向、暴露未知。等真正写主干代码时，问题已经清楚，AI 才有可能一次写对。":
    "Because the value of the first cut is clarifying the problem, not shipping. GitHire makes Brooks's 'Plan to throw one away; you will, anyhow' explicit: sandbox code is not destined for main by default — its job is to validate the direction and surface unknowns. By the time real code is written for main, the problem is clear enough that AI has a chance of getting it right in one shot.",

  "进度落后的团队是否需要再加人？":
    "Should a team that is falling behind add people?",
  "这个问题的经典版本来自 Brooks 的 Mythical Man-Month:给延期项目加人,会让项目更延期——因为新人需要学习上下文,沟通成本随人数二次方上升,短期内整体进度反而更慢。放到 AI-native 团队里,这条规律没失效,只是稀缺品换了:coding 手脚不缺——AI 已经够快——稀缺的是会 frame issue、做架构判断的脑子。一个能写出 6 段式 issue 的人可以同时 orchestrate 几个 agent;多请一个 coder 反而稀释了方向。加人之前先问:是 framing 不够,还是吞吐不够?":
    "The classic version is Brooks's Mythical Man-Month: adding people to a late project makes it later — newcomers have to learn context, communication cost grows quadratically, and progress slows in the short term. The law still holds in an AI-native team — only the scarce resource has changed: coding hands aren't scarce (AI is fast enough); what is scarce are the heads that can frame Issues and make architectural calls. One person who can write a six-section Issue can orchestrate several agents; hiring another coder just dilutes direction. Before adding people, ask: is framing the bottleneck, or is throughput?",

  "『人月』是个伪命题吗？":
    "Is the 'person-month' a fiction?",
  "'人月'是软件项目的传统估算单位——'这个功能要花 6 个人月'。Brooks 早就指出这是粗糙的近似:人和月不能线性互换,加一倍人不会让项目快一倍。放到 AI-native 团队里,人月不只是粗糙,而是失效:它建模的是 coding 工作量,但 coding 已经不是瓶颈——AI agent 5 分钟交付过去一个人月的代码量;而一条糟糕的 issue 让 AI 跑出 22 行 SCAN(case 01),损失 25 小时救火,这部分根本无法用人月度量。新的单位应该是'决策点节奏':每周完成多少次 framing、多少次架构评审、多少次 sandbox → PR 闭环。":
    "The 'person-month' was the traditional estimation unit — 'this feature is six person-months.' Brooks already noted it is a rough approximation: people and months are not linearly interchangeable, and doubling headcount does not double speed. In an AI-native team it is not just rough — it has broken down. Person-month models coding effort, but coding is no longer the bottleneck: an AI agent ships a former person-month of code in five minutes; meanwhile one badly framed Issue makes AI produce 22 lines of SCAN (Case 01) and costs 25 hours of firefighting — and that part doesn't fit person-month at all. The new unit is 'decision-point cadence': framings per week, architect reviews per week, sandbox → PR loops closed per week.",

  "Deadline 为什么总是骗人的？":
    "Why do deadlines keep lying?",
  "软件项目几乎从不按时交付——经典的解释是:估算在信息最少的时候做出,承诺在压力最大的时候许下,两边都不靠谱。放到 AI-native 团队里,deadline 仍然不准,但失准的根源换了:过去 deadline 滑掉是因为 coding 慢;现在 coding 不慢了,deadline 滑掉是因为 framing 失误和 review 来不及——一条没写清的 issue 让 AI 走错方向 20 分钟,代价是 25 小时根治(case 01)。GitHire 不承诺 deadline,改承诺'决策点完成度':issue framing 完成 / architect 签字完成 / sandbox 验证完成。可观测的状态替代主观时间,越接近交付,预测越收敛。":
    "Software projects almost never ship on time — estimates are made when information is thinnest, promises are made when pressure is highest, and neither side is reliable. Deadlines still miss in an AI-native team, but the root cause has shifted: they used to slip because coding was slow; now coding isn't slow, and they slip because of bad framing and review not catching up — a poorly written Issue sends AI down the wrong path for 20 minutes and costs 25 hours to fully fix (Case 01). GitHire does not promise a deadline. It promises 'decision-point completion': Issue framed / architect signed off / sandbox validated. Observable state replaces subjective time — and the closer to delivery, the tighter the prediction.",

  // blog.html Blog.description
  "AI-native 团队的真实事件复盘集合:每一篇都带 prompt、diff 与修复链,沿六步 workflow 走读。":
    "Real incident retros from AI-native teams — every post carries prompt, diff and fix chain, walked through the six-step workflow.",
  // blog.html blogPost[0]
  "Case 01 · 22 行 SCAN,打爆生产 Redis":
    "Case 01 · 22 lines of SCAN, crashing production Redis",
  "Codex 5 分钟写出的代码,20 分钟后被 commit,当晚上线即事故。沿六步 workflow 复盘:跳过哪一步,事故就埋在哪一步。":
    "Codex wrote it in 5 minutes; committed 20 minutes later; that night it shipped and the incident began. Walk back through the six steps — every skipped step is where the incident was buried.",
  // case-redis-scan.html BlogPosting
  "GitHire Case 01 · 从一条 prompt 到生产事故，20 分钟":
    "GitHire Case 01 · From one prompt to a production incident in 20 minutes",
  "复盘一次 AI 自动生成 Redis SCAN+HGETALL 代码导致的生产事故，沿 GitHire 六步 workflow 走读 prompt、生成、review、上线、修复全过程。":
    "A retro of a production incident caused by AI-generated Redis SCAN+HGETALL — walked along the six-step GitHire workflow through prompt, generation, review, ship, and fix.",
};

function loadDict() {
  const i18nSrc = readFileSync(join(DOCS, 'i18n.js'), 'utf8');
  const dom = new JSDOM('<!doctype html><html data-lang="zh" lang="zh-CN"></html>', {
    runScripts: 'outside-only',
    url: 'https://realroc.github.io/git-hired/',
  });
  // Stub network + storage so the IIFE's init() doesn't throw.
  dom.window.fetch = () => Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  dom.window.eval(i18nSrc);
  const dict = dom.window.GitHireI18n && dom.window.GitHireI18n.dict;
  if (!dict) throw new Error('Failed to load T dictionary from docs/i18n.js');
  return dict;
}

function applyI18n(doc, dict, lang) {
  for (const el of doc.querySelectorAll('[data-i18n]')) {
    const key = el.getAttribute('data-i18n');
    const entry = dict[key];
    if (entry && typeof entry[lang] === 'string') {
      el.innerHTML = entry[lang];
    }
  }
  for (const el of doc.querySelectorAll('[data-i18n-attr]')) {
    const spec = el.getAttribute('data-i18n-attr') || '';
    for (const pair of spec.split(',')) {
      const p = pair.trim();
      if (!p) continue;
      const colon = p.indexOf(':');
      if (colon < 0) continue;
      const attr = p.slice(0, colon).trim();
      const key = p.slice(colon + 1).trim();
      const entry = dict[key];
      if (entry && typeof entry[lang] === 'string') {
        el.setAttribute(attr, entry[lang]);
      }
    }
  }
}

function setAttrIfExists(doc, selector, attr, value) {
  const el = doc.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

function rewriteHeadUrls(doc, page) {
  const enUrl = `${SITE}/en/${page.src === 'index.html' ? '' : page.src}`;
  const zhUrl = `${SITE}/${page.src === 'index.html' ? '' : page.src}`;

  setAttrIfExists(doc, 'link[rel="canonical"]',                'href',    enUrl);
  setAttrIfExists(doc, 'meta[property="og:url"]',              'content', enUrl);
  setAttrIfExists(doc, 'meta[property="og:locale"]',           'content', 'en_US');
  setAttrIfExists(doc, 'meta[property="og:locale:alternate"]', 'content', 'zh_CN');
  setAttrIfExists(doc, 'meta[property="og:image"]',            'content', `${SITE}/${page.ogImgEn}`);
  setAttrIfExists(doc, 'meta[name="twitter:image"]',           'content', `${SITE}/${page.ogImgEn}`);

  // hreflang flip: self becomes en, zh-CN points back to the original.
  setAttrIfExists(doc, 'link[hreflang="zh-CN"]',     'href', zhUrl);
  setAttrIfExists(doc, 'link[hreflang="en"]',        'href', enUrl);
  setAttrIfExists(doc, 'link[hreflang="x-default"]', 'href', zhUrl);
}

function rewriteJsonLd(doc, page) {
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    let text = script.textContent;

    // Translate known zh string values.
    for (const [zh, en] of Object.entries(JSONLD_REPLACEMENTS)) {
      text = text.split(zh).join(en);
    }

    // Rewrite URLs to /en/ variants — but leave logo and og:image URLs alone
    // (handled separately below).
    text = text.replace(
      /https:\/\/realroc\.github\.io\/git-hired\/(?!en\/|logo\.svg|og)/g,
      `${SITE}/en/`
    );

    // Swap OG image references to the .en variants.
    text = text.split('og-case-redis-scan.png').join('og-case-redis-scan.en.png');
    text = text.split('"https://realroc.github.io/git-hired/og.png"')
               .join('"https://realroc.github.io/git-hired/og.en.png"');

    // Language tags.
    text = text.replace(/"inLanguage":\s*"zh-CN"/g, '"inLanguage": "en"');
    text = text.replace(/"inLanguage":\s*\[\s*"zh-CN",\s*"en"\s*\]/g, '"inLanguage": ["en", "zh-CN"]');

    script.textContent = text;
  }
}

// Asset filenames that live at the site root (docs/) — when an /en/ page
// references them by bare filename the browser resolves to /en/<file>,
// which doesn't exist. Prefix `../` so they resolve back to the site root.
// Document-style links (e.g. blog.html) are left alone so intra-/en/
// navigation stays inside the English mirror.
const ROOT_ASSETS = new Set([
  'githire.css',
  'githire-scroll.js',
  'githire-analytics.js',
  'i18n.js',
]);

function rewriteRelativeAssets(doc) {
  for (const el of doc.querySelectorAll('[href], [src]')) {
    for (const attr of ['href', 'src']) {
      const v = el.getAttribute(attr);
      if (!v) continue;
      // Skip absolute URLs, fragment-only, mailto:, data:, root-anchored paths.
      if (/^([a-z]+:|\/\/|#|\/)/i.test(v)) continue;
      // Only rewrite if the path (without query/hash) matches a known
      // root-level asset.
      const path = v.split('#')[0].split('?')[0];
      if (ROOT_ASSETS.has(path)) {
        el.setAttribute(attr, '../' + v);
      }
    }
  }
}

function rewritePrePaint(doc) {
  for (const script of doc.querySelectorAll('script')) {
    const text = script.textContent || '';
    if (text.includes("'githire-lang'") && text.includes('navigator.language')) {
      // On /en/ pages, fall back to 'en' instead of probing navigator.language.
      // ?lang= and localStorage priority is preserved upstream of this branch.
      script.textContent = text.replace(
        /\(\(navigator\.language \|\| ''\)\.toLowerCase\(\)\.indexOf\('zh'\) === 0 \? 'zh' : 'en'\)/,
        "'en'"
      );
    }
  }
}

function buildPage(page, dict) {
  const src = readFileSync(join(DOCS, page.src), 'utf8');
  const dom = new JSDOM(src);
  const doc = dom.window.document;

  doc.documentElement.setAttribute('lang', 'en');
  doc.documentElement.setAttribute('data-lang', 'en');

  applyI18n(doc, dict, 'en');
  rewriteHeadUrls(doc, page);
  rewriteJsonLd(doc, page);
  rewriteRelativeAssets(doc);
  rewritePrePaint(doc);

  // Mirror i18n.js applyLang's aria-pressed sync into the static markup so
  // assistive tech and non-JS crawlers see the EN button as the active one.
  for (const btn of doc.querySelectorAll('[data-lang-btn]')) {
    const pressed = btn.getAttribute('data-lang-btn') === 'en';
    btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    const cls = (btn.getAttribute('class') || '').split(/\s+/).filter(c => c && c !== 'is-active');
    if (pressed) cls.push('is-active');
    if (cls.length) btn.setAttribute('class', cls.join(' '));
    else btn.removeAttribute('class');
  }

  // <title data-i18n=...> was treated as a normal element by applyI18n,
  // which set its innerHTML. document.title syncs from textContent after.
  const titleEl = doc.querySelector('title[data-i18n]');
  if (titleEl) {
    const key = titleEl.getAttribute('data-i18n');
    if (dict[key] && dict[key].en) titleEl.textContent = dict[key].en;
  }

  const outPath = join(EN, page.src);
  mkdirSync(dirname(outPath), { recursive: true });

  // jsdom emits <!DOCTYPE html> (uppercase); the source uses lowercase. Match.
  let out = dom.serialize().replace(/^<!DOCTYPE html>/i, '<!doctype html>');
  // jsdom strips the trailing newline; restore for tidy diffs.
  if (!out.endsWith('\n')) out += '\n';

  writeFileSync(outPath, out);
  console.log(`  ✓ ${page.src} → docs/en/${page.src}`);
}

console.log('Building English mirror at docs/en/');
const dict = loadDict();
console.log(`  loaded ${Object.keys(dict).length} translation keys`);
for (const page of PAGES) buildPage(page, dict);
console.log('Done.');
