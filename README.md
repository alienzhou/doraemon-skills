# Doraemon Skills

> 哆啦A梦的百宝袋 —— Agent Skills monorepo，自用 + 分享。

## 快速安装

```bash
# 安装全部 skills
npx skills add alienzhou/doraemon-skills --all

# 列出可用 skills
npx skills add alienzhou/doraemon-skills --list

# 安装指定 skill
npx skills add alienzhou/doraemon-skills --skill discuss-for-specs
npx skills add alienzhou/doraemon-skills --skill skill-reviewer
npx skills add alienzhou/doraemon-skills --skill agent-better-checkpoint

# 指定安装到某个 agent
npx skills add alienzhou/doraemon-skills --skill discuss-for-specs -a cursor
```

兼容 40+ 种 agent：Cursor、Claude Code、GitHub Copilot、Codex、Cline、Windsurf、Gemini CLI 等。详见 [skills CLI 文档](https://github.com/vercel-labs/skills#supported-agents)。

对于 `discuss-for-specs` 和 `agent-better-checkpoint`，它们有配套的 hooks 和运行时脚本，建议使用各自的 npm CLI 安装以获得完整体验：

```bash
# discuss-for-specs（含 hooks 自动提醒）
npx @vibe-x/discuss-for-specs install -p cursor

# agent-better-checkpoint（含 checkpoint 脚本和 stop hook）
npx @vibe-x/agent-better-checkpoint --platform cursor
```

## Skills 列表

| Skill | 说明 | npm 包 |
|-------|------|--------|
| [discuss-for-specs](skills/discuss-for-specs/) | AI 驱动的结构化讨论助手，帮你把模糊想法变成清晰可执行的规格 | [`@vibe-x/discuss-for-specs`](https://www.npmjs.com/package/@vibe-x/discuss-for-specs) |
| [agent-better-checkpoint](skills/agent-better-checkpoint/) | 将 AI 编辑变为语义化 Git commits，替代不透明的 checkpoint | [`@vibe-x/agent-better-checkpoint`](https://www.npmjs.com/package/@vibe-x/agent-better-checkpoint) |
| [skill-reviewer](skills/skill-reviewer/) | Skill 质量审查工具，支持定义审查和执行审查两种模式 | — |

## 仓库结构

```
doraemon-skills/
├── skills/                          # Skill 本体（SKILL.md + references）
│   ├── discuss-for-specs/           #   npx skills add 能发现的部分
│   ├── agent-better-checkpoint/
│   └── skill-reviewer/
│
├── packages/                        # npm 包、CLI、构建脚本、文档
│   ├── discuss-for-specs/           #   @vibe-x/discuss-for-specs
│   ├── agent-better-checkpoint/     #   @vibe-x/agent-better-checkpoint
│   └── skill-reviewer/              #   文档和资源（无 npm 包）
│
├── shared/                          # 跨项目共享代码
│   └── hooks/                       #   共享 hooks 基础设施
│       └── common/                  #   file_utils, logging_utils 等
│
├── archives/                        # 历史讨论记录（.discuss 归档）
│   ├── discuss-for-specs/
│   ├── agent-better-checkpoint/
│   └── skill-reviewer/
│
├── LICENSE
├── README.md
└── .gitignore
```

### 分层设计

每个 skill 都分为三层，复杂度渐进：

| 层 | 目录 | 说明 | 安装方式 |
|---|------|------|---------|
| **Skill 本体** | `skills/<name>/` | SKILL.md + references，纯 Markdown | `npx skills add alienzhou/doraemon-skills` |
| **npm 包** | `packages/<name>/` | CLI 安装器、hooks、运行时脚本 | `npx @vibe-x/<name>` |
| **共享模块** | `shared/hooks/` | 跨 skill 共享的 hooks 基础设施 | 由 npm 包内部引用 |

## 迁移自

本仓库合并自以下独立仓库：

| 仓库 | 状态 |
|------|------|
| [alienzhou/skill-reviewer](https://github.com/alienzhou/skill-reviewer) | 待归档，指向此仓库 |
| [alienzhou/skill-discuss-for-specs](https://github.com/alienzhou/skill-discuss-for-specs) | 待归档，指向此仓库 |
| [alienzhou/agent-better-checkpoint](https://github.com/alienzhou/agent-better-checkpoint) | 待归档，指向此仓库 |

## 开发

### 添加新 Skill

1. 在 `skills/` 下创建目录，放入 `SKILL.md`
2. 遵循 [Agent Skills 规范](https://agentskills.io/specification)
3. 如需 npm 包分发，在 `packages/` 下创建对应目录

### npm 包

```bash
# discuss-for-specs
cd packages/discuss-for-specs && npm install && npm run build

# agent-better-checkpoint
cd packages/agent-better-checkpoint
```

## License

[MIT](LICENSE)
