# Doraemon Skills 🤖

> 哆啦A梦的百宝袋 —— 一个 Agent Skills 集合仓库，既可以自己用，也可以分享给别人。

## 快速安装

任何人都可以通过 [skills CLI](https://github.com/vercel-labs/skills) 一键安装本仓库的 skills：

```bash
# 列出所有可用 skills
npx skills add alienzhou/doraemon-skills --list

# 安装全部 skills
npx skills add alienzhou/doraemon-skills --all

# 安装指定 skill
npx skills add alienzhou/doraemon-skills --skill <skill-name>

# 安装到指定 agent（如 cursor、claude-code 等）
npx skills add alienzhou/doraemon-skills --skill <skill-name> -a cursor
```

支持的 Agent 包括：Cursor、Claude Code、GitHub Copilot、Codex、Cline、Windsurf、Roo Code、Gemini CLI 等 [40+ 种 agent](https://github.com/vercel-labs/skills#supported-agents)。

## 仓库结构

```
doraemon-skills/
├── README.md                   # 你正在看的文件
├── LICENSE                     # MIT License
├── skills/                     # 所有 skills 存放在这里
│   ├── <skill-name>/           # 每个 skill 一个目录
│   │   ├── SKILL.md            # 必须：skill 元信息 + 指令
│   │   ├── scripts/            # 可选：可执行脚本
│   │   ├── references/         # 可选：参考文档
│   │   └── assets/             # 可选：模板、资源文件
│   └── ...
└── template/                   # skill 模板，用于快速创建新 skill
    └── SKILL.md
```

## 可用 Skills

| Skill | 说明 |
|-------|------|
| [commit-message-zh](skills/commit-message-zh/) | 生成规范的中英双语 Git commit message |

> 持续添加中……

## 如何创建新 Skill

### 1. 使用模板

复制 `template/` 目录并重命名为你的 skill 名称：

```bash
cp -r template skills/my-new-skill
```

### 2. 编辑 SKILL.md

每个 skill 只需要一个 `SKILL.md` 文件，包含 YAML frontmatter 和 Markdown 指令：

```markdown
---
name: my-new-skill
description: 清晰描述这个 skill 做什么、什么时候应该被触发。
---

# My New Skill

在这里写 agent 需要遵循的具体指令。

## 使用场景
- 场景 1
- 场景 2

## 步骤
1. 第一步
2. 第二步
```

### 3. 命名规范

遵循 [Agent Skills 规范](https://agentskills.io/specification)：

- `name` 字段：小写字母、数字、连字符，最多 64 字符
- `name` 必须与目录名一致
- `description` 字段：最多 1024 字符，需清楚说明 skill 的功能和触发时机

### 4. 最佳实践

- `SKILL.md` 主体控制在 500 行以内
- 详细的参考资料放到 `references/` 目录
- 可执行脚本放到 `scripts/` 目录
- 保持 skill 的专注性 —— 一个 skill 做一件事

## 发布与分享

本仓库遵循 [Agent Skills 开放规范](https://agentskills.io)，兼容以下平台：

- **[skills.sh](https://skills.sh/)** — 最大的 Agent Skills 目录，由 Vercel 维护的 `npx skills` CLI 驱动
- **[ClawHub](https://clawhub.ai/)** — 另一个 skill 发布平台

只要将 skills 推送到 GitHub，任何人就可以通过 `npx skills add alienzhou/doraemon-skills` 安装，无需额外的发布步骤。skills.sh 会自动索引公开仓库中的 skills。

## 关于 Agent Skills 规范

Agent Skills 是一种轻量级的开放格式，用于扩展 AI agent 的能力。核心概念：

1. **渐进式加载**：Agent 启动时只读取 `name` 和 `description`（约 100 tokens），激活时才加载完整指令
2. **跨 Agent 兼容**：同一个 skill 可以在 Cursor、Claude Code、Copilot 等不同 agent 中使用
3. **自包含**：每个 skill 目录包含它需要的一切，便于版本管理和分享

## License

[MIT](LICENSE)
