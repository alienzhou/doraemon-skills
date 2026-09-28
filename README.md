# Doraemon Skills

<p align="center">
  <img src="assets/hero.png" alt="Doraemon Skills — 百宝袋" width="100%">
</p>

<p align="center">
  <strong>哆啦 A 梦的百宝袋</strong> —— Agent Skills monorepo，自用 + 分享。
</p>

把日常和 Agent 协作时反复用到的能力，收成可安装的 Skills：讨论定规格、排障取证、图片压缩、Skill 审查……兼容 Cursor、Claude Code、Codex 等 40+ 种 agent。

## 快速安装

```bash
# 安装全部 skills
npx skills add alienzhou/doraemon-skills --all

# 列出可用 skills
npx skills add alienzhou/doraemon-skills --list

# 安装指定 skill
npx skills add alienzhou/doraemon-skills --skill discuss-for-specs

# 指定安装到某个 agent
npx skills add alienzhou/doraemon-skills --skill discuss-for-specs -a cursor
```

详见 [skills CLI 文档](https://github.com/vercel-labs/skills#supported-agents)。

部分 skill 另有 hooks / 运行时脚本，建议用对应 npm CLI 拿完整体验：

```bash
# discuss-for-specs（含 hooks 自动提醒）
npx @vibe-x/discuss-for-specs install -p cursor

# agent-better-checkpoint（含 checkpoint 脚本和 stop hook）
npx @vibe-x/agent-better-checkpoint --platform cursor
```

## Skills

### 思考与规格

| Skill | 说明 | npm |
|-------|------|-----|
| [discuss-for-specs](skills/discuss-for-specs/) | 结构化讨论，把模糊想法收敛成可执行规格 | [`@vibe-x/discuss-for-specs`](https://www.npmjs.com/package/@vibe-x/discuss-for-specs) |
| [discussion-mindmap](skills/discussion-mindmap/) | 边讨论边更新的 Xmind 风格 HTML 脑图，支持聚焦、演示与实时同步（Node.js 22+） | — |
| [thinking-partner](skills/thinking-partner/) | 思考伙伴：追问、挑战假设、跨领域类比，专注讨论不写代码 | — |
| [product-thinking-coach](skills/product-thinking-coach/) | 用状态迁移把产品思考逼充分，再产出 PRD / 方案 | — |
| [learn-with-me](skills/learn-with-me/) | 陪练式学习：第一性原理 + 小练习，用户先答、AI 再反馈 | — |
| [conversation-distiller](skills/conversation-distiller/) | 把对话里可复用的方法蒸馏成方法论 / Skill 骨架 | — |

### 工程与排障

| Skill | 说明 | npm |
|-------|------|-----|
| [agent-better-checkpoint](skills/agent-better-checkpoint/) | 把 AI 编辑落成语义化 Git commits，替代不透明 checkpoint | [`@vibe-x/agent-better-checkpoint`](https://www.npmjs.com/package/@vibe-x/agent-better-checkpoint) |
| [ops-logging](skills/ops-logging/) | 为新功能 / 数据流补长期、结构化、可排障的日志 | — |
| [ops-troubleshooting](skills/ops-troubleshooting/) | 用日志 + 代码还原时间线，定位故障根因 | — |
| [ops-diagnostic](skills/ops-diagnostic/) | 证据不足时，用竞争假设和判别性埋点完成诊断 | — |

### 内容创作

| Skill | 说明 | npm |
|-------|------|-----|
| [video-cover-studio](skills/video-cover-studio/) | 视频封面：抽真帧做证据，按平台安全区排版，挂 Q 版 IP 形象 | — |
| [xhs-intake](skills/xhs-intake/) | 解析小红书笔记（视频 / 图文）为可回溯的结构化内容 | — |

### 工具与质量

| Skill | 说明 | npm |
|-------|------|-----|
| [skill-reviewer](skills/skill-reviewer/) | Skill 质量审查：定义审查 + 执行审查 | — |
| [img-squeeze](skills/img-squeeze/) | 高质量图片压缩；画质不低于 TinyPNG，体积平均约其 53% | — |

## 仓库结构

```
doraemon-skills/
├── skills/       # Skill 本体（SKILL.md + references），可被 npx skills add 发现
├── packages/     # 可选 npm 包：CLI、hooks、运行时脚本
├── shared/       # 跨 skill 共享模块（如 hooks 基础设施）
├── archives/     # 历史讨论归档
└── assets/       # README 等静态资源
```

复杂度按需分层——不是每个 skill 都要三层：

| 层 | 目录 | 何时需要 | 安装方式 |
|---|------|---------|---------|
| Skill 本体 | `skills/<name>/` | 默认；纯 Markdown 即可工作 | `npx skills add alienzhou/doraemon-skills` |
| npm 包 | `packages/<name>/` | 需要 CLI / hooks / 运行时脚本时 | `npx @vibe-x/<name>` |
| 共享模块 | `shared/` | 多个包复用同一套基础设施时 | 由 npm 包内部引用 |

## 添加新 Skill

1. 在 `skills/` 下建目录，放入符合 [Agent Skills 规范](https://agentskills.io/specification) 的 `SKILL.md`
2. 需要 CLI / hooks 时，再在 `packages/` 下补对应包

```bash
# 构建带 npm 包的 skill（示例）
cd packages/discuss-for-specs && npm install && npm run build
```

## 迁移自

本仓库合并自：

| 原仓库 | 状态 |
|--------|------|
| [alienzhou/skill-reviewer](https://github.com/alienzhou/skill-reviewer) | 待归档，指向此仓库 |
| [alienzhou/skill-discuss-for-specs](https://github.com/alienzhou/skill-discuss-for-specs) | 待归档，指向此仓库 |
| [alienzhou/agent-better-checkpoint](https://github.com/alienzhou/agent-better-checkpoint) | 待归档，指向此仓库 |

## License

[MIT](LICENSE)
