# 开发手册

本文档面向项目贡献者和维护者，涵盖开发、测试与发布流程。

---

## 目录

- [本地开发](#本地开发)
- [项目结构](#项目结构)
- [版本管理](#版本管理)
- [发布到 npm](#发布到-npm)
- [发布到 skills.sh](#发布到-skillssh)
- [发布检查清单](#发布检查清单)

---

## 本地开发

### 环境要求

- Node.js ≥ 18
- Git ≥ 2.0
- Bash（macOS/Linux 测试）
- PowerShell（Windows 测试，可选）

### 安装测试

本项目没有 npm 依赖，无需 `npm install`。直接运行安装器即可：

```bash
# 安装到本地（Cursor）
node bin/cli.mjs --platform cursor

# 安装到本地（Claude Code）
node bin/cli.mjs --platform claude

# 卸载
node bin/cli.mjs --platform cursor --uninstall
```

### 脚本测试

```bash
# 测试 checkpoint 脚本（需在 git 仓库中，且有未提交变更）
bash platform/unix/checkpoint.sh "checkpoint(test): test message" "test prompt"

# 测试 stop hook（通过 stdin 传入 JSON）
echo '{"workspace_roots":["."]}' | bash platform/unix/check_uncommitted.sh

# 测试 stop_hook_active 防循环
echo '{"stop_hook_active":true}' | bash platform/unix/check_uncommitted.sh
# 应输出: {}
```

---

## 项目结构

```
├── package.json                        # npm 包配置
├── bin/
│   └── cli.mjs                         # npx 入口（Node.js 安装器）
├── platform/
│   ├── unix/
│   │   ├── checkpoint.sh               # Bash: checkpoint commit 脚本
│   │   └── check_uncommitted.sh        # Bash: stop hook
│   └── win/
│       ├── checkpoint.ps1               # PowerShell: checkpoint commit 脚本
│       └── check_uncommitted.ps1       # PowerShell: stop hook
├── .vibe-x/agent-better-checkpoint/    # 项目级（可随项目提交）
│   ├── config.yml                      # 触发条件配置
│   ├── checkpoint.sh                   # Unix checkpoint 脚本
│   ├── check_uncommitted.sh            # Unix stop hook
│   ├── checkpoint.ps1                  # Windows checkpoint 脚本
│   └── check_uncommitted.ps1           # Windows stop hook
├── skill/
│   └── SKILL.md                        # AI Agent 指令（含 YAML frontmatter）
├── LICENSE
├── README.md                           # 英文 README
├── README_zh.md                        # 中文 README
├── CONTRIBUTING.md                     # 本文件
└── .discuss/                           # 设计讨论记录（不包含在 npm 包中）
```

### 语言分工

| 组件 | 语言 | 说明 |
|------|------|------|
| 安装器 (`bin/cli.mjs`) | Node.js ESM | npx 分发入口，零外部依赖 |
| 运行时脚本 (`platform/`) | Bash / PowerShell | AI Agent 直接调用，原生 shell |
| AI 指令 (`skill/SKILL.md`) | Markdown | skills.sh 标准格式 |

---

## 版本管理

项目有 **两处版本号** 需要保持同步：

| 文件 | 字段 | 示例 |
|------|------|------|
| `package.json` | `"version"` | `"0.1.0"` |
| `skill/SKILL.md` | YAML frontmatter `metadata.version` | `version: "0.1.0"` |

此外，`skill/SKILL.md` 的自举命令中硬编码了版本号：

```markdown
npx @vibe-x/agent-better-checkpoint@0.1.0
```

**发版时三处必须同步更新。**

### 版本号更新步骤

```bash
# 1. 更新 package.json 中的 version
# 在 package.json 修改 "version": "x.y.z"

# 2. 更新 skill/SKILL.md 中的两处版本
# (a) YAML frontmatter: version: "x.y.z"
# (b) 自举命令: npx @vibe-x/agent-better-checkpoint@x.y.z

# 3. 提交
git add -A && git commit -m "chore: bump version to x.y.z"
git tag vx.y.z
```

---

## 发布到 npm

### 前置条件

1. 拥有 npm 账号，且已加入 `@vibe-x` organization（或有对应发布权限）
2. 本地已登录 npm：
   ```bash
   npm login
   # 或使用 token
   npm config set //registry.npmjs.org/:_authToken=<your-token>
   ```

### 发布步骤

```bash
# 1. 确保在 main 分支且工作区干净
git checkout main
git pull origin main
git status  # 确认 nothing to commit

# 2. 确认版本号已更新（三处同步，参见「版本管理」）
cat package.json | grep '"version"'
head -10 skill/SKILL.md  # 检查 metadata.version

# 3. 预览将要发布的文件
npm pack --dry-run
# 确认输出中只包含 bin/, platform/, skill/, LICENSE, README.md, package.json

# 4. 发布（scoped 包需要 --access public）
npm publish --access public

# 5. 验证发布成功
npm info @vibe-x/agent-better-checkpoint version
# 应输出刚发布的版本号

# 6. 打 Git tag 并推送
git tag v$(node -p "require('./package.json').version")
git push origin --tags

# 7. 验证用户可正常安装
npx @vibe-x/agent-better-checkpoint --help
```

### 发布后验证

```bash
# 在一个干净环境中测试完整安装流程
mkdir /tmp/test-publish && cd /tmp/test-publish
npx @vibe-x/agent-better-checkpoint --platform cursor

# 检查安装产物
ls -la ~/.vibe-x/agent-better-checkpoint/scripts/
ls -la ~/.vibe-x/agent-better-checkpoint/hooks/stop/
cat ~/.cursor/hooks.json

# 清理
npx @vibe-x/agent-better-checkpoint --platform cursor --uninstall
rm -rf /tmp/test-publish
```

---

## 发布到 skills.sh

### 什么是 skills.sh

[skills.sh](https://skills.sh) 是 Vercel 发布的开放 AI Agent Skills 生态（2026 年 1 月上线），支持 Cursor、Claude Code、GitHub Copilot 等平台。它基于 GitHub 仓库中的 `SKILL.md` 文件自动索引。

### 发布机制

skills.sh **不需要手动提交**。它通过以下方式自动发现你的 skill：

1. GitHub 仓库根目录（或 `skill/` 目录）包含 `SKILL.md`
2. `SKILL.md` 包含有效的 YAML frontmatter（`name` + `description` 必填）
3. 用户通过 `npx skills add <owner>/<repo>` 安装时，匿名遥测自动统计安装量
4. 安装越多，在 [skills.sh](https://skills.sh) 上的排名越高

### 发布步骤

```bash
# 1. 确保 SKILL.md 格式正确
# 必须包含 YAML frontmatter，name 全小写+连字符：
#   ---
#   name: agent-better-checkpoint
#   description: "..."
#   ---

# 2. 确保 SKILL.md 在仓库中（已提交并推送到 main）
git log --oneline -1 -- skill/SKILL.md

# 3. 确保仓库是 public 的
# skills.sh 只能索引公开仓库

# 4. 验证用户能否通过 skills.sh 安装
npx skills add alienzhou/agent-better-checkpoint
# 这会将 skill/SKILL.md 安装到 ~/.cursor/skills/agent-better-checkpoint/

# 5. 验证自举流程
# AI Agent 读到 SKILL.md 后，会检测 ~/.vibe-x/agent-better-checkpoint/scripts/ 不存在，
# 然后自动执行 npx @vibe-x/agent-better-checkpoint@<version> 完成安装。
```

### skills.sh 的 SKILL.md 要求

| 字段 | 是否必填 | 说明 |
|------|----------|------|
| `name` | ✅ | 全小写 + 连字符，如 `agent-better-checkpoint` |
| `description` | ✅ | 一句话描述 skill 功能 |
| `license` | 建议 | 开源许可证 |
| `metadata.version` | 建议 | 与 package.json 保持同步 |
| `metadata.author` | 可选 | 作者名 |
| `metadata.category` | 可选 | 分类标签 |

### 双路径安装流程

用户有两种安装途径，最终效果相同：

**路径 A — npx 直接安装（全量）**：
```
npx @vibe-x/agent-better-checkpoint
  → 安装全部组件（scripts + hooks + SKILL.md + hook 配置）
```

**路径 B — skills.sh 自举安装（增量）**：
```
npx skills add alienzhou/agent-better-checkpoint
  → skills.sh 安装 SKILL.md
  → AI 读 SKILL.md，发现脚本不存在
  → AI 执行 npx @vibe-x/agent-better-checkpoint@<version>
  → 安装器检测到 SKILL.md 已存在 → 跳过 SKILL.md
  → 安装其余组件（scripts + hooks + hook 配置）
```

---

## 发布检查清单

每次发版前逐项确认：

- [ ] 版本号三处同步：`package.json` / `SKILL.md` frontmatter / `SKILL.md` 自举命令
- [ ] `npm pack --dry-run` 输出文件列表正确（9 个文件）
- [ ] 所有脚本在 macOS/Linux 下测试通过
- [ ] `node bin/cli.mjs --platform cursor` 安装正常
- [ ] `node bin/cli.mjs --platform cursor --uninstall` 卸载干净
- [ ] Git 工作区干净，在 main 分支
- [ ] `npm publish --access public` 成功
- [ ] `git tag` 已创建并推送
- [ ] GitHub 仓库为 public（skills.sh 可索引）
- [ ] `npx skills add alienzhou/agent-better-checkpoint` 可正常安装
