/* global window, document, navigator, MutationObserver */
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
      resultTitle: "QUICK MBTI WORK SIGNAL",
      resultLabel: "High-confidence result",
      unknownLabel: "Unknown axes",
      noUnknown: "none",
      axisTitle: "Axis read",
      simple: "This is only a simple 10-question self-report test.",
      detail: "For a detailed evidence-based result, open the GitHub repo and run the deeper test through Claude Code, Codex, or a similar work agent.",
      cta: "CTA",
      repo: "GitHub repo",
      shareTitle: "git-hired quick MBTI signal",
      copied: "Copied",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "Back",
    },
    zh: {
      resultTitle: "快速 MBTI 工作信号",
      resultLabel: "高置信结论",
      unknownLabel: "未知轴",
      noUnknown: "无",
      axisTitle: "四轴判断",
      simple: "这只是一个 10 题简化自评测试。",
      detail: "如果需要详细、基于真实工作证据的结果，请回到 GitHub repo，用 Claude Code、Codex 或类似工作 agent 运行深度测试。",
      cta: "下一步",
      repo: "GitHub 仓库",
      shareTitle: "git-hired 快速 MBTI 信号",
      copied: "已复制",
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

  function buildResultText(result, lang) {
    const unknown = result.axes
      .filter((axis) => !axis.confident)
      .map((axis) => axis.left + "/" + axis.right);
    const axisLines = result.axes.map((axis) => {
      const value = axis.confident ? axis.winner : "*";
      return axis.left + "/" + axis.right + ": " + value + "  (" + axis.leftScore + " - " + axis.rightScore + ")";
    });

    return [
      "# HIRED",
      text(lang, "resultTitle"),
      "",
      text(lang, "resultLabel") + ": " + result.type,
      text(lang, "unknownLabel") + ": " + (unknown.length ? unknown.join(", ") : text(lang, "noUnknown")),
      "",
      text(lang, "axisTitle") + ":",
      axisLines.join("\n"),
      "",
      text(lang, "simple"),
      text(lang, "detail"),
      "",
      text(lang, "cta") + ": " + text(lang, "repo") + " -> " + REPO_URL,
    ].join("\n");
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }
    return new Promise((resolve, reject) => {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  function flashButton(button, lang) {
    if (!button) return;
    const original = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = original;
    button.textContent = text(lang, "copied");
    window.setTimeout(() => {
      button.textContent = original;
    }, 1200);
  }

  function init() {
    const form = document.getElementById("quick-test-form");
    const steps = Array.from(document.querySelectorAll(".quick-step"));
    const progressLabel = document.getElementById("quick-progress-label");
    const progressFill = document.getElementById("quick-progress-fill");
    const resultShell = document.getElementById("quick-result");
    const resultCard = document.getElementById("result-card");
    const backButtons = [
      document.getElementById("quick-back"),
      document.getElementById("quick-back-zh"),
    ].filter(Boolean);
    const shareButtons = [
      document.getElementById("share-result"),
      document.getElementById("share-result-zh"),
    ].filter(Boolean);
    const copyButtons = [
      document.getElementById("copy-result"),
      document.getElementById("copy-result-zh"),
    ].filter(Boolean);
    const retakeButtons = [
      document.getElementById("retake-test"),
      document.getElementById("retake-test-zh"),
    ].filter(Boolean);

    if (!form || !steps.length) return;

    let currentIndex = 0;
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
      if (resultCard) resultCard.textContent = lastResultText;
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

    copyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const lang = currentLang();
        const value = lastResult ? buildResultText(lastResult, lang) : lastResultText;
        if (!value) return;
        copyText(value).then(() => flashButton(button, lang)).catch(() => {});
      });
    });

    shareButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const lang = currentLang();
        const value = lastResult ? buildResultText(lastResult, lang) : lastResultText;
        if (!value) return;
        if (navigator.share) {
          try {
            await navigator.share({ title: text(lang, "shareTitle"), text: value, url: REPO_URL });
            return;
          } catch (error) {
            // User canceled or Web Share failed; fall back to copy.
          }
        }
        copyText(value).then(() => flashButton(button, lang)).catch(() => {});
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
        renderStep();
        window.requestAnimationFrame(() => {
          const y = form.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top: y, behavior: "smooth" });
        });
      });
    });

    new MutationObserver(() => {
      renderStep();
      if (lastResult && resultCard) {
        lastResultText = buildResultText(lastResult, currentLang());
        resultCard.textContent = lastResultText;
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
