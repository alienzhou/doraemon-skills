# V1 临时文件与错误处理协议

**Decision Time**: #R4  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
V1 需要支持按 hunk 提交，而不是全量 `git add -A`。这要求 agent 先产生 patch，再交给 checkpoint 脚本执行。由此带来两个关键问题：

1. patch 临时文件应存放在哪里，才能避免污染项目工作区；
2. 当 patch 无法安全应用或 hunk 无法安全分离时，系统应如何失败并继续后续决策。

### Constraints
- 不能在项目目录内留下大量一次性文件；
- 失败时不能自动退化为全量提交；
- agent 需要拿到足够明确的错误信息，才能继续和用户交互；
- V1 应尽量简单，不引入复杂的会话追踪基础设施。

---

## 🎯 Objective

为 V1 确定一个简单、稳定、可落地的临时文件与错误处理协议。

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| A | 把 patch 文件放在项目目录里 | 实现简单，路径直观 | 污染工作区，可能被再次检测到，清理麻烦 | ❌ |
| B | 使用系统临时目录（如 `/tmp`） | 不污染项目，实现也简单 | 生命周期与清理策略不稳定，跨平台一致性较弱 | ❌ |
| C | 使用 ABC 自己管理的 `~/.vibe-x/agent-better-checkpoint/tmp/` | 不污染项目，结构统一，易于 TTL 清理，便于调试 | 需要补一点路径管理与清理逻辑 | ✅ |

---

## ✅ Final Decision

### Chosen Solution
- patch 临时文件统一放在 `~/.vibe-x/agent-better-checkpoint/tmp/` 下；
- 文件名或目录名带唯一随机 ID，避免并发冲突；
- 启动相关脚本时做一次 best-effort TTL 清理，默认清除 24 小时或 48 小时前的文件；
- 当 patch 无法安全应用或目标 hunk 无法安全分离时：
  - 脚本返回非零退出码；
  - 输出固定前缀错误码；
  - 同时输出正常英文的人类可读说明；
  - 由 agent 接住错误并向用户征求下一步操作。

### Decision Rationale
- `~/.vibe-x/.../tmp/` 延续了现有工具目录模式，比项目目录和系统临时目录都更可控；
- TTL 清理足够简单，符合 V1 的复杂度目标；
- 错误时停止并交还用户，能最大限度避免误提交；
- 错误消息既有机器可识别前缀，也有人类可读说明，便于 agent 自动分支与用户理解。

### Expected Outcome
- patch 临时工件不会污染项目工作区；
- 并发时更不容易因为路径冲突导致失败；
- 出现危险情况时，流程会安全停止并进入可协商状态，而不是偷偷提交错误内容。

---

## ❌ Rejected Solutions

### 项目目录内临时文件
- **Rejection Reason**: 会污染仓库，增加误检与清理成本。
- **Reconsideration**: 基本不考虑，除非未来需要显式把 patch 工件作为项目资产保留。

### 自动退化为全量提交
- **Rejection Reason**: 违背“并行会话只提交本会话 hunk”的目标，风险过高。
- **Reconsideration**: 仅当用户明确选择“全量提交”时才允许。

---

## 🔗 Related Links

- [Discussion Outline](../outline.md)
