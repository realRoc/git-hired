<p align="center">
  <img src="assets/readme-hero.svg" alt="GitHire" width="260" />
</p>

<h1 align="center">GitHire</h1>

<p align="center">
  <strong>人 frame、AI 执行、架构师判断。</strong>
</p>

<p align="center">
  <a href="README.md">English</a>
  ·
  <a href="README.zh-CN.md">中文</a>
</p>

<p align="center">
  <a href="https://realroc.github.io/git-hired/">网站</a>
  ·
  <a href="https://realroc.github.io/git-hired/case-redis-scan.html">Case 01</a>
  ·
  <a href="https://realroc.github.io/git-hired/blog.html">Blog</a>
  ·
  <a href="https://realroc.github.io/git-hired/skill.html">Skill</a>
  ·
  <a href="https://github.com/realRoc/git-hired/issues">提 issue</a>
</p>

---

GitHire 是一套 AI-native 工程方法论：把"人 frame、AI 执行、架构师判断"写成可复用的六步 workflow，再用真实事故 case 验证它。

AI 写代码的速度已经远超人类 review 的速度，事后 review 来不及——所以工作的单元被换掉了：

- **人 frame** —— 写 issue、设约束、声明非目标、定义成功口径。
- **AI 执行** —— 生成代码、跑测试、起 PR。
- **架构师判断** —— 合并前做最终方向取舍。

六步把每个角色放到流水线里它该在的那一格：

1. **Issue** —— 用六段式 Prompt Spec 把需求落成 AI 可执行的契约（Goal / Constraints / Non-goals / Verification / Architecture notes / Existing context）。
2. **Sandbox** —— 长期运行的开发环境，带真实依赖与生产量级的数据。
3. **Execute** —— Claude Code 或 Codex 在沙盒里完成实现。
4. **AI Review** —— 另一位 agent 用不同 priors 读 PR（性能、安全、anti-pattern）。
5. **Architect** ★ —— 工作流里最贵的 30 秒。人读 diff，带的是 AI 看不到的系统侧上下文（QPS 曲线、历史事故、容量规划）。
6. **Production** —— 合并、上线、把决策回写到 Issue。

如果只抓一步，抓第 5 步。

## 真实 case

这个站点是 *operating log*，不是教程。每一篇都是真实事件：

- **[Case 01 · 22 行 SCAN 打爆生产 Redis](https://realroc.github.io/git-hired/case-redis-scan.html)** —— Codex 5 分钟写出 `r.scan(match='model_detail::*')` + pipeline `HGETALL`；架构师那一步被跳过；当晚 23:54 上线即事故；25 小时根治用 Redis SET 替代 SCAN。沿六步走读，看哪一步被放弃，事故就在哪一步埋下。

更多 case 在路上；如果你也踩过值得复盘的真实事故，[提个 issue](https://github.com/realRoc/git-hired/issues)，一起合写。

## 装成 Skill

GitHire 以可装 Skill 的形态发布，任何 AI agent 都能装上沿用同一套方法。Skill 住在 **[realRoc/skills](https://github.com/realRoc/skills)**，与配套的 **Prompt Spec** skill 同一仓库。

```bash
# 一次装上全部 skills
npx skills add realRoc/skills

# 或单独装
npx skills add realRoc/skills --skill githire
npx skills add realRoc/skills --skill prompt-spec
```

Skill 默认读 live 站点拿当前方法，附带 `references/method.md` 作为离线 fallback。完整 install 页：<https://realroc.github.io/git-hired/skill.html>。

> **路径迁移说明**：skill 之前住在 `realRoc/git-hired/skills/githire`，现在搬到了 `realRoc/skills/skills/githire`。本仓库根目录的 `skills/` 是 dev workspace 残留（symlink 到 `.agents/`），已被 `.gitignore` 屏蔽——clone 后看到这个目录是空的属于预期行为。

## 欢迎贡献什么

提 issue 如果你想：

- 给 operating log 贡献一篇真实事故复盘；
- 提议改进六步 workflow；
- 质疑 FAQ 里的某条判断；
- 精炼 Prompt Spec 模板；
- 讨论 AI 该如何辅助而非替代架构师判断。

不需要写完整提案。一个清晰的问题就够了。

## 链接

- 网站：<https://realroc.github.io/git-hired/>
- Case 01：<https://realroc.github.io/git-hired/case-redis-scan.html>
- Blog：<https://realroc.github.io/git-hired/blog.html>
- Skill 落地页：<https://realroc.github.io/git-hired/skill.html>
- Skill 源（canonical）：<https://github.com/realRoc/skills>
- Issues：<https://github.com/realRoc/git-hired/issues>
