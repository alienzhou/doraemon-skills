# Checkpoint 提交排除/过滤机制设计

## 🔵 Current Focus
- 所有核心决策已确认，准备沉淀最终规格

## ⚪ Pending
- check_uncommitted.sh 低于阈值时的输出文案
- bash 解析 YAML 的实现方式

## ✅ Confirmed
- 被动文件（Passive Files）不单独触发提交提醒，可搭便车
- 最小变更阈值，低于阈值不触发提交
- 阈值判断在被动文件过滤之后（方案B）
- 条件关系：OR（trigger_if_any）
- 配置路径：`.vibe-x/config/checkpoint.yaml`
- 不填/注释 = 不启用该条件（不使用 ~ 或 0）
- 默认配置：只启用 min_changed_lines: 5，min_changed_files 注释掉
- passive_patterns 默认：`.discuss/**`, `.vibe-x/**`（显式配置）
- checkpoint.sh 不改，过滤逻辑只在 check_uncommitted.sh

## ❌ Rejected
- AND 条件关系
- 用 ~ (null) 表示不启用
- 用 0 表示不限制
- 用户级配置
- .agents/ 目录
- 硬编码 .vibe-x/ 为 passive
