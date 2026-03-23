# D03: Project-Level Installation Support

## Status
✅ Confirmed

## Decision
Add `--project-level` and `--target` flags to CLI for installing Skills and Hooks at project level instead of user level.

## Background
Currently, the CLI only supports user-level installation (`~/.{platform}/skills/`). Users want to:
1. Install skills at project level for team sharing via version control
2. Install to a specific directory for flexible deployment
3. Keep project-specific configurations isolated

## Solution

### CLI Flags

```bash
# User-level (default, current behavior)
npx @vibe-x/discuss-for-specs install --platform cursor

# Project-level (current working directory)
npx @vibe-x/discuss-for-specs install --platform cursor --project-level

# Custom target directory
npx @vibe-x/discuss-for-specs install --target /path/to/project

# Platform auto-detection with project-level
npx @vibe-x/discuss-for-specs install --project-level
```

### Behavior by Flag

| Flag | Skills Location | Hooks Location |
|------|-----------------|----------------|
| (default) | `~/.{platform}/skills/` | `~/.{platform}/settings.json` |
| `--project-level` | `./{platform}/skills/` | `./{platform}/settings.json` |
| `--target <dir>` | `<dir>/.{platform}/skills/` | `<dir>/.{platform}/settings.json` |

### L1 vs L2 Handling

**L1 Platforms (Skills only)**:
- Install SKILL.md to project skills directory
- No hooks configuration needed

**L2 Platforms (Skills + Hooks)**:
- Install SKILL.md to project skills directory
- Install hooks script to project hooks directory
- Update project-level settings/hooks.json with relative paths

### Platform-Specific Paths

| Platform | Project Skills | Project Hooks Config |
|----------|---------------|---------------------|
| Claude Code | `.claude/skills/` | `.claude/settings.json` |
| Cursor | `.cursor/skills/` | `.cursor/hooks.json` |
| Cline | `.cline/skills/` | `.clinerules/hooks/` |
| Kilocode | `.kilocode/skills/` | N/A |
| OpenCode | `.opencode/skills/` | N/A |
| Codex CLI | `.codex/skills/` | N/A |
| Trae | `.trae/skills/` | N/A |
| Qoder | `.qoder/skills/` | N/A |
| Roo-Code | `.roo/skills/` | N/A |
| Gemini CLI | N/A | `.gemini/settings.json` |

### Implementation Changes

1. **platform-config.js**: Add `projectConfigDir` and `projectSkillsDir` fields
2. **installer.js**: Update `getSkillsDir()` to accept options
3. **cli.js**: Add `--project-level` and `--target` flags
4. **hooks installation**: Support relative paths for project-level hooks

## Special Considerations

### Cline Priority Inversion
Cline uses **global > project** priority (opposite of others). When installing project-level:
- Warn user that global skills take precedence
- Recommend checking for conflicting global skills

### Hooks Script Paths
For L2 platforms, hooks scripts must use:
- **Relative paths** for project-level: `./hooks/check_precipitation.py`
- **Absolute paths** for user-level: `/path/to/hooks/check_precipitation.py`

### Uninstall Support
The `uninstall` command should also support `--project-level` and `--target` flags.

## Impact
- Update `npm-package/src/platform-config.js`
- Update `npm-package/src/installer.js`
- Update `npm-package/bin/cli.js`
- Add integration tests for project-level installation
- Update documentation

## Related
- [Project-Level Research](../notes/project-level-skills-research.md)
