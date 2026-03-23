# Preserve Headers Separation Design

**Decision Time**: #R3
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

The current project has a `skills/<name>/headers/<platform>.yaml` design that separates YAML frontmatter from Skill content. Need to decide whether to keep this design.

### Constraints

- Different platforms may have different frontmatter fields
- Need to balance simplicity and extensibility

---

## 🎯 Objective

Determine the Skill file organization, balancing current simplicity with future extensibility.

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| Separated Design | `headers/<platform>.yaml` + `SKILL.md` | Reserves space for platform differences; flexible combination during build | Slightly more files | ✅ |
| Merged Design | Single `SKILL.md` including frontmatter | Simple and intuitive | Refactoring needed when platform differences exist | ❌ |

---

## ✅ Final Decision

### Chosen Solution

Preserve the `skills/<name>/headers/<platform>.yaml` separated design.

### Decision Rationale

1. **Platform Differences Exist**: Claude Code supports `allowed-tools`, Cursor supports `alwaysApply` and `globs`
2. **Build-time Concatenation**: `headers/<platform>.yaml` + `SKILL.md` → complete file
3. **Good Extensibility**: Adding a new platform in the future only requires adding the corresponding header file

### Expected Outcome

Directory structure:
```
skills/
├── discuss-coordinator/
│   ├── SKILL.md
│   └── headers/
│       ├── claude-code.yaml
│       ├── cursor.yaml
│       └── ...
```

---

## 🔗 Related Links

- [Claude vs Cursor Skills comparison](../notes/claude-vs-cursor-skills.md)
