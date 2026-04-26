/* global window, document, MutationObserver, navigator, HTMLInputElement */
(function () {
  "use strict";

  const REPO_URL = "https://github.com/realRoc/git-hired";
  const SIGNAL_KEYS = ["facts", "pattern", "collab", "solo", "logic", "empathy", "closure", "explore"];
  const CLEAR_SIGNAL_MARGIN = 0.35;
  const BUILDER_TYPES = [
    {
      key: "prototype",
      weights: { pattern: 1.2, explore: 1.2, logic: 0.8, facts: 0.5 },
      title: { en: "Prototype Hacker", zh: "原型黑客" },
      mode: { en: "sketch fast, test early, learn from a working draft", zh: "快速做草稿，先试起来，用可运行版本学习" },
      signal: { en: "You seem to turn uncertainty into experiments and prototypes.", zh: "你更像是把不确定性转成实验和原型。" },
      risk: { en: "May need clearer closure when the first demo starts working.", zh: "当第一版 demo 跑通后，可能需要更清晰的收口。" },
    },
    {
      key: "orchestrator",
      weights: { collab: 1.2, closure: 1.1, logic: 0.8, empathy: 0.6 },
      title: { en: "Agent Orchestrator", zh: "Agent 编排者" },
      mode: { en: "align people and tools, split work, drive closure", zh: "对齐人和工具，拆分任务，推动收口" },
      signal: { en: "You seem to create momentum by coordinating work into clear tracks.", zh: "你更像是通过把工作协调成清晰轨道来制造推进力。" },
      risk: { en: "May over-structure before the evidence is stable.", zh: "在证据还不稳定时，可能会过早结构化。" },
    },
    {
      key: "shaper",
      weights: { pattern: 1.1, empathy: 1.0, closure: 0.8, collab: 0.5 },
      title: { en: "Product Shaper", zh: "产品塑形者" },
      mode: { en: "turn fuzzy context into direction, boundaries, and product judgment", zh: "把模糊上下文压成方向、边界和产品判断" },
      signal: { en: "You seem to connect patterns, people context, and decisions into a product direction.", zh: "你更像是把模式、人的处境和决策连成产品方向。" },
      risk: { en: "May need more concrete evidence before locking the story.", zh: "在锁定叙事前，可能需要更多具体证据。" },
    },
    {
      key: "systems",
      weights: { facts: 1.2, logic: 1.0, closure: 1.0, solo: 0.6 },
      title: { en: "Systems Builder", zh: "系统构建者" },
      mode: { en: "stabilize details, standards, ownership, and long-term maintainability", zh: "稳定细节、标准、owner 和长期可维护性" },
      signal: { en: "You seem to protect quality by making details, standards, and ownership explicit.", zh: "你更像是通过明确细节、标准和 owner 来保护质量。" },
      risk: { en: "May need faster external feedback before polishing the system.", zh: "在打磨系统前，可能需要更快获得外部反馈。" },
    },
    {
      key: "growth",
      weights: { collab: 1.0, pattern: 1.0, explore: 1.1, empathy: 0.6 },
      title: { en: "Growth Experimenter", zh: "增长实验者" },
      mode: { en: "read social signals, try channels, keep loops open", zh: "读取社交信号，测试渠道，保持循环开放" },
      signal: { en: "You seem to move through people signals, options, and fast channel experiments.", zh: "你更像是通过人群信号、选项和快速渠道实验来推进。" },
      risk: { en: "May need sharper constraints and success metrics.", zh: "可能需要更锋利的约束和成功指标。" },
    },
    {
      key: "taste",
      weights: { empathy: 1.1, pattern: 1.0, explore: 0.8, solo: 0.5 },
      title: { en: "Taste-driven Designer", zh: "品味驱动设计者" },
      mode: { en: "notice meaning, user feeling, and possible directions", zh: "关注意义、用户感受和可能方向" },
      signal: { en: "You seem to notice the human meaning and future shape of a work artifact.", zh: "你更像是会注意一个产物的人味、意义和未来形状。" },
      risk: { en: "May need tighter acceptance criteria before handing work off.", zh: "在交付给别人前，可能需要更清楚的验收标准。" },
    },
    {
      key: "debugging",
      weights: { facts: 1.2, logic: 1.1, solo: 0.8, explore: 0.6 },
      title: { en: "Debugging Detective", zh: "调试侦探" },
      mode: { en: "inspect facts, isolate failures, keep testing until the signal is real", zh: "检查事实、隔离问题，持续测试直到信号成立" },
      signal: { en: "You seem to trust concrete traces and direct investigation before deciding.", zh: "你更像是先相信具体痕迹和直接调查，再做判断。" },
      risk: { en: "May need to surface the decision sooner for collaborators.", zh: "可能需要更早把决策点暴露给合作者。" },
    },
    {
      key: "operator",
      weights: { closure: 1.1, empathy: 0.9, facts: 0.8, collab: 0.8 },
      title: { en: "Operator Builder", zh: "运营型构建者" },
      mode: { en: "turn messy coordination into reliable process and visible next steps", zh: "把混乱协作转成可靠流程和可见下一步" },
      signal: { en: "You seem to keep work moving by protecting people, process, and closure.", zh: "你更像是通过保护人、流程和收口来保持推进。" },
      risk: { en: "May need more room for exploration when the situation changes.", zh: "当局面变化时，可能需要给探索留更多空间。" },
    },
  ];

  const COPY = {
    en: {
      resultTitle: "Builder quick result",
      resultLabel: "Builder signal ::",
      confirmedTitle: "What looks clear",
      unknownTitle: "What needs real evidence",
      noConfirmed: "No signal is strong enough yet.",
      noUnknown: "No major uncertainty in this quick run.",
      simple: "This is only a simple 10-question self-report signal, not evidence from real work traces.",
      detail: "For a detailed evidence-based builder profile, open the GitHub repo and run the deeper test through Claude Code, Codex, or a similar work agent.",
      cta: "GitHub repo",
      copyReport: "copy report",
      copied: "copied",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "Back",
    },
    zh: {
      resultTitle: "Builder 快速结果",
      resultLabel: "Builder 信号 ::",
      confirmedTitle: "比较确定的部分",
      unknownTitle: "还需要真实证据的部分",
      noConfirmed: "目前没有足够确定的信号。",
      noUnknown: "这次快速测试里没有明显未知项。",
      simple: "这只是一个 10 题简化自评信号，不是真实工作痕迹证据。",
      detail: "如果需要详细、基于真实工作证据的 builder 画像，请回到 GitHub repo，用 Claude Code、Codex 或类似工作 agent 运行深度测试。",
      cta: "GitHub 仓库",
      copyReport: "复制结果",
      copied: "已复制",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "返回",
    },
  };

  const SIGNAL_COPY = {
    facts: {
      title: { en: "evidence first", zh: "证据优先" },
      text: { en: "You prefer concrete facts, examples, and shipped details before judgment.", zh: "你更倾向于先看具体事实、例子和交付细节。" },
    },
    pattern: {
      title: { en: "pattern read", zh: "模式判断" },
      text: { en: "You look for direction, leverage, and the shape behind a messy situation.", zh: "你会寻找混乱背后的方向、杠杆和结构。" },
    },
    collab: {
      title: { en: "live alignment", zh: "实时对齐" },
      text: { en: "You create momentum through users, teammates, communities, or quick syncs.", zh: "你会通过用户、队友、社区或快速同步制造推进力。" },
    },
    solo: {
      title: { en: "solo compression", zh: "独立压缩" },
      text: { en: "You often think, write, and structure the problem before pulling others in.", zh: "你常先独立思考、书写和结构化，再把别人拉进来。" },
    },
    logic: {
      title: { en: "tradeoff logic", zh: "取舍逻辑" },
      text: { en: "You lean on standards, constraints, and explicit tradeoffs when deciding.", zh: "你决策时更依赖标准、约束和明确取舍。" },
    },
    empathy: {
      title: { en: "people context", zh: "人的处境" },
      text: { en: "You pay attention to trust, morale, motivation, and user impact.", zh: "你会关注信任、士气、动机和用户影响。" },
    },
    closure: {
      title: { en: "closure drive", zh: "收口驱动" },
      text: { en: "You push work toward owners, decisions, checklists, and clear next steps.", zh: "你会把工作推向负责人、决策、清单和清晰下一步。" },
    },
    explore: {
      title: { en: "adaptive loop", zh: "弹性循环" },
      text: { en: "You keep options open and test small signals before locking the path.", zh: "你会保留选项，先测试小信号再锁定路径。" },
    },
  };

  function currentLang() {
    const lang = document.documentElement.dataset.lang || document.body?.dataset.lang;
    return lang === "zh" ? "zh" : "en";
  }

  function text(lang, key) {
    return COPY[lang][key];
  }

  function makeElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  }

  function signalDatasetKey(signal) {
    return "signal" + signal.charAt(0).toUpperCase() + signal.slice(1);
  }

  function datasetNumber(option, key) {
    const value = option.dataset[key];
    return value ? Number(value) || 0 : 0;
  }

  function selectedOptions(form) {
    return Array.from(form.querySelectorAll('input[type="radio"]:checked'));
  }

  function scoreBuilder(scores) {
    const ranked = BUILDER_TYPES
      .map((builder) => {
        const weightEntries = Object.entries(builder.weights);
        const totalWeight = weightEntries.reduce((sum, [, weight]) => sum + weight, 0);
        const rawScore = weightEntries.reduce((sum, [signal, weight]) => sum + (scores[signal] || 0) * weight, 0);
        return {
          builder,
          rawScore,
          score: rawScore / totalWeight,
        };
      })
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const second = ranked[1];
    const margin = second ? best.score - second.score : best.score;
    const strengthKey = margin >= CLEAR_SIGNAL_MARGIN ? "clear" : margin >= CLEAR_SIGNAL_MARGIN / 2 ? "emerging" : "light";
    return {
      ...best.builder,
      score: best.score,
      rawScore: best.rawScore,
      margin,
      strengthKey,
    };
  }

  function strengthLabel(result, lang) {
    const labels = {
      clear: { en: "clear signal", zh: "信号清晰" },
      emerging: { en: "emerging signal", zh: "信号浮现" },
      light: { en: "light signal", zh: "轻量信号" },
    };
    return labels[result.builder.strengthKey][lang];
  }

  function scoreQuickTest(form) {
    const scores = Object.fromEntries(SIGNAL_KEYS.map((key) => [key, 0]));
    selectedOptions(form).forEach((option) => {
      SIGNAL_KEYS.forEach((signal) => {
        scores[signal] += datasetNumber(option, signalDatasetKey(signal));
      });
    });

    const topSignals = SIGNAL_KEYS
      .map((key) => ({ key, score: scores[key] }))
      .sort((a, b) => b.score - a.score);

    return {
      scores,
      topSignals,
      builder: scoreBuilder(scores),
    };
  }

  function answeredCount(form) {
    return selectedOptions(form).length;
  }

  function confirmedRows(result, lang) {
    const rows = [
      {
        mark: "type",
        text: result.builder.signal[lang],
        unknown: false,
      },
      {
        mark: "mode",
        text: result.builder.mode[lang],
        unknown: false,
      },
    ];

    result.topSignals
      .filter((signal) => signal.score > 0)
      .slice(0, 2)
      .forEach((signal) => rows.push({
        mark: SIGNAL_COPY[signal.key].title[lang],
        text: SIGNAL_COPY[signal.key].text[lang],
        unknown: false,
      }));

    return rows;
  }

  function unknownRows(result, lang) {
    const rows = [
      {
        mark: "trace",
        text: lang === "zh"
          ? "这页没有检查真实交付、agent 使用记录或协作文档；深度测试才会看证据。"
          : "This page did not inspect shipped work, agent usage, or collaboration artifacts; the deep test checks evidence.",
        unknown: true,
      },
      {
        mark: "risk",
        text: result.builder.risk[lang],
        unknown: true,
      },
    ];

    if (result.builder.strengthKey === "light") {
      rows.push({
        mark: "signal",
        text: lang === "zh"
          ? "几个 builder 方向分数接近，这次只能算轻量倾向。"
          : "Several builder directions are close, so this is only a light read.",
        unknown: true,
      });
    }

    return rows;
  }

  function buildResultText(result, lang) {
    const confirmed = confirmedRows(result, lang);
    const unknown = unknownRows(result, lang);
    const confirmedText = confirmed.length
      ? confirmed.map((row) => "- " + row.mark + " — " + row.text).join("\n")
      : "- signal — " + text(lang, "noConfirmed");
    const unknownText = unknown.length
      ? unknown.map((row) => "- " + row.mark + " — " + row.text).join("\n")
      : "- " + text(lang, "noUnknown");

    return [
      text(lang, "resultTitle"),
      text(lang, "resultLabel") + " " + result.builder.title[lang],
      "Signal strength :: " + strengthLabel(result, lang),
      "",
      text(lang, "confirmedTitle") + ":",
      confirmedText,
      "",
      text(lang, "unknownTitle") + ":",
      unknownText,
      "",
      text(lang, "simple"),
      text(lang, "detail"),
      "",
      text(lang, "cta") + ": " + REPO_URL,
    ].join("\n");
  }

  function renderBuilderChips(result, lang) {
    const strip = makeElement("div", "rc-type-strip");
    const chipData = [
      {
        axis: lang === "zh" ? "类型" : "builder",
        letter: result.builder.title[lang],
        name: lang === "zh" ? "快速画像" : "quick profile",
        meta: result.builder.key,
        state: "is-confirmed",
      },
      {
        axis: lang === "zh" ? "信号" : "signal",
        letter: strengthLabel(result, lang),
        name: lang === "zh" ? "10 题自评" : "10-question read",
        meta: result.builder.score.toFixed(1) + " avg",
        state: result.builder.strengthKey === "light" ? "is-unknown" : "is-confirmed",
      },
      {
        axis: lang === "zh" ? "协作" : "mode",
        letter: lang === "zh" ? "看下方" : "see below",
        name: lang === "zh" ? "协作模式" : "collaboration",
        meta: "public-safe",
        state: "is-confirmed",
      },
    ];

    chipData.forEach((item) => {
      const chip = makeElement("div", "rc-chip builder-chip " + item.state);
      chip.append(
        makeElement("span", "rc-chip-axis", item.axis),
        makeElement("span", "rc-chip-letter", item.letter),
        makeElement("span", "rc-chip-name", item.name),
        makeElement("span", "rc-chip-meta", item.meta)
      );
      strip.append(chip);
    });

    return strip;
  }

  function renderReadout(result, lang) {
    const readout = makeElement("div", "rc-readout");
    readout.append(
      makeElement("span", "rc-readout-label", text(lang, "resultLabel")),
      makeElement("strong", "rc-result-type", result.builder.title[lang])
    );
    return readout;
  }

  function renderSection(title, rows, fallback, isUnknown) {
    const section = makeElement("div", "rc-section" + (isUnknown ? " is-unknown" : ""));
    section.append(makeElement("h3", "rc-section-title", title));

    const body = makeElement("div", "rc-section-body");
    const visibleRows = rows.length
      ? rows
      : [{ mark: "signal", text: fallback, unknown: true }];
    visibleRows.forEach((row) => {
      const item = makeElement("div", "rc-row" + (row.unknown ? " is-unknown" : ""));
      item.append(
        makeElement("span", "rc-mark", row.mark),
        makeElement("span", "rc-row-copy", row.text)
      );
      body.append(item);
    });
    section.append(body);
    return section;
  }

  function renderNote(lang) {
    const note = makeElement("div", "rc-note");
    note.append(
      makeElement("p", "", text(lang, "simple")),
      makeElement("p", "", text(lang, "detail"))
    );
    return note;
  }

  function renderResultCard(host, result, lang) {
    if (!host || !result) return;

    const confirmed = confirmedRows(result, lang);
    const unknown = unknownRows(result, lang);
    const nodes = [
      renderBuilderChips(result, lang),
      renderReadout(result, lang),
      renderSection(text(lang, "confirmedTitle"), confirmed, text(lang, "noConfirmed"), false),
    ];

    if (unknown.length) {
      nodes.push(renderSection(text(lang, "unknownTitle"), unknown, text(lang, "noUnknown"), true));
    }
    nodes.push(renderNote(lang));
    host.replaceChildren(...nodes);
  }

  function fallbackCopyText(value) {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.left = "-1000px";
    document.body.appendChild(textarea);
    textarea.select();

    let didCopy = false;
    try {
      didCopy = document.execCommand("copy");
    } catch (error) {
      didCopy = false;
    }
    textarea.remove();
    return Promise.resolve(didCopy);
  }

  function copyText(value) {
    if (!value) return Promise.resolve(false);
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(value)
        .then(() => true)
        .catch(() => fallbackCopyText(value));
    }
    return fallbackCopyText(value);
  }

  function setCopyLabel(button, copied) {
    if (!button) return;
    button.dataset.copyState = copied ? "copied" : "idle";
    button.querySelectorAll(".copy-label").forEach((label) => {
      const lang = label.dataset.lang === "zh" ? "zh" : "en";
      label.textContent = copied ? COPY[lang].copied : COPY[lang].copyReport;
    });
  }

  function init() {
    const form = document.getElementById("quick-test-form");
    const steps = Array.from(document.querySelectorAll(".quick-step"));
    const progressLabel = document.getElementById("quick-progress-label");
    const progressFill = document.getElementById("quick-progress-fill");
    const resultShell = document.getElementById("quick-result");
    const resultCard = document.getElementById("result-card");
    const copyButton = document.getElementById("copy-report");
    const backButtons = [
      document.getElementById("quick-back"),
      document.getElementById("quick-back-zh"),
    ].filter(Boolean);
    const retakeButtons = [
      document.getElementById("retake-test"),
    ].filter(Boolean);

    if (!form || !steps.length) return;

    let currentIndex = 0;
    let copyTimer = 0;
    let lastResult = null;
    let lastResultText = "";

    function renderStep() {
      const lang = currentLang();
      const current = currentIndex + 1;
      const total = steps.length;

      steps.forEach((step, index) => {
        const active = index === currentIndex;
        step.classList.toggle("is-active", active);
        step.setAttribute("aria-hidden", active ? "false" : "true");
      });

      if (progressLabel) progressLabel.textContent = COPY[lang].progress(current, total);
      if (progressFill) progressFill.style.width = Math.round((current / total) * 100) + "%";
      backButtons.forEach((button) => {
        button.disabled = currentIndex === 0;
        button.textContent = text(lang, "back");
      });
    }

    function showResult() {
      lastResult = scoreQuickTest(form);
      const lang = currentLang();
      lastResultText = buildResultText(lastResult, lang);
      renderResultCard(resultCard, lastResult, lang);
      setCopyLabel(copyButton, false);
      if (resultShell) resultShell.classList.remove("is-hidden");
      form.classList.add("is-complete");
      window.requestAnimationFrame(() => {
        const y = resultShell ? resultShell.getBoundingClientRect().top + window.scrollY - 12 : 0;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    }

    function goNext() {
      if (currentIndex < steps.length - 1) {
        currentIndex += 1;
        renderStep();
        const target = steps[currentIndex];
        window.requestAnimationFrame(() => {
          const y = target.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top: y, behavior: "smooth" });
        });
      } else if (answeredCount(form) === steps.length) {
        showResult();
      }
    }

    form.addEventListener("change", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "radio") return;
      window.setTimeout(goNext, 170);
    });

    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (currentIndex === 0) return;
        currentIndex -= 1;
        renderStep();
      });
    });

    retakeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        form.reset();
        currentIndex = 0;
        lastResult = null;
        lastResultText = "";
        form.classList.remove("is-complete");
        if (resultShell) resultShell.classList.add("is-hidden");
        window.clearTimeout(copyTimer);
        setCopyLabel(copyButton, false);
        renderStep();
        window.requestAnimationFrame(() => {
          const y = form.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top: y, behavior: "smooth" });
        });
      });
    });

    if (copyButton) {
      copyButton.addEventListener("click", () => {
        if (!lastResult) return;
        lastResultText = buildResultText(lastResult, currentLang());
        copyText(lastResultText).then(() => {
          setCopyLabel(copyButton, true);
          window.clearTimeout(copyTimer);
          copyTimer = window.setTimeout(() => setCopyLabel(copyButton, false), 1400);
        });
      });
    }

    new MutationObserver(() => {
      renderStep();
      if (lastResult && resultCard) {
        const lang = currentLang();
        lastResultText = buildResultText(lastResult, lang);
        renderResultCard(resultCard, lastResult, lang);
        setCopyLabel(copyButton, copyButton?.dataset.copyState === "copied");
      }
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-lang", "lang"],
    });

    renderStep();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
