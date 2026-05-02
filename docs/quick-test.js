/* global window, document, MutationObserver, navigator, HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement */
(function () {
  "use strict";

  const AGENT_PROMPT = "read https://realroc.github.io/git-hired/skill.md";

  const TRACKS = {
    builder: {
      key: "builder",
      title: { en: "Builder", zh: "Builder" },
      path: "builder-profile",
      note: {
        en: "Builder profile: emphasize artifacts, systems, workflows, automation, tools, prototypes, and shipped output.",
        zh: "Builder profile：突出产物、系统、工作流、自动化、工具、原型和已交付成果。",
      },
      headlineRole: {
        en: "AI-native builder",
        zh: "AI-native Builder",
      },
      valueVerb: {
        en: "turns ambiguous problems into usable products, workflows, automation, and systems",
        zh: "用 AI 把模糊问题转成可用产品、工作流、自动化和系统",
      },
      defaultSkills: {
        en: ["AI workflow design", "prototyping", "automation", "product judgment", "systems thinking", "shipping useful artifacts"],
        zh: ["AI workflow 设计", "原型构建", "自动化", "产品判断", "系统思维", "交付可用成果"],
      },
      suggestedRoles: {
        en: ["AI Product Builder", "Automation Operator", "Agent Workflow Builder", "Founder's Office Builder", "Product Operations"],
        zh: ["AI Product Builder", "Automation Operator", "Agent Workflow Builder", "创始人办公室 Builder", "产品运营"],
      },
      bulletLead: {
        en: "Built",
        zh: "构建",
      },
    },
    seller: {
      key: "seller",
      title: { en: "Seller", zh: "Seller" },
      path: "seller-profile",
      note: {
        en: "Seller profile: emphasize narrative, positioning, distribution, sales, recruiting, launches, trust, and adoption.",
        zh: "Seller profile：突出叙事、定位、分发、销售、招聘、发布、信任和采用。",
      },
      headlineRole: {
        en: "AI-native seller",
        zh: "AI-native Seller",
      },
      valueVerb: {
        en: "turns ideas into attention, trust, adoption, distribution, and revenue",
        zh: "用 AI 把想法转成关注、信任、采用、分发和收入",
      },
      defaultSkills: {
        en: ["positioning", "storytelling", "distribution", "outbound", "community", "sales and recruiting momentum"],
        zh: ["定位", "叙事", "分发", "outbound", "社区", "销售与招聘势能"],
      },
      suggestedRoles: {
        en: ["AI Growth Operator", "Founder’s Office GTM", "AI Sales / Recruiting Operator", "Community Builder", "Product Marketing"],
        zh: ["AI Growth Operator", "创始人办公室 GTM", "AI 销售 / 招聘 Operator", "社区 Builder", "产品市场"],
      },
      bulletLead: {
        en: "Drove",
        zh: "推动",
      },
    },
  };

  const COPY = {
    en: {
      statusDraft: "profile draft",
      statusReady: "profile ready",
      profileTitle: "LinkedIn-ready AI-native profile",
      headlineTitle: "LinkedIn Headline",
      aboutTitle: "About",
      valueTitle: "AI-Native Value Proposition",
      skillsTitle: "Core Skills",
      evidenceTitle: "Selected Work Evidence",
      bulletsTitle: "Resume Bullets",
      rolesTitle: "Suggested Roles",
      missingTitle: "Missing Proof",
      editTitle: "Next Edit",
      fullProfile: "Copy full profile",
      fullProfileCopied: "profile copied",
      copyAbout: "Copy LinkedIn About",
      aboutCopied: "about copied",
      downloadMarkdown: "Download Markdown",
      markdownDownloaded: "download started",
      copyHeadline: "Copy headline",
      headlineCopied: "headline copied",
      copyBullets: "Copy resume bullets",
      bulletsCopied: "bullets copied",
      copyPublicProfile: "Copy profile URL",
      publicProfileCopied: "profile URL copied",
      copyAgentPrompt: "Copy agent prompt",
      promptCopied: "prompt copied",
      fallbackName: "AI-native worker",
      fallbackRole: "AI-native operator",
      fallbackTarget: "AI-native role",
      noEvidence: "Add 3-6 specific work examples to make this profile stronger.",
      noOutcome: "Add numbers, links, users, replies, revenue, time saved, or screenshots to make claims easier to trust.",
      editAdvice: "Tighten any claim that sounds too broad. Add one metric, one public link, and one concrete before/after result.",
    },
    zh: {
      statusDraft: "profile 草稿",
      statusReady: "profile 已生成",
      profileTitle: "LinkedIn 可用的 AI-native profile",
      headlineTitle: "LinkedIn Headline",
      aboutTitle: "About",
      valueTitle: "AI-Native Value Proposition",
      skillsTitle: "Core Skills",
      evidenceTitle: "Selected Work Evidence",
      bulletsTitle: "Resume Bullets",
      rolesTitle: "Suggested Roles",
      missingTitle: "Missing Proof",
      editTitle: "Next Edit",
      fullProfile: "复制完整 profile",
      fullProfileCopied: "profile 已复制",
      copyAbout: "复制 LinkedIn About",
      aboutCopied: "About 已复制",
      downloadMarkdown: "下载 Markdown",
      markdownDownloaded: "开始下载",
      copyHeadline: "复制 headline",
      headlineCopied: "headline 已复制",
      copyBullets: "复制简历 bullets",
      bulletsCopied: "bullets 已复制",
      copyPublicProfile: "复制 profile URL",
      publicProfileCopied: "profile URL 已复制",
      copyAgentPrompt: "复制 Agent 指令",
      promptCopied: "指令已复制",
      fallbackName: "AI-native worker",
      fallbackRole: "AI-native operator",
      fallbackTarget: "AI-native 岗位",
      noEvidence: "补充 3-6 条具体工作案例，会让这份 profile 更强。",
      noOutcome: "补充数字、链接、用户、回复、收入、节省时间或截图，会让这些 claim 更可信。",
      editAdvice: "收紧任何听起来太泛的表达。至少补充一个指标、一个公开链接、一个具体 before/after 结果。",
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
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.en || "";
  }

  function localizedList(value, lang) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value[lang] || value.en || [];
  }

  function normalizeTrackKey(value) {
    const key = String(value || "").toLowerCase().trim();
    if (key === "build") return "builder";
    if (key === "sell") return "seller";
    return Object.prototype.hasOwnProperty.call(TRACKS, key) ? key : "builder";
  }

  function selectedTrackKey() {
    try {
      const url = new URL(window.location.href);
      const hashTrack = url.hash.startsWith("#track=")
        ? decodeURIComponent(url.hash.slice("#track=".length))
        : "";
      return normalizeTrackKey(url.searchParams.get("track") || hashTrack || "builder");
    } catch (error) {
      return "builder";
    }
  }

  function selectedTrack() {
    return TRACKS[selectedTrackKey()] || TRACKS.builder;
  }

  function trackEvent(eventName, properties) {
    const analytics = window.gitHiredAnalytics;
    if (!analytics || typeof analytics.track !== "function") return;
    analytics.track(eventName, properties);
  }

  function makeElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  }

  function splitLines(value) {
    return String(value || "")
      .split(/\n|;/)
      .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  function splitTools(value) {
    return String(value || "")
      .split(/,|，|\n/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  function readField(id) {
    const element = document.getElementById(id);
    return element ? String(element.value || "").trim() : "";
  }

  function readGeneratorInput(track) {
    const lang = readField("output-language") === "zh" ? "zh" : "en";
    return {
      track,
      lang,
      name: readField("profile-name"),
      currentRole: readField("current-role"),
      targetRole: readField("target-role"),
      tools: splitTools(readField("tools")),
      evidence: splitLines(readField("work-evidence")),
      outcomes: splitLines(readField("outcomes")),
      tone: readField("profile-tone") || "sharp",
    };
  }

  function hasMetric(value) {
    return /\d|%|\$|users?|用户|收入|revenue|signup|reply|lead|candidate|hours?|小时|分钟|min|days?|天/i.test(value);
  }

  function sentenceCase(value) {
    const clean = String(value || "").trim();
    if (!clean) return "";
    return clean.charAt(0).toUpperCase() + clean.slice(1).replace(/[.!。]*$/, ".");
  }

  function makeHeadline(input) {
    const lang = input.lang;
    const track = input.track;
    const role = input.currentRole || text(lang, "fallbackRole");
    const target = input.targetRole || text(lang, "fallbackTarget");
    const tools = input.tools.slice(0, 3).join(", ");
    if (lang === "zh") {
      return `${role}｜${localized(track.headlineRole, lang)}｜${localized(track.valueVerb, lang)}${tools ? "｜" + tools : ""}｜目标："${target}"`;
    }
    return `${role} | ${localized(track.headlineRole, lang)} | ${localized(track.valueVerb, lang)}${tools ? " | " + tools : ""} | Target: ${target}`;
  }

  function makeAbout(input) {
    const lang = input.lang;
    const track = input.track;
    const name = input.name || text(lang, "fallbackName");
    const role = input.currentRole || text(lang, "fallbackRole");
    const target = input.targetRole || text(lang, "fallbackTarget");
    const evidence = input.evidence.slice(0, 3);
    const outcomes = input.outcomes.slice(0, 3);
    const tools = input.tools.slice(0, 5);

    if (lang === "zh") {
      const evidenceText = evidence.length ? `代表性工作包括：${evidence.join("；")}。` : text(lang, "noEvidence");
      const outcomeText = outcomes.length ? `可验证结果包括：${outcomes.join("；")}。` : text(lang, "noOutcome");
      const toolText = tools.length ? `常用工具和 agent 工作流包括：${tools.join("、")}。` : "我会用 AI agent 把问题拆解、执行、复盘并沉淀成可复用输出。";
      return [
        `${name} 是一名 ${role}，核心价值是${localized(track.valueVerb, lang)}。目前目标方向是 ${target}。`,
        `${evidenceText} ${outcomeText} ${toolText}`,
      ];
    }

    const evidenceText = evidence.length ? `Representative work includes: ${evidence.join("; ")}.` : text(lang, "noEvidence");
    const outcomeText = outcomes.length ? `Observable outcomes include: ${outcomes.join("; ")}.` : text(lang, "noOutcome");
    const toolText = tools.length ? `Common tools and agent workflows include ${tools.join(", ")}.` : "I use AI agents to break down ambiguous work, execute, review, and turn output into reusable systems.";
    return [
      `${name} is a ${role} whose core value is the ability to ${localized(track.valueVerb, lang)}. Current target direction: ${target}.`,
      `${evidenceText} ${outcomeText} ${toolText}`,
    ];
  }

  function makeValueProposition(input) {
    const lang = input.lang;
    const track = input.track;
    if (lang === "zh") {
      return input.track.key === "builder"
        ? "我能把模糊需求转成可运行产物，并用 AI agent 提高原型、自动化、系统搭建和交付速度。"
        : "我能把原始想法转成清晰叙事、分发动作和真实回应，并用 AI 提高内容、outbound、招聘和增长效率。";
    }
    return input.track.key === "builder"
      ? "I turn ambiguous needs into usable artifacts, using AI agents to increase speed across prototyping, automation, system design, and shipping."
      : "I turn raw ideas into clear narratives, distribution motion, and real response, using AI to improve content, outbound, recruiting, and growth execution.";
  }

  function makeSkills(input) {
    const lang = input.lang;
    const base = localizedList(input.track.defaultSkills, lang);
    const tools = input.tools.slice(0, 6);
    return Array.from(new Set([...base, ...tools])).slice(0, 12);
  }

  function makeEvidence(input) {
    const lang = input.lang;
    const lines = [...input.evidence, ...input.outcomes].slice(0, 8);
    if (lines.length) return lines.map(sentenceCase);
    return [text(lang, "noEvidence"), text(lang, "noOutcome")];
  }

  function makeBullets(input) {
    const lang = input.lang;
    const track = input.track;
    const tools = input.tools.slice(0, 3).join(", ");
    const evidence = input.evidence.length ? input.evidence.slice(0, 5) : [localized(track.valueVerb, lang)];
    const outcomes = input.outcomes;

    return evidence.map((line, index) => {
      const outcome = outcomes[index] || outcomes[0] || "";
      if (lang === "zh") {
        return `${localized(track.bulletLead, lang)}${line.replace(/[。.!]*$/, "")}${tools ? `，使用 ${tools}` : ""}${outcome ? `，结果：${outcome.replace(/[。.!]*$/, "")}` : "，并沉淀为可复用的 AI-native 工作证据"}。`;
      }
      return `${localized(track.bulletLead, lang)} ${line.replace(/[.!。]*$/, "")}${tools ? ` using ${tools}` : ""}${outcome ? `; outcome: ${outcome.replace(/[.!。]*$/, "")}` : "; turned the work into reusable AI-native evidence"}.`;
    });
  }

  function makeMissingProof(input) {
    const lang = input.lang;
    const combined = [...input.evidence, ...input.outcomes].join(" ");
    const missing = [];
    if (!input.evidence.length) missing.push(text(lang, "noEvidence"));
    if (!input.outcomes.length || !hasMetric(combined)) missing.push(text(lang, "noOutcome"));
    if (!/https?:\/\/|github|linkedin|notion|figma|x\.com|twitter|截图|screenshot|demo|repo/i.test(combined)) {
      missing.push(lang === "zh" ? "补充公开链接、截图、demo、repo、帖子或 case study，会让 profile 更可信。" : "Add public links, screenshots, demos, repos, posts, or case studies to make the profile more credible.");
    }
    return missing.length ? missing : [
      lang === "zh" ? "证据基础不错。下一步可以把最强的 1-2 个案例写成公开 case study。" : "The evidence base is useful. Next, turn the strongest 1-2 examples into public case studies.",
    ];
  }

  function generateProfile(input) {
    return {
      track: input.track,
      lang: input.lang,
      headline: makeHeadline(input),
      about: makeAbout(input),
      value: makeValueProposition(input),
      skills: makeSkills(input),
      evidence: makeEvidence(input),
      bullets: makeBullets(input),
      roles: localizedList(input.track.suggestedRoles, input.lang),
      missing: makeMissingProof(input),
      nextEdit: text(input.lang, "editAdvice"),
    };
  }

  function renderList(items) {
    const list = makeElement("ul", "builder-list");
    items.forEach((item) => list.append(makeElement("li", "", item)));
    return list;
  }

  function renderSection(title, body) {
    const section = makeElement("section", "builder-card-section profile-section");
    section.append(makeElement("h3", "", title));
    if (Array.isArray(body)) {
      section.append(renderList(body));
    } else {
      section.append(makeElement("p", "", body));
    }
    return section;
  }

  function renderProfile(host, profile) {
    if (!host || !profile) return;
    const lang = profile.lang;
    const identity = makeElement("div", "builder-identity");
    identity.append(
      makeElement("span", "builder-card-kicker", text(lang, "profileTitle")),
      makeElement("strong", "builder-card-type profile-headline", profile.headline),
      makeElement("p", "builder-card-summary", profile.value),
      makeElement("p", "level-note", lang === "zh" ? "这是可编辑草稿。发布前请补充真实数字、链接，并删掉不想公开的信息。" : "This is an editable draft. Before publishing, add real numbers and links, and remove anything you do not want to share.")
    );

    host.setAttribute("contenteditable", "true");
    host.replaceChildren(
      identity,
      renderSection(text(lang, "headlineTitle"), profile.headline),
      renderSection(text(lang, "aboutTitle"), profile.about),
      renderSection(text(lang, "valueTitle"), profile.value),
      renderSection(text(lang, "skillsTitle"), profile.skills),
      renderSection(text(lang, "evidenceTitle"), profile.evidence),
      renderSection(text(lang, "bulletsTitle"), profile.bullets),
      renderSection(text(lang, "rolesTitle"), profile.roles),
      renderSection(text(lang, "missingTitle"), profile.missing),
      renderSection(text(lang, "editTitle"), profile.nextEdit)
    );
  }

  function profileMarkdown(profile) {
    const lang = profile.lang;
    return [
      "# git-hired AI-native profile",
      "",
      "## " + text(lang, "headlineTitle"),
      profile.headline,
      "",
      "## " + text(lang, "aboutTitle"),
      profile.about.join("\n\n"),
      "",
      "## " + text(lang, "valueTitle"),
      profile.value,
      "",
      "## " + text(lang, "skillsTitle"),
      profile.skills.map((item) => "- " + item).join("\n"),
      "",
      "## " + text(lang, "evidenceTitle"),
      profile.evidence.map((item) => "- " + item).join("\n"),
      "",
      "## " + text(lang, "bulletsTitle"),
      profile.bullets.map((item) => "- " + item).join("\n"),
      "",
      "## " + text(lang, "rolesTitle"),
      profile.roles.map((item) => "- " + item).join("\n"),
      "",
      "## " + text(lang, "missingTitle"),
      profile.missing.map((item) => "- " + item).join("\n"),
      "",
      "## " + text(lang, "editTitle"),
      profile.nextEdit,
      "",
      "git-hired · browser-local · user-controlled",
    ].join("\n");
  }

  function publicProfileUrl(track) {
    const url = new URL(window.location.href);
    url.search = "?track=" + encodeURIComponent(track.key);
    url.hash = "";
    return url.toString();
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

  function downloadText(value, filename) {
    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1200);
  }

  function setCopyLabel(button, selector, copied, idleKey, copiedKey) {
    if (!button) return;
    button.dataset.copyState = copied ? "copied" : "idle";
    button.querySelectorAll(selector).forEach((label) => {
      const lang = label.dataset.lang === "zh" ? "zh" : "en";
      label.textContent = copied ? COPY[lang][copiedKey] : COPY[lang][idleKey];
    });
  }

  function setButtonText(button, copied, idleText, copiedText) {
    if (!button) return;
    button.dataset.copyState = copied ? "copied" : "idle";
    const labels = button.querySelectorAll("[data-lang]");
    labels.forEach((label) => {
      const lang = label.dataset.lang === "zh" ? "zh" : "en";
      label.textContent = copied ? copiedText[lang] : idleText[lang];
    });
  }

  function updateTrackChrome(track) {
    const path = document.getElementById("profile-track-path");
    if (path) path.textContent = track.path;
    const note = document.getElementById("track-note");
    if (note) {
      note.querySelector('[data-lang="en"]').textContent = track.note.en;
      note.querySelector('[data-lang="zh"]').textContent = track.note.zh;
    }
    const fill = document.getElementById("quick-progress-fill");
    if (fill) fill.style.width = "45%";
  }

  function updateStatusLabel(profileReady) {
    const lang = currentLang();
    const label = document.getElementById("quick-progress-label");
    if (label) label.textContent = profileReady ? text(lang, "statusReady") : text(lang, "statusDraft");
    const fill = document.getElementById("quick-progress-fill");
    if (fill) fill.style.width = profileReady ? "100%" : "45%";
  }

  function init() {
    const form = document.getElementById("profile-generator-form");
    if (!form) return;

    const track = selectedTrack();
    updateTrackChrome(track);
    updateStatusLabel(false);

    const outputLanguage = document.getElementById("output-language");
    if (outputLanguage instanceof HTMLSelectElement) {
      outputLanguage.value = currentLang();
    }

    const resultShell = document.getElementById("profile-result");
    const resultCard = document.getElementById("result-card");
    const shareResultButton = document.getElementById("share-result");
    const copyProfileButton = document.getElementById("copy-profile");
    const downloadButton = document.getElementById("download-card");
    const headlineButton = document.getElementById("share-x");
    const bulletsButton = document.getElementById("share-linkedin");
    const profileUrlButton = document.getElementById("create-public-profile");
    const copyAgentButton = document.getElementById("copy-agent-prompt");
    const waitlistLink = document.getElementById("team-waitlist-link");
    const editButton = document.getElementById("retake-test");

    let lastProfile = null;
    let lastMarkdown = "";
    let profileStarted = false;
    let timers = [];

    function clearTimers() {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
    }

    function resetLabels() {
      clearTimers();
      setCopyLabel(shareResultButton, ".share-label", false, "fullProfile", "fullProfileCopied");
      setCopyLabel(copyProfileButton, ".copy-profile-label", false, "copyAbout", "aboutCopied");
      setCopyLabel(downloadButton, ".download-card-label", false, "downloadMarkdown", "markdownDownloaded");
      setCopyLabel(profileUrlButton, ".public-profile-label", false, "copyPublicProfile", "publicProfileCopied");
      setCopyLabel(copyAgentButton, ".agent-copy-label", false, "copyAgentPrompt", "promptCopied");
      setButtonText(headlineButton, false, { en: COPY.en.copyHeadline, zh: COPY.zh.copyHeadline }, { en: COPY.en.headlineCopied, zh: COPY.zh.headlineCopied });
      setButtonText(bulletsButton, false, { en: COPY.en.copyBullets, zh: COPY.zh.copyBullets }, { en: COPY.en.bulletsCopied, zh: COPY.zh.bulletsCopied });
    }

    function flash(button, reset) {
      const timer = window.setTimeout(reset, 1400);
      timers.push(timer);
    }

    function showProfile(profile) {
      lastProfile = profile;
      lastMarkdown = profileMarkdown(profile);
      renderProfile(resultCard, profile);
      document.body.classList.add("result-mode");
      form.classList.add("is-complete");
      if (resultShell) resultShell.classList.remove("is-hidden");
      updateStatusLabel(true);
      resetLabels();
      trackEvent("select_role", {
        location: "profile_generator",
        role: track.key,
        result_type: "profile",
        selection_type: "profile_track",
      });
      trackEvent("complete_quiz", {
        location: "profile_generator",
        role: track.key,
        result_type: "profile",
        answer_count: 1,
      });
      trackEvent("view_result", {
        location: "profile_result",
        role: track.key,
        result_type: "profile",
        profile_url: publicProfileUrl(track),
      });
      window.requestAnimationFrame(() => {
        const y = resultShell ? resultShell.getBoundingClientRect().top + window.scrollY - 12 : 0;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    }

    form.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement) && !(target instanceof HTMLSelectElement)) return;
      if (profileStarted) return;
      profileStarted = true;
      trackEvent("start_quiz", {
        location: "profile_generator_field",
        role: track.key,
        question_id: target.name || target.id || "",
        answer_count: 1,
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = readGeneratorInput(track);
      showProfile(generateProfile(input));
    });

    if (editButton) {
      editButton.addEventListener("click", () => {
        document.body.classList.remove("result-mode");
        form.classList.remove("is-complete");
        if (resultShell) resultShell.classList.add("is-hidden");
        updateStatusLabel(false);
        window.requestAnimationFrame(() => {
          const y = form.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top: y, behavior: "smooth" });
        });
      });
    }

    if (shareResultButton) {
      shareResultButton.addEventListener("click", () => {
        if (!lastProfile) return;
        trackEvent("click_share", {
          location: "profile_result",
          role: track.key,
          result_type: "profile",
          share_target: "clipboard",
        });
        copyText(resultCard ? resultCard.innerText : lastMarkdown).then(() => {
          setCopyLabel(shareResultButton, ".share-label", true, "fullProfile", "fullProfileCopied");
          flash(shareResultButton, () => setCopyLabel(shareResultButton, ".share-label", false, "fullProfile", "fullProfileCopied"));
        });
      });
    }

    if (copyProfileButton) {
      copyProfileButton.addEventListener("click", () => {
        if (!lastProfile) return;
        trackEvent("copy_profile", {
          location: "profile_result",
          role: track.key,
          result_type: "profile",
          content_type: "linkedin_about",
        });
        copyText(lastProfile.about.join("\n\n")).then(() => {
          setCopyLabel(copyProfileButton, ".copy-profile-label", true, "copyAbout", "aboutCopied");
          flash(copyProfileButton, () => setCopyLabel(copyProfileButton, ".copy-profile-label", false, "copyAbout", "aboutCopied"));
        });
      });
    }

    if (downloadButton) {
      downloadButton.addEventListener("click", () => {
        if (!lastProfile) return;
        trackEvent("download_card", {
          location: "profile_result",
          role: track.key,
          result_type: "profile",
          file_format: "md",
        });
        downloadText(resultCard ? resultCard.innerText : lastMarkdown, "git-hired-ai-native-profile.md");
        setCopyLabel(downloadButton, ".download-card-label", true, "downloadMarkdown", "markdownDownloaded");
        flash(downloadButton, () => setCopyLabel(downloadButton, ".download-card-label", false, "downloadMarkdown", "markdownDownloaded"));
      });
    }

    if (headlineButton) {
      headlineButton.addEventListener("click", () => {
        if (!lastProfile) return;
        trackEvent("share_x", {
          location: "profile_result",
          role: track.key,
          result_type: "profile",
          share_target: "headline_copy",
        });
        copyText(lastProfile.headline).then(() => {
          setButtonText(headlineButton, true, { en: COPY.en.copyHeadline, zh: COPY.zh.copyHeadline }, { en: COPY.en.headlineCopied, zh: COPY.zh.headlineCopied });
          flash(headlineButton, () => setButtonText(headlineButton, false, { en: COPY.en.copyHeadline, zh: COPY.zh.copyHeadline }, { en: COPY.en.headlineCopied, zh: COPY.zh.headlineCopied }));
        });
      });
    }

    if (bulletsButton) {
      bulletsButton.addEventListener("click", () => {
        if (!lastProfile) return;
        trackEvent("share_linkedin", {
          location: "profile_result",
          role: track.key,
          result_type: "profile",
          share_target: "resume_bullets_copy",
        });
        copyText(lastProfile.bullets.map((item) => "- " + item).join("\n")).then(() => {
          setButtonText(bulletsButton, true, { en: COPY.en.copyBullets, zh: COPY.zh.copyBullets }, { en: COPY.en.bulletsCopied, zh: COPY.zh.bulletsCopied });
          flash(bulletsButton, () => setButtonText(bulletsButton, false, { en: COPY.en.copyBullets, zh: COPY.zh.copyBullets }, { en: COPY.en.bulletsCopied, zh: COPY.zh.bulletsCopied }));
        });
      });
    }

    if (profileUrlButton) {
      profileUrlButton.addEventListener("click", () => {
        trackEvent("create_public_profile", {
          location: "profile_result",
          role: track.key,
          result_type: "profile",
          profile_url: publicProfileUrl(track),
        });
        copyText(publicProfileUrl(track)).then(() => {
          setCopyLabel(profileUrlButton, ".public-profile-label", true, "copyPublicProfile", "publicProfileCopied");
          flash(profileUrlButton, () => setCopyLabel(profileUrlButton, ".public-profile-label", false, "copyPublicProfile", "publicProfileCopied"));
        });
      });
    }

    if (copyAgentButton) {
      copyAgentButton.addEventListener("click", () => {
        copyText(AGENT_PROMPT).then(() => {
          setCopyLabel(copyAgentButton, ".agent-copy-label", true, "copyAgentPrompt", "promptCopied");
          flash(copyAgentButton, () => setCopyLabel(copyAgentButton, ".agent-copy-label", false, "copyAgentPrompt", "promptCopied"));
        });
      });
    }

    if (waitlistLink) {
      waitlistLink.addEventListener("click", () => {
        trackEvent("click_team_waitlist", {
          location: "profile_result_secondary",
          role: track.key,
          result_type: "profile",
          waitlist_target: "github_issue",
        });
      });
    }

    new MutationObserver(() => {
      updateStatusLabel(Boolean(lastProfile));
      if (lastProfile && resultCard) renderProfile(resultCard, lastProfile);
      resetLabels();
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-lang", "lang"],
    });

    resetLabels();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
