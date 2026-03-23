# Adopt Centralized Configuration Management

**Decision Time**: #R5
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

Need to manage configuration information for multiple platforms (directory conventions, header file names, etc.). Decide between centralized configuration or platform-specific hardcoding.

### Constraints

- Reference spec-kit's `AGENT_CONFIG` pattern
- Need to support 5+ platforms

---

## 🎯 Objective

Simplify platform management so that adding new platforms only requires modifying configuration files.

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| Centralized Config | `config/platforms.yaml` | Single source of truth; simple to add platforms; generalized build scripts | Need to parse configuration | ✅ |
| Hardcoded | Independent `build.sh` per platform | Simple and direct | Lots of duplicate code; troublesome to add new platforms | ❌ |

---

## ✅ Final Decision

### Chosen Solution

Create `config/platforms.yaml` to centrally manage platform information.

### Decision Rationale

1. **Adopt Proven Solution**: spec-kit's `AGENT_CONFIG` pattern is well-tested
2. **Maintainability**: Adding a new platform only requires adding one configuration entry
3. **Generalized Build Scripts**: One script handles all platforms

### Expected Outcome

```yaml
# config/platforms.yaml
platforms:
  claude-code:
    name: "Claude Code"
    skills_dir: ".claude/skills"
    header_file: "claude-code.yaml"
  cursor:
    name: "Cursor"
    skills_dir: ".cursor/skills"
    header_file: "cursor.yaml"
  # ...
```

---

## 🔗 Related Links

- [Platform config draft](../notes/platforms-config-draft.md)
