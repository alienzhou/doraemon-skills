# 并发 Tab（Agent 对话）场景下的文件变更归属问题

## 🔵 Current Focus
- 并发 Tab 编辑同一文件时，如何实现行级别的变更归属与选择性提交
- 技术可行性分析：平台能力、Git 能力、实现成本

## ⚪ Pending
- 实现方案选型（snapshot diff / edit event 追踪 / branch 隔离 / 其他）
- 对共享文件（如文件 2、3）的冲突处理策略
- 与 Cursor hook 能力的匹配度（afterFileEdit 等）
- 与已延后的 Session ID（D04）的关系
- 对 SKILL.md 和 checkpoint.sh 的改动范围

## ✅ Confirmed
- "绘画" = Cursor 多 Tab 并行 Agent 对话
- 目标 1：非当前 Tab 编辑的文件（如 TAB A 不管文件 4）不应纳入该 Tab 的 checkpoint
- 目标 2：共享文件（如文件 2、3）应只提交当前 Tab 编辑的行，而非全部变更

## ❌ Rejected
(Empty)
