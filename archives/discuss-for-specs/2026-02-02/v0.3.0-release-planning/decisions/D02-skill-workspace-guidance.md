# D02: SKILL.md Workspace Root Guidance Enhancement

## Status
✅ Confirmed

## Date
2026-02-02

## Decision

Simplify and strengthen the workspace root guidance in SKILL.md to prevent AI from creating `.discuss/` in wrong locations.

## Background

AI sometimes creates `.discuss/` directory in incorrect locations:
- Skill directories
- Subdirectories of the project
- User home directory

Current guidance exists but may not be prominent enough.

## Solution

Consolidate and clarify the existing guidance in SKILL.md, keeping it minimal:

**Current (lines 21-22)**:
```markdown
- **IMPORTANT**: Create `.discuss/` at the workspace root (where the user's project is), NOT in the skill directory or user's home directory
- The workspace root is the directory you're currently working in (your cwd)
```

**Updated**:
```markdown
- **IMPORTANT**: Create `.discuss/` at the workspace root — the top-level directory of the user's project. NOT in skill directories, subdirectories, or home directory.
```

## Principles

- Keep it simple — avoid over-engineering
- Don't list specific file markers (may mislead)
- Let AI understand "project root" conceptually
- Add more guidance only when more problems are encountered

## Impact

- Modify: `skills/discuss-for-specs/SKILL.md` (minimal change)
- Applies to: All platforms (L1 and L2)

## References

- v0.3.0 Release Planning discussion
