# Patch 审计时间信息应放在文件名与元数据，而非 patch 正文

**Decision Time**: #R6  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
为了便于审计与排查，用户希望 patch 临时文件带有明确的时间信息，方便通过 `ls` 等方式快速排序和定位。

### Constraints
- patch 文件将被 checkpoint 脚本直接用于 `git apply --cached`；
- patch 正文应尽量保持标准 unified diff 格式；
- 需要兼顾人类可读性、时间排序和脚本稳定性。

---

## 🎯 Objective

在不破坏 patch 可应用性的前提下，为 patch 临时工件提供足够清晰的时间信息。

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| A | 只在 patch 正文里加入时间戳文本 | 审计信息在文件内部可见 | 可能破坏 patch 格式，影响 `git apply` 稳定性 | ❌ |
| B | 在文件名中加入可排序时间戳，patch 正文保持纯 diff | `ls` 友好，时间一眼可见，不影响 patch 应用 | 文件内部没有额外元数据 | ✅ |
| C | 文件名加时间戳，再额外配套 sidecar metadata 文件 | 信息最完整 | V1 复杂度偏高，需要更多临时文件管理 | ⏸️ |

---

## ✅ Final Decision

### Chosen Solution
- patch 文件名中加入 UTC 时间戳；
- patch 正文保持标准 unified diff，不插入额外说明行；
- helper 输出 JSON 时也返回创建时间字段，便于 agent 使用。

建议命名格式：

```text
patch-YYYYMMDDTHHMMSSZ-<random-id>.patch
```

例如：

```text
patch-20260316T164352Z-01HXYZABC.patch
```

### Decision Rationale
- 时间戳放在文件名里，最符合你提到的 `ls`/排序/快速定位需求；
- patch 正文保持纯净，避免影响后续 `git apply --cached`；
- helper JSON 里再返回 `createdAt`，就能兼顾机器可读与人类可读。

### Expected Outcome
- 用户和 agent 都能快速按时间定位 patch 文件；
- patch 文件仍然可被脚本稳定应用；
- 审计信息足够清晰，但不会引入额外格式风险。

---

## ❌ Rejected Solutions

### 在 patch 正文前插入时间戳说明行
- **Rejection Reason**: 会污染 unified diff 语义，增加 `git apply` 失败风险。
- **Reconsideration**: 仅当未来改成 envelope + payload 格式、并由脚本先剥离元数据时才考虑。

---

## 🔗 Related Links

- [Discussion Outline](../outline.md)
- [D01-v1-temp-and-error-protocol](./D01-v1-temp-and-error-protocol.md)
- [D02-helper-as-installed-script](./D02-helper-as-installed-script.md)
