# git-hired

把你的 AI-native 工作经历生成 LinkedIn 可用的简历画像。

`git-hired` 是 AI-native resume / profile generator。
它帮助你把项目、工作流、发布、自动化、内容、销售、招聘和 agent 工作整理成公司看得懂的 resume profile。

项目网站：<https://realroc.github.io/git-hired/>

[English](./README.md)

## 从这里开始

选择 track，粘贴工作证据，然后生成 profile：

- Builder profile：适合突出产物、系统、工作流、自动化、原型、工具和已交付输出。
- Seller profile：适合突出叙事、定位、分发、销售、招聘、发布、信任和采用。

生成器入口：

- Builder：<https://realroc.github.io/git-hired/start.html?track=builder>
- Seller：<https://realroc.github.io/git-hired/start.html?track=seller>

## 产品路径

```text
Choose Track -> Add Work Evidence -> Generate Profile -> Edit -> Export
```

浏览器本地生成器会输出：

- LinkedIn headline
- About section
- AI-native value proposition
- core skills
- selected work evidence
- resume bullets
- suggested roles
- missing proof
- next edit
- Markdown export

## Tracks

Builder 是让事情变成真实成果的 resume/profile track：

- prototyping
- AI workflow building
- automation
- product building
- systems thinking
- technical 或 no-code execution
- research-to-artifact
- shipping useful output

Seller 是让别人理解、相信、采用和传播想法的 resume/profile track：

- storytelling
- positioning
- distribution
- sales
- recruiting
- marketing
- community
- launches and outbound
- trust building

## 信任边界

MVP 不要求私人上传。

- 只粘贴你想包含的信息。
- 公开链接就够用。
- 浏览器本地文本输入就够用。
- 你控制复制、编辑、导出和分享的内容。

长期看，`git-hired` 可以成为 AI-native worker 的 hiring signal layer。
但 MVP 先从有用的 resume/profile 草稿开始，因为这能在要求更深 proof 前先给用户价值。

## 更深入的 Agent 报告

如果你想基于允许的历史记录或文件生成更深入、隐私边界清楚的报告，可以把 `skill.md` 指令粘贴到你自己的工作 agent 里。

```text
read https://realroc.github.io/git-hired/skill.md
```

- 你决定给它看什么。
- 不上传你的本地文件到我们的服务器。
- 你决定分享什么。

## 隐私优先

> `git-hired` 采用先授权、后扫描，且只在本地运行的方式。
> 不把本地 repo 或文件数据上传到服务器。
> 默认模式是 `history-only`。
> 除非候选人明确允许，否则不会扫描对方的本地 repo、项目目录或文档文件。
> `git-hired` 不会把候选人的本地 repo 或文件数据上传到我们的服务器。
> 候选人所选的 work agent 只应访问他明确授权的项目、文件或知识库材料。
> 如果所选 work agent 支持直接访问本地文件，任何批准的扫描也应尽量只停留在候选人自己的机器或已连接工作区里完成。

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

如果你的 profile、报告或公开证据显示出较强的 AI-native worker 信号，并且你也在寻找 AI-native 项目的合作机会，可以开一个 issue，附上：

- 目标 track 或岗位
- 公开安全的 profile 或报告摘要
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
