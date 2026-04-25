/* global window, document, MutationObserver */
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
      resultLabel: "Your quick result",
      confirmedTitle: "What looks clear",
      unknownTitle: "What is still unknown",
      noConfirmed: "No axis is strong enough yet.",
      noUnknown: "No unknown axes in this quick run.",
      starMeaning: "`*` means this part is still unclear from these 10 answers.",
      simple: "This is only a simple 10-question self-report test.",
      detail: "For a detailed evidence-based result, open the GitHub repo and run the deeper test through Claude Code, Codex, or a similar work agent.",
      cta: "CTA",
      repo: "GitHub repo",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "Back",
    },
    zh: {
      resultTitle: "快速 MBTI 工作信号",
      resultLabel: "你的快速结论",
      confirmedTitle: "比较确定的部分",
      unknownTitle: "仍然未知的部分",
      noConfirmed: "目前没有足够确定的轴。",
      noUnknown: "这次快速测试里没有未知轴。",
      starMeaning: "`*` 表示这部分仅凭 10 道题还判断不稳。",
      simple: "这只是一个 10 题简化自评测试。",
      detail: "如果需要详细、基于真实工作证据的结果，请回到 GitHub repo，用 Claude Code、Codex 或类似工作 agent 运行深度测试。",
      cta: "下一步",
      repo: "GitHub 仓库",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "返回",
    },
  };

  const LETTER_COPY = {
    E: {
      en: "E: You seem to move work forward through live interaction with people.",
      zh: "E：你更像是通过和人实时互动来推进工作。",
    },
    I: {
      en: "I: You seem to move work forward by thinking, writing, and structuring first.",
      zh: "I：你更像是先自己思考、书写、结构化，再推进工作。",
    },
    S: {
      en: "S: You seem to trust concrete facts, examples, and details first.",
      zh: "S：你更信具体事实、案例和细节。",
    },
    N: {
      en: "N: You seem to look for patterns, direction, and future leverage first.",
      zh: "N：你更先看模式、方向和未来杠杆。",
    },
    T: {
      en: "T: You seem to decide through logic, standards, and tradeoffs.",
      zh: "T：你更常用逻辑、标准和取舍来决策。",
    },
    F: {
      en: "F: You seem to weigh people, trust, morale, and user impact heavily.",
      zh: "F：你更重视人的处境、信任、士气和用户影响。",
    },
    J: {
      en: "J: You seem to prefer clear closure, ownership, and next steps.",
      zh: "J：你更偏好清晰收口、负责人和下一步。",
    },
    P: {
      en: "P: You seem to prefer keeping options open while evidence changes.",
      zh: "P：你更偏好在证据变化时保留选项、继续调整。",
    },
  };

  const AXIS_UNKNOWN_COPY = {
    "E/I": {
      en: "E/I: Your answers mix live interaction and solo processing.",
      zh: "E/I：你的答案同时出现了实时互动和独立消化。",
    },
    "S/N": {
      en: "S/N: Your answers mix concrete detail and big-picture pattern reading.",
      zh: "S/N：你的答案同时出现了具体细节和整体模式判断。",
    },
    "T/F": {
      en: "T/F: Your answers mix logic-first and people-impact-first decisions.",
      zh: "T/F：你的答案同时出现了逻辑优先和人的影响优先。",
    },
    "J/P": {
      en: "J/P: Your answers mix clear closure and flexible exploration.",
      zh: "J/P：你的答案同时出现了清晰收口和弹性探索。",
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
    const confirmed = result.axes
      .filter((axis) => axis.confident)
      .map((axis) => "- " + LETTER_COPY[axis.winner][lang]);
    const unknown = result.axes
      .filter((axis) => !axis.confident)
      .map((axis) => "- " + AXIS_UNKNOWN_COPY[axis.left + "/" + axis.right][lang]);

    return [
      "# HIRED",
      text(lang, "resultTitle"),
      "",
      text(lang, "resultLabel") + ": " + result.type,
      text(lang, "starMeaning"),
      "",
      text(lang, "confirmedTitle") + ":",
      confirmed.length ? confirmed.join("\n") : "- " + text(lang, "noConfirmed"),
      "",
      text(lang, "unknownTitle") + ":",
      unknown.length ? unknown.join("\n") : "- " + text(lang, "noUnknown"),
      "",
      text(lang, "simple"),
      text(lang, "detail"),
      "",
      text(lang, "cta") + ": " + text(lang, "repo") + " -> " + REPO_URL,
    ].join("\n");
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
