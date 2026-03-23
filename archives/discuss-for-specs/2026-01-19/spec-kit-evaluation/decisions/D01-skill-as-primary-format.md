# Skill as Primary Distribution Format

**Decision Time**: #R2
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

Need to determine the format for distributing discussion capabilities (`discuss-coordinator`, `discuss-output`) across different AI products.

### Constraints

- Need to support multiple platforms (Claude Code, Cursor, GitHub Copilot, Windsurf, Gemini CLI)
- Different platforms may have different mechanisms (Skill, Slash Command, Rules)

---

## 🎯 Objective

Determine a primary distribution format to ensure cross-platform consistency and maintainability.

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| Skill | Capability extensions based on SKILL.md | All mainstream platforms support it; automatic triggering; high standardization | Cursor still in Beta | ✅ |
| Slash Command | User explicitly triggers with `/xxx` | Clear user control | Large format differences (Markdown vs TOML); requires more adaptation | ❌ |
| Rules | Rule files auto-load | Simple | Not suitable for complex capabilities; different platform formats | ❌ |

---

## ✅ Final Decision

### Chosen Solution

Use **Skill** as the primary distribution format. Other formats (like Slash Commands) can be secondary, deferred for later implementation.

### Decision Rationale

1. **Broad Platform Support**: Claude Code, Cursor, GitHub Copilot, Windsurf, and Gemini CLI all support Skills
2. **Unified Format**: All platforms use `SKILL.md` + YAML frontmatter
3. **Automatic Triggering**: Better user experience, no need to remember commands
4. **Extensible**: Slash Command support can be added in the future

### Expected Outcome

- One set of Skill content, distributed across multiple platforms
- Reduced maintenance costs
- Consistent user experience

---

## 🔗 Related Links

- [Platform Skills/Rules comparison study](../notes/platform-skills-rules-comparison.md)
