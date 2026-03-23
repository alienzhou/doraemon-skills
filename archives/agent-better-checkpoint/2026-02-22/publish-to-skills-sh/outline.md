# Discussion: agent-better-checkpoint 发布策略 (skills.sh + npm)

> Status: Complete | Round: R5 | Date: 2026-02-22

## 🔵 Current Focus

(None — all questions resolved)

## ✅ Confirmed

| Decision | Description | Document |
|----------|-------------|----------|
| 发布到 skills.sh | 利大于弊，增加曝光 | [D01](./decisions/D01-publish-strategy.md) |
| npm 包名 | `@vibe-x/agent-better-checkpoint` | [D01](./decisions/D01-publish-strategy.md) |
| 去掉 Python 依赖 | 安装器用 Node.js，删除 install.py | [D01](./decisions/D01-publish-strategy.md) |
| 双路径安装 | (A) npx 直接安装 = 全部; (B) skills.sh 已安装 SKILL.md → npx 只装其余组件 | [D01](./decisions/D01-publish-strategy.md) |
| 版本一致性 | SKILL.md metadata.version 与 package.json version 保持同步 | [D01](./decisions/D01-publish-strategy.md) |
| 跨平台运行时脚本 | Bash (macOS/Linux) + PowerShell (Windows)，安装器按平台选择性部署 | [D01](./decisions/D01-publish-strategy.md) |
| 安装器 Node.js | 仅安装器用 Node.js；运行时脚本保持原生 shell | [D01](./decisions/D01-publish-strategy.md) |
| SKILL.md 平台分支 | AI 自行判断 OS，SKILL.md 写两条命令 | [D01](./decisions/D01-publish-strategy.md) |
| hook JSON 解析 | Bash 版用 grep+sed，不依赖 jq | [D01](./decisions/D01-publish-strategy.md) |
| 仓库结构 | 调整为 npm 包结构，去掉 src/ 层级 | [D01](./decisions/D01-publish-strategy.md) |

## ❌ Rejected

| Decision | Reason |
|----------|--------|
| 仅通过 git clone 安装 | 用户不想拉取整个仓库 |
| 安装器保留 Python | 既然走 npm 就不应再要求 Python |
| 运行时脚本全部 Node.js 化 | Bash 更原生、AI 理解更好、输出处理更自然 |
| 统一入口 wrapper | 不如让 AI 直接判断平台更透明 |

## 📁 Archive

### skills.sh 平台研究结论

| 项目 | 结论 |
|------|------|
| 是什么 | Vercel 2026 年 1 月发布的开放 AI Agent Skills 生态，CLI + 市场目录 |
| 支持平台 | Cursor, Claude Code, GitHub Copilot, OpenAI Codex, Windsurf 等 |
| 发布方式 | 将含 SKILL.md 的仓库放 GitHub，用户通过 `npx skills add owner/repo` 安装 |
| 上榜机制 | 匿名遥测自动统计安装量，安装越多排名越高，无需手动提交 |
| 格式要求 | SKILL.md 需含 YAML frontmatter (name + description 必填)，name 需全小写+连字符 |
| 当前排行 | 以 Microsoft Azure 系列、Vercel 官方 skill 为主 |
