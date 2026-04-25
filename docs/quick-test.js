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

  const COPY = {
    en: {
      resultTitle: "HIRED quick result",
      resultLabel: "Your quick result ::",
      confirmedTitle: "What looks clear",
      unknownTitle: "What is still unknown",
      noConfirmed: "No axis is strong enough yet.",
      noUnknown: "No unknown axes in this quick run.",
      starMeaning: "* means this part is still unclear from these 10 answers.",
      simple: "This is only a simple 10-question self-report test.",
      detail: "For a detailed evidence-based result, open the GitHub repo and run the deeper test through Claude Code, Codex, or a similar work agent.",
      cta: "GitHub repo",
      copyReport: "copy report",
      copied: "copied",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "Back",
    },
    zh: {
      resultTitle: "HIRED 快速结果",
      resultLabel: "你的快速结论 ::",
      confirmedTitle: "比较确定的部分",
      unknownTitle: "仍然未知的部分",
      noConfirmed: "目前没有足够确定的轴。",
      noUnknown: "这次快速测试里没有未知轴。",
      starMeaning: "* 表示这部分仅凭 10 道题还判断不稳。",
      simple: "这只是一个 10 题简化自评测试。",
      detail: "如果需要详细、基于真实工作证据的结果，请回到 GitHub repo，用 Claude Code、Codex 或类似工作 agent 运行深度测试。",
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
      type: axes.map((axis) => (axis.confident ? axis.winner : "*")).join(""),
    };
  }

  function answeredCount(form) {
    return selectedOptions(form).length;
  }

  function confirmedRows(result, lang) {
    return result.axes
      .filter((axis) => axis.confident)
      .map((axis) => ({
        mark: axis.winner,
        text: LETTER_COPY[axis.winner][lang],
        unknown: false,
      }));
  }

  function unknownRows(result, lang) {
    return result.axes
      .filter((axis) => !axis.confident)
      .map((axis) => ({
        mark: "*",
        text: AXIS_UNKNOWN_COPY[axisKey(axis)][lang],
        unknown: true,
      }));
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
      text(lang, "resultLabel") + " " + result.type,
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

  function renderAxisChips(result, lang) {
    const strip = makeElement("div", "rc-type-strip");

    result.axes.forEach((axis) => {
      const key = axisKey(axis);
      const mark = axis.confident ? axis.winner : "*";
      const chip = makeElement("div", "rc-chip " + (axis.confident ? "is-confirmed" : "is-unknown"));
      chip.append(
        makeElement("span", "rc-chip-axis", AXIS_COPY[key][lang].axis),
        makeElement("span", "rc-chip-letter", mark),
        makeElement("span", "rc-chip-name", axis.confident ? LETTER_NAMES[mark][lang] : LETTER_NAMES["*"][lang]),
        makeElement("span", "rc-chip-meta", AXIS_COPY[key][lang].name)
      );
      strip.append(chip);
    });

    return strip;
  }

  function renderReadout(result, lang) {
    const readout = makeElement("div", "rc-readout");
    readout.append(
      makeElement("span", "rc-readout-label", text(lang, "resultLabel")),
      makeElement("strong", "rc-result-type", result.type)
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
      renderAxisChips(result, lang),
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
