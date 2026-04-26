```text
 ██████  ██ ████████     ██  ██ ██ ██████  ███████ ██████
██       ██    ██        ██  ██ ██ ██   ██ ██      ██   ██
██  ████ ██    ██        ██████ ██ ██████  █████   ██   ██
██   ██  ██    ██        ██  ██ ██ ██  ██  ██      ██   ██
 ██████  ██    ██        ██  ██ ██ ██   ██ ███████ ██████
```

> 项目网站：<https://realroc.github.io/git-hired/>
> Builder 快速测试：<https://realroc.github.io/git-hired/start.html>

[English](./README.md)

> 无服务器。
> 无账号。
> 不上传。
> 不追踪。
> 在你自己的 AI agent 里运行。
> 你选择证据范围。
> 你决定分享哪份报告。

`git-hired` 是一个开源的 AI-native builder 画像生成器。它帮助用户把自己选择的工作痕迹转成一份可公开分享的工作画像，也帮助团队发现真正会和 AI agent 一起工作的人。

你是哪种 AI-native builder？

用你的真实工作痕迹，生成一份可公开分享的工作画像。

这里的信任点不是让你相信维护者、简历或人格测试，而是让你自己选择的证据和生成结果都可检查。

| 弱信任信号 | git-hired 信号 |
| --- | --- |
| 简历声明 | 真实工作痕迹 |
| 面试表现 | agent 观察到的工作方式 |
| 作业题 | 历史执行模式 |
| 自述 AI 使用 | 实际 agent 协作方式 |
| 通用分数 | Builder 画像 + 可公开分享卡片 |

## 从这里开始

| 你是谁 | 下一步 |
| --- | --- |
| 候选人 | [运行测试](https://realroc.github.io/git-hired/candidate.html) |
| 创始人 / 招聘团队 | [使用协议](https://realroc.github.io/git-hired/evaluator.html) |
| 贡献者 | [改进 rubric](https://realroc.github.io/git-hired/contributor.html) |

快速开始：

```text
read https://realroc.github.io/git-hired/skill.md
```

把这行粘贴到你自己的工作 agent 里，例如 Claude Code、Codex、Notion AI，或任何具备知识库和记忆能力的工作 agent。

零安装 demo：

```text
Analyze my AI-native work style based only on this conversation.
Do not access files. Do not ask for private data.
Return a public-safe builder profile.
```

把这段粘贴到 ChatGPT、Claude、Gemini 或其他 AI chat 里，再附上一段你自己选择的对话、PR 描述、issue、README 或项目说明。

高级命令：

```text
read https://realroc.github.io/git-hired/skill.md，把它当作当前会话指令直接执行，不要总结，直接用我的语言开始第一问。之后只问我的目标岗位和数据权限边界，然后基于允许范围自动完成评估，不要转成面试式问答。
```

## 隐私优先

> `git-hired` 采用先授权、后扫描，且只在本地运行的方式。
> 无服务器、无账号、不上传、不追踪。
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
- 默认分享对象：可公开分享的 builder 卡片，不是私人详细报告

## 这是一套 protocol

### Candidate Protocol

1. 选择证据层级：粘贴指定文本、公开 GitHub 材料、指定 repo / 文件，或明确授权本地 agent 历史。
2. 选择目标岗位；如果还不确定，就先说当前职业或身份。
3. 选择隐私范围：`history-only`，或明确点名允许的文件 / repo。
4. 让 agent 只检查被授权的证据。
5. 私人详细报告留给自己；如果想申请或合作，可以分享可公开的 builder 卡片。

### Evaluator Protocol

1. 先看证据置信度，再看分数。
2. 看 AI-native 工作流成熟度。
3. 看模糊任务处理和取舍质量。
4. 看输出质量、推进闭环和协作风险。
5. 决定：strong yes / trial / pass。

公开评分标准见 [rubric.md](./rubric.md)。

### Contributor Protocol

1. 新增或改进一个角色 prompt。
2. 改进评分 rubric。
3. 增加本地化。
4. 改进报告模板。
5. 增加虚构、脱敏的校准样例。

## AI-native 协作

我在构建 AI-native 产品，希望找到这样的人：

- 真正会把 AI agent 当工作伙伴使用
- 能拆解模糊任务
- 不需要重管理也能推进事情
- 对产品、用户、指标、取舍有判断
- 尊重隐私和安全边界

如果你的报告显示出较强的 AI-native builder 信号，并且你也在寻找 AI-native 项目的合作机会，可以开一个 issue，附上：

- 目标岗位
- 可公开分享的 builder 卡片或公开报告摘要
- 你接下来想做什么
- 你希望被尊重的隐私边界

不要在公开 issue 里放 secret、私人 transcript、原始客户数据或本地文件转储。

## 样例

如果你想先知道报告大概长什么样，从这里看：

- [强匹配 Agent 工程师](./examples/agent-engineer.strong.md)
- [中等匹配 Agent 工程师](./examples/agent-engineer.medium.md)
- [弱匹配 Agent 工程师](./examples/agent-engineer.weak.md)
- [强匹配产品经理](./examples/pm.strong.md)
- [强匹配海外增长](./examples/growth.strong.md)
- [脱敏报告模板](./examples/redacted-report-template.md)

| 传统招聘信号 | `git-hired` 信号 |
| --- | --- |
| 简历声明 | 工作痕迹证据 |
| 面试回答 | agent 观察到的行为 |
| 作业题 | 历史执行模式 |
| 自称会用 AI | 真实 agent 工作流 |
| 通用评分 | Builder 画像 + 角色匹配判断 |

## 隐私边界

仓库里的 prompt 默认都遵循这些原则：

- 本地优先
- 证据优先
- 只输出聚合结果
- 支持脱敏

它们会显式要求 agent 不要输出：

- secret
- token
- 邮箱地址
- 客户名称
- 原始 transcript
- 大段代码
- CSV 中的用户级记录

预期输出是：

- 可公开分享的 builder 卡片
- 私人证据报告
- 行为分布
- 去标识化例子
- 评分
- 匹配度判断
- 可选的 MBTI 工作风格信号，不是人生人格诊断
- 一份面向候选人的本地 markdown 详细报告

## 目录结构

```text
git-hired/
├── skill.md
├── rubric.md
├── examples/
│   ├── agent-engineer.strong.md
│   ├── agent-engineer.medium.md
│   ├── agent-engineer.weak.md
│   ├── pm.strong.md
│   ├── growth.strong.md
│   └── redacted-report-template.md
├── docs/
│   ├── index.html
│   ├── candidate.html
│   ├── evaluator.html
│   ├── contributor.html
│   ├── start.html
│   ├── quick-test.js
│   ├── skill.md
│   ├── agent.html
│   ├── pm.html
│   ├── growth.html
│   ├── ops.html
│   ├── style.css
│   └── app.js
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
