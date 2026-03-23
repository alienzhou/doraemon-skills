# Helper 采用已安装脚本而非 CLI 子命令

**Decision Time**: #R5  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
V1 需要一个 helper 来分配临时 patch 文件路径，并把路径返回给 agent。此前有两个候选方向：

1. 做成 `bin/cli.mjs` 的子命令；
2. 做成随安装一起下发的独立脚本。

### Constraints
- 不能依赖用户每次都执行 `npx`；
- 不能引入“Skill 版本”和“运行时命令版本”漂移；
- helper 应该和 checkpoint 脚本一样，形成可离线、可本地复用、可查看 help 的闭环能力；
- 设计应兼容全局安装与 project-only 安装。

---

## 🎯 Objective

确定 helper 的分发形态，使其在版本一致性、执行体验和部署闭环上与现有 checkpoint 脚本保持一致。

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| A | `bin/cli.mjs` 子命令，由 agent 通过 `npx @vibe-x/agent-better-checkpoint ...` 调用 | 复用现有 Node CLI，单点实现 | 依赖 `npx`，可能触发网络/确认；运行时版本可能与已安装 skill/script 漂移 | ❌ |
| B | 作为独立 helper 脚本随安装一起分发（全局 scripts + project-local `.vibe-x/`） | 离线可用，版本与已安装脚本绑定，体验一致，可直接查看 help | 需要维护 Unix/Windows 两端脚本 | ✅ |

---

## ✅ Final Decision

### Chosen Solution
- helper 采用独立脚本形式；
- 和 `checkpoint.sh` / `checkpoint.ps1` 一样，作为安装产物被下发；
- 全局安装时放在 `~/.vibe-x/agent-better-checkpoint/scripts/`；
- project-only 安装时放在 `<project>/.vibe-x/agent-better-checkpoint/`；
- Skill 与 stop hook 提示都优先调用项目级脚本，回退到全局脚本。

### Decision Rationale
- 避免每次依赖 `npx`，减少网络开销和潜在确认交互；
- 保证 helper 与 checkpoint 脚本、Skill 文档处于同一已安装版本，不会发生运行时漂移；
- 与当前产品形态一致：核心能力以脚本安装，而不是要求用户额外依赖一个在线 CLI 调用；
- 方便直接提供 `--help`，便于 agent 和用户理解用法。

### Expected Outcome
- helper 可离线稳定运行；
- 同一套安装产物内部版本一致；
- agent 可以像调用 checkpoint 脚本一样调用 helper，减少心智负担。

---

## ❌ Rejected Solutions

### `npx` 调用 CLI 子命令
- **Rejection Reason**: 运行时依赖网络与安装确认，且存在版本漂移风险。
- **Reconsideration**: 仅在未来明确要求“零脚本分发、全命令化”时再考虑。

---

## 🔗 Related Links

- [Discussion Outline](../outline.md)
- [D01-v1-temp-and-error-protocol](./D01-v1-temp-and-error-protocol.md)
