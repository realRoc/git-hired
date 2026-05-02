/* global window, document, MutationObserver, navigator, HTMLInputElement, ClipboardItem */
(function () {
  "use strict";

  const AGENT_PROMPT = "read https://realroc.github.io/git-hired/skill.md";
  const TRACK_KEYS = ["builder", "seller"];
  const ASCII_GIT_HIRED = [
    "  ██████╗ ██╗████████╗       ██╗  ██╗██╗██████╗ ███████╗██████╗ ",
    "  ██╔════╝ ██║╚══██╔══╝       ██║  ██║██║██╔══██╗██╔════╝██╔══██╗",
    "  ██║  ███╗██║   ██║          ███████║██║██████╔╝█████╗  ██║  ██║",
    "  ██║   ██║██║   ██║          ██╔══██║██║██╔══██╗██╔══╝  ██║  ██║",
    "  ╚██████╔╝██║   ██║          ██║  ██║██║██║  ██║███████╗██████╔╝",
    "   ╚═════╝ ╚═╝   ╚═╝          ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ",
  ].join("\n");

  const MATURITY_OPTIONS = [
    {
      value: "not-yet",
      score: 0,
      label: { en: "Not yet", zh: "还没有" },
      detail: {
        en: "No real evidence yet for this signal.",
        zh: "这个信号还没有真实证据。",
      },
    },
    {
      value: "tried-guided",
      score: 1,
      label: { en: "Tried once / with guidance", zh: "试过一次 / 需要指导" },
      detail: {
        en: "You tried it, but the problem or standard was mostly defined by someone else.",
        zh: "你试过，但问题定义或验收标准主要来自别人。",
      },
    },
    {
      value: "done-independently",
      score: 2,
      label: { en: "Done independently", zh: "能独立完成" },
      detail: {
        en: "You can do this without heavy management.",
        zh: "你不需要重管理也能完成。",
      },
    },
    {
      value: "repeated-evidence",
      score: 3,
      label: { en: "Done repeatedly with evidence", zh: "反复做过，并有证据" },
      detail: {
        en: "You have repeatable examples, public artifacts, or clear work traces.",
        zh: "你有可重复案例、公开产物或清晰工作痕迹。",
      },
    },
    {
      value: "adoption-impact",
      score: 4,
      label: { en: "Done with real adoption / measurable impact", zh: "产生真实采用 / 可衡量影响" },
      detail: {
        en: "Other people used, responded, adopted, or benefited from the work.",
        zh: "已经有人使用、回应、采用，或从中受益。",
      },
    },
  ];

  const TRACKS = {
    builder: {
      key: "builder",
      title: { en: "Builder", zh: "Builder" },
      label: { en: "Builder Track", zh: "Builder 赛道" },
      definition: {
        en: "Builders make things real: they turn ambiguity into useful artifacts with AI.",
        zh: "Builders make things real：他们用 AI 把模糊问题变成可用成果。",
      },
      challengeName: { en: "Build challenge", zh: "Build challenge" },
      questions: [
        {
          key: "ai-task-execution",
          signal: { en: "AI task execution", zh: "AI 任务执行" },
          title: {
            en: "Have you used AI to complete a clearly defined work task?",
            zh: "你是否用 AI 完成过一个被清楚定义的工作任务？",
          },
        },
        {
          key: "workflow-building",
          signal: { en: "Workflow building", zh: "工作流构建" },
          title: {
            en: "Have you built an AI workflow that you or others use repeatedly?",
            zh: "你是否搭建过自己或别人会反复使用的 AI workflow？",
          },
        },
        {
          key: "prototyping",
          signal: { en: "Prototyping", zh: "原型能力" },
          title: {
            en: "Have you turned a vague idea into a working prototype?",
            zh: "你是否把一个模糊想法变成过可运行原型？",
          },
        },
        {
          key: "end-to-end-shipping",
          signal: { en: "End-to-end shipping", zh: "端到端交付" },
          title: {
            en: "Have you shipped a product, tool, automation, demo, or research artifact end-to-end?",
            zh: "你是否端到端交付过产品、工具、自动化、demo 或研究产物？",
          },
        },
        {
          key: "user-feedback",
          signal: { en: "User feedback", zh: "用户反馈" },
          title: {
            en: "Have real users used or tested something you built?",
            zh: "是否有真实用户使用或测试过你构建的东西？",
          },
        },
        {
          key: "tradeoff-explanation",
          signal: { en: "Product and technical judgment", zh: "产品与技术判断" },
          title: {
            en: "Can you clearly explain the problem, users, solution, tradeoffs, and implementation?",
            zh: "你是否能清楚解释问题、用户、方案、取舍和实现？",
          },
        },
        {
          key: "public-evidence",
          signal: { en: "Public evidence", zh: "公开证据" },
          title: {
            en: "Do you have public evidence such as demo, repo, screenshots, write-up, users, or case study?",
            zh: "你是否有 demo、repo、截图、复盘、用户或 case study 等公开证据？",
          },
        },
        {
          key: "workflow-impact",
          signal: { en: "Team or business impact", zh: "团队或业务影响" },
          title: {
            en: "Has something you built improved a team, workflow, business metric, or market outcome?",
            zh: "你构建的东西是否改进过团队、工作流、业务指标或市场结果？",
          },
        },
        {
          key: "systems-used-by-others",
          signal: { en: "Systems used by others", zh: "多人使用的系统" },
          title: {
            en: "Have you guided others or designed systems used by multiple people?",
            zh: "你是否指导过别人构建，或设计过多人使用的系统？",
          },
        },
        {
          key: "market-adoption",
          signal: { en: "Market adoption", zh: "市场采用" },
          title: {
            en: "Have you built something that created adoption beyond your immediate circle?",
            zh: "你是否构建过超出身边小圈子的采用或影响？",
          },
        },
      ],
      levels: [
        {
          key: "gh-l3",
          code: "GH-L3",
          min: 0,
          stage: { en: "Entry", zh: "Entry" },
          title: { en: "AI Task Executor", zh: "AI 任务执行者" },
          means: {
            en: "You can use AI to complete clearly defined tasks such as code, analysis, content, simple workflows, or simple automation.",
            zh: "你能用 AI 完成明确任务，例如代码、分析、内容、简单 workflow 或简单自动化。",
          },
          market: {
            en: ["Learning / assistant-level opportunities", "AI task support", "Intern or apprentice builder work"],
            zh: ["学习型 / 助理级机会", "AI 任务支持", "实习或学徒型 builder 工作"],
          },
          missing: {
            en: ["Independent problem definition", "Reusable workflow evidence", "Public artifact or user feedback"],
            zh: ["独立定义问题的证据", "可复用 workflow 证据", "公开产物或用户反馈"],
          },
          upgrade: {
            en: ["Pick one repeated task and automate a small part of it.", "Document the input, workflow, output, and failure cases.", "Ask one real user or teammate to test it."],
            zh: ["选择一个重复任务，自动化其中一小段。", "记录输入、流程、输出和失败场景。", "找一个真实用户或队友测试。"],
          },
          challenge: {
            en: "Build one tiny AI workflow that turns a manual task into a repeatable output. Share a screenshot or short write-up.",
            zh: "构建一个小型 AI workflow，把一个手工任务变成可重复产出。分享截图或简短复盘。",
          },
          nextGap: {
            en: "show you can independently build a repeatable workflow.",
            zh: "证明你能独立搭建可重复 workflow。",
          },
        },
        {
          key: "gh-l4",
          code: "GH-L4",
          min: 9,
          stage: { en: "Independent", zh: "Independent" },
          title: { en: "Independent Workflow Builder", zh: "独立工作流构建者" },
          means: {
            en: "You can independently build reusable workflows, automations, or prototypes and explain the problem, solution, and tradeoffs.",
            zh: "你能独立搭建可复用 workflow、自动化或原型，并解释问题、方案和取舍。",
          },
          market: {
            en: ["Entry-level AI operator", "Automation assistant", "Junior product builder", "Founder's office assistant"],
            zh: ["入门 AI operator", "自动化助理", "初级产品构建者", "创始人办公室助理"],
          },
          missing: {
            en: ["Shipped artifacts with real users", "Public demo, repo, or case study", "Evidence that the output changed a workflow or user behavior"],
            zh: ["有真实用户的已交付产物", "公开 demo、repo 或 case study", "产出改变工作流或用户行为的证据"],
          },
          upgrade: {
            en: ["Turn one workflow into a usable demo, not just a private script.", "Write the problem, user, solution, tradeoffs, and result in public.", "Collect feedback from at least three real users."],
            zh: ["把一个 workflow 做成可用 demo，而不是私人脚本。", "公开写清问题、用户、方案、取舍和结果。", "收集至少 3 个真实用户反馈。"],
          },
          challenge: {
            en: "Build one useful AI workflow, prototype, automation, tool, or artifact in 48 hours. Share it publicly and collect real feedback.",
            zh: "48 小时内构建一个有用的 AI workflow、原型、自动化、工具或成果。公开分享并收集真实反馈。",
          },
          nextGap: {
            en: "show shipped user value, not only workflow competence.",
            zh: "证明已交付的用户价值，而不只是 workflow 能力。",
          },
        },
        {
          key: "gh-l5",
          code: "GH-L5",
          min: 18,
          stage: { en: "Senior", zh: "Senior" },
          title: { en: "Senior Product Shipper", zh: "高级产品交付者" },
          means: {
            en: "You can start from ambiguity and ship a product, system, tool, or artifact with real user, business, or market value.",
            zh: "你能从模糊问题出发，独立 ship 有真实用户、业务或市场价值的产品、系统、工具或成果。",
          },
          market: {
            en: ["Junior-to-mid full-time roles", "AI workflow roles", "Product or growth operator", "Strong early-career candidate"],
            zh: ["初中级全职岗位", "AI workflow 相关岗位", "产品或增长 operator", "较强早期候选人"],
          },
          missing: {
            en: ["Team-level or cross-functional impact", "Systems used by multiple people", "Repeatable method that helps others build"],
            zh: ["团队级或跨职能影响", "多人使用的系统", "能帮助别人构建的可重复方法"],
          },
          upgrade: {
            en: ["Move from single artifact to system: docs, handoff, reliability, and iteration loop.", "Show how the work changed a team metric, user behavior, or business process.", "Teach one person or team to reuse your method."],
            zh: ["从单个产物升级成系统：文档、交接、可靠性和迭代闭环。", "展示它如何改变团队指标、用户行为或业务流程。", "教一个人或团队复用你的方法。"],
          },
          challenge: {
            en: "Upgrade one shipped artifact into a reusable system with docs, user feedback, and a clear before/after impact note.",
            zh: "把一个已交付产物升级成可复用系统，补齐文档、用户反馈和清晰前后对比影响。",
          },
          nextGap: {
            en: "show leverage across people, systems, or teams.",
            zh: "证明跨人、系统或团队的杠杆影响。",
          },
        },
        {
          key: "gh-l6",
          code: "GH-L6",
          min: 28,
          stage: { en: "Staff", zh: "Staff" },
          title: { en: "Staff Systems Builder", zh: "Staff 级系统构建者" },
          means: {
            en: "You can design complex systems, guide others, and improve team efficiency, product direction, or business process across modules or teams.",
            zh: "你能设计复杂系统，带动多人协作，并跨模块或团队提升效率、产品方向或业务流程。",
          },
          market: {
            en: ["Strong full-time candidate", "Senior operator", "Founding team contributor", "Team-level impact role"],
            zh: ["强全职候选人", "高级 operator", "创始团队贡献者", "团队级影响岗位"],
          },
          missing: {
            en: ["Category or market-level adoption", "Direction-setting evidence", "Sustained high-leverage outcomes beyond one organization"],
            zh: ["类别或市场级采用", "定义方向的证据", "超越单一组织的持续高杠杆成果"],
          },
          upgrade: {
            en: ["Publish the system logic so others outside your team can learn from it.", "Connect the system to market, community, or category adoption.", "Show sustained impact across multiple cycles."],
            zh: ["公开系统逻辑，让团队外的人也能学习。", "把系统连接到市场、社区或类别采用。", "展示多个周期的持续影响。"],
          },
          challenge: {
            en: "Turn one internal system into a public playbook or template and prove that people outside your team can use it.",
            zh: "把一个内部系统转成公开 playbook 或模板，并证明团队外的人也能使用。",
          },
          nextGap: {
            en: "show market-level direction and adoption.",
            zh: "证明市场级方向定义和采用。",
          },
        },
        {
          key: "gh-l7",
          code: "GH-L7",
          min: 36,
          stage: { en: "Principal", zh: "Principal" },
          title: { en: "Principal Market Builder", zh: "Principal 级市场构建者" },
          means: {
            en: "You can define new directions and repeatedly build products, platforms, infrastructure, or categories that the market adopts.",
            zh: "你能定义新方向，并持续构建被市场采用的产品、平台、基础设施或类别。",
          },
          market: {
            en: ["Founder-like hire", "Principal operator", "Category builder", "High-value market-level contributor"],
            zh: ["创始人型人才", "Principal operator", "类别构建者", "高价值市场级贡献者"],
          },
          missing: {
            en: ["Keep evidence current", "Clarify what category you are shaping", "Make your market-level proof easy to inspect"],
            zh: ["持续更新证据", "讲清你正在塑造的类别", "让市场级 proof 更容易被检查"],
          },
          upgrade: {
            en: ["Maintain a public evidence trail of adoption and direction-setting work.", "Show how your work changes what others build or buy.", "Use challenges to make the next category signal inspectable."],
            zh: ["维护一条公开的采用和方向定义证据链。", "展示你的工作如何改变别人构建或购买的东西。", "用 challenge 让下一轮信号可检查。"],
          },
          challenge: {
            en: "Publish one category-level thesis with a working artifact and adoption evidence from people outside your immediate circle.",
            zh: "发布一个类别级 thesis，配套可用产物和来自身边小圈子之外的采用证据。",
          },
          nextGap: {
            en: "keep market-level evidence fresh and inspectable.",
            zh: "持续保持市场级证据新鲜且可检查。",
          },
        },
      ],
    },
    seller: {
      key: "seller",
      title: { en: "Seller", zh: "Seller" },
      label: { en: "Seller Track", zh: "Seller 赛道" },
      definition: {
        en: "Sellers make people care: they turn ideas into attention, trust, adoption, and revenue with AI.",
        zh: "Sellers make people care：他们用 AI 把想法变成关注、信任、采用和收入。",
      },
      challengeName: { en: "Sell challenge", zh: "Sell challenge" },
      questions: [
        {
          key: "ai-communication",
          signal: { en: "AI-assisted communication", zh: "AI 辅助沟通" },
          title: {
            en: "Have you used AI to improve communication, writing, pitch, or content?",
            zh: "你是否用 AI 改善过沟通、写作、pitch 或内容？",
          },
        },
        {
          key: "audience-message",
          signal: { en: "Audience and message", zh: "受众与信息" },
          title: {
            en: "Have you clearly defined a target audience and message for an idea?",
            zh: "你是否为一个想法清楚定义过目标受众和信息？",
          },
        },
        {
          key: "real-responses",
          signal: { en: "Real response", zh: "真实回应" },
          title: {
            en: "Have you published content, pitch, outreach, or campaign that generated real responses?",
            zh: "你是否发布过内容、pitch、outreach 或 campaign，并获得真实回应？",
          },
        },
        {
          key: "opportunity-creation",
          signal: { en: "Opportunity creation", zh: "机会创造" },
          title: {
            en: "Have you created attention, signups, leads, sales, candidates, users, or partnerships?",
            zh: "你是否创造过关注、注册、线索、销售机会、候选人、用户或合作？",
          },
        },
        {
          key: "repeatable-distribution",
          signal: { en: "Repeatable distribution", zh: "可重复分发" },
          title: {
            en: "Have you repeated a distribution motion successfully across multiple attempts?",
            zh: "你是否多次重复过一个有效的分发动作？",
          },
        },
        {
          key: "public-traction",
          signal: { en: "Public traction evidence", zh: "公开 traction 证据" },
          title: {
            en: "Do you have public evidence such as posts, replies, traffic, waitlist, leads, conversions, or revenue?",
            zh: "你是否有帖子、回复、流量、waitlist、线索、转化或收入等公开证据？",
          },
        },
        {
          key: "momentum-creation",
          signal: { en: "Momentum creation", zh: "势能创造" },
          title: {
            en: "Have you helped recruit, sell, fundraise, market, or create momentum for a project?",
            zh: "你是否帮助一个项目招聘、销售、融资、营销或创造势能？",
          },
        },
        {
          key: "narrative-shift",
          signal: { en: "Narrative shift", zh: "叙事改变" },
          title: {
            en: "Have you changed how others understand or talk about a product, idea, or market?",
            zh: "你是否改变过别人理解或谈论某个产品、想法或市场的方式？",
          },
        },
        {
          key: "multi-channel",
          signal: { en: "Multi-channel operation", zh: "多渠道运营" },
          title: {
            en: "Have you led a multi-channel growth, sales, recruiting, or community effort?",
            zh: "你是否主导过多渠道增长、销售、招聘或社区动作？",
          },
        },
        {
          key: "market-shaping",
          signal: { en: "Market shaping", zh: "市场塑造" },
          title: {
            en: "Have you shaped market perception or category narrative?",
            zh: "你是否塑造过市场认知或类别叙事？",
          },
        },
      ],
      levels: [
        {
          key: "gh-l3",
          code: "GH-L3",
          min: 0,
          stage: { en: "Entry", zh: "Entry" },
          title: { en: "AI-assisted Communicator", zh: "AI 辅助沟通者" },
          means: {
            en: "You can use AI to improve expression, content, pitch, communication, and basic distribution tasks.",
            zh: "你能用 AI 改善表达、内容、pitch、沟通和基础传播任务。",
          },
          market: {
            en: ["Learning / assistant-level opportunities", "Content or communication support", "Intern or apprentice seller work"],
            zh: ["学习型 / 助理级机会", "内容或沟通支持", "实习或学徒型 seller 工作"],
          },
          missing: {
            en: ["Clear target audience", "Real replies or response evidence", "Public distribution proof"],
            zh: ["清晰目标受众", "真实回复或回应证据", "公开分发 proof"],
          },
          upgrade: {
            en: ["Pick one idea and define audience, promise, channel, and ask.", "Publish or send one small message to real people.", "Record who responded and what you learned."],
            zh: ["选择一个想法，定义受众、承诺、渠道和行动请求。", "向真实的人发布或发送一条小信息。", "记录谁回应了以及你学到什么。"],
          },
          challenge: {
            en: "Use AI to write one sharp pitch for a real idea, send or publish it, and record the first response signal.",
            zh: "用 AI 为一个真实想法写出清晰 pitch，发送或发布，并记录第一个回应信号。",
          },
          nextGap: {
            en: "show you can independently build a narrative for a defined audience.",
            zh: "证明你能为明确受众独立构建叙事。",
          },
        },
        {
          key: "gh-l4",
          code: "GH-L4",
          min: 9,
          stage: { en: "Independent", zh: "Independent" },
          title: { en: "Independent Narrative Builder", zh: "独立叙事构建者" },
          means: {
            en: "You can independently define audience, message, and positioning, then get real response from the market.",
            zh: "你能独立定义受众、信息和定位，并获得真实市场回应。",
          },
          market: {
            en: ["Entry-level AI operator", "Marketing or founder's office intern", "Community or recruiting assistant", "Junior growth contributor"],
            zh: ["入门 AI operator", "市场或创始人办公室实习", "社区或招聘助理", "初级增长贡献者"],
          },
          missing: {
            en: ["Repeatable distribution motion", "Measurable response such as leads, signups, candidates, or revenue", "Public traction evidence"],
            zh: ["可重复分发动作", "线索、注册、候选人或收入等可衡量回应", "公开 traction 证据"],
          },
          upgrade: {
            en: ["Run the same motion across several attempts, not one post.", "Track replies, signups, leads, conversions, or qualified conversations.", "Save public evidence so the market can inspect the signal."],
            zh: ["不要只做一条内容，重复运行同一个动作。", "记录回复、注册、线索、转化或有效对话。", "保存公开证据，让市场能检查信号。"],
          },
          challenge: {
            en: "Launch one idea publicly in 48 hours with a post, pitch, landing page, outreach sequence, or campaign. Try to get real replies, signups, leads, candidates, users, or feedback.",
            zh: "48 小时内公开发布一个想法：帖子、pitch、落地页、outreach 序列或 campaign。尝试获得真实回复、注册、线索、候选人、用户或反馈。",
          },
          nextGap: {
            en: "show repeatable distribution and measurable response.",
            zh: "证明可重复分发和可衡量回应。",
          },
        },
        {
          key: "gh-l5",
          code: "GH-L5",
          min: 18,
          stage: { en: "Senior", zh: "Senior" },
          title: { en: "Senior Distribution Operator", zh: "高级分发操盘手" },
          means: {
            en: "You can repeatedly create reach, leads, users, candidates, sales opportunities, or growth outcomes and use AI to increase distribution efficiency.",
            zh: "你能稳定制造触达、线索、用户、候选人、销售机会或增长结果，并用 AI 提升分发效率。",
          },
          market: {
            en: ["Junior-to-mid full-time roles", "AI growth or distribution roles", "Recruiting or sales operator", "Strong early-career candidate"],
            zh: ["初中级全职岗位", "AI 增长或分发岗位", "招聘或销售 operator", "较强早期候选人"],
          },
          missing: {
            en: ["Cross-channel or team-level demand creation", "Clear business, recruiting, or revenue outcomes", "Influence over positioning or strategy"],
            zh: ["跨渠道或团队级需求创造", "明确业务、招聘或收入结果", "对定位或策略的影响"],
          },
          upgrade: {
            en: ["Connect content, outbound, community, and conversion into one operating loop.", "Show the business result, not only activity metrics.", "Document the narrative and channel logic so others can run it."],
            zh: ["把内容、outbound、社区和转化连成一个运营闭环。", "展示业务结果，而不只是活动指标。", "记录叙事和渠道逻辑，让别人也能执行。"],
          },
          challenge: {
            en: "Run a two-channel distribution sprint for one real offer and publish the response metrics, learnings, and next iteration.",
            zh: "为一个真实 offer 跑一次双渠道分发冲刺，公开回应指标、学习和下一轮迭代。",
          },
          nextGap: {
            en: "show cross-channel demand creation with business impact.",
            zh: "证明跨渠道需求创造和业务影响。",
          },
        },
        {
          key: "gh-l6",
          code: "GH-L6",
          min: 28,
          stage: { en: "Staff", zh: "Staff" },
          title: { en: "Staff Demand Creator", zh: "Staff 级需求创造者" },
          means: {
            en: "You can create demand across channels and teams, shaping positioning, narrative, strategy, and business or hiring outcomes.",
            zh: "你能跨渠道、跨团队创造需求，影响定位、叙事、策略，以及业务或招聘结果。",
          },
          market: {
            en: ["Strong full-time candidate", "Senior operator", "Founding team contributor", "Team-level growth, sales, or recruiting role"],
            zh: ["强全职候选人", "高级 operator", "创始团队贡献者", "团队级增长、销售或招聘岗位"],
          },
          missing: {
            en: ["Category-level narrative", "Trust network beyond one team", "Market perception change or sustained distribution power"],
            zh: ["类别级叙事", "超越单团队的信任网络", "市场认知改变或持续分发能力"],
          },
          upgrade: {
            en: ["Move from campaign results to category thesis.", "Build trust channels that compound across customers, talent, capital, or community.", "Show how your narrative changes what others believe or repeat."],
            zh: ["从 campaign 结果升级到类别 thesis。", "构建能在客户、人才、资本或社区里复利的信任渠道。", "展示你的叙事如何改变别人相信或复述的内容。"],
          },
          challenge: {
            en: "Publish a category narrative, test it across two trusted channels, and document how people repeat, challenge, or adopt it.",
            zh: "发布一个类别叙事，在两个可信渠道测试，并记录人们如何复述、质疑或采用它。",
          },
          nextGap: {
            en: "show market perception change, not only demand generation.",
            zh: "证明市场认知改变，而不只是需求生成。",
          },
        },
        {
          key: "gh-l7",
          code: "GH-L7",
          min: 36,
          stage: { en: "Principal", zh: "Principal" },
          title: { en: "Principal Market Shaper", zh: "Principal 级市场塑造者" },
          means: {
            en: "You can change market perception or category direction through narrative, trust, relationships, sales, and distribution power.",
            zh: "你能通过叙事、信任、关系网络、销售和分发能力改变市场认知或类别方向。",
          },
          market: {
            en: ["Founder-like hire", "Principal operator", "Category builder", "High-value market-level contributor"],
            zh: ["创始人型人才", "Principal operator", "类别构建者", "高价值市场级贡献者"],
          },
          missing: {
            en: ["Keep evidence current", "Clarify what market belief changed", "Make trust and adoption evidence inspectable"],
            zh: ["持续更新证据", "讲清哪种市场信念发生变化", "让信任和采用证据可检查"],
          },
          upgrade: {
            en: ["Maintain a public trail of category narrative, trust signals, and adoption.", "Show who repeated, funded, hired, bought, or built because of the direction.", "Use challenges to make the next market signal visible."],
            zh: ["维护类别叙事、信任信号和采用的公开证据链。", "展示谁因为这个方向复述、投资、招聘、购买或构建。", "用 challenge 让下一轮市场信号更可见。"],
          },
          challenge: {
            en: "Launch one market thesis with distribution proof: who repeated it, who acted on it, and what changed.",
            zh: "发布一个市场 thesis，并附上分发 proof：谁复述了、谁采取行动了、发生了什么变化。",
          },
          nextGap: {
            en: "keep market-level evidence fresh and inspectable.",
            zh: "持续保持市场级证据新鲜且可检查。",
          },
        },
      ],
    },
  };

  const COPY = {
    en: {
      resultTitle: "AI-native market level card",
      yourLevelTitle: "Your Level",
      meansTitle: "What this level means",
      marketReadTitle: "Market Read",
      missingSignalsTitle: "Missing Signals",
      nextLevelTitle: "Next Level",
      upgradePlanTitle: "Upgrade Plan",
      recommendedChallengeTitle: "Recommended Challenge",
      trustTitle: "Trust Boundary",
      trackLabel: "Track",
      scoreLabel: "Signal score",
      levelNote: "Inspired by Big Tech leveling. Not equivalent to any specific company level.",
      noNextLevel: "You are already at the highest GH level in this lightweight assessment. Keep market evidence current and inspectable.",
      trustPoints: ["No private work required.", "Use public links only.", "You control what you share."],
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
      resultTitle: "AI-native market level 卡片",
      yourLevelTitle: "Your Level",
      meansTitle: "What this level means",
      marketReadTitle: "Market Read",
      missingSignalsTitle: "Missing Signals",
      nextLevelTitle: "Next Level",
      upgradePlanTitle: "Upgrade Plan",
      recommendedChallengeTitle: "Recommended Challenge",
      trustTitle: "Trust Boundary",
      trackLabel: "赛道",
      scoreLabel: "信号得分",
      levelNote: "受大厂职级逻辑启发，但不等同于任何具体公司的职级。",
      noNextLevel: "你已经处在这个轻量评估的最高 GH Level。下一步是持续保持市场证据新鲜且可检查。",
      trustPoints: ["不需要私人作品。", "只使用公开链接。", "你决定分享什么。"],
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
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.en || "";
  }

  function localizedList(value, lang) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value[lang] || value.en || [];
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

  function normalizeTrackKey(value) {
    const key = String(value || "").toLowerCase().trim();
    if (key === "build") return "builder";
    if (key === "sell") return "seller";
    return TRACK_KEYS.includes(key) ? key : "builder";
  }

  function normalizeLevelKey(value) {
    const key = String(value || "").toLowerCase().trim().replace("_", "-");
    if (/^l[3-7]$/.test(key)) return "gh-" + key;
    if (/^gh-l[3-7]$/.test(key)) return key;
    return "";
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

  function levelForScore(track, score) {
    const levels = track.levels.slice().sort((a, b) => a.min - b.min);
    return levels.reduce((current, level) => score >= level.min ? level : current, levels[0]);
  }

  function nextLevel(track, level) {
    const index = track.levels.findIndex((item) => item.key === level.key);
    return index >= 0 && index < track.levels.length - 1 ? track.levels[index + 1] : null;
  }

  function levelByKey(track, key) {
    return track.levels.find((level) => level.key === key) || null;
  }

  function levelDisplay(result, lang) {
    return [
      result.level.code,
      localized(result.track.title, lang),
      "—",
      localized(result.level.title, lang),
    ].join(" ");
  }

  function resultType(result) {
    return result ? result.track.key + "-" + result.level.key : "";
  }

  function renderQuestionSteps(form) {
    const nav = form.querySelector(".quick-nav");
    const track = selectedTrack();
    if (!nav) return;

    form.querySelectorAll(".quick-step").forEach((step) => step.remove());

    track.questions.forEach((question, index) => {
      const section = makeElement("section", "section question-block quick-step" + (index === 0 ? " is-active" : ""));
      section.dataset.step = String(index + 1);

      const head = makeElement("div", "question-head");
      head.append(
        makeElement("span", "question-step", String(index + 1).padStart(2, "0")),
        localizedNode("h2", "en", question.title.en),
        localizedNode("h2", "zh", question.title.zh)
      );

      const choices = makeElement("div", "choice-grid one-up");
      choices.setAttribute("role", "radiogroup");
      choices.setAttribute("aria-label", localized(question.signal, "en"));

      MATURITY_OPTIONS.forEach((option) => {
        const label = makeElement("label", "choice");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "q" + (index + 1);
        input.value = question.key + ":" + option.value;
        input.required = true;
        input.dataset.score = String(option.score);
        input.dataset.track = track.key;
        input.dataset.signalEn = question.signal.en;
        input.dataset.signalZh = question.signal.zh;
        input.dataset.labelEn = option.label.en;
        input.dataset.labelZh = option.label.zh;

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

      section.append(head);
      if (index === 0) {
        const intro = makeElement("p", "track-note");
        intro.append(
          localizedNode("span", "en", localized(track.definition, "en")),
          localizedNode("span", "zh", localized(track.definition, "zh"))
        );
        section.append(intro);
      }
      section.append(choices);
      form.insertBefore(section, nav);
    });
  }

  function selectedOptions(form) {
    return Array.from(form.querySelectorAll('input[type="radio"]:checked'));
  }

  function scoreQuickTest(form) {
    const track = selectedTrack();
    const answers = selectedOptions(form);
    const score = answers.reduce((sum, option) => sum + (Number(option.dataset.score) || 0), 0);
    const level = levelForScore(track, score);
    return {
      track,
      score,
      level,
      nextLevel: nextLevel(track, level),
      answers,
    };
  }

  function resultFromLocation() {
    try {
      const url = new URL(window.location.href);
      const legacyResult = url.searchParams.get("result") || "";
      const trackKey = normalizeTrackKey(url.searchParams.get("track") || legacyResult || "builder");
      const track = TRACKS[trackKey] || TRACKS.builder;
      let levelKey = normalizeLevelKey(url.searchParams.get("level") || "");
      if (!levelKey && legacyResult && TRACK_KEYS.includes(normalizeTrackKey(legacyResult))) {
        levelKey = "gh-l4";
      }
      if (!levelKey) return null;
      const level = levelByKey(track, levelKey);
      if (!level) return null;
      return {
        track,
        score: null,
        level,
        nextLevel: nextLevel(track, level),
        answers: [],
      };
    } catch (error) {
      return null;
    }
  }

  function publicProfileUrl(result) {
    const url = new URL(window.location.href);
    url.search = "?track=" + encodeURIComponent(result.track.key) + "&level=" + encodeURIComponent(result.level.key);
    url.hash = "";
    return url.toString();
  }

  function challengeIssueUrl(result, lang) {
    const title = "Challenge: " + levelDisplay(result, "en");
    const next = result.nextLevel;
    const body = [
      "Track: " + localized(result.track.title, lang),
      "Current level: " + levelDisplay(result, lang),
      "Next level: " + (next ? next.code + " " + localized(next.title, lang) : text(lang, "noNextLevel")),
      "",
      lang === "zh" ? "Recommended challenge:" : "Recommended challenge:",
      localized(result.level.challenge, lang),
      "",
      lang === "zh" ? "Public link only:" : "Public link only:",
      "",
      lang === "zh" ? "Observed signal:" : "Observed signal:",
      "",
      lang === "zh" ? "What changed:" : "What changed:",
      "",
      lang === "zh" ? "No private work required. I control what I share." : "No private work required. I control what I share.",
    ].join("\n");
    return "https://github.com/realRoc/git-hired/issues/new?labels=challenge," +
      encodeURIComponent(result.track.key) +
      "," +
      encodeURIComponent(result.level.key) +
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

  function renderListSection(title, items) {
    const section = makeElement("section", "builder-card-section");
    section.append(makeElement("h3", "", title));
    const list = makeElement("ul", "builder-list");
    items.forEach((item) => {
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

  function nextLevelCopy(result, lang) {
    if (!result.nextLevel) return text(lang, "noNextLevel");
    return [
      result.nextLevel.code,
      localized(result.track.title, lang),
      "—",
      localized(result.nextLevel.title, lang) + ":",
      localized(result.level.nextGap, lang),
    ].join(" ");
  }

  function buildResultText(result, lang) {
    return [
      "git-hired",
      text(lang, "resultTitle"),
      text(lang, "yourLevelTitle") + ": " + levelDisplay(result, lang),
      text(lang, "scoreLabel") + ": " + (result.score === null ? "public profile" : result.score + " / 40"),
      text(lang, "levelNote"),
      "",
      text(lang, "meansTitle") + ":",
      localized(result.level.means, lang),
      "",
      text(lang, "marketReadTitle") + ":",
      localizedList(result.level.market, lang).map((item) => "- " + item).join("\n"),
      "",
      text(lang, "missingSignalsTitle") + ":",
      localizedList(result.level.missing, lang).map((item) => "- " + item).join("\n"),
      "",
      text(lang, "nextLevelTitle") + ":",
      nextLevelCopy(result, lang),
      "",
      text(lang, "upgradePlanTitle") + ":",
      localizedList(result.level.upgrade, lang).map((item) => "- " + item).join("\n"),
      "",
      text(lang, "recommendedChallengeTitle") + ":",
      localized(result.level.challenge, lang),
      "",
      text(lang, "trustTitle") + ":",
      COPY[lang].trustPoints.map((item) => "- " + item).join("\n"),
      "",
      publicProfileUrl(result),
    ].join("\n");
  }

  function renderResultCard(host, result, lang) {
    if (!host || !result) return;
    const ascii = makeElement("pre", "builder-card-ascii", ASCII_GIT_HIRED);
    const identity = makeElement("div", "builder-identity");
    const score = result.score === null ? "" : " · " + text(lang, "scoreLabel") + " " + result.score + " / 40";
    identity.append(
      makeElement("span", "builder-card-kicker", text(lang, "resultTitle")),
      makeElement("strong", "builder-card-type", levelDisplay(result, lang)),
      makeElement("p", "builder-card-summary", localized(result.level.means, lang)),
      makeElement("p", "level-readout", text(lang, "trackLabel") + ": " + localized(result.track.label, lang) + score),
      makeElement("p", "level-note", text(lang, "levelNote"))
    );

    host.replaceChildren(
      ascii,
      identity,
      renderTextSection(text(lang, "yourLevelTitle"), levelDisplay(result, lang)),
      renderTextSection(text(lang, "meansTitle"), localized(result.level.means, lang)),
      renderListSection(text(lang, "marketReadTitle"), localizedList(result.level.market, lang)),
      renderListSection(text(lang, "missingSignalsTitle"), localizedList(result.level.missing, lang)),
      renderTextSection(text(lang, "nextLevelTitle"), nextLevelCopy(result, lang)),
      renderListSection(text(lang, "upgradePlanTitle"), localizedList(result.level.upgrade, lang)),
      renderTextSection(text(lang, "recommendedChallengeTitle"), localized(result.level.challenge, lang)),
      renderListSection(text(lang, "trustTitle"), COPY[lang].trustPoints)
    );
  }

  function renderChallengeEntry(result, lang) {
    if (!result) return;
    const title = document.getElementById("mode-challenge-title");
    const body = document.getElementById("mode-challenge-body");
    const link = document.getElementById("mode-challenge-link");
    const next = result.nextLevel;
    if (title) {
      title.textContent = localized(result.track.challengeName, lang) + ": " +
        result.level.code + (next ? " -> " + next.code : "");
    }
    if (body) body.textContent = localized(result.level.challenge, lang);
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
    ctx.font = "600 25px JetBrains Mono, Menlo, Consolas, monospace";
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
    ctx.fillText("~/git-hired / market-level.card", topbarX + 96, topbarY + 36);
    ctx.fillStyle = "#8ee88f";
    ctx.fillText(lang === "zh" ? "结果已生成" : "RESULT READY", topbarX + topbarWidth - 172, topbarY + 36);

    let y = topbarY + 124;

    ctx.font = "500 27px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#8ee88f";
    ctx.fillText("git-hired", x, y);
    y += 54;

    ctx.font = "500 26px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#7a847c";
    ctx.fillText(text(lang, "resultTitle"), x, y);
    y += 70;

    ctx.font = lang === "zh"
      ? "700 66px MiSans, PingFang SC, Microsoft YaHei, sans-serif"
      : "700 64px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#8ee88f";
    y = drawWrappedText(ctx, levelDisplay(result, lang), x, y, maxWidth, 74, 3) + 24;

    ctx.font = "400 34px Inter, MiSans, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#edf4ed";
    y = drawWrappedText(ctx, localized(result.level.means, lang), x, y, maxWidth, 46, 3) + 40;

    y = drawShareSection(ctx, text(lang, "marketReadTitle"), localizedList(result.level.market, lang).slice(0, 3).join("  /  "), x, y, maxWidth);
    y = drawShareSection(ctx, text(lang, "missingSignalsTitle"), localizedList(result.level.missing, lang).slice(0, 3).join("  /  "), x, y, maxWidth);
    y = drawShareSection(ctx, text(lang, "nextLevelTitle"), nextLevelCopy(result, lang), x, y, maxWidth);
    y = drawShareSection(ctx, text(lang, "recommendedChallengeTitle"), localized(result.level.challenge, lang), x, y, maxWidth);

    ctx.strokeStyle = "rgba(142, 232, 143, 0.24)";
    ctx.beginPath();
    ctx.moveTo(x, canvas.height - 154);
    ctx.lineTo(x + maxWidth, canvas.height - 154);
    ctx.stroke();
    ctx.font = "500 24px JetBrains Mono, Menlo, Consolas, monospace";
    ctx.fillStyle = "#7a847c";
    ctx.fillText("git-hired · market level · missing signals · next challenge", x, canvas.height - 104);
    ctx.fillStyle = "#8ee88f";
    drawWrappedText(ctx, publicProfileUrl(result), x, canvas.height - 66, maxWidth, 28, 1);

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
    const title = levelDisplay(result, lang);
    return lang === "zh"
      ? "我的 git-hired AI-native market level 是 " + title + "。"
      : "My git-hired AI-native market level is " + title + ".";
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

  function updateTrackChrome(track) {
    const path = document.querySelector(".quiz-topbar .topbar-path span:last-child");
    if (path) path.textContent = track.key + "-assessment";
  }

  function init() {
    const form = document.getElementById("quick-test-form");
    if (!form) return;

    const track = selectedTrack();
    updateTrackChrome(track);
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
      const levelType = resultType(lastResult);
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
          role: lastResult.track.key,
          result_type: levelType,
          track: lastResult.track.key,
          level: lastResult.level.code,
          question_id: "q" + steps.length,
          selection_type: "assessment_track",
        });
        trackEvent("complete_quiz", {
          location: "quick_test",
          result_type: levelType,
          track: lastResult.track.key,
          level: lastResult.level.code,
          score: lastResult.score,
          question_id: "q" + steps.length,
          answer_count: answeredCount(form),
        });
      }
      trackEvent("view_result", {
        location: source === "public_profile" ? "public_profile" : "quick_result",
        result_type: levelType,
        track: lastResult.track.key,
        level: lastResult.level.code,
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
          role: track.key,
          track: track.key,
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
        window.history.replaceState(null, "", window.location.pathname + "?track=" + encodeURIComponent(track.key));
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
          track: lastResult.track.key,
          level: lastResult.level.code,
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
          track: lastResult.track.key,
          level: lastResult.level.code,
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
          track: lastResult.track.key,
          level: lastResult.level.code,
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
          track: lastResult.track.key,
          level: lastResult.level.code,
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
          track: lastResult.track.key,
          level: lastResult.level.code,
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
          track: lastResult.track.key,
          level: lastResult.level.code,
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
          result_type: lastResult ? resultType(lastResult) : "",
          track: lastResult ? lastResult.track.key : track.key,
          level: lastResult ? lastResult.level.code : "",
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
