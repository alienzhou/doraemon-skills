# D02: 输出格式规范

> Status: ✅ Confirmed | Date: 2026-02-28

## Context

设计 Skill Reviewer 的输出格式，需要在对话区展示，使用纯 Markdown。

## Decision

采用以下输出结构：

```markdown
# 🔍 Skill Review: {skill-name}

> Path: `{skill-path}`

## 📊 Summary

| Category | ✅ Pass | ⚠️ Warn | ❌ Fail |
|----------|---------|---------|---------|
| Structure | x | x | x |
| Format | x | x | x |
| Content | x | x | x |
| Trigger | x | x | x |
| **Total** | **x** | **x** | **x** |

---

## 📁 Structure

- ✅ **S1 检查项名** — 说明
- ⚠️ **S2 检查项名** — 说明
  > 💡 建议内容
- ❌ **S3 检查项名** — 说明
  > 💡 建议内容

## 📋 Format

（同上格式）

## 📝 Content

（同上格式）

## 🎯 Trigger

（同上格式）

---

## 💡 Review Comments

### Strengths
- 亮点1（1-2句）
- 亮点2（1-2句）

### Improvements
- 改进建议1（1-2句）
- 改进建议2（1-2句）

### Best Practice Alignment
- 符合/偏离点1（1-2句）
- 符合/偏离点2（1-2句）
```

## Design Decisions

| 元素 | 决策 | 原因 |
|------|------|------|
| 顶层标题 | `# 🔍 Skill Review:` | 明确这是 Review 报告 |
| Summary 位置 | 最前面 | 快速了解整体情况 |
| 状态符号 | ✅ ⚠️ ❌ | 三种足够，太多不好 |
| 检查项格式 | `- ✅ **ID 名称** — 说明` | 逐条输出，清晰可读 |
| 建议嵌套 | `> 💡` blockquote | 视觉区分，不打断列表 |
| Review Comments | 三部分，简洁版 | Strengths / Improvements / Best Practice |
| 整体风格 | 纯 Markdown，无 ASCII 框 | 简单清晰 |

## Rationale

1. **Summary 在最前面**：用户首先关心整体情况
2. **逐条输出**：便于定位具体问题
3. **简洁版 Review Comments**：每点 1-2 句，不冗长
4. **不用 ASCII 线框**：过于复杂，Markdown 表格和分隔线足够

## Source

- 讨论 R4-R9 轮次确认
