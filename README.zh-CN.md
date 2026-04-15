# git-hired

```bash
$ git hired
fatal: not a qualified candidate
```

[English](./README.md)

面向 AI Native 创业公司的、以 prompt 为核心的候选人匹配度测试仓库。

`git-hired` 的思路很直接：给候选人一段岗位专属 prompt，让他在自己的 Claude Code 或 Codex 里运行，由 agent 基于本机可见的工作痕迹，返回一份结构化、带隐私边界的岗位匹配报告。

## 隐私优先

> `git-hired` 采用先授权、后扫描，且只在本地运行的方式。
> 默认模式是 `history-only`。
> 除非候选人明确允许，否则不会扫描对方的本地 repo、项目目录或文档文件。
> 如果候选人主动允许，任何批准的扫描也只会在候选人自己的 Claude Code 或 Codex 本地运行中完成。
> 不会有任何候选人的本地 repo 或文件数据从候选人的机器上传到我们的服务器。

一眼看懂：

- 默认模式：`history-only`
- 可选模式：候选人主动允许扫描指定 repo / 本地目录 / 文件
- 运行位置：候选人自己的机器
- 本地 repo / 文件数据上传到服务端：`不会`

这不是简历表演。

它更关注 AI 时代真正重要的信号：

- 这个人怎么拆问题
- 怎么使用 AI 工具
- 怎么调试
- 怎么处理模糊需求
- 怎么看用户、指标和 tradeoff
- 他到底像不像一家早期创业公司真正需要的人

## 在线链接

启用 GitHub Pages 之后，可直接使用：

- 通用测试入口: <https://realroc.github.io/git-hired/general.html>

<!-- AUTO:live-links:start -->
- AI Agent 工程师: <https://realroc.github.io/git-hired/agent.html>
- 产品经理: <https://realroc.github.io/git-hired/pm.html>
- 海外增长: <https://realroc.github.io/git-hired/growth.html>
- AI产品运营: <https://realroc.github.io/git-hired/ops.html>
<!-- AUTO:live-links:end -->

## 仓库包含什么

目前包含四个公开可分享的岗位测试：

<!-- AUTO:role-list:start -->
- `AI Agent 工程师`
- `产品经理`
- `海外增长`
- `AI产品运营`
<!-- AUTO:role-list:end -->

每个岗位都包含：

- 一个可直接发给候选人的独立页面
- 一份便于维护的源 prompt
- 一套中文和英文源文件
- 明确的隐私边界，要求 agent 输出聚合信号，而不是原始转储

## 为什么要做这个

在 AI Native 招聘里，头衔和履历正在变成越来越弱的代理变量。

更关键的问题是：

这个人能不能在创业公司的资源约束下，把 AI 真正组织起来，持续交付、学习和迭代？

`git-hired` 就是为了让这件事变得更可观察。

## 怎么使用

1. 把岗位对应页面发给候选人
2. 候选人复制 prompt 到自己的 Claude Code 或 Codex
3. 他的 agent 在隐私边界内分析本地工作痕迹
4. 候选人把生成报告发回给你
5. 你把这个报告作为结构化初筛输入，而不是最终结论

## 先同意，再扫描；且只在本地运行

> 规则很简单：
> 未经候选人明确允许，不扫描本地 repo 或文档；
> 即使候选人允许，也不会有任何本地 repo 或文件数据从候选人的机器上传到我们的服务器。

候选人可以主动选择：

- `history-only`，走更轻量、更注重隐私的评估
- 或允许扫描指定的本地 repo / 项目目录 / 文件，以换取更充分的评分依据

如果候选人不允许扫描 repo 或文档，agent 也应该基于历史记录做尽可能客观的判断，并明确说明置信度限制。

## 推荐给候选人的发送文案

你可以直接发：

> 把这个链接里的 prompt 粘贴到你自己的 Claude Code 或 Codex 里跑一下，把结果发我。  
> 默认只看历史记录。如果你愿意拿到更充分的评分，也可以主动允许扫描指定的本地 repo 或文件。任何批准的扫描都只在你自己的机器本地运行，不会有本地 repo 或文件数据上传到我们的服务器。

如果想更有梗一点：

> 跑一下这个。  
> `git hired` 还是 `git rejected`，让你的 agent 先说。

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

- 行为分布
- 去标识化例子
- 评分
- 匹配度判断
- 面试追问建议

## 目录结构

```text
git-hired/
├── docs/
│   ├── index.html
│   ├── general.html
│   ├── agent.html
│   ├── pm.html
│   ├── growth.html
│   ├── ops.html
│   ├── style.css
│   └── app.js
├── roles.json
├── prompts/
│   ├── agent-engineer.en.md
│   ├── agent-engineer.md
│   ├── product-manager.en.md
│   ├── product-manager.md
│   ├── global-growth.en.md
│   ├── global-growth.md
│   ├── ai-product-operations.en.md
│   └── ai-product-operations.md
├── .codex/skills/git-hired-jd-ops/
│   ├── SKILL.md
│   ├── references/
│   └── scripts/
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
