# D04: CLI Simplification & Export Command

## Status
✅ Confirmed

## Date
2026-02-03

## Decision

Simplify CLI by removing redundant `--project-level` flag and add a new `export` command for raw directory installation.

## Background

The current CLI has two flags for non-global installation:
- `--project-level`: Install to current directory's `.{platform}/skills/`
- `--target <dir>`: Install to specified directory's `.{platform}/skills/`

These are functionally similar (`--project-level` is equivalent to `--target .`), causing confusion. Additionally, there's no way to install skills to a raw directory without the `.{platform}/skills/` structure, which limits flexibility for unsupported platforms.

## Changes

### 1. Remove `--project-level` Flag

**Before**:
```bash
# Three ways to do project-level installation
discuss-for-specs install -p cursor --project-level
discuss-for-specs install -p cursor --target .
discuss-for-specs install -p cursor --target /path/to/project
```

**After**:
```bash
# Unified: only --target
discuss-for-specs install -p cursor --target .
discuss-for-specs install -p cursor --target /path/to/project
```

### 2. Require `--platform` for `install` Command

**Behavior**:
- `install` without `--platform` → Error with helpful message
- No more auto-detection guessing

**Rationale**:
- Explicit is better than implicit
- Avoids accidental installation to wrong platform

### 3. Add `export` Command

```bash
# Export to raw directory (no .{platform}/skills/ structure)
discuss-for-specs export /my/custom/skills/
# Result: /my/custom/skills/discuss-for-specs/

# Include L1 guidance
discuss-for-specs export /my/custom/skills/ --include-l1-guidance
```

**Characteristics**:
- No platform required
- No hooks installation
- Only Skills (SKILL.md + references/)
- Optional L1 guidance injection

**Use Cases**:
1. Unsupported platforms where user manages integration manually
2. Custom deployment scenarios
3. Testing and development

## Command Comparison

| Command | Platform | Result Path | Hooks |
|---------|----------|-------------|-------|
| `install -p X` | Required | `~/.X/skills/discuss-for-specs/` | Yes (L2) |
| `install -p X --target D` | Required | `D/.X/skills/discuss-for-specs/` | Yes (L2) |
| `export D` | Not needed | `D/discuss-for-specs/` | No |

## Implementation

### cli.js Changes

1. Remove `--project-level` option from `install` command
2. Make `--platform` required (error if not provided)
3. Add new `export` command with:
   - Positional argument: target directory
   - `--include-l1-guidance` flag

### installer.js Changes

1. Add `exportSkills(targetDir, options)` function
2. Options: `{ includeL1Guidance: boolean }`

### Error Messages

```
Error: Platform is required for installation.
Use --platform to specify one: claude-code, cursor, cline, kilocode, opencode, codex, trae, qoder, roo-code

Examples:
  discuss-for-specs install --platform cursor
  discuss-for-specs install --platform claude-code --target .
```

## Impact

- Update `npm-package/bin/cli.js`
- Update `npm-package/src/installer.js`
- Update tests
- Update documentation (README, VERIFICATION.md)

## References

- [D03 Project-Level Installation](./D03-project-level-installation.md)
