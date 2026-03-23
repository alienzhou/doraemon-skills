# D01: 提交触发条件控制模型 — 最终规格

## 决策

将 checkpoint 的自动提交检测从"有变更就提醒"改为基于**被动文件过滤 + 最小变更阈值**的触发模型。

## 配置文件

路径：`.vibe-x/config/checkpoint.yaml`

```yaml
# .vibe-x/config/checkpoint.yaml

# 满足任一条件即触发提交提醒（OR 关系）
# 不填/注释掉 = 不启用该条件
trigger_if_any:
  # min_changed_files: 3   # 至少 N 个主动文件变更
  min_changed_lines: 5      # 至少 N 行变更

# 被动文件模式 — 这些文件的变更不单独触发提交提醒
# 当有主动文件一起变更时，被动文件搭便车一起提交
passive_patterns:
  - ".discuss/**"
  - ".vibe-x/**"
```

## 核心机制

### 1. 被动文件（Passive Files）

- 通过 `passive_patterns` 配置 glob 模式
- 被动文件的变更**不单独触发**提交提醒
- 当有主动文件一起变更时，被动文件**搭便车**一起提交

### 2. 最小变更阈值

- 过滤掉被动文件后，对主动文件做阈值判断
- 条件关系：**OR**（`trigger_if_any`，任一条件满足即触发）
- 不填/注释掉 = 不启用该条件
- 默认只启用 `min_changed_lines: 5`

### 3. 处理流程

```
1. git status --porcelain → 所有变更文件
2. 按 passive_patterns 过滤 → active_files / passive_files
3. active_files 为空 → 输出信息，不触发提醒
4. 计算 active_files 的文件数和变更行数
5. 检查 trigger_if_any 中已启用的条件（OR）：
   - min_changed_files 已配置 且 文件数 >= 该值 → 触发
   - min_changed_lines 已配置 且 行数 >= 该值 → 触发
6. 无条件满足 → 输出 "变更量不足" 信息，不触发
7. 触发 → 正常提交提醒（包含全部文件，含被动文件）
```

### 4. 影响范围

- **check_uncommitted.sh**（stop hook）：加过滤逻辑
- **checkpoint.sh**（提交脚本）：**保持不变**

## 状态

✅ Confirmed
