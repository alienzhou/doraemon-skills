# Multi-Platform Output

**Decision Time**: #R9-R11  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
The system needs to:
1. Initially output as VS Code extension (or Claude Code plugin)
2. Future support for other IDEs (Cursor, JetBrains, etc.)
3. Skill content (Markdown) is largely cross-platform
4. Only headers/metadata formats differ between platforms

Key question: **How to share content while handling platform differences?**

### Constraints
- Skill MARKDOWN content is identical across platforms
- Only **header formats** differ between platforms
- Platform installation locations vary
- Build process should be simple

---

## 🎯 Objective

Design a multi-platform architecture that:
- Maximizes content reuse
- Minimizes platform-specific code
- Simplifies build and deployment
- Makes platform differences explicit

---

## 📊 Solution Design

### Header Separation + Build-Time Merge

**Core Principle**: Content is shared, headers are platform-specific

```
skills/discuss-coordinator/
├── SKILL.md              # Main content (no header)
├── headers/              # Platform headers
│   ├── claude-code.yaml
│   ├── cursor.yaml
│   └── vscode.yaml
└── references/
```

**Build Process**:

```
Header (platform-specific) + Content (shared) = Final output
```

---

## ✅ Final Decision

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      platforms/                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ claude-code │  │   cursor    │  │   vscode    │          │
│  │  (SKILL.md) │  │  (RULE.md)  │  │ (extension) │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Shared Content                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │   skills/   │  │    hooks/   │  │  templates/ │   │  │
│  │  │  (Markdown) │  │   (Python)  │  │  (configs)  │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Header Format Examples

**Claude Code Header** (`headers/claude-code.yaml`):
```yaml
---
name: discuss-coordinator
description: "Discussion mode coordinator managing output strategy and precipitation rules"
metadata:
  version: "1.0.0"
  author: "Your Name"
  category: "discussion-support"
---
```

**Cursor Header** (`headers/cursor.yaml`) [hypothetical]:
```yaml
---
title: discuss-coordinator
type: agent-skill
version: "1.0.0"
---
```

**VS Code Extension** (`headers/vscode.json`):
```json
{
  "name": "discuss-coordinator",
  "displayName": "Discussion Coordinator",
  "description": "Discussion mode coordinator",
  "version": "1.0.0"
}
```

### Build Process

```bash
# scripts/build.sh

# For Claude Code
cat skills/discuss-coordinator/headers/claude-code.yaml \
    skills/discuss-coordinator/SKILL.md \
    > platforms/claude-code/skills/discuss-coordinator/SKILL.md

# For Cursor (hypothetical)
python platforms/cursor/transform.py \
    --input skills/discuss-coordinator/SKILL.md \
    --header skills/discuss-coordinator/headers/cursor.yaml \
    --output platforms/cursor/rules/discuss-coordinator.md
```

### Platform Directory Responsibilities

Each platform directory contains **only**:
1. Installation script (`install.sh`)
2. Transform script (`transform.py`) if needed
3. Platform-specific metadata
4. Built output (generated, not committed)

**No duplicate content** - everything references `skills/` and `hooks/`.

---

## 📊 Installation Process

```
User runs: ./platforms/claude-code/install.sh

Script does:
1. Build final SKILL.md (header + content)
2. Copy to ~/.claude/skills/discuss-coordinator/
3. Copy hooks to appropriate location
4. Initialize configuration if needed
```

---

## ⚠️ Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Platform differences exceed headers | Medium | Medium | Isolate in platform-specific transforms |
| Build process becomes complex | Low | Medium | Keep build scripts simple, well-documented |
| Version sync issues | Medium | Low | Single source of truth in main SKILL.md |

---

## 🔄 Change Log

| Round | Date | Changes | Reason |
|-------|------|---------|--------|
| #R9 | 2026-01-17 | Proposed platform layer | Support multiple IDE targets |
| #R10 | 2026-01-17 | Clarified content sharing | User question about Markdown reuse |
| #R11 | 2026-01-17 | Defined header separation approach | Maximize reuse, minimize duplication |

---

## 🔗 Related Links

- [Decision 07: Project Directory Structure](./07-project-directory-structure.md)
- [Decision 09: Implementation Language](./09-implementation-language.md)
