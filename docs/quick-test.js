/* global window, document, MutationObserver, navigator, HTMLInputElement, ClipboardItem */
(function () {
  "use strict";

  const AGENT_PROMPT = "read https://realroc.github.io/git-hired/skill.md";
  const SIGNAL_KEYS = ["build", "sell"];
  const ASCII_GIT_HIRED = [
    "  ██████╗ ██╗████████╗       ██╗  ██╗██╗██████╗ ███████╗██████╗ ",
    "  ██╔════╝ ██║╚══██╔══╝       ██║  ██║██║██╔══██╗██╔════╝██╔══██╗",
    "  ██║  ███╗██║   ██║          ███████║██║██████╔╝█████╗  ██║  ██║",
    "  ██║   ██║██║   ██║          ██╔══██║██║██╔══██╗██╔══╝  ██║  ██║",
    "  ╚██████╔╝██║   ██║          ██║  ██║██║██║  ██║███████╗██████╔╝",
    "   ╚═════╝ ╚═╝   ╚═╝          ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ",
  ].join("\n");

  const MODE_RESULTS = [
    {
      key: "builder",
      title: { en: "Builder", zh: "Builder / 构建者" },
      summary: {
        en: "You create value by turning ideas into products, systems, prototypes, workflows, or automation.",
        zh: "你更擅长通过产品、系统、原型、工作流或自动化把想法变成价值。",
      },
      strengths: {
        en: [
          "Turns ambiguity into something people can try, use, or improve.",
          "Uses AI as leverage for prototypes, systems, and repeatable workflows.",
        ],
        zh: [
          "能把模糊想法变成别人可以试用、使用或继续改进的东西。",
          "会把 AI 当作原型、系统和可重复工作流的杠杆。",
        ],
      },
      edge: {
        en: "Build proof: a shipped demo, working automation, useful internal tool, or clear system artifact.",
        zh: "构建证明：上线 demo、可运行自动化、有用内部工具，或清晰的系统产物。",
      },
      watch: {
        en: "A strong build can still be invisible if you do not explain who it helps and why it matters.",
        zh: "再强的构建，如果没有说明帮助了谁、为什么重要，也可能变得不可见。",
      },
      proof: {
        en: "Pick one painful workflow and ship a tiny AI-assisted version that saves time or improves quality.",
        zh: "选一个高痛点工作流，交付一个 AI 辅助的小版本，证明它节省时间或提升质量。",
      },
      challenge: {
        en: "Build challenge: ship a one-week prototype, automation, or workflow with a before/after proof note.",
        zh: "Build challenge：用一周交付一个原型、自动化或工作流，并写清楚前后对比证据。",
      },
    },
    {
      key: "seller",
      title: { en: "Seller", zh: "Seller / 销售者" },
      summary: {
        en: "You create value by making ideas travel through expression, narrative, distribution, sales, recruiting, or community.",
        zh: "你更擅长通过表达、叙事、分发、销售、招聘或传播让想法流动起来。",
      },
      strengths: {
        en: [
          "Turns raw value into language that people understand, trust, and act on.",
          "Uses AI to sharpen messages, find channels, and create distribution loops.",
        ],
        zh: [
          "能把原始价值转成别人听得懂、愿意信、会行动的语言。",
          "会用 AI 打磨信息、寻找渠道，并建立分发循环。",
        ],
      },
      edge: {
        en: "Sell proof: a campaign, outbound sequence, hiring narrative, launch thread, or conversion signal.",
        zh: "销售证明：一次 campaign、outbound 序列、招聘叙事、发布内容，或转化信号。",
      },
      watch: {
        en: "A strong story needs a real artifact, offer, or audience signal behind it.",
        zh: "再强的叙事，也需要真实产物、明确 offer 或受众反馈作为支撑。",
      },
      proof: {
        en: "Pick one real offer and run a small distribution loop: message, audience, channel, response, learning.",
        zh: "选一个真实 offer，跑一个小分发循环：信息、受众、渠道、反馈、学习。",
      },
      challenge: {
        en: "Sell challenge: run a one-week narrative or outbound experiment with response and learning evidence.",
        zh: "Sell challenge：用一周做一次叙事或 outbound 实验，并保留反馈和学习证据。",
      },
    },
  ];

  const QUESTION_STEPS = [
    {
      label: "01",
      title: {
        en: "When a messy opportunity appears, you first want to...",
        zh: "看到一个混乱机会时，你第一反应更想...",
      },
      aria: "Messy opportunity",
      options: [
        {
          value: "build-prototype",
          signal: "build",
          label: {
            en: "Build a quick prototype so people can react to something real.",
            zh: "先做一个快速原型，让大家对真实东西有反馈。",
          },
          detail: {
            en: "A working version reveals the real constraints.",
            zh: "可运行版本会暴露真实约束。",
          },
        },
        {
          value: "sell-message",
          signal: "sell",
          label: {
            en: "Write the pitch and test whether anyone cares.",
            zh: "先写出 pitch，测试有没有人在乎。",
          },
          detail: {
            en: "Demand and language decide whether the work matters.",
            zh: "需求和语言决定这件事是否重要。",
          },
        },
        {
          value: "build-system",
          signal: "build",
          label: {
            en: "Map the workflow and find what can be automated.",
            zh: "梳理工作流，找出可以自动化的部分。",
          },
          detail: {
            en: "The leverage is usually inside the system.",
            zh: "杠杆通常藏在系统里。",
          },
        },
        {
          value: "sell-audience",
          signal: "sell",
          label: {
            en: "Find the audience and the channel first.",
            zh: "先找受众和渠道。",
          },
          detail: {
            en: "The right market can shape the whole answer.",
            zh: "正确市场会反过来塑造答案。",
          },
        },
      ],
    },
    {
      label: "02",
      title: {
        en: "Your favorite AI leverage is...",
        zh: "你最喜欢的 AI 杠杆是...",
      },
      aria: "AI leverage",
      options: [
        {
          value: "build-code",
          signal: "build",
          label: {
            en: "Using agents to create tools, code, workflows, or repeatable systems.",
            zh: "用 agent 创建工具、代码、工作流或可重复系统。",
          },
          detail: {
            en: "AI helps you turn effort into infrastructure.",
            zh: "AI 帮你把努力沉淀成基础设施。",
          },
        },
        {
          value: "sell-copy",
          signal: "sell",
          label: {
            en: "Using AI to sharpen copy, positioning, and outbound messages.",
            zh: "用 AI 打磨文案、定位和 outbound 信息。",
          },
          detail: {
            en: "AI helps you make ideas travel faster.",
            zh: "AI 帮你让想法传播得更快。",
          },
        },
        {
          value: "build-debug",
          signal: "build",
          label: {
            en: "Using AI to debug, refactor, and make a system more reliable.",
            zh: "用 AI debug、重构，并让系统更可靠。",
          },
          detail: {
            en: "Quality compounds when the system improves.",
            zh: "系统变好后，质量会复利。",
          },
        },
        {
          value: "sell-research",
          signal: "sell",
          label: {
            en: "Using AI to research people, markets, objections, and hooks.",
            zh: "用 AI 研究人群、市场、异议和 hook。",
          },
          detail: {
            en: "Understanding people makes distribution sharper.",
            zh: "理解人会让分发更锋利。",
          },
        },
      ],
    },
    {
      label: "03",
      title: {
        en: "To prove value, you would rather show...",
        zh: "为了证明价值，你更想展示...",
      },
      aria: "Proof preference",
      options: [
        {
          value: "build-demo",
          signal: "build",
          label: {
            en: "A live demo that solves a real workflow.",
            zh: "一个解决真实工作流的 live demo。",
          },
          detail: {
            en: "Use is the cleanest proof.",
            zh: "可用性是最直接的证明。",
          },
        },
        {
          value: "sell-conversion",
          signal: "sell",
          label: {
            en: "A response, signup, reply, intro, or conversion signal.",
            zh: "回复、注册、转介绍、引荐或转化信号。",
          },
          detail: {
            en: "Action from real people is proof.",
            zh: "真实人的行动就是证明。",
          },
        },
        {
          value: "build-before-after",
          signal: "build",
          label: {
            en: "A before/after artifact showing time saved or quality improved.",
            zh: "一个前后对比产物，说明省了时间或提升了质量。",
          },
          detail: {
            en: "The result is visible in the process.",
            zh: "结果体现在流程变化里。",
          },
        },
        {
          value: "sell-story",
          signal: "sell",
          label: {
            en: "A narrative that makes the value obvious to the right people.",
            zh: "一个让目标人群立刻理解价值的叙事。",
          },
          detail: {
            en: "Clarity can unlock demand.",
            zh: "清晰表达能解锁需求。",
          },
        },
      ],
    },
    {
      label: "04",
      title: {
        en: "When a team is stuck, you are more likely to...",
        zh: "团队卡住时，你更可能...",
      },
      aria: "Unblocking work",
      options: [
        {
          value: "build-tool",
          signal: "build",
          label: {
            en: "Make a small tool or process that removes the bottleneck.",
            zh: "做一个小工具或流程，把瓶颈移走。",
          },
          detail: {
            en: "Fix the system so the work moves.",
            zh: "修系统，让事情动起来。",
          },
        },
        {
          value: "sell-align",
          signal: "sell",
          label: {
            en: "Reframe the goal so people understand why to act now.",
            zh: "重新表达目标，让大家知道为什么现在要行动。",
          },
          detail: {
            en: "Momentum often starts with belief and clarity.",
            zh: "推进力常从信念和清晰开始。",
          },
        },
        {
          value: "build-spec",
          signal: "build",
          label: {
            en: "Write the spec and turn it into a working checklist.",
            zh: "写出 spec，并把它变成可执行清单。",
          },
          detail: {
            en: "Structure makes execution possible.",
            zh: "结构让执行成为可能。",
          },
        },
        {
          value: "sell-room",
          signal: "sell",
          label: {
            en: "Get the right people into the right conversation.",
            zh: "把对的人拉进对的对话里。",
          },
          detail: {
            en: "The bottleneck may be trust, not tasks.",
            zh: "瓶颈可能是信任，不是任务。",
          },
        },
      ],
    },
    {
      label: "05",
      title: {
        en: "The work artifact you naturally leave behind is...",
        zh: "你最自然留下的工作产物是...",
      },
      aria: "Work artifact",
      options: [
        {
          value: "build-repo",
          signal: "build",
          label: {
            en: "A repo, prototype, automation, dashboard, or operating system.",
            zh: "repo、原型、自动化、dashboard 或操作系统。",
          },
          detail: {
            en: "The artifact can keep working after you leave.",
            zh: "你离开后，产物还能继续工作。",
          },
        },
        {
          value: "sell-playbook",
          signal: "sell",
          label: {
            en: "A launch plan, sales script, hiring story, or distribution playbook.",
            zh: "发布计划、销售话术、招聘故事或分发 playbook。",
          },
          detail: {
            en: "The message can keep spreading after you leave.",
            zh: "你离开后，信息还能继续传播。",
          },
        },
        {
          value: "build-workflow",
          signal: "build",
          label: {
            en: "A cleaner workflow others can reuse.",
            zh: "一个别人可以复用的更干净工作流。",
          },
          detail: {
            en: "Reusable systems create durable leverage.",
            zh: "可复用系统创造长期杠杆。",
          },
        },
        {
          value: "sell-market-map",
          signal: "sell",
          label: {
            en: "A market map, audience list, or relationship path.",
            zh: "市场地图、受众列表或关系路径。",
          },
          detail: {
            en: "Knowing who matters changes the next move.",
            zh: "知道谁重要，会改变下一步。",
          },
        },
      ],
    },
    {
      label: "06",
      title: {
        en: "If you had one week to create signal, you would...",
        zh: "如果只有一周创造信号，你会...",
      },
      aria: "One week signal",
      options: [
        {
          value: "build-week-demo",
          signal: "build",
          label: {
            en: "Ship a tiny product or automation and document the result.",
            zh: "交付一个小产品或自动化，并记录结果。",
          },
          detail: {
            en: "A shipped artifact makes the signal concrete.",
            zh: "交付物让信号变具体。",
          },
        },
        {
          value: "sell-week-outbound",
          signal: "sell",
          label: {
            en: "Run a small outbound or content experiment and measure response.",
            zh: "跑一个小 outbound 或内容实验，并衡量反馈。",
          },
          detail: {
            en: "The market answers faster than planning.",
            zh: "市场反馈比规划更快。",
          },
        },
        {
          value: "build-week-agent",
          signal: "build",
          label: {
            en: "Build an agent workflow that saves one repeated task.",
            zh: "做一个 agent 工作流，节省一个重复任务。",
          },
          detail: {
            en: "Small automation can prove large leverage.",
            zh: "小自动化可以证明大杠杆。",
          },
        },
        {
          value: "sell-week-recruit",
          signal: "sell",
          label: {
            en: "Create a recruiting or partnership narrative and test it with real people.",
            zh: "做一个招聘或合作叙事，并找真实的人测试。",
          },
          detail: {
            en: "Conviction grows through live response.",
            zh: "信念来自真实反馈。",
          },
        },
      ],
    },
    {
      label: "07",
      title: {
        en: "Your default way to improve weak work is...",
        zh: "面对不够强的工作，你默认会...",
      },
      aria: "Improving weak work",
      options: [
        {
          value: "build-fix",
          signal: "build",
          label: {
            en: "Fix the flow, remove friction, and make the output more reliable.",
            zh: "修流程、减少摩擦，并让产出更可靠。",
          },
          detail: {
            en: "Better systems make better work repeatable.",
            zh: "更好的系统让好工作可重复。",
          },
        },
        {
          value: "sell-clarify",
          signal: "sell",
          label: {
            en: "Clarify the promise, audience, proof, and call to action.",
            zh: "讲清承诺、受众、证据和行动指令。",
          },
          detail: {
            en: "Better framing makes value easier to see.",
            zh: "更好的框架让价值更容易被看见。",
          },
        },
        {
          value: "build-test",
          signal: "build",
          label: {
            en: "Add tests, constraints, or instrumentation.",
            zh: "加测试、约束或观测指标。",
          },
          detail: {
            en: "Reliability is a reputation signal.",
            zh: "可靠性本身就是 reputation 信号。",
          },
        },
        {
          value: "sell-objection",
          signal: "sell",
          label: {
            en: "Find the objection and rewrite around it.",
            zh: "找到异议，并围绕它重写表达。",
          },
          detail: {
            en: "Trust grows when doubts are answered.",
            zh: "回应疑虑会增加信任。",
          },
        },
      ],
    },
    {
      label: "08",
      title: {
        en: "You feel most useful when...",
        zh: "你什么时候最觉得自己有用？",
      },
      aria: "Usefulness",
      options: [
        {
          value: "build-working",
          signal: "build",
          label: {
            en: "Something broken starts working because of what you made.",
            zh: "某个坏掉的东西，因为你做的产物开始运转。",
          },
          detail: {
            en: "The proof is in the working system.",
            zh: "证明在可运转系统里。",
          },
        },
        {
          value: "sell-moving",
          signal: "sell",
          label: {
            en: "People move because your words made the value click.",
            zh: "因为你的表达让价值被理解，人们开始行动。",
          },
          detail: {
            en: "The proof is in changed behavior.",
            zh: "证明在行为变化里。",
          },
        },
        {
          value: "build-repeatable",
          signal: "build",
          label: {
            en: "A team can repeat a better process without you pushing it.",
            zh: "团队不用你推，也能重复一个更好的流程。",
          },
          detail: {
            en: "Systems scale beyond personal effort.",
            zh: "系统能超越个人努力。",
          },
        },
        {
          value: "sell-connection",
          signal: "sell",
          label: {
            en: "The right person, customer, candidate, or partner says yes.",
            zh: "正确的用户、候选人、客户或伙伴说 yes。",
          },
          detail: {
            en: "Distribution turns potential into opportunity.",
            zh: "分发把潜力变成机会。",
          },
        },
      ],
    },
    {
      label: "09",
      title: {
        en: "When you explain your work, you lead with...",
        zh: "解释自己的工作时，你通常先讲...",
      },
      aria: "Explaining work",
      options: [
        {
          value: "build-how",
          signal: "build",
          label: {
            en: "What it does, how it works, and what changed.",
            zh: "它做什么、怎么运转、改变了什么。",
          },
          detail: {
            en: "Mechanism and result come first.",
            zh: "机制和结果优先。",
          },
        },
        {
          value: "sell-why",
          signal: "sell",
          label: {
            en: "Who it is for, why now, and why they should care.",
            zh: "它给谁、为什么现在重要、为什么对方该在乎。",
          },
          detail: {
            en: "Audience and urgency come first.",
            zh: "受众和紧迫性优先。",
          },
        },
        {
          value: "build-constraint",
          signal: "build",
          label: {
            en: "The constraints, tradeoffs, and implementation choices.",
            zh: "约束、取舍和实现选择。",
          },
          detail: {
            en: "Good work survives technical reality.",
            zh: "好工作要穿过技术现实。",
          },
        },
        {
          value: "sell-proof",
          signal: "sell",
          label: {
            en: "The proof, social signal, and next ask.",
            zh: "证据、社会信号和下一步请求。",
          },
          detail: {
            en: "Good work needs a path to adoption.",
            zh: "好工作需要通向采用的路径。",
          },
        },
      ],
    },
    {
      label: "10",
      title: {
        en: "The challenge you would choose right now is...",
        zh: "现在让你选一个 challenge，你会选...",
      },
      aria: "Challenge choice",
      options: [
        {
          value: "build-agent",
          signal: "build",
          label: {
            en: "Build an AI workflow that makes one real task faster or better.",
            zh: "构建一个 AI 工作流，让一个真实任务更快或更好。",
          },
          detail: {
            en: "A useful artifact can become reputation.",
            zh: "有用产物可以变成 reputation。",
          },
        },
        {
          value: "sell-launch",
          signal: "sell",
          label: {
            en: "Launch a narrative and get real people to respond.",
            zh: "发布一个叙事，并让真实的人产生反馈。",
          },
          detail: {
            en: "A real response can become reputation.",
            zh: "真实反馈可以变成 reputation。",
          },
        },
        {
          value: "build-internal-tool",
          signal: "build",
          label: {
            en: "Turn a manual process into a small internal tool.",
            zh: "把一个手工流程变成小型内部工具。",
          },
          detail: {
            en: "Operational leverage is visible proof.",
            zh: "运营杠杆是可见证明。",
          },
        },
        {
          value: "sell-outbound",
          signal: "sell",
          label: {
            en: "Run an outbound sequence for a product, hire, or partnership.",
            zh: "为产品、招聘或合作跑一个 outbound 序列。",
          },
          detail: {
            en: "Movement from others is visible proof.",
            zh: "他人的行动是可见证明。",
          },
        },
      ],
    },
  ];

  const COPY = {
    en: {
      resultTitle: "AI-native reputation card",
      modeLabel: "Your mode:",
      strengthsTitle: "Your strengths",
      edgeTitle: "Your edge",
      watchTitle: "Watch out",
      proofTitle: "Next proof",
      challengeTitle: "Challenge to prove it",
      hiringSignalTitle: "Hiring signal",
      hiringSignalBody: "This is a quick self-report. Reputation starts when you attach challenge proof: the artifact, the audience, the result, and what changed.",
      shareResult: "share",
      shared: "image copied",
      textCopied: "text copied",
      copyProfile: "Copy profile",
      profileCopied: "profile copied",
      downloadCard: "Download image",
      cardDownloaded: "download started",
      copyPublicProfile: "Copy public URL",
      publicProfileCopied: "public URL copied",
      copyAgentPrompt: "Copy agent prompt",
      promptCopied: "prompt copied",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "Previous",
    },
    zh: {
      resultTitle: "AI-native reputation 卡片",
      modeLabel: "你的模式：",
      strengthsTitle: "你的优势",
      edgeTitle: "你的优势场",
      watchTitle: "需要注意",
      proofTitle: "下一步证明",
      challengeTitle: "用挑战证明它",
      hiringSignalTitle: "招聘信号",
      hiringSignalBody: "这是一个快速自测。真正的 reputation 从 challenge proof 开始：产物、受众、结果，以及发生了什么变化。",
      shareResult: "分享",
      shared: "图片已复制",
      textCopied: "文字已复制",
      copyProfile: "复制 profile",
      profileCopied: "profile 已复制",
      downloadCard: "下载图片",
      cardDownloaded: "开始下载",
      copyPublicProfile: "复制公开链接",
      publicProfileCopied: "公开链接已复制",
      copyAgentPrompt: "复制 Agent 指令",
      promptCopied: "指令已复制",
      progress: (current, total) => String(current).padStart(2, "0") + " / " + String(total).padStart(2, "0"),
      back: "上一题",
    },
  };

  function currentLang() {
    const lang = document.documentElement.dataset.lang || document.body?.dataset.lang;
    return lang === "zh" ? "zh" : "en";
  }

  function trackEvent(eventName, properties) {
    const analytics = window.gitHiredAnalytics;
    if (!analytics || typeof analytics.track !== "function") return;
    analytics.track(eventName, properties);
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

  function localizedNode(tag, lang, content) {
    const node = makeElement(tag, "", content);
    node.dataset.lang = lang;
    return node;
  }

  function renderQuestionSteps(form) {
    const nav = form.querySelector(".quick-nav");
    if (!nav) return;

    form.querySelectorAll(".quick-step").forEach((step) => step.remove());

    QUESTION_STEPS.forEach((question, index) => {
      const section = makeElement("section", "section question-block quick-step" + (index === 0 ? " is-active" : ""));
      section.dataset.step = String(index + 1);

      const head = makeElement("div", "question-head");
      head.append(
        makeElement("span", "question-step", question.label),
        localizedNode("h2", "en", question.title.en),
        localizedNode("h2", "zh", question.title.zh)
      );

      const choices = makeElement("div", "choice-grid one-up");
      choices.setAttribute("role", "radiogroup");
      choices.setAttribute("aria-label", question.aria);

      question.options.forEach((option) => {
        const label = makeElement("label", "choice");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "q" + (index + 1);
        input.value = option.value;
        input.required = true;
        input.dataset.labelEn = option.label.en;
        input.dataset.labelZh = option.label.zh;
        input.dataset[signalDatasetKey(option.signal)] = "1";

        const copy = document.createElement("span");
        copy.append(
          localizedNode("strong", "en", option.label.en),
          localizedNode("strong", "zh", option.label.zh),
          localizedNode("small", "en", option.detail.en),
          localizedNode("small", "zh", option.detail.zh)
        );

        label.append(input, copy);
        choices.append(label);
      });

      section.append(head, choices);
      form.insertBefore(section, nav);
    });
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

  function scoreMode(scores) {
    return scores.sell > scores.build
      ? MODE_RESULTS.find((mode) => mode.key === "seller")
      : MODE_RESULTS.find((mode) => mode.key === "builder");
  }

  function scoreQuickTest(form) {
    const scores = Object.fromEntries(SIGNAL_KEYS.map((key) => [key, 0]));
    selectedOptions(form).forEach((option) => {
      SIGNAL_KEYS.forEach((signal) => {
        scores[signal] += datasetNumber(option, signalDatasetKey(signal));
      });
    });

    return {
      mode: scoreMode(scores),
      scores,
    };
  }

  function resultType(result) {
    return result?.mode?.key || "";
  }

  function resultByKey(key) {
    const normalized = key === "build" ? "builder" : key === "sell" ? "seller" : key;
    const mode = MODE_RESULTS.find((item) => item.key === normalized);
    return mode ? { mode } : null;
  }

  function resultFromLocation() {
    let key = "";
    try {
      const url = new URL(window.location.href);
      key = url.searchParams.get("result") || "";
      if (!key && url.hash.startsWith("#result=")) {
        key = decodeURIComponent(url.hash.slice("#result=".length));
      }
    } catch (error) {
      key = "";
    }
    return resultByKey(key);
  }

  function publicProfileUrl(result) {
    const key = resultType(result);
    const url = new URL(window.location.href);
    url.search = key ? "?result=" + encodeURIComponent(key) : "";
    url.hash = "";
    return url.toString();
  }

  function challengeIssueUrl(result, lang) {
    const mode = result?.mode;
    const modeKey = resultType(result) || "builder";
    const title = "Challenge proof: " + localized(mode?.title || MODE_RESULTS[0].title, "en");
    const body = [
      "Mode: " + localized(mode?.title || MODE_RESULTS[0].title, lang),
      "",
      lang === "zh" ? "Challenge 目标：" : "Challenge goal:",
      localized(mode?.challenge || MODE_RESULTS[0].challenge, lang),
      "",
      lang === "zh" ? "我要证明：" : "I want to prove:",
      "",
      lang === "zh" ? "产物 / 内容链接：" : "Artifact / content link:",
      "",
      lang === "zh" ? "结果信号：" : "Result signal:",
      "",
      lang === "zh" ? "我希望团队如何解读这个 proof：" : "How I want teams to read this proof:",
    ].join("\n");
    return "https://github.com/realRoc/git-hired/issues/new?labels=challenge," +
      encodeURIComponent(modeKey) +
      "&title=" + encodeURIComponent(title) +
      "&body=" + encodeURIComponent(body);
  }

  function questionStep(input) {
    const step = input.closest(".quick-step");
    return step?.dataset.step || "";
  }

  function answeredCount(form) {
    return selectedOptions(form).length;
  }

  function renderStrengths(mode, lang) {
    const section = makeElement("section", "builder-card-section");
    section.append(makeElement("h3", "", text(lang, "strengthsTitle")));
    const list = makeElement("ul", "builder-list");
    localized(mode.strengths, lang).forEach((item) => {
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
    const mode = result.mode;
    const strengths = localized(mode.strengths, lang).map((item) => "- " + item).join("\n");
    return [
      "git-hired",
      text(lang, "modeLabel") + " " + localized(mode.title, lang),
      localized(mode.summary, lang),
      "",
      text(lang, "strengthsTitle") + ":",
      strengths,
      "",
      text(lang, "edgeTitle") + ":",
      localized(mode.edge, lang),
      "",
      text(lang, "watchTitle") + ":",
      localized(mode.watch, lang),
      "",
      text(lang, "proofTitle") + ":",
      localized(mode.proof, lang),
      "",
      text(lang, "challengeTitle") + ":",
      localized(mode.challenge, lang),
      "",
      text(lang, "hiringSignalTitle") + ":",
      text(lang, "hiringSignalBody"),
      "",
      publicProfileUrl(result),
    ].join("\n");
  }

  function renderResultCard(host, result, lang) {
    if (!host || !result) return;
    const mode = result.mode;
    const ascii = makeElement("pre", "builder-card-ascii", ASCII_GIT_HIRED);
    const identity = makeElement("div", "builder-identity");
    identity.append(
      makeElement("span", "builder-card-kicker", text(lang, "resultTitle")),
      makeElement(
        "strong",
        "builder-card-type",
        text(lang, "modeLabel") + " " + localized(mode.title, lang)
      ),
      makeElement("p", "builder-card-summary", localized(mode.summary, lang))
    );

    host.replaceChildren(
      ascii,
      identity,
      renderStrengths(mode, lang),
      renderTextSection(text(lang, "edgeTitle"), localized(mode.edge, lang)),
      renderTextSection(text(lang, "watchTitle"), localized(mode.watch, lang)),
      renderTextSection(text(lang, "proofTitle"), localized(mode.proof, lang)),
      renderTextSection(text(lang, "challengeTitle"), localized(mode.challenge, lang)),
      renderTextSection(text(lang, "hiringSignalTitle"), text(lang, "hiringSignalBody"))
    );
  }

  function renderChallengeEntry(result, lang) {
    if (!result) return;
    const mode = result.mode;
    const title = document.getElementById("mode-challenge-title");
    const body = document.getElementById("mode-challenge-body");
    const link = document.getElementById("mode-challenge-link");
    if (title) title.textContent = localized(mode.title, lang) + " challenge";
    if (body) body.textContent = localized(mode.challenge, lang);
    if (link) link.href = challengeIssueUrl(result, lang);
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
    const mode = result.mode;
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
    const topbarX = cardX + 32;
    const topbarY = cardY + 32;
    const topbarWidth = cardWidth - 64;
    const topbarHeight = 58;

    roundedRect(ctx, topbarX, topbarY, topbarWidth, topbarHeight, 12);
    ctx.fillStyle = "rgba(255, 255, 255, 0.018)";
    ctx.fill();
    ctx.strokeStyle = "rgba(126, 142, 126, 0.42)";
    ctx.lineWidth = 1;
    ctx.stroke();

    [0, 1, 2].forEach((index) => {
      ctx.beginPath();
      ctx.arc(topbarX + 26 + index * 20, topbarY + 29, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#313a34";
      ctx.fill();
    });
    ctx.font = "500 19px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#7a847c";
    ctx.fillText("~/git-hired / reputation.card", topbarX + 96, topbarY + 36);
    ctx.fillStyle = "#8ee88f";
    ctx.fillText(lang === "zh" ? "结果已生成" : "RESULT READY", topbarX + topbarWidth - 172, topbarY + 36);

    let y = topbarY + 110;

    ctx.font = "500 21px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#8ee88f";
    ASCII_GIT_HIRED.split("\n").forEach((line) => {
      ctx.fillText(line, x - 16, y);
      y += 25;
    });
    y += 38;

    ctx.font = "500 26px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#7a847c";
    ctx.fillText("AI-native reputation card", x, y);
    y += 74;

    ctx.font = lang === "zh"
      ? "700 68px MiSans, PingFang SC, Microsoft YaHei, sans-serif"
      : "700 66px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#8ee88f";
    y = drawWrappedText(
      ctx,
      text(lang, "modeLabel") + " " + localized(mode.title, lang),
      x,
      y,
      maxWidth,
      76,
      2
    ) + 18;

    ctx.font = "400 36px Inter, MiSans, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#edf4ed";
    y = drawWrappedText(ctx, localized(mode.summary, lang), x, y, maxWidth, 48, 3) + 40;

    y = drawShareSection(ctx, text(lang, "strengthsTitle"), localized(mode.strengths, lang).join("  /  "), x, y, maxWidth);
    y = drawShareSection(ctx, text(lang, "edgeTitle"), localized(mode.edge, lang), x, y, maxWidth);
    y = drawShareSection(ctx, text(lang, "proofTitle"), localized(mode.proof, lang), x, y, maxWidth);
    y = drawShareSection(ctx, text(lang, "hiringSignalTitle"), text(lang, "hiringSignalBody"), x, y, maxWidth);

    ctx.strokeStyle = "rgba(142, 232, 143, 0.24)";
    ctx.beginPath();
    ctx.moveTo(x, canvas.height - 154);
    ctx.lineTo(x + maxWidth, canvas.height - 154);
    ctx.stroke();
    ctx.font = "500 24px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#7a847c";
    ctx.fillText("git-hired · challenge proof · reputation signal", x, canvas.height - 104);
    ctx.fillStyle = "#8ee88f";
    ctx.fillText(publicProfileUrl(result), x, canvas.height - 66);

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

  function downloadBlob(blob, filename) {
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

  function downloadShareImage(result, lang) {
    return renderShareImage(result, lang).then((blob) => {
      downloadBlob(blob, "git-hired-" + resultType(result) + ".png");
      return true;
    });
  }

  function socialShareText(result, lang) {
    const title = localized(result.mode.title, lang);
    return lang === "zh"
      ? "我的 git-hired AI-native reputation mode 是 " + title + "。"
      : "My git-hired AI-native reputation mode is " + title + ".";
  }

  function openShareUrl(url) {
    window.open(url, "_blank", "noopener,noreferrer");
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
    if (!form) return;

    renderQuestionSteps(form);

    const steps = Array.from(document.querySelectorAll(".quick-step"));
    const progressLabel = document.getElementById("quick-progress-label");
    const progressFill = document.getElementById("quick-progress-fill");
    const resultShell = document.getElementById("quick-result");
    const resultCard = document.getElementById("result-card");
    const shareResultButton = document.getElementById("share-result");
    const copyProfileButton = document.getElementById("copy-profile");
    const downloadCardButton = document.getElementById("download-card");
    const shareXButton = document.getElementById("share-x");
    const shareLinkedInButton = document.getElementById("share-linkedin");
    const createPublicProfileButton = document.getElementById("create-public-profile");
    const teamWaitlistLink = document.getElementById("team-waitlist-link");
    const copyAgentButton = document.getElementById("copy-agent-prompt");
    const backButtons = [
      document.getElementById("quick-back"),
      document.getElementById("quick-back-zh"),
    ].filter(Boolean);
    const retakeButtons = [
      document.getElementById("retake-test"),
    ].filter(Boolean);

    if (!steps.length) return;

    let currentIndex = 0;
    let copyTimer = 0;
    let agentCopyTimer = 0;
    let profileCopyTimer = 0;
    let downloadTimer = 0;
    let publicProfileTimer = 0;
    let lastResult = null;
    let lastResultText = "";
    let quizStarted = false;

    function resetResultActionLabels() {
      window.clearTimeout(copyTimer);
      window.clearTimeout(agentCopyTimer);
      window.clearTimeout(profileCopyTimer);
      window.clearTimeout(downloadTimer);
      window.clearTimeout(publicProfileTimer);
      setCopyLabel(shareResultButton, ".share-label", false, "shareResult", "shared");
      setCopyLabel(copyProfileButton, ".copy-profile-label", false, "copyProfile", "profileCopied");
      setCopyLabel(downloadCardButton, ".download-card-label", false, "downloadCard", "cardDownloaded");
      setCopyLabel(createPublicProfileButton, ".public-profile-label", false, "copyPublicProfile", "publicProfileCopied");
      setCopyLabel(copyAgentButton, ".agent-copy-label", false, "copyAgentPrompt", "promptCopied");
    }

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

    function showResult(result, source) {
      lastResult = result || scoreQuickTest(form);
      const lang = currentLang();
      const modeType = resultType(lastResult);
      lastResultText = buildResultText(lastResult, lang);
      renderResultCard(resultCard, lastResult, lang);
      renderChallengeEntry(lastResult, lang);
      document.body.classList.add("result-mode");
      resetResultActionLabels();
      if (resultShell) resultShell.classList.remove("is-hidden");
      form.classList.add("is-complete");
      if (source !== "public_profile") {
        trackEvent("select_role", {
          location: "quick_result",
          role: "reputation_mode",
          result_type: modeType,
          question_id: "q" + steps.length,
          selection_type: "builder_seller_mode",
        });
        trackEvent("complete_quiz", {
          location: "quick_test",
          result_type: modeType,
          question_id: "q" + steps.length,
          answer_count: answeredCount(form),
        });
      }
      trackEvent("view_result", {
        location: source === "public_profile" ? "public_profile" : "quick_result",
        result_type: modeType,
        question_id: "q" + steps.length,
        profile_url: publicProfileUrl(lastResult),
      });
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
      if (!quizStarted) {
        quizStarted = true;
        trackEvent("start_quiz", {
          location: "quick_test_question",
          question_id: input.name || "",
          question_step: questionStep(input),
          answer_value: input.value,
          answer_label_en: input.dataset.labelEn || "",
          answer_label_zh: input.dataset.labelZh || "",
          answer_count: answeredCount(form),
        });
      }
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
        quizStarted = false;
        form.classList.remove("is-complete");
        document.body.classList.remove("result-mode");
        if (resultShell) resultShell.classList.add("is-hidden");
        resetResultActionLabels();
        if (window.location.search || window.location.hash.startsWith("#result=")) {
          window.history.replaceState(null, "", window.location.pathname);
        }
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
        trackEvent("click_share", {
          location: "result_card",
          result_type: resultType(lastResult),
          question_id: "q" + steps.length,
          share_target: "clipboard",
          profile_url: publicProfileUrl(lastResult),
        });
        lastResultText = buildResultText(lastResult, lang);
        copyShareImage(lastResult, lang).then((mode) => {
          setCopyLabel(shareResultButton, ".share-label", true, "shareResult", mode === "image" ? "shared" : "textCopied");
          window.clearTimeout(copyTimer);
          copyTimer = window.setTimeout(() => setCopyLabel(shareResultButton, ".share-label", false, "shareResult", "shared"), 1600);
        });
      });
    }

    if (copyProfileButton) {
      copyProfileButton.addEventListener("click", () => {
        if (!lastResult) return;
        const lang = currentLang();
        lastResultText = buildResultText(lastResult, lang);
        trackEvent("copy_profile", {
          location: "result_card",
          result_type: resultType(lastResult),
          question_id: "q" + steps.length,
          profile_url: publicProfileUrl(lastResult),
          content_type: "text",
        });
        copyText(lastResultText).then(() => {
          setCopyLabel(copyProfileButton, ".copy-profile-label", true, "copyProfile", "profileCopied");
          window.clearTimeout(profileCopyTimer);
          profileCopyTimer = window.setTimeout(() => setCopyLabel(copyProfileButton, ".copy-profile-label", false, "copyProfile", "profileCopied"), 1400);
        });
      });
    }

    if (downloadCardButton) {
      downloadCardButton.addEventListener("click", () => {
        if (!lastResult) return;
        const lang = currentLang();
        trackEvent("download_card", {
          location: "result_card",
          result_type: resultType(lastResult),
          question_id: "q" + steps.length,
          file_format: "png",
          profile_url: publicProfileUrl(lastResult),
        });
        downloadShareImage(lastResult, lang).then(() => {
          setCopyLabel(downloadCardButton, ".download-card-label", true, "downloadCard", "cardDownloaded");
          window.clearTimeout(downloadTimer);
          downloadTimer = window.setTimeout(() => setCopyLabel(downloadCardButton, ".download-card-label", false, "downloadCard", "cardDownloaded"), 1400);
        });
      });
    }

    if (shareXButton) {
      shareXButton.addEventListener("click", () => {
        if (!lastResult) return;
        const lang = currentLang();
        const profileUrl = publicProfileUrl(lastResult);
        trackEvent("share_x", {
          location: "result_card",
          result_type: resultType(lastResult),
          question_id: "q" + steps.length,
          profile_url: profileUrl,
        });
        openShareUrl("https://twitter.com/intent/tweet?text=" + encodeURIComponent(socialShareText(lastResult, lang)) + "&url=" + encodeURIComponent(profileUrl));
      });
    }

    if (shareLinkedInButton) {
      shareLinkedInButton.addEventListener("click", () => {
        if (!lastResult) return;
        const profileUrl = publicProfileUrl(lastResult);
        trackEvent("share_linkedin", {
          location: "result_card",
          result_type: resultType(lastResult),
          question_id: "q" + steps.length,
          profile_url: profileUrl,
        });
        openShareUrl("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(profileUrl));
      });
    }

    if (createPublicProfileButton) {
      createPublicProfileButton.addEventListener("click", () => {
        if (!lastResult) return;
        const profileUrl = publicProfileUrl(lastResult);
        trackEvent("create_public_profile", {
          location: "result_card",
          result_type: resultType(lastResult),
          question_id: "q" + steps.length,
          profile_url: profileUrl,
        });
        copyText(profileUrl).then(() => {
          setCopyLabel(createPublicProfileButton, ".public-profile-label", true, "copyPublicProfile", "publicProfileCopied");
          window.clearTimeout(publicProfileTimer);
          publicProfileTimer = window.setTimeout(() => setCopyLabel(createPublicProfileButton, ".public-profile-label", false, "copyPublicProfile", "publicProfileCopied"), 1400);
        });
      });
    }

    if (teamWaitlistLink) {
      teamWaitlistLink.addEventListener("click", () => {
        trackEvent("click_team_waitlist", {
          location: "result_page_secondary",
          result_type: resultType(lastResult),
          question_id: "q" + steps.length,
          waitlist_target: "github_issue",
          profile_url: lastResult ? publicProfileUrl(lastResult) : "",
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
        renderChallengeEntry(lastResult, lang);
        setCopyLabel(shareResultButton, ".share-label", shareResultButton?.dataset.copyState === "copied", "shareResult", "shared");
        setCopyLabel(copyProfileButton, ".copy-profile-label", copyProfileButton?.dataset.copyState === "copied", "copyProfile", "profileCopied");
        setCopyLabel(downloadCardButton, ".download-card-label", downloadCardButton?.dataset.copyState === "copied", "downloadCard", "cardDownloaded");
        setCopyLabel(createPublicProfileButton, ".public-profile-label", createPublicProfileButton?.dataset.copyState === "copied", "copyPublicProfile", "publicProfileCopied");
        setCopyLabel(copyAgentButton, ".agent-copy-label", copyAgentButton?.dataset.copyState === "copied", "copyAgentPrompt", "promptCopied");
      }
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-lang", "lang"],
    });

    const publicResult = resultFromLocation();
    if (publicResult) {
      showResult(publicResult, "public_profile");
    } else {
      renderStep();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
