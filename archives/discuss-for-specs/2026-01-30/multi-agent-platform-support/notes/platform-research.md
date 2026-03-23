# Platform Research Results

> **Research Date**: 2026-01-31
> **Last Updated**: 2026-01-31
> **Researcher**: AI Agent

## Version Information

| Platform | Version Tag | Repository |
|----------|-------------|------------|
| Cline | v3.56.1 | open-coding-agent/cline |
| Kilocode | v5.2.2 | open-coding-agent/kilocode |
| OpenCode | v1.1.47 | open-coding-agent/opencode |
| Roo-Code | v3.8.4 | open-coding-agent/Roo-Code |

---

## Platform Capability Matrix

| Platform | Skills | Hooks | Adaptation Method | Level | Status |
|----------|--------|-------|-------------------|-------|--------|
| **Already Supported** |
| Claude Code | ✅ | ✅ Stop | SKILL.md + Hook | L2 | ✅ Production |
| Cursor | ✅ | ✅ stop | SKILL.md + Hook | L2 | ✅ Production |
| **Batch 1 - To Implement** |
| Cline (v3.56.1) | ✅ | ✅ TaskComplete | SKILL.md + Hook | L2 | 🔵 Ready |
| Gemini CLI | ⚠️ | ✅ AfterAgent | Custom + Hook | L2 | 🔵 Ready |
| Kilocode (v5.2.2) | ✅ | ❌ None | SKILL.md | L1 | 🔵 Ready |
| OpenCode (v1.1.47) | ✅ | ⚠️ TS Plugin | SKILL.md | L1 | 🔵 Ready |
| Codex CLI | ✅ | ❌ notify only | SKILL.md + AGENTS.md | L1 | 🔵 Ready |
| Roo-Code (v3.8.4) | ❌ | ❌ None | **Custom Mode** | L1 | 🔵 Ready |
| **Deferred** |
| Trae | ⚠️ | ❓ Unclear | TBD | L1 | ⏸️ Deferred |
| Amp | ✅ | ✅ MCP | TBD | ❓ | ⏸️ Deferred |
| Windsurf | ⚠️ | ❌ None | Rules | L1 | ⏸️ Deferred |
| Qoder CLI | ✅ | ⚠️ Commands | TBD | ❓ | ⏸️ Deferred |
| CodeBuddy | ⚠️ | ✅ Hooks + MCP | TBD | L2 | ⏸️ Deferred |

### Legend
- ✅ Full support, compatible with project architecture
- ⚠️ Partial support, requires adaptation
- ❌ No support, requires alternative approach
- ❓ Unclear, needs further research

---

## Batch 1 Detailed Research

### 1. Cline (v3.56.1)

**Core Files**:
- `cline/src/core/hooks/hook-factory.ts` - Hook factory
- `cline/src/core/hooks/hook-executor.ts` - Hook executor
- `cline/src/core/hooks/utils.ts` - VALID_HOOK_TYPES definition
- `cline/src/core/context/instructions/user-instructions/skills.ts` - Skills loading

**Skills Support**: ✅ Full
- **Project Directories**: `.cline/skills/`, `.clinerules/skills/`, `.claude/skills/`
- **Global Directory**: `~/.cline/skills/`
- **Format**: Standard SKILL.md with YAML frontmatter

**Hooks Support**: ✅ Full (8 types)

| Hook Type | Trigger | Use for discuss-for-specs |
|-----------|---------|---------------------------|
| `TaskStart` | New task starts | ⚪ Optional |
| `TaskResume` | Task resumes | ⚪ Optional |
| `TaskCancel` | Task cancelled | ⚪ Optional |
| `TaskComplete` | Task completes | ✅ **Primary Hook** |
| `PreToolUse` | Before tool use | ⚪ Optional |
| `PostToolUse` | After tool use | ⚪ Optional |
| `UserPromptSubmit` | User submits prompt | ⚪ Optional |
| `PreCompact` | Before context compaction | ⚪ Optional |

**Hook Script Locations**:
- Global: `~/Documents/Cline/Hooks/<HookType>`
- Workspace: `.clinerules/hooks/<HookType>`

**Communication Protocol**: JSON stdin/stdout
```typescript
// Input (stdin)
{
  clineVersion: string,
  hookName: string,
  timestamp: string,
  taskId: string,
  workspaceRoots: string[],
  userId: string,
  taskComplete?: { task: string }
}

// Output (stdout)
{
  cancel: boolean,
  contextModification?: string,  // Max 50KB
  errorMessage?: string
}
```

**Platform Limitation**: macOS/Linux only (Windows not supported)

**Adaptation Strategy**: 
- Create `TaskComplete` hook script that calls Python `check_precipitation.py`
- Place in `.clinerules/hooks/TaskComplete`

---

### 2. Kilocode (v5.2.2)

**Core Files**:
- `kilocode/src/services/skills/SkillsManager.ts` - Skills manager
- `kilocode/src/shared/skills.ts` - Type definitions
- `kilocode/src/core/prompts/sections/skills.ts` - System prompt integration

**Skills Support**: ✅ Full

**Directory Structure**:
```
# Global
~/.kilocode/skills/              # Common to all modes
~/.kilocode/skills-{mode}/       # Mode-specific (e.g., skills-code)

# Project
.kilocode/skills/                # Project common
.kilocode/skills-{mode}/         # Project mode-specific
```

**Skills Format**:
```yaml
---
name: skill-name          # Required, 1-64 chars, lowercase/numbers/hyphens
description: "description"  # Required, 1-1024 chars
license: Apache-2.0       # Optional
metadata:
  author: example-org     # Optional
  version: 1.0.0         # Optional
---
# Skill instructions (Markdown)
```

**Naming Rules** (Strict):
- Only lowercase letters, numbers, hyphens
- Cannot start/end with hyphen
- No consecutive hyphens
- Must match directory name exactly

**Priority Rules**:
1. Project mode-specific > Project common
2. Global mode-specific > Global common
3. Project > Global

**New Features in v5.2.2**:
- ✅ Marketplace Skills integration
- ✅ ConfigChangeNotifier (auto-refresh on changes)
- ✅ Symbolic link support
- ✅ Backward compatible with `.roo` directory

**Hooks Support**: ❌ None

**Adaptation Strategy**:
- Create SKILL.md in `.kilocode/skills/discuss-for-specs/`
- Use L1 guidance (user-initiated precipitation)

---

### 3. OpenCode (v1.1.47)

**Core Files**:
- `opencode/packages/plugin/src/index.ts` - Hooks interface
- `opencode/packages/opencode/src/plugin/index.ts` - Plugin namespace
- `opencode/packages/opencode/src/skill/skill.ts` - Skills loading

**Skills Support**: ✅ Full
- **Project Directories**: `.opencode/skill/`, `.opencode/skills/`, `.claude/skills/`
- **Global Directories**: `~/.opencode/skill/`, `~/.claude/skills/`
- **Format**: Standard SKILL.md with YAML frontmatter

**Hooks Support**: ⚠️ Partial (TypeScript Plugin Only)

Available Hooks:
| Hook | Description | Usable? |
|------|-------------|---------|
| `event` | Subscribe to all events | ⚠️ Needs filtering |
| `chat.message` | New message | ❌ Not suitable |
| `tool.execute.before` | Before tool | ❌ Not suitable |
| `tool.execute.after` | After tool | ⚠️ Per-tool, not per-session |
| `permission.ask` | Permission request | ❌ Not suitable |

**Key Issues**:
1. **No "session end" event** - No equivalent to `Stop` or `TaskComplete`
2. **TypeScript required** - Cannot call external Python scripts directly
3. **Event granularity mismatch** - `tool.execute.after` fires per tool, not per session

**Adaptation Strategy**:
- ❌ Cannot use Hooks for L2
- ✅ Use SKILL.md for L1 (user-initiated precipitation)

---

### 4. Codex CLI

**Core Files**:
- `codex-rs/core/src/skills/loader.rs` - Skills loading (Rust)
- `codex-rs/core/src/project_doc.rs` - AGENTS.md processing

**Skills Support**: ✅ Full

**Directory Structure**:
```
.codex/skills/           # Project (highest priority)
~/.codex/skills/         # User
~/.codex/skills/.system/ # System cache
/etc/codex/skills/       # System (Unix only)
```

**Skills Format**:
```yaml
---
name: skill-name          # Required, max 64 chars
description: "description"  # Required, max 1024 chars
metadata:
  short-description: "..."  # Optional
---
# Skill instructions
```

**AGENTS.md Support**:
- Searches from CWD to Git root
- Concatenates all AGENTS.md in path order
- Supports AGENTS.override.md (highest priority)
- Max 32 KiB

**Configuration**: TOML (`config.toml`)
```toml
model = "gpt-5.1"
notify = ["notify-send", "Codex"]  # Not real Hooks
project_doc_max_bytes = 32768
```

**Hooks Support**: ❌ None
- Only has `notify` mechanism (command after each turn)
- Passes: `{"type":"agent-turn-complete","turn-id":"..."}`

**Adaptation Strategy**:
- Create SKILL.md in `.codex/skills/discuss-for-specs/`
- Consider adding to AGENTS.md for project-wide guidance

---

### 5. Roo-Code (v3.8.4)

> **Important**: Roo-Code does NOT support Skills or Hooks. However, it has a powerful **Custom Modes** system that can be used for adaptation.

**Core Files**:
- `Roo-Code/src/shared/modes.ts` - Mode configuration
- `Roo-Code/src/services/config/` - Configuration management

**Skills Support**: ❌ None
- No `skills/` directory in `src/services/`
- No `SkillsManager` equivalent

**Hooks Support**: ❌ None
- No `hooks/` directory in `src/core/`
- No lifecycle hooks implementation

**Custom Modes Support**: ✅ Full

Roo-Code has a robust Custom Modes system (from official docs at docs.roocode.com):

**Mode Configuration Fields**:
```typescript
interface ModeConfig {
  slug: string           // Unique identifier (alphanumeric + hyphens)
  name: string           // Display name
  roleDefinition: string // Core AI personality/expertise
  customInstructions?: string  // Specific behavior guidelines
  whenToUse?: string     // When to use this mode (for Boomerang)
  groups: GroupEntry[]   // Tool access: read, edit, browser, command, mcp
}
```

**Mode Storage Locations**:
- **Global**: `~/.roo/modes.yaml` or `~/.roo/modes.json`
- **Project**: `.roomodes` (YAML format recommended)

**Mode-Specific Rules**:
- `.roo/rules-{mode-slug}/` directory
- `.roorules-{mode-slug}` file

**Built-in Modes**:
- `code` - Full development capabilities
- `architect` - Planning and design (edit Markdown only)
- `ask` - Q&A and explanation
- `debug` - Problem diagnosis

**Adaptation Strategy**:
Create a custom "discuss" mode:
```yaml
# .roomodes
customModes:
  - slug: discuss
    name: Discuss
    roleDefinition: |
      You are a discussion facilitator helping users think through 
      problems before implementation. Focus on understanding, 
      questioning, and guiding toward clarity.
    customInstructions: |
      1. Create discussion directory .discuss/YYYY-MM-DD/[topic]/
      2. Maintain outline.md with discussion state
      3. Guide toward decision precipitation
      4. Use Socratic questioning
    groups:
      - read
      - ["edit", { fileRegex: "\\.(md|yaml)$" }]
```

---

### 6. Gemini CLI

**Hooks Support**: ✅ Full (8 types)

| Hook | Trigger |
|------|---------|
| `SessionStart` | Session begins |
| `BeforeAgent` | Before agent processes |
| `AfterAgent` | **After agent completes** ✅ |
| `BeforeModel` | Before model call |
| `AfterModel` | After model response |
| `BeforeToolSelection` | Before tool selection |
| `BeforeTool` | Before tool execution |
| `AfterTool` | After tool execution |

**Communication**: JSON stdin/stdout (strict "Golden Rule")

**Adaptation Strategy**:
- Use `AfterAgent` hook for session-end detection
- Similar to Cline's `TaskComplete`

---

## Two-Level Architecture Summary

| Level | Capability | Required Mechanism | Platforms |
|-------|------------|-------------------|-----------|
| **L1** | Discussion facilitation only | Skills/Custom Mode | OpenCode, Codex, Kilocode, Roo-Code |
| **L2** | + Snapshot detection + Auto reminder | Skills + Hooks | Claude Code✅, Cursor✅, Cline, Gemini CLI |

---

## Adaptation Work Summary

| Platform | Mechanism | Files to Create | Effort |
|----------|-----------|-----------------|--------|
| **L2 Platforms** |
| Cline | SKILL.md + TaskComplete Hook | `.clinerules/hooks/TaskComplete` | ⭐ Low |
| Gemini CLI | Custom + AfterAgent Hook | `.gemini/hooks/AfterAgent` | ⭐ Low |
| **L1 Platforms** |
| Kilocode | SKILL.md | `.kilocode/skills/discuss-for-specs/SKILL.md` | ⭐ Low |
| OpenCode | SKILL.md | `.opencode/skill/discuss-for-specs/SKILL.md` | ⭐ Low |
| Codex | SKILL.md | `.codex/skills/discuss-for-specs/SKILL.md` | ⭐ Low |
| Roo-Code | Custom Mode | `.roomodes` | ⭐ Low |

---

## References

- [Agent Skills Specification](https://agentskills.io/specification)
- [Roo-Code Custom Modes Documentation](https://docs.roocode.com/advanced-usage/custom-modes)
- [Cline Hooks Documentation](https://github.com/saoudrizwan/cline)
