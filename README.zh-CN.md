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
- suggested directions
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

## 隐私优先

> 浏览器生成器只使用你在页面里输入或粘贴的内容。
> 不需要账号、后端、私人上传、本地 repo 扫描或文档扫描。
> 公开链接就够用。
> 你控制复制、编辑、导出和分享的内容。

## AI-native 协作

我在构建 AI-native 产品，希望找到这样的人：

- 真正会把 AI agent 当工作伙伴使用
- 能拆解模糊任务
- 不需要重管理也能推进事情
- 对产品、用户、指标、取舍有判断
- 能创造关注、信任、分发和采用
- 尊重隐私和安全边界

如果你的生成 profile 或公开证据显示出较强的 AI-native worker 信号，并且你也在寻找 AI-native 项目的合作机会，可以开一个 issue，附上：

- 目标 track 或方向
- 公开安全的 profile 摘要
- 你接下来想 build 或 sell 什么
- 你希望被尊重的隐私边界

不要在公开 issue 里放 secret、私人 transcript、原始客户数据或本地文件转储。

## Eval Gate

从 `dev` 发布到 `main` 前运行：

```bash
python3 scripts/eval_release.py
```

这个 gate 会检查静态生成器、analytics 契约和 whitespace-safe diff。

## 目录结构

```text
git-hired/
├── docs/
│   ├── index.html
│   ├── start.html
│   ├── quick-test.js
│   ├── analytics.js
│   └── style.css
├── evals/
├── scripts/
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
