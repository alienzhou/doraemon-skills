# Project-Level Installation Research

> **Date**: 2026-02-02
> **Purpose**: Support project-level skill and hooks installation across platforms

## Overview

This research documents the project-level directories for Skills and Hooks across all supported platforms, enabling the CLI to install at either user-level (global) or project-level (local) scope.

## Platform Directory Matrix

| Platform | Level | User-Level Path | Project-Level Path | Override Priority |
|----------|-------|-----------------|-------------------|-------------------|
| **Claude Code** | L2 | `~/.claude/skills/` | `.claude/skills/` | Project > User |
| **Cursor** | L2 | `~/.cursor/skills/` | `.cursor/skills/` | Project > User |
| **Cline** | L2 | `~/.cline/skills/` | `.cline/skills/` | **User > Project** ⚠️ |
| **Kilocode** | L1 | `~/.kilocode/skills/` | `.kilocode/skills/` | Project > User |
| **OpenCode** | L1 | `~/.config/opencode/skills/` | `.opencode/skills/` | Project > User |
| **Codex CLI** | L1 | `~/.codex/skills/` | `.codex/skills/` | Scoped by location |
| **Trae** | L1 | `~/.trae/skills/` | `.trae/skills/` | TBD |
| **Qoder** | L1 | `~/.qoder/skills/` | `.qoder/skills/` | Project > User |
| **Gemini CLI** | L2 | N/A (no skills) | N/A | Uses custom commands |
| **Roo-Code** | L1 | `~/.roo/skills/` | `.roo/skills/` | Project > User |

## Detailed Platform Analysis

### 1. Claude Code (L2)

**User-level**: `~/.claude/skills/{skill-name}/SKILL.md`
**Project-level**: `.claude/skills/{skill-name}/SKILL.md`

- Project skills have higher priority
- Plugin skills also supported (bundled with distribution)

### 2. Cursor (L2)

**User-level**: `~/.cursor/skills/{skill-name}/SKILL.md`
**Project-level**: `.cursor/skills/{skill-name}/SKILL.md`

- Standard VSCode-style configuration
- Also supports `.cursor/rules/` for rules

### 3. Cline (L2)

**User-level**: 
- macOS/Linux: `~/.cline/skills/{skill-name}/SKILL.md`
- Windows: `C:\Users\USERNAME\.cline\skills\{skill-name}\SKILL.md`

**Project-level** (multiple options):
- `.cline/skills/` (recommended)
- `.clinerules/skills/`
- `.claude/skills/` (Claude Code compatibility)

⚠️ **IMPORTANT**: Global skills take precedence over project skills (opposite of most platforms)

### 4. Kilocode (L1)

**User-level**: `~/.kilocode/skills/{skill-name}/SKILL.md`
**Project-level**: `.kilocode/skills/{skill-name}/SKILL.md`

**Mode-specific skills**:
- `skills/` - generic skills for all modes
- `skills-code/` - code mode only
- `skills-architect/` - architect mode only

### 5. OpenCode (L1)

**User-level**:
- `~/.config/opencode/skills/{skill-name}/SKILL.md` (primary)
- `~/.claude/skills/{skill-name}/SKILL.md` (Claude-compatible fallback)

**Project-level**:
- `.opencode/skills/{skill-name}/SKILL.md` (primary)
- `.claude/skills/{skill-name}/SKILL.md` (Claude-compatible fallback)

**Special feature**: Walks up directory tree from CWD to git worktree root, loading all matching skills.

### 6. Codex CLI (L1)

**Scoped locations** (in discovery order):

| Scope | Path | Use Case |
|-------|------|----------|
| REPO | `$CWD/.codex/skills/` | Microservice/module-specific |
| REPO | `$CWD/../.codex/skills/` | Shared parent folder |
| REPO | `$REPO_ROOT/.codex/skills/` | Repository root |
| USER | `~/.codex/skills/` | Personal cross-project |
| ADMIN | `/etc/codex/skills/` | System-wide defaults |
| SYSTEM | Bundled by OpenAI | Built-in skills |

**Note**: No deduplication - same-named skills can appear multiple times.

### 7. Trae (L1)

**User-level**: `~/.trae/skills/{skill-name}/SKILL.md` (inferred)
**Project-level**: `.trae/skills/{skill-name}/SKILL.md`

- Based on agentskills.io open standard
- Skills registry system for management

### 8. Qoder (L1)

**User-level**: `~/.qoder/skills/{skill-name}/SKILL.md`
**Project-level**: `.qoder/skills/{skill-name}/SKILL.md`

- Project skills override personal skills
- Compatible with `npx skills add` CLI
- IDE + CLI unified experience

### 9. Gemini CLI (L2)

**No skills support** - uses custom commands instead.

**Custom commands**:
- User-level: `~/.gemini/commands/`
- Project-level: `.gemini/commands/`

**Note**: Not directly compatible with SKILL.md format.

### 10. Roo-Code (L1)

**User-level**:
- macOS/Linux: `~/.roo/skills/{skill-name}/SKILL.md`
- Windows: `%USERPROFILE%\.roo\skills\{skill-name}\SKILL.md`

**Project-level**: `.roo/skills/{skill-name}/SKILL.md`

- Project skills override global skills
- Custom instructions in `.roo/rules/`

## Implementation Recommendations

### CLI Flag Design

```bash
# User-level (default)
npx @vibe-x/discuss-for-specs install --platform cursor

# Project-level
npx @vibe-x/discuss-for-specs install --platform cursor --project-level
# or
npx @vibe-x/discuss-for-specs install --platform cursor --target .

# Custom directory
npx @vibe-x/discuss-for-specs install --target /path/to/project
```

### Platform Config Update

```javascript
// npm-package/src/platform-config.js
export const PLATFORMS = {
  'claude-code': {
    name: 'Claude Code',
    configDir: '.claude',
    skillsDir: 'skills',
    // New fields:
    projectConfigDir: '.claude',    // Project-level config directory
    projectSkillsDir: 'skills',     // Project-level skills subdirectory
    level: 'L2'
  },
  // ... other platforms
};
```

### getSkillsDir Enhancement

```javascript
export function getSkillsDir(platformId, options = {}) {
  const { targetDir = null, projectLevel = false } = options;
  const config = getPlatformConfig(platformId);
  
  if (targetDir) {
    // Custom directory specified
    return join(targetDir, config.projectConfigDir, config.projectSkillsDir);
  }
  
  if (projectLevel) {
    // Project-level: use current working directory
    return join(process.cwd(), config.projectConfigDir, config.projectSkillsDir);
  }
  
  // User-level (default)
  return join(getHomeDir(), config.configDir, config.skillsDir);
}
```

## Special Considerations

### 1. Cline Priority Inversion

Cline uses **global > project** priority, which is opposite to most platforms. When installing project-level skills for Cline:
- Warn user that global skills take precedence
- Recommend removing conflicting global skills

### 2. OpenCode Directory Walk

OpenCode walks up the directory tree. For project-level installation:
- Install at git root `.opencode/skills/` to ensure discovery
- Or install at specific CWD for scoped access

### 3. Codex Multi-Level Scoping

Codex supports multiple REPO scopes. For project-level installation:
- Default to `$REPO_ROOT/.codex/skills/` for maximum visibility
- Allow `--scope cwd` for current directory only

### 4. Cross-Platform Compatibility

Several platforms support `.claude/skills/` as fallback:
- OpenCode
- Cline

This enables a single installation to work across multiple platforms.

---

## L2 Hooks Project-Level Configuration

For L2 platforms (with Stop Hook support), hooks also support project-level configuration.

### Hooks Directory Matrix

| Platform | User-Level Hooks | Project-Level Hooks | Config Format |
|----------|-----------------|---------------------|---------------|
| **Claude Code** | `~/.claude/settings.json` | `.claude/settings.json` | JSON (hooks object) |
| **Cursor** | `~/.cursor/hooks.json` | `.cursor/hooks.json` | JSON |
| **Cline** | `~/Documents/Cline/Hooks/` | `.clinerules/hooks/` | Shell scripts |
| **Gemini CLI** | `~/.gemini/settings.json` | `.gemini/settings.json` | JSON (hooks object) |

### Detailed Hooks Analysis

#### Claude Code

**User-level**: `~/.claude/settings.json`
**Project-level** (in priority order):
1. `.claude/settings.local.json` (gitignored, highest priority)
2. `.claude/settings.json` (version controlled)

**Config format**:
```json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "python3 /path/to/check_precipitation.py"
      }]
    }]
  }
}
```

#### Cursor

**User-level**: `~/.cursor/hooks.json`
**Project-level**: `.cursor/hooks.json`

**Config format**:
```json
{
  "version": 1,
  "hooks": {
    "stop": [{
      "command": "python3 /path/to/check_precipitation.py"
    }]
  }
}
```

#### Cline

**User-level**: `~/Documents/Cline/Hooks/` (macOS/Linux)
**Project-level**: `.clinerules/hooks/`

- Hooks are shell scripts, not JSON config
- Each hook type is a separate script file
- Supports multi-root workspaces (runs hooks from all repos)

**Event types**: TaskStart, PreToolUse, PostToolUse, TaskComplete, UserPromptSubmit

#### Gemini CLI

**User-level**: `~/.gemini/settings.json` (hooks object)
**Project-level**: `.gemini/settings.json` (hooks object)

**Config format**:
```json
{
  "hooks": {
    "AfterAgent": [{
      "type": "command",
      "command": "./path/to/hook-script.sh",
      "name": "precipitation-check"
    }]
  }
}
```

**Note**: Uses `AfterAgent` event (fires when agent loop ends).

### Hooks Installation Considerations

#### Project-Level Hooks Paths

When installing hooks at project-level, the script path must be:
1. **Relative to project** - Use relative paths like `./hooks/check_precipitation.py`
2. **Or absolute** - Use absolute paths for shared hooks

**Recommendation**: Bundle hooks with skills in project directory:
```
.{platform}/
├── skills/
│   └── discuss-for-specs/
│       └── SKILL.md
└── hooks/                    # For platforms that need separate hooks dir
    └── check_precipitation.py
```

Or embed hooks script path in settings:
```
.{platform}/
├── skills/
│   └── discuss-for-specs/
│       ├── SKILL.md
│       └── hooks/
│           └── check_precipitation.py
└── settings.json             # Points to skills/discuss-for-specs/hooks/
```

### CLI Flag Update for Hooks

```bash
# User-level (default) - installs to ~/.{platform}/
npx @vibe-x/discuss-for-specs install --platform cursor

# Project-level - installs both skills and hooks to .{platform}/
npx @vibe-x/discuss-for-specs install --platform cursor --project-level

# Custom target - installs to specified directory
npx @vibe-x/discuss-for-specs install --target /path/to/project
```

For L2 platforms with `--project-level`:
1. Install SKILL.md to `.{platform}/skills/discuss-for-specs/`
2. Install hooks script to `.{platform}/hooks/` or bundled location
3. Update `.{platform}/settings.json` or `hooks.json` with relative path

---

## Conclusion

All current and planned v0.3.0 platforms support project-level configuration:

**Skills**: All platforms except Gemini CLI support project-level skills.

**Hooks**: All L2 platforms support project-level hooks:
- Claude Code: `.claude/settings.json`
- Cursor: `.cursor/hooks.json`
- Cline: `.clinerules/hooks/`
- Gemini CLI: `.gemini/settings.json`

The recommended implementation adds `--project-level` and `--target` flags to the installer CLI, handling both skills and hooks installation at the specified scope.
