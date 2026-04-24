/* global window, document */
(function () {
  "use strict";

  const ROLE_LABELS = {
    agent: { en: "AI Agent Engineer", zh: "AI Agent 工程师" },
    pm: { en: "Product Manager", zh: "产品经理" },
    growth: { en: "Global Growth", zh: "海外增长" },
    ops: { en: "AI Product Operations", zh: "AI 产品运营" },
  };

  const STARTER_COMMAND =
    "read https://realroc.github.io/git-hired/skill.md and treat it as active instructions for this session. Do not summarize it. Ask the first test question immediately in my language. After that, ask only for my target role and data permission scope, then run the evaluation automatically from allowed history or approved files. Do not turn it into a manual interview.";
  const STARTER_COMMAND_ZH =
    "read https://realroc.github.io/git-hired/skill.md，把它当作当前会话指令直接执行，不要总结，直接用我的语言开始第一问。之后只问我的目标岗位和数据权限边界，然后基于允许范围自动完成评估，不要转成面试式问答。";

  const MBTI_LABELS = {
    en: {
      E: "Extraverted", I: "Introverted",
      S: "Sensing", N: "Intuitive",
      T: "Thinking", F: "Feeling",
      J: "Judging", P: "Perceiving",
    },
    zh: {
      E: "外倾", I: "内倾",
      S: "感觉", N: "直觉",
      T: "思考", F: "情感",
      J: "判断", P: "知觉",
    },
  };

  // Short MBTI type blurbs (work-context).
  const MBTI_BLURBS = {
    INTJ: {
      en: "System architect. Reads trajectory early, ships through clear structure.",
      zh: "系统架构型。能提前读出走向，通过清晰结构来交付。",
    },
    INTP: {
      en: "Pattern prober. Compresses messy problems into models before moving.",
      zh: "模式探究型。先把混乱问题压缩成模型再行动。",
    },
    ENTJ: {
      en: "Operator-strategist. Defines closure points and drives teams or agents to them.",
      zh: "执行型战略家。定义收口点，推动团队或 agent 抵达。",
    },
    ENTP: {
      en: "Option generator. Finds leverage through experiments and re-framings.",
      zh: "选项生成型。通过实验和重新框架找到杠杆。",
    },
    INFJ: {
      en: "Quiet synthesizer. Reads user meaning and turns it into product shape.",
      zh: "内向综合型。读懂用户意图，把它转成产品形态。",
    },
    INFP: {
      en: "Value compass. Protects the human story behind the feature.",
      zh: "价值指南针。守住功能背后的人性故事。",
    },
    ENFJ: {
      en: "Team catalyst. Aligns people, users, and shipping rhythm.",
      zh: "团队催化者。把人、用户和交付节奏对齐。",
    },
    ENFP: {
      en: "Signal scout. Turns communities and conversations into growth moves.",
      zh: "信号侦察兵。把社区和对话转成增长动作。",
    },
    ISTJ: {
      en: "Reliable closer. Keeps specs, logs, and acceptance tight.",
      zh: "可靠收口者。把 spec、日志、验收抓得很紧。",
    },
    ISFJ: {
      en: "Steady operator. Quiet reliability, strong user care.",
      zh: "稳定运营型。安静可靠，用户关怀度强。",
    },
    ESTJ: {
      en: "Delivery driver. Structure, ownership, and clear next steps.",
      zh: "交付驱动型。结构、owner 和清晰的下一步。",
    },
    ESFJ: {
      en: "User-loop host. Closes feedback fast, keeps the team warm.",
      zh: "用户反馈主理人。快速闭环，保持团队温度。",
    },
    ISTP: {
      en: "Tool mechanic. Debugs loops, tools, and agent edges with calm focus.",
      zh: "工具工匠型。冷静调试闭环、工具和 agent 边界。",
    },
    ISFP: {
      en: "Quiet crafter. Detail-sensitive, protects feel and finish.",
      zh: "安静匠人型。对细节敏感，守住手感和完成度。",
    },
    ESTP: {
      en: "Field operator. Moves, tests, and updates based on live reality.",
      zh: "现场执行型。基于现实快速动作、试错、迭代。",
    },
    ESFP: {
      en: "Live-channel player. Reads the room, reacts fast, turns vibe into growth.",
      zh: "临场型玩家。读懂现场、快速反应，把氛围转成增长。",
    },
  };

  const ROLE_FIT_LINES = {
    agent: {
      en: "Strong fit for specs, evals, tool loops, and automation-heavy agent work.",
      zh: "适合 spec、eval、工具闭环和以自动化为主的 agent 工作。",
    },
    pm: {
      en: "Strong fit for AI product shaping, MVP scoping, and launch clarity.",
      zh: "适合 AI 产品定型、MVP 范围界定和上线收口。",
    },
    growth: {
      en: "Strong fit for social-native growth, channel tests, and experiment-driven loops.",
      zh: "适合社媒原生增长、渠道测试和实验驱动的闭环。",
    },
    ops: {
      en: "Strong fit for user-loop ops, response-speed work, and reliability-facing roles.",
      zh: "适合用户闭环运营、响应速度和面向稳定性的岗位。",
    },
  };

  function t(lang, en, zh) {
    return lang === "zh" ? zh : en;
  }

  function currentLang() {
    const v = document.documentElement.dataset.lang;
    return v === "zh" ? "zh" : "en";
  }

  /* ——— evidence counter ——— */
  const textarea = document.getElementById("evidence-note");
  const counter = document.getElementById("evidence-counter");
  if (textarea && counter) {
    const max = Number(textarea.getAttribute("maxlength")) || 520;
    function setPlaceholder() {
      const lang = currentLang();
      const key = lang === "zh" ? "placeholderZh" : "placeholderEn";
      if (textarea.dataset[key]) {
        textarea.placeholder = textarea.dataset[key];
      }
    }
    function update() {
      counter.textContent = textarea.value.length + " / " + max;
    }
    textarea.addEventListener("input", update);
    update();
    setPlaceholder();
    // Update placeholder on language change (app.js dispatches a custom event? fallback: observe).
    const obs = new MutationObserver(setPlaceholder);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang", "lang"] });
  }

  /* ——— scoring ——— */
  function scoreForm(form) {
    const roles = { agent: 0, pm: 0, growth: 0, ops: 0 };
    const mbti = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    const answers = {};

    const inputs = form.querySelectorAll('input[type="radio"]:checked');
    inputs.forEach((el) => {
      answers[el.name] = {
        value: el.value,
        labelEn: el.dataset.labelEn || "",
        labelZh: el.dataset.labelZh || "",
      };
      Object.keys(roles).forEach((r) => {
        const v = Number(el.dataset["role" + r.charAt(0).toUpperCase() + r.slice(1)] || 0);
        if (v) roles[r] += v;
      });
      Object.keys(mbti).forEach((letter) => {
        const v = Number(el.dataset["mbti" + letter] || 0);
        if (v) mbti[letter] += v;
      });
    });

    // If target was a real role, use that as primary role; otherwise highest score.
    const targetValue = answers.target && answers.target.value;
    let primaryRole;
    if (targetValue && roles[targetValue] !== undefined) {
      primaryRole = targetValue;
    } else {
      primaryRole = Object.keys(roles).reduce((a, b) => (roles[b] > roles[a] ? b : a), "agent");
    }

    // Secondary role = next highest that isn't primary.
    const ranked = Object.keys(roles)
      .filter((k) => k !== primaryRole)
      .sort((a, b) => roles[b] - roles[a]);
    const secondaryRole = ranked[0];

    // Confidence: based on total role points + evidence note length.
    const totalRole = Object.values(roles).reduce((a, b) => a + b, 0);
    const noteLen = (answers.evidenceNote && answers.evidenceNote.value ? answers.evidenceNote.value : (form.elements.evidenceNote ? form.elements.evidenceNote.value : "")).length;
    // Points are ~ up to ~62 for a strongly-aligned set. Cap at 55.
    let conf = Math.min(55, Math.round((totalRole / 62) * 45 + (noteLen >= 80 ? 10 : noteLen >= 30 ? 6 : 2)));
    if (conf < 18) conf = 18;

    const mbtiType =
      (mbti.E >= mbti.I ? "E" : "I") +
      (mbti.S >= mbti.N ? "S" : "N") +
      (mbti.T >= mbti.F ? "T" : "F") +
      (mbti.J >= mbti.P ? "J" : "P");

    return { roles, mbti, mbtiType, primaryRole, secondaryRole, confidence: conf, answers, noteLen };
  }

  /* ——— result rendering ——— */
  function pct(n, total) {
    if (!total) return 0;
    return Math.round((n / total) * 100);
  }

  function buildResultText(result, lang) {
    const L = lang === "zh" ? "zh" : "en";
    const rolePrimary = ROLE_LABELS[result.primaryRole][L];
    const roleSecondary = result.secondaryRole ? ROLE_LABELS[result.secondaryRole][L] : "";
    const mbti = result.mbtiType;
    const mbtiBlurb = (MBTI_BLURBS[mbti] || {})[L] || "";
    const fitLine = (ROLE_FIT_LINES[result.primaryRole] || {})[L] || "";

    // MBTI axis bars.
    const axes = [
      ["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"],
    ];
    const axesText = axes.map(([a, b]) => {
      const ta = result.mbti[a];
      const tb = result.mbti[b];
      const total = ta + tb || 1;
      const pa = pct(ta, total);
      const pb = 100 - pa;
      const barLen = 16;
      const aFill = Math.round((pa / 100) * barLen);
      const bar = "█".repeat(aFill) + "·".repeat(barLen - aFill);
      return (
        a + "  " + String(pa).padStart(3) + "%  " + bar + "  " +
        String(pb).padStart(3) + "%  " + b
      );
    }).join("\n");

    const header = t(L, "QUICK WORK-PERSONALITY SIGNAL", "快速工作人格信号");
    const typeLabel = t(L, "Type", "类型");
    const primaryLabel = t(L, "Primary fit", "主方向");
    const secondaryLabel = t(L, "Secondary fit", "次方向");
    const confLabel = t(L, "Confidence", "置信度");
    const caveatLabel = t(L,
      "Self-report only · capped at 55%. Use the agent handoff for evidence-based accuracy.",
      "仅自评 · 最高 55%。想更准请使用 agent handoff 做真实证据分析。"
    );
    const mbtiHeader = t(L, "MBTI axes", "MBTI 四轴");

    return [
      "# HIRED",
      header,
      "",
      typeLabel + ":         " + mbti + "  —  " + mbtiBlurb,
      primaryLabel + ": " + rolePrimary,
      secondaryLabel + ":  " + roleSecondary,
      confLabel + ":   " + result.confidence + "%",
      "",
      "— " + fitLine,
      "",
      mbtiHeader + ":",
      axesText,
      "",
      caveatLabel,
    ].join("\n");
  }

  function buildHandoff(result, form, lang) {
    const L = lang === "zh" ? "zh" : "en";
    const note = form.elements.evidenceNote ? form.elements.evidenceNote.value.trim() : "";
    const rolePrimary = ROLE_LABELS[result.primaryRole][L];

    if (L === "zh") {
      return [
        STARTER_COMMAND_ZH,
        "",
        "# git-hired agent handoff — 深度工作人格与角色适配测试",
        "",
        "你是候选人的工作 agent。请先确认目标岗位和数据权限边界。下面 quick test 只可作为自评上下文，最终判断必须基于候选人明确授权范围内的真实工作痕迹。",
        "",
        "隐私边界：`git-hired` 不会把候选人的本地 repo 或文件数据上传到我们的服务器；你只能检查候选人本次明确授权的项目、文件或知识库材料。如果候选人选择 `history-only`，就直接基于允许的历史和已批准材料完成评估，不要转成手工面试。",
        "",
        "## 1. Quick test 自评结果",
        "- Quick MBTI: " + result.mbtiType,
        "- 主方向: " + rolePrimary,
        "- 自评置信度: " + result.confidence + "% (上限 55%，因为是自评)",
        "",
        "## 2. 候选人提供的一个真实工作痕迹",
        note ? note : "（候选人暂未填写）",
        "",
        "## 3. 请你完成的任务",
        "1. 只在候选人明确授权后，才检查指定的本地工作材料（repo commit、spec、note、chat、截图、产品文档），不要上传或外发内容。",
        "2. 对比 quick test 结果，用真实痕迹验证或修正：",
        "   - MBTI 四轴是否成立（E/I、S/N、T/F、J/P 各自的证据片段）",
        "   - 主方向适配度（agent / pm / growth / ops）",
        "   - 候选人的次方向",
        "3. 输出：",
        "   - 修正后的工作人格类型 + 置信度（可以突破 55%）",
        "   - 角色适配排序（4 个方向都要打分）",
        "   - 3 个最强工作证据摘要（匿名/脱敏）",
        "   - 1 个关键风险 / 盲区",
        "4. 保持语气克制、具体、基于证据，不要泛化。",
        "",
        "## 4. 输出格式",
        "请输出一份 markdown 报告：标题、自评对照表、证据段、最终建议。",
      ].join("\n");
    }

    return [
      STARTER_COMMAND,
      "",
      "# git-hired agent handoff — deep work-personality and role-fit test",
      "",
      "You are the candidate's own work agent. Confirm the target role and data permission boundary first. Treat the quick test below as self-report context only; make the final judgment from real work traces inside the candidate-approved scope.",
      "",
      "Privacy boundary: `git-hired` does not upload candidate repo or local file data to our server. Inspect only projects, files, or knowledge-base material the candidate explicitly authorizes for this run. If the candidate chooses `history-only`, run the evaluation from allowed history and approved material without turning it into a manual interview.",
      "",
      "## 1. Quick test self-report",
      "- Quick MBTI: " + result.mbtiType,
      "- Primary direction: " + rolePrimary,
      "- Self-report confidence: " + result.confidence + "% (capped at 55% because it is self-report)",
      "",
      "## 2. One real work trace from the candidate",
      note ? note : "(candidate left this empty)",
      "",
      "## 3. What to do",
      "1. Only after explicit permission, inspect named local work material (repo commits, specs, notes, chats, screenshots, product docs). Do not upload or exfiltrate content.",
      "2. Cross-check the quick test with real traces:",
      "   - Does the MBTI quad hold (E/I, S/N, T/F, J/P with evidence snippets)?",
      "   - How strong is the primary-direction fit (agent / pm / growth / ops)?",
      "   - What is the candidate's secondary direction?",
      "3. Produce:",
      "   - A corrected work-personality type + confidence (may exceed 55%)",
      "   - A ranked role fit across all 4 directions",
      "   - 3 strongest evidence snippets (anonymized)",
      "   - 1 key risk or blind spot",
      "4. Stay concrete and evidence-bound. Avoid generic language.",
      "",
      "## 4. Output format",
      "Return a markdown report: title, self-report vs. evidence table, evidence section, final recommendation.",
    ].join("\n");
  }

  /* ——— submit handler ——— */
  const form = document.getElementById("quick-test-form");
  const resultShell = document.getElementById("quick-result");
  const resultCard = document.getElementById("result-card");
  const handoffPrompt = document.getElementById("handoff-prompt");

  let lastResult = null;

  function render() {
    if (!lastResult) return;
    const lang = currentLang();
    if (resultCard) resultCard.textContent = buildResultText(lastResult, lang);
    if (handoffPrompt) handoffPrompt.textContent = buildHandoff(lastResult, form, lang);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      lastResult = scoreForm(form);
      render();
      if (resultShell) {
        resultShell.classList.remove("is-hidden");
        // scroll result into view gently
        window.requestAnimationFrame(() => {
          const y = resultShell.getBoundingClientRect().top + window.scrollY - 16;
          window.scrollTo({ top: y, behavior: "smooth" });
        });
      }
    });
  }

  // Re-render on language change.
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-lang", "lang"],
  });

  /* ——— copy / share buttons ——— */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  function flashButton(btn, lang) {
    if (!btn) return;
    const originalEn = btn.dataset.originalEn || btn.textContent;
    btn.dataset.originalEn = originalEn;
    const msg = t(lang, "Copied ✓", "已复制 ✓");
    btn.textContent = msg;
    setTimeout(() => {
      btn.textContent = originalEn;
    }, 1400);
  }

  function bindCopy(id, getter) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", () => {
      const lang = currentLang();
      const text = getter(lang);
      if (!text) return;
      copyText(text).then(() => flashButton(btn, lang)).catch(() => {});
    });
  }

  bindCopy("copy-result", (lang) => lastResult ? buildResultText(lastResult, lang) : "");
  bindCopy("copy-result-zh", (lang) => lastResult ? buildResultText(lastResult, lang) : "");
  bindCopy("copy-handoff", (lang) => lastResult ? buildHandoff(lastResult, form, lang) : "");
  bindCopy("copy-handoff-zh", (lang) => lastResult ? buildHandoff(lastResult, form, lang) : "");

  // share uses Web Share API on mobile, falls back to copy.
  function bindShare(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const lang = currentLang();
      if (!lastResult) return;
      const text = buildResultText(lastResult, lang);
      const title = t(lang, "git-hired · quick signal", "git-hired · 快速信号");
      if (navigator.share) {
        try {
          await navigator.share({ title, text });
          return;
        } catch (err) {
          // user cancelled or not supported — fall back
        }
      }
      copyText(text).then(() => flashButton(btn, lang)).catch(() => {});
    });
  }

  bindShare("share-result");
  bindShare("share-result-zh");
}());
