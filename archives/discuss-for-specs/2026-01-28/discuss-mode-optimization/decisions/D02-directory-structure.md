# Directory Structure for Discussion Files

**Decision Time**: #R2  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

The original implementation used `.codeflicker/discuss/` as the base directory. User requested a change to a simpler, more intuitive structure.

### Constraints

- Directory should be easily discoverable
- Structure should support multiple discussion topics
- Should accommodate date-based organization

---

## 🎯 Objective

Establish a clean, intuitive directory structure for storing discussion artifacts.

---

## 📊 Solution Comparison

| Solution | Structure | Advantages | Disadvantages | Decision |
|----------|-----------|------------|---------------|----------|
| A: Original | `.codeflicker/discuss/YYYY-MM-DD/[topic]/` | Namespaced under .codeflicker | Deeper nesting, less discoverable | ❌ |
| B: Simplified | `.discuss/YYYY-MM-DD/[topic]/` | Shallow, intuitive | New top-level directory | ✅ |

---

## ✅ Final Decision

### Chosen Solution

**Simplified directory structure**

```
.discuss/
└── YYYY-MM-DD/
    └── [topic-slug]/
        ├── outline.md      # Discussion outline (state-priority order)
        ├── meta.yaml       # Metadata (fully automated by Hooks)
        ├── decisions/      # Decision documents
        │   ├── D01-xxx.md
        │   └── D02-xxx.md
        └── notes/          # Reference materials and analysis
            └── topic-analysis.md
```

### Naming Conventions

**Topic Slug**:
- Lowercase, hyphen-separated
- Derived from discussion topic
- Examples: `discuss-mode-optimization`, `api-design-review`

**Decision Files**:
- Format: `DXX-decision-title.md`
- Sequential numbering: D01, D02, D03...
- Examples: `D01-skill-architecture.md`

**Notes Files**:
- Format: `topic-name.md` (no numbering)
- Examples: `template-analysis.md`

### Decision Rationale

1. `.discuss/` is more discoverable than nested `.codeflicker/discuss/`
2. Date-based organization helps track discussion chronology
3. Topic slug provides clear identification

### Expected Outcome

- Users can easily find and navigate discussion files
- Clear separation between different discussions
- Chronological organization for historical reference

---

## 🔗 Related Links

- [D01-skill-architecture.md](./D01-skill-architecture.md)
- [D03-meta-yaml-design.md](./D03-meta-yaml-design.md)
