# D01 — 发布策略与架构设计

> Status: Confirmed | Date: 2026-02-22

## Decision

将 agent-better-checkpoint 发布到 skills.sh + npm (`@vibe-x/agent-better-checkpoint`)，采用"安装器 Node.js + 运行时脚本 Bash/PowerShell"的跨平台方案。

---

## 1. 发布渠道

| 渠道 | 用途 |
|------|------|
| **npm** (`@vibe-x/agent-better-checkpoint`) | 主安装入口，`npx` 一键安装 |
| **skills.sh** | SKILL.md 发现 & 分发，自举触发 npm 安装 |
| **GitHub** | 源码托管，skills.sh 自动索引 |

## 2. 双路径安装流程

### 路径 A：npx 直接安装（全量）

```
用户执行: npx @vibe-x/agent-better-checkpoint
    ↓
安装器检测 OS + AI 平台
    ↓
部署: scripts + hooks + SKILL.md + hook 配置
    ↓
完成
```

### 路径 B：skills.sh → 自举安装（增量）

```
用户执行: npx skills add <owner>/<repo>
    ↓
skills.sh 安装 SKILL.md → ~/.cursor/skills/
    ↓
AI 读 SKILL.md → 发现 checkpoint 脚本不存在
    ↓
SKILL.md 指示 AI 执行: npx @vibe-x/agent-better-checkpoint@<version>
    ↓
安装器检测到 SKILL.md 已存在 → 跳过 SKILL.md 安装
    ↓
部署: scripts + hooks + hook 配置
    ↓
完成
```

## 3. 技术架构

### 语言分工

| 组件 | 语言 | 理由 |
|------|------|------|
| 安装器 (cli.mjs) | Node.js | npx 分发，跨平台 |
| checkpoint 脚本 | Bash + PowerShell | AI 原生调用，标准输出友好 |
| check_uncommitted hook | Bash + PowerShell | 平台 hook 调用，JSON 用 grep+sed (Bash) / ConvertFrom-Json (PS) |
| SKILL.md | Markdown | 标准格式 |

### 按平台选择性部署

安装器通过 `process.platform` 检测 OS：
- `darwin` / `linux` → 部署 Bash 脚本 (`.sh`)
- `win32` → 部署 PowerShell 脚本 (`.ps1`)

不安装当前平台用不到的脚本。

### SKILL.md 平台分支

SKILL.md 中写两条命令，让 AI 自行判断当前 OS：

```markdown
**macOS/Linux:**
~/.agent-better-checkpoint/scripts/checkpoint.sh "<message>" "<prompt>"

**Windows (PowerShell):**
powershell -File "$env:USERPROFILE/.agent-better-checkpoint/scripts/checkpoint.ps1" "<message>" "<prompt>"
```

### 版本一致性

- `package.json` 的 `version` 与 `SKILL.md` 的 `metadata.version` 始终同步
- SKILL.md 自举命令中硬编码版本号：`npx @vibe-x/agent-better-checkpoint@x.y.z`
- 发布流程中两者必须同步更新

## 4. 仓库目录结构（调整后）

```
agent-better-checkpoint/
├── package.json                        # npm 包配置
├── bin/
│   └── cli.mjs                         # npx 入口 (安装器)
├── platform/
│   ├── unix/
│   │   ├── checkpoint.sh               # Bash: checkpoint commit
│   │   └── check_uncommitted.sh        # Bash: stop hook
│   └── win/
│       ├── checkpoint.ps1              # PowerShell: checkpoint commit
│       └── check_uncommitted.ps1       # PowerShell: stop hook
├── skill/
│   └── SKILL.md                        # AI agent 指令
├── LICENSE
├── README.md
├── README_zh.md
└── .discuss/                           # 设计讨论记录
```

### 与旧结构对比

| 旧 (src/) | 新 | 变化 |
|------------|-----|------|
| src/install.py | bin/cli.mjs | Python → Node.js |
| src/scripts/checkpoint.sh | platform/unix/checkpoint.sh | 移动位置 |
| src/hooks/stop/check_uncommitted.py | platform/unix/check_uncommitted.sh | Python → Bash |
| — | platform/win/checkpoint.ps1 | 新增 |
| — | platform/win/check_uncommitted.ps1 | 新增 |
| src/skill/SKILL.md | skill/SKILL.md | 移动位置，增加自举 + 平台分支 |

### 删除

- `src/install.py` — 被 `bin/cli.mjs` 替代
- `src/hooks/stop/check_uncommitted.py` — 被 Bash/PowerShell 版替代
- `src/` 目录整体 — 扁平化到根目录

## 5. 安装器 (cli.mjs) 核心逻辑

```
1. 解析参数 (--platform cursor|claude, --uninstall)
2. 检测 OS → process.platform
3. 检测 AI 平台 → 检查 ~/.cursor/ 或 ~/.claude/ 是否存在
4. 创建 ~/.agent-better-checkpoint/scripts/ 和 hooks/stop/
5. 按 OS 复制对应平台脚本 → 设置可执行权限
6. 检查 SKILL.md 是否已安装（skills.sh 路径 or 平台路径）
   - 未安装 → 复制到平台 skill 目录
   - 已安装 → 跳过
7. 注册 stop hook 到平台配置文件
8. 输出安装结果摘要
```

## 6. Rationale

- **npm 发布**：用户不需要 clone 仓库，`npx` 一键安装
- **skills.sh 发布**：增加曝光，利用生态的发现机制
- **保留 Bash/PowerShell**：AI Agent 对原生 shell 命令理解更好，输出更自然
- **去 Python**：减少依赖，npm 用户必然有 Node.js
- **按平台部署**：不安装无用文件，保持用户环境干净
