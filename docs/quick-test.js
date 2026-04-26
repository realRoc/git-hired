/* global window, document, MutationObserver, navigator, HTMLInputElement, ClipboardItem */
(function () {
  "use strict";

  const AGENT_PROMPT = "read https://realroc.github.io/git-hired/skill.md";
  const RESULT_URL = "https://realroc.github.io/git-hired/start.html";
  const SIGNAL_KEYS = ["facts", "pattern", "collab", "solo", "logic", "empathy", "closure", "explore"];
  const ASCII_GIT_HIRED = [
    "  ██████╗ ██╗████████╗       ██╗  ██╗██╗██████╗ ███████╗██████╗ ",
    "  ██╔════╝ ██║╚══██╔══╝       ██║  ██║██║██╔══██╗██╔════╝██╔══██╗",
    "  ██║  ███╗██║   ██║          ███████║██║██████╔╝█████╗  ██║  ██║",
    "  ██║   ██║██║   ██║          ██╔══██║██║██╔══██╗██╔══╝  ██║  ██║",
    "  ╚██████╔╝██║   ██║          ██║  ██║██║██║  ██║███████╗██████╔╝",
    "   ╚═════╝ ╚═╝   ╚═╝          ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ",
  ].join("\n");

  const BUILDER_TYPES = [
    {
      key: "pathfinder",
      weights: { pattern: 1.4, explore: 1.1, logic: 0.7, facts: 0.5 },
      title: { en: "The Pathfinder", zh: "寻径者" },
      summary: {
        en: "You find direction in the mess before the path is obvious.",
        zh: "在混沌中率先找到方向。",
      },
      strengths: {
        en: [
          "Turns vague situations into a possible path.",
          "Spots leverage before every detail is settled.",
        ],
        zh: [
          "能把模糊局面压成可前进的方向。",
          "常在细节完全确定前找到杠杆点。",
        ],
      },
      environment: {
        en: "Early-stage problems, unclear goals, and work that needs a first direction.",
        zh: "早期问题、不清楚的目标、需要先找到方向的任务。",
      },
      watch: {
        en: "Do not move so far ahead that others cannot see why this path matters.",
        zh: "别走得太快，导致别人还没看懂为什么要走这条路。",
      },
      next: {
        en: "Write the path in one page: what matters, what to ignore, and the next bet.",
        zh: "用一页写清楚：什么重要、先忽略什么、下一步押注什么。",
      },
    },
    {
      key: "shaper",
      weights: { pattern: 1.1, empathy: 0.9, closure: 0.8, solo: 0.6 },
      title: { en: "The Shaper", zh: "塑形者" },
      summary: {
        en: "You turn rough ideas into clear form.",
        zh: "把粗糙想法打磨成清晰形态。",
      },
      strengths: {
        en: [
          "Makes fuzzy ideas easier to understand and use.",
          "Balances direction, boundaries, and human context.",
        ],
        zh: [
          "能让粗糙想法变得更清楚、更可用。",
          "会同时处理方向、边界和人的处境。",
        ],
      },
      environment: {
        en: "Messy drafts, half-formed ideas, and work that needs a clearer shape.",
        zh: "混乱草稿、半成型想法、需要被整理成形的工作。",
      },
      watch: {
        en: "Avoid polishing the story before the strongest facts are visible.",
        zh: "避免在关键事实还不清楚前，就把叙事打磨得太完整。",
      },
      next: {
        en: "Turn one rough idea into a simple version with a clear boundary.",
        zh: "挑一个粗糙想法，做成边界清楚的简单版本。",
      },
    },
    {
      key: "shipstarter",
      weights: { explore: 1.1, closure: 1.0, facts: 0.7, logic: 0.6 },
      title: { en: "The Shipstarter", zh: "启航者" },
      summary: {
        en: "You create momentum with the first working version.",
        zh: "用第一个版本快速撬动进展。",
      },
      strengths: {
        en: [
          "Gets work moving before everything is perfectly known.",
          "Uses small shipped pieces to create real feedback.",
        ],
        zh: [
          "能在信息还不完美时先推动起来。",
          "会用小版本换来真实反馈。",
        ],
      },
      environment: {
        en: "Blocked projects, first versions, and teams that need visible progress.",
        zh: "卡住的项目、第一版产品、需要看见进展的团队。",
      },
      watch: {
        en: "Speed helps most when the first version still has a clear learning goal.",
        zh: "速度最有价值的时候，是第一版仍然有清楚的学习目标。",
      },
      next: {
        en: "Ship one small version and decide what signal would make the next step clear.",
        zh: "先推出一个小版本，并定义什么信号能决定下一步。",
      },
    },
    {
      key: "synthesizer",
      weights: { facts: 1.0, pattern: 1.0, solo: 0.9, logic: 0.8 },
      title: { en: "The Synthesizer", zh: "融通者" },
      summary: {
        en: "You combine scattered signals into a complete judgment.",
        zh: "把零散信息整合成完整判断。",
      },
      strengths: {
        en: [
          "Connects details, patterns, and tradeoffs into one view.",
          "Can explain why a choice makes sense across different inputs.",
        ],
        zh: [
          "能把细节、模式和取舍合成一个完整视角。",
          "能解释一个选择为什么能穿过不同信息成立。",
        ],
      },
      environment: {
        en: "Research, planning, complex decisions, and work with many partial signals.",
        zh: "调研、规划、复杂决策、信息来源很多但都不完整的任务。",
      },
      watch: {
        en: "Do not wait for perfect synthesis when the team needs a timely call.",
        zh: "团队需要及时决策时，不要一直等到整合得完美。",
      },
      next: {
        en: "Summarize the decision as three signals, two tradeoffs, and one call.",
        zh: "把决策压缩成三个信号、两个取舍、一个判断。",
      },
    },
    {
      key: "debugger",
      weights: { facts: 1.2, logic: 1.1, solo: 0.8, explore: 0.4 },
      title: { en: "The Debugger", zh: "洞察者" },
      summary: {
        en: "You look past symptoms to find the root cause.",
        zh: "穿透表象，找到问题根源。",
      },
      strengths: {
        en: [
          "Trusts concrete traces more than surface explanations.",
          "Separates symptoms, causes, and fixes.",
        ],
        zh: [
          "更相信具体痕迹，而不是表面解释。",
          "能拆开症状、原因和修法。",
        ],
      },
      environment: {
        en: "Broken flows, unclear failures, quality issues, and decisions that need rigor.",
        zh: "坏掉的流程、不清楚的失败、质量问题、需要严谨判断的任务。",
      },
      watch: {
        en: "Root-cause work lands better when collaborators see the decision point early.",
        zh: "越早让协作者看见决策点，根因分析越容易落地。",
      },
      next: {
        en: "Write the failure as observed fact, likely cause, test, and fix.",
        zh: "把问题写成：观察事实、可能原因、验证方式、修复动作。",
      },
    },
    {
      key: "catalyst",
      weights: { collab: 1.2, empathy: 1.0, closure: 0.9, explore: 0.5 },
      title: { en: "The Catalyst", zh: "催化者" },
      summary: {
        en: "You speed up coordination between people, ideas, and tasks.",
        zh: "加速人、想法与任务的协同。",
      },
      strengths: {
        en: [
          "Creates momentum by bringing the right people and signals together.",
          "Keeps work moving without ignoring trust or morale.",
        ],
        zh: [
          "能把相关的人和信号拉到一起，制造推进力。",
          "推动事情时也会照顾信任和士气。",
        ],
      },
      environment: {
        en: "Cross-functional work, feedback loops, community energy, and blocked coordination.",
        zh: "跨职能协作、反馈循环、社区能量、协同卡住的场景。",
      },
      watch: {
        en: "Do not let alignment meetings replace clear ownership and next steps.",
        zh: "不要让对齐本身替代明确 owner 和下一步。",
      },
      next: {
        en: "Name the owner, the open question, and the next conversation that unlocks progress.",
        zh: "写清 owner、当前问题，以及能解锁进展的下一次对话。",
      },
    },
  ];

  const COPY = {
    en: {
      resultTitle: "AI-native builder card",
      youAre: "You are:",
      strengthsTitle: "Your strengths",
      environmentTitle: "Best environment",
      watchTitle: "Watch out",
      nextTitle: "Next step",
      shareResult: "share",
      shared: "image copied",
      textCopied: "text copied",
      copyAgentPrompt: "Copy agent prompt",
      promptCopied: "prompt copied",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "Back",
    },
    zh: {
      resultTitle: "AI-native builder 卡片",
      youAre: "你是：",
      strengthsTitle: "你的优势",
      environmentTitle: "你最适合的场景",
      watchTitle: "需要注意",
      nextTitle: "下一步建议",
      shareResult: "分享",
      shared: "图片已复制",
      textCopied: "文字已复制",
      copyAgentPrompt: "复制 Agent 指令",
      promptCopied: "指令已复制",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "返回",
    },
  };

  function currentLang() {
    const lang = document.documentElement.dataset.lang || document.body?.dataset.lang;
    return lang === "zh" ? "zh" : "en";
  }

  function text(lang, key) {
    return COPY[lang][key];
  }

  function localized(value, lang) {
    return value[lang] || value.en || "";
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
    return BUILDER_TYPES
      .map((builder) => {
        const weights = Object.entries(builder.weights);
        const totalWeight = weights.reduce((sum, [, weight]) => sum + weight, 0);
        const value = weights.reduce((sum, [signal, weight]) => sum + (scores[signal] || 0) * weight, 0);
        return {
          builder,
          value: value / totalWeight,
        };
      })
      .sort((a, b) => b.value - a.value)[0].builder;
  }

  function scoreQuickTest(form) {
    const scores = Object.fromEntries(SIGNAL_KEYS.map((key) => [key, 0]));
    selectedOptions(form).forEach((option) => {
      SIGNAL_KEYS.forEach((signal) => {
        scores[signal] += datasetNumber(option, signalDatasetKey(signal));
      });
    });

    return {
      builder: scoreBuilder(scores),
    };
  }

  function answeredCount(form) {
    return selectedOptions(form).length;
  }

  function renderStrengths(builder, lang) {
    const section = makeElement("section", "builder-card-section");
    section.append(makeElement("h3", "", text(lang, "strengthsTitle")));
    const list = makeElement("ul", "builder-list");
    localized(builder.strengths, lang).forEach((item) => {
      list.append(makeElement("li", "", item));
    });
    section.append(list);
    return section;
  }

  function renderTextSection(title, value) {
    const section = makeElement("section", "builder-card-section");
    section.append(
      makeElement("h3", "", title),
      makeElement("p", "", value)
    );
    return section;
  }

  function buildResultText(result, lang) {
    const builder = result.builder;
    const strengths = localized(builder.strengths, lang).map((item) => "- " + item).join("\n");
    return [
      "git-hired",
      lang === "zh"
        ? text(lang, "youAre") + localized(builder.title, lang)
        : text(lang, "youAre") + " " + localized(builder.title, lang),
      localized(builder.summary, lang),
      "",
      text(lang, "strengthsTitle") + ":",
      strengths,
      "",
      text(lang, "environmentTitle") + ":",
      localized(builder.environment, lang),
      "",
      text(lang, "watchTitle") + ":",
      localized(builder.watch, lang),
      "",
      text(lang, "nextTitle") + ":",
      localized(builder.next, lang),
      "",
      RESULT_URL,
    ].join("\n");
  }

  function renderResultCard(host, result, lang) {
    if (!host || !result) return;
    const builder = result.builder;
    const ascii = makeElement("pre", "builder-card-ascii", ASCII_GIT_HIRED);
    const identity = makeElement("div", "builder-identity");
    identity.append(
      makeElement("span", "builder-card-kicker", text(lang, "resultTitle")),
      makeElement(
        "strong",
        "builder-card-type",
        lang === "zh"
          ? text(lang, "youAre") + localized(builder.title, lang)
          : text(lang, "youAre") + " " + localized(builder.title, lang)
      ),
      makeElement("p", "builder-card-summary", localized(builder.summary, lang))
    );

    host.replaceChildren(
      ascii,
      identity,
      renderStrengths(builder, lang),
      renderTextSection(text(lang, "environmentTitle"), localized(builder.environment, lang)),
      renderTextSection(text(lang, "watchTitle"), localized(builder.watch, lang)),
      renderTextSection(text(lang, "nextTitle"), localized(builder.next, lang))
    );
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

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, value, maxWidth) {
    const raw = String(value || "").trim();
    if (!raw) return [];
    const chunks = /[\u3400-\u9fff]/.test(raw)
      ? Array.from(raw)
      : raw.split(/(\s+)/).filter(Boolean);
    const lines = [];
    let line = "";
    chunks.forEach((chunk) => {
      const next = line + chunk;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line.trim());
        line = chunk.trimStart();
      } else {
        line = next;
      }
    });
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  function drawWrappedText(ctx, value, x, y, maxWidth, lineHeight, maxLines) {
    const lines = wrapText(ctx, value, maxWidth);
    const visible = typeof maxLines === "number" ? lines.slice(0, maxLines) : lines;
    visible.forEach((line, index) => {
      ctx.fillText(line, x, y + index * lineHeight);
    });
    return y + visible.length * lineHeight;
  }

  function drawShareSection(ctx, title, body, x, y, maxWidth) {
    ctx.font = "600 26px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#8ee88f";
    ctx.fillText(title.toUpperCase(), x, y);
    ctx.font = "400 31px Inter, MiSans, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#dce3dc";
    return drawWrappedText(ctx, body, x, y + 42, maxWidth, 40, 3) + 24;
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to render share image."));
        }
      }, "image/png");
    });
  }

  function renderShareImage(result, lang) {
    const builder = result.builder;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.reject(new Error("Canvas is unavailable."));

    ctx.fillStyle = "#080a09";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(142, 232, 143, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 72) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 72) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const cardX = 56;
    const cardY = 56;
    const cardWidth = canvas.width - cardX * 2;
    const cardHeight = canvas.height - cardY * 2;
    roundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 28);
    ctx.fillStyle = "#111512";
    ctx.fill();
    ctx.strokeStyle = "rgba(142, 232, 143, 0.42)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const x = cardX + 52;
    const maxWidth = cardWidth - 104;
    let y = cardY + 78;

    ctx.font = "500 21px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#8ee88f";
    ASCII_GIT_HIRED.split("\n").forEach((line) => {
      ctx.fillText(line, x - 16, y);
      y += 25;
    });
    y += 38;

    ctx.font = "500 26px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#7a847c";
    ctx.fillText("AI-native builder card", x, y);
    y += 74;

    ctx.font = lang === "zh"
      ? "700 68px MiSans, PingFang SC, Microsoft YaHei, sans-serif"
      : "700 66px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#8ee88f";
    y = drawWrappedText(
      ctx,
      lang === "zh"
        ? text(lang, "youAre") + localized(builder.title, lang)
        : text(lang, "youAre") + " " + localized(builder.title, lang),
      x,
      y,
      maxWidth,
      76,
      2
    ) + 18;

    ctx.font = "400 36px Inter, MiSans, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#edf4ed";
    y = drawWrappedText(ctx, localized(builder.summary, lang), x, y, maxWidth, 48, 2) + 40;

    y = drawShareSection(ctx, text(lang, "strengthsTitle"), localized(builder.strengths, lang).join("  /  "), x, y, maxWidth);
    y = drawShareSection(ctx, text(lang, "environmentTitle"), localized(builder.environment, lang), x, y, maxWidth);
    y = drawShareSection(ctx, text(lang, "watchTitle"), localized(builder.watch, lang), x, y, maxWidth);
    y = drawShareSection(ctx, text(lang, "nextTitle"), localized(builder.next, lang), x, y, maxWidth);

    ctx.strokeStyle = "rgba(142, 232, 143, 0.24)";
    ctx.beginPath();
    ctx.moveTo(x, canvas.height - 154);
    ctx.lineTo(x + maxWidth, canvas.height - 154);
    ctx.stroke();
    ctx.font = "500 24px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#7a847c";
    ctx.fillText("git-hired · local-first · share what you want", x, canvas.height - 104);
    ctx.fillStyle = "#8ee88f";
    ctx.fillText(RESULT_URL, x, canvas.height - 66);

    return canvasToBlob(canvas);
  }

  function copyShareImage(result, lang) {
    if (navigator.clipboard && typeof navigator.clipboard.write === "function" && typeof ClipboardItem !== "undefined") {
      return navigator.clipboard.write([
        new ClipboardItem({ "image/png": renderShareImage(result, lang) }),
      ]).then(() => "image").catch(() => copyText(buildResultText(result, lang)).then(() => "text"));
    }
    return copyText(buildResultText(result, lang)).then(() => "text");
  }

  function setCopyLabel(button, selector, copied, idleKey, copiedKey) {
    if (!button) return;
    button.dataset.copyState = copied ? "copied" : "idle";
    button.querySelectorAll(selector).forEach((label) => {
      const lang = label.dataset.lang === "zh" ? "zh" : "en";
      label.textContent = copied ? COPY[lang][copiedKey] : COPY[lang][idleKey];
    });
  }

  function init() {
    const form = document.getElementById("quick-test-form");
    const steps = Array.from(document.querySelectorAll(".quick-step"));
    const progressLabel = document.getElementById("quick-progress-label");
    const progressFill = document.getElementById("quick-progress-fill");
    const resultShell = document.getElementById("quick-result");
    const resultCard = document.getElementById("result-card");
    const shareResultButton = document.getElementById("share-result");
    const copyAgentButton = document.getElementById("copy-agent-prompt");
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
    let agentCopyTimer = 0;
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
      document.body.classList.add("result-mode");
      setCopyLabel(shareResultButton, ".share-label", false, "shareResult", "shared");
      setCopyLabel(copyAgentButton, ".agent-copy-label", false, "copyAgentPrompt", "promptCopied");
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
        document.body.classList.remove("result-mode");
        if (resultShell) resultShell.classList.add("is-hidden");
        window.clearTimeout(copyTimer);
        window.clearTimeout(agentCopyTimer);
        setCopyLabel(shareResultButton, ".share-label", false, "shareResult", "shared");
        setCopyLabel(copyAgentButton, ".agent-copy-label", false, "copyAgentPrompt", "promptCopied");
        renderStep();
        window.requestAnimationFrame(() => {
          const y = form.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top: y, behavior: "smooth" });
        });
      });
    });

    if (shareResultButton) {
      shareResultButton.addEventListener("click", () => {
        if (!lastResult) return;
        const lang = currentLang();
        lastResultText = buildResultText(lastResult, lang);
        copyShareImage(lastResult, lang).then((mode) => {
          setCopyLabel(shareResultButton, ".share-label", true, "shareResult", mode === "image" ? "shared" : "textCopied");
          window.clearTimeout(copyTimer);
          copyTimer = window.setTimeout(() => setCopyLabel(shareResultButton, ".share-label", false, "shareResult", "shared"), 1600);
        });
      });
    }

    if (copyAgentButton) {
      copyAgentButton.addEventListener("click", () => {
        copyText(AGENT_PROMPT).then(() => {
          setCopyLabel(copyAgentButton, ".agent-copy-label", true, "copyAgentPrompt", "promptCopied");
          window.clearTimeout(agentCopyTimer);
          agentCopyTimer = window.setTimeout(() => setCopyLabel(copyAgentButton, ".agent-copy-label", false, "copyAgentPrompt", "promptCopied"), 1400);
        });
      });
    }

    new MutationObserver(() => {
      renderStep();
      if (lastResult && resultCard) {
        const lang = currentLang();
        lastResultText = buildResultText(lastResult, lang);
        renderResultCard(resultCard, lastResult, lang);
        setCopyLabel(shareResultButton, ".share-label", shareResultButton?.dataset.copyState === "copied", "shareResult", "shared");
        setCopyLabel(copyAgentButton, ".agent-copy-label", copyAgentButton?.dataset.copyState === "copied", "copyAgentPrompt", "promptCopied");
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
