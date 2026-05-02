# git-hired

了解你的 AI-native 市场价值，以及下一步怎么提高。

`git-hired` 是面向 AI-native Builders 和 Sellers 的、受大厂职级逻辑启发的市场等级评估。
它帮助 AI-native worker 理解自己的市场等级、缺失信号，以及下一步如何变得更有价值。

项目网站：<https://realroc.github.io/git-hired/>

[English](./README.md)

## 从这里开始

先选择能力赛道，再评估当前 GH Level：

- Builder 赛道：用 AI 把模糊问题变成可用成果。
- Seller 赛道：用 AI 把想法变成关注、信任、采用和收入。

评估入口：

- Builder：<https://realroc.github.io/git-hired/start.html?track=builder>
- Seller：<https://realroc.github.io/git-hired/start.html?track=seller>

## 产品路径

```text
Choose Track -> Assess Level -> Market Read -> Upgrade Plan -> Challenge
```

轻量浏览器评估会输出：

- `GH-L3` 到 `GH-L7` 的等级
- 这个 level 代表什么能力
- market read 和机会区间
- missing signals
- next level 差距
- upgrade plan
- recommended challenge
- 可分享 market level 卡片

## GH Levels

GH Level 体系受大厂职级逻辑启发，但不声称等同于任何具体公司的职级。

- `GH-L3 — Entry`：能在明确任务下完成工作。
- `GH-L4 — Independent`：能独立完成完整任务或项目。
- `GH-L5 — Senior`：能处理复杂问题，并产生可验证用户、业务或市场影响。
- `GH-L6 — Staff`：能跨团队、跨系统、跨渠道放大影响。
- `GH-L7 — Principal`：能定义方向，创造市场级影响，并影响组织或类别。

## Tracks

Builder 不是人格标签。
它是让事情变成真实成果的能力赛道：

- prototyping
- AI workflow building
- automation
- product building
- systems thinking
- technical 或 no-code execution
- research-to-artifact
- shipping useful output

Seller 也不是传统销售员标签。
它是让别人理解、相信、采用和传播想法的能力赛道：

- storytelling
- positioning
- distribution
- sales
- recruiting
- marketing
- community
- fundraising narrative
- momentum creation
- trust building

## Challenges

Challenge 放在评估之后。
它帮助用户补强下一阶段市场信号，而不是一上来要求上传私人作品。

- Builder challenge：48 小时内构建一个有用的 AI workflow、原型、自动化、工具或成果。
- Seller challenge：48 小时内公开发布一个想法，尝试获得真实回复、注册、线索、候选人、用户或反馈。
- 信任边界：不需要私人作品，只使用公开链接，你决定分享什么。

长期看，`git-hired` 可以成为 AI-native worker 的 reputation / hiring signal layer。
但 MVP 先从 market level、missing signals 和 next challenge 开始，因为这能在要求 proof 前先给用户价值。

## 更深入的 Agent 报告

把 `skill.md` 指令粘贴到你自己的工作 agent 里。
它可以基于你允许的历史记录或文件，生成更深入、隐私边界清楚的报告。

```text
read https://realroc.github.io/git-hired/skill.md
```

- 你决定给它看什么。
- 不上传你的本地文件到我们的服务器。
- 你决定分享什么。

## 隐私优先

> `git-hired` 采用先授权、后扫描，且只在本地运行的方式。
> 无服务器、无账号、不上传私人证据。
> 默认模式是 `history-only`。
> 除非候选人明确允许，否则不会扫描对方的本地 repo、项目目录或文档文件。
> `git-hired` 不会把候选人的本地 repo 或文件数据上传到我们的服务器。
> 候选人所选的工作 agent 只应访问他明确授权的项目、文件或知识库材料。
> 如果所选工作 agent 支持直接访问本地文件，任何批准的扫描也应尽量只停留在候选人自己的机器或已连接工作区里完成。

一眼看懂：

- 默认模式：`history-only`
- 可选模式：候选人主动允许扫描指定 repo / 本地目录 / 文件
- 运行位置：候选人自己的机器或已连接工作区
- 本地 repo / 文件数据上传到服务端：`不会`
- 默认分享对象：公开安全卡片，不是私人详细报告

## Protocol Pages

- [Candidate protocol](./docs/candidate.html)
- [Evaluator protocol](./docs/evaluator.html)
- [Contributor protocol](./docs/contributor.html)
- [Scoring rubric](./rubric.md)
- [Examples](./examples/)

## AI-native 协作

我在构建 AI-native 产品，希望找到这样的人：

- 真正会把 AI agent 当工作伙伴使用
- 能拆解模糊任务
- 不需要重管理也能推进事情
- 对产品、用户、指标、取舍有判断
- 能创造关注、信任、分发和采用
- 尊重隐私和安全边界

如果你的评估、报告或 challenge evidence 显示出较强的 AI-native worker 信号，并且你也在寻找 AI-native 项目的合作机会，可以开一个 issue，附上：

- 目标 track 或岗位
- 公开安全的 market level 卡片或公开报告摘要
- 你接下来想 build 或 sell 什么
- 你希望被尊重的隐私边界

不要在公开 issue 里放 secret、私人 transcript、原始客户数据或本地文件转储。

## 样例

如果你想先知道更深入报告大概长什么样，从这里看：

- [最终 Builder 卡片](./examples/builder-card.md)
- [强匹配 Agent 工程师](./examples/agent-engineer.strong.md)
- [中等匹配 Agent 工程师](./examples/agent-engineer.medium.md)
- [弱匹配 Agent 工程师](./examples/agent-engineer.weak.md)
- [强匹配产品经理](./examples/pm.strong.md)
- [强匹配海外增长](./examples/growth.strong.md)
- [脱敏报告模板](./examples/redacted-report-template.md)

## Eval Gate

从 `dev` 发布到 `main` 前运行：

```bash
python3 scripts/eval_release.py
```

这个 gate 会同步生成页面，检查岗位 wiring，验证 `skill.md` 输出契约，锁住公开 card 格式，并运行 `git diff --check`。

## 目录结构

```text
git-hired/
├── skill.md
├── rubric.md
├── examples/
├── docs/
│   ├── index.html
│   ├── start.html
│   ├── quick-test.js
│   ├── candidate.html
│   ├── evaluator.html
│   └── contributor.html
├── roles.json
├── prompts/
├── .codex/skills/git-hired-jd-ops/
├── LICENSE
├── README.md
└── README.zh-CN.md
```

## 名字为什么叫这个

短、好记，而且自带语气：

- `git hired`
- `git rejected`
- `git gud`
- `git shipped`

这个仓库应该像一个 builder 会真的转发给别人用的工具，而不是一个很重营销味的招聘专题页。

## 协议

MIT。
