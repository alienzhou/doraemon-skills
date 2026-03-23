# Directory Consolidation

**Decision Time**: #R12  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

Discussion files were scattered across multiple directories:
- `discuss/` - Original location (3 discussions from 2026-01-17, 19, 20)
- `.codeflicker/discuss/` - Alternative location (1 discussion)
- `.discuss/` - New standardized location (current discussion)

This inconsistency causes confusion and makes it hard to find historical discussions.

### Constraints

- Must preserve all historical discussions
- Links in specs and docs should be updated
- Should use the standardized `.discuss/` directory going forward

---

## 🎯 Objective

Consolidate all discussion files into a single `.discuss/` directory.

---

## ✅ Final Decision

### Chosen Solution

Move all discussions to `.discuss/` and update references.

### Migration Plan

```bash
# Move from discuss/ to .discuss/
mv discuss/2026-01-17 .discuss/
mv discuss/2026-01-19 .discuss/
mv discuss/2026-01-20 .discuss/

# Move from .codeflicker/discuss/ to .discuss/
mv .codeflicker/discuss/2026-01-27 .discuss/

# Clean up empty directories
rmdir discuss
rmdir .codeflicker/discuss
rmdir .codeflicker  # if empty
```

### Directory Structure After Migration

```
.discuss/
├── 2026-01-17/
│   └── skill-discuss-architecture-design/
├── 2026-01-19/
│   └── spec-kit-evaluation/
├── 2026-01-20/
│   └── hooks-forced-precipitation/
├── 2026-01-27/
│   └── cli-output-beautify/
└── 2026-01-28/
    └── discuss-mode-optimization/
```

### Reference Updates Required

| File | Old Path | New Path |
|------|----------|----------|
| specs/discuss-mode-v1/1-overview.md | `../discuss/2026-01-19/` | `../.discuss/2026-01-19/` |
| specs/discuss-mode-v1/3-architecture.md | `../discuss/2026-01-19/` | `../.discuss/2026-01-19/` |
| docs/HOW-IT-WORKS.md | `discuss/2026-01-17/` | `.discuss/2026-01-17/` |

### Decision Rationale

1. Hidden directory (`.discuss/`) keeps project root clean
2. Single location simplifies discovery
3. Consistent with decision D02 (new directory structure)

### Expected Outcome

- All discussions in one place
- Clear chronological organization
- Updated references throughout project

---

## 🔗 Related Links

- [D02-directory-structure.md](./D02-directory-structure.md)
