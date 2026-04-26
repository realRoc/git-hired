/* global window, document, MutationObserver, navigator, HTMLInputElement */
(function () {
  "use strict";

  const REPO_URL = "https://github.com/realRoc/git-hired";
  const AXES = [
    ["E", "I"],
    ["S", "N"],
    ["T", "F"],
    ["J", "P"],
  ];
  const HIGH_CONFIDENCE_MARGIN = 2;
  const BUILDER_TYPES = [
    {
      key: "prototype",
      letters: ["N", "P", "T"],
      title: { en: "Prototype Hacker", zh: "原型黑客" },
      mode: { en: "sketch fast, test early, learn from a working draft", zh: "快速做草稿，先试起来，用可运行版本学习" },
      signal: { en: "You seem to turn uncertainty into experiments and prototypes.", zh: "你更像是把不确定性转成实验和原型。" },
      risk: { en: "May need clearer closure when the first demo starts working.", zh: "当第一版 demo 跑通后，可能需要更清晰的收口。" },
    },
    {
      key: "orchestrator",
      letters: ["E", "J", "T"],
      title: { en: "Agent Orchestrator", zh: "Agent 编排者" },
      mode: { en: "align people and tools, split work, drive closure", zh: "对齐人和工具，拆分任务，推动收口" },
      signal: { en: "You seem to create momentum by coordinating work into clear tracks.", zh: "你更像是通过把工作协调成清晰轨道来制造推进力。" },
      risk: { en: "May over-structure before the evidence is stable.", zh: "在证据还不稳定时，可能会过早结构化。" },
    },
    {
      key: "shaper",
      letters: ["N", "J", "F"],
      title: { en: "Product Shaper", zh: "产品塑形者" },
      mode: { en: "turn fuzzy context into direction, boundaries, and product judgment", zh: "把模糊上下文压成方向、边界和产品判断" },
      signal: { en: "You seem to connect patterns, people context, and decisions into a product direction.", zh: "你更像是把模式、人的处境和决策连成产品方向。" },
      risk: { en: "May need more concrete evidence before locking the story.", zh: "在锁定叙事前，可能需要更多具体证据。" },
    },
    {
      key: "systems",
      letters: ["I", "S", "T", "J"],
      title: { en: "Systems Builder", zh: "系统构建者" },
      mode: { en: "stabilize details, standards, ownership, and long-term maintainability", zh: "稳定细节、标准、owner 和长期可维护性" },
      signal: { en: "You seem to protect quality by making details, standards, and ownership explicit.", zh: "你更像是通过明确细节、标准和 owner 来保护质量。" },
      risk: { en: "May need faster external feedback before polishing the system.", zh: "在打磨系统前，可能需要更快获得外部反馈。" },
    },
    {
      key: "growth",
      letters: ["E", "N", "P"],
      title: { en: "Growth Experimenter", zh: "增长实验者" },
      mode: { en: "read social signals, try channels, keep loops open", zh: "读取社交信号，测试渠道，保持循环开放" },
      signal: { en: "You seem to move through people signals, options, and fast channel experiments.", zh: "你更像是通过人群信号、选项和快速渠道实验来推进。" },
      risk: { en: "May need sharper constraints and success metrics.", zh: "可能需要更锋利的约束和成功指标。" },
    },
    {
      key: "taste",
      letters: ["N", "F", "P"],
      title: { en: "Taste-driven Designer", zh: "品味驱动设计者" },
      mode: { en: "notice meaning, user feeling, and possible directions", zh: "关注意义、用户感受和可能方向" },
      signal: { en: "You seem to notice the human meaning and future shape of a work artifact.", zh: "你更像是会注意一个产物的人味、意义和未来形状。" },
      risk: { en: "May need tighter acceptance criteria before handing work off.", zh: "在交付给别人前，可能需要更清楚的验收标准。" },
    },
    {
      key: "debugging",
      letters: ["I", "S", "T", "P"],
      title: { en: "Debugging Detective", zh: "调试侦探" },
      mode: { en: "inspect facts, isolate failures, keep testing until the signal is real", zh: "检查事实、隔离问题，持续测试直到信号成立" },
      signal: { en: "You seem to trust concrete traces and direct investigation before deciding.", zh: "你更像是先相信具体痕迹和直接调查，再做判断。" },
      risk: { en: "May need to surface the decision sooner for collaborators.", zh: "可能需要更早把决策点暴露给合作者。" },
    },
    {
      key: "operator",
      letters: ["E", "S", "J", "F"],
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
      starMeaning: "* in the secondary style chip means that part is unclear from these 10 answers.",
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
      starMeaning: "secondary style chip 里的 * 表示这部分仅凭 10 道题还判断不稳。",
      simple: "这只是一个 10 题简化自评信号，不是真实工作痕迹证据。",
      detail: "如果需要详细、基于真实工作证据的 builder 画像，请回到 GitHub repo，用 Claude Code、Codex 或类似工作 agent 运行深度测试。",
      cta: "GitHub 仓库",
      copyReport: "复制结果",
      copied: "已复制",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "返回",
    },
  };

  const AXIS_COPY = {
    "E/I": {
      en: { axis: "E/I", name: "energy" },
      zh: { axis: "E/I", name: "能量来源" },
    },
    "S/N": {
      en: { axis: "S/N", name: "attention" },
      zh: { axis: "S/N", name: "注意力" },
    },
    "T/F": {
      en: { axis: "T/F", name: "decision" },
      zh: { axis: "T/F", name: "决策方式" },
    },
    "J/P": {
      en: { axis: "J/P", name: "rhythm" },
      zh: { axis: "J/P", name: "推进节奏" },
    },
  };

  const LETTER_NAMES = {
    E: { en: "live sync", zh: "实时互动" },
    I: { en: "solo first", zh: "先独立消化" },
    S: { en: "concrete", zh: "具体事实" },
    N: { en: "pattern", zh: "模式判断" },
    T: { en: "logic", zh: "逻辑取舍" },
    F: { en: "people", zh: "人的影响" },
    J: { en: "closure", zh: "清晰收口" },
    P: { en: "adaptive", zh: "弹性探索" },
    "*": { en: "unknown", zh: "未知" },
  };

  const LETTER_COPY = {
    E: {
      en: "You seem to move work forward through live interaction with people.",
      zh: "你更像是通过和人实时互动来推进工作。",
    },
    I: {
      en: "You seem to move work forward by thinking, writing, and structuring first.",
      zh: "你更像是先自己思考、书写、结构化，再推进工作。",
    },
    S: {
      en: "You seem to trust concrete facts, examples, and details first.",
      zh: "你更信具体事实、案例和细节。",
    },
    N: {
      en: "You seem to look for patterns, direction, and future leverage first.",
      zh: "你更先看模式、方向和未来杠杆。",
    },
    T: {
      en: "You seem to decide through logic, standards, and tradeoffs.",
      zh: "你更常用逻辑、标准和取舍来决策。",
    },
    F: {
      en: "You seem to weigh people, trust, morale, and user impact heavily.",
      zh: "你更重视人的处境、信任、士气和用户影响。",
    },
    J: {
      en: "You seem to prefer clear closure, ownership, and next steps.",
      zh: "你更偏好清晰收口、负责人和下一步。",
    },
    P: {
      en: "You seem to prefer keeping options open while evidence changes.",
      zh: "你更偏好在证据变化时保留选项、继续调整。",
    },
  };

  const AXIS_UNKNOWN_COPY = {
    "E/I": {
      en: "Your answers mix live interaction and solo processing.",
      zh: "你的答案同时出现了实时互动和独立消化。",
    },
    "S/N": {
      en: "Your answers mix concrete detail and big-picture pattern reading.",
      zh: "你的答案同时出现了具体细节和整体模式判断。",
    },
    "T/F": {
      en: "Your answers mix logic-first and people-impact-first decisions.",
      zh: "你的答案同时出现了逻辑优先和人的影响优先。",
    },
    "J/P": {
      en: "Your answers mix clear closure and flexible exploration.",
      zh: "你的答案同时出现了清晰收口和弹性探索。",
    },
  };

  function currentLang() {
    const lang = document.documentElement.dataset.lang || document.body?.dataset.lang;
    return lang === "zh" ? "zh" : "en";
  }

  function text(lang, key) {
    return COPY[lang][key];
  }

  function axisKey(axis) {
    return axis.left + "/" + axis.right;
  }

  function makeElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
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
        const rawScore = builder.letters.reduce((sum, letter) => sum + (scores[letter] || 0), 0);
        return {
          builder,
          rawScore,
          score: rawScore / builder.letters.length,
        };
      })
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const second = ranked[1];
    const margin = second ? best.score - second.score : best.score;
    const strengthKey = margin >= 0.5 ? "clear" : margin >= 0.25 ? "emerging" : "light";
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

  function scoreMbti(form) {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    selectedOptions(form).forEach((option) => {
      Object.keys(scores).forEach((letter) => {
        scores[letter] += datasetNumber(option, "mbti" + letter);
      });
    });

    const axes = AXES.map(([left, right]) => {
      const leftScore = scores[left];
      const rightScore = scores[right];
      const margin = Math.abs(leftScore - rightScore);
      const winner = leftScore >= rightScore ? left : right;
      const confident = margin >= HIGH_CONFIDENCE_MARGIN;
      return { left, right, leftScore, rightScore, margin, winner, confident };
    });

    return {
      scores,
      axes,
      builder: scoreBuilder(scores),
      mbtiType: axes.map((axis) => (axis.confident ? axis.winner : "*")).join(""),
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

    result.axes
      .filter((axis) => axis.confident)
      .slice(0, 2)
      .forEach((axis) => rows.push({
        mark: axis.winner,
        text: LETTER_COPY[axis.winner][lang],
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

    result.axes
      .filter((axis) => !axis.confident)
      .forEach((axis) => rows.push({
        mark: "*",
        text: AXIS_UNKNOWN_COPY[axisKey(axis)][lang],
        unknown: true,
      }));

    return rows;
  }

  function buildResultText(result, lang) {
    const confirmed = confirmedRows(result, lang);
    const unknown = unknownRows(result, lang);
    const confirmedText = confirmed.length
      ? confirmed.map((row) => "- " + row.mark + " — " + row.text).join("\n")
      : "- * — " + text(lang, "noConfirmed");
    const unknownText = unknown.length
      ? unknown.map((row) => "- " + row.mark + " — " + row.text).join("\n")
      : "- " + text(lang, "noUnknown");

    return [
      text(lang, "resultTitle"),
      text(lang, "resultLabel") + " " + result.builder.title[lang],
      (lang === "zh" ? "辅助工作风格 :: " : "Secondary work-style :: ") + result.mbtiType,
      text(lang, "starMeaning"),
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
      {
        axis: lang === "zh" ? "辅助" : "secondary",
        letter: result.mbtiType,
        name: lang === "zh" ? "工作风格" : "work style",
        meta: "MBTI",
        state: result.mbtiType.includes("*") ? "is-unknown" : "is-confirmed",
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
      : [{ mark: "*", text: fallback, unknown: true }];
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
      lastResult = scoreMbti(form);
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
