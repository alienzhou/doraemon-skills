# Agent Better Checkpoint

**一行命令安装，零配置。** 将 AI Agent 的编辑自动转为透明、可查询的 Git commit。

```bash
npx @vibe-x/agent-better-checkpoint
```

![Agent Better Checkpoint](./assets/agent-better-checkpoint.png)

你的 AI 编程助手（Cursor、Claude Code）会自动在每次有意义的编辑后生成语义化的 commit，并附带结构化元信息——再也不用忍受黑盒 checkpoint。

---

## 问题

AI 编程助手在你工作时会创建"检查点"，但这些都是黑盒快照：
- **看不懂** — 没有有意义的 commit message
- **导航难** — 无法浏览或 diff 单个变更
- **查不到** — 无法过滤、搜索或追溯

## 方案

Agent Better Checkpoint 用真正的 Git commit 替代黑盒快照：

```
checkpoint(api): add user registration endpoint

Implement POST /api/users with email/password validation.
Includes bcrypt hashing and duplicate email check.

Agent: cursor
Checkpoint-Type: auto
User-Prompt: 帮我实现用户注册接口，需要邮...要密码加密
```

每个 commit 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，通过 [Git Trailers](https://git-scm.com/docs/git-interpret-trailers) 携带结构化元信息——用标准 Git 工具即可查询：

```bash
git log --grep="^checkpoint("                          # 所有 checkpoint
git log --format="%(trailers:key=Agent,valueonly)"     # 按 agent 过滤
git log --grep="User-Prompt:.*registration"            # 按 prompt 关键词搜索
```

### 搭配你喜欢的 Git 工具使用

每个 checkpoint 都是标准 Git commit，整个 Git 工具生态随你使用——原本隐式的 checkpoint 操作，变成了对 Git history 的各类显式、灵活操作。

| 工具 | 类型 | 带来的能力 |
|------|------|-----------|
| [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) | VS Code / Cursor 扩展 | 行内 blame、文件历史、可视化 commit graph、交互式 rebase——在编辑器内直接看到是*你*还是 *AI* 在*何时*改了*什么* |
| [lazygit](https://github.com/jesseduffield/lazygit) | 终端 UI | 键盘驱动的快速 staging、diff 浏览、cherry-pick、rebase，高效管理 checkpoint 历史 |
| [tig](https://github.com/jonas/tig) | 终端 UI | 轻量级 ncurses Git log 查看器，适合快速浏览 checkpoint 时间线 |
| [GitHub / GitLab Web UI](https://github.com) | Web | push 后在线浏览、对比和分享 checkpoint 历史 |

例如，在 Cursor 中安装 **GitLens** 后，你可以悬停任意行查看是哪个 checkpoint 引入的以及对应的用户 prompt，在时间线中浏览文件的所有 checkpoint，或通过 `checkpoint(` 前缀和 `User-Prompt` trailer 内容搜索 commit。

---

## 工作原理

三个组件，安装后全自动运行：

| 组件 | 作用 |
|------|------|
| **SKILL.md** | 指导 AI 在每次有意义的编辑后自主 commit，并使用规范格式 |
| **Commit 脚本** | 追加 Git Trailers（agent、类型、用户 prompt）并执行 `git commit` |
| **Stop Hook** | 安全网——对话结束时提醒 AI 提交遗漏的变更 |

```
用户下达任务 → AI 编辑代码 → AI 调用 checkpoint 脚本 → 带 trailer 的 Git commit
                                                       ↗
                           对话结束 → Stop hook 检查是否有未提交变更
```

---

## 安装

### 前置条件

- Git ≥ 2.0
- Node.js ≥ 18（仅安装时需要）
- [Cursor](https://cursor.com) 或 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

### 快速安装

```bash
npx @vibe-x/agent-better-checkpoint
```

自动检测 OS 和 AI 平台，也可以手动指定：

```bash
npx @vibe-x/agent-better-checkpoint --platform cursor
npx @vibe-x/agent-better-checkpoint --platform claude
```

### 项目级安装

仅安装到项目目录（不修改全局）。使用 Cursor 的 [项目级 skills](https://cursor.com/docs/context/skills) 和 [hooks](https://cursor.com/docs/agent/hooks)：

```bash
cd /path/to/your/project
npx @vibe-x/agent-better-checkpoint --platform cursor --target .
```

会创建：`.cursor/skills/`、`.cursor/hooks.json`、`.vibe-x/agent-better-checkpoint/`。可随仓库提交。

仅卸载项目级安装：

```bash
npx @vibe-x/agent-better-checkpoint --uninstall --target .
```

### 通过 [skills.sh](https://skills.sh) 安装

```bash
npx skills add alienzhou/agent-better-checkpoint
```

AI Agent 会在首次使用时自动引导安装运行时脚本。

### 安装内容

**全局**（无 `--target`）：

| 位置 | 内容 |
|------|------|
| `~/.vibe-x/agent-better-checkpoint/scripts/` | Commit 脚本（`checkpoint.sh` / `.ps1`） |
| `~/.vibe-x/agent-better-checkpoint/hooks/stop/` | Stop hook（`check_uncommitted.sh` / `.ps1`） |
| `~/.cursor/skills/` 或 `~/.claude/skills/` | `SKILL.md` — AI Agent 指令 |
| `~/.cursor/hooks.json` 或 `~/.claude/settings.json` | Stop hook 注册 |

**项目级**（`--target .`）：

| 位置 | 内容 |
|------|------|
| `<project>/.cursor/skills/agent-better-checkpoint/` | `SKILL.md` |
| `<project>/.cursor/hooks.json` | Stop hook（仅 Cursor） |
| `<project>/.cursor/hooks/` | `check_uncommitted.sh` |
| `<project>/.vibe-x/agent-better-checkpoint/` | `checkpoint.sh`、`config.yml` |

### 卸载

```bash
npx @vibe-x/agent-better-checkpoint --uninstall
```

---

## 平台支持

| 平台 | 操作系统 | 状态 |
|------|----------|------|
| Cursor | macOS、Linux、Windows | ✅ |
| Claude Code | macOS、Linux、Windows | ✅ |

---

## 贡献

开发、测试和发布流程请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
