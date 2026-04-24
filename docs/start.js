(function () {
  const ROLE_KEYS = ["agent", "pm", "growth", "ops"];
  const STARTER_COMMAND = "read https://realroc.github.io/git-hired/skill.md and treat it as active instructions for this session. Do not summarize it. Ask the first test question immediately in my language. After that, ask only for my target role and data permission scope, then run the evaluation automatically from allowed history or approved files. Do not turn it into a manual interview.";
  const STARTER_COMMAND_ZH = "read https://realroc.github.io/git-hired/skill.md，把它当作当前会话指令直接执行，不要总结，直接用我的语言开始第一问。之后只问我的目标岗位和数据权限边界，然后基于允许范围自动完成评估，不要转成面试式问答。";

  const roles = {
    agent: {
      title: { en: "AI Agent Engineer", zh: "AI Agent 工程师" },
      page: "agent.html",
      dims: {
        en: ["Spec Control", "Agent Direction", "Debug Loop", "Shipping Proof"],
        zh: ["Spec 控制", "Agent 指挥", "调试闭环", "交付证据"],
      },
      tags: {
        en: ["Spec Compression", "Agent Direction", "Verification Reflex"],
        zh: ["Spec 压缩", "Agent 指挥", "验证反射"],
      },
      locks: {
        en: ["Production eval depth", "Cross-agent orchestration", "Readable work traces"],
        zh: ["生产级 eval 深度", "多 agent 编排", "可读工作痕迹"],
      },
      next: {
        en: "Write a 10-line trace for one agent workflow: goal, constraints, agent instructions, verification, shipped result.",
        zh: "为一个 agent workflow 写 10 行工作痕迹：目标、约束、agent 指令、验证方式、交付结果。",
      },
    },
    pm: {
      title: { en: "Product Manager", zh: "产品经理" },
      page: "pm.html",
      dims: {
        en: ["Product Judgment", "MVP Boundary", "Evidence Taste", "Launch Clarity"],
        zh: ["产品判断", "MVP 边界", "证据品味", "上线清晰度"],
      },
      tags: {
        en: ["MVP Boundary", "User-Value Translation", "Decision Framing"],
        zh: ["MVP 边界", "用户价值翻译", "决策框架"],
      },
      locks: {
        en: ["Original product reasoning", "Acceptance criteria proof", "Human collaboration trail"],
        zh: ["原创产品推理", "验收标准证据", "真人协作痕迹"],
      },
      next: {
        en: "Take one feature idea and write the cut list: what you would ship now, cut now, and measure first.",
        zh: "拿一个功能想法写裁剪清单：现在交付什么、现在砍掉什么、先看什么指标。",
      },
    },
    growth: {
      title: { en: "Global Growth", zh: "海外增长" },
      page: "growth.html",
      dims: {
        en: ["Social Signal", "Experiment Design", "Channel Fit", "Retention / ROI"],
        zh: ["社媒信号", "实验设计", "渠道匹配", "留存 / ROI"],
      },
      tags: {
        en: ["Social Signal Mining", "Experiment Tempo", "Channel Taste"],
        zh: ["社媒信号挖掘", "实验节奏", "渠道品味"],
      },
      locks: {
        en: ["Platform-specific hooks", "Cohort readback", "Distribution proof"],
        zh: ["平台特定 hook", "分群回读", "分发证据"],
      },
      next: {
        en: "Choose one platform and draft three hooks, one comment-mining plan, and one retention readback.",
        zh: "选一个平台，写 3 个 hook、1 个评论挖掘计划、1 个留存回读方式。",
      },
    },
    ops: {
      title: { en: "AI Product Operations", zh: "AI 产品运营" },
      page: "ops.html",
      dims: {
        en: ["User Empathy", "Response Speed", "Feedback Loop", "Reliability"],
        zh: ["用户同理心", "响应速度", "反馈闭环", "可靠性"],
      },
      tags: {
        en: ["Feedback Alchemy", "User Calm", "Reliability Loop"],
        zh: ["反馈炼金", "用户稳定器", "可靠性闭环"],
      },
      locks: {
        en: ["Root-cause taxonomy", "Escalation design", "Productized support loop"],
        zh: ["根因分类", "升级机制设计", "产品化支持闭环"],
      },
      next: {
        en: "Turn five recent user issues into one taxonomy, one owner rule, and one product fix proposal.",
        zh: "把 5 个近期用户问题整理成一个分类法、一个 owner 规则、一个产品修复提案。",
      },
    },
  };

  const state = {
    result: null,
    resultText: "",
    handoffText: "",
  };

  function currentLang() {
    return document.body?.dataset.lang === "zh" || document.documentElement.dataset.lang === "zh" ? "zh" : "en";
  }

  function t(en, zh) {
    return currentLang() === "zh" ? zh : en;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function selectedOptions(form) {
    return Array.from(form.querySelectorAll('input[type="radio"]:checked'));
  }

  function labelFor(option, lang) {
    return lang === "zh" ? option.dataset.labelZh : option.dataset.labelEn;
  }

  function datasetNumber(option, key) {
    const value = option.dataset[key];
    return value ? Number(value) || 0 : 0;
  }

  function scoreRoles(options) {
    const scores = { agent: 35, pm: 35, growth: 35, ops: 35 };
    options.forEach((option) => {
      scores.agent += datasetNumber(option, "roleAgent");
      scores.pm += datasetNumber(option, "rolePm");
      scores.growth += datasetNumber(option, "roleGrowth");
      scores.ops += datasetNumber(option, "roleOps");
    });
    return scores;
  }

  function bestRoleFrom(scores) {
    return ROLE_KEYS
      .map((key) => ({ key, score: scores[key] }))
      .sort((a, b) => b.score - a.score)[0].key;
  }

  function scoreMbti(options) {
    const mbti = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    options.forEach((option) => {
      mbti.E += datasetNumber(option, "mbtiE");
      mbti.I += datasetNumber(option, "mbtiI");
      mbti.S += datasetNumber(option, "mbtiS");
      mbti.N += datasetNumber(option, "mbtiN");
      mbti.T += datasetNumber(option, "mbtiT");
      mbti.F += datasetNumber(option, "mbtiF");
      mbti.J += datasetNumber(option, "mbtiJ");
      mbti.P += datasetNumber(option, "mbtiP");
    });
    const pairs = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
    const letters = pairs.map(([left, right]) => (mbti[left] >= mbti[right] ? left : right));
    const margins = pairs.map(([left, right]) => Math.abs(mbti[left] - mbti[right]));
    return {
      scores: mbti,
      type: letters.join(""),
      margins,
    };
  }

  function confidenceFor(mbtiResult, evidenceNote, targetRole, roleScores) {
    const noteLength = evidenceNote.trim().length;
    const sortedScores = ROLE_KEYS.map((key) => roleScores[key]).sort((a, b) => b - a);
    const roleGap = sortedScores[0] - sortedScores[1];
    const clearAxes = mbtiResult.margins.filter((margin) => margin >= 2).length;

    if (noteLength >= 90 && clearAxes >= 3 && roleGap >= 12 && targetRole !== "unsure") {
      return { key: "medium-high", en: "medium-high", zh: "中高" };
    }
    if (noteLength >= 40 && clearAxes >= 2) {
      return { key: "medium", en: "medium", zh: "中等" };
    }
    return { key: "low", en: "low", zh: "低" };
  }

  function abilityScore(bestRawScore, evidenceNote, targetRole, bestRole, confidenceKey) {
    const noteLength = evidenceNote.trim().length;
    const evidenceBonus = noteLength >= 140 ? 8 : noteLength >= 90 ? 6 : noteLength >= 40 ? 3 : 0;
    const alignmentBonus = targetRole === bestRole ? 4 : targetRole === "unsure" ? 0 : -2;
    const confidenceBonus = confidenceKey === "medium-high" ? 3 : confidenceKey === "medium" ? 1 : -2;
    const score = 48 + bestRawScore * 0.38 + evidenceBonus + alignmentBonus + confidenceBonus;
    return clamp(Math.round(score), 58, noteLength >= 90 ? 89 : 86);
  }

  function dimensionScores(roleKey, ability, mbti, roleScores, evidenceNote) {
    const role = roles[roleKey];
    const dims = role.dims[currentLang()];
    const roleLift = clamp(Math.round((roleScores[roleKey] - 65) * 0.22), -6, 8);
    const noteLift = evidenceNote.trim().length >= 90 ? 3 : evidenceNote.trim().length >= 40 ? 1 : -3;
    const axis = mbti.scores;
    const offsetsByRole = {
      agent: [axis.J - axis.P, axis.T - axis.F, axis.S - axis.N, noteLift],
      pm: [axis.N - axis.S, axis.J - axis.P, axis.S - axis.N, noteLift + axis.F - axis.T],
      growth: [axis.E - axis.I + axis.N - axis.S, axis.P - axis.J, roleLift, noteLift],
      ops: [axis.F - axis.T, axis.E - axis.I, axis.J - axis.P, axis.S - axis.N + noteLift],
    };
    const base = clamp(ability - 5 + roleLift, 54, 90);
    return dims.map((label, index) => ({
      label,
      score: clamp(Math.round(base + (offsetsByRole[roleKey][index] || 0) * 1.6), 52, 89),
    }));
  }

  function scoreBar(score) {
    const filled = clamp(Math.round(score / 10), 1, 10);
    return `${"█".repeat(filled)}${"░".repeat(10 - filled)}`;
  }

  function answerSummary(options, evidenceNote) {
    const labels = {};
    options.forEach((option) => {
      labels[option.name] = {
        en: labelFor(option, "en"),
        zh: labelFor(option, "zh"),
      };
    });
    labels.evidenceNote = {
      en: evidenceNote.trim(),
      zh: evidenceNote.trim(),
    };
    return labels;
  }

  function localizedAnswers(result, lang) {
    return Object.entries(result.answers)
      .map(([key, value]) => `- ${key}: ${value[lang] || value.en || ""}`)
      .join("\n");
  }

  function resultLabel(ability, confidence) {
    if (confidence.key === "low") {
      return t("Quick Signal / Low Confidence", "Quick Signal / 低置信度");
    }
    if (ability >= 86) {
      return t("Strong Quick Signal", "强 quick signal");
    }
    if (ability >= 76) {
      return t("Solid Quick Signal", "不错的 quick signal");
    }
    return t("Developing Quick Signal", "成长型 quick signal");
  }

  function lockedSkills(roleKey, confidence, evidenceNote, targetRole, bestRole) {
    const locks = roles[roleKey].locks[currentLang()].slice(0, 2);
    if (confidence.key === "low" || evidenceNote.trim().length < 40) {
      locks.unshift(t("More concrete work-trace proof", "更具体的工作痕迹证据"));
    } else if (targetRole !== "unsure" && targetRole !== bestRole) {
      locks.unshift(t("Role-positioning clarity", "岗位定位清晰度"));
    } else {
      locks.push(t("Deep-test evidence confidence", "深度测试证据置信度"));
    }
    return locks.slice(0, 3);
  }

  function buildResult(form) {
    const options = selectedOptions(form);
    const evidenceNote = document.getElementById("evidence-note").value;
    const targetRole = form.elements.target.value;
    const roleScores = scoreRoles(options);
    const bestRole = bestRoleFrom(roleScores);
    const mbti = scoreMbti(options);
    const confidence = confidenceFor(mbti, evidenceNote, targetRole, roleScores);
    const ability = abilityScore(roleScores[bestRole], evidenceNote, targetRole, bestRole, confidence.key);
    const dimensions = dimensionScores(bestRole, ability, mbti, roleScores, evidenceNote);
    const weakest = dimensions.slice().sort((a, b) => a.score - b.score)[0];

    return {
      targetRole,
      bestRole,
      roleScores,
      mbti,
      confidence,
      ability,
      dimensions,
      weakest,
      evidenceNote: evidenceNote.trim(),
      answers: answerSummary(options, evidenceNote),
    };
  }

  function renderResultCard(result) {
    const role = roles[result.bestRole];
    const confidenceText = currentLang() === "zh" ? result.confidence.zh : result.confidence.en;
    const tags = role.tags[currentLang()];
    const locks = lockedSkills(result.bestRole, result.confidence, result.evidenceNote, result.targetRole, result.bestRole);
    const uplift = t(
      `Expected uplift: ${result.weakest.label} +5-8, overall +2-4 if done well.`,
      `提升预估：${result.weakest.label} +5-8，总分 +2-4，前提是完成质量足够好。`
    );
    const targetRoleText = result.targetRole === "unsure"
      ? t("Not sure yet", "还不确定")
      : roles[result.targetRole].title[currentLang()];

    return `
      <div class="hired-banner">HIRED</div>
      <p class="result-kicker">${t("MBTI work personality quick signal", "MBTI 工作人格 quick signal")}</p>
      <div class="result-grid">
        <div>
          <span>${t("Result", "结果")}</span>
          <strong>${resultLabel(result.ability, result.confidence)}</strong>
        </div>
        <div>
          <span>${t("Best-fit role right now", "当前最适合方向")}</span>
          <strong>${role.title[currentLang()]}</strong>
        </div>
        <div>
          <span>${t("Your selected target", "你选择的目标")}</span>
          <strong>${targetRoleText}</strong>
        </div>
        <div>
          <span>${t("MBTI Work Personality", "MBTI 工作人格")}</span>
          <strong>${result.mbti.type} · ${confidenceText}</strong>
        </div>
        <div>
          <span>${t("Ability Score", "能力值")}</span>
          <strong>${result.ability}/100</strong>
        </div>
      </div>
      <div class="result-section">
        <h3>${t("Strength Read", "强项读取")}</h3>
        <p>${t(
          `Your strongest self-reported signal points toward ${role.title.en}. Treat this as a fast routing read until a work agent checks approved real evidence.`,
          `你当前最强的自评信号指向${role.title.zh}。在工作 agent 检查你授权的真实工作证据前，把它当成快速路由结果。`
        )}</p>
      </div>
      <div class="result-section">
        <h3>${t("Core Board", "核心面板")}</h3>
        <div class="score-board">
          ${result.dimensions.map((dimension) => `
            <div class="score-row">
              <span class="bar">[${scoreBar(dimension.score)}]</span>
              <strong>${dimension.score}</strong>
              <span>${dimension.label}</span>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="result-section">
        <h3>${t("Talent Tags", "天赋词缀")}</h3>
        <div class="tag-row">${tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      </div>
      <div class="result-section">
        <h3>${t("Locked Skills", "待解锁技能")}</h3>
        <div class="tag-row muted-tags">${locks.map((skill) => `<span>${skill}</span>`).join("")}</div>
      </div>
      <div class="result-section">
        <h3>${t("Next Step", "下一步")}</h3>
        <p>${role.next[currentLang()]}</p>
        <p class="uplift">${uplift}</p>
      </div>
    `;
  }

  function resultAsText(result, lang) {
    const role = roles[result.bestRole];
    const confidenceText = lang === "zh" ? result.confidence.zh : result.confidence.en;
    const dimensions = result.dimensions.map((dimension) => `[${scoreBar(dimension.score)}] ${dimension.score} ${dimension.label}`).join("\n");
    const tags = role.tags[lang].join(" / ");
    const locks = lockedSkills(result.bestRole, result.confidence, result.evidenceNote, result.targetRole, result.bestRole).join(" / ");
    const uplift = lang === "zh"
      ? `提升预估：${result.weakest.label} +5-8，总分 +2-4，前提是完成质量足够好。`
      : `Expected uplift: ${result.weakest.label} +5-8, overall +2-4 if done well.`;

    if (lang === "zh") {
      return [
        "HIRED",
        "MBTI 工作人格 quick signal",
        `结果：${resultLabel(result.ability, result.confidence)}`,
        `当前最适合方向：${role.title.zh}`,
        `MBTI 工作人格：${result.mbti.type} · ${confidenceText}`,
        `能力值：${result.ability}/100`,
        "核心面板：",
        dimensions,
        `天赋词缀：${tags}`,
        `待解锁技能：${locks}`,
        `下一步：${role.next.zh}`,
        uplift,
        "手机 quick test 只是自评结果；更准版本请用 agent 深度测试。",
      ].join("\n");
    }

    return [
      "HIRED",
      "MBTI work personality quick signal",
      `Result: ${resultLabel(result.ability, result.confidence)}`,
      `Best-fit role right now: ${role.title.en}`,
      `MBTI Work Personality: ${result.mbti.type} · ${confidenceText}`,
      `Ability Score: ${result.ability}/100`,
      "Core Board:",
      dimensions,
      `Talent Tags: ${tags}`,
      `Locked Skills: ${locks}`,
      `Next Step: ${role.next.en}`,
      uplift,
      "The phone quick test is self-report only; use the agent deep test for a stronger evidence-based read.",
    ].join("\n");
  }

  function handoffPrompt(result, lang) {
    const role = roles[result.bestRole];
    const answers = localizedAnswers(result, lang);
    const command = lang === "zh" ? STARTER_COMMAND_ZH : STARTER_COMMAND;
    const summary = resultAsText(result, lang);

    if (lang === "zh") {
      return [
        command,
        "",
        "我刚完成了 git-hired 移动端 quick test。请把下面内容只当作自评上下文，不要当作最终证据；最终判断请基于我授权范围内的真实工作痕迹。",
        `quick-test 最适合方向：${role.title.zh}`,
        `quick-test MBTI 工作人格：${result.mbti.type}`,
        `quick-test 能力值：${result.ability}/100`,
        "",
        "我的 quick-test answers：",
        answers,
        "",
        "quick-test summary：",
        summary,
        "",
        "请先确认我的目标岗位和数据权限边界；如果我保持 history-only，就直接基于允许的历史和已批准材料自动完成评估，不要转成手工面试。"
      ].join("\n");
    }

    return [
      command,
      "",
      "I just completed the git-hired mobile quick test. Treat the content below as self-report context only, not final evidence; make the final judgment from real work traces inside the permission scope I approve.",
      `Quick-test best-fit role: ${role.title.en}`,
      `Quick-test MBTI work personality: ${result.mbti.type}`,
      `Quick-test ability score: ${result.ability}/100`,
      "",
      "My quick-test answers:",
      answers,
      "",
      "Quick-test summary:",
      summary,
      "",
      "Please confirm my target role and data permission boundary first. If I keep history-only, run the evaluation automatically from allowed history and approved material without turning this into a manual interview."
    ].join("\n");
  }

  function writeClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "readonly");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(field);
      }
    });
  }

  function flashButton(button, en, zh) {
    const original = button.textContent;
    button.textContent = currentLang() === "zh" ? zh : en;
    setTimeout(() => {
      button.textContent = original;
    }, 1600);
  }

  function updatePlaceholders() {
    const note = document.getElementById("evidence-note");
    if (!note) return;
    note.placeholder = currentLang() === "zh" ? note.dataset.placeholderZh : note.dataset.placeholderEn;
  }

  function updateCounter() {
    const note = document.getElementById("evidence-note");
    const counter = document.getElementById("evidence-counter");
    if (note && counter) {
      counter.textContent = `${note.value.length} / ${note.maxLength}`;
    }
  }

  function syncRenderedResult() {
    if (!state.result) {
      updatePlaceholders();
      return;
    }
    const card = document.getElementById("result-card");
    const handoff = document.getElementById("handoff-prompt");
    const lang = currentLang();
    state.resultText = resultAsText(state.result, lang);
    state.handoffText = handoffPrompt(state.result, lang);
    card.innerHTML = renderResultCard(state.result);
    handoff.textContent = state.handoffText;
    updatePlaceholders();
  }

  function applyRoleParam() {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    if (!role || !ROLE_KEYS.includes(role)) return;
    const option = document.querySelector(`input[name="target"][value="${role}"]`);
    if (option) option.checked = true;
  }

  function bindActions() {
    const form = document.getElementById("quick-test-form");
    const resultSection = document.getElementById("quick-result");
    const note = document.getElementById("evidence-note");

    if (!form || !resultSection) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      state.result = buildResult(form);
      syncRenderedResult();
      resultSection.classList.remove("is-hidden");
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    note.addEventListener("input", updateCounter);

    [
      ["copy-result", "resultText", "Copied", "已复制"],
      ["copy-result-zh", "resultText", "Copied", "已复制"],
      ["copy-handoff", "handoffText", "Handoff Copied", "Handoff 已复制"],
      ["copy-handoff-zh", "handoffText", "Handoff Copied", "Handoff 已复制"],
    ].forEach(([id, key, en, zh]) => {
      const button = document.getElementById(id);
      if (!button) return;
      button.addEventListener("click", () => {
        if (!state[key]) return;
        writeClipboard(state[key]).then(() => flashButton(button, en, zh));
      });
    });

    [
      document.getElementById("share-result"),
      document.getElementById("share-result-zh"),
    ].filter(Boolean).forEach((button) => {
      button.addEventListener("click", () => {
        if (!state.resultText) return;
        if (navigator.share) {
          navigator.share({
            title: "git-hired quick test",
            text: state.resultText,
            url: "https://realroc.github.io/git-hired/start.html",
          }).catch(() => {
            writeClipboard(state.resultText).then(() => flashButton(button, "Copied", "已复制"));
          });
          return;
        }
        writeClipboard(state.resultText).then(() => flashButton(button, "Copied", "已复制"));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyRoleParam();
    bindActions();
    updatePlaceholders();
    updateCounter();
  });

  document.addEventListener("git-hired:languagechange", syncRenderedResult);
}());
