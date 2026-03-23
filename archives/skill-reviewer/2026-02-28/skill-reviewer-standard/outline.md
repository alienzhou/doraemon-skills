# Discussion: Skill Reviewer 标准制定

> Status: ✅ Implemented | Rounds: R1-R11 | Date: 2026-02-28

## 📋 讨论目标

基于 Agent Skills 构建指南（PDF），设计一个通用的 Skill Reviewer 标准，用于评审用户编写的 Skills。

## 🎉 Implementation Complete

### 目录结构

```
skill/
├── SKILL.md                          # 统一入口（已更新）
├── references/
│   ├── scenarios.md                  # 场景选择指南（已更新）
│   │
│   │── # Mode A: 定义质量检查（新增）
│   ├── definition-checklist.md       # 20 条检查项
│   ├── definition-report.md          # 报告模板
│   │
│   │── # Mode B: 执行过程评估（保留）
│   ├── analysis-dimensions.md        # L1/L2/L3 分析维度
│   ├── execution-guide.md            # 执行计划生成
│   ├── input-guide.md                # 四输入维度
│   └── report-templates.md           # 报告模板
```

### 完成的工作

| 任务 | 状态 |
|------|------|
| 更新 SKILL.md 增加场景 B 入口 | ✅ |
| 更新 scenarios.md 添加定义检查场景 | ✅ |
| 新增 definition-checklist.md | ✅ |
| 新增 definition-report.md | ✅ |
| 目录结构调整（skills/skill-reviewer → skill/）| ✅ |

---

## ✅ Confirmed Decisions

| ID | Decision | Description | Round |
|----|----------|-------------|-------|
| D01 | 目标用户 | 通用的 skill reviewer，供他人使用 | R1 |
| D02 | Review 模式 | 混合模式 = Checklist + Review Report | R1 |
| D03 | 通用性原则 | 剔除 Claude 相关绑定内容，保持开放标准 | R1 |
| D04 | 检测分层 | 程序检测 + 模型检测 | R2 |
| D05 | 程序检测范围 | 目录结构、文件命名、Front-matter 格式 | R3 |
| D06 | 模型检测范围 | 内容性检查全部由 AI 逐条检测 | R3 |
| D07 | 输出位置 | 对话区输出 | R3 |
| D08 | 输出方式 | 逐条检测、逐条输出 | R3 |
| D09 | 输出格式 | 纯 Markdown + 标题层级 | R4 |
| D10 | 状态符号 | ✅ ⚠️ ❌ 三种 | R5 |
| D11 | Summary 位置 | 最前面 | R5 |
| D12 | Checklist 分组 | Structure → Format → Content → Trigger | R7 |
| D13 | 好/坏实践 | 融入评判标准 | R7 |
| D14 | Checklist 条目 | 20 条（S1-S4 + F1-F5 + C1-C8 + T1-T3）| R8 |
| D15 | Review Comments | Strengths + Improvements + Best Practice Alignment | R9 |
| D16 | Review 详细度 | 简洁版（每点 1-2 句）| R9 |
| D17 | 架构策略 | 统一为一个 Skill，用场景分支区分 | R11 |

## ❌ Rejected Decisions

| Decision | Reason | Round |
|----------|--------|-------|
| 输出到独立文件 | 暂不需要 | R3 |
| ASCII 线框 | 过于复杂 | R4 |
| 更多状态符号 | 三种足够 | R5 |
| 按开发阶段分组 | 做事后 Review | R7 |
| 好/坏实践单独维度 | 融入评判标准 | R7 |
| 详细版 Review | 简洁即可 | R9 |
| 扩展机制 | 暂不考虑 | R9 |
| 拆分为两个独立 Skill | 保持统一 | R11 |

## 📄 Decision Documents

| ID | Title | File |
|----|-------|------|
| D01 | Checklist 条目设计 | [D01-checklist-items.md](decisions/D01-checklist-items.md) |
| D02 | 输出格式规范 | [D02-output-format.md](decisions/D02-output-format.md) |

## 📚 References

- `assets/skills构建指南.pdf` - 中文版指南
- `assets/the-complete-guideto-building-skills-for-claude.pdf` - 英文原版指南
