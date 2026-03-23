# Claude Code vs Cursor Skills Specification Comparison

> Research Date: 2026-01-19

---

## 📂 Installation Directory Comparison

| Platform | Project-level Directory | Global Directory | Status |
|----------|------------------------|-----------------|--------|
| **Claude Code** | `.claude/skills/<skill-name>/` | `~/.claude/skills/` | ✅ Stable |
| **Cursor** | `.cursor/skills/<skill-name>/` | Unknown | ⚠️ Beta/Nightly |

### Directory Structure

**Claude Code** (Full support):
```
.claude/skills/
└── discuss-coordinator/
    ├── SKILL.md           # Required
    ├── reference.md       # Optional: detailed reference documentation
    ├── examples.md        # Optional: usage examples
    ├── scripts/           # Optional: helper scripts
    └── templates/         # Optional: template files
```

**Cursor** (Expected structure):
```
.cursor/skills/
└── discuss-coordinator/
    ├── SKILL.md           # Required
    ├── scripts/           # Optional: helper scripts
    └── references/        # Optional: reference documentation
```

---

## 📝 Frontmatter Field Comparison

### Required Fields (Same for both platforms)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique skill identifier |
| `description` | string | Describes what it does + when to use |

### Optional Fields Comparison

| Field | Claude Code | Cursor | Description |
|-------|-------------|--------|-------------|
| `allowed-tools` | ✅ | ❌ | Restrict available tools (Read, Write, Bash, etc.) |
| `model` | ✅ | ❌ | Specify model (opus, sonnet, haiku) |
| `context` | ✅ | ❌ | Runtime context (e.g., fork) |
| `agent` | ✅ | ❌ | Agent type |
| `hooks` | ✅ | ❌ | Lifecycle hooks |
| `user-invocable` | ✅ | ❌ | Whether to show in menu |
| `disable-model-invocation` | ✅ | ❌ | Disable calling via Skill tool |
| `alwaysApply` | ❌ | ✅ | Whether to always apply |
| `globs` | ❌ | ✅ | File matching patterns |

---

## 🔒 Validation Rules

### Claude Code

| Field | Rules |
|-------|-------|
| `name` | Max 64 characters; only lowercase letters, numbers, hyphens allowed; cannot contain "anthropic" or "claude" |
| `description` | Non-empty; max 1024 characters; **must be single line**; cannot contain XML tags |

### Cursor

| Field | Rules |
|-------|-------|
| `name` | Lowercase, hyphen-separated |
| `description` | Non-empty, clear description |

---

## 📋 Header Templates

### Claude Code (`headers/claude-code.yaml`)

```yaml
---
name: discuss-coordinator
description: "Discussion mode coordinator managing output strategy, problem tracking, and precipitation rules. Use when user requests discussion mode or wants to track decisions."
---
```

**Notes**:
- description must be single line, cannot use YAML multi-line syntax
- Recommended to clearly state "when to use" (Use when...)

### Cursor (`headers/cursor.yaml`)

```yaml
---
name: discuss-coordinator
description: "Discussion mode coordinator managing output strategy, problem tracking, and precipitation rules. Use when user requests discussion mode or wants to track decisions."
alwaysApply: false
---
```

**Notes**:
- `alwaysApply: false` means Agent decides based on context
- Can add `globs` to limit application scope

---

## ⚠️ Platform Difference Handling

### 1. Common Fields (Both platforms have)

```yaml
name: discuss-coordinator
description: "..."
```

This part can be identical.

### 2. Platform-Specific Fields

| Scenario | Claude Code | Cursor |
|----------|-------------|--------|
| Restrict tool usage | `allowed-tools: [Read, Write]` | Not supported |
| Always apply | Not supported | `alwaysApply: true` |
| File matching | Not supported | `globs: "discuss/**/*"` |

### 3. Compatibility Handling

- **Claude Code** will ignore unrecognized fields (like `alwaysApply`)
- **Cursor** will ignore unrecognized fields (like `allowed-tools`)

So **merging fields** is possible, but for clarity, it's recommended to maintain them separately.

---

## 🎯 Recommended Headers Implementation

### `headers/claude-code.yaml`

```yaml
---
name: discuss-coordinator
description: "Discussion mode coordinator managing output strategy, problem tracking, and precipitation rules. Use when user requests discussion mode, enters discussion mode, or wants to track decisions and consensus."
---
```

### `headers/cursor.yaml`

```yaml
---
name: discuss-coordinator
description: "Discussion mode coordinator managing output strategy, problem tracking, and precipitation rules. Use when user requests discussion mode, enters discussion mode, or wants to track decisions and consensus."
alwaysApply: false
---
```

---

## 📊 Feature Status

| Platform | Skills Feature | Stability |
|----------|----------------|-----------|
| Claude Code | ✅ Fully available | Stable |
| Cursor | ⚠️ May require Nightly | Beta, some features may be unstable |

**Cursor Notes**:
- Skills feature may need to be enabled in Settings → Rules → Agent Skills
- If you can't find the switch, you may need to use Nightly version
- As a fallback, you can use `.mdc` files in `.cursor/rules/`

---

## 📁 Final Directory Structure Recommendation

```
skills/
├── discuss-coordinator/
│   ├── SKILL.md                    # Common content
│   ├── headers/
│   │   ├── claude-code.yaml        # Claude Code frontmatter
│   │   └── cursor.yaml             # Cursor frontmatter
│   └── references/                 # Optional: reference documentation
└── discuss-output/
    └── (same structure as above)

platforms/
├── claude-code/
│   ├── build.sh                    # Build script
│   └── install.sh                  # Installation script
└── cursor/
    ├── build.sh
    └── install.sh
```

---

**Last Updated**: 2026-01-19
